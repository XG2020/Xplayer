<?php
/** Offline moderation regressions. Run: php tests/danmaku-admin.php */
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
require_once dirname(__DIR__) . '/class/DanmakuAdmin.php';

if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
    fwrite(STDERR, "FAIL PDO SQLite is required for isolated in-memory tests.\n");
    exit(1);
}

function dmAdminExpect(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

function dmAdminSame($expected, $actual, string $message): void
{
    dmAdminExpect($expected === $actual, $message);
}

function dmAdminReject(callable $operation, string $message, string $exception = InvalidArgumentException::class): void
{
    try { $operation(); } catch (Throwable $error) {
        dmAdminExpect($error instanceof $exception, $message . ' (unexpected exception type)');
        return;
    }
    throw new RuntimeException($message);
}

function dmAdminFixture(bool $seed = true): array
{
    // This suite never reads deployment configuration or opens a disk database.
    $pdo = new PDO('sqlite::memory:');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $admin = new DanmakuAdmin($pdo);
    $service = new Danmaku($pdo, str_repeat('test-key-', 4));
    if (!$seed) return [$pdo, $admin, $service];

    $insert = $pdo->prepare('INSERT INTO xplayer_danmaku
        (player_key, player_id, video_time, mode, color, author, content, font_size, client_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $contents = [1 => 'literal 100%_! exact', 2 => 'literal 100XY! exact',
        4 => "' OR 1=1 --", 5 => '<script>alert("fixture")</script>', 6 => '你好弹幕', 7 => 'punctuation ! alone'];
    foreach (range(1, 60) as $index) {
        $player = $index <= 30 ? 'video-alpha' : ($index <= 55 ? 'video-beta' : 'video-gamma');
        $author = $index === 1 ? 'Alice' : ($index === 3 ? 'nick%_!' : 'author-' . $index);
        $insert->execute([hash('sha256', $player), $player, $index / 3, 'right', '#ffffff', $author,
            $contents[$index] ?? 'message-' . $index, '27.5px', str_repeat('c', 64), 1700000000 + $index]);
    }
    $report = $pdo->prepare('INSERT INTO xplayer_danmaku_reports
        (comment_id, reporter_hash, reason, created_at) VALUES (?, ?, ?, ?)');
    foreach (range(1, 12) as $index) {
        $report->execute([1, hash('sha256', 'reporter-' . $index), '垃圾广告',
            1700001000 + ($index === 11 ? 120 : $index * 10)]);
    }
    $report->execute([33, str_repeat('a', 64), '剧透', 1700002000]);
    $report->execute([33, str_repeat('b', 64), '引战', 1700002001]);
    $report->execute([60, str_repeat('d', 64), '人身攻击', 1700003000]);
    $pdo->prepare('INSERT INTO xplayer_danmaku_limits (bucket, last_sent) VALUES (?, ?)')
        ->execute([hash('sha256', 'existing-limit'), 1700000000]);
    return [$pdo, $admin, $service];
}

function dmAdminSnapshot(PDO $pdo): array
{
    return [
        $pdo->query('SELECT * FROM xplayer_danmaku ORDER BY id')->fetchAll(PDO::FETCH_ASSOC),
        $pdo->query('SELECT * FROM xplayer_danmaku_reports ORDER BY id')->fetchAll(PDO::FETCH_ASSOC),
        $pdo->query('SELECT * FROM xplayer_danmaku_limits ORDER BY bucket')->fetchAll(PDO::FETCH_ASSOC),
    ];
}

function dmAdminAddGroup(PDO $pdo, string $player, int $comments = 1, int $reportsPerComment = 0, int $latestAt = 1700010000): array
{
    $insert = $pdo->prepare('INSERT INTO xplayer_danmaku
        (player_key, player_id, video_time, mode, color, author, content, font_size, client_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $report = $pdo->prepare('INSERT INTO xplayer_danmaku_reports
        (comment_id, reporter_hash, reason, created_at) VALUES (?, ?, ?, ?)');
    $ids = [];
    for ($index = 0; $index < $comments; $index++) {
        $insert->execute([hash('sha256', $player), $player, 0, 'right', '#ffffff', 'fixture author',
            'fixture content', '27.5px', str_repeat('f', 64), $latestAt]);
        $id = (string) $pdo->lastInsertId();
        $ids[] = $id;
        for ($reportIndex = 0; $reportIndex < $reportsPerComment; $reportIndex++) {
            $report->execute([$id, hash('sha256', 'group-reporter-' . $reportIndex), '垃圾广告', $latestAt]);
        }
    }
    return $ids;
}

$tests = [];
$tests['schema initialization is repeatable and empty pages stay usable'] = function () {
    [$pdo, $admin] = dmAdminFixture(false);
    new DanmakuAdmin($pdo);
    dmAdminSame(['items' => [], 'page' => 1, 'pageSize' => 25, 'pages' => 1, 'total' => 0,
        'summary' => ['comments' => 0, 'videos' => 0, 'reports' => 0, 'reportedComments' => 0]],
        $admin->browse(['page' => 9]), 'Empty browse response is inconsistent');
    dmAdminSame(false, $pdo->inTransaction(), 'Read transaction was left open');
};

$tests['pagination is stable, bounded and clamps large pages'] = function () {
    [, $admin] = dmAdminFixture();
    foreach ([1 => range(60, 36), 2 => range(35, 11), 3 => range(10, 1)] as $page => $ids) {
        $result = $admin->browse(['page' => (string) $page]);
        dmAdminSame(array_map('strval', $ids), array_column($result['items'], 'id'), 'Page order or boundary changed');
        dmAdminSame($page, $result['page'], 'Wrong current page');
        dmAdminSame(25, $result['pageSize'], 'Page size is not fixed');
        dmAdminSame(3, $result['pages'], 'Wrong total pages');
        dmAdminSame(60, $result['total'], 'Wrong filtered total');
    }
    foreach ([4, '9999', str_repeat('9', 80)] as $page) {
        dmAdminSame(3, $admin->browse(['page' => $page])['page'], 'Out-of-range page did not clamp');
    }
    $result = $admin->browse(['keyword' => 'no such comment', 'page' => 2]);
    dmAdminSame([1, 1, 0, []], [$result['page'], $result['pages'], $result['total'], $result['items']],
        'No-result page did not clamp');
};

$tests['video filtering uses the complete video identifier and supports combined filters'] = function () {
    [, $admin] = dmAdminFixture();
    $result = $admin->browse(['player' => 'video-alpha', 'page' => 2]);
    dmAdminSame(30, $result['total'], 'Exact video filter lost records');
    dmAdminSame(['5', '4', '3', '2', '1'], array_column($result['items'], 'id'), 'Video page has the wrong records');
    foreach (['video', 'VIDEO-ALPHA', 'video-alpha ', "video-alpha' OR 1=1 --"] as $player) {
        dmAdminSame(0, $admin->browse(['player' => $player])['total'], 'Video filter accepted a partial or altered identifier');
    }
    $result = $admin->browse(['keyword' => 'Alice', 'player' => 'video-alpha', 'reported' => '1']);
    dmAdminSame(['1'], array_column($result['items'], 'id'), 'Combined filters did not all apply');
    dmAdminSame(60, $admin->browse(['keyword' => '', 'player' => ''])['total'], 'Empty text filters changed results');
};

$tests['keyword searches content and author while escaping LIKE wildcards'] = function () {
    [$pdo, $admin] = dmAdminFixture();
    $before = dmAdminSnapshot($pdo);
    foreach (['%' => ['3', '1'], '_' => ['3', '1'], '%_!' => ['3', '1'],
        '!' => ['7', '3', '2', '1'], 'Alice' => ['1'], '你好' => ['6'], "' OR 1=1 --" => ['4']] as $keyword => $ids) {
        $result = $admin->browse(['keyword' => $keyword]);
        dmAdminSame($ids, array_column($result['items'], 'id'), 'Keyword matching or literal escaping failed');
        dmAdminSame(count($ids), $result['total'], 'Keyword count disagrees with results');
    }
    dmAdminSame(0, $admin->browse(['keyword' => "'; DROP TABLE xplayer_danmaku; --"])['total'], 'Injection input was not literal');
    dmAdminSame($before, dmAdminSnapshot($pdo), 'Read-only filtering changed stored data');
};

$tests['reported filters keep global summary independent of search results'] = function () {
    [, $admin] = dmAdminFixture();
    $summary = ['comments' => 60, 'videos' => 3, 'reports' => 15, 'reportedComments' => 3];
    foreach ([1, '1'] as $reported) {
        $result = $admin->browse(['reported' => $reported]);
        dmAdminSame(['60', '33', '1'], array_column($result['items'], 'id'), 'Reported filter selected wrong comments');
        dmAdminSame(3, $result['total'], 'Reported comments were duplicated by their reports');
        dmAdminSame($summary, $result['summary'], 'Summary was constrained by filters');
    }
    foreach ([0, '0'] as $reported) {
        $result = $admin->browse(['reported' => $reported]);
        dmAdminSame(60, $result['total'], 'All-comments filter omitted reported comments');
        dmAdminSame('60', $result['items'][0]['id'], 'All-comments filter omitted the newest reported comment');
        dmAdminSame($admin->browse(), $result, 'Reported zero must be identical to omitting the filter');
        dmAdminSame($admin->browse(['player' => 'video-alpha', 'page' => 2]),
            $admin->browse(['player' => 'video-alpha', 'page' => 2, 'reported' => $reported]),
            'Reported zero changed another filter or page');
        dmAdminSame($summary, $result['summary'], 'All-comments filter changed summary');
    }
    dmAdminSame($summary, $admin->browse(['player' => 'missing'])['summary'], 'Empty filtered page lost global summary');
};

$tests['public response types, report limits and privacy remain explicit'] = function () {
    [, $admin] = dmAdminFixture();
    $result = $admin->browse(['keyword' => 'Alice']);
    $item = $result['items'][0];
    dmAdminSame(['id', 'playerId', 'time', 'mode', 'color', 'author', 'content', 'createdAt', 'reportCount', 'reports'],
        array_keys($item), 'Unexpected public comment fields');
    dmAdminExpect(is_string($item['id']) && is_string($item['playerId']) && is_float($item['time']) &&
        is_int($item['createdAt']) && is_int($item['reportCount']), 'Public comment types changed');
    dmAdminSame(12, $item['reportCount'], 'Full report count was truncated');
    dmAdminSame(10, count($item['reports']), 'Report details exceed their limit');
    dmAdminSame(array_map('strval', range(12, 3)), array_column($item['reports'], 'id'), 'Latest reports or timestamp ties sorted incorrectly');
    foreach ($item['reports'] as $report) {
        dmAdminSame(['id', 'reason', 'createdAt'], array_keys($report), 'Unexpected public report fields');
        dmAdminExpect(is_string($report['id']) && is_string($report['reason']) && is_int($report['createdAt']),
            'Public report types changed');
    }
    $encoded = json_encode($result, JSON_THROW_ON_ERROR);
    foreach (['client_hash', 'reporter_hash', str_repeat('c', 64), hash('sha256', 'reporter-12')] as $private) {
        dmAdminExpect(!str_contains($encoded, $private), 'A private visitor identifier leaked');
    }
};

$tests['malformed filters fail before any mutation or leaked transaction'] = function () {
    [$pdo, $admin] = dmAdminFixture();
    $before = dmAdminSnapshot($pdo);
    $invalid = [['keyword' => []], ['keyword' => null], ['keyword' => true], ['keyword' => "bad\0value"],
        ['keyword' => "\xff"], ['keyword' => str_repeat('a', 301)], ['player' => []], ['player' => 12],
        ['player' => str_repeat('a', 256)], ['reported' => ''], ['reported' => 2], ['reported' => true],
        ['reported' => 0.0], ['reported' => []], ['reported' => null]];
    foreach ([0, -1, 1.0, true, false, null, '', '01', '+1', '1e2', ' 1', '1 ', '1; DELETE FROM xplayer_danmaku', []] as $page) {
        $invalid[] = ['page' => $page];
    }
    foreach ($invalid as $filters) {
        dmAdminReject(fn() => $admin->browse($filters), 'Malformed filter was accepted');
        dmAdminSame(false, $pdo->inTransaction(), 'Invalid browse left a transaction open');
    }
    dmAdminSame($before, dmAdminSnapshot($pdo), 'Malformed filtering changed data');
};

$tests['delete deduplicates selections, clears reports and matches the original reader'] = function () {
    [$pdo, $admin, $service] = dmAdminFixture();
    $limits = dmAdminSnapshot($pdo)[2];
    dmAdminSame(30, $service->read('video-alpha')['danum'], 'Legacy reader fixture is incomplete');
    dmAdminSame(2, $admin->delete([33, '1', 1, '99999']), 'Deleted count did not reflect distinct existing comments');
    $result = $admin->browse();
    dmAdminSame(['comments' => 58, 'videos' => 3, 'reports' => 1, 'reportedComments' => 1],
        $result['summary'], 'Delete did not clear the matching reports');
    $read = $service->read('video-alpha');
    dmAdminSame(29, $read['danum'], 'Original reader still counted the deleted comment');
    dmAdminExpect(!in_array('1', array_column($read['danmuku'], 5), true), 'Original reader exposed deleted comment');
    dmAdminSame(24, $service->read('video-beta')['danum'], 'Unrelated video count changed');
    dmAdminSame($limits, dmAdminSnapshot($pdo)[2], 'Deleting comments reset rate limits');
    dmAdminSame(0, $admin->delete(['1', '99999', (string) PHP_INT_MAX]), 'Missing IDs should delete nothing');
    dmAdminSame(5, $admin->delete([56, 57, 58, 59, 60]), 'Final video comments were not deleted');
    dmAdminSame(['comments' => 53, 'videos' => 2, 'reports' => 0, 'reportedComments' => 0],
        $admin->browse()['summary'], 'Removing the final video comment did not update summary');
};

$tests['dismiss clears only selected reports and retains reader results and rate limits'] = function () {
    [$pdo, $admin, $service] = dmAdminFixture();
    $before = dmAdminSnapshot($pdo);
    $read = $service->read('video-alpha');
    dmAdminSame(14, $admin->dismissReports(['33', 1, '1', 99999]), 'Dismiss count did not count distinct reports');
    $after = dmAdminSnapshot($pdo);
    dmAdminSame($before[0], $after[0], 'Dismiss changed a comment');
    dmAdminSame($before[2], $after[2], 'Dismiss changed rate limits');
    dmAdminSame($read, $service->read('video-alpha'), 'Dismiss changed the original reader');
    dmAdminSame(['60'], array_column($admin->browse(['reported' => 1])['items'], 'id'), 'Dismiss cleared unrelated reports');
    dmAdminSame(['comments' => 60, 'videos' => 3, 'reports' => 1, 'reportedComments' => 1],
        $admin->browse()['summary'], 'Dismiss summary is wrong');
    dmAdminSame(0, $admin->dismissReports([1, 33]), 'Repeated dismissal should be idempotent');
};

$tests['invalid bulk IDs never partially delete comments or reports'] = function () {
    [$pdo, $admin] = dmAdminFixture();
    $before = dmAdminSnapshot($pdo);
    $invalidBatches = [[], array_fill(0, 101, 1)];
    foreach ([0, -1, 1.0, true, false, null, '', '0', '00', '01', '-1', '+1', ' 1', '1 ', '1.0',
        '1e0', '0x1', '1 OR 1=1', '1); DELETE FROM xplayer_danmaku; --', "1\n", "1\0", [], ['1'],
        new stdClass(), '9223372036854775808', str_repeat('9', 100)] as $id) {
        $invalidBatches[] = [1, $id];
    }
    foreach ($invalidBatches as $ids) {
        foreach (['delete', 'dismissReports'] as $method) {
            dmAdminReject(fn() => $admin->$method($ids), 'Malformed ID batch was accepted');
            dmAdminSame(false, $pdo->inTransaction(), 'Invalid mutation left a transaction open');
            dmAdminSame($before, dmAdminSnapshot($pdo), 'Invalid batch partially changed data');
        }
    }
    dmAdminSame(1, $admin->delete(array_fill(0, 100, '1')), 'Exactly 100 duplicate IDs should be valid and deduplicated');
};

$tests['database failures roll back comments and earlier report deletion together'] = function () {
    [$pdo, $admin] = dmAdminFixture();
    $before = dmAdminSnapshot($pdo);
    $pdo->exec("CREATE TRIGGER fail_comment_delete BEFORE DELETE ON xplayer_danmaku
        WHEN OLD.id = 33 BEGIN SELECT RAISE(ABORT, 'fixture delete failure'); END");
    dmAdminReject(fn() => $admin->delete([1, 33]), 'Injected delete failure was ignored', PDOException::class);
    dmAdminSame($before, dmAdminSnapshot($pdo), 'Failed delete did not roll back earlier report deletion');
    dmAdminSame(false, $pdo->inTransaction(), 'Failed delete left a transaction open');
    $pdo->exec('DROP TRIGGER fail_comment_delete');
    $pdo->exec("CREATE TRIGGER fail_report_delete BEFORE DELETE ON xplayer_danmaku_reports
        WHEN OLD.comment_id = 33 BEGIN SELECT RAISE(ABORT, 'fixture dismiss failure'); END");
    dmAdminReject(fn() => $admin->dismissReports([1, 33]), 'Injected dismissal failure was ignored', PDOException::class);
    dmAdminSame($before, dmAdminSnapshot($pdo), 'Failed dismissal did not roll back all reports');
    dmAdminSame(false, $pdo->inTransaction(), 'Failed dismissal left a transaction open');
};

$tests['report and delete sequencing cannot leave an orphan report'] = function () {
    [$pdo, $admin, $service] = dmAdminFixture(false);
    $sent = $service->send(['player' => 'new-video', 'text' => 'new comment', 'author' => 'tester', 'time' => 1.25],
        '192.0.2.10', 1700000000);
    $report = ['type' => '垃圾广告', 'text' => 'new comment', 'cid' => 'tester', 'title' => 'new-video', 'user' => $sent['id']];
    $service->report($report, '192.0.2.20', 1700000001);
    $service->report($report, '192.0.2.20', 1700000005);
    dmAdminSame(1, $admin->browse()['summary']['reports'], 'Repeated reporter created duplicate reports');
    dmAdminSame(1, $admin->dismissReports([$sent['id']]), 'Report could not be dismissed');
    $service->report($report, '192.0.2.20', 1700000009);
    dmAdminSame(1, $admin->delete([$sent['id']]), 'Reported comment could not be deleted');
    $before = dmAdminSnapshot($pdo);
    dmAdminReject(fn() => $service->report($report, '192.0.2.20', 1700000013), 'Deleted comment could still be reported');
    dmAdminSame($before, dmAdminSnapshot($pdo), 'Rejected report left an orphan or consumed a rate limit');
    dmAdminSame(0, $service->read('new-video')['danum'], 'Deleted comment remained visible');
};

$tests['reads within an existing transaction leave ownership with their caller'] = function () {
    [$pdo, $admin] = dmAdminFixture();
    $pdo->beginTransaction();
    $pdo->exec('DELETE FROM xplayer_danmaku_reports WHERE comment_id = 1');
    dmAdminSame(3, $admin->browse()['summary']['reports'], 'Browse did not share the caller transaction');
    dmAdminSame(3, $admin->groups()['summary']['reports'], 'Groups did not share the caller transaction');
    dmAdminSame(true, $pdo->inTransaction(), 'Browse committed the caller transaction');
    $pdo->rollBack();
    dmAdminSame(15, $admin->browse()['summary']['reports'], 'Caller rollback did not restore reports');
};

$tests['video groups expose exact totals without multiplying comments by reports'] = function () {
    [, $admin] = dmAdminFixture();
    $result = $admin->groups();
    dmAdminSame(3, $result['total'], 'Group count is incorrect');
    dmAdminSame(['video-gamma', 'video-beta', 'video-alpha'], array_column($result['items'], 'playerId'),
        'Groups did not sort by latest comment time');
    dmAdminSame([5, 25, 30], array_column($result['items'], 'comments'), 'Report join multiplied comment counts');
    dmAdminSame([1, 2, 12], array_column($result['items'], 'reports'), 'Group report totals are wrong');
    dmAdminSame([1700000060, 1700000055, 1700000030], array_column($result['items'], 'latestAt'), 'Latest group timestamps are wrong');
    dmAdminSame($admin->browse()['summary'], $result['summary'], 'Groups and comments use different global summaries');
    foreach ($result['items'] as $item) {
        dmAdminSame(['key', 'playerId', 'comments', 'reports', 'latestAt'], array_keys($item), 'Group response contains extra fields');
        dmAdminSame(hash('sha256', $item['playerId']), $item['key'], 'Group key does not identify the exact video');
        dmAdminExpect(is_string($item['playerId']) && is_int($item['comments']) && is_int($item['reports']) && is_int($item['latestAt']),
            'Group response types changed');
    }
};

$tests['group filters match video identifiers literally and retain full group counts'] = function () {
    [$pdo, $admin] = dmAdminFixture();
    dmAdminAddGroup($pdo, 'series%_!', 2, 2);
    dmAdminAddGroup($pdo, 'seriesXY!');
    dmAdminAddGroup($pdo, "quote' OR 1=1 --");
    dmAdminAddGroup($pdo, '中文视频');
    foreach (['%' => ['series%_!'], '_' => ['series%_!'], '%_!' => ['series%_!'],
        "' OR 1=1 --" => ["quote' OR 1=1 --"], '中文' => ['中文视频'], 'fixture author' => [], 'fixture content' => []] as $keyword => $players) {
        dmAdminSame($players, array_column($admin->groups(['keyword' => $keyword])['items'], 'playerId'),
            'Group keyword was not a literal video-identifier search');
    }
    dmAdminSame(2, $admin->groups(['keyword' => '!'])['total'], 'Escape character did not match literally');
    dmAdminSame(0, $admin->groups(['keyword' => "'; DROP TABLE xplayer_danmaku; --"])['total'], 'Group filter interpreted injected SQL');
    foreach ([0, '0'] as $reported) {
        dmAdminSame($admin->groups(), $admin->groups(['reported' => $reported]), 'Reported zero should leave all groups visible');
    }
    foreach ([1, '1'] as $reported) {
        $result = $admin->groups(['reported' => $reported]);
        dmAdminSame(4, $result['total'], 'Only-reported group count is wrong');
        $alpha = $admin->groups(['keyword' => 'video-alpha', 'reported' => $reported])['items'][0];
        dmAdminSame(30, $alpha['comments'], 'Reported filter counted only reported comments inside the group');
        dmAdminSame(12, $alpha['reports'], 'Reported filter changed a group report count');
        dmAdminSame($admin->browse()['summary'], $result['summary'], 'Group filter constrained global statistics');
    }
};

$tests['group pages clamp and use a stable key order when creation times tie'] = function () {
    [$pdo, $admin] = dmAdminFixture(false);
    $expected = [];
    foreach (range(1, 52) as $index) {
        $player = 'page-video-' . $index;
        $latestAt = 1700010000 + intdiv($index, 2);
        dmAdminAddGroup($pdo, $player, 1, 0, $latestAt);
        $expected[] = ['key' => hash('sha256', $player), 'latestAt' => $latestAt];
    }
    usort($expected, static fn($left, $right) => ($right['latestAt'] <=> $left['latestAt']) ?: strcmp($left['key'], $right['key']));
    foreach ([1, 2, 3] as $page) {
        $result = $admin->groups(['page' => (string) $page]);
        dmAdminSame(52, $result['total'], 'Group pagination changed the group count');
        dmAdminSame(25, $result['pageSize'], 'Group page size is not fixed');
        dmAdminSame(3, $result['pages'], 'Group pages are wrong');
        dmAdminSame(array_column(array_slice($expected, ($page - 1) * 25, 25), 'key'), array_column($result['items'], 'key'),
            'Tied groups did not use stable key ordering across page boundaries');
    }
    dmAdminSame(3, $admin->groups(['page' => str_repeat('9', 80)])['page'], 'Huge group page was not clamped');
    $result = $admin->groups(['keyword' => 'does-not-exist', 'page' => 2]);
    dmAdminSame([[], 1, 1, 0], [$result['items'], $result['page'], $result['pages'], $result['total']], 'Empty group search has unusable pagination');
    [, $empty] = dmAdminFixture(false);
    dmAdminSame(['items' => [], 'page' => 1, 'pageSize' => 25, 'pages' => 1, 'total' => 0,
        'summary' => ['comments' => 0, 'videos' => 0, 'reports' => 0, 'reportedComments' => 0]],
        $empty->groups(['page' => 9]), 'Empty group store is inconsistent');
};

$tests['invalid group filters fail without writes or leaked transactions'] = function () {
    [$pdo, $admin] = dmAdminFixture();
    $before = dmAdminSnapshot($pdo);
    foreach ([['keyword' => []], ['keyword' => null], ['keyword' => 3], ['keyword' => "bad\0value"],
        ['keyword' => "\xff"], ['keyword' => str_repeat('a', 256)], ['reported' => null], ['reported' => ''],
        ['reported' => true], ['reported' => 1.0], ['reported' => 2], ['page' => 0], ['page' => -1],
        ['page' => null], ['page' => []], ['page' => 1.0], ['page' => '1 OR 1=1'], ['page' => '01']] as $filters) {
        dmAdminReject(fn() => $admin->groups($filters), 'Malformed group filters were accepted');
        dmAdminSame(false, $pdo->inTransaction(), 'Malformed group filter left a transaction open');
    }
    dmAdminSame($before, dmAdminSnapshot($pdo), 'Malformed group query changed data');
};

$tests['clearing selected groups deduplicates keys and isolates other videos and settings'] = function () {
    [$pdo, $admin, $service] = dmAdminFixture();
    $before = dmAdminSnapshot($pdo);
    $pdo->exec('CREATE TABLE xplayer_config (id INTEGER PRIMARY KEY, user TEXT NOT NULL)');
    $settings = '{"danmakuBlockedWords":"private-word","danmuku":"https://fixture.invalid/library"}';
    $pdo->prepare('INSERT INTO xplayer_config (id, user) VALUES (1, ?)')->execute([$settings]);
    $alpha = hash('sha256', 'video-alpha');
    $gamma = hash('sha256', 'video-gamma');
    dmAdminSame(['groups' => 2, 'comments' => 35, 'reports' => 13],
        $admin->clearGroups([$gamma, $alpha, strtoupper($alpha), str_repeat('0', 64)]), 'Group deletion counts or deduplication are wrong');
    dmAdminSame(['video-beta'], array_column($admin->groups()['items'], 'playerId'), 'Group clearing touched an unrelated video');
    dmAdminSame(25, $service->read('video-beta')['danum'], 'Other video comments changed');
    dmAdminSame(0, $service->read('video-alpha')['danum'], 'Cleared group remains visible through original reader');
    dmAdminSame(2, $admin->groups()['items'][0]['reports'], 'Other video reports changed');
    dmAdminSame($before[2], dmAdminSnapshot($pdo)[2], 'Group clearing reset rate limits');
    dmAdminSame($settings, $pdo->query('SELECT user FROM xplayer_config')->fetchColumn(), 'Group clearing changed words or external source settings');
    dmAdminSame(['groups' => 0, 'comments' => 0, 'reports' => 0], $admin->clearGroups([$alpha, $gamma]), 'Already-empty groups should have zero affected counts');
    dmAdminSame(['groups' => 1, 'comments' => 25, 'reports' => 2], $admin->clearGroups([hash('sha256', 'video-beta')]), 'Final group was not cleared');
    dmAdminSame(0, $admin->groups()['total'], 'Empty groups remain after clearing their final comments');
};

$tests['invalid group keys cannot partially clear a valid group'] = function () {
    [$pdo, $admin] = dmAdminFixture();
    $before = dmAdminSnapshot($pdo);
    $key = hash('sha256', 'video-alpha');
    $invalid = [[], array_fill(0, 26, $key)];
    foreach ([null, true, 1, 1.0, [], [$key], new stdClass(), '', str_repeat('a', 63), str_repeat('a', 65),
        str_repeat('g', 64), $key . "\n", "' OR 1=1 --", ' ' . $key] as $badKey) $invalid[] = [$key, $badKey];
    foreach ($invalid as $keys) {
        dmAdminReject(fn() => $admin->clearGroups($keys), 'Invalid group key batch was accepted');
        dmAdminSame($before, dmAdminSnapshot($pdo), 'Invalid key batch partially deleted data');
        dmAdminSame(false, $pdo->inTransaction(), 'Invalid group keys left a transaction open');
    }
    dmAdminSame(['groups' => 1, 'comments' => 30, 'reports' => 12], $admin->clearGroups(array_fill(0, 25, $key)),
        'Exactly 25 duplicate keys should be accepted and deduplicated');
};

$tests['large groups delete in bounded batches and roll back every earlier batch on failure'] = function () {
    [$pdo, $admin] = dmAdminFixture();
    $ids = dmAdminAddGroup($pdo, 'large-video', 1005, 1);
    $before = dmAdminSnapshot($pdo);
    $pdo->exec("CREATE TRIGGER fail_group_delete BEFORE DELETE ON xplayer_danmaku WHEN OLD.id = " . (int) $ids[520] .
        " BEGIN SELECT RAISE(ABORT, 'fixture later batch failure'); END");
    dmAdminReject(fn() => $admin->clearGroups([hash('sha256', 'large-video')]), 'Later-batch failure was ignored', PDOException::class);
    dmAdminSame($before, dmAdminSnapshot($pdo), 'Failed group clear did not restore earlier deleted batches');
    dmAdminSame(false, $pdo->inTransaction(), 'Failed group clear left a transaction open');
    $pdo->exec('DROP TRIGGER fail_group_delete');
    dmAdminSame(['groups' => 1, 'comments' => 1005, 'reports' => 1005], $admin->clearGroups([hash('sha256', 'large-video')]),
        'Large group could not be cleared completely');
    dmAdminSame(['comments' => 60, 'videos' => 3, 'reports' => 15, 'reportedComments' => 3], $admin->groups()['summary'],
        'Large group clearing changed unrelated groups');
};

$tests['group clearing preserves a comment and report created after its ID snapshot'] = function () {
    [$pdo, $admin] = dmAdminFixture();
    $key = hash('sha256', 'video-alpha');
    // Inject a write precisely between report deletion and comment deletion. This
    // represents a concurrent send outside the locked snapshot on MySQL.
    $pdo->exec("CREATE TRIGGER create_after_group_snapshot AFTER DELETE ON xplayer_danmaku_reports
        WHEN OLD.id = 1 BEGIN
        INSERT INTO xplayer_danmaku (player_key, player_id, video_time, mode, color, author, content, font_size, client_hash, created_at)
        VALUES ('" . $key . "', 'video-alpha', 0, 'right', '#ffffff', 'new sender', 'new after snapshot', '27.5px', 'fixture', 1700020000);
        INSERT INTO xplayer_danmaku_reports (comment_id, reporter_hash, reason, created_at)
        VALUES (last_insert_rowid(), 'fixture-new-reporter', '垃圾广告', 1700020001);
        END");
    dmAdminSame(['groups' => 1, 'comments' => 30, 'reports' => 12], $admin->clearGroups([$key]), 'Clear counted writes made after selection');
    $group = $admin->groups(['keyword' => 'video-alpha'])['items'][0];
    dmAdminSame([1, 1], [$group['comments'], $group['reports']], 'Group clearing swept up a new comment or its report');
    dmAdminSame('new after snapshot', $admin->browse(['player' => 'video-alpha'])['items'][0]['content'], 'Snapshot cleanup deleted the new comment');
    dmAdminSame(0, (int) $pdo->query('SELECT COUNT(*) FROM xplayer_danmaku_reports r
        LEFT JOIN xplayer_danmaku d ON d.id = r.comment_id WHERE d.id IS NULL')->fetchColumn(), 'Group clearing left an orphan report');
};

$failed = 0;
foreach ($tests as $name => $test) {
    try { $test(); echo 'PASS ' . $name . "\n"; }
    catch (Throwable $error) { $failed++; echo 'FAIL ' . $name . ': ' . $error->getMessage() . "\n"; }
}
echo "\n" . (count($tests) - $failed) . '/' . count($tests) . " tests passed\n";
exit($failed === 0 ? 0 : 1);

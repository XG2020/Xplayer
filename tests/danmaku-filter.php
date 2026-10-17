<?php
/** Offline blocked-word regressions. Run: php tests/danmaku-filter.php */
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
require_once dirname(__DIR__) . '/class/DanmakuFilter.php';
require_once dirname(__DIR__) . '/class/Settings.php';

function dmFilterExpect(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

function dmFilterSame($expected, $actual, string $message): void
{
    dmFilterExpect($expected === $actual, $message);
}

function dmFilterReject(callable $operation, string $message): InvalidArgumentException
{
    try { $operation(); } catch (InvalidArgumentException $error) { return $error; }
    throw new RuntimeException($message);
}

function dmFilterNormalizationChecks(): void
{
    dmFilterSame("wechat\n加微信\n0", Settings::normalizeDanmakuBlockedWords(
        "\r\n We Chat \rwechat\nＷＥＣＨＡＴ\n加 微 信\n加\u{200B}微\u{200C}信\n \t\u{3000}\u{FEFF}\n0\n０\n"),
        'Normalized duplicates, invisible lines or literal zero were handled incorrectly');
    $filter = new DanmakuFilter("WeChat\n加微信\nQQ123\nad.example");
    foreach (['prefix WeChat suffix', 'ＷｅＣｈａｔ', 'wechat', 'w e c h a t', 'WＥＣＨAT',
        "w\u{200B}e\u{200C}c\u{200D}h\u{2060}a\u{FEFF}t", "W\u{034F}E\u{FE0F}C\u{E0100}HAT",
        "加\u{00A0}微\u{3000}信", "加\u{202E}微\u{202C}信", '欢迎加微信交流', 'ＱＱ１２３',
        'visit ＡＤ．ＥＸＡＭＰＬＥ today'] as $text) {
        dmFilterSame(true, $filter->matches($text), 'An expected normalized substring did not match');
    }
    foreach (['正常讨论', 'we are chatting', 'adXexample', 'qq12', ''] as $text) {
        dmFilterSame(false, $filter->matches($text), 'Unrelated text was blocked');
    }
}

if (($argv[1] ?? '') === '--normalization-only') {
    try {
        dmFilterExpect(!extension_loaded('mbstring') && !extension_loaded('intl'), 'Optional extensions were unexpectedly loaded');
        dmFilterNormalizationChecks();
        echo "PASS normalization without mbstring or intl\n";
        exit(0);
    } catch (Throwable $error) { fwrite(STDERR, $error->getMessage() . "\n"); exit(1); }
}

require_once dirname(__DIR__) . '/class/Danmaku.php';
require_once dirname(__DIR__) . '/class/Player.php';
if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
    fwrite(STDERR, "FAIL PDO SQLite is required for isolated in-memory tests.\n");
    exit(1);
}

function dmFilterFixture(string $words = ''): array
{
    $pdo = new PDO('sqlite::memory:');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return [$pdo, new Danmaku($pdo, str_repeat('fixture-key-', 3), $words)];
}

function dmFilterMessage(array $overrides = []): array
{
    return array_replace(['player' => 'fixture-video', 'text' => '正常弹幕', 'author' => '游客', 'time' => 1.25], $overrides);
}

function dmFilterSnapshot(PDO $pdo): array
{
    return [
        $pdo->query('SELECT * FROM xplayer_danmaku ORDER BY id')->fetchAll(),
        $pdo->query('SELECT * FROM xplayer_danmaku_reports ORDER BY id')->fetchAll(),
        $pdo->query('SELECT * FROM xplayer_danmaku_limits ORDER BY bucket')->fetchAll(),
    ];
}

$tests = [];
$tests['normalization handles full-width ASCII, case, whitespace and zero-width text'] = function () {
    dmFilterNormalizationChecks();
};

$tests['matching stays literal and invisible-only lists never match everything'] = function () {
    $filter = new DanmakuFilter("a+b\n100%\n[ad]\nfoo_bar");
    foreach (['a+b', '100%', '[ad]', 'foo_bar'] as $text) dmFilterSame(true, $filter->matches($text), 'Literal metacharacters did not match');
    foreach (['aaab', '100 dollars', 'ad', 'fooXbar'] as $text) dmFilterSame(false, $filter->matches($text), 'A word was treated as a regular expression or wildcard');
    foreach (['', " \t\r\n\u{3000}\u{200B}\u{200C}\u{200D}\u{2060}\u{FEFF}\u{034F}\u{FE0F}"] as $words) {
        dmFilterSame('', Settings::normalizeDanmakuBlockedWords($words), 'Invisible-only words were retained');
        $filter = new DanmakuFilter($words);
        dmFilterSame(false, $filter->matches('任何弹幕 WeChat'), 'Empty list matched a nonempty comment');
    }
};

$tests['rule counts, Unicode character lengths and total bytes are bounded'] = function () {
    $words = array_map(static fn($index) => 'word-' . $index, range(1, 200));
    dmFilterSame(implode("\n", $words), Settings::normalizeDanmakuBlockedWords(implode("\n", $words)), 'Exactly 200 words were rejected');
    dmFilterReject(fn() => Settings::normalizeDanmakuBlockedWords(implode("\n", $words) . "\nword-201"), 'More than 200 words were accepted');
    dmFilterSame('word', Settings::normalizeDanmakuBlockedWords(str_repeat("WORD\n", 250)), 'Duplicate lines incorrectly consumed the word limit');
    dmFilterSame(str_repeat('字', 100), Settings::normalizeDanmakuBlockedWords(str_repeat('字', 100)), 'Exactly 100 Unicode characters were rejected');
    dmFilterReject(fn() => Settings::normalizeDanmakuBlockedWords(str_repeat('字', 101)), 'More than 100 Unicode characters were accepted');
    dmFilterSame('', Settings::normalizeDanmakuBlockedWords(str_repeat(' ', 32768)), 'Exact byte limit was rejected');
    dmFilterReject(fn() => Settings::normalizeDanmakuBlockedWords(str_repeat(' ', 32769)), 'More than 32768 bytes were accepted');
    foreach (["bad\0word", "bad\x1Bword", "\xff"] as $words) {
        dmFilterReject(fn() => Settings::normalizeDanmakuBlockedWords($words), 'Malformed word list was accepted');
    }
};

$tests['blocked content and authors fail with a generic message and no database writes'] = function () {
    [$pdo, $service] = dmFilterFixture("wechat\n加微信");
    $before = dmFilterSnapshot($pdo);
    foreach ([['text' => '联系 ＷｅＣｈａｔ'], ['text' => "加\u{200B}微\u{3000}信领红包"],
        ['author' => 'WeChat客服'], ['author' => "加\u{FEFF}微信"]] as $overrides) {
        $error = dmFilterReject(fn() => $service->send(dmFilterMessage($overrides), '192.0.2.10', 1700000000),
            'Blocked send was accepted');
        dmFilterSame('弹幕内容或昵称不符合发送要求', $error->getMessage(), 'Rejection exposed the matched rule');
        dmFilterSame($before, dmFilterSnapshot($pdo), 'Rejected send wrote a comment, report or limit');
        dmFilterSame(false, $pdo->inTransaction(), 'Rejected send opened a transaction');
    }
    dmFilterSame(23, $service->send(dmFilterMessage(), '192.0.2.10', 1700000000)['code'], 'Rejected sends consumed the same-instant rate limit');
};

$tests['rejected sends preserve an existing sender rate-limit timestamp'] = function () {
    [$pdo, $service] = dmFilterFixture('wechat');
    $service->send(dmFilterMessage(), '192.0.2.10', 1700000000);
    $before = dmFilterSnapshot($pdo);
    dmFilterReject(fn() => $service->send(dmFilterMessage(['text' => 'wechat']), '192.0.2.10', 1700000002),
        'Blocked send was accepted');
    dmFilterSame($before, dmFilterSnapshot($pdo), 'Blocked send changed an existing rate limit');
    dmFilterSame(23, $service->send(dmFilterMessage(), '192.0.2.10', 1700000003)['code'], 'Blocked send extended the rate limit');
};

$tests['matching normalization never rewrites an accepted comment or nickname'] = function () {
    [, $service] = dmFilterFixture('advertisement');
    $text = "正常 ＡＢＣ\u{200B} text";
    $author = 'Ａｌｉｃｅ';
    $service->send(dmFilterMessage(['text' => $text, 'author' => $author]), '192.0.2.10', 1700000000);
    $row = $service->read('fixture-video')['danmuku'][0];
    dmFilterSame($text, $row[4], 'Accepted text was normalized in storage');
    dmFilterSame($author, $row[3], 'Accepted author was normalized in storage');
};

$tests['an empty list and the original two-argument constructor disable blocking'] = function () {
    [$pdo] = dmFilterFixture();
    $legacy = new Danmaku($pdo, str_repeat('fixture-key-', 3));
    dmFilterSame(23, $legacy->send(dmFilterMessage(['text' => 'WeChat 加微信']), '192.0.2.10', 1700000000)['code'], 'Original constructor behavior changed');
    foreach (['', " \u{200B}\u{FEFF}\n"] as $index => $words) {
        $service = new Danmaku($pdo, str_repeat('fixture-key-', 3), $words);
        dmFilterSame(23, $service->send(dmFilterMessage(['text' => 'WeChat 加微信']), '192.0.2.10', 1700000010 + $index * 3)['code'], 'An empty normalized list blocked sending');
    }
};

$tests['new rules retain historical matching comments and allow their reports'] = function () {
    [$pdo, $legacy] = dmFilterFixture();
    $sent = $legacy->send(dmFilterMessage(['text' => '加微信 WeChat', 'author' => '广告客服']), '192.0.2.10', 1700000000);
    $before = $legacy->read('fixture-video');
    $service = new Danmaku($pdo, str_repeat('fixture-key-', 3), "wechat\n加微信\n广告客服\n垃圾广告");
    dmFilterSame($before, $service->read('fixture-video'), 'New rules hid or deleted historical comments');
    $reported = $service->report(['title' => 'fixture-video', 'text' => '加微信 WeChat', 'cid' => '广告客服',
        'user' => $sent['id'], 'type' => '垃圾广告'], '192.0.2.20', 1700000001);
    dmFilterSame(23, $reported['code'], 'Content, author or reason filtering blocked an old-comment report');
    dmFilterSame(1, count(dmFilterSnapshot($pdo)[1]), 'Historical comment report was not saved');
};

$tests['settings migrate missing legacy keys and save normalized rules as JSON'] = function () {
    [$pdo] = dmFilterFixture();
    $pdo->exec('CREATE TABLE xplayer_config (id INTEGER PRIMARY KEY, user TEXT NOT NULL)');
    $pdo->exec('CREATE TABLE xplayer_safe (id INTEGER PRIMARY KEY, secretKEY TEXT NOT NULL)');
    $legacy = serialize(['title' => 'Legacy title', 'customLegacyKey' => 'keep-me']);
    $pdo->prepare('INSERT INTO xplayer_config (id, user) VALUES (1, ?)')->execute([$legacy]);
    $pdo->exec("INSERT INTO xplayer_safe (id, secretKEY) VALUES (1, 'fixture-secret')");
    [, , $user] = Settings::load($pdo);
    dmFilterSame('', $user['danmakuBlockedWords'], 'Old installations do not default to disabled rules');
    dmFilterSame($legacy, $pdo->query('SELECT user FROM xplayer_config')->fetchColumn(), 'Reading legacy settings wrote a migration');
    $updated = Settings::validateUser(['danmakuBlockedWords' => " We Chat \nｗｅｃｈａｔ\n加 微信 "], $user);
    dmFilterSame("wechat\n加微信", $updated['danmakuBlockedWords'], 'Settings did not normalize rules');
    dmFilterSame('Legacy title', $updated['title'], 'Rules update changed another setting');
    dmFilterSame('keep-me', $updated['customLegacyKey'], 'Rules update dropped a legacy setting');
    Settings::save($pdo, 'user', $updated);
    $stored = json_decode($pdo->query('SELECT user FROM xplayer_config')->fetchColumn(), true, 16, JSON_THROW_ON_ERROR);
    dmFilterSame($updated, $stored, 'Rules update did not save JSON');
    [, , $reloaded] = Settings::load($pdo);
    dmFilterSame($updated, $reloaded, 'Rules did not survive settings reload');
    $otherUpdate = Settings::validateUser(['title' => 'Updated title'], $reloaded);
    dmFilterSame("wechat\n加微信", $otherUpdate['danmakuBlockedWords'], 'Unrelated settings edit erased rules');
    $cleared = Settings::validateUser(['danmakuBlockedWords' => ''], $otherUpdate);
    Settings::save($pdo, 'user', $cleared);
    dmFilterSame('', Settings::load($pdo)[2]['danmakuBlockedWords'], 'Clearing rules was not persisted');
};

$tests['settings allow the dedicated word-list size while retaining validation'] = function () {
    $words = implode("\n", array_map(static fn($index) => sprintf('word-%03d-', $index) . str_repeat('x', 90), range(1, 100)));
    dmFilterExpect(strlen($words) > 8000 && strlen($words) < 32768, 'Large rules fixture is outside its intended size');
    dmFilterSame($words, Settings::validateUser(['danmakuBlockedWords' => $words], [])['danmakuBlockedWords'],
        'Generic 8000-byte settings limit incorrectly applies to blocked words');
    foreach ([[], null, true, 1, str_repeat(' ', 32769), "\xff", str_repeat('a', 101)] as $value) {
        dmFilterReject(fn() => Settings::validateUser(['danmakuBlockedWords' => $value], []), 'Invalid word-list setting was accepted');
    }
};

$tests['player settings never disclose the administrator word list'] = function () {
    $user = Settings::userDefaults();
    $user['danmakuBlockedWords'] = 'private-fixture-blocked-word';
    foreach ([false, true] as $adsEnabled) {
        $settings = Player::settings($user, $adsEnabled);
        dmFilterExpect(!array_key_exists('danmakuBlockedWords', $settings), 'Player settings expose the rule key');
        dmFilterExpect(!str_contains(json_encode($settings, JSON_THROW_ON_ERROR), $user['danmakuBlockedWords']), 'Player settings expose a private rule');
    }
};

$tests['matching is identical when optional PHP extensions are disabled'] = function () {
    $process = proc_open([PHP_BINARY, '-n', __FILE__, '--normalization-only'],
        [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    dmFilterExpect(is_resource($process), 'Cannot start isolated extension-free PHP process');
    fclose($pipes[0]);
    $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
    $status = proc_close($process);
    dmFilterSame(0, $status, 'Normalization failed without optional PHP extensions');
    dmFilterSame('', $stderr, 'Extension-free normalization emitted an error');
    dmFilterSame("PASS normalization without mbstring or intl\n", str_replace("\r\n", "\n", $stdout), 'Extension-free checks did not complete');
};

$failed = 0;
foreach ($tests as $name => $test) {
    try { $test(); echo 'PASS ' . $name . "\n"; }
    catch (Throwable $error) { $failed++; echo 'FAIL ' . $name . ': ' . $error->getMessage() . "\n"; }
}
echo "\n" . (count($tests) - $failed) . '/' . count($tests) . " tests passed\n";
exit($failed === 0 ? 0 : 1);

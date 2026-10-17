<?php
/**
 * Actual HTTP/authentication regressions against a disposable SQLite installation.
 * Run: php tests/danmaku-admin-http.php
 * Preview: php tests/danmaku-admin-http.php --serve-preview (type "stop" to finish).
 * Never reads deployed database/credentials or runs the real installer.
 */
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
    fwrite(STDERR, "The PDO SQLite extension is required.\n");
    exit(1);
}

function dmHttpExpect(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

/** Cookie jar is local to this loopback client; redirects are intentionally not followed. */
function dmHttpRequest(string $base, array &$cookies, string $path, string $method = 'GET', array $fields = [], ?string $csrf = null, bool $json = false): array
{
    $headers = ['Connection: close'];
    if ($cookies) $headers[] = 'Cookie: ' . implode('; ', array_map(
        static fn($key, $value) => $key . '=' . $value, array_keys($cookies), $cookies));
    if ($csrf !== null) $headers[] = 'X-CSRF-Token: ' . $csrf;
    if ($method === 'POST') $headers[] = 'Content-Type: ' . ($json ? 'application/json' : 'application/x-www-form-urlencoded');
    $context = stream_context_create(['http' => [
        'method' => $method, 'header' => implode("\r\n", $headers),
        'content' => $method === 'POST' ? ($json ? json_encode($fields, JSON_THROW_ON_ERROR) : http_build_query($fields)) : '',
        'ignore_errors' => true, 'follow_location' => 0, 'timeout' => 5,
    ]]);
    $body = @file_get_contents($base . $path, false, $context);
    $responseHeaders = $http_response_header ?? [];
    dmHttpExpect($body !== false && isset($responseHeaders[0]), 'Loopback HTTP request failed');
    preg_match('~^HTTP/\S+ (\d+)~', $responseHeaders[0], $status);
    foreach ($responseHeaders as $header) {
        if (preg_match('/^Set-Cookie:\s*([^=;]+)=([^;]*)/i', $header, $match)) {
            if ($match[2] === '' || $match[2] === 'deleted') unset($cookies[$match[1]]);
            else $cookies[$match[1]] = $match[2];
        }
    }
    return ['status' => (int) ($status[1] ?? 0), 'body' => $body,
        'json' => json_decode($body, true), 'headers' => $responseHeaders];
}

function dmHttpCsrf(array $response): string
{
    dmHttpExpect($response['status'] === 200, 'Could not load the real administration page');
    dmHttpExpect(preg_match('/<meta name="xplayer-csrf" content="([a-f0-9]{64})"/', $response['body'], $match) === 1,
        'Administration page did not provide a CSRF token');
    return $match[1];
}

function dmHttpStatus(array $response, int $expected, string $message): void
{
    dmHttpExpect($response['status'] === $expected && ($response['json']['code'] ?? null) === $expected,
        $message . ' (HTTP ' . $response['status'] . ')');
}

/** Check the resolved root and every target before deleting this one owned fixture. */
function dmHttpRemoveFixture(string $root, string $confirmedRoot): void
{
    $resolved = realpath($root);
    if ($resolved === false) return;
    dmHttpExpect($resolved === $confirmedRoot && str_starts_with(basename($resolved), 'xplayer-danmaku-http-'),
        'Refusing cleanup outside the confirmed temporary fixture');
    $entries = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($resolved, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($entries as $entry) {
        if ($entry->isLink()) { unlink($entry->getPathname()); continue; }
        $path = $entry->getRealPath();
        dmHttpExpect($path !== false && str_starts_with($path, $resolved . DIRECTORY_SEPARATOR),
            'Unexpected cleanup target outside the temporary fixture');
        dmHttpExpect($entry->isDir() ? rmdir($path) : unlink($path), 'Could not remove temporary fixture entry');
    }
    dmHttpExpect(rmdir($resolved), 'Could not remove the temporary fixture');
}

$preview = ($argv[1] ?? '') === '--serve-preview';
$source = dirname(__DIR__);
$temporary = sys_get_temp_dir() . '/xplayer-danmaku-http-' . bin2hex(random_bytes(8));
$server = null;
$database = null;
$confirmedRoot = '';
$passed = 0;
$exitCode = 0;

try {
    foreach (['class', 'admin', 'assets/admin', 'assets/branding', 'includes', 'var', 'sessions'] as $directory) {
        dmHttpExpect(mkdir($temporary . '/' . $directory, 0700, true), 'Could not create the temporary fixture');
    }
    $confirmedRoot = realpath($temporary);
    foreach (['Security.php', 'Common.Class.php', 'Http.php', 'Settings.php', 'Statistics.php', 'Installer.php', 'Danmaku.php', 'DanmakuAdmin.php', 'DanmakuFilter.php'] as $file) {
        dmHttpExpect(copy($source . '/class/' . $file, $temporary . '/class/' . $file), 'Missing required class: ' . $file);
    }
    dmHttpExpect(copy($source . '/danmaku.php', $temporary . '/danmaku.php'), 'The public danmaku endpoint is missing');
    foreach (['admin/*.php', 'assets/admin/*', 'assets/branding/*'] as $pattern) {
        foreach (glob($source . '/' . $pattern) as $file) {
            if (!is_file($file) || is_link($file)) continue;
            dmHttpExpect(copy($file, $temporary . substr($file, strlen($source))), 'Could not copy administration source');
        }
    }
    dmHttpExpect(is_file($temporary . '/admin/danmaku.php'), 'The new administration page is missing');
    dmHttpExpect(is_file($temporary . '/admin/danmaku-groups.php'), 'The video-group administration page is missing');
    define('XPLAYER_ROOT', $temporary);
    require $temporary . '/class/Installer.php';
    require $temporary . '/class/Danmaku.php';
    $databasePath = $temporary . '/var/fixture.sqlite';
    $database = new PDO('sqlite:' . $databasePath);
    Installer::seed($database);
    Danmaku::ensureSchema($database);
    $insert = $database->prepare('INSERT INTO xplayer_danmaku (player_key, player_id, video_time, mode, color, author, content, font_size, client_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $report = $database->prepare('INSERT INTO xplayer_danmaku_reports (comment_id, reporter_hash, reason, created_at) VALUES (?, ?, ?, ?)');
    $fixtureCount = $preview ? 57 : 3;
    for ($index = 1; $index <= $fixtureCount; $index++) {
        $player = $index % 3 === 0 ? 'fixture-video-beta' : 'fixture-video-alpha';
        if ($preview && $index > 3) {
            $player = $index <= 5 ? '<img src=x onerror="window.fixtureGroupXss=true">' :
                'fixture-video-' . str_pad((string) (int) ceil(($index - 3) / 2), 3, '0', STR_PAD_LEFT);
        }
        $content = $index === 3 ? '<img src=x onerror="window.fixtureXss=true"> & 仅应显示为文字' :
            ['这段配乐很好听', '这个镜头值得再看一遍', '周末一起看电影'][$index % 3] . ' · 测试 ' . $index;
        $insert->execute([hash('sha256', $player), $player, 12.5 * $index, ['right', 'top', 'bottom'][$index % 3],
            ['#ffffff', '#ff4d4f', '#37c871'][$index % 3], $index === 3 ? '<b>测试昵称</b>' : '测试观众 ' . $index,
            $content, '27.5px', hash('sha256', 'fixture-client-' . $index), time() - (3600 * $index)]);
        if ($index <= 2 || ($preview && $index % 4 === 0)) {
            $report->execute([$index, hash('sha256', 'fixture-reporter-' . $index), $index % 2 ? '垃圾广告' : '剧透', time() - 60 * $index]);
        }
    }
    $insert = $report = null;
    file_put_contents($temporary . '/includes/Mysql.Include.php', Security::phpFile(['dsn' => 'sqlite:' . $databasePath]));
    file_put_contents($temporary . '/includes/Admin.Credentials.php', Security::phpFile([
        'username' => 'fixture_admin', 'password_hash' => password_hash('FixtureOnly-Password-42!', PASSWORD_DEFAULT),
    ]));
    file_put_contents($temporary . '/install.lock', "Disposable test fixture only.\n");
    file_put_contents($temporary . '/config.php', <<<'PHP'
<?php
require_once __DIR__ . '/class/Common.Class.php';
$conn = Settings::connection();
[$config, $safeArr, $user] = Settings::load($conn);
$secretKey = $safeArr['secretKEY'];
$secret = false;
$cacheTime = 300;
$async = true;
$AD = $zywlist = false;
$specialapi = $api = $zyapi = $originarr = [];
if (!defined('TODAY')) define('TODAY', date('Y-m-d'));
if (!defined('VERSION')) define('VERSION', 'isolated-test');
PHP);
    // Serve only the tested public endpoints/assets, never SQLite, sessions or credentials.
    file_put_contents($temporary . '/router.php', <<<'PHP'
<?php
$path = rawurldecode((string) parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
if (!preg_match('~\A/(?:danmaku\.php|admin/(?:[A-Za-z]+(?:-[A-Za-z]+)*\.php)?|assets/(?:admin|branding)/[A-Za-z0-9_.-]+)\z~', $path)) {
    http_response_code(404); exit;
}
return false;
PHP);
    $socket = stream_socket_server('tcp://127.0.0.1:0', $errorNumber, $errorMessage);
    dmHttpExpect(is_resource($socket), 'Could not reserve a loopback port');
    $address = stream_socket_get_name($socket, false);
    fclose($socket);
    $base = 'http://' . $address;
    $server = proc_open([PHP_BINARY, '-d', 'session.save_path=' . $temporary . '/sessions',
        '-d', 'display_errors=0', '-d', 'log_errors=1', '-d', 'error_log=' . $temporary . '/php.log',
        '-S', $address, '-t', $temporary, $temporary . '/router.php'],
        [0 => ['pipe', 'r'], 1 => ['file', $temporary . '/server.log', 'a'], 2 => ['file', $temporary . '/server.log', 'a']],
        $pipes, $temporary, null, ['bypass_shell' => true, 'create_new_console' => false]);
    dmHttpExpect(is_resource($server), 'Could not start the isolated PHP server');
    fclose($pipes[0]);
    $ready = false;
    for ($attempt = 0; $attempt < 100; $attempt++) {
        $connection = @stream_socket_client('tcp://' . $address, $errorNumber, $errorMessage, 0.1);
        if ($connection) { fclose($connection); $ready = true; break; }
        dmHttpExpect(proc_get_status($server)['running'], 'Isolated PHP server exited during startup');
        usleep(50000);
    }
    dmHttpExpect($ready, 'Isolated PHP server did not become ready');

    if ($preview) {
        echo "Preview: $base/admin/danmaku.php\n";
        echo "Video groups: $base/admin/danmaku-groups.php\n";
        echo "Fictional fixture login: fixture_admin / FixtureOnly-Password-42!\n";
        echo "Temporary data only; type stop and Enter to stop the server and clean up.\n";
        while (($line = fgets(STDIN)) !== false) if (trim($line) === 'stop') break;
    } else {
        $cookies = [];
        $csrf = dmHttpCsrf(dmHttpRequest($base, $cookies, '/admin/index.php'));
        foreach (['/admin/danmaku.php', '/admin/danmaku-groups.php'] as $path) {
            $page = dmHttpRequest($base, $cookies, $path);
            dmHttpExpect($page['status'] === 303, 'Anonymous administration page did not redirect to login');
        }
        $filterSettings = ['method' => 'SaveSettings', 'section' => 'danmaku',
            'data' => ['danmakuBlockedWords' => "广告词\nspam.example\n镜头"]];
        $alphaKey = hash('sha256', 'fixture-video-alpha');
        $protectedRequests = [
            ['method' => 'DanmakuList'], ['method' => 'DanmakuDelete', 'ids' => ['1']],
            ['method' => 'DanmakuDismissReports', 'ids' => ['1']], ['method' => 'DanmakuGroups'],
            ['method' => 'DanmakuClearGroups', 'keys' => [$alphaKey]], $filterSettings,
        ];
        foreach ($protectedRequests as $fields) {
            $method = $fields['method'];
            dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php?method=' . $method), 405, 'Anonymous GET accepted ' . $method);
            dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', $fields), 403, 'Missing CSRF accepted ' . $method);
            dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', $fields, $csrf), 401, 'Anonymous POST accepted ' . $method);
        }
        echo 'PASS anonymous page/API, POST and CSRF boundaries' . "\n"; $passed++;
        $login = ['method' => 'Login', 'account_u' => 'fixture_admin', 'account_p' => 'FixtureOnly-Password-42!'];
        dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', $login, 'invalid-token'), 403, 'Login accepted invalid CSRF');
        $anonymousSession = $cookies['XPLAYER_ADMIN'] ?? '';
        dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', $login, $csrf), 200, 'Real login failed');
        dmHttpExpect($anonymousSession !== ($cookies['XPLAYER_ADMIN'] ?? ''), 'Login did not rotate the session identifier');
        $oldCsrf = $csrf;
        $csrf = dmHttpCsrf(dmHttpRequest($base, $cookies, '/admin/danmaku.php'));
        dmHttpExpect($csrf !== $oldCsrf, 'Login did not rotate the CSRF token');
        dmHttpExpect(dmHttpCsrf(dmHttpRequest($base, $cookies, '/admin/danmaku-groups.php')) === $csrf,
            'Authenticated video-group page did not share the real administration session');
        echo 'PASS real login and session/CSRF rotation' . "\n"; $passed++;
        foreach ($protectedRequests as $fields) {
            $method = $fields['method'];
            dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php?method=' . $method), 405, 'Authenticated GET accepted ' . $method);
            foreach ([null, 'invalid-token', $oldCsrf] as $invalid) {
                dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', $fields, $invalid), 403, 'Invalid authenticated CSRF accepted ' . $method);
            }
        }
        dmHttpExpect((int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku')->fetchColumn() === 3 &&
            (int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku_reports')->fetchColumn() === 2,
            'A rejected request changed fixture data');
        dmHttpExpect(Settings::load($database)[2]['danmakuBlockedWords'] === '', 'A rejected request changed the blocked words');
        echo 'PASS authenticated POST/CSRF boundaries leave data unchanged' . "\n"; $passed++;
        $list = dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuList'], $csrf);
        dmHttpStatus($list, 200, 'Authenticated list failed');
        $data = $list['json']['data'] ?? [];
        dmHttpExpect(($data['total'] ?? null) === 3 && count($data['items'] ?? []) === 3 &&
            ($data['summary'] ?? null) === ['comments' => 3, 'videos' => 2, 'reports' => 2, 'reportedComments' => 2],
            'List data or global summary does not match the fixture');
        dmHttpExpect(!str_contains($list['body'], 'client_hash') && !str_contains($list['body'], 'reporter_hash'),
            'Administration API leaked client/reporter hashes');
        foreach ($data['items'] as $item) {
            dmHttpExpect(is_string($item['id'] ?? null) && isset($item['content'], $item['author'], $item['reports']),
                'List did not preserve the public item contract');
        }
        echo 'PASS authenticated listing excludes private client identifiers' . "\n"; $passed++;
        foreach ([[['reported' => '0'], 3], [['reported' => '1'], 2],
            [['player' => 'fixture-video-beta'], 1], [['keyword' => '<img'], 1], [['keyword' => '%'], 0]] as [$filter, $total]) {
            $filtered = dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuList'] + $filter, $csrf);
            dmHttpStatus($filtered, 200, 'Authenticated filtered list failed');
            dmHttpExpect(($filtered['json']['data']['total'] ?? null) === $total, 'HTTP filter returned the wrong comments');
        }
        foreach ([['keyword' => ['invalid']], ['player' => ['invalid']], ['reported' => 'invalid'], ['page' => '-1']] as $filter) {
            dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuList'] + $filter, $csrf),
                400, 'Malformed list filter was accepted');
        }
        echo 'PASS HTTP filters and their invalid-input boundaries' . "\n"; $passed++;
        $groupList = dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuGroups'], $csrf);
        dmHttpStatus($groupList, 200, 'Authenticated video-group listing failed');
        $groupData = $groupList['json']['data'] ?? [];
        dmHttpExpect(($groupData['total'] ?? null) === 2 && ($groupData['pageSize'] ?? null) === 25 &&
            ($groupData['page'] ?? null) === 1 && ($groupData['pages'] ?? null) === 1 &&
            ($groupData['summary'] ?? null) === ['comments' => 3, 'videos' => 2, 'reports' => 2, 'reportedComments' => 2],
            'Video-group pagination or global summary does not match the fixture');
        $groupItems = array_column($groupData['items'] ?? [], null, 'key');
        $betaKey = hash('sha256', 'fixture-video-beta');
        dmHttpExpect(count($groupItems) === 2 && ($groupItems[$alphaKey]['comments'] ?? null) === 2 &&
            ($groupItems[$alphaKey]['reports'] ?? null) === 2 && ($groupItems[$alphaKey]['playerId'] ?? null) === 'fixture-video-alpha' &&
            ($groupItems[$betaKey]['comments'] ?? null) === 1 && ($groupItems[$betaKey]['reports'] ?? null) === 0 &&
            is_int($groupItems[$alphaKey]['latestAt'] ?? null), 'Video-group comments/reports were aggregated incorrectly');
        foreach ([[['reported' => '0'], 2], [['reported' => '1'], 1], [['keyword' => 'beta'], 1], [['keyword' => '%'], 0]] as [$filter, $total]) {
            $filtered = dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuGroups'] + $filter, $csrf);
            dmHttpStatus($filtered, 200, 'Filtered video-group listing failed');
            dmHttpExpect(($filtered['json']['data']['total'] ?? null) === $total, 'Video-group HTTP filter returned the wrong groups');
        }
        foreach ([['keyword' => ['invalid']], ['reported' => 'invalid'], ['page' => '-1']] as $filter) {
            dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuGroups'] + $filter, $csrf),
                400, 'Malformed video-group filter was accepted');
        }
        echo 'PASS video-group listing aggregates counts and applies validated filters' . "\n"; $passed++;
        foreach ([[], $alphaKey, ['invalid'], [str_repeat('a', 63)], [$alphaKey, '1 OR 1=1'], [[$alphaKey]],
            array_fill(0, 26, $alphaKey)] as $keys) {
            dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuClearGroups', 'keys' => $keys], $csrf),
                400, 'Malformed or oversized video-group keys were accepted');
        }
        dmHttpExpect((int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku')->fetchColumn() === 3 &&
            (int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku_reports')->fetchColumn() === 2,
            'A rejected video-group cleanup changed comments or reports');
        echo 'PASS malformed video-group cleanup is rejected atomically' . "\n"; $passed++;
        foreach (['DanmakuDelete', 'DanmakuDismissReports'] as $method) {
            foreach ([[], '1', ['0'], ['1 OR 1=1'], [['1']]] as $ids) {
                dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => $method, 'ids' => $ids], $csrf), 400,
                    'Malformed IDs accepted by ' . $method);
            }
        }
        echo 'PASS malformed mutations are rejected' . "\n"; $passed++;
        $dismiss = dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuDismissReports', 'ids' => ['1']], $csrf);
        dmHttpStatus($dismiss, 200, 'Authenticated report dismissal failed');
        dmHttpExpect(($dismiss['json']['affected'] ?? null) === 1 &&
            (int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku_reports WHERE comment_id = 1')->fetchColumn() === 0 &&
            (int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku WHERE id = 1')->fetchColumn() === 1,
            'Dismissal did not remove only the selected reports');
        $delete = dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuDelete', 'ids' => ['2']], $csrf);
        dmHttpStatus($delete, 200, 'Authenticated deletion failed');
        dmHttpExpect(($delete['json']['affected'] ?? null) === 1 &&
            (int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku WHERE id = 2')->fetchColumn() === 0 &&
            (int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku_reports WHERE comment_id = 2')->fetchColumn() === 0 &&
            (int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku')->fetchColumn() === 2,
            'Deletion failed to remove the selected comment/reports or changed unrelated comments');
        echo 'PASS authenticated delete/dismiss persist the exact intended changes' . "\n"; $passed++;
        dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', $filterSettings, $csrf), 200,
            'Authenticated blocked-word settings save failed');
        dmHttpExpect(Settings::load($database)[2]['danmakuBlockedWords'] === $filterSettings['data']['danmakuBlockedWords'],
            'Blocked-word settings were not persisted');
        dmHttpExpect((int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku')->fetchColumn() === 2,
            'Saving blocked words deleted historical comments');
        $invalidSettings = $filterSettings;
        $invalidSettings['data']['danmakuBlockedWords'] = ['invalid'];
        dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', $invalidSettings, $csrf), 400,
            'Non-string blocked-word settings were accepted');
        dmHttpExpect(Settings::load($database)[2]['danmakuBlockedWords'] === $filterSettings['data']['danmakuBlockedWords'],
            'Invalid blocked-word settings overwrote the saved rules');
        echo 'PASS authenticated blocked-word save persists rules without deleting history' . "\n"; $passed++;
        $visitor = [];
        $send = ['player' => 'fixture-filter-video', 'text' => '这是一条正常弹幕', 'author' => '普通观众',
            'time' => 3.5, 'type' => 'right', 'color' => '#ffffff', 'size' => '27.5px'];
        foreach ([['text' => '这里包含广告词，请加群'], ['author' => '广告词账号'], ['text' => '访问 SPAM.EXAMPLE']] as $change) {
            $rejected = dmHttpRequest($base, $visitor, '/danmaku.php?ac=dm', 'POST', array_replace($send, $change), null, true);
            dmHttpStatus($rejected, 400, 'Direct public JSON submission bypassed the blocked words');
            dmHttpExpect(($rejected['json']['msg'] ?? null) === '弹幕内容或昵称不符合发送要求',
                'Blocked-word rejection exposed the matching rule or used an unexpected response');
        }
        dmHttpExpect((int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku')->fetchColumn() === 2 &&
            (int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku_limits')->fetchColumn() === 0,
            'Rejected blocked-word submissions persisted data or consumed the send allowance');
        $sent = dmHttpRequest($base, $visitor, '/danmaku.php?ac=dm', 'POST', $send, null, true);
        dmHttpExpect($sent['status'] === 200 && ($sent['json']['code'] ?? null) === 23 && is_string($sent['json']['id'] ?? null),
            'A legitimate visitor could not send immediately after blocked submissions');
        dmHttpExpect($visitor === [], 'Public sender unexpectedly needed an administrator session');
        echo 'PASS direct public JSON blocks content/nickname spam without consuming the send allowance' . "\n"; $passed++;
        $historical = $database->query('SELECT player_id, content, author FROM xplayer_danmaku WHERE id = 1')->fetch(PDO::FETCH_ASSOC);
        $reported = dmHttpRequest($base, $visitor, '/danmaku.php?ac=report', 'POST', ['user' => '1',
            'title' => $historical['player_id'], 'text' => $historical['content'], 'cid' => $historical['author'], 'type' => '垃圾广告']);
        dmHttpExpect($reported['status'] === 200 && ($reported['json']['code'] ?? null) === 23 &&
            (int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku_reports WHERE comment_id = 1')->fetchColumn() === 1,
            'The new rule prevented reporting a matching historical comment');
        echo 'PASS matching historical comments remain reportable' . "\n"; $passed++;
        $filterSettings['data']['danmakuBlockedWords'] = '';
        dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', $filterSettings, $csrf), 200,
            'Clearing the blocked-word settings failed');
        dmHttpExpect(Settings::load($database)[2]['danmakuBlockedWords'] === '', 'Empty blocked-word settings were not persisted');
        // Respect the public endpoint's actual three-second send cooldown for the next accepted write.
        sleep(3);
        $sentAfterClear = dmHttpRequest($base, $visitor, '/danmaku.php?ac=dm', 'POST',
            array_replace($send, ['text' => '清空后广告词不再触发过滤', 'author' => '广告词账号']), null, true);
        dmHttpExpect($sentAfterClear['status'] === 200 && ($sentAfterClear['json']['code'] ?? null) === 23 &&
            (int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku')->fetchColumn() === 4,
            'Empty blocked-word settings did not disable filtering for direct public submissions');
        echo 'PASS clearing the rule list disables filtering on the public endpoint' . "\n"; $passed++;
        $limitsBeforeGroupClear = $database->query('SELECT bucket, last_sent FROM xplayer_danmaku_limits ORDER BY bucket')->fetchAll(PDO::FETCH_ASSOC);
        $settingsBeforeGroupClear = Settings::load($database)[2];
        $cleared = dmHttpRequest($base, $cookies, '/admin/api.php', 'POST',
            ['method' => 'DanmakuClearGroups', 'keys' => [$alphaKey]], $csrf);
        dmHttpStatus($cleared, 200, 'Authenticated video-group cleanup failed');
        dmHttpExpect(($cleared['json']['affected'] ?? null) === ['groups' => 1, 'comments' => 1, 'reports' => 1] &&
            (int) $database->query("SELECT COUNT(*) FROM xplayer_danmaku WHERE player_id = 'fixture-video-alpha'")->fetchColumn() === 0 &&
            (int) $database->query('SELECT COUNT(*) FROM xplayer_danmaku_reports WHERE comment_id = 1')->fetchColumn() === 0 &&
            (int) $database->query("SELECT COUNT(*) FROM xplayer_danmaku WHERE player_id = 'fixture-video-beta'")->fetchColumn() === 1 &&
            (int) $database->query("SELECT COUNT(*) FROM xplayer_danmaku WHERE player_id = 'fixture-filter-video'")->fetchColumn() === 2,
            'Video-group cleanup failed to remove its reports/comments or changed other videos');
        dmHttpExpect($limitsBeforeGroupClear === $database->query('SELECT bucket, last_sent FROM xplayer_danmaku_limits ORDER BY bucket')->fetchAll(PDO::FETCH_ASSOC) &&
            $settingsBeforeGroupClear === Settings::load($database)[2], 'Video-group cleanup changed rate limits or player settings');
        $remainingGroups = dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuGroups'], $csrf);
        dmHttpStatus($remainingGroups, 200, 'Video-group listing failed after cleanup');
        dmHttpExpect(($remainingGroups['json']['data']['total'] ?? null) === 2 &&
            ($remainingGroups['json']['data']['summary']['comments'] ?? null) === 3 &&
            ($remainingGroups['json']['data']['summary']['reports'] ?? null) === 0,
            'Video-group summary was stale after cleanup');
        echo 'PASS selected video-group cleanup removes reports/comments and preserves other videos/settings' . "\n"; $passed++;
        $logout = dmHttpRequest($base, $cookies, '/admin/logout.php', 'POST', ['csrf' => $csrf]);
        dmHttpExpect($logout['status'] === 303, 'Real logout failed');
        $csrf = dmHttpCsrf(dmHttpRequest($base, $cookies, '/admin/index.php'));
        dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuList'], $csrf), 401,
            'Logged-out session retained administration access');
        dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', $filterSettings, $csrf), 401,
            'Logged-out session retained blocked-word settings access');
        dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuGroups'], $csrf), 401,
            'Logged-out session retained video-group listing access');
        dmHttpStatus(dmHttpRequest($base, $cookies, '/admin/api.php', 'POST', ['method' => 'DanmakuClearGroups', 'keys' => [$betaKey]], $csrf), 401,
            'Logged-out session retained video-group cleanup access');
        echo 'PASS logout revokes administration access' . "\n"; $passed++;
    }
} catch (Throwable $error) {
    $exitCode = 1;
    fwrite(STDERR, 'FAIL ' . $error->getMessage() . "\n");
} finally {
    $database = null;
    if (is_resource($server)) {
        proc_terminate($server);
        proc_close($server);
    }
    if ($confirmedRoot !== '') dmHttpRemoveFixture($temporary, $confirmedRoot);
}
if (!$preview) echo $passed . ' HTTP integration groups passed; isolated fixture removed.' . "\n";
exit($exitCode);

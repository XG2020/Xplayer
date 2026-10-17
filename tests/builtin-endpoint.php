<?php
/**
 * Offline regressions for the bundled endpoint and VideoList integration.
 * Run: php tests/builtin-endpoint.php
 * All HTTP entry points are mocked. Damaged configurations run in disposable
 * copies and separate PHP processes, leaving deployed configuration untouched.
 */
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }

$fixtureMode = ($argv[1] ?? '') === '--fixture';
$applicationRoot = $fixtureMode ? ($argv[2] ?? '') : dirname(__DIR__);
if (!is_dir($applicationRoot . '/class')) {
    fwrite(STDERR, "Application classes unavailable.\n");
    exit(1);
}
require_once $applicationRoot . '/class/Vinfo.Class.php';

final class EndpointTestHttp extends Http
{
    public array $requests = [];
    public array $responses = [];
    public array $errors = [];

    public function json(string $url): array { return $this->answer('json', $url); }
    public function jsonWithSelfReferer(string $url): array { return $this->answer('self', $url); }
    public function get(string $url, int $limit = 2097152): array
    {
        $this->requests[] = ['raw', $url];
        throw new LogicException('Unexpected raw HTTP operation');
    }
    private function answer(string $mode, string $url): array
    {
        $this->requests[] = [$mode, $url];
        $key = $mode . ' ' . $url;
        if (isset($this->errors[$key])) throw $this->errors[$key];
        if (!array_key_exists($key, $this->responses)) throw new LogicException('Unexpected JSON HTTP operation');
        return $this->responses[$key];
    }
}

function endpointExpect(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

function endpointSame($expected, $actual, string $message): void
{
    // Avoid printing the recovered address if an assertion fails.
    endpointExpect($expected === $actual, $message);
}

function endpointEpisodes(): array
{
    return [
        ['name' => 'Episode 1', 'url' => 'https://video.example/watch/1'],
        ['name' => 'Episode 2', 'url' => 'https://video.example/watch/2'],
    ];
}

function endpointCatalogue(): array
{
    return [
        'data' => ['name' => 'Demo series', 'episode' => 2, 'episodeAll' => 2],
        'list' => [
            '1' => ['url' => 'https://video.example/watch/1', 'cont' => 'First episode'],
            '2' => ['url' => 'https://video.example/watch/2', 'cont' => 'Second episode'],
        ],
    ];
}

function endpointCheckDamagedFixture(): void
{
    $rejected = false;
    try { BuiltinEndpoint::url(); } catch (RuntimeException $error) { $rejected = true; }
    endpointExpect($rejected, 'Damaged or missing configuration was accepted');
    endpointSame(false, BuiltinEndpoint::matchesRequest('https://adapter.example/catalogue?url=demo'),
        'Broken configuration classified a request as bundled');
    $GLOBALS['user'] = [];
    $http = new EndpointTestHttp();
    $result = (new VideoList('https://video.example/watch/2', [], $http))->printR();
    endpointSame(204, $result['code'], 'Missing built-in configuration did not fail closed');
    endpointSame([], $http->requests, 'Broken built-in configuration attempted HTTP');

    $adapter = 'https://adapter.example/catalogue?url=';
    $request = parseUrl::endpoint($adapter, 'https://video.example/watch/2');
    $GLOBALS['user'] = ['metadataApi' => $adapter];
    $http = new EndpointTestHttp();
    $http->responses['json ' . $request] = [
        'name' => 'Custom series', 'episode' => 2, 'episodes' => endpointEpisodes(),
    ];
    $result = (new VideoList('https://video.example/watch/2', [], $http))->printR();
    endpointSame(200, $result['code'], 'Custom episodes failed with broken built-in configuration');
    endpointSame('Custom series', $result['data']['name'], 'Custom metadata was lost');
    endpointSame(['https://video.example/watch/1', 'https://video.example/watch/2'],
        $result['video'][0]['url'][0]['play'], 'Custom episodes were changed');
    endpointSame([['json', $request]], $http->requests, 'Custom adapter made an unexpected request');

    $http = new EndpointTestHttp();
    $http->responses['json ' . $request] = ['name' => 'Metadata only'];
    $result = (new VideoList('https://video.example/watch/2', [], $http))->printR();
    endpointSame(204, $result['code'], 'Metadata-only adapter result changed after failed fallback');
    endpointSame('Metadata only', $result['data']['name'], 'Failed fallback discarded custom metadata');
    endpointSame([['json', $request]], $http->requests, 'Failed fallback attempted HTTP');
    unset($GLOBALS['user']);
}

if ($fixtureMode) {
    ini_set('error_log', $applicationRoot . '/fixture.log');
    ini_set('log_errors', '1');
    ini_set('display_errors', '0');
    try {
        endpointCheckDamagedFixture();
        echo '{"ok":true}';
        exit(0);
    } catch (Throwable $error) {
        echo json_encode(['ok' => false, 'error' => $error->getMessage()], JSON_THROW_ON_ERROR);
        exit(1);
    }
}

$temporary = sys_get_temp_dir() . '/xplayer-endpoint-tests-' . bin2hex(random_bytes(8));
if (!mkdir($temporary, 0700, true)) throw new RuntimeException('Cannot create isolated test directory');
$temporaryReal = realpath($temporary);
$originalErrorLog = ini_get('error_log');
$originalLogErrors = ini_get('log_errors');
$originalUserExists = array_key_exists('user', $GLOBALS);
$originalUser = $GLOBALS['user'] ?? null;
$results = [];
$failed = 0;

function endpointTest(string $name, callable $test): void
{
    global $results, $failed;
    try {
        $GLOBALS['user'] = [];
        $test();
        $results[] = 'PASS ' . $name;
    } catch (Throwable $error) {
        $failed++;
        $results[] = 'FAIL ' . $name . ': ' . $error->getMessage();
    }
}

function endpointFlip(string $encoded): string
{
    $bytes = base64_decode($encoded, true);
    if ($bytes === false || $bytes === '') throw new RuntimeException('Invalid test fixture bytes');
    $bytes[0] = chr(ord($bytes[0]) ^ 1);
    return base64_encode($bytes);
}

function endpointRemoveTemporary(string $root, string $confirmedRoot): void
{
    $resolved = realpath($root);
    if ($resolved === false) return;
    if ($resolved !== $confirmedRoot || !str_starts_with(basename($resolved), 'xplayer-endpoint-tests-')) {
        throw new RuntimeException('Refusing cleanup outside the confirmed temporary directory');
    }
    $entries = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($resolved, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($entries as $entry) {
        if ($entry->isLink()) { unlink($entry->getPathname()); continue; }
        $target = $entry->getRealPath();
        if ($target === false || !str_starts_with($target, $resolved . DIRECTORY_SEPARATOR)) {
            throw new RuntimeException('Unexpected path during test cleanup');
        }
        if ($entry->isDir()) rmdir($target); else unlink($target);
    }
    rmdir($resolved);
}

try {
    ini_set('error_log', $temporary . '/suite.log');
    ini_set('log_errors', '1');
    $endpoint = BuiltinEndpoint::url();
    $host = (string) parse_url($endpoint, PHP_URL_HOST);
    $path = (string) parse_url($endpoint, PHP_URL_PATH);
    $input = 'https://video.example/watch/2';
    $request = parseUrl::endpoint($endpoint, $input);

    endpointTest('bundled configuration decrypts to a valid HTTPS request template', function () use ($endpoint) {
        endpointSame(true, BuiltinEndpoint::validTemplate($endpoint), 'Decoded request template is invalid');
        endpointSame($endpoint, BuiltinEndpoint::url(), 'Repeated decryption changed the endpoint');
        $data = require dirname(__DIR__) . '/includes/Builtin.Endpoint.php';
        endpointExpect(!str_contains(serialize($data), $endpoint), 'Bundled configuration contains plaintext');
    });
    endpointTest('template validation rejects insecure, ambiguous and malformed addresses', function () {
        foreach ([
            'https://adapter.example/?url=',
            'https://adapter.example/?url={url}&mode=1',
            'https://adapter.example:443/?url=',
        ] as $template) {
            endpointSame(true, BuiltinEndpoint::validTemplate($template), 'Valid template was rejected');
        }
        foreach ([
            'http://adapter.example/?url=', 'https://adapter.example:444/?url=',
            'https://user:pass@adapter.example/?url=', 'https://adapter.example/?url=#fragment',
            'https://adapter.example/?url={url}&again={url}', 'https://adapter.example/?url=complete',
            'https://adapter.example/{url}', 'https://adapter.example/{url}?mode=1',
            'https://adapter.example/path', "https://adapter.example/?url=\n", '',
        ] as $template) {
            endpointSame(false, BuiltinEndpoint::validTemplate($template), 'Invalid template was accepted');
        }
    });
    endpointTest('built-in classification enforces scheme, host, path, port and credential boundaries',
        function () use ($request, $host, $path) {
            endpointSame(true, BuiltinEndpoint::matchesRequest($request), 'Built-in request was not recognized');
            endpointSame(true, BuiltinEndpoint::matchesRequest('https://' . strtoupper($host) . ':443' . $path . '?url=demo'),
                'Canonical HTTPS host and port were rejected');
            endpointSame(true, BuiltinEndpoint::matchesRequest('https://' . $host . rtrim($path, '/') . '?url=demo'),
                'Existing optional trailing-slash behavior changed');
            foreach ([
                'http://' . $host . $path . '?url=demo',
                'https://' . $host . ':444' . $path . '?url=demo',
                'https://' . $host . '.attacker.example' . $path . '?url=demo',
                'https://prefix.' . $host . $path . '?url=demo',
                'https://user:pass@' . $host . $path . '?url=demo',
                'https://' . $host . '@attacker.example' . $path . '?url=demo',
                'https://' . $host . rtrim($path, '/') . '-other?url=demo',
                'https://' . $host . rtrim($path, '/') . '/child?url=demo',
                'https://attacker.example/?next=' . rawurlencode($request),
            ] as $candidate) {
                endpointSame(false, BuiltinEndpoint::matchesRequest($candidate), 'Non-built-in request was misclassified');
            }
        });
    endpointTest('normal built-in lookup retains catalogue and makes one self-referer request',
        function () use ($input, $request) {
            $http = new EndpointTestHttp();
            $http->responses['self ' . $request] = endpointCatalogue();
            $result = (new VideoList($input, [], $http))->printR();
            endpointSame(200, $result['code'], 'Built-in catalogue was lost');
            endpointSame(1, $result['data']['currentIndex'], 'Current episode was not preserved');
            endpointSame(['1', '2'], $result['video'][0]['url'][0]['labels'], 'Episode labels changed');
            endpointSame([['self', $request]], $http->requests, 'Built-in lookup repeated or used the wrong HTTP method');
        });
    endpointTest('protected artwork is filtered without affecting other hosts or posters',
        function () use ($input, $request) {
            // The legacy artwork rule is independent of a replacement metadata service.
            $host = implode('', array_map('chr', [97, 112, 105, 46, 98, 121, 116, 101, 97, 109, 111, 110, 101, 46, 99, 110]));
            foreach (['/poster-background.php', '/POSTER-background.php/', '/%70oster-background.php'] as $path) {
                $picture = 'https://' . strtoupper($host) . $path . '?variant=1';
                $catalogue = endpointCatalogue();
                $catalogue['data']['pic'] = $picture;
                foreach ($catalogue['list'] as &$episode) $episode['cover'] = $picture;
                unset($episode);
                $http = new EndpointTestHttp();
                $http->responses['self ' . $request] = $catalogue;
                $result = (new VideoList($input, [], $http))->printR();
                endpointSame(200, $result['code'], 'Artwork filtering discarded the catalogue');
                endpointSame('', $result['data']['pic'], 'Shared background was retained as a poster');
                endpointSame(['', ''], $result['video'][0]['url'][0]['covers'], 'Shared backgrounds leaked through episode covers');
                endpointExpect(!str_contains(strtolower(Security::json($result)), $host), 'Filtered response exposed the protected host');
            }
            foreach (['https://images.example/poster-background.php', 'https://' . $host . '/series-poster.jpg',
                'https://' . $host . '.example/poster-background.php'] as $picture) {
                $catalogue = endpointCatalogue();
                $catalogue['data']['pic'] = $picture;
                $http = new EndpointTestHttp();
                $http->responses['self ' . $request] = $catalogue;
                $result = (new VideoList($input, [], $http))->printR();
                endpointSame($picture, $result['video'][0]['pic'], 'Unrelated poster was filtered');
            }
        });
    endpointTest('empty built-in catalogue does not repeat the full request',
        function () use ($input, $request) {
            $http = new EndpointTestHttp();
            $http->responses['self ' . $request] = ['data' => ['name' => 'Empty series']];
            $result = (new VideoList($input, [], $http))->printR();
            endpointSame(204, $result['code'], 'Empty catalogue unexpectedly succeeded');
            endpointSame([['self', $request]], $http->requests, 'Full request was repeated');
        });
    endpointTest('legacy type=1 metadata receives exactly one full built-in fallback',
        function () use ($input, $request, $endpoint) {
            $legacy = preg_replace('/\?/', '?type=1&', $endpoint, 1);
            endpointExpect($legacy !== $endpoint, 'Test endpoint has no query');
            $legacyRequest = parseUrl::endpoint($legacy, $input);
            $GLOBALS['user'] = ['metadataApi' => $legacy];
            $http = new EndpointTestHttp();
            $http->responses['self ' . $legacyRequest] = ['data' => ['name' => 'Legacy series', 'episode' => 2]];
            $http->responses['self ' . $request] = endpointCatalogue();
            $result = (new VideoList($input, [], $http))->printR();
            endpointSame(200, $result['code'], 'Legacy metadata fallback failed');
            endpointSame('Legacy series', $result['data']['name'], 'Legacy title was not retained');
            endpointSame([['self', $legacyRequest], ['self', $request]], $http->requests,
                'Legacy metadata fallback made the wrong calls');
        });
    endpointTest('custom metadata adapter uses normal JSON and falls back to built-in catalogue',
        function () use ($input, $request) {
            $adapter = 'https://adapter.example/?url={url}&mode=metadata';
            $customRequest = parseUrl::endpoint($adapter, $input);
            $GLOBALS['user'] = ['metadataApi' => $adapter];
            $http = new EndpointTestHttp();
            $http->responses['json ' . $customRequest] = ['name' => 'Custom title', 'episode' => 2];
            $http->responses['self ' . $request] = endpointCatalogue();
            $result = (new VideoList($input, [], $http))->printR();
            endpointSame(200, $result['code'], 'Custom metadata fallback failed');
            endpointSame('Custom title', $result['data']['name'], 'Custom title was overwritten');
            endpointSame([['json', $customRequest], ['self', $request]], $http->requests, 'Adapter HTTP modes changed');
        });
    endpointTest('custom episode adapter returns playback without a built-in request', function () use ($input) {
        $adapter = 'https://adapter.example/?url=';
        $customRequest = parseUrl::endpoint($adapter, $input);
        $GLOBALS['user'] = ['metadataApi' => $adapter];
        $http = new EndpointTestHttp();
        $http->responses['json ' . $customRequest] = ['name' => 'Custom title', 'episode' => 2, 'episodes' => endpointEpisodes()];
        $result = json_decode((new VideoList($input, [], $http))->printR(2), true, 32, JSON_THROW_ON_ERROR);
        endpointSame(200, $result['code'], 'Custom episodes failed');
        endpointSame($input, $result['url'], 'Custom episode selection changed');
        endpointSame([['json', $customRequest]], $http->requests, 'Custom episodes unexpectedly queried built-in API');
    });
    endpointTest('direct media and plain titles make no metadata request', function () {
        foreach (['https://media.example/film.mp4?token=demo', 'Demo title'] as $input) {
            $http = new EndpointTestHttp();
            (new VideoList($input, [], $http))->printR();
            endpointSame([], $http->requests, 'Direct media or title made a metadata request');
        }
    });
    endpointTest('built-in errors redact endpoint and host from logs and do not retry',
        function () use ($input, $request, $endpoint, $host, $temporary) {
            $log = $temporary . '/redaction.log';
            ini_set('error_log', $log);
            try {
                $http = new EndpointTestHttp();
                $http->errors['self ' . $request] = new RuntimeException('Upstream request failed: ' . $request);
                $result = (new VideoList($input, [], $http))->printR();
                endpointSame(204, $result['code'], 'HTTP failure unexpectedly succeeded');
                endpointSame([['self', $request]], $http->requests, 'Failed built-in request was retried');
                $contents = is_file($log) ? file_get_contents($log) : '';
                endpointExpect(str_contains($contents, 'RuntimeException'), 'Failure class was not logged');
                endpointExpect(!str_contains($contents, $endpoint) && !str_contains($contents, $host),
                    'Built-in exception log contains the protected address');
                endpointExpect(!str_contains(json_encode($result, JSON_THROW_ON_ERROR), $host),
                    'Built-in exception response contains the protected host');
            } finally { ini_set('error_log', $temporary . '/suite.log'); }
        });

    $payload = require $applicationRoot . '/includes/Builtin.Endpoint.php';
    $variants = ['missing' => null, 'not-an-array' => 'invalid'];
    $variants['wrong-version'] = array_replace($payload, ['version' => 2]);
    $variants['short-nonce'] = array_replace($payload, ['nonce' => base64_encode(str_repeat('n', 11))]);
    $variants['short-tag'] = array_replace($payload, ['tag' => base64_encode(substr(base64_decode($payload['tag'], true), 0, 15))]);
    foreach (['tag', 'ciphertext', 'keyShareA', 'keyShareB'] as $field) {
        $variants['altered-' . $field] = array_replace($payload, [$field => endpointFlip($payload[$field])]);
    }
    $variants['invalid-base64'] = array_replace($payload, ['ciphertext' => '!invalid!']);
    $variants['empty-ciphertext'] = array_replace($payload, ['ciphertext' => '']);
    $fixtureKey = base64_decode($payload['keyShareA'], true) ^ base64_decode($payload['keyShareB'], true);
    foreach (['http://adapter.example/?url=', 'https://adapter.example/{url}'] as $index => $invalidUrl) {
        $nonce = random_bytes(12);
        $ciphertext = openssl_encrypt($invalidUrl, 'aes-256-gcm', $fixtureKey, OPENSSL_RAW_DATA,
            $nonce, $tag, BuiltinEndpoint::CONTEXT);
        endpointExpect(is_string($ciphertext), 'Could not prepare authenticated invalid-URL fixture');
        $variants['authenticated-invalid-url-' . ($index + 1)] = array_replace($payload, [
            'nonce' => base64_encode($nonce), 'tag' => base64_encode($tag), 'ciphertext' => base64_encode($ciphertext),
        ]);
    }
    unset($fixtureKey, $nonce, $tag, $ciphertext);
    foreach ($variants as $name => $variant) {
        endpointTest('isolated ' . $name . ' config fails closed and custom adapters still work',
            function () use ($name, $variant, $temporary, $applicationRoot, $endpoint, $host) {
                $fixture = $temporary . '/' . $name;
                mkdir($fixture . '/class', 0700, true);
                mkdir($fixture . '/includes', 0700, true);
                foreach (['Vinfo.Class.php', 'BuiltinEndpoint.php', 'Common.Class.php', 'Http.php', 'Security.php', 'Settings.php', 'Statistics.php', 'DanmakuFilter.php'] as $file) {
                    endpointExpect(copy($applicationRoot . '/class/' . $file, $fixture . '/class/' . $file),
                        'Could not copy isolated test classes');
                }
                if ($variant !== null) {
                    endpointExpect(file_put_contents($fixture . '/includes/Builtin.Endpoint.php',
                        "<?php\nreturn " . var_export($variant, true) . ";\n") !== false, 'Could not write isolated configuration');
                }
                $process = proc_open([PHP_BINARY, '-d', 'display_errors=0', __FILE__, '--fixture', $fixture],
                    [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
                endpointExpect(is_resource($process), 'Could not start isolated PHP process');
                fclose($pipes[0]);
                $stdout = stream_get_contents($pipes[1]); fclose($pipes[1]);
                $stderr = stream_get_contents($pipes[2]); fclose($pipes[2]);
                $status = proc_close($process);
                $report = json_decode($stdout, true);
                endpointExpect($status === 0 && ($report['ok'] ?? false) === true,
                    'Isolated configuration checks failed' . (isset($report['error']) ? ': ' . $report['error'] : ''));
                endpointSame('', $stderr, 'Isolated process unexpectedly wrote stderr');
                $log = is_file($fixture . '/fixture.log') ? file_get_contents($fixture . '/fixture.log') : '';
                endpointExpect(!str_contains($log, $endpoint) && !str_contains($log, $host),
                    'Damaged-configuration log contains the protected address');
            });
    }
} catch (Throwable $error) {
    $failed++;
    // Bootstrap failures may include third-party diagnostics, so report only type.
    $results[] = 'FAIL test bootstrap (' . get_class($error) . ')';
} finally {
    ini_set('error_log', $originalErrorLog);
    ini_set('log_errors', $originalLogErrors);
    if ($originalUserExists) $GLOBALS['user'] = $originalUser; else unset($GLOBALS['user']);
    endpointRemoveTemporary($temporary, $temporaryReal);
}
echo implode("\n", $results) . "\n\n" . (count($results) - $failed) . '/' . count($results) . " tests passed\n";
exit($failed === 0 ? 0 : 1);

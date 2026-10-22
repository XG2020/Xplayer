<?php
/** Offline web/JSON parser and local playback regressions. Run: php tests/web-parser.php */
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }

$applicationRoot = dirname(__DIR__);
$temporary = sys_get_temp_dir() . '/xplayer-web-parser-' . bin2hex(random_bytes(8));
if (!mkdir($temporary, 0700)) throw new RuntimeException('Could not create isolated parser test directory');
$confirmedTemporary = realpath($temporary);
define('XPLAYER_ROOT', $temporary);
require_once $applicationRoot . '/class/Common.Class.php';
require_once $applicationRoot . '/class/PlaybackResolver.php';

final class WebParserTestHttp extends Http
{
    public array $requests = [];
    public array $responses = [];
    public array $errors = [];
    public array $unexpected = [];

    public function get(string $url, int $limit = 2097152): array
    {
        $this->requests[] = [$url, $limit];
        if (isset($this->errors[$url])) throw $this->errors[$url];
        if (!array_key_exists($url, $this->responses)) {
            $this->unexpected[] = $url;
            throw new LogicException('Unexpected outbound request');
        }
        return $this->responses[$url];
    }

    public function json(string $url): array
    {
        $this->unexpected[] = 'json';
        throw new LogicException('Parser must inspect one bounded response instead of refetching JSON');
    }

    public function add(string $url, string $body, string $type = 'text/html', ?string $finalUrl = null): void
    {
        $this->responses[$url] = ['body' => $body, 'url' => $finalUrl ?? $url,
            'headers' => ['content-type' => $type], 'status' => 200];
    }

    public function urls(): array { return array_column($this->requests, 0); }
}

function webParserExpect(bool $condition, string $message): void
{
    if (!$condition) throw new RuntimeException($message);
}

function webParserSame($expected, $actual, string $message): void
{
    webParserExpect($expected === $actual, $message);
}

function webParserNoMedia(callable $operation, string $message): void
{
    try { $result = $operation(); }
    catch (InvalidArgumentException | RuntimeException $error) { return; }
    webParserExpect(!is_array($result) || empty($result['url']), $message);
}

/** Synthetic public-page envelope; no live endpoint values, keys or tokens are kept. */
function webParserEncryptedEnvelope(string $input, array $video = []): string
{
    $video = array_replace(['code' => 200, 'original_url' => $input,
        'url' => 'https://cdn.example/play?id=2', 'type' => 'm3u8'], $video);
    $key = bin2hex(random_bytes(8)); $iv = bin2hex(random_bytes(8));
    $encrypted = openssl_encrypt(json_encode(['video_info' => ['video' => $video]], JSON_THROW_ON_ERROR),
        'aes-128-cbc', $key, 0, $iv);
    webParserExpect(is_string($encrypted), 'Could not build a synthetic encrypted-page fixture');
    return $encrypted . $key . $iv;
}

function webParserEncryptedPage(string $envelope, ?string $script = null): string
{
    return '<div id="AlphaPlayer"></div><script id="TempScript">'
        . ($script ?? "let result = '" . $envelope . "';") . '</script>'
        . '<script src="/public/js/Utils.js"></script>'
        . '<script src="/public/js/player.js"></script>'
        . '<script src="/extend/crypto-js_4-1-1-min.js"></script>';
}

function webParserCleanup(string $root, string $confirmed): void
{
    $resolved = realpath($root);
    if ($resolved === false) return;
    if ($resolved !== $confirmed || !str_starts_with(basename($resolved), 'xplayer-web-parser-')) {
        throw new RuntimeException('Unsafe parser test cleanup target');
    }
    $entries = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($resolved, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST);
    foreach ($entries as $entry) {
        if ($entry->isLink()) { unlink($entry->getPathname()); continue; }
        $target = $entry->getRealPath();
        if ($target === false || !str_starts_with($target, $resolved . DIRECTORY_SEPARATOR)) {
            throw new RuntimeException('Unexpected path in parser test cleanup');
        }
        if ($entry->isDir()) rmdir($target); else unlink($target);
    }
    rmdir($resolved);
}

$passed = 0; $failed = 0;
function webParserTest(string $name, callable $test): void
{
    global $passed, $failed;
    try { $test(); $passed++; echo 'PASS ' . $name . "\n"; }
    catch (Throwable $error) { $failed++; echo 'FAIL ' . $name . ': ' . $error->getMessage() . "\n"; }
}

$originalLog = ini_get('error_log');
$originalLogErrors = ini_get('log_errors');
ini_set('error_log', $temporary . '/suite.log');
ini_set('log_errors', '1');
$GLOBALS['user'] = []; $GLOBALS['zyapi'] = [];
$input = 'https://video.example/watch/episode-2';
$request = 'https://parser.example/?url=' . rawurlencode($input);

try {
    webParserTest('flat JSON stays compatible even with a text response type', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '{"code":200,"url":"https://cdn.example/video.mp4","vid":"episode-2"}', 'text/plain');
        $result = (new PlaybackResolver($http))->resolve($request, $input);
        webParserSame('https://cdn.example/video.mp4', $result['url'] ?? '', 'JSON media URL changed');
        webParserSame('episode-2', $result['vid'] ?? '', 'JSON playback identity was lost');
        webParserSame([$request], $http->urls(), 'JSON response was fetched more than once');
    });

    webParserTest('nested JSON preserves extensionless HLS type and filters identities at playback', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '{"data":{"url":"https://cdn.example/play?id=2","type":"hls","vid":"valid-2","tvid":42,"videoId":"<unsafe>"}}', 'application/json');
        $result = (new parseUrl($input, ['https://parser.example/?url='], [], 0, false, '', $http))->start();
        webParserSame(200, $result['code'], 'Nested JSON was not accepted');
        webParserSame('hls', $result['type'], 'Extensionless HLS lost its media type');
        webParserSame(['vid' => 'valid-2', 'tvid' => '42'], $result['identity'], 'Identity validation changed');
    });

    webParserTest('video src resolves against the final redirected URL without damaging query signatures', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<video src="../media//episode.mp4?sig=a%2Fb&amp;token=x%2By"></video>',
            'text/html', 'https://parser.example/nested/player/index.html');
        $result = (new PlaybackResolver($http))->resolve($request, $input);
        webParserSame('https://parser.example/nested/media//episode.mp4?sig=a%2Fb&token=x%2By', $result['url'] ?? '',
            'Relative resolution or HTML entity decoding changed the signed URL');
        webParserSame([$request], $http->urls(), 'A media URL was fetched unnecessarily');
    });

    webParserTest('video source MIME carries extensionless HLS into the local player', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<video><source src="https://cdn.example/stream?id=2&amp;k=a%2Fb" type="application/vnd.apple.mpegurl"></video>');
        $result = (new parseUrl($input, ['https://parser.example/?url='], [], 0, false, '', $http))->start();
        webParserSame(200, $result['code'], 'HTML source was not accepted');
        webParserSame('https://cdn.example/stream?id=2&k=a%2Fb', $result['url'], 'HTML media was not returned to the local player');
        webParserSame('hls', $result['type'], 'Source MIME was not mapped to HLS');
    });

    webParserTest('literal player configuration handles escaped slashes and query ampersands', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<script>var player = {"url":"https:\\/\\/cdn.example\\/movie.m3u8?sig=x\\u0026token=y","type":"hls"};</script>');
        $result = (new PlaybackResolver($http))->resolve($request, $input);
        webParserSame('https://cdn.example/movie.m3u8?sig=x&token=y', $result['url'] ?? '', 'JavaScript string escapes were not decoded safely');
    });

    webParserTest('nested DPlayer configuration returns its declared media source', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<script>const dp = new DPlayer({container: document.getElementById("player"), video: {url: "https://cdn.example/dplayer.mpd", type: "dash"}});</script>');
        $result = (new PlaybackResolver($http))->resolve($request, $input);
        webParserSame('https://cdn.example/dplayer.mpd', $result['url'] ?? '', 'Nested player video URL was not extracted');
        webParserSame('dash', $result['type'] ?? '', 'Declared DASH type was lost');
    });

    webParserTest('MacCMS player URL encodings are decoded as data without evaluating script', function () use ($input, $request) {
        $media = 'https://cdn.example/maccms.m3u8?sig=a%2Fb&token=x%2By';
        foreach ([1 => rawurlencode($media), 2 => base64_encode($media)] as $encoding => $encoded) {
            $http = new WebParserTestHttp();
            $http->add($request, '<script>var player_aaaa = ' . json_encode(['encrypt' => $encoding, 'url' => $encoded], JSON_THROW_ON_ERROR) . ';</script>');
            $result = (new PlaybackResolver($http))->resolve($request, $input);
            webParserSame($media, $result['url'] ?? '', 'MacCMS encoding changed the media URL or its signed query');
        }
    });

    webParserTest('iframe wrapper is fetched as data and returns its media', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $child = 'https://parser.example/embed/player.html?id=2&mode=local';
        $http->add($request, '<iframe src="/embed/player.html?id=2&amp;mode=local"></iframe>');
        $http->add($child, '<video src="https://cdn.example/episode.webm"></video>');
        $result = (new PlaybackResolver($http))->resolve($request, $input);
        webParserSame('https://cdn.example/episode.webm', $result['url'] ?? '', 'Iframe media was not resolved');
        webParserSame([$request, $child], $http->urls(), 'Iframe traversal fetched unrelated resources');
    });

    webParserTest('poster, hyperlinks, comments and external scripts are not playable media', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<!-- <video src="https://cdn.example/comment.mp4"> -->'
            . '<video poster="https://cdn.example/poster.mp4"></video>'
            . '<a href="https://cdn.example/download.mp4">download</a>'
            . '<script src="https://script.example/player.js"></script>');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'Unrelated markup was accepted as media');
        webParserSame([$request], $http->urls(), 'Unrelated URLs or external scripts were fetched');
        webParserSame([], $http->unexpected, 'Unconfigured resources were requested');
    });

    webParserTest('dynamic JavaScript and concatenated URLs are not executed or partially accepted', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<script>fetch("https://dynamic.example/resolve");'
            . 'var player = {url: "https://cdn.example/partial.mp4" + window.token};</script>');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'A dynamic expression was treated as a literal media URL');
        webParserSame([$request], $http->urls(), 'Dynamic script caused an outbound request');
        webParserSame([], $http->unexpected, 'Dynamic script resources were requested');
    });

    webParserTest('player configurations mentioned in JavaScript comments and strings are ignored', function () use ($input, $request) {
        foreach ([
            '<script>// var player = {url:"https://cdn.example/comment.mp4"};</script>',
            '<script>/* var player = {url:"https://cdn.example/comment.mp4"}; */</script>',
            '<script>const help = \'var player = {url:"https://cdn.example/example.mp4"};\';</script>',
        ] as $body) {
            $http = new WebParserTestHttp(); $http->add($request, $body);
            webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'Inactive example configuration was accepted as media');
            webParserSame([$request], $http->urls(), 'Inactive script contents caused a request');
        }
    });

    webParserTest('skipped templates and regular expressions cannot introduce fake URL fields', function () use ($input, $request) {
        foreach ([
            '<script>var player = {unused: `x,url:"https://cdn.example/template.mp4"}`};</script>',
            '<script>var player = {unused: /x,url:"https:\\/\\/cdn.example\\/regexp.mp4"}/};</script>',
        ] as $body) {
            $http = new WebParserTestHttp(); $http->add($request, $body);
            webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'Unsupported literal contents became a player URL');
            webParserSame([$request], $http->urls(), 'Skipped expression triggered a request');
        }
    });

    webParserTest('a returned regular expression cannot impersonate player configuration', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<script>function f(){return /player = {url:\'https:\\/\\/cdn.example\\/phantom.mp4\'}/;}</script>');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'A returned regular expression was treated as live configuration');
        webParserSame([$request], $http->urls(), 'Regular expression contents caused an outbound request');
    });

    webParserTest('nested template strings cannot expose phantom player configuration', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<script>const note = `a${`player = {url:\'https://cdn.example/phantom.mp4\'}`}`;</script>');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'Nested template text was treated as live configuration');
        webParserSame([$request], $http->urls(), 'Template contents caused an outbound request');
    });

    webParserTest('division in an unrelated field does not hide a literal media URL', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<script>var player = {volume: 1 / 2, url:"https://cdn.example/real.mp4"};</script>');
        $result = (new PlaybackResolver($http))->resolve($request, $input);
        webParserSame('https://cdn.example/real.mp4', $result['url'] ?? '', 'Division was mistaken for a regular expression');
    });

    webParserTest('Unicode surrogate pairs are preserved completely or the URL is rejected', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<script>var player = {url:"https://cdn.example/unicode.mp4?token=abc\\uD83D\\uDE00def"};</script>');
        try { $result = (new PlaybackResolver($http))->resolve($request, $input); }
        catch (InvalidArgumentException | RuntimeException $error) { return; }
        if (!empty($result['url'])) {
            webParserSame("https://cdn.example/unicode.mp4?token=abc\u{1F600}def", $result['url'],
                'Unicode decoding silently removed part of a signed URL');
        }
    });

    webParserTest('a lone Unicode surrogate invalidates the media URL', function () use ($input, $request) {
        foreach (['\\uD83D', '\\uDE00'] as $surrogate) {
            $http = new WebParserTestHttp();
            $http->add($request, '<script>var player = {url:"https://cdn.example/unicode.mp4?token=abc' . $surrogate . 'def"};</script>');
            webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'A malformed Unicode string produced a truncated media URL');
        }
    });

    webParserTest('a dynamic duplicate field replaces an earlier literal URL instead of leaving stale media', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<script>var player = {url:"https://cdn.example/stale.mp4", url: window.resolvedMedia};</script>');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'An overwritten URL was accepted as active media');
    });

    webParserTest('explicitly typed dynamic-looking media path is accepted as a stream', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<script>var player = {url:"https://cdn.example/stream.php?token=2",type:"hls"};</script>');
        $result = (new PlaybackResolver($http))->resolve($request, $input);
        webParserSame('https://cdn.example/stream.php?token=2', $result['url'] ?? '', 'A declared HLS stream was mistaken for a webpage');
        webParserSame('hls', $result['type'] ?? '', 'A typed PHP stream lost HLS playback');
    });

    webParserTest('known token player protocol requests its same-origin JSON result without fetching scripts', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $finalPage = 'https://parser.example/nested/index.php?source=2';
        $token = 'fixture-token+signed/value=';
        $tokenRequest = 'https://parser.example/nested/api/resolve.php?token=' . rawurlencode($token);
        $http->add($request, '<script>const playerConfig = ' . json_encode(['videoUrl' => $input, 'apiToken' => $token], JSON_THROW_ON_ERROR)
            . ';</script><script src="assets/player.js"></script>', 'text/html', $finalPage);
        $http->add($tokenRequest, '{"code":200,"data":{"url":"https://cdn.example/token-stream?id=2","type":"hls","videoId":"token-2"}}', 'application/json');
        $result = (new PlaybackResolver($http))->resolve($request, $input);
        webParserSame('https://cdn.example/token-stream?id=2', $result['url'] ?? '', 'Token result was not returned');
        webParserSame('hls', $result['type'] ?? '', 'Token result lost its media type');
        webParserSame('token-2', $result['videoId'] ?? '', 'Token result lost playback identity');
        webParserSame([$request, $tokenRequest], $http->urls(), 'Token flow fetched scripts, the input or another origin');
        webParserSame([], $http->unexpected, 'Token flow contacted an unconfigured resource');
    });

    webParserTest('token request remains at the final page origin despite a different HTML base', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $token = 'same-origin-fixture';
        $tokenRequest = 'https://parser.example/api/resolve.php?token=' . $token;
        $http->add($request, '<base href="https://unrelated.example/">'
            . '<script>const playerConfig = ' . json_encode(['videoUrl' => $input, 'apiToken' => $token], JSON_THROW_ON_ERROR)
            . ';</script><script src="https://parser.example/assets/player.js"></script>');
        $http->add($tokenRequest, '{"code":200,"url":"https://cdn.example/token-base.mp4"}', 'application/json');
        $result = (new PlaybackResolver($http))->resolve($request, $input);
        webParserSame('https://cdn.example/token-base.mp4', $result['url'] ?? '', 'Token flow ignored an explicit matching player script');
        webParserSame([$request, $tokenRequest], $http->urls(), 'Token escaped the final page origin');
    });

    webParserTest('token protocol requires both input identity and matching player script', function () use ($input, $request) {
        foreach ([
            ['https://video.example/watch/other', 'assets/player.js'],
            [$input, 'https://unrelated.example/assets/player.js'],
            [$input, 'assets/unrelated.js'],
        ] as [$video, $script]) {
            $http = new WebParserTestHttp();
            $http->add($request, '<script>const playerConfig = ' . json_encode(['videoUrl' => $video, 'apiToken' => 'fixture-token'], JSON_THROW_ON_ERROR)
                . ';</script><script src="' . $script . '"></script>');
            webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'An unrelated token configuration was accepted');
            webParserSame([$request], $http->urls(), 'An unproven token protocol was requested');
            webParserSame([], $http->unexpected, 'Token or script was sent to an unrelated endpoint');
        }
    });

    webParserTest('failed token API status is not overridden by a URL in its body', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<script>const playerConfig = ' . json_encode(['videoUrl' => $input, 'apiToken' => 'failed-token'], JSON_THROW_ON_ERROR)
            . ';</script><script src="assets/player.js"></script>');
        $http->add('https://parser.example/api/resolve.php?token=failed-token',
            '{"code":500,"msg":"Unavailable","url":"https://cdn.example/stale.mp4"}', 'application/json');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'Failed token response was accepted as success');
    });

    webParserTest('encrypted AlphaPlayer HTML feeds its declared stream into the local player', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, webParserEncryptedPage(webParserEncryptedEnvelope($input, ['vid' => 'encrypted-2'])));
        $result = (new parseUrl($input, ['https://parser.example/?url='], [], 0, false, '', $http))->start();
        webParserSame(200, $result['code'], 'Encrypted HTML result was not accepted');
        webParserSame('https://cdn.example/play?id=2', $result['url'], 'Encrypted result did not reach the local player');
        webParserSame('hls', $result['type'], 'Encrypted extensionless HLS lost its declared type');
        webParserSame(['vid' => 'encrypted-2'], $result['identity'], 'Encrypted playback identity was lost');
        webParserSame([$request], $http->urls(), 'Encrypted HTML fetched remote scripts or another resource');
        webParserSame([], $http->unexpected, 'Encrypted HTML attempted an unconfigured outbound request');
    });

    webParserTest('encrypted HTML requires its DOM identifiers and all matching same-origin scripts', function () use ($input, $request) {
        $page = webParserEncryptedPage(webParserEncryptedEnvelope($input));
        $variants = [
            str_replace('id="AlphaPlayer"', 'id="DifferentPlayer"', $page),
            str_replace('id="TempScript"', 'id="DifferentScript"', $page),
            str_replace('src="/public/js/player.js"', 'src="https://unrelated.example/public/js/player.js"', $page),
        ];
        foreach (['/public/js/Utils.js', '/public/js/player.js', '/extend/crypto-js_4-1-1-min.js'] as $path) {
            $variants[] = str_replace('<script src="' . $path . '"></script>', '', $page);
        }
        foreach ($variants as $body) {
            $http = new WebParserTestHttp(); $http->add($request, $body);
            webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input),
                'An unrelated or incomplete encrypted player was accepted');
            webParserSame([$request], $http->urls(), 'Fingerprint checking fetched remote scripts');
            webParserSame([], $http->unexpected, 'Fingerprint checking made an unexpected request');
        }
    });

    webParserTest('malformed encrypted HTML falls through to the next configured parser', function () use ($input) {
        $broken = 'https://encrypted.example/?url='; $working = 'https://backup.example/?url=';
        $brokenRequest = parseUrl::endpoint($broken, $input); $workingRequest = parseUrl::endpoint($working, $input);
        $http = new WebParserTestHttp();
        $http->add($brokenRequest, webParserEncryptedPage('malformed-envelope'));
        $http->add($workingRequest, '{"url":"https://cdn.example/after-encrypted.mp4"}', 'application/json');
        $result = (new parseUrl($input, [$broken, $working], [], 0, false, '', $http))->start();
        webParserSame(200, $result['code'], 'Malformed encrypted HTML prevented configured fallback');
        webParserSame('https://cdn.example/after-encrypted.mp4', $result['url'], 'Malformed envelope was mistaken for playable data');
        webParserSame([$brokenRequest, $workingRequest], $http->urls(), 'Encrypted parser fallback order changed');
        webParserSame([], $http->unexpected, 'Malformed encrypted HTML fetched remote scripts');
    });

    webParserTest('encrypted results for another video or failed status cannot report playback success', function () use ($input, $request) {
        foreach ([['original_url' => 'https://video.example/watch/other'], ['code' => 500]] as $override) {
            $http = new WebParserTestHttp();
            $http->add($request, webParserEncryptedPage(webParserEncryptedEnvelope($input, $override)));
            $result = (new parseUrl($input, ['https://parser.example/?url='], [], 0, false, '', $http))->start();
            webParserSame(100, $result['code'], 'Mismatched or failed encrypted response reported success');
            webParserExpect(!isset($result['url']), 'Mismatched or failed encrypted media reached the player');
            webParserSame([$request], $http->urls(), 'Rejected encrypted result caused an extra request');
        }
    });

    webParserTest('encrypted result examples in comments and strings are not active payloads', function () use ($input, $request) {
        $envelope = webParserEncryptedEnvelope($input);
        foreach ([
            "// let result = '" . $envelope . "';",
            "/* let result = '" . $envelope . "'; */",
            'const help = "let result = \'' . $envelope . '\';";',
        ] as $script) {
            $http = new WebParserTestHttp(); $http->add($request, webParserEncryptedPage($envelope, $script));
            webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'An inactive encrypted result example was accepted');
            webParserSame([$request], $http->urls(), 'Inactive encrypted result text caused an extra request');
        }
    });

    webParserTest('encrypted results must be one unambiguous literal assignment', function () use ($input, $request) {
        $envelope = webParserEncryptedEnvelope($input);
        $bodies = [
            webParserEncryptedPage($envelope, "let result = '" . $envelope . "' + window.extra;"),
            webParserEncryptedPage($envelope, "let result = '" . $envelope . "'; result = window.replacement;"),
            webParserEncryptedPage($envelope) . '<script id="TempScript">let result = \'' . $envelope . '\';</script>',
        ];
        foreach ($bodies as $body) {
            $http = new WebParserTestHttp(); $http->add($request, $body);
            webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'An ambiguous or dynamic encrypted assignment was accepted');
            webParserSame([$request], $http->urls(), 'Ambiguous encrypted results caused an extra request');
        }
    });

    webParserTest('echoed original platform URL cannot report a successful parse', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, json_encode(['url' => $input], JSON_THROW_ON_ERROR), 'application/json');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'The original webpage was accepted as a medium');
    });

    webParserTest('iframe query containing the original input is never returned as a media URL', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $child = 'https://parser.example/embed?url=' . rawurlencode($input);
        $http->add($request, '<iframe src="' . $child . '"></iframe>');
        $http->add($child, '<p>Loading requires JavaScript.</p>');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'Iframe or encoded original URL was returned as playable');
        webParserExpect(count($http->requests) <= 2, 'An iframe without media was repeatedly fetched');
        webParserSame([], $http->unexpected, 'Original platform page was requested');
    });

    webParserTest('iframe pointing back to the original input with a fragment is never fetched', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<iframe src="' . $input . '#player"></iframe>');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'An original-page iframe was accepted as media');
        webParserSame([$request], $http->urls(), 'A fragment bypassed original input identity checking');
        webParserSame([], $http->unexpected, 'Original platform page was requested');
    });

    webParserTest('non-HTTP and credential URLs are refused', function () use ($input, $request) {
        foreach (['javascript:alert(1)', 'data:video/mp4;base64,AAAA', 'file:///video.mp4', 'https://user:pass@cdn.example/video.mp4'] as $media) {
            $http = new WebParserTestHttp();
            $http->add($request, '<video src="' . htmlspecialchars($media, ENT_QUOTES, 'UTF-8') . '"></video>');
            webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'An unsafe media URL was accepted');
            webParserSame([$request], $http->urls(), 'Unsafe resource was fetched');
        }
    });

    webParserTest('iframe cycles stop without repeatedly fetching a page', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $child = 'https://parser.example/loop';
        $http->add($request, '<iframe src="' . $child . '"></iframe>');
        $http->add($child, '<iframe src="' . htmlspecialchars($request, ENT_QUOTES, 'UTF-8') . '"></iframe>');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'An iframe cycle unexpectedly returned media');
        webParserSame(count(array_unique($http->urls())), count($http->urls()), 'An iframe cycle caused repeated requests');
    });

    webParserTest('iframe fanout is bounded and every fetch requests a bounded body', function () use ($input, $request) {
        $http = new WebParserTestHttp(); $body = '';
        for ($index = 0; $index < 30; $index++) {
            $child = 'https://parser.example/frame/' . $index;
            $body .= '<iframe src="' . $child . '"></iframe>';
            $http->add($child, '<p>No media.</p>');
        }
        $http->add($request, $body);
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'An empty iframe returned media');
        webParserExpect(count($http->requests) <= 3, 'One configured endpoint caused unbounded iframe requests');
        foreach ($http->requests as [$url, $limit]) webParserExpect($limit > 0 && $limit <= 2097152, 'A response body limit was missing or excessive');
    });

    webParserTest('overlarge responses are rejected even when an injected transport omits its guard', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, str_repeat(' ', 2097153) . '<video src="https://cdn.example/large.mp4"></video>');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'An overlarge document was parsed');
    });

    webParserTest('cumulative iframe response size is bounded', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $child = 'https://parser.example/large-one';
        $last = 'https://parser.example/large-two';
        $padding = str_repeat(' ', 1500000);
        $http->add($request, $padding . '<iframe src="' . $child . '"></iframe>');
        $http->add($child, $padding . '<iframe src="' . $last . '"></iframe>');
        $http->add($last, $padding . '<video src="https://cdn.example/over-budget.mp4"></video>');
        webParserNoMedia(fn() => (new PlaybackResolver($http))->resolve($request, $input), 'The cumulative document budget was bypassed');
        webParserExpect(count($http->requests) <= 3, 'The traversal fetched excessive pages');
    });

    webParserTest('existing public-address guard rejects loopback, private and mapped IPv6', function () {
        foreach (['127.0.0.1', '10.0.0.1', '192.168.1.1', '169.254.169.254', '::1', '::ffff:127.0.0.1', '2001:db8::1'] as $address) {
            webParserSame(false, Http::publicIp($address), 'A nonpublic address passed the outbound guard');
        }
        webParserSame(true, Http::publicIp('93.184.216.34'), 'A public address was rejected');
    });

    webParserTest('failed dedicated endpoint falls back to the next configured HTML endpoint', function () use ($input) {
        $http = new WebParserTestHttp();
        $dedicated = 'https://dedicated.example/?url=';
        $general = 'https://general.example/?url=';
        $dedicatedRequest = parseUrl::endpoint($dedicated, $input);
        $generalRequest = parseUrl::endpoint($general, $input);
        $http->add($dedicatedRequest, '<p>Unavailable</p>');
        $http->add($generalRequest, '<video src="https://cdn.example/fallback.mp4"></video>');
        $result = (new parseUrl($input, [$general], ['video.example|' . $dedicated], 0, false, '', $http))->start();
        webParserSame(200, $result['code'], 'Configured fallback failed');
        webParserSame('https://cdn.example/fallback.mp4', $result['url'], 'Wrong fallback result');
        webParserSame([$dedicatedRequest, $generalRequest], $http->urls(), 'Dedicated/general order changed');
    });

    webParserTest('parser failures are visible and never sent to the local player as webpages', function () use ($input, $request) {
        $http = new WebParserTestHttp();
        $http->add($request, '<html><p>Player requires an unsupported script.</p></html>');
        $result = (new parseUrl($input, ['https://parser.example/?url='], [], 0, false, '', $http))->start();
        webParserSame(100, $result['code'], 'An unresolved page was reported as success');
        webParserExpect(!isset($result['url']), 'An unresolved page was returned to the video element');
        webParserExpect(is_string($result['msg'] ?? null) && $result['msg'] !== '', 'Failed parser has no user-facing explanation');
    });

    webParserTest('transport failure still allows the next configured parser', function () use ($input) {
        $http = new WebParserTestHttp();
        $broken = 'https://broken.example/?url=';
        $working = 'https://working.example/?url=';
        $brokenRequest = parseUrl::endpoint($broken, $input);
        $workingRequest = parseUrl::endpoint($working, $input);
        $http->errors[$brokenRequest] = new RuntimeException('Fixture connection failure');
        $http->add($workingRequest, '{"url":"https://cdn.example/backup.mp4"}', 'application/json');
        $result = (new parseUrl($input, [$broken, $working], [], 0, false, '', $http))->start();
        webParserSame(200, $result['code'], 'A failed transport prevented fallback');
        webParserSame('https://cdn.example/backup.mp4', $result['url'], 'Fallback returned the wrong media');
        webParserSame([$brokenRequest, $workingRequest], $http->urls(), 'Fallback order changed after a network error');
    });

    webParserTest('successful cache retains media type and identity without refetching', function () use ($input) {
        $endpoint = 'https://cache.example/?url=';
        $request = parseUrl::endpoint($endpoint, $input);
        $http = new WebParserTestHttp();
        $http->add($request, '{"url":"https://cdn.example/cached?id=2","type":"hls","vid":"cached-2"}', 'application/json');
        $first = (new parseUrl($input, [$endpoint], [], 300, false, '', $http))->start();
        $second = (new parseUrl($input, [$endpoint], [], 300, false, '', $http))->start();
        webParserSame(200, $first['code'], 'Fresh parser result failed');
        webParserSame($first, $second, 'Cached playback lost its URL, type or identity');
        webParserSame('hls', $second['type'], 'Cached extensionless HLS fell back to auto');
        webParserSame(['vid' => 'cached-2'], $second['identity'], 'Cached playback identity changed');
        webParserSame([$request], $http->urls(), 'A successful cached result was refetched');
    });

    webParserTest('extensionless HLS uses a signed local manifest when forwarding is enabled', function () use ($input) {
        $endpoint = 'https://signed.example/?url=';
        $request = parseUrl::endpoint($endpoint, $input);
        $http = new WebParserTestHttp();
        $http->add($request, '<video><source src="https://cdn.example/manifest?id=2" type="application/x-mpegURL"></video>');
        $key = str_repeat('web-parser-test-', 3);
        $result = (new parseUrl($input, [$endpoint], [], 0, true, $key, $http))->start();
        webParserSame(200, $result['code'], 'Signed HTML parsing failed');
        webParserSame('hls', $result['type'], 'Signed HLS type was lost');
        webParserExpect(str_starts_with($result['url'], 'api.php?type=m3u8&vkey='), 'HLS forwarding did not use the local endpoint');
        parse_str((string) parse_url($result['url'], PHP_URL_QUERY), $query);
        webParserSame('https://cdn.example/manifest?id=2', Security::readToken($query['vkey'], 'playlist', $key),
            'Signed manifest points to the wrong resource');
    });

    webParserTest('direct media bypasses parsing services', function () {
        $http = new WebParserTestHttp();
        $result = (new parseUrl('https://cdn.example/direct.mpd?token=abc', ['https://parser.example/?url='], [], 0, false, '', $http))->start();
        webParserSame(200, $result['code'], 'Direct media failed');
        webParserSame('dash', $result['type'], 'Direct DASH type changed');
        webParserSame([], $http->urls(), 'Direct media called a parser');
    });
} finally {
    ini_set('error_log', $originalLog);
    ini_set('log_errors', $originalLogErrors);
    webParserCleanup($temporary, $confirmedTemporary);
}

echo "\n" . $passed . '/' . ($passed + $failed) . " tests passed\n";
exit($failed ? 1 : 0);

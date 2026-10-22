<?php
/** Offline envelope regressions. Run: php tests/encrypted-player-result.php */
if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
require_once dirname(__DIR__) . '/class/EncryptedPlayerResult.php';
if (!function_exists('openssl_encrypt')) throw new RuntimeException('These tests require OpenSSL');

function encryptedFixture($data, bool $json = true): string
{
    $key = 'fixture-key-0001'; $iv = 'fixture-iv-00001';
    $plain = $json ? json_encode($data, JSON_THROW_ON_ERROR) : $data;
    $ciphertext = openssl_encrypt($plain, 'aes-128-cbc', $key, 0, $iv);
    if (!is_string($ciphertext)) throw new RuntimeException('Could not encrypt fixture');
    return $ciphertext . $key . $iv;
}

$passed = 0; $failed = 0;
function encryptedTest(string $name, callable $test): void
{
    global $passed, $failed;
    try { $test(); $passed++; echo 'PASS ' . $name . "\n"; }
    catch (Throwable $error) { $failed++; echo 'FAIL ' . $name . ': ' . $error->getMessage() . "\n"; }
}
function encryptedExpect(bool $value, string $message): void
{
    if (!$value) throw new RuntimeException($message);
}

$input = 'https://video.example/watch/episode-20';
$video = ['code' => 200, 'original_url' => $input, 'url' => 'https://cdn.example/episode.m3u8?sig=a%2Fb&part=20',
    'type' => 'm3u8', 'title' => 'Example', 'episode' => '20', 'vid' => 'valid-20', 'tvid' => 42,
    'videoId' => '<unsafe>', 'routes' => [['url' => 'https://cdn.example/other.m3u8']]];
$data = ['app_config' => ['key' => 'irrelevant-fixture-value'], 'video_info' => ['video' => $video], 'icons' => []];
$envelope = encryptedFixture($data);

encryptedTest('the public envelope yields only its matching primary medium and safe identity', function () use ($input, $envelope, $video) {
    $result = EncryptedPlayerResult::decode($envelope, $input);
    encryptedExpect($result === ['url' => $video['url'], 'type' => 'm3u8', 'vid' => 'valid-20', 'tvid' => '42'],
        'Media URL, type, identity, or output field filtering changed');
});

encryptedTest('malformed and noncanonical base64 cannot become a result', function () use ($input, $envelope) {
    $suffix = substr($envelope, -32); $encoded = substr($envelope, 0, -32);
    foreach (['', 'tiny', '!!!!' . $suffix, "\n" . $envelope, substr($encoded, 1) . $suffix,
        $encoded . '=' . $suffix, base64_encode(str_repeat('x', 17)) . $suffix] as $bad) {
        encryptedExpect(EncryptedPlayerResult::decode($bad, $input) === null, 'Malformed envelope was accepted');
    }
});

encryptedTest('wrong keys, control bytes, and oversized envelopes are refused', function () use ($input, $envelope) {
    foreach ([substr($envelope, 0, -32) . str_repeat('z', 32), substr($envelope, 0, -1) . "\0",
        str_repeat('A', 262145)] as $bad) {
        encryptedExpect(EncryptedPlayerResult::decode($bad, $input) === null, 'Invalid key or bound was ignored');
    }
});

encryptedTest('decrypted data must be a bounded JSON object with the required video shape', function () use ($input) {
    foreach ([encryptedFixture('not JSON', false), encryptedFixture(['video_info' => 'invalid']),
        encryptedFixture(['video_info' => ['video' => 'invalid']]), encryptedFixture(['url' => 'https://cdn.example/video.mp4']),
        encryptedFixture(str_repeat('[', 40) . '0' . str_repeat(']', 40), false)] as $bad) {
        encryptedExpect(EncryptedPlayerResult::decode($bad, $input) === null, 'Invalid JSON shape or depth was accepted');
    }
});

encryptedTest('failure codes and unrelated input cannot report successful playback', function () use ($input, $data) {
    foreach ([['code' => 500], ['code' => '200'], ['code' => true], ['original_url' => 'https://video.example/watch/other'],
        ['original_url' => $input . '#other'], ['original_url' => null]] as $override) {
        $changed = $data; $changed['video_info']['video'] = array_replace($changed['video_info']['video'], $override);
        encryptedExpect(EncryptedPlayerResult::decode(encryptedFixture($changed), $input) === null, 'Wrong video identity or status was accepted');
    }
});

encryptedTest('reflected input and non-HTTP, relative, credential, or malformed output URLs are refused', function () use ($input, $data) {
    foreach ([$input, $input . '#play', '/video.m3u8', 'javascript:alert(1)', 'file:///video.mp4',
        'https://user:pass@cdn.example/video.mp4', "https://cdn.example/video.mp4\n", ['url' => 'https://cdn.example/video.mp4']] as $url) {
        $changed = $data; $changed['video_info']['video']['url'] = $url;
        encryptedExpect(EncryptedPlayerResult::decode(encryptedFixture($changed), $input) === null, 'Unplayable or unsafe URL was accepted');
    }
});

encryptedTest('extensionless media preserves its declared type', function () use ($input, $data) {
    $changed = $data; $changed['video_info']['video']['url'] = 'https://cdn.example/play?id=20';
    $changed['video_info']['video']['type'] = 'application/vnd.apple.mpegurl';
    $result = EncryptedPlayerResult::decode(encryptedFixture($changed), $input);
    encryptedExpect(($result['type'] ?? '') === 'application/vnd.apple.mpegurl', 'Extensionless source type was discarded');
});

encryptedTest('malformed optional type is ignored and routes never replace the primary result', function () use ($input, $data, $video) {
    foreach ([['bad'], "hls\n<script>", str_repeat('x', 129)] as $type) {
        $changed = $data; $changed['video_info']['video']['type'] = $type;
        $result = EncryptedPlayerResult::decode(encryptedFixture($changed), $input);
        encryptedExpect(($result['url'] ?? '') === $video['url'] && ($result['type'] ?? null) === '', 'Optional metadata changed playback');
    }
    $changed = $data; unset($changed['video_info']['video']['url']);
    encryptedExpect(EncryptedPlayerResult::decode(encryptedFixture($changed), $input) === null, 'A route silently replaced a missing primary URL');
});

echo "\n" . $passed . '/' . ($passed + $failed) . " tests passed\n";
exit($failed ? 1 : 0);

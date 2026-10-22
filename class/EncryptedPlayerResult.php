<?php
/** Decode the public AlphaPlayer configuration envelope as data, never as JavaScript. */
require_once __DIR__ . '/Http.php';

final class EncryptedPlayerResult
{
    public static function decode(string $envelope, string $input): ?array
    {
        $length = strlen($envelope);
        if ($length < 56 || $length > 262144 || !Http::validUrl($input) ||
            !function_exists('openssl_decrypt')) return null;

        // The public page appends its 16-byte UTF-8 key and IV to a base64 ciphertext.
        // Only the observed ASCII envelope is supported; no keys are fetched or retained.
        $suffix = substr($envelope, -32);
        if (!preg_match('/\A[\x21-\x7e]{32}\z/', $suffix)) return null;
        $encoded = substr($envelope, 0, -32);
        if (strlen($encoded) % 4 !== 0 || !preg_match('~\A[A-Za-z0-9+/]+={0,2}\z~', $encoded)) return null;
        $ciphertext = base64_decode($encoded, true);
        if (!is_string($ciphertext) || strlen($ciphertext) < 16 || strlen($ciphertext) % 16 !== 0 ||
            base64_encode($ciphertext) !== $encoded) return null;

        $plain = openssl_decrypt($ciphertext, 'aes-128-cbc', substr($suffix, 0, 16),
            OPENSSL_RAW_DATA, substr($suffix, 16));
        if (!is_string($plain)) return null;
        $data = json_decode($plain, true, 32);
        $video = is_array($data) && is_array($data['video_info'] ?? null) ?
            ($data['video_info']['video'] ?? null) : null;
        if (!is_array($video) || ($video['code'] ?? null) !== 200 ||
            ($video['original_url'] ?? null) !== $input || !Http::validUrl($video['url'] ?? null)) return null;
        $url = $video['url'];
        if (explode('#', $url, 2)[0] === explode('#', $input, 2)[0]) return null;

        $type = $video['type'] ?? '';
        $result = ['url' => $url, 'type' => is_string($type) &&
            preg_match('~\A[A-Za-z0-9.+/-]{1,128}\z~', $type) ? $type : ''];
        foreach (['vid', 'tvid', 'videoId'] as $field) {
            $value = $video[$field] ?? null;
            if ((is_string($value) || is_int($value)) && preg_match('/\A[A-Za-z0-9_=-]{1,128}\z/', (string) $value)) {
                $result[$field] = (string) $value;
            }
        }
        return $result;
    }
}

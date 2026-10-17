<?php
require_once __DIR__ . '/Http.php';

/**
 * Conceals the bundled endpoint from plain-text source searches.
 * The shipped key shares allow unattended deployment, not secrecy from someone
 * who can execute or modify this PHP code. Upstream authorization is separate.
 */
final class BuiltinEndpoint
{
    public const CONTEXT = 'Xplayer/builtin-endpoint/v1';

    public static function url(): string
    {
        static $endpoint = null;
        if ($endpoint !== null) return $endpoint;
        if (!function_exists('openssl_decrypt')) throw new RuntimeException('内置接口需要 OpenSSL 扩展');
        $file = __DIR__ . '/../includes/Builtin.Endpoint.php';
        if (!is_file($file) || !is_readable($file)) throw new RuntimeException('内置接口配置不可用');
        $data = require $file;
        if (!is_array($data) || ($data['version'] ?? null) !== 1) throw new RuntimeException('内置接口配置版本无效');
        $bytes = [];
        foreach (['nonce' => 12, 'tag' => 16, 'keyShareA' => 32, 'keyShareB' => 32, 'ciphertext' => null] as $field => $length) {
            $value = $data[$field] ?? null;
            if (!is_string($value) || strlen($value) > 16000) throw new RuntimeException('内置接口配置格式无效');
            $decoded = base64_decode($value, true);
            if ($decoded === false || ($length !== null && strlen($decoded) !== $length) ||
                ($length === null && ($decoded === '' || strlen($decoded) > 12000))) {
                throw new RuntimeException('内置接口配置格式无效');
            }
            $bytes[$field] = $decoded;
        }
        $key = $bytes['keyShareA'] ^ $bytes['keyShareB'];
        $value = openssl_decrypt($bytes['ciphertext'], 'aes-256-gcm', $key, OPENSSL_RAW_DATA,
            $bytes['nonce'], $bytes['tag'], self::CONTEXT);
        unset($key, $bytes, $data);
        // Never fall back to a plain-text default after authentication failure.
        if (!is_string($value) || !self::validTemplate($value)) throw new RuntimeException('内置接口配置校验失败');
        $endpoint = $value;
        return $endpoint;
    }

    public static function validTemplate(string $url): bool
    {
        $probe = str_replace('{url}', 'https%3A%2F%2Fexample.com', $url);
        $parts = parse_url($probe);
        return Http::validUrl($probe) && is_array($parts) && strtolower($parts['scheme'] ?? '') === 'https' &&
            ($parts['port'] ?? 443) === 443 && !isset($parts['fragment']) && isset($parts['query']) &&
            (substr_count($url, '{url}') === 1 && str_contains((string) parse_url($url, PHP_URL_QUERY), '{url}') ||
                (strpos($url, '{url}') === false && str_ends_with($url, '=')));
    }

    public static function matchesRequest(string $url): bool
    {
        if (!Http::validUrl($url)) return false;
        try {
            $expected = parse_url(self::url());
        } catch (Throwable $error) {
            // A damaged bundled configuration must not prevent custom adapters from working.
            return false;
        }
        $parts = parse_url($url);
        return strtolower($parts['scheme'] ?? '') === 'https' && ($parts['port'] ?? 443) === 443 &&
            strtolower($parts['host'] ?? '') === strtolower($expected['host']) &&
            rtrim($parts['path'] ?? '', '/') === rtrim($expected['path'] ?? '', '/');
    }
}

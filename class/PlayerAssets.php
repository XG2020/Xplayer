<?php
/** URLs for shipped public assets only; application requests stay on the site. */
final class PlayerAssets
{
    public const CDN_ORIGIN = 'https://cdn.jsdelivr.net';
    private const REPOSITORY = '/gh/XG2020/Xplayer@';

    public static function base(array $user): string
    {
        if (!in_array($user['cdnEnabled'] ?? 0, [1, '1', true], true)) return '';
        $ref = $user['cdnRef'] ?? 'main';
        if (!is_string($ref) || !preg_match('/\A[A-Za-z0-9][A-Za-z0-9._-]{0,127}\z/', $ref)) $ref = 'main';
        return self::CDN_ORIGIN . self::REPOSITORY . $ref . '/';
    }

    public static function url(string $path, array $user): string
    {
        if (!preg_match('~\Aassets/(?:[A-Za-z0-9_-][A-Za-z0-9._-]*/)*[A-Za-z0-9_-][A-Za-z0-9._-]*\z~', $path)) {
            throw new InvalidArgumentException('不支持的静态资源路径');
        }
        $base = self::base($user);
        if ($base !== '') return $base . $path;
        $file = dirname(__DIR__) . '/' . $path;
        return $path . (is_file($file) ? '?v=' . filemtime($file) : '');
    }

    public static function branding(string $path, array $user): string
    {
        // Custom/uploads/external branding belongs to this installation, not GitHub.
        return in_array($path, ['assets/branding/xplayer-logo.svg', 'assets/branding/xplayer-icon.svg'], true)
            ? self::url($path, $user) : $path;
    }

    public static function scriptPolicy(array $user): string
    {
        // Limit executable CDN content to the selected repository/ref, not the whole CDN.
        return "script-src 'self' 'unsafe-inline'" . (self::base($user) !== '' ? ' ' . self::base($user) : '') .
            "; worker-src 'self' blob:; object-src 'none'; base-uri 'self'";
    }
}

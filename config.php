<?php
/** Shared bootstrap; absolute paths work from the root, admin and CLI contexts. */
require_once __DIR__ . '/class/Common.Class.php';
require_once __DIR__ . '/class/Vinfo.Class.php';
require_once __DIR__ . '/class/Player.php';
if (!is_file(__DIR__ . '/install.lock')) {
    throw new RuntimeException('Xplayer 尚未安装，请打开 install/ 并按安装说明操作');
}
$conn = Settings::connection();
[$config, $safeArr, $user] = Settings::load($conn);
$cacheTime = max(0, min(86400, (int) ($config['cacheTime'] ?? 300)));
$secret = (bool) ($config['secret'] ?? false);
$secretKey = is_string($safeArr['secretKEY'] ?? null) ? $safeArr['secretKEY'] : '';
// One-time migration of predictable legacy/default keys. Old player tokens expire.
if (strlen($secretKey) < 16) {
    $migration = $conn->prepare('UPDATE xplayer_safe SET secretKEY = ? WHERE secretKEY = ?');
    $migration->execute([bin2hex(random_bytes(32)), $secretKey]);
    $secretKey = (string) $conn->query('SELECT secretKEY FROM xplayer_safe LIMIT 1')->fetchColumn();
    $safeArr['secretKEY'] = $secretKey;
}
$async = (bool) ($config['async'] ?? false);
$AD = (bool) ($config['ad'] ?? false);
$zywlist = (bool) ($config['zywlist'] ?? false);
$specialapi = Settings::decode($config['specialApi'] ?? '');
$api = Settings::decode($config['api'] ?? '');
$zyapi = Settings::decode($config['zyapi'] ?? '');
$originarr = Settings::decode($config['origin'] ?? '');
if (!defined('TODAY')) define('TODAY', date('Y-m-d'));
if (!defined('VERSION')) define('VERSION', '1.12-readable');

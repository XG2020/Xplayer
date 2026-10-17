<?php
require_once __DIR__ . '/class/Security.php';
require_once __DIR__ . '/class/Installer.php';
define('IN_SYS', true);
if (!Installer::hasInstallation()) {
    header('Cache-Control: no-store');
    header('Location: install/', true, 303);
    exit;
}
try {
    require_once __DIR__ . '/config.php';
    // Reuse the normal parameter validation before deciding whether this is a bare entry.
    $entryUrl = Tools::getUrl();
    if (!empty($user['home404']) && $entryUrl === '') {
        http_response_code(404);
        header('Content-Type: text/html; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 Not Found</title><style>body{background:#fff;color:#000;text-align:center;font-family:"Times New Roman",serif}</style></head><body><h1>404 Not Found</h1><hr><div>nginx</div></body></html>';
        exit;
    }
    require __DIR__ . '/includes/Play.Header.php';
} catch (Throwable $error) {
    http_response_code(503);
    error_log('Xplayer bootstrap: ' . $error->getMessage());
    echo '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Xplayer</title><link rel="stylesheet" href="assets/player/player.css"><body><div id="error" class="xplayer-playback-error" role="alert"><p class="xplayer-error-message">播放器暂未就绪，请检查安装、数据库配置及服务器日志。</p></div></body></html>';
    exit;
}
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= Security::html($user['title']) ?></title>
    <link rel="icon" href="<?= Security::html(Settings::assetUrl($user['ico']) ? $user['ico'] : '') ?>">
    <link rel="stylesheet" href="assets/player/skin.css?v=<?= filemtime(__DIR__ . '/assets/player/skin.css') ?>">
    <link id="xplayer-desktop-skin" rel="stylesheet" href="assets/player/controls.css?v=<?= filemtime(__DIR__ . '/assets/player/controls.css') ?>">
    <link rel="stylesheet" href="assets/player/player.css?v=<?= filemtime(__DIR__ . '/assets/player/player.css') ?>">
    <link rel="stylesheet" href="assets/player/contextmenu.css?v=<?= filemtime(__DIR__ . '/assets/player/contextmenu.css') ?>">
    <link rel="stylesheet" href="assets/player/progress.css?v=<?= filemtime(__DIR__ . '/assets/player/progress.css') ?>">
    <link rel="stylesheet" href="assets/player/playback-settings.css?v=<?= filemtime(__DIR__ . '/assets/player/playback-settings.css') ?>">
    <link rel="stylesheet" href="assets/player/picture-in-picture.css?v=<?= filemtime(__DIR__ . '/assets/player/picture-in-picture.css') ?>">
    <link rel="stylesheet" href="assets/player/loading.css?v=<?= filemtime(__DIR__ . '/assets/player/loading.css') ?>">
    <link rel="stylesheet" href="assets/player/danmaku-content.css?v=<?= filemtime(__DIR__ . '/assets/player/danmaku-content.css') ?>">
    <script defer src="assets/vendor/jquery/jquery.min.js"></script>
    <script defer src="assets/vendor/crypto/crypto-js.min.js"></script>
    <script defer src="assets/vendor/hls/hls.min.js"></script>
    <script defer src="assets/vendor/dash/dash.all.min.js"></script>
    <script defer src="assets/vendor/flv/flv.min.js"></script>
    <script defer src="assets/vendor/layer/layer.js"></script>
    <script defer src="assets/vendor/lottie/lottie.min.js"></script>
    <script defer src="assets/player/loading-animation-data.js?v=<?= filemtime(__DIR__ . '/assets/player/loading-animation-data.js') ?>"></script>
    <script defer src="assets/player/loading.js?v=<?= filemtime(__DIR__ . '/assets/player/loading.js') ?>"></script>
    <script defer src="assets/player/common.js?v=<?= filemtime(__DIR__ . '/assets/player/common.js') ?>"></script>
    <script defer src="assets/player/config.js?v=<?= filemtime(__DIR__ . '/assets/player/config.js') ?>"></script>
    <script defer src="assets/player/danmaku-sources.js?v=<?= filemtime(__DIR__ . '/assets/player/danmaku-sources.js') ?>"></script>
    <script defer src="assets/player/danmaku-content.js?v=<?= filemtime(__DIR__ . '/assets/player/danmaku-content.js') ?>"></script>
    <script defer src="assets/player/contextmenu.js?v=<?= filemtime(__DIR__ . '/assets/player/contextmenu.js') ?>"></script>
    <script defer src="assets/player/control-icon-data.js?v=<?= filemtime(__DIR__ . '/assets/player/control-icon-data.js') ?>"></script>
    <script defer src="assets/player/controls.js?v=<?= filemtime(__DIR__ . '/assets/player/controls.js') ?>"></script>
    <script defer src="assets/player/progress.js?v=<?= filemtime(__DIR__ . '/assets/player/progress.js') ?>"></script>
    <script defer src="assets/player/playback-settings.js?v=<?= filemtime(__DIR__ . '/assets/player/playback-settings.js') ?>"></script>
    <script defer src="assets/player/picture-in-picture.js?v=<?= filemtime(__DIR__ . '/assets/player/picture-in-picture.js') ?>"></script>
    <script defer src="assets/player/visibility.js?v=<?= filemtime(__DIR__ . '/assets/player/visibility.js') ?>"></script>
    <script defer src="assets/player/compatibility.js?v=<?= filemtime(__DIR__ . '/assets/player/compatibility.js') ?>"></script>
    <script defer src="assets/player/start.js?v=<?= filemtime(__DIR__ . '/assets/player/start.js') ?>"></script>
</head>
<body>
    <div id="xplayer-loading" class="Loading" aria-live="polite">正在准备视频</div>
    <div id="ADtip"></div><div id="ADplayer"></div>
    <div id="error" role="alert" hidden></div>
    <div id="player"></div>
    <form id="xplayer-open" hidden><label for="xplayer-url">播放链接或片名</label><input id="xplayer-url" name="url" required><button type="submit">播放</button></form>
    <?php require __DIR__ . '/includes/Play.Footer.php'; ?>
</body>
</html>

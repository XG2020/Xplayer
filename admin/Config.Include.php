<?php
require_once dirname(__DIR__) . '/class/Security.php';
require_once dirname(__DIR__) . '/class/Installer.php';
if (!defined('IN_SYS')) define('IN_SYS', true);
Security::session();
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
if (!Installer::hasInstallation()) {
    header('Location: ../install/', true, 303);
    exit;
}
try {
    require_once dirname(__DIR__) . '/config.php';
} catch (Throwable $error) {
    error_log('Xplayer admin bootstrap: ' . $error->getMessage());
    http_response_code(503);
    exit('<!doctype html><meta charset="utf-8"><h1>后台尚未就绪</h1><p>请检查安装、数据库配置及服务器日志。</p><a href="../install/">安装说明</a>');
}
$account_check = Security::admin() ? $_SESSION['admin'] : false;

<?php
require_once dirname(__DIR__) . '/class/Security.php';
Security::session();
Security::requirePost();
Security::requireCsrf();
$_SESSION = [];
$params = session_get_cookie_params();
setcookie(session_name(), '', [
    'expires' => time() - 3600, 'path' => $params['path'], 'domain' => $params['domain'],
    'secure' => $params['secure'], 'httponly' => true, 'samesite' => 'Strict',
]);
session_destroy();
header('Location: ./?tip=' . rawurlencode('已安全退出'), true, 303);
exit;

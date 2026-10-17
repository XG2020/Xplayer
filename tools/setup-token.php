<?php
if (PHP_SAPI !== 'cli') { http_response_code(403); exit('CLI only'); }
require_once dirname(__DIR__) . '/class/Security.php';
$file = XPLAYER_ROOT . '/includes/Setup.Token.php';
foreach (['install.lock', 'includes/Mysql.Include.php', 'includes/Admin.Credentials.php'] as $protected) {
    if (file_exists(XPLAYER_ROOT . '/' . $protected)) { fwrite(STDERR, "Installation or private configuration already exists; do not reinstall to upgrade.\n"); exit(1); }
}
if (is_file($file)) {
    $token = require $file;
} else {
    $token = bin2hex(random_bytes(32));
    Security::createFile($file, "<?php\nreturn " . var_export($token, true) . ";\n");
}
echo "Local installation token (paste into the installation form):\n", $token, "\n";

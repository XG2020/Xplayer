<?php
/** Local-only account creation/reset; no web reset using the old default safeKEY. */
if (PHP_SAPI !== 'cli') { http_response_code(403); exit('CLI only'); }
require_once dirname(__DIR__) . '/class/Security.php';
$options = getopt('', ['username:', 'password-stdin', 'replace']);
$username = $options['username'] ?? '';
if ($username === '') { echo 'Username: '; $username = trim((string) fgets(STDIN)); }
if (!array_key_exists('password-stdin', $options)) echo "Password (input is visible; use --password-stdin for a pipe): ";
$password = rtrim((string) fgets(STDIN), "\r\n");
$mutex = null;
$temporary = '';
try {
    Security::validateCredentials($username, $password);
    if (!is_dir(XPLAYER_ROOT . '/var') && !mkdir(XPLAYER_ROOT . '/var', 0700, true) && !is_dir(XPLAYER_ROOT . '/var')) {
        throw new RuntimeException('Cannot create the local authentication directory');
    }
    $mutex = @fopen(XPLAYER_ROOT . '/var/admin-credentials.lock.php', 'c');
    if (!$mutex || !flock($mutex, LOCK_EX)) throw new RuntimeException('Cannot lock credentials');
    $target = XPLAYER_ROOT . '/includes/Admin.Credentials.php';
    $content = Security::phpFile(['username' => $username, 'password_hash' => password_hash($password, PASSWORD_DEFAULT)]);
    if (is_file($target)) {
        if (!array_key_exists('replace', $options) || is_link($target)) throw new RuntimeException('Account already exists; explicit --replace is required to reset it');
        $temporary = dirname($target) . '/.admin-' . bin2hex(random_bytes(16)) . '.php';
        Security::createFile($temporary, $content);
        if (!rename($temporary, $target)) throw new RuntimeException('Cannot replace credentials');
        $temporary = '';
    } else {
        Security::createFile($target, $content);
    }
    if (function_exists('opcache_invalidate')) @opcache_invalidate($target, true);
    echo "Local administrator saved. Existing admin sessions are invalidated.\n";
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage() . "\n");
    $failed = true;
} finally {
    if ($temporary !== '' && is_file($temporary)) @unlink($temporary);
    if ($mutex) { flock($mutex, LOCK_UN); fclose($mutex); }
}
if (!empty($failed)) exit(1);

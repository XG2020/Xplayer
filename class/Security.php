<?php
/** Local authentication, request validation and signed player requests. */
if (!defined('XPLAYER_ROOT')) {
    define('XPLAYER_ROOT', dirname(__DIR__));
}

final class Security
{
    public static function text($value, int $max = 4096): string
    {
        if (!is_string($value) || strlen($value) > $max || strpos($value, "\0") !== false) {
            throw new InvalidArgumentException('参数类型或长度不正确');
        }
        return $value;
    }

    public static function html($value): string
    {
        return htmlspecialchars(is_scalar($value) ? (string) $value : '', ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    public static function json($value): string
    {
        return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG |
            JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR);
    }

    public static function respond(array $data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo self::json($data);
        exit;
    }

    public static function session(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        ini_set('session.use_strict_mode', '1');
        ini_set('session.use_only_cookies', '1');
        session_name('XPLAYER_ADMIN');
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_start();
    }

    public static function csrfToken(): string
    {
        self::session();
        if (!isset($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf'];
    }

    public static function requirePost(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
            self::respond(['code' => 405, 'msg' => '此操作仅接受 POST'], 405);
        }
    }

    public static function requireCsrf(): void
    {
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($_POST['csrf'] ?? '');
        if (!is_string($token) || !hash_equals(self::csrfToken(), $token)) {
            self::respond(['code' => 403, 'msg' => '安全令牌失效，请刷新页面'], 403);
        }
    }

    public static function credentials(): ?array
    {
        $file = XPLAYER_ROOT . '/includes/Admin.Credentials.php';
        if (!is_file($file)) {
            return null;
        }
        // CLI resets must invalidate existing logins even when opcache timestamps are disabled.
        if (function_exists('opcache_invalidate')) @opcache_invalidate($file, true);
        $data = require $file;
        return is_array($data) && isset($data['username'], $data['password_hash']) ? $data : null;
    }

    public static function admin(): bool
    {
        self::session();
        $record = self::credentials();
        $valid = $record && is_string($_SESSION['admin'] ?? null) &&
            hash_equals($record['username'], $_SESSION['admin']) &&
            hash_equals(hash('sha256', $record['password_hash']), (string) ($_SESSION['auth_version'] ?? '')) &&
            (int) ($_SESSION['last_active'] ?? 0) >= time() - 7200;
        if ($valid) {
            $_SESSION['last_active'] = time();
        } else {
            unset($_SESSION['admin'], $_SESSION['auth_version'], $_SESSION['last_active']);
        }
        return (bool) $valid;
    }

    public static function requireAdmin(): void
    {
        if (!self::admin()) {
            self::respond(['code' => 401, 'msg' => '请先登录站点管理员账号'], 401);
        }
    }

    public static function clientIp(): string
    {
        // Forwarded headers are attacker-controlled unless a trusted proxy is configured.
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        return is_string($ip) && filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }

    public static function login(string $username, string $password): bool
    {
        self::session();
        $directory = XPLAYER_ROOT . '/var';
        if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
            throw new RuntimeException('无法创建认证限流目录');
        }
        $file = $directory . '/login-' . hash('sha256', self::clientIp()) . '.php';
        $handle = fopen($file, 'c+');
        if (!$handle || !flock($handle, LOCK_EX)) {
            throw new RuntimeException('无法锁定认证限流文件');
        }
        try {
            $stored = stream_get_contents($handle);
            $record = json_decode(substr($stored, strlen("<?php exit; ?>\n")), true) ?: [];
            $attempts = array_values(array_filter($record['attempts'] ?? [], static function ($timestamp) {
                return is_int($timestamp) && $timestamp > time() - 900;
            }));
            if (count($attempts) >= 10) {
                return false;
            }
            $credentials = self::credentials();
            // Constant-work password verification also runs for unknown usernames.
            $hash = $credentials['password_hash'] ?? '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi';
            $passwordValid = password_verify($password, $hash);
            $valid = $credentials && hash_equals($credentials['username'], $username) && $passwordValid;
            $attempts = $valid ? [] : array_merge($attempts, [time()]);
            rewind($handle);
            ftruncate($handle, 0);
            fwrite($handle, "<?php exit; ?>\n" . self::json(['attempts' => $attempts]));
            fflush($handle);
            if (!$valid) {
                return false;
            }
            session_regenerate_id(true);
            $_SESSION['admin'] = $credentials['username'];
            $_SESSION['auth_version'] = hash('sha256', $credentials['password_hash']);
            $_SESSION['last_active'] = time();
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
            return true;
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    public static function validateCredentials(string $username, string $password): void
    {
        if (!preg_match('/\A[A-Za-z0-9_.@-]{3,64}\z/', $username)) {
            throw new InvalidArgumentException('用户名需为 3–64 位字母、数字或 _.@-');
        }
        if (strlen($password) < 12 || strlen($password) > 72) {
            throw new InvalidArgumentException('密码需为 12–72 字节，请使用独立的强密码');
        }
    }

    public static function changePassword(string $currentPassword, string $newPassword, string $confirmation): void
    {
        if (!self::admin()) throw new InvalidArgumentException('登录已失效，请重新登录');
        if (!hash_equals($newPassword, $confirmation)) throw new InvalidArgumentException('两次输入的新密码不一致');
        self::validateCredentials($_SESSION['admin'], $newPassword);
        $attempts = array_values(array_filter($_SESSION['password_attempts'] ?? [], static function ($timestamp) {
            return is_int($timestamp) && $timestamp > time() - 900;
        }));
        if (count($attempts) >= 10) throw new InvalidArgumentException('原密码尝试过于频繁，请 15 分钟后重试');

        $path = XPLAYER_ROOT . '/includes/Admin.Credentials.php';
        $mutex = @fopen(XPLAYER_ROOT . '/var/admin-credentials.lock.php', 'c');
        if (!$mutex || !flock($mutex, LOCK_EX)) {
            if ($mutex) fclose($mutex);
            throw new RuntimeException('无法锁定管理员配置');
        }
        $temporary = '';
        try {
            // Check again under the lock so a stale session cannot overwrite a newer password.
            if (!self::admin()) throw new InvalidArgumentException('登录已失效，请重新登录');
            $record = self::credentials();
            if (!$record || !password_verify($currentPassword, $record['password_hash'])) {
                $_SESSION['password_attempts'] = array_merge($attempts, [time()]);
                throw new InvalidArgumentException('原密码不正确');
            }
            if (password_verify($newPassword, $record['password_hash'])) throw new InvalidArgumentException('新密码不能与原密码相同');
            if (is_link($path) || !is_writable(dirname($path))) throw new RuntimeException('管理员配置目录不可写');
            $record['password_hash'] = password_hash($newPassword, PASSWORD_DEFAULT);
            // Keep staged credentials executable as PHP so a static request cannot expose the hash.
            $temporary = dirname($path) . '/.admin-' . bin2hex(random_bytes(16)) . '.php';
            self::createFile($temporary, self::phpFile($record));
            if (!@rename($temporary, $path)) throw new RuntimeException('无法保存管理员密码');
            $temporary = '';
            clearstatcache(true, $path);
            if (function_exists('opcache_invalidate')) @opcache_invalidate($path, true);
            // auth_version in every previous session now differs from the saved password hash.
            $_SESSION = [];
            session_regenerate_id(true);
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        } finally {
            if ($temporary !== '' && is_file($temporary)) @unlink($temporary);
            flock($mutex, LOCK_UN);
            fclose($mutex);
        }
    }

    public static function phpFile(array $data): string
    {
        return "<?php\n// Private local configuration. Do not commit or expose this file.\nreturn " . var_export($data, true) . ";\n";
    }

    public static function createFile(string $path, string $contents): void
    {
        $handle = @fopen($path, 'x');
        if (!$handle) {
            throw new RuntimeException('文件已存在或目录不可写：' . basename($path));
        }
        try {
            if (fwrite($handle, $contents) !== strlen($contents)) {
                throw new RuntimeException('文件写入不完整：' . basename($path));
            }
            fflush($handle);
        } finally {
            fclose($handle);
        }
        @chmod($path, 0600);
    }

    private static function base64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    public static function issueToken(string $purpose, string $url, string $key, int $ttl = 600): string
    {
        if (strlen($key) < 16) {
            throw new RuntimeException('请先在后台将播放密钥修改为至少 16 字符的随机值');
        }
        $payload = self::base64url(self::json([
            'purpose' => $purpose, 'url' => $url, 'iat' => time(),
            'exp' => time() + max(1, min($ttl, 43200)), 'nonce' => bin2hex(random_bytes(8)),
        ]));
        $signature = hash_hmac('sha256', 'xplayer-v1.' . $payload, $key, true);
        return 'v1.' . $payload . '.' . self::base64url($signature);
    }

    public static function readToken($token, string $purpose, string $key): string
    {
        if (!is_string($token) || strlen($token) > 20000 || strlen($key) < 16 ||
            !preg_match('/\Av1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{43})\z/', $token, $parts)) {
            throw new InvalidArgumentException('播放令牌无效，请刷新播放器');
        }
        $signature = self::base64url(hash_hmac('sha256', 'xplayer-v1.' . $parts[1], $key, true));
        if (!hash_equals($signature, $parts[2])) {
            throw new InvalidArgumentException('播放令牌校验失败');
        }
        $data = json_decode(base64_decode(strtr($parts[1], '-_', '+/'), true), true);
        if (!is_array($data) || ($data['purpose'] ?? null) !== $purpose ||
            !is_int($data['iat'] ?? null) || !is_int($data['exp'] ?? null) ||
            $data['iat'] > time() + 30 || $data['exp'] <= time() ||
            $data['exp'] <= $data['iat'] || $data['exp'] - $data['iat'] > 43200) {
            throw new InvalidArgumentException('播放令牌过期或用途不匹配，请刷新播放器');
        }
        return self::text($data['url'] ?? null, 12000);
    }
}

<?php
require_once __DIR__ . '/Common.Class.php';

final class Installer
{
    public static function hasInstallation(): bool
    {
        // If private files cannot be inspected, do not treat the site as a fresh installation.
        if (!is_readable(XPLAYER_ROOT) || (is_dir(XPLAYER_ROOT . '/includes') && !is_readable(XPLAYER_ROOT . '/includes'))) return true;
        foreach (['install.lock', 'includes/Mysql.Include.php', 'includes/Admin.Credentials.php'] as $file) {
            $path = XPLAYER_ROOT . '/' . $file;
            if (file_exists($path) || is_link($path)) return true;
        }
        return false;
    }

    public static function setupToken(): ?string
    {
        $token = getenv('XPLAYER_INSTALL_TOKEN');
        if ($token === false || $token === '') {
            $file = XPLAYER_ROOT . '/includes/Setup.Token.php';
            if (!file_exists($file) && !is_link($file)) return null;
            if (!is_file($file) || !is_readable($file)) throw new RuntimeException('已有安装密钥配置无效，请检查 includes/Setup.Token.php');
            $token = require $file;
        }
        // An explicitly configured token always remains a gate, even if it is malformed.
        if (!is_string($token) || strlen($token) < 32 || strlen($token) > 200) {
            throw new RuntimeException('已有安装密钥配置无效，请修正 XPLAYER_INSTALL_TOKEN 或 includes/Setup.Token.php');
        }
        return $token;
    }

    public static function verifySetupToken(string $provided): void
    {
        $token = self::setupToken();
        if ($token !== null && !hash_equals($token, $provided)) throw new InvalidArgumentException('安装密钥不正确');
    }

    public static function requirements(): array
    {
        return [
            'PHP 8.2 或更新版本' => PHP_VERSION_ID >= 80200,
            'PDO MySQL 扩展' => extension_loaded('pdo_mysql'),
            'cURL 扩展' => extension_loaded('curl'),
            'OpenSSL 扩展' => extension_loaded('openssl'),
            '项目根目录可写' => is_writable(XPLAYER_ROOT),
            'includes 目录可写' => is_dir(XPLAYER_ROOT . '/includes') && is_writable(XPLAYER_ROOT . '/includes'),
            'var 目录可写' => is_dir(XPLAYER_ROOT . '/var') ? is_writable(XPLAYER_ROOT . '/var') : is_writable(XPLAYER_ROOT),
            'Cache 目录可写' => is_dir(XPLAYER_ROOT . '/Cache') ? is_writable(XPLAYER_ROOT . '/Cache') : is_writable(XPLAYER_ROOT),
        ];
    }

    public static function schema(string $driver): array
    {
        $suffix = $driver === 'mysql' ? ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4' : '';
        $id = $driver === 'mysql' ? 'INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
        return [
            'CREATE TABLE xplayer_chart (`time` DATE PRIMARY KEY, `use` INTEGER NOT NULL DEFAULT 0, useok INTEGER NOT NULL DEFAULT 0, income DECIMAL(10,2) NOT NULL DEFAULT 0)' . $suffix,
            'CREATE TABLE xplayer_config (ad INTEGER NOT NULL, cacheTime INTEGER NOT NULL, async INTEGER NOT NULL, secret INTEGER NOT NULL, zywlist INTEGER NOT NULL, specialApi TEXT NOT NULL, api TEXT NOT NULL, zyapi TEXT NOT NULL, origin TEXT NOT NULL, user TEXT NOT NULL)' . $suffix,
            'CREATE TABLE xplayer_safe (appkey TEXT NOT NULL, safeKEY TEXT NOT NULL, secretKEY TEXT NOT NULL)' . $suffix,
            'CREATE TABLE WatchCount (ID ' . $id . ', IP VARCHAR(50) NOT NULL UNIQUE, `time` BIGINT NOT NULL, referer VARCHAR(255) NOT NULL)' . $suffix,
            'CREATE INDEX xplayer_watch_time ON WatchCount (`time`)',
        ];
    }

    public static function seed(PDO $pdo): void
    {
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
        if (!in_array($driver, ['mysql', 'sqlite'], true)) throw new RuntimeException('不支持的数据库驱动');
        $tables = $driver === 'mysql' ? $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) :
            $pdo->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
        foreach (['xplayer_chart', 'xplayer_config', 'xplayer_safe', 'WatchCount'] as $table) {
            if (in_array($table, $tables, true)) throw new RuntimeException('检测到已有播放器数据表，拒绝覆盖。升级请保留原数据库，按维护说明配置管理员账号。');
        }
        // MySQL DDL commits implicitly: never pretend rollback can restore dropped tables.
        // No existing table is dropped by this installer.
        foreach (self::schema($driver) as $sql) $pdo->exec($sql);
        $pdo->beginTransaction();
        try {
            $query = $pdo->prepare('INSERT INTO xplayer_config (ad, cacheTime, async, secret, zywlist, specialApi, api, zyapi, origin, user) VALUES (0, 300, 1, 0, 0, ?, ?, ?, ?, ?)');
            $query->execute(['[]', '[]', '[]', '[]', Security::json(Settings::userDefaults())]);
            $pdo->prepare('INSERT INTO xplayer_safe (appkey, safeKEY, secretKEY) VALUES (?, ?, ?)')->execute(['', bin2hex(random_bytes(16)), bin2hex(random_bytes(32))]);
            $pdo->commit();
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $error;
        }
    }

    public static function complete(PDO $pdo, array $database, string $username, string $password): void
    {
        Security::validateCredentials($username, $password);
        if (!is_dir(XPLAYER_ROOT . '/var') && !mkdir(XPLAYER_ROOT . '/var', 0700, true) && !is_dir(XPLAYER_ROOT . '/var')) {
            throw new RuntimeException('无法创建安装目录，请检查项目目录权限');
        }
        $mutex = @fopen(XPLAYER_ROOT . '/var/install-mutex.php', 'c');
        if (!$mutex || !flock($mutex, LOCK_EX | LOCK_NB)) {
            if ($mutex) fclose($mutex);
            throw new RuntimeException('无法开始安装：另一个安装正在进行，或 var 目录不可写');
        }
        try {
            if (self::hasInstallation()) throw new RuntimeException('已有安装或私有配置，拒绝覆盖');
            if (!is_writable(XPLAYER_ROOT) || !is_writable(XPLAYER_ROOT . '/includes')) throw new RuntimeException('项目根目录或 includes 目录不可写');
            self::seed($pdo);
            $created = [];
            try {
                $files = [
                    'includes/Mysql.Include.php' => Security::phpFile($database),
                    'includes/Admin.Credentials.php' => Security::phpFile(['username' => $username, 'password_hash' => password_hash($password, PASSWORD_DEFAULT)]),
                    'install.lock' => "Installation complete. Do not remove this lock to upgrade.\n",
                ];
                foreach ($files as $file => $contents) {
                    Security::createFile(XPLAYER_ROOT . '/' . $file, $contents);
                    $created[] = $file;
                }
            } catch (Throwable $error) {
                // Remove only the files created in this operation, never existing files/tables.
                foreach ($created as $file) unlink(XPLAYER_ROOT . '/' . $file);
                throw new RuntimeException('配置文件写入失败，数据库表已创建，请备份后使用新的空数据库重试', 0, $error);
            }
        } finally {
            flock($mutex, LOCK_UN);
            fclose($mutex);
        }
    }
}

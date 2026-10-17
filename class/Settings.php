<?php
/** Backwards-compatible reads of the v1.11 database; all new array writes use JSON. */
require_once __DIR__ . '/Security.php';
require_once __DIR__ . '/Http.php';
require_once __DIR__ . '/DanmakuFilter.php';

final class Settings
{
    public static function userDefaults(): array
    {
        return [
            'danmuon' => 1, 'autoplay' => 0, 'showlist' => 1, 'home404' => 0,
            'title' => 'Xplayer | H5高级播放器',
            'logo' => 'assets/branding/xplayer-logo.svg',
            'ico' => 'assets/branding/xplayer-icon.svg',
            'img' => '', 'button' => 'Xplayer,assets/docs/player.html',
            'startAD' => '', 'pauseAD' => '', 'danmuku' => '', 'themeColor' => '#ff0000',
            'danmakuCreateApis' => '', 'danmakuLocalFallback' => 1, 'danmakuBlockedWords' => '',
            'forbidden' => '此网站未授权播放', 'bad' => '视频链接解析失败，请检查链接或联系管理员',
            'notice' => '请选择视频或输入播放链接', 'metadataApi' => '',
        ];
    }

    private static function plainArray($value, int $depth = 0): bool
    {
        if ($depth > 8) return false;
        if (!is_array($value)) return is_scalar($value) || $value === null;
        if (count($value) > 1000) return false;
        foreach ($value as $item) {
            if (!self::plainArray($item, $depth + 1)) return false;
        }
        return true;
    }

    public static function decode($value): array
    {
        if (is_array($value)) return self::plainArray($value) ? $value : [];
        if (!is_string($value) || strlen($value) > 1048576 || $value === '' || $value === 'b:0;') return [];
        $decoded = json_decode($value, true, 16);
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Only legacy database arrays, never request parameters; objects are disallowed.
            if (!preg_match('/\Aa:\d+:\{/', $value)) return [];
            $decoded = @unserialize($value, ['allowed_classes' => false, 'max_depth' => 16]);
        }
        return is_array($decoded) && self::plainArray($decoded) ? $decoded : [];
    }

    public static function dsn(string $host, string $database, int $port = 3306): string
    {
        if (!preg_match('/\A[A-Za-z0-9_.:\[\]-]{1,253}\z/', $host) ||
            !preg_match('/\A[A-Za-z0-9_-]{1,64}\z/', $database) || $port < 1 || $port > 65535) {
            throw new InvalidArgumentException('数据库主机、端口或库名不正确');
        }
        return 'mysql:host=' . $host . ';port=' . $port . ';dbname=' . $database . ';charset=utf8mb4';
    }

    public static function connection(): PDO
    {
        $path = XPLAYER_ROOT . '/includes/Mysql.Include.php';
        if (!is_file($path)) throw new RuntimeException('数据库配置不存在，请先安装');
        $conn = null;
        $settings = require $path;
        if ($conn instanceof PDO) {
            // Original installs assign $conn in this include.
            $pdo = $conn;
        } elseif (is_array($settings) && isset($settings['dsn'])) {
            $pdo = new PDO($settings['dsn'], $settings['username'] ?? '', $settings['password'] ?? '');
        } else {
            throw new RuntimeException('数据库配置格式不正确');
        }
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        return $pdo;
    }

    public static function load(PDO $pdo): array
    {
        $config = $pdo->query('SELECT * FROM xplayer_config LIMIT 1')->fetch();
        $safe = $pdo->query('SELECT * FROM xplayer_safe LIMIT 1')->fetch();
        if (!is_array($config) || !is_array($safe)) throw new RuntimeException('数据库尚未完成初始化');
        $user = array_replace(self::userDefaults(), self::decode($config['user'] ?? ''));
        foreach ($user as $key => $value) {
            if (!is_scalar($value)) $user[$key] = self::userDefaults()[$key] ?? '';
        }
        // The old built-in marker is represented by an empty field in the admin UI; no database write.
        if (trim((string) $user['danmuku']) === 'danmaku.php') $user['danmuku'] = '';
        return [$config, $safe, $user];
    }

    public static function save(PDO $pdo, string $column, $value, bool $safe = false): void
    {
        $allowed = $safe ? ['safeKEY', 'secretKEY'] :
            ['ad', 'cacheTime', 'async', 'secret', 'zywlist', 'specialApi', 'api', 'zyapi', 'origin', 'user'];
        if (!in_array($column, $allowed, true)) throw new InvalidArgumentException('不支持的配置项');
        $table = $safe ? 'xplayer_safe' : 'xplayer_config';
        $query = $pdo->prepare('UPDATE ' . $table . ' SET `' . $column . '` = ?');
        $query->execute([is_array($value) ? Security::json($value) : $value]);
    }

    public static function normalizeList(string $input, string $kind): array
    {
        $list = Tools::arr2str($input, true);
        $list = is_array($list) ? $list : [];
        if (count($list) > 40) throw new InvalidArgumentException('最多可配置 40 条记录');
        foreach ($list as $index => $item) {
            $item = trim(Security::text($item, 12000));
            if ($item === '') { unset($list[$index]); continue; }
            if ($kind === 'origin') {
                $host = preg_replace('~^https?://~i', '', $item);
                $host = rtrim($host, '/');
                if (!preg_match('/\A(?:\*\.)?[A-Za-z0-9.-]+(?::\d{1,5})?\z/', $host)) {
                    throw new InvalidArgumentException('来源限制应填写域名（可使用 *.example.com）');
                }
                $list[$index] = strtolower($host);
                continue;
            }
            $url = $item;
            if ($kind === 'specialApi') {
                $parts = explode('|', $item, 2);
                if (count($parts) !== 2 || !preg_match('/\A(?:\*\.)?[A-Za-z0-9.-]+\z/', $parts[0])) {
                    throw new InvalidArgumentException('专线格式为：域名|解析接口');
                }
                $url = $parts[1];
            }
            if (!Http::validUrl(str_replace('{url}', 'https%3A%2F%2Fexample.com', $url))) {
                throw new InvalidArgumentException('接口必须为完整的 HTTP/HTTPS 地址');
            }
            $list[$index] = $item;
        }
        ksort($list, SORT_NATURAL);
        return array_values($list);
    }

    public static function validateUser(array $data, array $previous): array
    {
        $allowed = self::userDefaults();
        $result = array_replace($allowed, $previous);
        foreach ($allowed as $key => $default) {
            if (!array_key_exists($key, $data)) continue;
            if (in_array($key, ['danmuon', 'autoplay', 'showlist', 'home404', 'danmakuLocalFallback'], true)) {
                if (!in_array($data[$key], [0, 1, '0', '1'], true)) throw new InvalidArgumentException('开关值不正确');
                $result[$key] = (int) $data[$key];
            } elseif ($key === 'danmakuBlockedWords') {
                $result[$key] = self::normalizeDanmakuBlockedWords(Security::text($data[$key], 32768));
            } else {
                $result[$key] = Security::text($data[$key], 8000);
            }
        }
        if (!preg_match('/\A#[0-9a-fA-F]{6}\z/', $result['themeColor'])) {
            throw new InvalidArgumentException('主题颜色应为 #RRGGBB');
        }
        $result['danmuku'] = self::normalizeDanmaku($result['danmuku']);
        $result['danmakuCreateApis'] = self::normalizeDanmaku($result['danmakuCreateApis']);
        $libraries = explode("\n", $result['danmuku']);
        foreach (array_filter(explode("\n", $result['danmakuCreateApis'])) as $library) {
            if (!in_array($library, $libraries, true)) throw new InvalidArgumentException('允许创建空库的地址必须同时列在弹幕服务列表中');
        }
        foreach (['logo', 'ico', 'img', 'metadataApi'] as $key) {
            $valid = self::assetUrl($result[$key], $key === 'metadataApi');
            if ($result[$key] !== '' && !$valid) {
                throw new InvalidArgumentException($key . ' 地址不正确');
            }
        }
        foreach (['button', 'startAD', 'pauseAD'] as $key) {
            if (preg_match('/[<>\r\n\x00]/', $result[$key])) throw new InvalidArgumentException('广告或按钮配置中不能含 HTML');
        }
        if (array_key_exists('button', $data)) {
            $button = self::siteButton($result['button']);
            if ($button['url'] !== '' && !self::assetUrl($button['url'])) throw new InvalidArgumentException('站点按钮链接应为 HTTP(S) 地址或本站相对路径');
        }
        return $result;
    }

    /** Decode the shared button format, retaining commas in legacy unquoted URLs. */
    public static function siteButton(string $value): array
    {
        $parts = str_getcsv($value, ',', '"', '');
        return ['label' => trim((string) ($parts[0] ?? '')), 'url' => trim(implode(',', array_slice($parts, 1)))];
    }

    public static function normalizeDanmakuBlockedWords(string $value): string
    {
        return DanmakuFilter::normalizeList($value);
    }

    /** External libraries require explicitly entered, complete HTTP(S) URLs; empty means built-in. */
    public static function normalizeDanmaku(string $value): string
    {
        $sources = array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $value)), static fn($source) => $source !== ''));
        if (count($sources) > 10) throw new InvalidArgumentException('最多可配置 10 个弹幕库，每行填写一个地址');
        foreach ($sources as $source) {
            if (!self::danmakuUrl($source)) throw new InvalidArgumentException('弹幕库地址不正确，请手动输入以 https:// 或 http:// 开头的完整地址；留空使用本站弹幕库');
        }
        return implode("\n", array_values(array_unique($sources)));
    }

    public static function danmakuUrl($value): bool
    {
        return Http::validUrl($value);
    }

    public static function assetUrl($value, bool $absolute = false): bool
    {
        if (!is_string($value) || preg_match('/[\x00-\x20<>"\x27\\\\]/', $value)) return false;
        if (Http::validUrl($value)) return true;
        return !$absolute && !str_starts_with($value, '//') && !str_contains($value, ':') &&
            !preg_match('~(?:^|/)\.\.(?:/|$)~', $value) && preg_match('~\A/?[A-Za-z0-9_.?=&%/#@+\~,-]+\z~D', $value) === 1;
    }
}

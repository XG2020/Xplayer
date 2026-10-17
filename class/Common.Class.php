<?php
/**
 * Readable replacements of the recovered Tools, parseUrl, Cache and count classes.
 * Public helper names and legacy encryption round-trips are retained; network,
 * authorization and filesystem behavior is deliberately hardened.
 */
require_once __DIR__ . '/Security.php';
require_once __DIR__ . '/Http.php';
require_once __DIR__ . '/Settings.php';
require_once __DIR__ . '/Statistics.php';

class Tools
{
    public static function arr2str($data, $recover = false)
    {
        if ($recover) {
            if (!is_string($data) || $data === '') return [];
            $result = [];
            foreach (explode('&&&', $data) as $row) {
                if (trim($row) === '') continue;
                $pair = explode('###', trim($row), 2);
                if (count($pair) !== 2 || !preg_match('/\A\d{1,5}\z/', $pair[0])) {
                    throw new InvalidArgumentException('列表格式应为：0###内容&&&1###内容');
                }
                $index = (int) $pair[0];
                if (array_key_exists($index, $result)) throw new InvalidArgumentException('列表序号不能重复');
                $result[$index] = $pair[1];
            }
            ksort($result, SORT_NUMERIC);
            return $result;
        }
        if (!is_array($data) || !$data) return '';
        $rows = [];
        foreach ($data as $key => $value) {
            if (!is_scalar($value)) throw new InvalidArgumentException('列表仅支持字符串值');
            $rows[] = $key . '###' . (string) $value;
        }
        return implode('&&&', $rows);
    }

    public static function href($url): string
    {
        return '<script>window.location.href=' . Security::json((string) $url) . ';</script>';
    }

    public static function BiliBiliAV($url)
    {
        try {
            $body = (new Http())->get(Security::text($url))['body'];
            if (preg_match('/"epInfo"\s*:\s*\{.*?"aid"\s*:\s*(\d+)/s', $body, $matches)) return (int) $matches[1];
        } catch (Throwable $error) {
            error_log('Xplayer Bilibili metadata: ' . $error->getMessage());
        }
        return 0;
    }

    public static function get_origin(): string
    {
        $value = $_SERVER['HTTP_ORIGIN'] ?? ($_SERVER['HTTP_REFERER'] ?? '');
        return is_string($value) ? $value : '';
    }

    public static function domainMatches(string $url, string $rule): bool
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        $rule = strtolower(trim($rule));
        if ($host === '' || $rule === '') return false;
        $rule = preg_replace('~^https?://~i', '', rtrim($rule, '/'));
        $port = parse_url($url, PHP_URL_PORT);
        if (preg_match('/:\d+\z/', $rule)) {
            $host .= ':' . ($port ?: (parse_url($url, PHP_URL_SCHEME) === 'https' ? 443 : 80));
        }
        if (str_starts_with($rule, '*.')) {
            $suffix = substr($rule, 1);
            return strlen($host) > strlen($suffix) && str_ends_with($host, $suffix);
        }
        return hash_equals($rule, $host);
    }

    public static function inOriginArr($domain): bool
    {
        $rules = $GLOBALS['originarr'] ?? [];
        if (!is_array($rules) || $rules === []) return true;
        if (!is_string($domain) || !Http::validUrl($domain)) return false;
        // Same-site XHR must still work inside an embedded player.
        $own = $_SERVER['HTTP_HOST'] ?? '';
        if (is_string($own) && self::domainMatches($domain, $own)) return true;
        foreach ($rules as $rule) {
            if (is_string($rule) && self::domainMatches($domain, $rule)) return true;
        }
        return false;
    }

    public static function getUrl(): string
    {
        $url = $_GET['url'] ?? '';
        if (!is_string($url)) throw new InvalidArgumentException('url 必须为字符串');
        // Legacy links often put an unescaped media URL (including &) last.
        $query = $_SERVER['QUERY_STRING'] ?? '';
        if (is_string($query) && preg_match('/(?:^|&)url=(https?:\/\/.*)\z/i', $query, $match)) $url = $match[1];
        return trim(Security::text($url, 12000));
    }

    public static function AESencrypt($data, $key): string
    {
        $encrypted = openssl_encrypt((string) $data, 'AES-128-ECB', md5((string) $key), OPENSSL_RAW_DATA);
        if ($encrypted === false) throw new RuntimeException('AES 加密失败');
        return bin2hex($encrypted);
    }

    public static function AESdecrypt($data, $key)
    {
        if (!is_string($data) || !ctype_xdigit($data) || strlen($data) % 2 !== 0) return false;
        return openssl_decrypt(hex2bin($data), 'AES-128-ECB', md5((string) $key), OPENSSL_RAW_DATA);
    }

    public static function CBCencrypt($data, $key): string
    {
        $digest = md5((string) $key);
        $result = openssl_encrypt((string) $data, 'AES-128-CBC', substr($digest, 0, 16), OPENSSL_RAW_DATA, substr($digest, -16));
        if ($result === false) throw new RuntimeException('AES 加密失败');
        return base64_encode($result);
    }

    public static function CBCdecrypt($data, $key)
    {
        if (!is_string($data) || ($binary = base64_decode($data, true)) === false) return false;
        $digest = md5((string) $key);
        return openssl_decrypt($binary, 'AES-128-CBC', substr($digest, 0, 16), OPENSSL_RAW_DATA, substr($digest, -16));
    }

    public static function keyCode($url, $num): string
    {
        $encoded = base64_encode((string) $url);
        $result = '';
        for ($i = 0, $length = strlen($encoded); $i < $length; $i++) $result .= chr((ord($encoded[$i]) + (int) $num) & 255);
        return $result;
    }

    public static function isIos(): bool
    {
        return preg_match('/iPhone|iPad|iPod/i', (string) ($_SERVER['HTTP_USER_AGENT'] ?? '')) === 1;
    }

    public static function deldir($directory): bool
    {
        $root = realpath(XPLAYER_ROOT . '/Cache');
        $target = realpath((string) $directory) ?: realpath(XPLAYER_ROOT . '/' . (string) $directory);
        if (!$root || !$target || $target !== $root) throw new InvalidArgumentException('仅可清理本项目缓存目录');
        foreach (new DirectoryIterator($root) as $entry) {
            if ($entry->isFile() && !$entry->isLink() && preg_match('/\A[a-f0-9]{64}\.cache\z/', $entry->getFilename())) {
                unlink($entry->getPathname());
            }
        }
        return true;
    }
}

class Cache
{
    private string $directory;
    private int $ttl;
    private string $key;

    public function __construct($dir = 'Cache/', $cacheTime = 300, $key = null)
    {
        // A caller cannot select an arbitrary writable/executable location.
        $this->directory = XPLAYER_ROOT . '/Cache';
        $this->ttl = max(0, min(86400, (int) $cacheTime));
        $this->key = (string) ($key ?? ($_SERVER['REQUEST_URI'] ?? 'default'));
        if (!is_dir($this->directory) && !mkdir($this->directory, 0700, true) && !is_dir($this->directory)) {
            throw new RuntimeException('缓存目录不可写');
        }
        if (is_link($this->directory)) throw new RuntimeException('缓存目录不能是符号链接');
    }

    public function getcacheid(): string
    {
        return $this->directory . '/' . hash('sha256', $this->key) . '.cache';
    }

    public function isvalid(): bool
    {
        $file = $this->getcacheid();
        return $this->ttl > 0 && is_file($file) && !is_link($file) && filemtime($file) + $this->ttl > time();
    }

    public function load(): ?string
    {
        if (!$this->isvalid()) return null;
        $handle = @fopen($this->getcacheid(), 'rb');
        if (!$handle) return null;
        try {
            if (!flock($handle, LOCK_SH)) return null;
            $value = stream_get_contents($handle, 2097153);
            return is_string($value) && strlen($value) <= 2097152 ? $value : null;
        } finally {
            flock($handle, LOCK_UN);
            fclose($handle);
        }
    }

    public function write($content, $legacyContent = null): bool
    {
        if ($legacyContent !== null) $content = $legacyContent; // old write(1, $content)
        if ($this->ttl === 0 || !is_string($content) || strlen($content) > 2097152) return false;
        $temporary = tempnam($this->directory, '.cache-');
        if ($temporary === false) return false;
        try {
            if (file_put_contents($temporary, $content, LOCK_EX) !== strlen($content)) return false;
            @chmod($temporary, 0600);
            return rename($temporary, $this->getcacheid());
        } finally {
            if (is_file($temporary)) unlink($temporary);
        }
    }

    public function clean(): void
    {
        foreach (new DirectoryIterator($this->directory) as $entry) {
            if ($entry->isFile() && !$entry->isLink() && preg_match('/\A[a-f0-9]{64}\.cache\z/', $entry->getFilename()) &&
                $entry->getMTime() < time() - 86400) unlink($entry->getPathname());
        }
    }

    public function dir_isvalid($dir): bool { return realpath((string) $dir) === realpath($this->directory); }
    public function geturl(): string { return $this->key; }
    public function error($message): void { throw new RuntimeException((string) $message); }
}

class count
{
    private string $file;
    public function __construct($filename)
    {
        if (!in_array($filename, ['clean.txt', 'count.txt'], true)) throw new InvalidArgumentException('不支持的计数文件');
        $this->file = XPLAYER_ROOT . '/' . $filename;
    }
    public function countWrite($content): void
    {
        if (file_put_contents($this->file, (string) $content, LOCK_EX) === false) throw new RuntimeException('计数文件不可写');
    }
    public function countRead(): string
    {
        if (!is_file($this->file)) $this->countWrite(Security::json(['num' => 0, 'time' => time()]));
        return (string) file_get_contents($this->file);
    }
}

class parseUrl
{
    private string $url;
    private array $api;
    private array $special;
    private int $cacheTime;
    private bool $secret;
    private string $secretKey;
    private Http $http;
    private string $lastFailure = '';
    private array $videoIdentity = [];

    public function __construct($url, $api = [], $specialapi = [], $cacheTime = 300, $secret = false, $secretKey = '', ?Http $http = null)
    {
        $this->url = Security::text($url, 12000);
        $this->api = is_array($api) ? array_values($api) : [];
        $this->special = is_array($specialapi) ? array_values($specialapi) : [];
        $this->cacheTime = max(0, (int) $cacheTime);
        $this->secret = (bool) $secret;
        $this->secretKey = (string) $secretKey;
        $this->http = $http ?? new Http();
    }

    public static function directMedia(string $url): bool
    {
        return Http::validUrl($url) && preg_match('/\.(?:mp4|m3u8|mpd|flv|webm|m4v|mov|m4a|mp3|ogg|wav)\z/i', (string) parse_url($url, PHP_URL_PATH)) === 1;
    }

    public static function endpoint(string $prefix, string $input): string
    {
        return str_contains($prefix, '{url}') ? str_replace('{url}', rawurlencode($input), $prefix) : $prefix . rawurlencode($input);
    }

    public function getPlay(): string
    {
        $this->lastFailure = '';
        $this->videoIdentity = [];
        if (self::directMedia($this->url)) return $this->url;
        $endpoints = [];
        foreach (array_slice($this->special, 0, 40) as $entry) {
            if (!is_string($entry)) continue;
            $parts = explode('|', $entry, 2);
            if (count($parts) === 2 && Tools::domainMatches($this->url, $parts[0])) $endpoints[] = $parts[1];
        }
        $endpoints = array_merge($endpoints, $this->api);
        if (Http::validUrl($this->url)) {
            foreach (array_slice($endpoints, 0, 10) as $endpoint) {
                if (!is_string($endpoint) || $endpoint === '') continue;
                try {
                    $data = $this->http->json(self::endpoint($endpoint, $this->url));
                    $play = $data['url'] ?? ($data['data']['url'] ?? '');
                    if (Http::validUrl($play)) {
                        $details = is_array($data['data'] ?? null) ? array_replace($data, $data['data']) : $data;
                        foreach (['vid', 'tvid', 'videoId'] as $field) {
                            $value = $details[$field] ?? null;
                            if ((is_string($value) || is_int($value)) && preg_match('/\A[A-Za-z0-9_=-]{1,128}\z/', (string) $value)) {
                                $this->videoIdentity[$field] = (string) $value;
                            }
                        }
                        return $play;
                    }
                    $message = $data['msg'] ?? ($data['message'] ?? '');
                    if (is_string($message) && $message !== '') {
                        $message = strip_tags($message);
                        $message = preg_replace('~https?://\S+|[A-Za-z0-9_+/=-]{24,}~', '[已隐藏]', $message);
                        $message = preg_replace('/[\x00-\x1f\x7f]/u', ' ', $message);
                        preg_match('/\A.{0,300}/us', $message, $part);
                        $this->lastFailure = '解析接口返回：' . ($part[0] ?? '未提供可播放地址');
                    }
                } catch (Throwable $error) {
                    error_log('Xplayer parser: ' . $error->getMessage());
                }
            }
        }
        // The built-in catalogue only supplies platform pages. With no custom
        // metadata or CMS media source, repeating getVid cannot rescue parsing.
        if (empty($GLOBALS['zyapi']) && trim((string) ($GLOBALS['user']['metadataApi'] ?? '')) === '') return '';
        if (!class_exists('VideoList')) require_once __DIR__ . '/Vinfo.Class.php';
        $list = new VideoList($this->url, $GLOBALS['zyapi'] ?? [], $this->http);
        $fallback = json_decode($list->printR(2), true);
        $fallbackUrl = $fallback['url'] ?? '';
        // Catalogue URLs may differ only by tracking parameters or point to an
        // episode page instead of a season page. Neither is a playable medium.
        return self::directMedia($fallbackUrl) && $fallbackUrl !== $this->url ? $fallbackUrl : '';
    }

    public function start(): array
    {
        // Older cache entries may contain catalogue HTML accepted as media.
        $cacheKey = 'parse-v3|' . Security::json([$this->url, $this->api, $this->special,
            $GLOBALS['zyapi'] ?? [], $GLOBALS['user']['metadataApi'] ?? '']);
        $cache = new Cache('Cache/', $this->cacheTime, $cacheKey);
        $cached = json_decode($cache->load() ?? '', true);
        $play = is_array($cached) ? ($cached['url'] ?? '') : '';
        $this->videoIdentity = is_array($cached['identity'] ?? null) ? $cached['identity'] : [];
        if (!Http::validUrl($play)) {
            $play = $this->getPlay();
            if (Http::validUrl($play)) $cache->write(Security::json(['url' => $play, 'identity' => $this->videoIdentity]));
        }
        $success = Http::validUrl($play);
        if (($GLOBALS['conn'] ?? null) instanceof PDO) {
            try { Statistics::record($GLOBALS['conn'], $success); }
            catch (Throwable $error) { error_log('Xplayer statistics: ' . $error->getMessage()); }
        }
        if (!$success) return ['code' => 100, 'msg' => $this->lastFailure ?: '未找到可播放地址：直链可直接播放，网页链接需配置可用解析接口'];
        $type = preg_match('/\.m3u8\z/i', (string) parse_url($play, PHP_URL_PATH)) ? 'hls' :
            (preg_match('/\.mpd\z/i', (string) parse_url($play, PHP_URL_PATH)) ? 'dash' :
            (preg_match('/\.flv\z/i', (string) parse_url($play, PHP_URL_PATH)) ? 'flv' : 'auto'));
        if (in_array($type, ['hls', 'dash'], true) && $this->secret) {
            $token = Security::issueToken($type === 'dash' ? 'dash-playlist' : 'playlist', $play, $this->secretKey, 43200);
            $play = 'api.php?type=' . ($type === 'dash' ? 'mpd' : 'm3u8') . '&vkey=' . rawurlencode($token);
        }
        return ['code' => 200, 'url' => $play, 'type' => $type, 'identity' => $this->videoIdentity, 'msg' => '解析成功'];
    }

    public static function http_curl($url, $phone = false, $cookie = ''): string
    {
        // Legacy signature retained; user-supplied cookies/referers are never forwarded.
        return (new Http())->get(Security::text($url, 12000))['body'];
    }
}

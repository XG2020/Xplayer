<?php
/** Extract media from configured parsers without executing or serving their scripts. */
require_once __DIR__ . '/Http.php';

final class PlaybackResolver
{
    private Http $http;
    private array $visited = [];
    private int $bytes = 0;
    private string $input = '';

    public function __construct(Http $http) { $this->http = $http; }

    public static function mediaType(string $url, $hint = ''): string
    {
        $hint = is_string($hint) ? strtolower(trim(explode(';', $hint)[0])) : '';
        $types = ['hls' => 'hls', 'm3u8' => 'hls', 'application/x-mpegurl' => 'hls',
            'application/vnd.apple.mpegurl' => 'hls', 'dash' => 'dash', 'mpd' => 'dash',
            'application/dash+xml' => 'dash', 'flv' => 'flv', 'video/x-flv' => 'flv'];
        if (isset($types[$hint])) return $types[$hint];
        $extension = strtolower(pathinfo((string) parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
        return $types[$extension] ?? 'auto';
    }

    public function resolve(string $requestUrl, string $input): array
    {
        $this->visited = []; $this->bytes = 0; $this->input = $input;
        return $this->page($requestUrl, 0);
    }

    private function fetch(string $url): array
    {
        $url = explode('#', $url, 2)[0];
        if (!Http::validUrl($url)) throw new RuntimeException('网页解析包含无效的页面地址');
        if (isset($this->visited[$url]) || count($this->visited) >= 3) {
            throw new RuntimeException('网页解析嵌套或请求次数超过限制');
        }
        $this->visited[$url] = true;
        // Http validates and pins public DNS at every redirect; never bypass it here.
        $response = $this->http->get($url, 2097152);
        $length = strlen($response['body']);
        $this->bytes += $length;
        if ($length > 2097152 || $this->bytes > 4194304) throw new RuntimeException('网页解析响应超过大小限制');
        return $response;
    }

    private function candidate(array $data, string $base, bool $json = false, bool $element = false): array
    {
        $details = is_array($data['data'] ?? null) ? array_replace($data, $data['data']) : $data;
        $url = $details['url'] ?? $details['file'] ?? $details['src'] ?? $details['videoUrl'] ?? $details['source'] ?? '';
        if (!is_string($url) || $url === '' || strlen($url) > 12000) return [];
        if (!$json && isset($details['encrypt'])) {
            if ((string) $details['encrypt'] === '1') $url = rawurldecode($url);
            elseif ((string) $details['encrypt'] === '2') $url = base64_decode($url, true) ?: '';
            elseif ((string) $details['encrypt'] !== '0') return [];
        }
        if ($url === '' || preg_match('/[\x00-\x20\x7f\\\\]/', $url)) return [];
        // JSON APIs historically return absolute URLs; HTML player sources may be relative.
        $url = $json ? $url : Http::resolveUrl($base, $url);
        if (!Http::validUrl($url) || explode('#', $url, 2)[0] === explode('#', $this->input, 2)[0]) return [];
        $hint = $details['type'] ?? $details['mimeType'] ?? '';
        $type = self::mediaType($url, $hint);
        $path = (string) parse_url($url, PHP_URL_PATH);
        $media = preg_match('/\.(?:mp4|m3u8|mpd|flv|webm|m4v|mov|m4a|mp3|ogg|wav)\z/i', $path) === 1;
        // A reflected platform/page URL or a random URL in a script is not media.
        $typed = is_string($hint) && preg_match('~\A(?:mp4|webm|m4v|mov|m4a|mp3|ogg|wav|video/(?:mp4|webm)|audio/(?:mpeg|ogg|wav))\z~i', $hint);
        if (!$json && !$element && !$media && $type === 'auto' && !$typed) return [];
        if (!$json && preg_match('/\.(?:html?|php|aspx?)\z/i', $path) && !$element && $type === 'auto' && !$typed) return [];
        $result = ['url' => $url, 'type' => $type];
        foreach (['vid', 'tvid', 'videoId'] as $field) {
            $value = $details[$field] ?? null;
            if ((is_string($value) || is_int($value)) && preg_match('/\A[A-Za-z0-9_=-]{1,128}\z/', (string) $value)) {
                $result[$field] = (string) $value;
            }
        }
        return $result;
    }

    private function page(string $url, int $depth): array
    {
        $response = $this->fetch($url);
        $body = preg_replace('/\A\xEF\xBB\xBF/', '', $response['body']);
        $base = $response['url'];
        $data = json_decode($body, true, 32);
        if (is_array($data)) return $this->candidate($data, $base, true) ?:
            ['msg' => $data['msg'] ?? $data['message'] ?? '解析接口未提供有效媒体地址'];
        if (!class_exists('DOMDocument')) return ['msg' => '网页解析需要启用 PHP DOM 扩展'];
        $document = new DOMDocument();
        $document->resolveExternals = false;
        $document->substituteEntities = false;
        $previous = libxml_use_internal_errors(true);
        try { $loaded = $document->loadHTML('<?xml encoding="UTF-8">' . $body, LIBXML_NONET | LIBXML_COMPACT); }
        finally { libxml_clear_errors(); libxml_use_internal_errors($previous); }
        if (!$loaded) return ['msg' => '网页解析未返回有效页面'];
        // Honour a page's relative resource base without fetching it.
        $baseNode = $document->getElementsByTagName('base')->item(0);
        if ($baseNode && $baseNode->hasAttribute('href')) {
            $reference = Http::resolveUrl($base, $baseNode->getAttribute('href'));
            if (Http::validUrl($reference)) $base = $reference;
        }
        foreach (['video', 'audio'] as $tag) {
            foreach ($document->getElementsByTagName($tag) as $video) {
                $sources = [$video];
                foreach ($video->getElementsByTagName('source') as $source) $sources[] = $source;
                foreach ($sources as $source) {
                    $result = $this->candidate(['url' => $source->getAttribute('src'), 'type' => $source->getAttribute('type')], $base, false, true);
                    if ($result) return $result;
                }
            }
        }
        $configs = [];
        $tokenScript = false;
        $playerScripts = [];
        $encryptedScript = null;
        foreach ($document->getElementsByTagName('script') as $script) {
            if ($script->hasAttribute('src')) {
                $scriptUrl = Http::resolveUrl($base, $script->getAttribute('src'));
                $tokenScript = $tokenScript || $scriptUrl === Http::resolveUrl($response['url'], 'assets/player.js');
                $playerScripts[explode('?', explode('#', $scriptUrl, 2)[0], 2)[0]] = true;
                continue; // Do not fetch or run scripts, advertising or page navigation.
            }
            $source = $script->textContent;
            if ($script->getAttribute('id') === 'TempScript') {
                // Duplicate payload containers are ambiguous; do not select one arbitrarily.
                $encryptedScript = $encryptedScript === null ? $source : '';
            }
            // Only recognized player configuration contexts, never arbitrary URL strings.
            $code = self::codeMask($source);
            preg_match_all('/\b(?:(?:player(?:_[A-Za-z0-9_]+)?|playerConfig|config|videoObject)\s*=|new\s+(?:DPlayer|Artplayer|Clappr\.Player|ckplayer)\s*\(|jwplayer\([^;]*?\)\.setup\s*\()\s*(\{)/', $code, $matches, PREG_OFFSET_CAPTURE);
            foreach (array_slice($matches[1], 0, 30) as $match) {
                $position = $match[1];
                $config = self::object($source, $position, 0);
                if (is_array($config)) $configs[] = $config;
            }
        }
        // AlphaPlayer pages carry a self-contained encrypted JSON result. Recognize
        // their actual DOM and same-origin script paths before reading that payload.
        if ($encryptedScript !== null && $encryptedScript !== '' && $document->getElementById('AlphaPlayer')) {
            $knownPlayer = true;
            foreach (['/public/js/Utils.js', '/public/js/player.js', '/extend/crypto-js_4-1-1-min.js'] as $path) {
                if (!isset($playerScripts[Http::resolveUrl($response['url'], $path)])) $knownPlayer = false;
            }
            if ($knownPlayer) {
                $envelope = self::encryptedResultLiteral($encryptedScript);
                if ($envelope !== null) {
                    require_once __DIR__ . '/EncryptedPlayerResult.php';
                    $decoded = EncryptedPlayerResult::decode($envelope, $this->input);
                    if (is_array($decoded)) {
                        $result = $this->candidate($decoded, $response['url'], true);
                        if ($result) return $result;
                    }
                }
                return ['msg' => '网页解析未返回当前视频的有效媒体结果'];
            }
        }
        foreach ($configs as $config) {
            $choices = [];
            if (is_array($config['video'] ?? null)) $choices[] = $config['video'];
            if (is_array($config['sources'] ?? null)) {
                foreach ($config['sources'] as $source) if (is_array($source)) $choices[] = $source;
            }
            $choices[] = $config;
            foreach ($choices as $choice) {
                $result = $this->candidate($choice, $base);
                if ($result) return $result;
            }
        }
        // A known web-player protocol: the page provides a token, then its player.js
        // requests a same-origin JSON result. Tokens never leave that origin or reach the browser.
        if ($tokenScript) {
            foreach ($configs as $config) {
                $token = $config['apiToken'] ?? null;
                if (!is_string($token) || $token === '' || strlen($token) > 8192 ||
                    ($config['videoUrl'] ?? null) !== $this->input || preg_match('/[\x00-\x20\x7f]/', $token)) continue;
                $address = Http::resolveUrl($response['url'], 'api/resolve.php?token=' . rawurlencode($token));
                $reply = $this->fetch($address);
                $result = json_decode($reply['body'], true, 32);
                if (!is_array($result)) return ['msg' => '网页解析后续接口未返回 JSON'];
                if (($result['code'] ?? null) != 200) return ['msg' => is_string($result['msg'] ?? null) ? $result['msg'] : '网页解析后续接口未成功'];
                return $this->candidate($result, $reply['url'], true) ?: ['msg' => '网页解析后续接口未提供媒体地址'];
            }
        }
        if ($depth < 2) {
            foreach ($document->getElementsByTagName('iframe') as $frame) {
                if (!$frame->hasAttribute('src') || trim($frame->getAttribute('src')) === '') continue;
                $address = Http::resolveUrl($base, $frame->getAttribute('src'));
                if (!Http::validUrl($address) || explode('#', $address, 2)[0] === explode('#', $this->input, 2)[0]) continue;
                try {
                    $result = $this->page($address, $depth + 1);
                    if (isset($result['url']) && Http::validUrl($result['url'])) return $result;
                } catch (Throwable $error) { /* Try another bounded frame or the next configured parser. */ }
                if (count($this->visited) >= 3) break;
            }
        }
        return ['msg' => '网页解析未取得媒体地址：页面可能依赖动态脚本、验证或已失效，请更换接口或使用 JSON 解析接口'];
    }

    private static function encryptedResultLiteral(string $source): ?string
    {
        $code = self::codeMask($source);
        preg_match_all('/\bresult\s*=(?!=)/', $code, $assignments, PREG_OFFSET_CAPTURE);
        if (count($assignments[0]) !== 1) return null;
        preg_match_all('/\b(?:let|const|var)\s+result\s*=(?!=)/', $code, $matches, PREG_OFFSET_CAPTURE);
        if (count($matches[0]) !== 1) return null;
        [$assignment, $offset] = $matches[0][0];
        $position = $offset + strlen($assignment);
        self::space($source, $position);
        $value = self::quoted($source, $position);
        self::space($source, $position);
        // A literal followed by concatenation or another expression is not the result.
        if (!in_array($source[$position] ?? '', ['', ';'], true)) return null;
        return $value;
    }

    private static function space(string $source, int &$position): void
    {
        $length = strlen($source);
        while ($position < $length) {
            if (ctype_space($source[$position])) { $position++; continue; }
            if (substr($source, $position, 2) === '//') {
                $end = strpos($source, "\n", $position + 2); $position = $end === false ? $length : $end + 1;
            } elseif (substr($source, $position, 2) === '/*') {
                $end = strpos($source, '*/', $position + 2); $position = $end === false ? $length : $end + 2;
            } else break;
        }
    }

    /** Skip a string/template/regexp token while preserving all following offsets. */
    private static function literalEnd(string $source, int $position): int
    {
        $quote = $source[$position++]; $length = strlen($source); $characterClass = false;
        while ($position < $length) {
            $character = $source[$position++];
            if ($character === '\\') { $position = min($length, $position + 1); continue; }
            if ($quote === '/') {
                if ($character === '[') $characterClass = true;
                if ($character === ']') $characterClass = false;
                if ($character === "\n" || $character === "\r") return $length;
            }
            if ($character === $quote && !$characterClass) return $position;
        }
        return $length;
    }

    /** Locate configuration only in code, never in comments or quoted examples. */
    private static function codeMask(string $source): string
    {
        $result = ''; $position = 0; $length = strlen($source);
        while ($position < $length) {
            $start = $position; $character = $source[$position];
            if (substr($source, $position, 2) === '//' || substr($source, $position, 2) === '/*') {
                self::space($source, $position);
            } elseif ($character === '`') {
                // Template interpolation can contain nested templates and arbitrary JS.
                // This static adapter deliberately declines that script as a whole.
                return str_repeat(' ', $length);
            } elseif (in_array($character, ['"', "'"], true) ||
                ($character === '/' && self::startsRegexp($source, $position))) {
                $position = self::literalEnd($source, $position);
            }
            if ($position > $start) { $result .= str_repeat(' ', $position - $start); continue; }
            $result .= $character; $position++;
        }
        return $result;
    }

    private static function startsRegexp(string $source, int $position): bool
    {
        $prefix = rtrim(substr($source, max(0, $position - 80), min(80, $position)));
        return $prefix === '' || str_contains('=(:,!&|?;{[}+-*%^~<>', substr($prefix, -1)) ||
            preg_match('/\b(?:return|throw|case|yield|void|typeof|delete|in|of|instanceof|else|do)\z/', $prefix) === 1;
    }

    /** Decode a JS string literal as data; no expressions, interpolation or executable code. */
    private static function quoted(string $source, int &$position): ?string
    {
        $quote = $source[$position++] ?? '';
        if ($quote !== '"' && $quote !== "'") return null;
        $result = ''; $length = strlen($source);
        while ($position < $length) {
            $character = $source[$position++];
            if ($character === $quote) return $result;
            if ($character !== '\\') { $result .= $character; continue; }
            if ($position >= $length) return null;
            $escape = $source[$position++];
            if ($escape === 'u' || $escape === 'x') {
                $size = $escape === 'u' ? 4 : 2; $digits = substr($source, $position, $size);
                if (strlen($digits) !== $size || !ctype_xdigit($digits)) return null;
                $position += $size;
                if ($escape === 'x') { $result .= chr(hexdec($digits)); continue; }
                $encoded = '\\u' . $digits;
                if (hexdec($digits) >= 0xd800 && hexdec($digits) <= 0xdbff) {
                    $low = substr($source, $position, 6);
                    if (!preg_match('/\A\\\\u[dD][c-fC-F][0-9a-fA-F]{2}\z/', $low)) return null;
                    $encoded .= $low; $position += 6;
                }
                $decoded = json_decode('"' . $encoded . '"');
                if (!is_string($decoded)) return null;
                $result .= $decoded;
            } else {
                $result .= ['n' => "\n", 'r' => "\r", 't' => "\t", 'b' => "\x08", 'f' => "\x0c", 'v' => "\x0b", '0' => "\0", "\n" => '', "\r" => ''][$escape] ?? $escape;
            }
        }
        return null;
    }

    private static function skipExpression(string $source, int &$position): void
    {
        $level = 0; $length = strlen($source); $start = $position;
        while ($position < $length) {
            self::space($source, $position);
            $character = $source[$position] ?? '';
            if (in_array($character, ['"', "'", '`'], true) ||
                ($character === '/' && ($position === $start || self::startsRegexp($source, $position)))) {
                $position = self::literalEnd($source, $position); continue;
            }
            if ($level === 0 && ($character === ',' || $character === '}' || $character === ']')) return;
            if (str_contains('({[', $character) && $character !== '') $level++;
            elseif (str_contains(')}]', $character) && $character !== '') $level--;
            $position++;
        }
    }

    /** Read only literal fields, skipping functions/expressions even after a quoted prefix. */
    private static function object(string $source, int &$position, int $depth): ?array
    {
        if ($depth > 8) return null;
        $array = ($source[$position] ?? '') === '[';
        if (!$array && ($source[$position] ?? '') !== '{') return null;
        $end = $array ? ']' : '}'; $position++; $result = []; $fields = 0;
        while ($position < strlen($source) && ++$fields <= 200) {
            self::space($source, $position);
            if (($source[$position] ?? '') === $end) { $position++; return $result; }
            $key = count($result);
            if (!$array) {
                if (in_array($source[$position] ?? '', ['"', "'"], true)) $key = self::quoted($source, $position);
                elseif (preg_match('/\G[A-Za-z_$][A-Za-z0-9_$]*/', $source, $match, 0, $position)) { $key = $match[0]; $position += strlen($key); }
                else return null;
                self::space($source, $position);
                if (($source[$position++] ?? '') !== ':') return null;
                self::space($source, $position);
            }
            $start = $position; $value = null; $valid = true;
            $character = $source[$position] ?? '';
            if ($character === '"' || $character === "'") { $value = self::quoted($source, $position); $valid = $value !== null; }
            elseif ($character === '{' || $character === '[') { $value = self::object($source, $position, $depth + 1); $valid = $value !== null; }
            elseif (preg_match('/\G(?:true|false|null|-?\d+(?:\.\d+)?)/', $source, $match, 0, $position)) {
                $value = json_decode($match[0], true); $position += strlen($match[0]);
            } else $valid = false;
            self::space($source, $position);
            if (!$valid || !in_array($source[$position] ?? '', [',', $end], true)) {
                if ($key !== null) unset($result[$key]);
                $position = $start; self::skipExpression($source, $position);
            } elseif ($key !== null) $result[$key] = $value;
            if (($source[$position] ?? '') === ',') { $position++; continue; }
            if (($source[$position] ?? '') === $end) { $position++; return $result; }
            return null;
        }
        return null;
    }
}

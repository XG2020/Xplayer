<?php
/** Bounded outbound HTTP. A URL's public addresses are checked and pinned per hop. */
require_once __DIR__ . '/Security.php';

class Http
{
    public static function validUrl($url): bool
    {
        if (!is_string($url) || strlen($url) > 12000 || preg_match('/[\x00-\x20\x7f\\\\]/', $url)) {
            return false;
        }
        $parts = parse_url($url);
        return is_array($parts) && in_array(strtolower($parts['scheme'] ?? ''), ['http', 'https'], true) &&
            !empty($parts['host']) && !isset($parts['user']) && !isset($parts['pass']) &&
            filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    public static function publicIp(string $ip): bool
    {
        // Mapped IPv6 can otherwise tunnel an IPv4 loopback/private address.
        if (stripos($ip, '::ffff:') === 0) {
            return false;
        }
        $packed = @inet_pton($ip);
        if ($packed === false) {
            return false;
        }
        if (strlen($packed) === 16 && (ord($packed[0]) & 0xe0) !== 0x20) {
            return false; // only global-unicast 2000::/3
        }
        // Compare packed prefixes: compressed IPv6 spellings cannot bypass exclusions.
        if (strlen($packed) === 16 && (substr($packed, 0, 4) === hex2bin('20010db8') ||
            (substr($packed, 0, 2) === hex2bin('2001') && ord($packed[2]) < 2) ||
            substr($packed, 0, 2) === hex2bin('2002') ||
            (ord($packed[0]) === 0x3f && ord($packed[1]) === 0xff && (ord($packed[2]) & 0xf0) === 0))) {
            return false;
        }
        if (strlen($packed) === 4) {
            $octets = array_values(unpack('C4', $packed));
            if ($octets[0] >= 224 || $octets[0] === 0 ||
                ($octets[0] === 100 && $octets[1] >= 64 && $octets[1] <= 127) ||
                ($octets[0] === 198 && in_array($octets[1], [18, 19], true)) ||
                ($octets[0] === 192 && $octets[1] === 0 && in_array($octets[2], [0, 2], true)) ||
                ($octets[0] === 192 && $octets[1] === 88 && $octets[2] === 99) ||
                ($octets[0] === 198 && $octets[1] === 51 && $octets[2] === 100) ||
                ($octets[0] === 203 && $octets[1] === 0 && $octets[2] === 113)) {
                return false;
            }
        }
        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
    }

    public static function publicAddresses(string $url): array
    {
        if (!self::validUrl($url)) {
            throw new InvalidArgumentException('仅允许不含凭据的 HTTP/HTTPS 地址');
        }
        $host = strtolower(trim(parse_url($url, PHP_URL_HOST), '[]'));
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            $addresses = [$host];
        } else {
            if (!preg_match('/\A[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\z/', $host) ||
                !str_contains($host, '.') || str_ends_with($host, '.localhost') ||
                str_ends_with($host, '.local') || str_ends_with($host, '.invalid')) {
                throw new InvalidArgumentException('不允许本地或占位主机名');
            }
            $records = @dns_get_record($host, DNS_A | DNS_AAAA);
            $addresses = [];
            foreach ($records ?: [] as $record) {
                if (isset($record['ip'])) $addresses[] = $record['ip'];
                if (isset($record['ipv6'])) $addresses[] = $record['ipv6'];
            }
            // Some resolvers return CNAME only through dns_get_record.
            if (!$addresses) $addresses = @gethostbynamel($host) ?: [];
        }
        $addresses = array_values(array_unique($addresses));
        if (!$addresses) throw new RuntimeException('无法解析接口主机名');
        foreach ($addresses as $ip) {
            if (!self::publicIp($ip)) throw new InvalidArgumentException('已阻止内网、回环或保留地址请求');
        }
        return $addresses;
    }

    public static function resolveUrl(string $base, string $reference): string
    {
        $reference = trim($reference);
        if (preg_match('~^[a-z][a-z0-9+.-]*:~i', $reference)) return $reference;
        $baseParts = parse_url($base);
        if (!is_array($baseParts) || !isset($baseParts['scheme'], $baseParts['host'])) {
            throw new InvalidArgumentException('基地址无效');
        }
        if (str_starts_with($reference, '//')) return $baseParts['scheme'] . ':' . $reference;
        $authority = $baseParts['scheme'] . '://' . $baseParts['host'] .
            (isset($baseParts['port']) ? ':' . $baseParts['port'] : '');
        $path = ($baseParts['path'] ?? '') ?: '/';
        if ($reference === '') return $base;
        if ($reference[0] === '?') return $authority . $path . $reference;
        if ($reference[0] === '#') return $authority . $path .
            (isset($baseParts['query']) ? '?' . $baseParts['query'] : '') . $reference;
        $suffixOffset = strcspn($reference, '?#');
        $suffix = substr($reference, $suffixOffset);
        $referencePath = substr($reference, 0, $suffixOffset);
        $joined = str_starts_with($referencePath, '/') ? $referencePath :
            substr($path, 0, (int) strrpos($path, '/') + 1) . $referencePath;
        // RFC 3986 section 5.2.4. Preserve empty segments: // may be significant
        // to signed CDN URLs; /a/.. resolves to /, not /a or a collapsed filename.
        $resolved = '';
        while ($joined !== '') {
            if (str_starts_with($joined, '../')) $joined = substr($joined, 3);
            elseif (str_starts_with($joined, './')) $joined = substr($joined, 2);
            elseif (str_starts_with($joined, '/./')) $joined = substr($joined, 2);
            elseif ($joined === '/.') $joined = '/';
            elseif (str_starts_with($joined, '/../') || $joined === '/..') {
                $joined = $joined === '/..' ? '/' : substr($joined, 3);
                $resolved = preg_replace('~/[^/]*$~', '', $resolved);
            } elseif ($joined === '.' || $joined === '..') $joined = '';
            else {
                $end = strpos($joined, '/', $joined[0] === '/' ? 1 : 0);
                if ($end === false) { $resolved .= $joined; $joined = ''; }
                else { $resolved .= substr($joined, 0, $end); $joined = substr($joined, $end); }
            }
        }
        return $authority . $resolved . $suffix;
    }

    public function get(string $url, int $limit = 2097152): array
    {
        return $this->request($url, $limit);
    }

    private function request(string $url, int $limit, array $initialHeaders = []): array
    {
        if (!extension_loaded('curl')) throw new RuntimeException('需要启用 PHP cURL 扩展');
        for ($hop = 0; $hop <= 4; $hop++) {
            $addresses = self::publicAddresses($url);
            $host = trim(parse_url($url, PHP_URL_HOST), '[]');
            $port = parse_url($url, PHP_URL_PORT) ?: (strtolower(parse_url($url, PHP_URL_SCHEME)) === 'https' ? 443 : 80);
            $ip = $addresses[0];
            $resolve = $host . ':' . $port . ':' . (str_contains($ip, ':') ? '[' . $ip . ']' : $ip);
            $body = ''; $headers = []; $tooLarge = false;
            $curl = curl_init($url);
            curl_setopt_array($curl, [
                CURLOPT_RETURNTRANSFER => false,
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_TIMEOUT => 12,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2,
                CURLOPT_PROXY => '',
                CURLOPT_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
                CURLOPT_REDIR_PROTOCOLS => CURLPROTO_HTTP | CURLPROTO_HTTPS,
                CURLOPT_RESOLVE => [$resolve],
                CURLOPT_USERAGENT => 'Xplayer/1.12 (local source restoration)',
                // Adapter-only headers belong to the initial request, never a redirect destination.
                CURLOPT_HTTPHEADER => $hop === 0 ? $initialHeaders : [],
                CURLOPT_ENCODING => '',
                CURLOPT_HEADERFUNCTION => static function ($curl, string $line) use (&$headers): int {
                    $pair = explode(':', $line, 2);
                    if (count($pair) === 2) $headers[strtolower(trim($pair[0]))] = trim($pair[1]);
                    return strlen($line);
                },
                CURLOPT_WRITEFUNCTION => static function ($curl, string $chunk) use (&$body, &$tooLarge, $limit): int {
                    if (strlen($body) + strlen($chunk) > $limit) {
                        $tooLarge = true;
                        return 0;
                    }
                    $body .= $chunk;
                    return strlen($chunk);
                },
            ]);
            // Windows PHP installations often ship without a default CA bundle.
            // Honour an administrator-supplied bundle; otherwise use the bundled Mozilla roots.
            if ((string) ini_get('curl.cainfo') === '') {
                $caBundle = dirname(__DIR__) . '/assets/vendor/certificates/cacert.pem';
                if (is_file($caBundle)) curl_setopt($curl, CURLOPT_CAINFO, $caBundle);
            }
            $ok = curl_exec($curl);
            $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
            $error = curl_error($curl);
            curl_close($curl);
            if ($tooLarge) throw new RuntimeException('接口响应超过大小限制');
            if ($ok === false) throw new RuntimeException('接口请求失败：' . $error);
            if (in_array($status, [301, 302, 303, 307, 308], true) && isset($headers['location'])) {
                $url = self::resolveUrl($url, $headers['location']);
                continue; // Each redirect is resolved and pinned afresh, never blindly followed.
            }
            if ($status < 200 || $status >= 300) throw new RuntimeException('接口 HTTP 状态异常：' . $status);
            return ['body' => $body, 'url' => $url, 'headers' => $headers, 'status' => $status];
        }
        throw new RuntimeException('接口重定向次数过多');
    }

    public function json(string $url): array
    {
        return $this->decodeJson($this->get($url));
    }

    /** Original getVid requires its exact request URL as Referer; other clients remain unchanged. */
    public function jsonWithSelfReferer(string $url): array
    {
        return $this->decodeJson($this->request($url, 2097152, ['Accept: application/json', 'Referer: ' . $url]));
    }

    private function decodeJson(array $response): array
    {
        $data = json_decode($response['body'], true, 32, JSON_THROW_ON_ERROR);
        if (!is_array($data)) throw new RuntimeException('接口未返回 JSON 对象');
        return $data;
    }
}

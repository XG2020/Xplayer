<?php
/** Browser configuration and bounded HLS/DASH manifest rewriting. */
require_once __DIR__ . '/Common.Class.php';
require_once __DIR__ . '/PlayerAssets.php';

final class Player
{
    public static function danmakuApi(array $user): string
    {
        return self::danmakuApis($user)[0] ?? '';
    }

    public static function danmakuApis(array $user): array
    {
        $api = trim((string) ($user['danmuku'] ?? ''));
        // Empty configuration selects the built-in library; retain only its old internal marker.
        if ($api === '' || $api === 'danmaku.php') return ['danmaku.php'];
        try {
            $sources = explode("\n", Settings::normalizeDanmaku($api));
        } catch (InvalidArgumentException $error) {
            return [];
        }
        return $sources;
    }

    public static function settings(array $user, bool $adsEnabled): array
    {
        $data = [
            'color' => preg_match('/\A#[0-9a-fA-F]{6}\z/', (string) $user['themeColor']) ? $user['themeColor'] : '#ff0000',
            'logo' => Settings::assetUrl($user['logo'] ?? '') ? PlayerAssets::branding((string) $user['logo'], $user) : '',
            'trytime' => 0, 'waittime' => 0, 'sendtime' => 3,
            'dmrule' => 'assets/docs/danmaku-rules.html', 'pbgjz' => '',
            'danmuon' => !empty($user['danmuon']) && self::danmakuApi($user) !== '',
            'ads' => ['state' => 'off', 'set' => ['state' => '2', 'group' => '',
                'pic' => ['time' => 3, 'img' => '', 'link' => ''], 'vod' => ['url' => '', 'link' => '']],
                'pause' => ['state' => 'off', 'pic' => '', 'link' => '']],
        ];
        if (!$adsEnabled) return $data;
        $start = str_getcsv((string) ($user['startAD'] ?? ''), ',', '"', '\\');
        if (count($start) >= 3 && in_array($start[0], ['pic', 'video', 'vod'], true) &&
            Settings::assetUrl($start[1]) && Settings::assetUrl($start[2])) {
            $data['ads']['state'] = 'on';
            $data['ads']['set']['state'] = $start[0] === 'pic' ? '2' : '1';
            $data['ads']['set']['pic'] = ['img' => $start[1], 'link' => $start[2], 'time' => max(1, min(60, (int) ($start[3] ?? 3)))];
            $data['ads']['set']['vod'] = ['url' => $start[1], 'link' => $start[2]];
        }
        $pause = str_getcsv((string) ($user['pauseAD'] ?? ''), ',', '"', '\\');
        if (count($pause) >= 2 && Settings::assetUrl($pause[0]) && Settings::assetUrl($pause[1])) {
            $data['ads']['pause'] = ['state' => 'on', 'pic' => $pause[0], 'link' => $pause[1]];
        }
        return $data;
    }

    public static function rewritePlaylist(string $body, string $base, string $key): string
    {
        $body = preg_replace('/\A\xEF\xBB\xBF/', '', $body);
        if (strlen($body) > 2097152 || !str_starts_with(ltrim($body), '#EXTM3U')) {
            throw new RuntimeException('响应不是有效的 HLS 播放列表');
        }
        $child = static function (string $reference, bool $playlist) use ($base, $key): string {
            $url = Http::resolveUrl($base, $reference);
            if (!Http::validUrl($url)) throw new RuntimeException('HLS 包含不支持的资源协议');
            if ($playlist) return 'api.php?type=m3u8&vkey=' . rawurlencode(Security::issueToken('playlist', $url, $key, 43200));
            return $url;
        };
        $nextIsPlaylist = false;
        $lines = preg_split('/\r\n|\n|\r/', $body);
        foreach ($lines as &$line) {
            $trimmed = trim($line);
            if ($trimmed === '') continue;
            if (str_starts_with($trimmed, '#')) {
                $tag = strtoupper(explode(':', $trimmed, 2)[0]);
                $isPlaylist = in_array($tag, ['#EXT-X-MEDIA', '#EXT-X-I-FRAME-STREAM-INF', '#EXT-X-RENDITION-REPORT'], true);
                $line = preg_replace_callback('/URI="([^"]*)"/', static function ($matches) use ($child, $isPlaylist) {
                    return 'URI="' . $child($matches[1], $isPlaylist || preg_match('/\.m3u8(?:[?#]|$)/i', $matches[1])) . '"';
                }, $line);
                if ($tag === '#EXT-X-STREAM-INF') $nextIsPlaylist = true;
            } else {
                $line = $child($trimmed, $nextIsPlaylist || preg_match('/\.m3u8(?:[?#]|$)/i', $trimmed));
                $nextIsPlaylist = false;
            }
        }
        unset($line);
        return implode("\n", $lines);
    }

    public static function rewriteDashManifest(string $body, string $base, string $key): string
    {
        if (strlen($body) > 2097152 || !Http::validUrl($base) || preg_match('/<!\s*(?:DOCTYPE|ENTITY)\b/i', str_replace("\0", '', $body))) {
            throw new RuntimeException('响应不是允许的 DASH 清单');
        }
        if (!class_exists('DOMDocument')) throw new RuntimeException('DASH 清单转发需要启用 PHP DOM 扩展');
        $document = new DOMDocument();
        $document->resolveExternals = false;
        $document->substituteEntities = false;
        $document->validateOnParse = false;
        $previousErrors = libxml_use_internal_errors(true);
        try {
            $loaded = $document->loadXML($body, LIBXML_NONET | LIBXML_COMPACT);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previousErrors);
        }
        $root = $document->documentElement;
        if (!$loaded || $document->doctype !== null || !$root || $root->localName !== 'MPD' ||
            !in_array($root->namespaceURI ?? '', ['', 'urn:mpeg:dash:schema:mpd:2011'], true)) {
            throw new RuntimeException('响应不是有效的 DASH MPD');
        }
        // DOM also rejects DTDs in UTF-16/XML encodings that evade a byte scan.
        // Remove stylesheet/other processing instructions before returning XML.
        $xpath = new DOMXPath($document);
        foreach ($xpath->query('//processing-instruction()') as $instruction) $instruction->parentNode->removeChild($instruction);
        $resolve = static function (string $reference, string $origin): string {
            $url = Http::resolveUrl($origin, trim($reference));
            if (!Http::validUrl($url)) throw new RuntimeException('DASH 包含不支持的资源协议');
            return $url;
        };
        $documentBase = $base;
        if ($root->hasAttributeNS('http://www.w3.org/XML/1998/namespace', 'base')) {
            $documentBase = $resolve($root->getAttributeNS('http://www.w3.org/XML/1998/namespace', 'base'), $base);
            $root->setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:base', $documentBase);
        }
        $baseNodes = [];
        foreach ($root->childNodes as $child) {
            if (!$child instanceof DOMElement || $child->namespaceURI !== $root->namespaceURI) continue;
            if ($child->localName === 'BaseURL') $baseNodes[] = $child;
            if ($child->localName === 'Location') {
                $target = $resolve($child->textContent, $documentBase);
                $child->textContent = 'api.php?type=mpd&vkey=' . rawurlencode(Security::issueToken('dash-playlist', $target, $key, 43200));
            }
        }
        if ($baseNodes) {
            foreach ($baseNodes as $node) $node->textContent = $resolve($node->textContent, $documentBase);
        } else {
            $name = ($root->prefix ? $root->prefix . ':' : '') . 'BaseURL';
            $node = $document->createElementNS($root->namespaceURI, $name);
            $node->textContent = $resolve('.', $documentBase);
            $root->insertBefore($node, $root->firstChild);
        }
        // Media BaseURLs, SegmentTemplate/List/Base, timelines and DRM metadata
        // stay untouched. Only the manifest itself is fetched through this site.
        $document->encoding = 'UTF-8';
        $result = $document->saveXML();
        if (!is_string($result)) throw new RuntimeException('DASH 清单处理失败');
        return $result;
    }
}

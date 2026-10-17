<?php
/** Built-in getVid catalogue, replaceable metadata adapters and optional MacCMS sources. */
require_once __DIR__ . '/Common.Class.php';
require_once __DIR__ . '/BuiltinEndpoint.php';

class VideoList
{
    private string $url;
    private array $api;
    private Http $http;
    private bool $fullBuiltinAttempted = false;

    public function __construct($url, $api = [], ?Http $http = null)
    {
        $this->url = Security::text($url, 12000);
        $this->api = is_array($api) ? array_values($api) : [];
        $this->http = $http ?? new Http();
    }

    private function metadata(?string $endpointOverride = null): array
    {
        $meta = ['name' => '', 'episode' => 1, 'episodeAll' => 0];
        if (!Http::validUrl($this->url) && !preg_match('~^[a-z][a-z0-9+.-]*:~i', $this->url)) {
            $meta['name'] = mbSafeSubstring($this->url, 300);
            return $meta;
        }
        $endpoint = $endpointOverride ?? trim((string) ($GLOBALS['user']['metadataApi'] ?? ''));
        // A direct media file has no platform metadata unless its owner configured an adapter.
        if ($endpoint === '' && parseUrl::directMedia($this->url)) return $meta;
        $builtin = $endpoint === '';
        try {
            if ($builtin) $endpoint = BuiltinEndpoint::url();
            if (Http::validUrl(str_replace('{url}', 'https%3A%2F%2Fexample.com', $endpoint))) {
                $request = parseUrl::endpoint($endpoint, $this->url);
                $builtin = self::builtInRequest($request);
                if ($builtin) {
                    parse_str((string) parse_url($request, PHP_URL_QUERY), $query);
                    if (!array_key_exists('type', $query)) $this->fullBuiltinAttempted = true;
                }
                $response = $builtin ? $this->http->jsonWithSelfReferer($request) : $this->http->json($request);
                $data = isset($response['data']) && is_array($response['data']) ? $response['data'] : $response;
                $name = $data['name'] ?? ($data['title'] ?? '');
                $meta['name'] = is_string($name) ? mbSafeSubstring($name, 300) : '';
                $meta['episode'] = max(1, min(10000, (int) ($data['episode'] ?? 1)));
                $meta['episodeAll'] = max(0, min(10000, (int) ($data['episodeAll'] ?? 0)));
                foreach (['vid', 'tvid', 'videoId'] as $field) {
                    $value = $data[$field] ?? null;
                    if ((is_string($value) || is_int($value)) && preg_match('/\A[A-Za-z0-9_=-]{1,128}\z/', (string) $value)) $meta[$field] = (string) $value;
                }
                $meta['pic'] = self::seriesPicture($data['pic'] ?? '');
                if ($builtin && is_array($response['list'] ?? null)) $meta['catalogue'] = $response['list'];
                if (isset($data['episodes']) && is_array($data['episodes'])) $meta['episodes'] = $data['episodes'];
            }
        } catch (Throwable $error) {
            // cURL diagnostics can include the protected host or full request URL.
            error_log('Xplayer metadata: ' . ($builtin ? 'built-in request failed (' . get_class($error) . ')' : $error->getMessage()));
        }
        return $meta;
    }

    private static function builtInRequest(string $url): bool
    {
        return BuiltinEndpoint::matchesRequest($url);
    }

    private static function seriesPicture($value): string
    {
        if (!Settings::assetUrl($value)) return '';
        $parts = parse_url($value);
        // getVid returns this same rotating background for unrelated works. It is
        // not a work poster, and must never be displayed as catalogue artwork.
        // Store only a host fingerprint; this rule needs equality, not the address.
        if (hash('sha256', strtolower($parts['host'] ?? '')) === 'a7dcb493d545d21d2a6bbae2d3087918629a16a08380d5ca9bae6bbac8086e51' &&
            strtolower(rtrim(rawurldecode($parts['path'] ?? ''), '/')) === '/poster-background.php') return '';
        return $value;
    }

    public function printR($type = 1)
    {
        $this->fullBuiltinAttempted = false;
        $meta = $this->metadata();
        $catalogue = $meta['catalogue'] ?? null;
        unset($meta['catalogue']);
        $native = is_array($catalogue) ? $this->builtInList($catalogue, $meta) : null;
        $mgtv = $this->mgtvIdentity();
        if ($mgtv !== null && $this->fullBuiltinAttempted) {
            // getVid collapses MGTV previews/extras onto full episode labels.
            // A current-URL match alone cannot validate the remaining playlist.
            $native = ['code' => 204, 'msg' => '芒果正片选集暂不可用，未使用可能混入预告或彩蛋的列表', 'data' => $meta, 'video' => [], 'num' => 0];
        }
        $result = ['code' => 204, 'msg' => $meta['name'] === '' ? '未能识别片名，请检查剧集元数据接口' : '暂未取得当前视频的选集列表', 'data' => $meta, 'video' => [], 'num' => 0];
        // Mode 1 is the original catalogue; mode 3 explicitly asks configured MacCMS sources.
        // A typed title and mode 2 playback lookup still need the configured search adapters.
        $search = (int) $type !== 1 || !Http::validUrl($this->url);
        if (!$search && $native !== null) $result = $native;
        if ($search && $meta['name'] !== '') {
            foreach (array_slice($this->api, 0, 10) as $endpoint) {
                if (!is_string($endpoint) || $endpoint === '') continue;
                try {
                    $candidate = $this->getzyw($endpoint, $meta, true);
                    if (($candidate['code'] ?? 0) === 200) { $result = $candidate; break; }
                } catch (Throwable $error) {
                    error_log('Xplayer MacCMS: ' . $error->getMessage());
                }
            }
        }
        if (empty($result['video']) && $mgtv !== null && $this->fullBuiltinAttempted) {
            $official = $this->mgtvList($mgtv, $meta);
            if ($official !== null) $result = $official;
        }
        if (empty($result['video']) && isset($meta['episodes'])) {
            $play = []; $labels = [];
            foreach (array_slice($meta['episodes'], 0, 1000) as $episode) {
                if (!is_array($episode) || !Http::validUrl($episode['url'] ?? null)) continue;
                $play[] = $episode['url'];
                $labels[] = is_string($episode['name'] ?? null) ? $episode['name'] : (string) count($play);
            }
            if ($play) $result = ['code' => 200, 'msg' => '已读取自建剧集列表', 'data' => $meta, 'num' => 1,
                'video' => [['name' => $meta['name'], 'pic' => self::seriesPicture($meta['pic'] ?? ''), 'url' => [['name' => '剧集', 'play' => $play, 'labels' => $labels, 'episodeAll' => count($play)]]]]];
        }
        // A configured search may fail while getVid still has the platform's usable catalogue.
        if (empty($result['video']) && $native !== null) $result = $native;
        // Metadata-only adapters (including the old type=1 endpoint) need a separate full list.
        // Never repeat a full built-in request already attempted during this lookup.
        if (empty($result['video']) && !$this->fullBuiltinAttempted && Http::validUrl($this->url) && !parseUrl::directMedia($this->url)) {
            $fallbackMeta = $this->metadata('');
            $catalogue = $fallbackMeta['catalogue'] ?? null;
            unset($fallbackMeta['catalogue']);
            if ($meta['name'] !== '') $fallbackMeta = array_replace($fallbackMeta, $meta);
            $fallback = $mgtv !== null ? $this->mgtvList($mgtv, $fallbackMeta) :
                (is_array($catalogue) ? $this->builtInList($catalogue, $fallbackMeta) : null);
            if ($fallback !== null) $result = $fallback;
        }
        if ((int) $type === 2) {
            foreach ($result['video'] as $video) {
                foreach ($video['url'] as $source) {
                    $play = $source['play'][max(0, ($result['data']['currentIndex'] ?? ($meta['episode'] - 1)))] ?? '';
                    if (Http::validUrl($play)) return Security::json(['code' => 200, 'name' => $video['name'], 'url' => $play]);
                }
            }
            return Security::json(['code' => 100, 'msg' => $result['msg'], 'url' => '']);
        }
        return $result;
    }

    private function builtInList(array $list, array $meta): ?array
    {
        $play = []; $labels = []; $titles = []; $covers = []; $vip = []; $currentIndex = null;
        foreach ($list as $label => $episode) {
            if (!is_array($episode) || !Http::validUrl($episode['url'] ?? null)) continue;
            $url = $episode['url'];
            $index = count($play);
            $play[] = $url;
            $labels[] = (string) $label;
            $titles[] = is_string($episode['cont'] ?? null) ? $episode['cont'] : '';
            $covers[] = self::seriesPicture($episode['cover'] ?? '');
            $vip[] = is_scalar($episode['vip'] ?? null) ? $episode['vip'] : '';
            if ($currentIndex === null && self::sameVideoUrl($url, $this->url)) $currentIndex = $index;
        }
        if (!$play) return null;
        if ($currentIndex === null) {
            $currentIndex = $this->bilibiliSeasonEpisode($play, $meta['vid'] ?? '');
            if ($currentIndex !== null) $meta['resolvedUrl'] = $play[$currentIndex];
        }
        if ($currentIndex === null) {
            // Episode numbers alone cannot prove identity. Some upstream lists
            // contain clips numbered like full episodes, but omit this video.
            return ['code' => 204, 'msg' => '上游选集未包含当前视频，无法确认当前集', 'data' => $meta, 'video' => [], 'num' => 0];
        }
        $picture = self::seriesPicture($meta['pic'] ?? '');
        // The catalogue's cover entries are episode stills. Do not promote one
        // to a series poster, including when an adapter copies it into pic.
        if (in_array($picture, $covers, true)) $picture = '';
        $meta['pic'] = $picture;
        $meta['episodeAll'] = count($play);
        $meta['itemCount'] = count($play);
        if ($currentIndex !== null) {
            $meta['currentIndex'] = $currentIndex;
            $meta['episodeLabel'] = $labels[$currentIndex];
            $meta['episodeTitle'] = $titles[$currentIndex];
            $meta['currentCover'] = $covers[$currentIndex];
        }
        return ['code' => 200, 'msg' => '已读取平台选集列表', 'data' => $meta, 'num' => 1,
            'video' => [['name' => $meta['name'], 'pic' => $picture,
                'url' => [['name' => '平台选集', 'play' => $play, 'labels' => $labels, 'titles' => $titles,
                    'covers' => $covers, 'vip' => $vip, 'episodeAll' => count($play), 'itemCount' => count($play)]]]]];
    }

    public function getzyw($endpoint, $video, $is = false)
    {
        $name = is_string($video['name'] ?? null) ? $video['name'] : '';
        if ($name === '') return ['code' => 204, 'msg' => '缺少片名', 'video' => [], 'num' => 0];
        $data = $this->http->json(self::cmsEndpoint(Security::text($endpoint, 12000), $name));
        // A typed name can be matched directly; a playing URL must be present in the result.
        $normal = static fn(string $title): string => strtolower(preg_replace('/[\s_\-·:：]+/u', '', $title));
        if (!Http::validUrl($this->url) && is_array($data['list'] ?? null)) {
            $exact = array_values(array_filter($data['list'], static fn($row): bool => is_array($row) &&
                is_string($row['vod_name'] ?? null) && $normal($row['vod_name']) === $normal($name)));
            if ($exact) $data['list'] = $exact;
        }
        $result = $this->getvideo($data, (int) ($video['episodeAll'] ?? 0));
        $matches = $result['video'];
        if (Http::validUrl($this->url)) {
            $matches = array_values(array_filter($matches, function (array $item): bool {
                foreach ($item['url'] as $source) {
                    foreach ($source['play'] as $play) if (self::sameVideoUrl($play, $this->url)) return true;
                }
                return false;
            }));
        }
        usort($matches, static function (array $left, array $right): int {
            $count = static fn(array $item): int => max(array_map(static fn(array $source): int => count($source['play']), $item['url']));
            return $count($right) <=> $count($left);
        });
        $result['video'] = $matches ? [$matches[0]] : [];
        $result['num'] = $matches ? 1 : 0;
        $result['code'] = $matches ? 200 : 204;
        $result['msg'] = $matches ? '已匹配当前视频的完整选集' : '资源站未返回包含当前视频链接的选集';
        $result['data'] = $video;
        $result['episode'] = max(1, (int) ($video['episode'] ?? 1));
        if ($is) return $result;
        foreach ($result['video'] as $item) {
            foreach ($item['url'] as $source) {
                $url = $source['play'][$result['episode'] - 1] ?? '';
                if (Http::validUrl($url)) return Security::json(['code' => 200, 'name' => $item['name'], 'url' => $url]);
            }
        }
        return Security::json(['code' => 100, 'msg' => '没有匹配剧集', 'url' => '']);
    }

    private static function cmsEndpoint(string $endpoint, string $name): string
    {
        $parts = parse_url($endpoint);
        // A standard MacCMS base is commonly copied without its search query.
        // Keep explicit query prefixes/templates and other adapters unchanged.
        if (Http::validUrl($endpoint) && !array_key_exists('query', $parts) && !array_key_exists('fragment', $parts) &&
            preg_match('~/provide/vod/?\z~i', $parts['path'] ?? '')) {
            return $endpoint . '?ac=videolist&wd=' . rawurlencode($name);
        }
        return parseUrl::endpoint($endpoint, $name);
    }

    private function bilibiliSeasonEpisode(array $play, $vid): ?int
    {
        $source = parse_url($this->url);
        if (!in_array(strtolower($source['host'] ?? ''), ['bilibili.com', 'www.bilibili.com'], true) ||
            !preg_match('~\A/bangumi/play/ss[0-9]+/?\z~', $source['path'] ?? '') ||
            !is_string($vid) || !preg_match('/\A[0-9]+\z/', $vid)) return null;
        $matches = [];
        foreach ($play as $index => $url) {
            $episode = parse_url($url);
            if (in_array(strtolower($episode['host'] ?? ''), ['bilibili.com', 'www.bilibili.com'], true) &&
                preg_match('~\A/bangumi/play/ep([0-9]+)/?\z~', $episode['path'] ?? '', $match) && $match[1] === $vid) $matches[] = $index;
        }
        return count($matches) === 1 ? $matches[0] : null;
    }

    private function mgtvIdentity(): ?array
    {
        if (!Http::validUrl($this->url)) return null;
        $parts = parse_url($this->url);
        if (!in_array(strtolower($parts['host'] ?? ''), ['www.mgtv.com', 'mgtv.com'], true) ||
            !preg_match('~\A/b/([0-9]+)/([0-9]+)\.html\z~', $parts['path'] ?? '', $match)) return null;
        return ['host' => strtolower($parts['host']), 'clip' => $match[1], 'video' => $match[2]];
    }

    private function mgtvList(array $identity, array $meta): ?array
    {
        // This positives endpoint and parameters are published in MGTV's page
        // data. clipId is explicitly required by the endpoint. Only full videos
        // from this clip are accepted; rbTitle also occurs on trailers/extras.
        $query = ['jumpUrl' => 'imgotv://player', 'previewType' => '', 't_mainClipId' => $identity['clip'],
            't_mainDisplayType' => '1', 't_positiveVodRework' => '1', 't_relClipIds' => '', 't_seriesClipIds' => '',
            't_userIsVip' => 'unknown', 't_videoId' => $identity['video'], 'vodAbStrategy' => '1', 'clipId' => $identity['clip']];
        try {
            $response = $this->http->json('https://mobile.api.mgtv.com/vod/video/positives?' . http_build_query($query, '', '&', PHP_QUERY_RFC3986));
            if ((string) ($response['code'] ?? '') !== '0' || !is_array($response['data']['list'] ?? null)) return null;
            $list = []; $videos = []; $current = null;
            foreach (array_slice($response['data']['list'], 0, 1000) as $row) {
                if (!is_array($row) || (string) ($row['clipId'] ?? '') !== $identity['clip'] ||
                    (int) ($row['type'] ?? 0) !== 4 || (int) ($row['isIntact'] ?? 0) !== 1) continue;
                $video = is_scalar($row['videoId'] ?? null) ? (string) $row['videoId'] : '';
                $serial = is_scalar($row['serialno'] ?? null) ? (string) $row['serialno'] : '';
                if (!preg_match('/\A[1-9][0-9]*\z/', $video) || !preg_match('/\A[1-9][0-9]{0,3}\z/', $serial)) continue;
                if (isset($list[(int) $serial]) || isset($videos[$video])) return null;
                $videos[$video] = true;
                $list[(int) $serial] = ['url' => 'https://' . $identity['host'] . '/b/' . $identity['clip'] . '/' . $video . '.html',
                    'cont' => is_string($row['title'] ?? null) ? $row['title'] : '',
                    'cover' => self::seriesPicture($row['hImgUrl'] ?? ''), 'vip' => $row['vipMark'] ?? ''];
                if ($video === $identity['video']) $current = (int) $serial;
            }
            $total = (int) ($response['data']['page']['total'] ?? 0);
            if ($current === null || !$list || ($total > 0 && count($list) !== $total)) return null;
            ksort($list, SORT_NUMERIC);
            $meta['episode'] = $current; $meta['vid'] = $identity['video'];
            $result = $this->builtInList($list, $meta);
            if (($result['code'] ?? 0) !== 200) return null;
            $result['msg'] = '已读取芒果官方正片列表';
            $result['video'][0]['url'][0]['name'] = '芒果正片';
            return $result;
        } catch (Throwable $error) {
            error_log('Xplayer MGTV catalogue: ' . $error->getMessage());
            return null;
        }
    }

    private static function sameVideoUrl(string $left, string $right): bool
    {
        $normalize = static function (string $url): string {
            $parts = parse_url(html_entity_decode(trim($url), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            if (!is_array($parts) || empty($parts['host'])) return $url;
            $host = strtolower($parts['host']);
            // iQIYI adds qyTrace to share links; it does not identify an episode.
            // Preserve every other query component exactly, including encoding and order.
            if (in_array($host, ['iqiyi.com', 'www.iqiyi.com'], true) &&
                preg_match('~\A/v_[A-Za-z0-9]+\.html\z~', $parts['path'] ?? '') && isset($parts['query'])) {
                $queryParts = explode('&', $parts['query']);
                $identityParts = array_values(array_filter($queryParts, static fn($part) => rawurldecode(explode('=', $part, 2)[0]) !== 'qyTrace'));
                if (count($identityParts) !== count($queryParts)) {
                    $parts['query'] = implode('&', $identityParts);
                    if ($parts['query'] === '') unset($parts['query']);
                }
            }
            // Fragments are client-side; HTTP/HTTPS variants identify the same resource.
            return $host . (isset($parts['port']) ? ':' . $parts['port'] : '') .
                ($parts['path'] ?? '/') . (isset($parts['query']) ? '?' . $parts['query'] : '');
        };
        return $normalize($left) === $normalize($right);
    }

    public function getvideo($data, $episodeAll = 0): array
    {
        $videos = [];
        foreach (array_slice(is_array($data['list'] ?? null) ? $data['list'] : [], 0, 100) as $row) {
            if (!is_array($row)) continue;
            $groups = explode('$$$', is_string($row['vod_play_url'] ?? null) ? $row['vod_play_url'] : '');
            $names = explode('$$$', is_string($row['vod_play_from'] ?? null) ? $row['vod_play_from'] : '');
            $sources = [];
            foreach (array_slice($groups, 0, 30) as $index => $group) {
                $play = []; $labels = [];
                foreach (array_slice(explode('#', $group), 0, 1000) as $entry) {
                    $pair = explode('$', $entry, 2);
                    $url = trim($pair[count($pair) - 1]);
                    if (!Http::validUrl($url)) continue;
                    $play[] = $url;
                    $labels[] = count($pair) === 2 ? $pair[0] : (string) count($play);
                }
                if ($play) $sources[] = ['name' => $names[$index] ?? ('线路 ' . ($index + 1)), 'play' => $play, 'labels' => $labels, 'episodeAll' => count($play)];
            }
            if (!$sources) continue;
            $videos[] = [
                'name' => is_string($row['vod_name'] ?? null) ? $row['vod_name'] : '未命名视频',
                'pic' => self::seriesPicture($row['vod_pic'] ?? ''),
                'actor' => is_string($row['vod_actor'] ?? null) ? $row['vod_actor'] : '',
                'blurb' => is_string($row['vod_blurb'] ?? null) ? $row['vod_blurb'] : '',
                'remarks' => is_string($row['vod_remarks'] ?? null) ? $row['vod_remarks'] : '',
                'url' => $sources, 'match' => abs((int) $episodeAll - $sources[0]['episodeAll']),
            ];
        }
        if ($episodeAll > 0) usort($videos, static function ($left, $right) { return $left['match'] <=> $right['match']; });
        return ['code' => $videos ? 200 : 204, 'msg' => $videos ? '找到 ' . count($videos) . ' 条资源' : '资源接口未返回可用的剧集', 'num' => count($videos), 'video' => $videos];
    }

    public function arraySort($array, $keys, $sort = 'asc'): array
    {
        if (!is_array($array)) return [];
        usort($array, static function ($left, $right) use ($keys, $sort) {
            $comparison = ($left[$keys] ?? 0) <=> ($right[$keys] ?? 0);
            return strtolower((string) $sort) === 'desc' ? -$comparison : $comparison;
        });
        return $array;
    }

    public function httpget($url): string { return $this->http->get(Security::text($url, 12000))['body']; }
}

function mbSafeSubstring(string $value, int $bytes): string
{
    $value = substr($value, 0, $bytes);
    while ($value !== '' && preg_match('//u', $value) !== 1) $value = substr($value, 0, -1);
    return $value;
}

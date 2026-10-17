<?php
require_once __DIR__ . '/class/Security.php';
try {
    require __DIR__ . '/config.php';
    if (!Tools::inOriginArr(Tools::get_origin())) {
        Security::respond(['code' => 403, 'msg' => strip_tags((string) $user['forbidden'])], 403);
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (is_string($origin) && Http::validUrl($origin)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    $type = Security::text($_GET['type'] ?? ($_POST['type'] ?? ''), 30);
    if ($type === 'setting') {
        Security::respond(['code' => 200, 'data' => Player::settings($user, $AD)]);
    }
    if ($type === 'parse' || $type === 'vlist') {
        Security::requirePost();
        $parameter = $type === 'parse' ? 'vkey' : 'vodkey';
        $url = Security::readToken($_POST[$parameter] ?? null, $type, $secretKey);
        if ($type === 'parse') {
            $parser = new parseUrl($url, $api, $specialapi, $cacheTime, $secret, $secretKey);
            Security::respond($parser->start());
        }
        // The resource switch selects MacCMS search; the default reads the built-in platform list.
        Security::respond((new VideoList($url, $zyapi))->printR($zywlist ? 3 : 1));
    }
    if ($type === 'm3u8') {
        $url = Security::readToken($_GET['vkey'] ?? null, 'playlist', $secretKey);
        if (!Http::validUrl($url)) throw new InvalidArgumentException('播放列表地址无效');
        $http = new Http();
        // Check even cache hits; a formerly public hostname must not become an SSRF shortcut.
        Http::publicAddresses($url);
        $cache = new Cache('Cache/', min($cacheTime, 300), 'hls|' . $url . '|' . hash('sha256', $secretKey));
        $playlist = $cache->load();
        if ($playlist === null) {
            $response = $http->get($url);
            $playlist = Player::rewritePlaylist($response['body'], $response['url'], $secretKey);
            // Never cache a live/event media playlist for the old 300-second interval.
            if (str_contains($playlist, '#EXT-X-ENDLIST') || str_contains($playlist, '#EXT-X-STREAM-INF')) $cache->write($playlist);
        }
        header('Content-Type: application/vnd.apple.mpegurl; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        echo $playlist;
        exit;
    }
    if ($type === 'mpd') {
        $url = Security::readToken($_GET['vkey'] ?? null, 'dash-playlist', $secretKey);
        if (!Http::validUrl($url)) throw new InvalidArgumentException('DASH 清单地址无效');
        Http::publicAddresses($url);
        $response = (new Http())->get($url, 2097152);
        $manifest = Player::rewriteDashManifest($response['body'], $response['url'], $secretKey);
        header('Content-Type: application/dash+xml; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        // A navigated XML response must never execute embedded scripts or XSLT.
        header("Content-Security-Policy: default-src 'none'; script-src 'none'; object-src 'none'; base-uri 'none'; sandbox");
        echo $manifest;
        exit;
    }
    Security::respond(['code' => 404, 'msg' => '未知播放器接口'], 404);
} catch (InvalidArgumentException $error) {
    Security::respond(['code' => 400, 'msg' => $error->getMessage()], 400);
} catch (Throwable $error) {
    error_log('Xplayer API: ' . $error->getMessage());
    Security::respond(['code' => 503, 'msg' => '服务尚未就绪或上游接口异常，请检查安装、配置及服务器日志'], 503);
}

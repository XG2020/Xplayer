<?php
require_once __DIR__ . '/class/Danmaku.php';
try {
    require __DIR__ . '/config.php';
    if (empty($user['danmuon'])) Security::respond(['code' => 403, 'msg' => '本站已关闭弹幕'], 403);
    if (!Tools::inOriginArr(Tools::get_origin())) Security::respond(['code' => 403, 'msg' => '来源不允许'], 403);
    $action = Security::text($_GET['ac'] ?? 'dm', 20);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $writing = $method === 'POST' || $action === 'report';
    // Player frames call their own origin. Reject cross-site forms and image-triggered reports.
    if ($writing) {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $host = $_SERVER['HTTP_HOST'] ?? '';
        if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site' ||
            ($origin !== '' && (!is_string($origin) || !Tools::domainMatches($origin, $host)))) {
            Security::respond(['code' => 403, 'msg' => '请从本站播放器发送弹幕或举报'], 403);
        }
    }
    $service = new Danmaku($conn, $secretKey, (string) ($user['danmakuBlockedWords'] ?? ''));
    if ($method === 'GET' && in_array($action, ['dm', 'get'], true)) {
        Security::respond($service->read($_GET['id'] ?? null, $_GET['max'] ?? 10000));
    }
    if ($method === 'POST' && $action === 'dm') {
        $body = file_get_contents('php://input', false, null, 0, 16385);
        if ($body === false || strlen($body) > 16384) throw new InvalidArgumentException('弹幕请求过大');
        $data = json_decode($body, true, 8);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) throw new InvalidArgumentException('弹幕请求应为 JSON 对象');
        Security::respond($service->send($data, Security::clientIp()));
    }
    if ($action === 'report' && in_array($method, ['GET', 'POST'], true)) {
        Security::respond($service->report($method === 'POST' ? $_POST : $_GET, Security::clientIp()));
    }
    Security::respond(['code' => 405, 'msg' => '不支持的弹幕操作'], 405);
} catch (DanmakuRateLimit $error) {
    header('Retry-After: 3');
    Security::respond(['code' => 429, 'msg' => $error->getMessage()], 429);
} catch (InvalidArgumentException $error) {
    Security::respond(['code' => 400, 'msg' => $error->getMessage()], 400);
} catch (Throwable $error) {
    error_log('Xplayer danmaku: ' . $error->getMessage());
    Security::respond(['code' => 503, 'msg' => '弹幕服务暂不可用，请检查数据库配置'], 503);
}

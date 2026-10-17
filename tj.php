<?php
require_once __DIR__ . '/class/Security.php';
try {
    require __DIR__ . '/config.php';
    if (!Tools::inOriginArr(Tools::get_origin())) Security::respond(['code' => 403, 'msg' => '来源不允许'], 403);
    Security::respond(Statistics::online($conn));
} catch (Throwable $error) {
    error_log('Xplayer online statistics: ' . $error->getMessage());
    Security::respond(['num' => 0, 'time' => time(), 'code' => 503, 'msg' => '统计暂不可用'], 503);
}

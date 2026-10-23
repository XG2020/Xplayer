<?php
/** Prepare one explicit bootstrap object instead of interpolating executable JS. */
if (!defined('IN_SYS')) { http_response_code(403); exit('Access denied'); }
require_once dirname(__DIR__) . '/config.php';
require_once dirname(__DIR__) . '/class/PlayerAssets.php';
header('X-Content-Type-Options: nosniff');
header('Content-Security-Policy: ' . PlayerAssets::scriptPolicy($user));
header('Referrer-Policy: strict-origin-when-cross-origin');
if (!Tools::inOriginArr(Tools::get_origin())) {
    http_response_code(403);
    exit(Security::html(strip_tags((string) $user['forbidden'])));
}
$url = Tools::getUrl();
$playback = $url === '' ? ['code' => 204, 'msg' => '请提供播放链接'] :
    ($async ? ['code' => 202] : (new parseUrl($url, $api, $specialapi, $cacheTime, $secret, $secretKey))->start());
$button = Settings::siteButton((string) $user['button']);
$bootstrap = [
    'assetBase' => PlayerAssets::base($user),
    'source' => $url, 'playback' => $playback, 'async' => $async,
    'parseToken' => $url !== '' ? Security::issueToken('parse', $url, $secretKey, 900) : '',
    'listToken' => $url !== '' ? Security::issueToken('vlist', $url, $secretKey, 21600) : '',
    'listConfigKey' => hash('sha256', Security::json([(bool) $zywlist, $zyapi, (string) ($user['metadataApi'] ?? '')])),
    'settings' => Player::settings($user, $AD),
    'title' => (string) $user['title'], 'poster' => Settings::assetUrl($user['img']) ? $user['img'] : '',
    'autoplay' => (bool) $user['autoplay'], 'showlist' => (bool) $user['showlist'],
    'devtoolsGuard' => (bool) ($user['devtoolsGuard'] ?? false),
    'devtoolsGuardMode' => ($user['devtoolsGuardMode'] ?? 'shortcut') === 'enhanced' ? 'enhanced' : 'shortcut',
    'danmakuApi' => Player::danmakuApi($user),
    'danmakuApis' => Player::danmakuApis($user),
    'danmakuCreateApis' => array_values(array_filter(explode("\n", (string) $user['danmakuCreateApis']))),
    'danmakuLocalFallback' => (bool) $user['danmakuLocalFallback'],
    'notice' => strip_tags((string) $user['notice']), 'errorText' => strip_tags((string) $user['bad']),
    'button' => ['label' => $button['label'], 'url' => Settings::assetUrl($button['url']) ? $button['url'] : ''],
];

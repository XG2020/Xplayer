<?php
require_once __DIR__ . '/View.php';
$pageTitle=$pageTitle??'概览';$pageSection=$pageSection??'overview';
?>
<!doctype html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="xplayer-csrf" content="<?= adminText(Security::csrfToken()) ?>">
<title><?= adminText($pageTitle) ?> · Xplayer</title>
<link rel="icon" href="../assets/branding/xplayer-icon.svg" type="image/svg+xml">
<script>try{document.documentElement.dataset.theme=localStorage.getItem('xplayer.admin.theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}catch(e){}</script>
<link rel="stylesheet" href="../assets/admin/console.css">
<script defer src="../assets/admin/console.js"></script>
<?php if($pageSection==='danmaku'): ?>
<link rel="stylesheet" href="../assets/admin/danmaku.css?v=<?= filemtime(dirname(__DIR__).'/assets/admin/danmaku.css') ?>">
<?php if(!empty($danmakuGroupsPage)): ?>
<link rel="stylesheet" href="../assets/admin/danmaku-groups.css?v=<?= filemtime(dirname(__DIR__).'/assets/admin/danmaku-groups.css') ?>">
<script defer src="../assets/admin/danmaku-groups.js?v=<?= filemtime(dirname(__DIR__).'/assets/admin/danmaku-groups.js') ?>"></script>
<?php else: ?>
<script defer src="../assets/admin/danmaku.js?v=<?= filemtime(dirname(__DIR__).'/assets/admin/danmaku.js') ?>"></script>
<?php endif; ?>
<?php endif; ?>
</head>
<body class="<?= $account_check?'admin-layout':'login-layout' ?>">
<noscript><p class="callout">请启用 JavaScript 后再登录或保存设置。</p></noscript>
<?php if($account_check): ?>
<aside class="sidebar" id="sidebar">
<a class="brand" href="./"><img src="../assets/branding/xplayer-icon.svg" alt=""><span>Xplayer<small>管理控制台</small></span></a>
<div class="nav-caption">工作空间</div>
<nav aria-label="后台导航">
<?php foreach([['overview','./','概览','overview'],['player','setting.php','播放器','player'],['interfaces','interfaces.php','接口设置','interfaces'],['danmaku','danmaku.php','本地弹幕','danmaku'],['help','about.php','部署说明','help']] as [$section,$href,$label,$icon]): ?>
<a href="<?= $href ?>" class="nav-link <?= $pageSection===$section?'active':'' ?>" <?= $pageSection===$section?'aria-current="page"':'' ?>><span class="nav-icon" aria-hidden="true"><?= adminIcon($icon) ?></span><?= $label ?></a>
<?php endforeach; ?>
</nav>
<div class="sidebar-bottom"><span class="status-dot"></span> 已登录<small>By XG.GM</small></div>
</aside>
<button class="nav-overlay" type="button" aria-label="关闭导航"></button>
<div class="workspace">
<header class="topbar"><div><button class="icon-button menu-toggle" type="button" aria-label="打开导航" aria-controls="sidebar" aria-expanded="false"><?= adminIcon('menu') ?></button><span class="breadcrumb">控制台 <span>/</span> <?= adminText($pageTitle) ?></span></div><div class="topbar-actions"><a class="text-link" href="../" target="_blank" rel="noopener">打开播放器 <?= adminIcon('external') ?></a><button class="icon-button theme-toggle" type="button" aria-label="切换明暗模式"><?= adminIcon('theme') ?></button><form action="logout.php" method="post"><input type="hidden" name="csrf" value="<?= adminText(Security::csrfToken()) ?>"><button class="button quiet" type="submit">退出</button></form></div></header>
<main id="main-content">
<?php else: ?>
<header class="login-top"><a class="brand" href="../"><img src="../assets/branding/xplayer-icon.svg" alt=""><span>Xplayer</span></a><button class="icon-button theme-toggle" type="button" aria-label="切换明暗模式"><?= adminIcon('theme') ?></button></header><main class="login-main">
<?php endif; ?>

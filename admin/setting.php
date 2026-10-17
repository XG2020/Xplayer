<?php
require_once __DIR__.'/View.php';adminRequireAccount();$pageTitle='播放器';$pageSection='player';require __DIR__.'/Head.Include.php';
$buttonParts=Settings::siteButton((string)$user['button']);$startParts=explode(',',(string)$user['startAD']);$pauseParts=explode(',',(string)$user['pauseAD'],2);
?>
<div class="page-heading"><div><div class="eyebrow">PLAYER</div><h1>播放器设置</h1><p>外观与播放体验集中管理，修改后点击保存生效。</p></div><a class="button" href="../" target="_blank" rel="noopener">预览播放器 ↗</a></div>
<form method="post" data-settings-form="player" id="player-settings">
<?php adminStartGroup('品牌与外观','支持完整图片地址或本站相对路径；留空的可选图片不会显示。'); ?><div class="field-grid">
<?php
adminField('title','播放器标题',$user['title'],'用于页面标题与默认视频名称。',['required'=>true,'maxlength'=>200]);
adminField('themeColor','主题颜色',$user['themeColor'],'控制按钮与播放进度的强调色，例如 #00aeec。',['pattern'=>'#[0-9a-fA-F]{6}','maxlength'=>7,'required'=>true]);
adminField('logo','播放器 LOGO',$user['logo'],'显示在播放器角落，推荐透明背景图片。');
adminField('ico','网站图标',$user['ico'],'显示在浏览器标签页的小图标。');
adminField('img','默认封面',$user['img'],'视频信息未提供封面时使用；留空显示播放器背景。',['wide'=>true]);
?></div></section>
<?php adminStartGroup('首页访问','设置未提供播放参数时的入口页面。');
adminToggle('home404','首页显示404',$user['home404'],'开启后，直接访问首页或 url 为空时返回简洁的 404 页面；带有播放链接的页面和后台仍正常使用。');
?></section>
<?php adminStartGroup('播放与弹幕','这些是新访问者的默认行为；观看者保存的个人偏好优先。');
adminToggle('autoplay','默认自动播放',$user['autoplay'],'视频就绪后尝试开始播放；浏览器可能要求用户先点击。');
adminToggle('danmuon','启用弹幕',$user['danmuon'],'显示弹幕控件与发送入口；弹幕服务在接口设置中配置。');
adminToggle('showlist','显示剧集列表',$user['showlist'],'提供选集入口；可通过资源站、元数据接口或父页面剧集数据补全列表。');
?></section>
<?php adminStartGroup('提示文案','文案按文字显示，无需填写 HTML 标签。'); ?><div class="field-grid">
<?php
adminField('notice','剧集列表公告',$user['notice'],'显示在选集区域，适合填写更新或线路说明。',['type'=>'textarea','rows'=>2,'wide'=>true]);
adminField('bad','解析失败提示',$user['bad'],'未取得有效播放地址时显示。',['type'=>'textarea','rows'=>2]);
adminField('forbidden','来源未授权提示',$user['forbidden'],'访问来源不在允许列表时显示；来源限制在接口设置中维护。',['type'=>'textarea','rows'=>2]);
?></div></section>
<details class="panel advanced-panel"><summary><span>推广与扩展信息<small>可选设置，不影响基本播放</small></span><span>＋</span></summary><div class="details-body">
<?php adminToggle('ad','启用播放广告',$AD,'按下方配置显示播放前与暂停广告；关闭后保留已有配置。'); ?>
<div class="field-grid">
<?php adminField('buttonLabel','站点按钮名称',$buttonParts['label'],'填写名称和链接后显示在播放器右键菜单底部，任一留空则隐藏。');adminField('buttonUrl','站点按钮链接',$buttonParts['url'],'支持 HTTP(S) 地址或本站相对路径，点击后在新标签页打开。'); ?>
<div class="field"><label for="startAdType">播放前广告类型</label><select id="startAdType" name="startAdType"><option value="">不显示</option value="pic" <?= ($startParts[0]??'')==='pic'?'selected':'' ?>>图片</option><option value="vod" <?= ($startParts[0]??'')==='vod'?'selected':'' ?>>视频</option></select><p class="field-help">图片展示固定时间，视频播放结束后进入正片。</p></div>
<?php
adminField('startAdSeconds','图片广告时长',$startParts[3]??3,'仅对图片广告生效，范围 1–60 秒。',['type'=>'number','min'=>1,'max'=>60]);
adminField('startAdMedia','播放前广告素材',$startParts[1]??'','图片或视频素材的完整地址。');adminField('startAdLink','播放前广告链接',$startParts[2]??'','点击素材时跳转的地址。');
adminField('pauseAdImage','暂停广告图片',$pauseParts[0]??'','视频暂停时显示；留空不显示暂停广告。');adminField('pauseAdLink','暂停广告链接',$pauseParts[1]??'','点击暂停广告时跳转的地址。');
?></div></div></details>
<?php adminSave('保存播放器设置'); ?></form>
<section class="panel password-panel" id="account-security">
<div class="section-heading"><h2><?= adminIcon('lock') ?> 修改管理员密码</h2><p>验证当前密码后设置新密码，修改成功后需重新登录。</p></div>
<form method="post" id="password-form">
<div class="field-grid">
<?php
adminField('current_password','原密码','','输入当前管理员的登录密码。',['type'=>'password','autocomplete'=>'current-password','required'=>true,'maxlength'=>72,'wide'=>true]);
adminField('new_password','新密码','','12–72 字节，建议使用字母、数字和符号组合。',['type'=>'password','autocomplete'=>'new-password','required'=>true,'maxlength'=>72]);
adminField('confirm_password','确认新密码','','再次输入新密码。',['type'=>'password','autocomplete'=>'new-password','required'=>true,'maxlength'=>72]);
?>
</div>
<?php adminSave('修改密码'); ?>
</form></section>
<?php require __DIR__.'/Foot.Include.php'; ?>

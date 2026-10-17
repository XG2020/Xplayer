<?php
require_once __DIR__.'/View.php';adminRequireAccount();$pageTitle='接口设置';$pageSection='interfaces';require __DIR__.'/Head.Include.php';
?>
<div class="page-heading"><div><div class="eyebrow">CONNECTIONS</div><h1>连接内容与服务</h1><p>按使用场景选择接口。直接播放 MP4 / HLS 时，不必配置解析服务。</p></div><a class="text-link" href="about.php#interfaces">接口如何配合 →</a></div>
<form method="post" data-settings-form="interfaces" id="interface-settings">
<?php adminStartGroup('剧集与资源站','默认读取内置平台选集，保留正片和特别节目名称。需要片名搜索或补充线路时再配置资源站与元数据接口。'); ?><div class="field-grid">
<?php
adminField('zyapi','资源站 / 苹果 CMS 搜索接口',adminLines($zyapi),'每行一个接口，支持标准 /api.php/provide/vod/ 基础地址或完整搜索前缀，例如 https://cms.example/api.php/provide/vod/。只显示包含当前视频原链接且集数最多的结果。',['type'=>'textarea','list'=>true,'wide'=>true,'rows'=>4]);
adminField('metadataApi','剧集元数据接口',$user['metadataApi'],'用于资源站检索前识别片名和集号；不要求此接口返回完整列表。留空使用默认服务，也可填写自己的接口前缀或 {url} 模板。实际条目数量以列表为准。',['wide'=>true,'placeholder'=>'https://metadata.example.com/?url=']);
?></div><?php adminToggle('zywlist','从资源站补全剧集',$zywlist,'关闭时读取内置或自建列表；启用后优先检索已配置资源站，无匹配结果时回退。需同时开启播放器的“显示剧集列表”。'); ?></section>
<?php adminStartGroup('视频解析','仅在输入第三方播放页地址、需要转换为媒体直链时配置。接口应返回有效播放地址。'); ?><div class="field-grid">
<?php
adminField('api','通用解析接口',adminLines($api),'每行一个接口，按顺序尝试。填写接口前缀，或使用 {url} 表示待解析地址。',['type'=>'textarea','list'=>true,'wide'=>true,'rows'=>4,'placeholder'=>'https://parser.example/?url=']);
adminField('specialApi','指定域名的解析接口',adminLines($specialapi),'每行填写「域名|接口地址」，匹配的域名优先走专线；域名可使用 *.example.com。',['type'=>'textarea','list'=>true,'wide'=>true,'rows'=>3,'placeholder'=>'video.example|https://parser.example/?url=']);
?></div><?php adminToggle('async','异步解析',$async,'先打开播放器，再请求解析结果；适合解析耗时较长的接口。'); ?></section>
<?php adminStartGroup('弹幕与访问来源','默认弹幕服务位于本站；来源限制留空时不限定嵌入网站。'); ?><div class="field-grid">
<?php
adminField('danmuku','弹幕服务列表',$user['danmuku'],'每行一个完整的 HTTP(S) 地址，最多 10 个。按顺序查找当前集弹幕；全部无匹配时使用下方兜底设置。留空使用本站数据库。读取、发送与列表始终绑定同一弹幕库。',['type'=>'textarea','wide'=>true,'rows'=>5,'placeholder'=>"https://danmaku.example.com/dmku/\nhttps://backup.example.com/dmku/"]);
adminField('danmakuCreateApis','允许创建空库的接口',$user['danmakuCreateApis'],'从上方列表复制允许写入并支持自动创建视频分组的接口，每行一个。没有匹配弹幕时，选用其中首个读取成功、弹幕为 0 的库；首次发送后由该服务保存。请确认接口支持此能力，读取成功不代表允许写入。留空时不向外部空库发送。',['type'=>'textarea','wide'=>true,'rows'=>3,'placeholder'=>'https://danmaku.example.com/dmku/']);
?></div><?php adminToggle('danmakuLocalFallback','使用本站数据库兜底',$user['danmakuLocalFallback'],'默认开启。外部库均失败，或没有可创建的空库时，读取本站弹幕并绑定本站数据库供观看者共同发送、查看。'); ?><div class="field-grid"><?php
adminField('origin','允许的来源域名',adminLines($originarr),'每行一个域名，例如 example.com 或 *.example.com；留空不限制来源。',['type'=>'textarea','list'=>true,'wide'=>true,'rows'=>3]);
?></div></section><?php adminSave('保存接口设置'); ?></form>
<details class="panel advanced-panel" id="advanced"><summary><span>高级设置<small>缓存、播放清单转发与播放链接签名</small></span><span>＋</span></summary><div class="details-body"><form method="post" data-settings-form="advanced" id="advanced-settings"><div class="field-grid">
<?php
adminField('cacheTime','解析缓存时间',$cacheTime,'相同地址的解析结果缓存秒数；0 表示禁用，最大 86400。',['type'=>'number','min'=>0,'max'=>86400,'required'=>true]);
adminField('secretKEY','更换播放签名密钥','','仅用于验证播放链接签名。留空保留现有密钥；更换后已打开的播放器需刷新。',['type'=>'password','autocomplete'=>'new-password','minlength'=>16,'maxlength'=>128,'placeholder'=>'留空保留现有密钥']);
?></div><?php adminToggle('secret','启用播放清单转发',$secret,'使用本站签名地址转发 HLS / DASH 清单；需要服务器能访问视频源，媒体分片仍需满足浏览器跨域要求。');adminSave('保存高级设置'); ?></form></div></details>
<?php require __DIR__.'/Foot.Include.php'; ?>

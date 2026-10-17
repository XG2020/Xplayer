<?php
require_once __DIR__.'/View.php';
$pageTitle=$account_check?'概览':'登录';$pageSection='overview';
require __DIR__.'/Head.Include.php';
if(!$account_check): ?>
<section class="login-card"><div class="eyebrow">YOUR PLAYER, YOUR SPACE</div><h1>欢迎回来</h1><p class="muted">使用站点管理员账号登录，管理播放器与接口。</p>
<form method="post" id="login-form"><div class="field"><label for="account_u">管理员账号</label><input id="account_u" name="account_u" autocomplete="username" required maxlength="64"></div><div class="field"><label for="account_p">密码</label><input id="account_p" name="account_p" type="password" autocomplete="current-password" required maxlength="72"></div><p class="form-status" role="status" aria-live="polite"></p><button class="button primary full" type="submit">登录控制台</button></form>
</section>
<?php else:
$series=Statistics::dashboard($conn,7);$today=$series[count($series)-1];$calls=(int)$today['use'];$success=(int)$today['useok'];
$onlineQuery=$conn->prepare('SELECT COUNT(*) FROM WatchCount WHERE `time` >= ?');$onlineQuery->execute([time()-300]);$online=(int)$onlineQuery->fetchColumn();
?>
<div class="page-heading"><div><div class="eyebrow">OVERVIEW</div><h1>运行概览</h1><p>查看播放调用情况，继续完善你的播放器。</p></div><a class="button primary" href="setting.php">配置播放器 <span>↗</span></a></div>
<div class="stat-grid"><article class="stat-card"><span>今日播放调用</span><strong id="today-calls"><?= $calls ?></strong><small>播放页收到的调用次数</small></article><article class="stat-card"><span>今日解析成功</span><strong id="today-success"><?= $success ?></strong><small>成功取得播放地址的次数</small></article><article class="stat-card"><span>解析成功率</span><strong><?= $calls?round($success/$calls*100,1).'%':'—' ?></strong><small>按今日调用统计</small></article><article class="stat-card"><span>最近在线</span><strong id="online"><?= $online ?></strong><small>过去 5 分钟的活跃访问者</small></article></div>
<section class="panel chart-panel"><div class="section-heading chart-heading"><div><h2>播放与解析趋势</h2><p>按天汇总本站实际播放调用与解析结果。</p></div><label class="select-label">时间范围<select id="chart-days"><option value="7">最近 7 天</option><option value="30">最近 30 天</option></select></label></div><div class="chart-legend"><span><i></i>播放调用</span><span><i></i>解析成功</span></div><div id="activity-chart" class="activity-chart" aria-label="播放与解析趋势图"></div><p id="chart-status" class="form-status" role="status"></p><details class="table-details"><summary>查看详细数据</summary><div class="table-scroll"><table><thead><tr><th>日期</th><th>播放调用</th><th>解析成功</th></tr></thead><tbody id="activity-table"></tbody></table></div></details></section>
<div class="quick-grid"><a class="panel quick-card" href="setting.php"><span class="card-icon" aria-hidden="true"><?= adminIcon('player') ?></span><h2>让播放器更像你的网站</h2><p>调整外观、默认播放行为、弹幕和提示信息。</p><span class="text-link">播放器设置 →</span></a><a class="panel quick-card" href="interfaces.php"><span class="card-icon" aria-hidden="true"><?= adminIcon('interfaces') ?></span><h2>连接你自己的内容</h2><p>按需配置解析、资源站与剧集元数据接口。</p><span class="text-link">接口设置 →</span></a></div>
<?php endif; require __DIR__.'/Foot.Include.php'; ?>

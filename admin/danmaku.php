<?php
require_once __DIR__ . '/View.php';
adminRequireAccount();
$pageTitle = '本地弹幕';
$pageSection = 'danmaku';
require __DIR__ . '/Head.Include.php';
?>
<div id="danmaku-management">
    <div class="page-heading">
        <div><div class="eyebrow">DANMAKU</div><h1>本地弹幕管理</h1><p>查看本站保存的弹幕，处理举报与违规内容。</p></div>
        <button class="button" type="button" id="dm-refresh">刷新列表</button>
    </div>
    <div class="stat-grid" aria-label="本地弹幕统计">
        <article class="stat-card"><span>弹幕总数</span><strong data-dm-stat="comments">—</strong><small>本站数据库中的弹幕</small></article>
        <article class="stat-card"><span>视频分组</span><strong data-dm-stat="videos">—</strong><small>已有弹幕的视频编号</small></article>
        <article class="stat-card"><span>待处理举报</span><strong data-dm-stat="reports">—</strong><small>尚未清除的举报记录</small></article>
        <article class="stat-card"><span>被举报弹幕</span><strong data-dm-stat="reportedComments">—</strong><small>有待处理举报的弹幕</small></article>
    </div>
    <nav class="dm-tabs" aria-label="本地弹幕视图"><a href="danmaku.php" aria-current="page">弹幕列表</a><a href="danmaku-groups.php">视频分组</a></nav>
    <details class="panel advanced-panel dm-filter-panel" id="dm-filter-panel">
        <summary><span>屏蔽词设置<small>在服务端拦截包含广告词的弹幕正文和昵称</small></span><span>＋</span></summary>
        <div class="details-body">
            <form id="dm-word-form" method="post" data-settings-form="danmaku">
                <?php adminField('danmakuBlockedWords', '屏蔽词', $user['danmakuBlockedWords'] ?? '',
                    '每行一个词，最多 200 个，每个最多 100 字。按包含关系匹配，忽略英文大小写、空白、零宽字符和全角英文数字；命中后拒绝发送。留空并保存可关闭过滤。',
                    ['type' => 'textarea', 'wide' => true, 'rows' => 6, 'maxlength' => 32768, 'placeholder' => "加群领福利\n推广链接\n广告联系人"]); ?>
                <p class="field-help">保存后对新发送到本站的弹幕生效，不能替代外部弹幕库的过滤规则。已有广告请在下方检索后删除；短词可能误伤正常交流，建议使用明确的广告词。</p>
                <?php adminSave('保存屏蔽词'); ?>
            </form>
        </div>
    </details>
    <section class="panel dm-panel" aria-labelledby="dm-list-title">
        <div class="section-heading"><h2 id="dm-list-title">弹幕列表</h2><p>仅管理本站数据库；外部弹幕库请前往对应服务的管理后台。</p></div>
        <form id="dm-search" class="dm-search" role="search">
            <div class="field"><label for="dm-keyword">内容或昵称</label><input id="dm-keyword" name="keyword" type="search" maxlength="100" placeholder="搜索弹幕内容或发送昵称"></div>
            <div class="field"><label for="dm-player">视频编号</label><input id="dm-player" name="player" maxlength="255" placeholder="完整编号，或点击列表中的编号" aria-describedby="dm-player-help"></div>
            <div class="field"><label for="dm-reported">举报状态</label><select id="dm-reported" name="reported"><option value="0">全部弹幕</option><option value="1">仅被举报</option></select></div>
            <div class="dm-search-actions"><button class="button primary" type="submit">查询</button><button class="button quiet" type="reset">重置</button></div>
        </form>
        <p class="field-help" id="dm-player-help">视频编号按完整值匹配；编号由播放器生成，可能不是片名或播放链接。</p>
        <div id="dm-feedback" class="dm-feedback" role="status" aria-live="polite" hidden></div>
        <div class="dm-toolbar">
            <span id="dm-selection">未选择弹幕</span>
            <div><button class="button quiet" type="button" id="dm-dismiss-selected" disabled>忽略选中举报</button><button class="button dm-danger" type="button" id="dm-delete-selected" disabled>删除选中弹幕</button></div>
        </div>
        <div class="table-scroll dm-table-scroll" id="dm-results" aria-busy="true">
            <table class="dm-table">
                <caption class="dm-visually-hidden">本地弹幕，每页最多 25 条，可按行选择并处理</caption>
                <thead><tr><th class="dm-check"><input type="checkbox" id="dm-select-page" aria-label="选择本页全部弹幕" disabled></th><th>弹幕内容</th><th>所属视频</th><th>出现位置</th><th>提交时间</th><th>举报</th><th>操作</th></tr></thead>
                <tbody id="dm-rows"><tr><td colspan="7" class="dm-empty">正在读取弹幕…</td></tr></tbody>
            </table>
        </div>
        <nav class="dm-pagination" aria-label="弹幕列表分页"><span id="dm-page-status" role="status">正在加载…</span><div><button class="button quiet" id="dm-prev" type="button" disabled>上一页</button><button class="button quiet" id="dm-next" type="button" disabled>下一页</button></div></nav>
    </section>
    <dialog id="dm-confirm" class="dm-confirm" aria-labelledby="dm-confirm-title" aria-describedby="dm-confirm-description">
        <h2 id="dm-confirm-title">确认操作</h2>
        <p id="dm-confirm-description"></p>
        <ul id="dm-confirm-preview"></ul>
        <p id="dm-confirm-status" class="form-status" role="status" aria-live="polite"></p>
        <div class="dm-confirm-actions"><button class="button quiet" id="dm-confirm-cancel" type="button">取消</button><button class="button dm-danger" id="dm-confirm-submit" type="button">确认删除</button></div>
    </dialog>
</div>
<?php require __DIR__ . '/Foot.Include.php'; ?>

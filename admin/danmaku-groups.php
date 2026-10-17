<?php
require_once __DIR__ . '/View.php';
adminRequireAccount();
$pageTitle = '视频分组';
$pageSection = 'danmaku';
$danmakuGroupsPage = true;
require __DIR__ . '/Head.Include.php';
?>
<div id="danmaku-groups">
    <div class="page-heading">
        <div><div class="eyebrow">DANMAKU</div><h1>视频分组管理</h1><p>按视频编号查看本站弹幕，集中处理整组内容。</p></div>
        <button class="button" type="button" id="dmg-refresh">刷新分组</button>
    </div>
    <div class="stat-grid" aria-label="本地弹幕全库统计">
        <article class="stat-card"><span>弹幕总数</span><strong data-dmg-stat="comments">—</strong><small>本站数据库中的弹幕</small></article>
        <article class="stat-card"><span>视频分组</span><strong data-dmg-stat="videos">—</strong><small>已有弹幕的视频编号</small></article>
        <article class="stat-card"><span>待处理举报</span><strong data-dmg-stat="reports">—</strong><small>尚未清除的举报记录</small></article>
        <article class="stat-card"><span>被举报弹幕</span><strong data-dmg-stat="reportedComments">—</strong><small>有待处理举报的弹幕</small></article>
    </div>
    <nav class="dm-tabs" aria-label="本地弹幕视图"><a href="danmaku.php">弹幕列表</a><a href="danmaku-groups.php" aria-current="page">视频分组</a></nav>
    <section class="panel dm-panel dmg-panel" aria-labelledby="dmg-list-title">
        <div class="section-heading"><h2 id="dmg-list-title">视频分组</h2><p>数据库只保存视频编号，不包含片名。分组由已有弹幕自动形成，清空后收到新弹幕会再次出现。</p></div>
        <form id="dmg-search" class="dmg-search" role="search">
            <div class="field"><label for="dmg-keyword">视频编号</label><input id="dmg-keyword" name="keyword" type="search" maxlength="255" placeholder="输入完整编号或其中一部分" aria-describedby="dmg-keyword-help"></div>
            <div class="field"><label for="dmg-reported">举报状态</label><select id="dmg-reported" name="reported"><option value="0">全部分组</option><option value="1">仅有举报</option></select></div>
            <div class="dm-search-actions"><button class="button primary" type="submit">查询</button><button class="button quiet" type="reset">重置</button></div>
        </form>
        <p class="field-help" id="dmg-keyword-help">按视频编号包含关系筛选。点击“查看弹幕”可逐条处理该视频的弹幕；上方统计始终显示全库数据。</p>
        <div id="dmg-feedback" class="dm-feedback" role="status" aria-live="polite" hidden></div>
        <div class="dm-toolbar">
            <span id="dmg-selection">未选择分组</span>
            <div><button class="button dm-danger" type="button" id="dmg-clear-selected" disabled>清空选中分组</button></div>
        </div>
        <div class="table-scroll dm-table-scroll" id="dmg-results" aria-busy="true" tabindex="0" role="region" aria-label="视频分组列表，可横向滚动">
            <table class="dm-table dmg-table">
                <caption class="dm-visually-hidden">本站视频分组，每页最多 25 组，可选择并清空整组弹幕</caption>
                <thead><tr><th class="dm-check"><input type="checkbox" id="dmg-select-page" aria-label="选择本页全部视频分组" disabled></th><th scope="col">视频编号</th><th scope="col">弹幕数</th><th scope="col">举报数</th><th scope="col">最近提交时间</th><th scope="col">操作</th></tr></thead>
                <tbody id="dmg-rows"><tr><td colspan="6" class="dm-empty">正在读取视频分组…</td></tr></tbody>
            </table>
        </div>
        <nav class="dm-pagination" aria-label="视频分组分页"><span id="dmg-page-status" role="status">正在加载…</span><div><button class="button quiet" id="dmg-prev" type="button" disabled>上一页</button><button class="button quiet" id="dmg-next" type="button" disabled>下一页</button></div></nav>
    </section>
    <dialog id="dmg-confirm" class="dm-confirm" aria-labelledby="dmg-confirm-title" aria-describedby="dmg-confirm-description dmg-confirm-note">
        <h2 id="dmg-confirm-title">确认清空分组</h2>
        <p id="dmg-confirm-description"></p>
        <ul id="dmg-confirm-preview"></ul>
        <p class="field-help" id="dmg-confirm-note">执行时将按数据库最新内容清空，实际数量可能变化。清空后有新弹幕的分组会再次出现。</p>
        <p id="dmg-confirm-status" class="form-status" role="status" aria-live="polite"></p>
        <div class="dm-confirm-actions"><button class="button quiet" id="dmg-confirm-cancel" type="button">取消</button><button class="button dm-danger" id="dmg-confirm-submit" type="button">确认清空</button></div>
    </dialog>
</div>
<?php require __DIR__ . '/Foot.Include.php'; ?>

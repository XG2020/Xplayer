/* Local bridge for the RECOVERED original player.
 * The missing remote bootstrap is replaced here, not the player UI/engine.
 * Security patches retain the original feature APIs and DOM classes. */
(function (global) {
    'use strict';
    const data = JSON.parse(document.getElementById('xplayer-bootstrap').textContent);
    const params = new URLSearchParams(location.search);
    const text = value => typeof value === 'string' ? value : '';
    const html = value => $('<span>').text(String(value ?? '')).html();
    const safeUrl = value => {
        if (typeof value !== 'string' || value === '' || /[\x00-\x20<>"'\\]/.test(value)) return '';
        try { const url = new URL(value, document.baseURI); return /^(https?:)$/.test(url.protocol) && !url.username && !url.password ? url.href : ''; } catch (_) { return ''; }
    };
    const store = {
        get(key, fallback = null) { try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; } },
        set(key, value) { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
    };
    function showPlaybackError(message) {
        const box=$('#error').empty().prop('hidden',false).addClass('xplayer-playback-error');
        $('<p class="xplayer-error-message">').text(String(message||'解析失败，请稍后重试')).appendTo(box);
    }
    global.getRootUrl = value => { try { return new URL(value, location.href).host; } catch (_) { return ''; } };
    global.hzh = () => global.XplayerPip.toggle(XGGM.dp);
    global.barrage_stop = node => { node.style.animationPlayState = 'paused'; };
    global.barrage_start = node => { node.style.animationPlayState = ''; };
    global.yzmck = {
        get(key) { try { return localStorage.getItem('xplayer.' + key) || '0'; } catch (_) { return '0'; } },
        set(key, value) { try { localStorage.setItem('xplayer.' + key, String(value)); } catch (_) {} }
    };
    global.getUrlParam = key => key === 'url' ? data.source : params.get(key);
    global.XGGM = XGGM; // This name is used by the original template and handlers.
    global.config = {
        url: '', api: data.danmakuApi, autoplay: global.XplayerPlaybackSettings.read({autoplay:data.autoplay}).autoplay, color: data.settings.color,
        logo: data.settings.logo, pic: data.poster, title: text(params.get('title')) || data.title,
        id: text(params.get('id')) || CryptoJS.MD5(data.source).toString(), sid: text(params.get('sid')) || '1',
        av: data.danmakuApi !== 'danmaku.php' && /^\d+$/.test(params.get('av') || '') ? params.get('av') : '', next: '',
        user: 'XGGM', group: '', group_x: '', sendtime: data.settings.sendtime || 3,
        dmrule: data.settings.dmrule
    };
    global.up = {diyid: [0,config.id,config.sid], mylink: '', pbgjz: [], trysee: 0, usernum: 0};
    global.danmuon = data.settings.danmuon;
    global.rightmenuArr = global.XplayerContextMenu.create(data.button);
    // Keep the original AJAX protocol for user-owned danmaku servers, never a bundled host.
    function endpoint(action, values = {}) {
        const url = new URL(config.api, document.baseURI); url.searchParams.set('ac',action);
        Object.entries(values).forEach(([key,value])=>url.searchParams.set(key,String(value)));
        return url.href;
    }
    $.ajaxSetup({timeout: 20000});
    $.ajaxPrefilter(options => {
        // No cookies or referrer spoofing are added to third-party services.
        if (options.url && options.url.indexOf(config.api + '?ac=') === 0 && config.api) {
            const parsed = new URL(options.url, document.baseURI); options.url = parsed.href;
        }
    });
    // Safe cookies preserve original 24h resume behavior without raw URL cookie names.
    const memoryKey = key => 'xplayer_' + CryptoJS.MD5(String(key)).toString();
    XGGM.setCookie = function (key, value, hours) {
        document.cookie = memoryKey(key) + '=' + encodeURIComponent(value) + ';path=/;SameSite=Lax' +
            (hours === null ? '' : ';max-age=' + Math.floor(hours*3600));
    };
    XGGM.getCookie = function (key) {
        const prefix = memoryKey(key)+'=';const entry=document.cookie.split(';').map(value=>value.trim()).find(value=>value.startsWith(prefix));
        return entry ? decodeURIComponent(entry.slice(prefix.length)) : '';
    };
    XGGM.delCookie = function () { /* Resume cookies expire naturally; never delete unrelated cookies. */ };
    function legacyDanmakuId(){
        XGGM.dmid();
        return XGGM.id;
    }
    XGGM.video.next = function () {
        if (!safeUrl(config.next)) { XGGM.dp.notice('暂无下一集'); return; }
        const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('url',config.next);
        location.assign(url.href);
    };
    let nextEpisodeTimer;
    XGGM.endedHandler = function () {
        clearTimeout(nextEpisodeTimer);
        const player=XGGM.dp,preferences=global.XplayerPlaybackSettings.get(player);
        XGGM.setCookie('time_'+getUrlParam('url'),'',-1);
        if(preferences.loop){player.seek(0);player.play();return;}
        if(preferences.playMode==='pause'||!safeUrl(config.next)){player.pause();player.notice('视频播放已结束');return;}
        player.notice('即将为您播放下一集');
        nextEpisodeTimer=setTimeout(()=>{
            const current=global.XplayerPlaybackSettings.get(player);
            if(player.video?.ended&&!current.loop&&current.playMode==='auto-next')XGGM.video.next();
        },3000);
    };
    const originalTail=XGGM.jump.last;
    XGGM.jump.last=function(){
        const player=XGGM.dp,preferences=global.XplayerPlaybackSettings.get(player);
        if(preferences.loop||preferences.playMode==='pause'){
            if(Number(XGGM.lasts)&&Number(XGGM.lastt)>0&&player.video.duration-player.video.currentTime<Number(XGGM.lastt)&&player.video.currentTime<player.video.duration-.1){
                if(preferences.loop){player.seek(0);player.play();}else{player.seek(player.video.duration);player.pause();}
            }
            return;
        }
        originalTail();
    };
    // Respect the existing autoplay switch instead of forcing playback on metadata.
    XGGM.loadedmetadataHandler = function () {
        if (XGGM.dp.audioReloading) return;
        if (XGGM.playtime > 0 && XGGM.playtime < XGGM.dp.video.duration - 1) XGGM.video.seek();
        XGGM.jump.head();$('#loading-box').remove();
        if (config.autoplay) XGGM.dp.play();
    };
    // Keep skip-head/tail toggles and original settings DOM; avoid duplicate handlers.
    XGGM.jump.def = function () {
        const apply = (selector, input, enabledKey, secondsKey) => {
            const label=$(selector),field=$(input);field.val(yzmck.get(secondsKey));label.toggleClass('checked',yzmck.get(enabledKey)==='1');
            label.off('click.xplayer').on('click.xplayer',event=>{
                event.preventDefault();const seconds=Math.max(0,Math.min(3600,Number(field.val())||0));
                if(!seconds) {layer.msg('请输入有效时间哟！');return;}
                const enabled=!label.hasClass('checked');label.toggleClass('checked',enabled);yzmck.set(enabledKey,enabled?1:0);yzmck.set(secondsKey,seconds);
                XGGM[enabledKey]=enabled?1:0;XGGM[secondsKey]=seconds;XGGM.last_tip=Number(XGGM.lastt)+5;
                layer.msg('设置完成');
            });
        };
        apply('.xplayer-setting-jfrist label','#fristtime','frists','headt');
        apply('.xplayer-setting-jlast label','#jumptime','lasts','lastt');
    };
    XGGM.danmu.list = function () {
        const panel=$('.xplayer-danmu').attr({id:'xplayer-danmaku-list',role:'region','aria-label':'弹幕列表'});
        const close=()=>{panel.removeClass('show');$('.xplayer-list-icon').attr('aria-expanded','false');};
        if(!panel.children('.xplayer-danmaku-list-toolbar').length){
            const toolbar=$('<div class="xplayer-danmaku-list-toolbar">').prependTo(panel);
            $('<h2>').text('弹幕列表').appendTo(toolbar);
            $('<button type="button" aria-label="关闭弹幕列表">').text('×').on('click',close).appendTo(toolbar);
            panel.on('keydown.xplayer',event=>{if(event.key==='Escape'){event.stopPropagation();close();$('.xplayer-list-icon').trigger('focus');}});
        }
        $('.xplayer-list-icon').attr({'type':'button','aria-label':'弹幕列表','aria-controls':'xplayer-danmaku-list','aria-expanded':'false'}).off('click.xplayer').on('click.xplayer',async function(){
            panel.toggleClass('show');
            $(this).attr('aria-expanded',panel.hasClass('show')?'true':'false');
            if(!panel.hasClass('show'))return;
            panel.attr('aria-busy','true');
            try {
                const result=await global.XplayerDanmakuSources.getList();
                if(Number(result.code)!==23)return;
                const host=$('.list-show').empty();$('.danmuku-num').text(result.danum||0);
                (Array.isArray(result.danmuku)?result.danmuku:[]).slice(0,10000).forEach(row=>{
                    if(!Array.isArray(row))return;
                    const item=$('<li class="danmuku-list" role="button" tabindex="0">');
                    $('<span class="danmaku-list-time">').text(XGGM.formatTime(Number(row[0])||0)).appendTo(item);
                    const content=$('<span class="danmaku-list-text">').attr('title',global.XplayerDanmakuContent.plainText(row[4])).appendTo(item);
                    global.XplayerDanmakuContent.render(content[0],row[4]);
                    $('<span class="danmaku-list-date">').text(row[6]||'—').attr('title',String(row[6]||'')).appendTo(item);
                    if(global.XplayerDanmakuSources.canReport())$('<button type="button" class="report">').text('举报').on('click',event=>{event.stopPropagation();XGGM.danmu.report(row[5],result.name,row[4],row[3]);}).appendTo(item);
                    const seek=()=>XGGM.dp.seek(Number(row[0])||0);
                    item.on('click',seek).on('keydown',event=>{if(event.target===item[0]&&(event.key==='Enter'||event.key===' ')){event.preventDefault();seek();}}).appendTo(host);
                });
                if(!host.children().length)$('<li class="danmaku-list-empty">').text('暂无弹幕，发送后会显示在这里').appendTo(host);
            }catch(error){layer.msg(html(error.message||'弹幕列表暂不可用'));}
            finally{panel.attr('aria-busy','false');}
        });
        const rules=$('<div class="dmrules">');$('<a>').text('弹幕礼仪 >').attr({href:safeUrl(config.dmrule),target:'_blank',rel:'noopener noreferrer'}).appendTo(rules);
        $('.xplayer-comment-box').last().append(rules);
    };
    const originalReport=XGGM.danmu.report;
    XGGM.danmu.report=function(user,title,content,cid){if(!global.XplayerDanmakuSources.canReport()){XGGM.dp.notice('当前弹幕库未提供举报接口');return;}originalReport(user,title,html(content),cid);};
    XGGM.danmu.post_r=async function(user,title,content,cid,type){
        const decoded=$('<textarea>').html(content).val();
        try{
            const result=await global.XplayerDanmakuSources.report({user,title,text:decoded,cid,type});
            if(result.code!==undefined && ![0,23,200].includes(Number(result.code))) {layer.msg(html(result.msg||'举报未成功'));return;}
            layer.closeAll();layer.msg('举报成功！感谢您为守护弹幕作出了贡献');
        }catch(error){layer.msg(html(error.message||'服务故障或网络异常，请稍后再试'));}
    };
    // Preserve pause-ad design and close/resume behavior, but construct untrusted URLs via DOM.
    XGGM.MYad.pause.play=function(link,picture){
        $('#player_pause').remove();if(XGGM.ads.pause.state!=='on'||!safeUrl(picture))return;
        const panel=$('<div id="player_pause">').append($('<div class="tip">').text('广告'));
        $('<div class="tip">').css({right:0,cursor:'pointer'}).text('×').on('click',()=>XGGM.MYad.pause.out()).appendTo(panel);
        const image=$('<img>').attr('src',safeUrl(picture));
        if(safeUrl(link))$('<a>').attr({href:safeUrl(link),target:'_blank',rel:'noopener noreferrer'}).append(image).appendTo(panel);
        else image.on('click',()=>XGGM.dp.play()).appendTo(panel);
        $('#player').append(panel);
    };
    let episodes=null,currentVideo=null,currentSource=null,currentEpisodeLabel='',currentEpisodeTitle='',onlineTimer;
    const originalPlay=XGGM.play;
    XGGM.play=function(url){
        originalPlay(url);const player=XGGM.dp;
        player.container.classList.toggle('xplayer-danmaku-enabled',!!player.danmaku);
        global.XplayerContextMenu.attach(player);
        global.XplayerControls.attach(player);
        global.XplayerProgress.attach(player);
        global.XplayerPlaybackSettings.attach(player);
        global.XplayerPip.attach(player);
        global.XplayerVisibility.attach(player);
        player.container.addEventListener('xplayer:playback-settings-change',event=>{
            config.autoplay=event.detail.preferences.autoplay;
            if(event.detail.preferences.loop||event.detail.preferences.playMode==='pause')clearTimeout(nextEpisodeTimer);
        });
        $('#vodtitle').text(config.title + (currentEpisodeLabel ? '  '+currentEpisodeLabel : config.sid ? '  '+config.sid : ''));
        const finishLoading=()=>global.XplayerLoading?.hide();
        player.on('loadeddata',finishLoading);player.on('error',finishLoading);
        if(player.video.readyState>=2)finishLoading();
        $('#error').prop('hidden',true);
        // Only inject the missing bootstrap's episode entry; all other controls are original.
        if(data.showlist){$('<button class="xplayer-icon xplayer-episode-button">').text('选集').attr({'data-balloon':'选集','data-balloon-pos':'up','aria-label':'选集','aria-controls':'xplayer-vlist','aria-expanded':'false'}).on('click',showEpisodes).prependTo('.xplayer-icons-right');}
        $('.xplayer-logo img').attr('alt','Xplayer Pro');
        player.on('error',()=>{if(!player.audioReloading)player.notice('视频加载失败，请检查源地址、网络和跨域许可');});
        clearInterval(onlineTimer);const online=()=>$.getJSON('tj.php').done(result=>$('.xplayer-watching-number').text(result.num)).fail(()=>{});
        online();onlineTimer=setInterval(online,30000);
        player.on('play',()=>{clearTimeout(nextEpisodeTimer);$('#loading-box').remove();});
    };
    function showEpisodes(){
        const close=()=>{$('#xplayer-vlist').remove();$('.xplayer-episode-button').attr('aria-expanded','false');};
        if($('#xplayer-vlist').length){close();return;}
        $('.xplayer-episode-button').attr('aria-expanded','true');
        const host=$('<aside id="xplayer-vlist">');
        $('<button class="xplayer-vlist-close" aria-label="关闭选集">').text('×').on('click',close).appendTo(host);
        const heading=$('<div class="xplayer-vlist-header">').appendTo(host),info=$('<div>').appendTo(heading);
        const placeholder=()=>$('<span class="xplayer-series-poster xplayer-series-poster--empty">').text('暂无封面');
        const artwork=selectedArtwork();
        const makeImage=(picture,allowFallback)=>{
            const label=(currentVideo?.name||config.title)+(picture.episode?' '+currentEpisodeLabel+' · 当前集封面':'封面');
            return $('<img class="xplayer-series-poster">').toggleClass('xplayer-series-poster--episode',picture.episode).one('error',function(){
                const fallback=allowFallback?selectedArtwork(true):null;
                $(this).replaceWith(fallback?.url&&fallback.url!==picture.url?makeImage(fallback,false):placeholder());
            }).attr({referrerpolicy:'no-referrer',src:picture.url,alt:label,title:label});
        };
        if(artwork.url)makeImage(artwork,!artwork.episode).prependTo(heading);
        else placeholder().prependTo(heading);
        $('<h2>').text(episodes?.data?.name||config.title).appendTo(info);
        $('<p class="xplayer-vlist-current">').text('正在播放 '+(currentEpisodeLabel||displayEpisodeLabel(config.sid)||'当前视频')).appendTo(info);
        if(currentEpisodeTitle&&currentEpisodeTitle!==currentEpisodeLabel)$('<p class="xplayer-vlist-current-title">').text(currentEpisodeTitle).appendTo(info);
        if(data.notice&&data.notice!=='请选择视频或输入播放链接')$('<p class="xplayer-list-notice">').text(data.notice).appendTo(host);
        if(!Array.isArray(episodes?.video)||!episodes.video.length)$('<p>').text(episodes?.msg||'暂未获取到剧集，请配置自建元数据或苹果 CMS 接口').appendTo(host);
        (episodes?.video||[]).forEach(video=>{
            (video.url||[]).forEach(source=>{
                const count=(source.play||[]).filter(url=>safeUrl(url)).length;
                $('<h3>').text((source.name||'剧集')+' · '+count+'项').appendTo(host);const grid=$('<div class="xplayer-episode-grid">').appendTo(host);
                (source.play||[]).forEach((url,i)=>{
                    if(!safeUrl(url))return;const button=$('<button type="button">').text(source.labels?.[i]||String(i+1));
                    if(text(source.titles?.[i]))button.attr('title',source.titles[i]);
                    button.toggleClass('current',i===episodeIndex(source)).on('click',()=>{store.set('xplayer.episodes',episodes);config.next=url;XGGM.video.next();}).appendTo(grid);
                });
            });
        });
        $('#player').append(host);
    }
    async function post(type,field,token){
        try{return await $.ajax({url:'api.php?type='+type,type:'POST',dataType:'json',timeout:60000,data:{[field]:token}});}
        catch(error){
            if(error?.statusText==='timeout')throw new Error((type==='vlist'?'选集':'解析')+'接口请求超时，请稍后重试');
            const message=text(error?.responseJSON?.msg).trim();
            if(message)throw new Error(message);
            const status=Number(error?.status);
            throw new Error('服务请求失败'+(Number.isInteger(status)&&status>0?'（HTTP '+status+'）':'，请检查网络后重试'));
        }
    }
    async function loadEpisodes(){
        const cached=store.get('xplayer.episodes');
        const has=record=>Array.isArray(record?.video)&&record.video.some(video=>(video.url||[]).some(source=>exactEpisodeIndex(source,record)>=0));
        // A cached list also contains the requested episode's vid, number and
        // title. Reusing it for another URL carries stale metadata into playback.
        const age=Date.now()-Number(cached?.fetchedAt);
        const reuse=cached?.schemaVersion===4&&cached.sourceUrl===data.source&&typeof data.listConfigKey==='string'&&data.listConfigKey!==''&&
            cached.listConfigKey===data.listConfigKey&&age>=0&&age<600000&&has(cached);
        currentVideo=null;currentSource=null;currentEpisodeLabel='';currentEpisodeTitle='';config.next='';
        try{
            episodes=reuse?cached:await post('vlist','vodkey',data.listToken);
            if(!reuse&&episodes&&typeof episodes==='object'){episodes.fetchedAt=Date.now();episodes.sourceUrl=data.source;episodes.listConfigKey=data.listConfigKey;}
        }catch(error){episodes={msg:text(error?.message)||'剧集接口暂不可用',video:[]};}
        if(!Array.isArray(episodes?.video))return;
        const name=typeof episodes.data?.name==='string'?episodes.data.name.trim():'';
        if(name)config.title=name;
        if(Number(episodes.data?.episode)>0)config.sid=String(Number(episodes.data.episode));
        const tracks=episodes.video.flatMap(video=>(video.url||[]).map(source=>({video,source})));
        const selected=tracks.find(({source})=>exactEpisodeIndex(source)>=0)||tracks.find(({source})=>episodeIndex(source)>=0);
        if(selected){
            const {video,source}=selected,index=episodeIndex(source),label=text(source.labels?.[index])||String(index+1);
            currentVideo=video;currentSource=source;
            config.title=name||video.name||config.title;
            const number=episodeNumber(label),metadataNumber=Number(episodes.data?.episode);
            // List position is not an episode number for named specials. Keep the
            // upstream numeric episode for their existing danmaku context.
            config.sid=String(number||(Array.isArray(source.titles)&&metadataNumber>0?metadataNumber:exactEpisodeIndex(source)>=0?index+1:metadataNumber||index+1));
            currentEpisodeLabel=displayEpisodeLabel(label);
            currentEpisodeTitle=text(source.titles?.[index])||(index===episodes.data?.currentIndex?text(episodes.data?.episodeTitle):'');
            config.next=source.play[index+1]||'';
        }else{
            currentEpisodeLabel=displayEpisodeLabel(text(episodes.data?.episodeLabel)||config.sid);
            currentEpisodeTitle=text(episodes.data?.episodeTitle);
        }
        if(episodes.data?.id)config.id=String(episodes.data.id);
        episodes.schemaVersion=4;store.set('xplayer.episodes',episodes);
    }
    function seriesPicture(value){
        const picture=safeUrl(value);if(!picture)return '';
        const address=new URL(picture);
        // A compatibility fingerprint avoids shipping a recoverable host literal.
        try{if(global.CryptoJS.MD5(address.hostname).toString()==='8ed97c24e663014b88364f2b0a2fd441'&&decodeURIComponent(address.pathname).replace(/\/+$/,'').toLowerCase()==='/poster-background.php')return '';}catch(_){return '';}
        return picture;
    }
    function selectedArtwork(preferEpisode=false){
        const poster=seriesPicture(currentVideo?.pic);
        if(poster&&!preferEpisode)return {url:poster,episode:false};
        // The original catalogue supplies an image for each episode. Use only
        // the item matching this URL; never borrow the first episode's cover.
        const index=currentSource?exactEpisodeIndex(currentSource):-1;
        const cover=index>=0?seriesPicture(currentSource.covers?.[index]):'';
        return {url:cover,episode:!!cover};
    }
    function episodeNumber(label){
        const match=String(label).trim().match(/^(?:第\s*)?0*(\d+)\s*(?:集|话|期)?$/);
        return match&&Number(match[1])>0?Number(match[1]):0;
    }
    function displayEpisodeLabel(label){
        const value=String(label||'').trim();return /^\d+$/.test(value)?'第'+value+'集':value;
    }
    function episodeIdentity(record){
        // Only the built-in Bilibili season adapter can resolve an ss page to
        // its explicit ep ID. Never treat a number on another host as an alias.
        try{
            const original=new URL(data.source),resolved=new URL(record?.data?.resolvedUrl);
            const hosts=['bilibili.com','www.bilibili.com'],vid=String(record?.data?.vid||'');
            if(hosts.includes(original.hostname)&&/^\/bangumi\/play\/ss\d+\/?$/.test(original.pathname)&&
                hosts.includes(resolved.hostname)&&/^https?:$/.test(resolved.protocol)&&!resolved.username&&!resolved.password&&
                /^\d+$/.test(vid)&&resolved.pathname.replace(/\/$/,'')==='/bangumi/play/ep'+vid)return resolved.href;
        }catch(_){}
        return data.source;
    }
    function exactEpisodeIndex(source,record=episodes){
        if(!Array.isArray(source.play))return -1;
        const requested=episodeIdentity(record);
        return source.play.findIndex(url=>{
            if(url===requested)return true;
            try{
                const left=new URL(url),right=new URL(requested);
                if(!/^https?:$/.test(left.protocol)||!/^https?:$/.test(right.protocol)||left.host!==right.host||left.pathname!==right.pathname)return false;
                const identityQuery=address=>{
                    if(!['iqiyi.com','www.iqiyi.com'].includes(address.hostname)||!/^\/v_[A-Za-z0-9]+\.html$/.test(address.pathname))return address.search;
                    const parts=address.search.slice(1).split('&'),kept=parts.filter(part=>{try{return decodeURIComponent(part.split('=',1)[0])!=='qyTrace';}catch(_){return true;}});
                    // Keep every other query byte/order intact; searchParams would
                    // rewrite unrelated encodings, including %20 versus +.
                    return kept.length===parts.length?address.search:kept.join('&')?'?'+kept.join('&'):'';
                };
                return identityQuery(left)===identityQuery(right);
            }catch(_){return false;}
        });
    }
    function episodeIndex(source){
        if(!Array.isArray(source.play)||!source.play.length)return -1;
        const exact=exactEpisodeIndex(source);if(exact>=0)return exact;
        const label=text(episodes?.data?.episodeLabel),labelIndex=label?(source.labels||[]).indexOf(label):-1;
        if(labelIndex>=0)return labelIndex;
        const currentIndex=episodes?.data?.currentIndex;
        if(Number.isInteger(currentIndex)&&currentIndex>=0&&currentIndex<source.play.length)return currentIndex;
        const number=Number(episodes?.data?.episode||episodes?.episode);
        if(!Number.isInteger(number)||number<1)return -1;
        const labeled=(source.labels||[]).findIndex(label=>episodeNumber(label)===number);
        return labeled>=0?labeled:(number<=source.play.length?number-1:-1);
    }
    global.XplayerBootstrap={start:async function(){
        if(!data.source){global.XplayerLoading?.hide();$('#xplayer-open').prop('hidden',false);return;}
        global.XplayerLoading?.show('正在解析视频');
        const list=data.showlist?loadEpisodes():Promise.resolve();
        try {
            const playback=data.async?await post('parse','vkey',data.parseToken):data.playback;
            if(Number(playback.code)!==200||!safeUrl(playback.url))throw Error(playback.msg||data.errorText);
            config.url=playback.url;await list;global.XplayerLoading?.show('正在加载视频');
            const danmakuContext={
                url:data.source,mediaUrl:playback.url,title:episodes?.data?.name||text(params.get('title')),episode:config.sid,
                episodeLabel:episodes?.data?.episodeLabel||currentEpisodeLabel,
                explicitId:text(params.get('id')),id:legacyDanmakuId(),
                metadata:episodes?.data||{},playbackIdentity:playback.identity||{},
                legacyLocalId:(text(params.get('id'))||CryptoJS.MD5(data.source).toString())+' P'+config.sid
            };
            Object.assign(danmakuContext,global.XplayerDanmakuSources.identify(danmakuContext));
            global.XplayerDanmakuSources.configure({
                apis:Array.isArray(data.danmakuApis)&&data.danmakuApis[0]===data.danmakuApi?data.danmakuApis:[data.danmakuApi],
                createApis:data.danmakuCreateApis||[],localFallback:data.danmakuLocalFallback!==false,context:danmakuContext
            });
            // Keep the server's media type for signed or extensionless playback URLs.
            const Player=global.xplayer;global.xplayer=function(options){
                if(options.video.url===config.url&&['hls','flv','dash'].includes(playback.type))options.video.type=playback.type;
                return new Player(options);
            };global.xplayer.prototype=Player.prototype;
            XGGM.start();
        } catch(error){global.XplayerLoading?.hide();showPlaybackError(error.message);}
    }};
    $('#xplayer-open').on('submit',event=>{event.preventDefault();const target=new URL(location.href);target.search='';target.searchParams.set('url',$('#xplayer-url').val().trim());location.assign(target.href);});
    global.addEventListener('pagehide',()=>{clearInterval(onlineTimer);clearTimeout(nextEpisodeTimer);XGGM.dp?.destroy();});
})(window);

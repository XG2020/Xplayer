/* Local playback preferences and settings UI. Codec choices only select real source levels. */
(function (global) {
    'use strict';
    const STORAGE_KEY = 'xplayer.playback-preferences.v1';
    const defaults = {mirror:false,loop:false,autoplay:true,playMode:'auto-next',aspectRatio:'auto',hideBlackBars:false,lightsOut:false,highEnergy:true,nativePictureInPicture:false,codec:'default',normalization:'off'};
    const choices = {playMode:['auto-next','pause'],aspectRatio:['auto','4:3','16:9'],codec:['default','av1','hevc','avc'],normalization:['off','standard','high-dynamic']};
    const labels = {default:'默认',av1:'AV1',hevc:'HEVC',avc:'AVC'};
    const instances = new WeakMap();
    function valid(values) {
        const result = {};
        if (!values || typeof values !== 'object' || Array.isArray(values)) return result;
        for (const key of Object.keys(defaults)) {
            if (choices[key] ? choices[key].includes(values[key]) : typeof values[key] === 'boolean') result[key] = values[key];
        }
        return result;
    }
    function read(fallback = {}) {
        let stored = {};
        try {stored = valid(JSON.parse(localStorage.getItem(STORAGE_KEY)));} catch (_) {}
        return {...defaults,...valid(fallback),...stored};
    }
    function save(preferences) {try {localStorage.setItem(STORAGE_KEY,JSON.stringify(valid(preferences)));} catch (_) {}}
    function node(tag, className, text) {
        const result = document.createElement(tag);
        if (className) result.className = className;
        if (text !== undefined) result.textContent = text;
        return result;
    }
    function codecOf(level) {
        const value = String(level.videoCodec || level.attrs?.CODECS || level.codecSet || '').toLowerCase();
        if (/av01|\bav1\b/.test(value)) return 'av1';
        if (/hvc1|hev1|hevc|h265/.test(value)) return 'hevc';
        if (/avc1|avc3|h264|\bavc\b/.test(value)) return 'avc';
        return '';
    }
    function attach(player) {
        if (instances.has(player)) return instances.get(player);
        let preferences = read({autoplay:!!player.options.autoplay,loop:!!player.options.loop});
        let dialog = null, destroyed = false, shade = null, previousFocus = null, boundEngine = null, engineListeners = [];
        let codecStatus = {available:false,applied:false,message:''};
        let normalizationStatus = '', normalizationBusy = false, normalizationRestoreAttempted = false;
        const restoreNormalization = preferences.normalization;
        preferences.normalization = global.XplayerContextMenu?.getNormalization?.(player) || 'off';
        const cleanups = [], playerListeners = [], inputs = new Map();
        const originalVideoStyle = new WeakMap();
        const loopNode = player.template.loop, loopLabel = loopNode?.querySelector('.xplayer-label');
        const originalLoopLabel = loopLabel?.textContent;
        const menu = player.container.querySelector('.xplayer-setting-origin-panel');
        const settingBox = player.template.settingBox;
        const listen = (target,event,callback,options) => {target.addEventListener(event,callback,options);cleanups.push(()=>target.removeEventListener(event,callback,options));};
        const onPlayer = (event,callback) => {player.on(event,callback);playerListeners.push([event,callback]);};
        function broadcast(changedKeys = []) {
            player.container.dispatchEvent(new CustomEvent('xplayer:playback-settings-change',{bubbles:true,detail:{player,preferences:{...preferences},changedKeys,codecStatus:{...codecStatus}}}));
        }
        function syncControls() {
            for (const [key,items] of inputs) {
                inputs.set(key,items.filter(item=>item.isConnected));
                for (const item of items) {
                if (!item.isConnected) continue;
                if (key === 'normalization') item.disabled = normalizationBusy;
                if (item.dataset.choice !== undefined) {
                    const selected = preferences[key] === item.dataset.choice;
                    item.classList.toggle('selected',selected); item.setAttribute('aria-pressed',String(selected));
                } else item.setAttribute('aria-checked',String(preferences[key]));
            }
            }
            if (loopNode) loopNode.setAttribute('aria-checked',String(preferences.loop));
            if (player.template.loopToggle) player.template.loopToggle.checked = preferences.loop;
            const info = dialog?.querySelector('.xplayer-codec-status');
            if (info) info.textContent = codecStatus.message;
            const normalizationInfo = dialog?.querySelector('.xplayer-normalization-status');
            if (normalizationInfo) normalizationInfo.textContent = normalizationStatus;
        }
        function track(key, control) {
            if (!inputs.has(key)) inputs.set(key,[]);
            inputs.get(key).push(control); return control;
        }
        function applyVisuals() {
            if (destroyed) return;
            const video = player.video, wrap = player.template.videoWrap || video.parentElement;
            if (!originalVideoStyle.has(video)) originalVideoStyle.set(video,video.getAttribute('style'));
            player.container.classList.toggle('xplayer-mirrored',preferences.mirror);
            player.container.classList.toggle('xplayer-hide-high-energy',!preferences.highEnergy);
            player.container.classList.toggle('xplayer-forced-ratio',preferences.aspectRatio !== 'auto');
            video.style.objectFit = preferences.hideBlackBars ? 'cover' : preferences.aspectRatio === 'auto' ? 'contain' : 'fill';
            if (preferences.aspectRatio === 'auto') {video.style.width='100%';video.style.height='100%';}
            else {
                const [a,b] = preferences.aspectRatio.split(':').map(Number), ratio=a/b;
                const box = wrap.getBoundingClientRect(), width=Math.min(box.width,box.height*ratio);
                video.style.width=width+'px';video.style.height=width/ratio+'px';
            }
            player.setting.loop=preferences.loop;player.options.loop=preferences.loop;video.loop=preferences.loop;
            player.options.autoplay=preferences.autoplay;video.autoplay=preferences.autoplay;
            player.container.classList.toggle('xplayer-lights-out-player',preferences.lightsOut);
            if (preferences.lightsOut && !shade) {shade=node('div','xplayer-lights-out-shade');shade.setAttribute('aria-hidden','true');document.body.append(shade);}
            if (!preferences.lightsOut && shade) {shade.remove();shade=null;}
            if (typeof player.progressFeatures?.setHighEnergyVisible === 'function') player.progressFeatures.setHighEnergyVisible(preferences.highEnergy);
            syncControls();
        }
        function applyCodec() {
            const engine=player.mediaEngine, levels=Array.isArray(engine?.levels)?engine.levels:[];
            if (preferences.codec === 'default') {
                if (levels.length) engine.currentLevel=-1;
                codecStatus={available:true,applied:!!levels.length,message:'默认：使用当前片源的自动编码选择'};
            } else {
                const matches=levels.map((level,index)=>({level,index})).filter(item=>codecOf(item.level)===preferences.codec);
                if (!matches.length) codecStatus={available:false,applied:false,message:'已保存 '+labels[preferences.codec]+' 偏好；当前片源没有可切换的该编码，继续原编码播放'};
                else {
                    const current=levels[engine.currentLevel] || levels[engine.loadLevel] || levels[0];
                    matches.sort((a,b)=>Math.abs((a.level.height||0)-(current.height||0))-Math.abs((b.level.height||0)-(current.height||0)) || Math.abs((a.level.bitrate||0)-(current.bitrate||0))-Math.abs((b.level.bitrate||0)-(current.bitrate||0)));
                    const target=matches[0], codec=target.level.videoCodec || String(target.level.attrs?.CODECS || '').split(',').map(value=>value.trim()).find(value=>codecOf({videoCodec:value})===preferences.codec);
                    let supported=true;
                    try {if(codec && global.MediaSource?.isTypeSupported) supported=global.MediaSource.isTypeSupported('video/mp4; codecs="'+codec+'"');} catch (_) {supported=false;}
                    if (!supported) codecStatus={available:false,applied:false,message:'已保存 '+labels[preferences.codec]+' 偏好；当前浏览器不支持片源提供的该编码'};
                    else {engine.currentLevel=target.index;codecStatus={available:true,applied:true,level:target.index,message:'已切换到片源的 '+labels[preferences.codec]+' 编码'};}
                }
            }
            syncControls();return {...codecStatus};
        }
        function bindEngine() {
            const engine=player.mediaEngine;
            if (engine===boundEngine) return;
            for (const [old,event,callback] of engineListeners) old.off?.(event,callback);
            engineListeners=[];boundEngine=engine;
            if (engine?.on && Array.isArray(engine.levels)) {
                for (const event of [global.Hls?.Events?.MANIFEST_PARSED,global.Hls?.Events?.LEVELS_UPDATED].filter(Boolean)) {
                    const callback=()=>{applyCodec();broadcast([]);};engine.on(event,callback);engineListeners.push([engine,event,callback]);
                }
            }
            applyCodec();
        }
        function commit(next) {
            const changedKeys=Object.keys(next).filter(key=>preferences[key]!==next[key]);
            if (!changedKeys.length) return {...preferences};
            preferences={...preferences,...next};save(preferences);applyVisuals();
            if (changedKeys.includes('codec')) applyCodec();
            broadcast(changedKeys);return {...preferences};
        }
        function update(patch) {
            const next=valid(patch);
            if (next.normalization !== undefined && next.normalization !== preferences.normalization) return applyNormalization(next);
            return commit(next);
        }
        async function applyNormalization(next, persist = true) {
            if (normalizationBusy) return {...preferences};
            normalizationBusy=true;normalizationStatus='正在调整音量均衡…';syncControls();
            try {
                if (typeof global.XplayerContextMenu?.setNormalization !== 'function') throw Error('音量均衡模块暂未就绪');
                await global.XplayerContextMenu.setNormalization(player,next.normalization);
                normalizationStatus='';
                if (persist) return commit(next);
                preferences.normalization=next.normalization;broadcast(['normalization']);return {...preferences};
            } catch (error) {
                normalizationStatus=error.message || '音量均衡未能应用，已保留原设置';
                throw error;
            } finally {normalizationBusy=false;syncControls();}
        }
        function requestUpdate(patch) {Promise.resolve(update(patch)).catch(()=>{});}
        function restoreAudioPreference() {
            if (normalizationRestoreAttempted || restoreNormalization==='off' || player.video.readyState<2) return;
            normalizationRestoreAttempted=true;
            applyNormalization({normalization:restoreNormalization},false).catch(()=>{});
        }
        function closeDialog() {
            if (!dialog) return;
            dialog.remove();dialog=null;player.focus=true;
            if (previousFocus?.isConnected) previousFocus.focus();
        }
        function toggleRow(label,key,compact=false) {
            const row=node('button',compact?'xplayer-setting-item xplayer-preference-item':'xplayer-playback-toggle');row.type='button';row.dataset.preference=key;row.setAttribute('role','switch');
            row.append(node('span','xplayer-preference-label',label),node('span','xplayer-preference-switch'));
            row.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();requestUpdate({[key]:!preferences[key]});});
            return track(key,row);
        }
        function choiceRow(label,key,values) {
            const row=node('div','xplayer-playback-row'),buttons=node('div','xplayer-preference-choices');
            row.append(node('span','xplayer-playback-label',label));
            for (const [value,text] of values) {
                const button=node('button','',text);button.type='button';button.dataset.preference=key;button.dataset.choice=value;
                button.addEventListener('click',()=>requestUpdate({[key]:value}));buttons.append(track(key,button));
            }
            row.append(buttons);return row;
        }
        function showMore() {
            closeDialog();player.setting.hide();previousFocus=document.activeElement;player.focus=false;
            dialog=node('section','xplayer-playback-dialog xplayer-feature-dialog');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-label','播放设置');
            const header=node('div','xplayer-playback-header');header.append(node('h2','','播放设置'));
            const close=node('button','xplayer-playback-close','×');close.type='button';close.setAttribute('aria-label','关闭播放设置');close.addEventListener('click',closeDialog);header.append(close);
            const content=node('div','xplayer-playback-content');
            content.append(choiceRow('播放方式','playMode',[['auto-next','自动切集'],['pause','播完暂停']]));
            content.append(choiceRow('画面比例','aspectRatio',[['auto','自动'],['4:3','4:3'],['16:9','16:9']]));
            content.append(choiceRow('音量均衡','normalization',[['standard','标准'],['high-dynamic','高动态'],['off','关闭']]));
            const normalizationInfo=node('p','xplayer-normalization-status');normalizationInfo.setAttribute('role','status');content.append(normalizationInfo);
            content.append(choiceRow('视频编码','codec',[['default','默认'],['av1','AV1'],['hevc','HEVC'],['avc','AVC']]));
            const status=node('p','xplayer-codec-status');status.setAttribute('role','status');content.append(status);
            for (const [key,label] of [['hideBlackBars','隐藏黑边'],['lightsOut','关灯模式'],['highEnergy','高能进度条'],['nativePictureInPicture','原生画中画']]) content.append(toggleRow(label,key));
            dialog.append(header,content);player.container.append(dialog);
            dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeDialog();}});
            syncControls();close.focus();
        }
        function destroy() {
            if (destroyed) return;destroyed=true;closeDialog();cleanups.forEach(run=>run());
            for (const [event,callback] of playerListeners) if (event!=='destroy' && player.events?.events[event]) player.events.events[event]=player.events.events[event].filter(item=>item!==callback);
            for (const [engine,event,callback] of engineListeners) engine.off?.(event,callback);
            if (shade) shade.remove();
            player.container.classList.remove('xplayer-mirrored','xplayer-hide-high-energy','xplayer-forced-ratio','xplayer-lights-out-player');
            const video=player.video,style=originalVideoStyle.get(video);if(style===null)video.removeAttribute('style');else if(style!==undefined)video.setAttribute('style',style);
            settingBox?.classList.remove('xplayer-playback-settings-menu');
            if(loopLabel)loopLabel.textContent=originalLoopLabel;
            if(loopNode){loopNode.removeAttribute('role');loopNode.removeAttribute('aria-checked');loopNode.removeAttribute('tabindex');}
            instances.delete(player);delete player.playbackSettings;
        }
        if (menu) {
            settingBox.classList.add('xplayer-playback-settings-menu');
            const mirror=toggleRow('镜像画面','mirror',true),autoplay=toggleRow('自动开播','autoplay',true);
            menu.insertBefore(mirror,loopNode || menu.firstChild);if(loopNode)loopNode.after(autoplay);else menu.append(autoplay);
            const more=node('button','xplayer-setting-item xplayer-more-playback-settings','更多播放设置');more.type='button';more.append(node('span','','›'));more.addEventListener('click',showMore);menu.append(more);
            cleanups.push(()=>mirror.remove(),()=>autoplay.remove(),()=>more.remove());
        }
        if (loopNode) {
            if(loopLabel)loopLabel.textContent='单集循环';loopNode.setAttribute('role','switch');loopNode.tabIndex=0;
            const toggle=event=>{event.preventDefault();event.stopImmediatePropagation();update({loop:!preferences.loop});};
            listen(loopNode,'click',toggle,true);
            listen(loopNode,'keydown',event=>{if(event.key===' '||event.key==='Enter')toggle(event);});
        }
        listen(global,'storage',event=>{if(event.key===STORAGE_KEY){const incoming=read({autoplay:!!player.options.autoplay}),normalization=incoming.normalization;preferences={...incoming,normalization:preferences.normalization};applyVisuals();applyCodec();broadcast(Object.keys(defaults));if(normalization!==preferences.normalization)requestUpdate({normalization});}});
        const observer=global.ResizeObserver?new ResizeObserver(applyVisuals):null;
        if(observer){observer.observe(player.template.videoWrap||player.container);cleanups.push(()=>observer.disconnect());}
        for (const event of ['loadedmetadata','quality_end']) onPlayer(event,()=>{bindEngine();applyVisuals();});
        onPlayer('resize',applyVisuals);onPlayer('loadeddata',restoreAudioPreference);onPlayer('destroy',destroy);
        const api={getState:()=>({...preferences}),set:update,apply:()=>{bindEngine();applyVisuals();return {...preferences};},showMore,close:closeDialog,getCodecStatus:()=>({...codecStatus}),destroy};
        instances.set(player,api);player.playbackSettings=api;bindEngine();applyVisuals();broadcast([]);restoreAudioPreference();return api;
    }
    global.XplayerPlaybackSettings={read,attach,get:player=>attach(player).getState(),set:(player,patch)=>attach(player).set(patch),apply:player=>attach(player).apply(),storageKey:STORAGE_KEY};
})(window);

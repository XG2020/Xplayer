/* Move the existing player into Document Picture-in-Picture; never clone its media. */
(function (global) {
    'use strict';
    const mainDocument = global.document;
    const states = new WeakMap();
    const storageKey = 'xplayer.playback-preferences.v1';
    let active = null;
    let nativeOverride = null;
    // Main playback and PiP share the same danmaku switch artwork.
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const editable = target => target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),.xplayer-feature-dialog');

    function preferences(player) {
        try {
            if (global.XplayerPlaybackSettings?.get) return global.XplayerPlaybackSettings.get(player);
            return JSON.parse(global.localStorage.getItem(storageKey)) || {};
        } catch (_) { return {}; }
    }
    function nativePreferred(player) { return nativeOverride ?? (preferences(player)?.nativePictureInPicture === true); }
    function listen(state, node, type, handler, options, permanent = false) {
        node.addEventListener(type, handler, options);
        (permanent ? state.cleanup : state.sessionCleanup).push(() => node.removeEventListener(type, handler, options));
    }
    function notice(state, message) { if (!state.destroyed) state.player.notice?.(message, 3500); }
    function announce(state) {
        if (state.button) {
            state.button.setAttribute('aria-pressed', String(state.mode !== 'inline'));
            state.button.setAttribute('data-balloon', state.mode === 'inline' ? state.originalTooltip : '退出画中画');
        }
        state.container.dispatchEvent(new global.CustomEvent('xplayer:pip-change', {
            bubbles: true, detail: {player: state.player, mode: state.mode}
        }));
    }
    function sizeChanged(state) {
        if (state.destroyed) return;
        if(state.speedMenu){
            const rows=Math.max(1,Math.min(6,Math.floor((state.container.clientHeight-66)/32)));
            state.speedMenu.style.maxHeight=(rows*32+12)+'px';
        }
        if(state.volumePanel)state.volumePanel.style.height=clamp(state.container.clientHeight-52,80,144)+'px';
        const bar = state.player.template?.barWrap;
        if (bar) {
            bar.dispatchEvent(new global.Event('pointerleave'));
            bar.dispatchEvent(new global.MouseEvent('mouseleave'));
        }
        state.player.resize?.();
        state.player.controller?.show?.();
    }
    function suppressTooltips(state) {
        const saved=new Map(),attributes=['title','data-balloon','data-balloon-pos'];
        function strip(node) {
            if(node.nodeType!==1)return;
            for(const element of [node,...node.querySelectorAll('[title],[data-balloon],[data-balloon-pos]')]) {
                for(const attribute of attributes) {
                    const value=element.getAttribute(attribute);if(value===null)continue;
                    if(!saved.has(element))saved.set(element,{});
                    saved.get(element)[attribute]=value;element.removeAttribute(attribute);
                }
            }
        }
        strip(state.container);
        const observer=new global.MutationObserver(records=>{
            for(const record of records) {
                if(record.type==='attributes')strip(record.target);
                else record.addedNodes.forEach(strip);
            }
        });
        observer.observe(state.container,{subtree:true,childList:true,attributes:true,attributeFilter:attributes});
        state.sessionCleanup.push(()=>{
            observer.disconnect();
            for(const [element,values] of saved)for(const [attribute,value] of Object.entries(values))element.setAttribute(attribute,value);
        });
    }
    function svgIcon(className,viewBox,markup) {
        const icon=mainDocument.createElementNS('http://www.w3.org/2000/svg','svg');
        icon.setAttribute('class',className);icon.setAttribute('viewBox',viewBox);icon.setAttribute('aria-hidden','true');
        icon.innerHTML=markup;return icon;
    }
    function refreshVolumeIcon(state) {
        if(!['document','floating'].includes(state.mode)||!state.volumeIcon)return;
        let icon=state.volumeIcon.querySelector('.xplayer-pip-volume-svg');
        if(!icon){
            icon=svgIcon('xplayer-pip-volume-svg','0 0 28 28','<path d="M3 10h5l6-5v18l-6-5H3z"/><g class="xplayer-pip-volume-waves"><path d="M18 10c2 2 2 6 0 8M22 6c4 4 4 12 0 16"/></g><path class="xplayer-pip-volume-muted" d="m19 11 6 6m0-6-6 6"/>');
            state.volumeIcon.append(icon);
        }
        icon.dataset.muted=String(state.video.muted||state.video.volume===0);
    }
    function installVolumeControl(state) {
        if(!state.volume)return;
        const panel=mainDocument.createElement('div');panel.className='xplayer-pip-volume-panel';panel.hidden=true;
        const value=mainDocument.createElement('output');value.className='xplayer-pip-volume-value';value.setAttribute('aria-hidden','true');
        const range=mainDocument.createElement('input');range.type='range';range.min='0';range.max='100';range.step='1';
        range.className='xplayer-pip-volume-range';range.setAttribute('aria-label','音量');range.setAttribute('aria-orientation','vertical');range.setAttribute('orient','vertical');
        panel.append(value,range);state.volumePanel=panel;
        const sync=()=>{
            const percent=Math.round(state.video.volume*100);range.value=String(percent);range.style.setProperty('--volume-fill',percent+'%');
            value.textContent=state.video.muted?'静音':percent+'%';range.setAttribute('aria-valuetext',percent+'%'+(state.video.muted?'，已静音':''));
        };
        state.closeVolume=()=>{
            if(panel.hidden)return;panel.hidden=true;state.volumeDragging=false;
            if(range.ownerDocument.activeElement===range)range.blur();
            if(!state.destroyed&&state.player.controller){state.player.controller.disableAutoHide=!!state.volumeAutoHideBefore;state.player.controller.setAutoHide?.();}
        };
        const open=()=>{
            if(!['document','floating'].includes(state.mode))return;
            state.closeSpeed?.();
            if(panel.hidden){state.volumeAutoHideBefore=state.player.controller.disableAutoHide;state.player.controller.disableAutoHide=true;}
            panel.hidden=false;panel.style.height=clamp(state.container.clientHeight-52,80,144)+'px';sync();state.player.controller.show();
        };
        listen(state,state.volume,'mouseenter',open,undefined,true);
        listen(state,state.volume,'mouseleave',()=>{if(!state.volumeDragging&&range.ownerDocument.activeElement!==range)state.closeVolume();},undefined,true);
        listen(state,state.volume,'focusout',event=>{if(event.relatedTarget&&!state.volume.contains(event.relatedTarget))state.closeVolume();},undefined,true);
        listen(state,range,'input',event=>{event.stopPropagation();state.player.volume(range.valueAsNumber/100,false,true);sync();},undefined,true);
        listen(state,range,'pointerdown',event=>{state.volumeDragging=true;range.setPointerCapture?.(event.pointerId);event.stopPropagation();},undefined,true);
        const finish=event=>{state.volumeDragging=false;event.stopPropagation();};
        listen(state,range,'pointerup',finish,undefined,true);listen(state,range,'pointercancel',finish,undefined,true);
        listen(state,range,'keydown',event=>{
            event.stopPropagation();
            if(event.key==='Escape'){event.preventDefault();state.closeVolume();state.volume.querySelector('.xplayer-volume-icon')?.focus();}
        },undefined,true);
        listen(state,state.container,'pointerdown',event=>{if(!state.volume.contains(event.target))state.closeVolume();},true,true);
        listen(state,state.video,'volumechange',sync,undefined,true);sync();
        state.cleanup.push(()=>panel.remove());
    }
    function movePlayer(state, destination) {
        const video = state.video;
        const snapshot = video.readyState >= 1 || !state.mediaSnapshot ? {
            time:video.currentTime, paused:video.paused, rate:video.playbackRate, volume:video.volume, muted:video.muted
        } : state.mediaSnapshot;
        state.mediaSnapshot = snapshot;
        state.moveCleanup?.();
        const apply = () => {
            if (state.destroyed) return;
            // Real Document PiP preserves these itself. Some alternate documents trigger
            // metadata loading on adoption; retain position without replacing/reloading video.
            if (Math.abs(video.currentTime - snapshot.time) > .1) {
                try {video.currentTime = snapshot.time;} catch (_) {}
            }
            video.playbackRate = snapshot.rate; video.volume = snapshot.volume; video.muted = snapshot.muted;
            if (snapshot.paused) {if(!video.paused)video.pause();}
            else if (video.paused) video.play().catch(() => {});
        };
        const metadata = () => {global.queueMicrotask(apply);state.moveCleanup?.();state.moveCleanup=null;};
        video.addEventListener('loadedmetadata', metadata, {once:true});
        state.moveCleanup = () => video.removeEventListener('loadedmetadata', metadata);
        destination(); apply();
    }

    // The recovered engine schedules through its original window. After adoption it must
    // follow the visible PiP window, otherwise hiding the opener can stop new danmaku.
    function installDanmakuClock(state) {
        const danmaku = state.player.danmaku;
        if (!danmaku || state.clock) return;
        const clock = {danmaku, original: danmaku.frame, id: 0, owner: null};
        state.clock = clock;
        function frame() {
            if (state.destroyed || danmaku.destroyed || clock.id) return;
            const owner = state.mode === 'document' && state.pipWindow && !state.pipWindow.closed ? state.pipWindow : global;
            clock.owner = owner;
            clock.id = owner.requestAnimationFrame(() => {
                clock.id = 0;
                if (state.destroyed || danmaku.destroyed) return;
                if (danmaku.dan.length && !danmaku.paused && danmaku.showing) {
                    const due = [];
                    let item = danmaku.dan[danmaku.danIndex];
                    while (item && danmaku.options.time() > Number(item.time)) {
                        due.push(item); item = danmaku.dan[++danmaku.danIndex];
                    }
                    if (danmaku.loadok > 0) danmaku.draw(due);
                    else danmaku.loadok++;
                }
                frame();
            });
        }
        danmaku.frame = frame;
        frame();
    }
    function switchClock(state) {
        if (!state.clock) return;
        const clock = state.clock;
        if (clock.id) { try { clock.owner.cancelAnimationFrame(clock.id); } catch (_) {} clock.id = 0; }
        clock.danmaku.frame();
    }

    function restore(state, options = {}) {
        if (!['document', 'floating'].includes(state.mode)) return;
        const wasPlaying = !state.video.paused;
        const pipWindow = state.pipWindow;
        state.closeSpeed?.();
        state.closeVolume?.();state.volumePanel?.remove();
        state.sessionCleanup.splice(0).forEach(cleanup => cleanup());
        state.volumeIcon?.querySelectorAll('.xplayer-pip-volume-svg').forEach(icon=>icon.remove());
        movePlayer(state, () => {
            if (state.placeholder?.parentNode) state.placeholder.replaceWith(state.container);
            else if (state.parent?.isConnected) state.parent.insertBefore(state.container, state.next?.parentNode === state.parent ? state.next : null);
            else if (state.container.ownerDocument !== mainDocument) mainDocument.body.append(state.container);
        });
        if (state.volumeMoved && state.volumeParent) {
            state.volumeParent.insertBefore(state.volume, state.volumeNext?.parentNode === state.volumeParent ? state.volumeNext : null);
            state.volumeMoved = false;
        }
        state.container.classList.remove('xplayer-pip-container');
        if (state.savedStyle === null) state.container.removeAttribute('style');
        else if (state.savedStyle !== undefined) state.container.setAttribute('style', state.savedStyle);
        state.host?.remove(); state.placeholder?.remove();
        state.host = state.placeholder = state.pipWindow = null;
        state.mode = 'inline';
        if (active === state) active = null;
        switchClock(state);
        if (pipWindow && !pipWindow.closed && !options.fromPageHide) pipWindow.close();
        if (!state.destroyed) {
            sizeChanged(state); announce(state);
            if (wasPlaying && state.video.paused) state.video.play().catch(() => {});
        }
    }
    async function close(state) {
        if (state.mode === 'native') {
            if (mainDocument.pictureInPictureElement === state.video && mainDocument.exitPictureInPicture) {
                try { await mainDocument.exitPictureInPicture(); } catch (_) {}
            }
            state.mode = 'inline'; if (active === state) active = null; announce(state);
        } else restore(state);
    }
    function placeholder(state) {
        const box = state.container.getBoundingClientRect();
        state.parent = state.container.parentNode; state.next = state.container.nextSibling;
        state.savedStyle = state.container.getAttribute('style');
        const element = mainDocument.createElement('div');
        element.className = 'xplayer-pip-placeholder';
        element.style.height = Math.max(180, box.height) + 'px';
        element.setAttribute('role', 'status');
        const title = mainDocument.createElement('p');
        title.textContent = state.mode === 'document' ? '画中画播放中…' : '页内悬浮窗播放中…';
        const button = mainDocument.createElement('button'); button.type = 'button';
        button.textContent = state.mode === 'document' ? '退出画中画' : '返回播放器';
        button.addEventListener('click', () => close(state));
        element.append(title, button); state.container.before(element); state.placeholder = element;
    }
    function makeHost(state, ownerDocument) {
        const host = ownerDocument.createElement('section');
        host.className = 'xplayer-pip-host' + (state.mode === 'floating' ? ' xplayer-pip-floating' : '');
        host.setAttribute('aria-label', state.mode === 'floating' ? '页内悬浮播放器' : '弹幕画中画播放器');
        let bar = null;
        if (state.mode === 'floating') {
            bar = ownerDocument.createElement('div');bar.className='xplayer-pip-drag-handle';bar.tabIndex=0;
            bar.setAttribute('role','button');bar.setAttribute('aria-label','拖动悬浮播放器，或使用方向键移动');
            host.append(bar);
        }
        const right=state.container.querySelector('.xplayer-icons-right');
        if(state.volume && right && state.volume.parentNode!==right){
            if(state.speedControl)state.speedControl.after(state.volume);else right.prepend(state.volume);
            state.volumeMoved=true;
        }
        if(state.volume&&state.volumePanel)state.volume.append(state.volumePanel);
        suppressTooltips(state);refreshVolumeIcon(state);
        state.host = host;
        return {host, bar};
    }
    function copyStyles(target) {
        const base = target.createElement('base'); base.href = mainDocument.baseURI; target.head.append(base);
        for (const source of mainDocument.head.querySelectorAll('style,link[rel="stylesheet"]')) {
            if (source.tagName === 'LINK') {
                let url; try { url = new URL(source.href, mainDocument.baseURI); } catch (_) { continue; }
                if (url.origin !== global.location.origin) continue;
                if (source.disabled) continue;
                // Read already-loaded same-origin CSS so the PiP does not flash unstyled
                // or depend on a second stylesheet request. Keep asset URLs absolute.
                try {
                    const css = Array.from(source.sheet.cssRules, rule => rule.cssText).join('\n');
                    const style = target.createElement('style');
                    style.textContent = css.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/g, (match, quote, value) => {
                        if (/^(?:data:|blob:|#)/i.test(value)) return match;
                        try {return 'url(' + JSON.stringify(new URL(value, url.href).href) + ')';} catch (_) {return match;}
                    });
                    style.media = source.media; target.head.append(style); continue;
                } catch (_) {}
                const link = target.createElement('link'); link.rel = 'stylesheet'; link.href = url.href;
                link.disabled = source.disabled; link.media = source.media; target.head.append(link);
            } else target.head.append(source.cloneNode(true));
        }
        target.documentElement.className = 'xplayer-pip-document';
        target.body.className = mainDocument.body.className + ' xplayer-pip-document-body';
        target.title = 'Xplayer · 弹幕画中画';
    }
    function bridgeEvents(state, pipWindow) {
        const ownerDocument = pipWindow.document;
        // Inline handlers from the original template still resolve their public helpers.
        for (const key of ['XGGM', 'config', 'up', 'layer', 'hzh', 'barrage_start', 'barrage_stop', 'getRootUrl']) {
            if (global[key] !== undefined) pipWindow[key] = global[key];
        }
        const forwardPointer = event => {
            if (event.type.startsWith('touch')) {
                const copy = new global.Event(event.type, {bubbles: false, cancelable: true});
                Object.defineProperties(copy, {touches: {value: event.touches}, changedTouches: {value: event.changedTouches}});
                mainDocument.dispatchEvent(copy); return;
            }
            mainDocument.dispatchEvent(new global.MouseEvent(event.type, {
                bubbles: false, cancelable: true, clientX: event.clientX - global.scrollX,
                clientY: event.clientY - global.scrollY, buttons: event.buttons, button: event.button
            }));
        };
        ['mousemove', 'mouseup', 'touchmove', 'touchend', 'touchcancel'].forEach(type => listen(state, ownerDocument, type, forwardPointer));
        listen(state, ownerDocument, 'keydown', event => {
            if (editable(event.target) || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
            if (event.code === 'Escape') { event.preventDefault(); restore(state); return; }
            if (event.target?.closest?.('button,a') && ['Space', 'Enter'].includes(event.code)) return;
            state.player.focus = true;
            const copy = new global.KeyboardEvent('keydown', {
                bubbles: false, cancelable: true, key: event.key, code: event.code,
                keyCode: event.keyCode, which: event.which, shiftKey: event.shiftKey, repeat: event.repeat
            });
            mainDocument.dispatchEvent(copy);
            if (copy.defaultPrevented) event.preventDefault();
        });
        listen(state, ownerDocument, 'pointerdown', () => {state.player.focus = true;}, true);
        listen(state, ownerDocument, 'contextmenu', () => {
            pipWindow.requestAnimationFrame(() => {
                const menu = state.container.querySelector('.xplayer-menu-show'); if (!menu) return;
                const box = menu.getBoundingClientRect(), container = state.container.getBoundingClientRect();
                menu.style.left = clamp(box.left - container.left, 0, Math.max(0, container.width - box.width)) + 'px';
                menu.style.top = clamp(box.top - container.top, 0, Math.max(0, container.height - box.height)) + 'px';
            });
        });
        listen(state, pipWindow, 'resize', () => sizeChanged(state));
        listen(state, pipWindow, 'pagehide', () => restore(state, {fromPageHide: true}), {once: true});
    }
    async function openDocument(state) {
        const pipWindow = await global.documentPictureInPicture.requestWindow({width: 640, height: 360});
        if (state.destroyed) {pipWindow.close(); return;}
        try {
            state.mode = 'document'; state.pipWindow = pipWindow; active = state;
            copyStyles(pipWindow.document); placeholder(state);
            const {host} = makeHost(state, pipWindow.document);
            state.container.classList.add('xplayer-pip-container');
            pipWindow.document.body.append(host); movePlayer(state, () => host.append(state.container));
            bridgeEvents(state, pipWindow); installDanmakuClock(state); switchClock(state);
            sizeChanged(state); announce(state);
        } catch (error) { restore(state); if (!pipWindow.closed) pipWindow.close(); throw error; }
    }
    function openFloating(state, reason) {
        state.mode = 'floating'; active = state; placeholder(state);
        const {host, bar} = makeHost(state, mainDocument);
        state.container.classList.add('xplayer-pip-container'); mainDocument.body.append(host); movePlayer(state, () => host.append(state.container));
        let drag = null;
        listen(state, bar, 'pointerdown', event => {
            if (event.button !== 0 || event.target.closest('button')) return;
            const box = host.getBoundingClientRect(); drag = {x:event.clientX, y:event.clientY, left:box.left, top:box.top};
            bar.setPointerCapture?.(event.pointerId); event.preventDefault();
        });
        listen(state, bar, 'pointermove', event => {
            if (!drag) return;
            host.style.left = clamp(drag.left + event.clientX - drag.x, 8, Math.max(8, global.innerWidth - host.offsetWidth - 8)) + 'px';
            host.style.top = clamp(drag.top + event.clientY - drag.y, 8, Math.max(8, global.innerHeight - host.offsetHeight - 8)) + 'px';
            host.style.right = host.style.bottom = 'auto';
        });
        const endDrag = () => {drag = null;};
        listen(state, bar, 'pointerup', endDrag); listen(state, bar, 'pointercancel', endDrag);
        listen(state, bar, 'keydown', event => {
            const shifts={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]};
            const shift=shifts[event.key];if(!shift)return;event.preventDefault();event.stopPropagation();
            const box=host.getBoundingClientRect();
            host.style.left=clamp(box.left+shift[0],8,Math.max(8,global.innerWidth-host.offsetWidth-8))+'px';
            host.style.top=clamp(box.top+shift[1],8,Math.max(8,global.innerHeight-host.offsetHeight-8))+'px';
            host.style.right=host.style.bottom='auto';
        });
        const resize = new global.ResizeObserver(() => sizeChanged(state)); resize.observe(host);
        state.sessionCleanup.push(() => resize.disconnect());
        listen(state, global, 'resize', () => {
            const box = host.getBoundingClientRect();
            host.style.left = clamp(box.left, 8, Math.max(8, global.innerWidth - host.offsetWidth - 8)) + 'px';
            host.style.top = clamp(box.top, 8, Math.max(8, global.innerHeight - host.offsetHeight - 8)) + 'px';
            host.style.right = host.style.bottom = 'auto';
        });
        sizeChanged(state); announce(state);
        notice(state, reason || '当前浏览器不支持弹幕画中画，已打开页内悬浮窗');
    }
    async function toggle(player) {
        const state = stateFor(player);
        if (state.pending || state.destroyed) return state.mode;
        if (state.mode !== 'inline') {await close(state); return state.mode;}
        state.pending = true;
        const wasPlaying = !state.video.paused;
        try {
            if (active && active !== state) await close(active);
            if (mainDocument.pictureInPictureElement && mainDocument.exitPictureInPicture) await mainDocument.exitPictureInPicture();
            if (mainDocument.fullscreenElement && mainDocument.exitFullscreen) await mainDocument.exitFullscreen();
            if (player.fullScreen?.isFullScreen('web')) player.fullScreen.cancel('web');
            if (nativePreferred(player)) {
                if (!state.video.requestPictureInPicture || mainDocument.pictureInPictureEnabled === false) {
                    notice(state, '当前浏览器不支持原生画中画，请关闭“原生画中画”选项后重试'); return state.mode;
                }
                await state.video.requestPictureInPicture(); state.mode = 'native'; active = state; announce(state);
            } else if (global.documentPictureInPicture?.requestWindow) {
                try { await openDocument(state); }
                catch (_) { if (!state.destroyed) openFloating(state, '浏览器未允许独立画中画，已改用页内悬浮窗'); }
            } else openFloating(state);
            if (wasPlaying && state.video.paused) state.video.play().catch(() => {});
        } catch (_) {notice(state, '画中画未能打开，请在视频加载后点击重试');}
        finally {state.pending = false;}
        return state.mode;
    }
    function stateFor(player) {
        if (states.has(player)) return states.get(player);
        if (!player?.container || !player.video) throw new Error('播放器尚未就绪');
        const state = {player, container:player.container, video:player.video, mode:'inline', pending:false,
            destroyed:false, cleanup:[], sessionCleanup:[], pipWindow:null, host:null, placeholder:null};
        state.button = player.container.querySelector('.xplayer-full-in-icon');
        state.originalTooltip = state.button?.getAttribute('data-balloon') || '画中画';
        state.volume=state.container.querySelector('.xplayer-volume');
        state.volumeIcon=player.template.volumeIcon;
        state.volumeParent=state.volume?.parentNode;state.volumeNext=state.volume?.nextSibling;
        states.set(player, state);
        const timeDisplay=state.container.querySelector('.xplayer-time');
        if(timeDisplay){
            const saved={role:timeDisplay.getAttribute('role'),label:timeDisplay.getAttribute('aria-label')};
            const describeTime=()=>timeDisplay.setAttribute('aria-label',timeDisplay.textContent.replace(/\s+/g,' ').trim());
            timeDisplay.setAttribute('role','timer');describeTime();
            const observer=new global.MutationObserver(describeTime);observer.observe(timeDisplay,{childList:true,characterData:true,subtree:true});
            state.cleanup.push(()=>{observer.disconnect();for(const [attribute,value] of [['role',saved.role],['aria-label',saved.label]]){if(value===null)timeDisplay.removeAttribute(attribute);else timeDisplay.setAttribute(attribute,value);}});
        }
        const icons = state.container.querySelector('.xplayer-icons-right');
        if (icons) {
            const speed=mainDocument.createElement('div');speed.className='xplayer-pip-speed xplayer-pip-only';
            const speedButton=mainDocument.createElement('button');speedButton.type='button';speedButton.className='xplayer-pip-speed-button';speedButton.textContent='倍速';
            speedButton.setAttribute('aria-haspopup','menu');speedButton.setAttribute('aria-expanded','false');
            const menu=mainDocument.createElement('div');menu.className='xplayer-pip-speed-menu';menu.setAttribute('role','menu');menu.setAttribute('aria-label','播放速度');menu.hidden=true;
            const options=[];
            for(const [value,label] of [[2,'2x'],[1.5,'1.5x'],[1.25,'1.25x'],[1,'1.0x'],[.75,'0.75x'],[.5,'0.5x']]) {
                const option=mainDocument.createElement('button');option.type='button';option.textContent=label;option.dataset.speed=String(value);option.tabIndex=-1;option.setAttribute('role','menuitemradio');
                listen(state,option,'click',event=>{event.preventDefault();event.stopPropagation();player.speed(value);state.closeSpeed();speedButton.focus();},undefined,true);
                menu.append(option);options.push(option);
            }
            const syncSpeed=()=>{
                speedButton.setAttribute('aria-label','播放速度，当前 '+state.video.playbackRate+' 倍');
                options.forEach(option=>option.setAttribute('aria-checked',String(Number(option.dataset.speed)===state.video.playbackRate)));
            };
            state.closeSpeed=()=>{
                if(menu.hidden)return;menu.hidden=true;speedButton.setAttribute('aria-expanded','false');
                if(!state.destroyed&&player.controller){player.controller.disableAutoHide=!!state.speedAutoHideBefore;player.controller.setAutoHide?.();}
            };
            function showSpeed(focus=false){
                state.closeVolume?.();
                if(menu.hidden){state.speedAutoHideBefore=player.controller.disableAutoHide;player.controller.disableAutoHide=true;}
                menu.hidden=false;speedButton.setAttribute('aria-expanded','true');sizeChanged(state);
                if(focus)(options.find(option=>option.getAttribute('aria-checked')==='true')||options[0]).focus();
            }
            listen(state,speedButton,'click',event=>{event.preventDefault();event.stopPropagation();menu.hidden?showSpeed():state.closeSpeed();},undefined,true);
            listen(state,speedButton,'keydown',event=>{if(['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();event.stopPropagation();showSpeed(true);}},undefined,true);
            listen(state,menu,'keydown',event=>{
                if(event.key==='Escape'){event.preventDefault();event.stopPropagation();state.closeSpeed();speedButton.focus();return;}
                if(!['ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();event.stopPropagation();
                const current=options.indexOf(menu.ownerDocument.activeElement);
                const index=event.key==='Home'?0:event.key==='End'?options.length-1:(current+(event.key==='ArrowDown'?1:-1)+options.length)%options.length;
                options[index].focus();
            },undefined,true);
            listen(state,state.container,'pointerdown',event=>{if(!speed.contains(event.target))state.closeSpeed();},true,true);
            listen(state,speed,'focusout',event=>{if(event.relatedTarget&&!speed.contains(event.relatedTarget))state.closeSpeed();},undefined,true);
            listen(state,state.video,'ratechange',syncSpeed,undefined,true);syncSpeed();
            speed.append(speedButton,menu);icons.prepend(speed);state.speedControl=speed;state.speedMenu=menu;
            state.cleanup.push(()=>speed.remove());
            if (player.danmaku) {
                const toggle = mainDocument.createElement('button');
                toggle.type='button';toggle.className='xplayer-icon xplayer-pip-danmaku-toggle xplayer-pip-only';
                toggle.setAttribute('role','switch');toggle.setAttribute('aria-label','弹幕');
                toggle.innerHTML = global.xplayer.danmakuSwitchIcon;
                const sync = () => {
                    const enabled=!!player.danmaku.showing;
                    toggle.setAttribute('aria-checked',String(enabled));
                };
                listen(state,toggle,'click',event=>{
                    event.preventDefault();event.stopPropagation();
                    // Reuse the original setting handler: it persists the preference and
                    // updates both the engine and its existing checkbox in one place.
                    if(player.template.showDanmaku)player.template.showDanmaku.click();
                    else {
                        const enabled=!player.danmaku.showing;player.danmaku[enabled?'show':'hide']();
                        if(player.template.showDanmakuToggle)player.template.showDanmakuToggle.checked=enabled;
                        player.user?.set('danmaku',enabled?1:0);
                    }
                    sync();
                },undefined,true);
                player.on?.('danmaku_show',sync);player.on?.('danmaku_hide',sync);sync();
                const time=state.container.querySelector('.xplayer-icons-left .xplayer-time');
                if(time)time.after(toggle);else state.container.querySelector('.xplayer-icons-left')?.append(toggle);
                state.cleanup.push(()=>toggle.remove());
            }
        }
        installVolumeControl(state);
        listen(state,state.video,'volumechange',()=>global.queueMicrotask(()=>refreshVolumeIcon(state)),undefined,true);
        if (state.button) listen(state, state.button, 'click', event => {
            event.preventDefault(); event.stopImmediatePropagation(); toggle(player);
        }, true, true);
        // Existing layer dialogs and episode/list callbacks belong to the opener document.
        // Restore synchronously before the original click handler creates its panel there.
        listen(state, state.container, 'click', event => {
            if (['document','floating'].includes(state.mode) && event.target.closest?.('.xplayer-danmaku-item,.report,.xplayer-menu-item,.xplayer-list-icon,.xplayer-episode-button')) {
                restore(state); try {global.focus();} catch (_) {}
            }
        }, true, true);
        listen(state, state.video, 'enterpictureinpicture', () => {state.mode='native';active=state;announce(state);}, undefined, true);
        listen(state, state.video, 'leavepictureinpicture', () => {if(state.mode==='native'){state.mode='inline';if(active===state)active=null;announce(state);}}, undefined, true);
        listen(state, state.container, 'xplayer:playback-settings-change', event => {
            if (event.detail?.changedKeys?.includes('nativePictureInPicture')) {
                nativeOverride = null;
                if (state.mode !== 'inline') close(state);
            }
        }, undefined, true);
        listen(state, mainDocument, 'keydown', event => {
            if (state.mode === 'floating' && event.code === 'Escape' && !editable(event.target)) {
                event.preventDefault(); restore(state);
            }
        }, true, true);
        listen(state, global, 'pagehide', () => restore(state), undefined, true);
        const originalRequest = player.fullScreen?.request;
        if (originalRequest) {
            const request = function () {restore(state);return originalRequest.apply(this, arguments);};
            player.fullScreen.request = request;
            state.cleanup.push(() => {if(player.fullScreen?.request === request)player.fullScreen.request=originalRequest;});
        }
        function destroy() {
            if (state.destroyed) return;
            state.destroyed = true; restore(state);
            state.moveCleanup?.();
            state.cleanup.splice(0).forEach(cleanup => cleanup());
            if (state.clock) {
                if(state.clock.id)state.clock.owner.cancelAnimationFrame(state.clock.id);
                state.clock.danmaku.frame=state.clock.original;
            }
            if (active === state) active = null;
        }
        player.on?.('destroy', destroy);
        state.api = {toggle:()=>toggle(player), close:()=>close(state), destroy,
            get mode(){return state.mode;}, get window(){return state.pipWindow;}};
        player.pipFeatures = state.api;
        return state;
    }
    global.XplayerPip = {
        attach: player => stateFor(player).api,
        toggle,
        close: player => close(stateFor(player)),
        setNative(value) {
            nativeOverride = !!value;
            try {
                const stored = JSON.parse(global.localStorage.getItem(storageKey)) || {};
                stored.nativePictureInPicture = !!value;
                global.localStorage.setItem(storageKey, JSON.stringify(stored));
            } catch (_) {}
            if (active) close(active);
        }
    };
})(window);

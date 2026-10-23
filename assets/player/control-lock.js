/* Lock player interactions without changing the current playback state. */
(function (global) {
    'use strict';
    const instances = new WeakMap();
    const inputEvents = ['click','dblclick','auxclick','contextmenu','pointerdown','pointermove','pointerup','pointercancel','mousedown','mousemove','mouseup','touchstart','touchmove','touchend','touchcancel','wheel','keydown','keypress','keyup','dragstart','drop','beforeinput','input','change','focusin','focusout'];
    const capture = {capture: true, passive: false};
    const hideDelay = 3000;
    const shacklePaths = {locked:'M7.5 10V7a4.5 4.5 0 0 1 9 0v3', unlocked:'M7.5 10V7a4.5 4.5 0 0 1 9 0'};
    const browserShortcut = event => event.ctrlKey || event.metaKey || event.altKey || /^F\d{1,2}$/.test(event.key || '');
    function attach(player) {
        if (instances.has(player)) return instances.get(player);
        const container = player.container, document = container.ownerDocument;
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'xplayer-control-lock';
        button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="xplayer-control-lock-shackle"/><rect x="5" y="10" width="14" height="11" rx="2.5"/><path d="M12 14v3"/></svg><span class="xplayer-control-lock-text"></span>';
        const label = button.querySelector('.xplayer-control-lock-text');
        const shackle = button.querySelector('.xplayer-control-lock-shackle');
        const shield = document.createElement('div');
        shield.className = 'xplayer-control-lock-shield'; shield.hidden = true; shield.setAttribute('aria-hidden','true');
        container.append(shield, button);
        let locked = false, destroyed = false, ownerWindow = null, hideTimer = null, timerWindow = null;
        let inputMode = '', lastTouchTime = 0;
        const inertChildren = new Map();
        const contains = (parent, target) => !!target?.nodeType && parent.contains(target);
        function paintInput() {
            button.classList.toggle('xplayer-control-lock-mouse', inputMode === 'mouse');
            button.classList.toggle('xplayer-control-lock-keyboard-focus', inputMode === 'keyboard' && container.ownerDocument.activeElement === button);
        }
        function trackInput(event) {
            if (event.type === 'keydown' && !browserShortcut(event)) inputMode = 'keyboard';
            else if (event.type === 'pointerdown' || event.type === 'pointermove' && event.pointerType !== 'touch') {
                inputMode = event.pointerType === 'mouse' ? 'mouse' : 'touch';
            } else if (event.type === 'touchstart') {
                lastTouchTime = Date.now(); inputMode = 'touch';
            } else if ((event.type === 'mousedown' || event.type === 'mousemove') && !ownerWindow.PointerEvent &&
                !event.sourceCapabilities?.firesTouchEvents && Date.now() - lastTouchTime > 800) {
                // Older touch browsers synthesize mouse events after a tap.
                inputMode = 'mouse';
            }
            paintInput();
            if (event.type === 'focusout' && (event.target === button || contains(button, event.target))) {
                button.classList.remove('xplayer-control-lock-keyboard-focus');
            }
        }
        function clearHideTimer() {
            if (hideTimer !== null) timerWindow.clearTimeout(hideTimer);
            hideTimer = null; timerWindow = null;
        }
        function reveal() {
            if (destroyed) return;
            button.classList.add('xplayer-control-lock-visible');
            clearHideTimer();
            timerWindow = ownerWindow || global;
            hideTimer = timerWindow.setTimeout(() => {
                hideTimer = null; timerWindow = null;
                if (!destroyed) button.classList.remove('xplayer-control-lock-visible');
            }, hideDelay);
        }
        function block(event, prevent = true) {
            if (prevent && event.cancelable) event.preventDefault();
            event.stopImmediatePropagation();
        }
        function focusButton() {player.focus = true;try {button.focus({preventScroll:true});} catch (_) {button.focus();} }
        function keyboardBelongsHere(event) {
            const owner = container.ownerDocument, target = event.target;
            if (contains(container, target)) return true;
            // A focused form or another player outside this player remains usable.
            if (target && target !== owner && target !== owner.defaultView && target !== owner.body && target !== owner.documentElement) return false;
            return contains(container, owner.activeElement) || !!player.focus;
        }
        function guard(event) {
            if (destroyed) return;
            trackInput(event);
            if (event.type === 'focusout') return;
            const inside = contains(container, event.target);
            // Reveal before stopping input: a tap on the locked picture only exposes the unlock button.
            if (inside && (event.type === 'mousemove' || event.type === 'pointermove' && event.pointerType !== 'touch' ||
                ['pointerdown','touchstart','click','focusin'].includes(event.type))) reveal();
            if (locked && event.type === 'focusin' && !contains(container, event.target)) {
                player.focus = false;
                return;
            }
            const keyboard = event.type.startsWith('key');
            if (keyboard && browserShortcut(event)) return;
            const atButton = button === event.target || contains(button, event.target);
            if (atButton) {
                if (event.type === 'click') {block(event);setLocked(!locked);return;}
                if (keyboard && (event.key === ' ' || event.key === 'Enter' || event.code === 'Space')) {
                    reveal();
                    block(event);
                    if (event.type === 'keydown' && !event.repeat) setLocked(!locked);
                    return;
                }
                // Keep native focus and touch-to-click activation, but never reach video handlers.
                if (!keyboard || event.key === 'Tab') {block(event, ['contextmenu','dblclick','auxclick'].includes(event.type));return;}
            }
            if (!locked || !(keyboard ? keyboardBelongsHere(event) : contains(container, event.target))) return;
            if (keyboard && event.key === 'Tab') return;
            block(event);
            if (event.type === 'focusin') focusButton();
        }
        function bindOwner() {
            const next = container.ownerDocument.defaultView || global;
            if (next === ownerWindow) return;
            clearHideTimer();
            if (ownerWindow) inputEvents.forEach(type => ownerWindow.removeEventListener(type, guard, true));
            ownerWindow = next;
            inputMode = ''; lastTouchTime = 0; paintInput();
            // Window capture runs before the existing document and container listeners.
            inputEvents.forEach(type => ownerWindow.addEventListener(type, guard, capture));
        }
        function makeChildrenInert() {
            if (!locked) return;
            for (const child of container.children) {
                if (child === button || child === shield || inertChildren.has(child)) continue;
                inertChildren.set(child, child.getAttribute('inert'));
                child.setAttribute('inert','');
            }
        }
        function restoreChildren() {
            for (const [child, value] of inertChildren) {
                if (value === null) child.removeAttribute('inert');
                else child.setAttribute('inert', value);
            }
            inertChildren.clear();
        }
        function paint() {
            container.classList.toggle('xplayer-controls-locked', locked);
            shield.hidden = !locked;
            button.setAttribute('aria-pressed', String(locked));
            shackle.setAttribute('d', shacklePaths[locked ? 'locked' : 'unlocked']);
            const text = locked ? '解锁播放器' : '锁定播放器';
            button.setAttribute('aria-label', text); label.textContent = text;
        }
        function setLocked(next) {
            if (destroyed || locked === !!next) return locked;
            locked = !!next; bindOwner();
            if (locked) {
                player.controller?.cancelInteraction?.();
                player.playbackSettings?.close?.();
                player.contextmenu?.hide?.();
                player.controller?.hide?.();
            }
            container.dispatchEvent(new global.CustomEvent('xplayer:control-lock-change', {bubbles:true, detail:{player, locked}}));
            paint();
            if (locked) makeChildrenInert();
            else {restoreChildren();player.controller?.setAutoHide?.();}
            player.focus = true;
            if (inputMode === 'keyboard') focusButton();
            paintInput();
            reveal();
            return locked;
        }
        function syncOwner() {if (!destroyed) {bindOwner();makeChildrenInert();reveal();}}
        const observer = global.MutationObserver ? new global.MutationObserver(makeChildrenInert) : null;
        observer?.observe(container, {childList:true});
        container.addEventListener('xplayer:pip-change', syncOwner);
        player.on?.('resize', syncOwner);
        function destroy() {
            if (destroyed) return;
            destroyed = true; locked = false;
            clearHideTimer();
            if (ownerWindow) inputEvents.forEach(type => ownerWindow.removeEventListener(type, guard, true));
            observer?.disconnect(); restoreChildren();
            container.removeEventListener('xplayer:pip-change', syncOwner);
            for (const [event, callback] of [['resize',syncOwner],['destroy',destroy]]) {
                if (player.events?.events?.[event]) player.events.events[event] = player.events.events[event].filter(item => item !== callback);
            }
            container.classList.remove('xplayer-controls-locked');
            button.remove(); shield.remove(); instances.delete(player);
            if (player.controlLock === api) delete player.controlLock;
        }
        const api = {setLocked, lock:()=>setLocked(true), unlock:()=>setLocked(false), toggle:()=>setLocked(!locked), destroy, get locked(){return locked;}};
        instances.set(player, api); player.controlLock = api;
        player.on?.('destroy', destroy); bindOwner(); paint(); reveal();
        return api;
    }
    global.XplayerControlLock = {attach};
})(window);

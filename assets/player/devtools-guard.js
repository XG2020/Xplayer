/* Optional shortcut/geometry guard. Browsers expose no reliable DevTools-open API. */
(function (global) {
    'use strict';
    let active = null;
    function start(enabled, mode = 'shortcut') {
        if (active) return active;
        if (enabled !== true) return {blocked: false, destroy() {}};
        let disposed = false, timer = null, suspectedAt = null;
        const enhanced = mode === 'enhanced';
        const initialPixelRatio = Number(global.devicePixelRatio) || 1;
        const state = {blocked: false, destroy};
        active = state;
        function leave() {
            if (state.blocked || disposed) return;
            state.blocked = true;
            destroy();
            // Stop sound and requests even when a normal tab refuses window.close().
            try { global.XGGM?.dp?.destroy(); } catch (_) {}
            for (const media of document.querySelectorAll('video,audio')) {
                try {
                    media.pause();
                    media.removeAttribute('src');
                    media.querySelectorAll('source').forEach(source => source.removeAttribute('src'));
                    media.load();
                } catch (_) {}
            }
            try { global.documentPictureInPicture?.window?.close(); } catch (_) {}
            document.documentElement.style.visibility = 'hidden';
            try { global.close(); } catch (_) {}
            // Replace this document only; never close or navigate an embedding website.
            try { global.location.replace('about:blank'); } catch (_) {}
        }
        function onKey(event) {
            const key = String(event.key || '').toLowerCase();
            const inspectKey = ['i', 'j', 'c'].includes(key);
            if (key !== 'f12' && !(inspectKey && (
                (event.ctrlKey && event.shiftKey && !event.altKey) ||
                (event.metaKey && event.altKey && !event.ctrlKey)))) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            leave();
        }
        function dockedToolsPossible() {
            // Enhanced mode is explicitly heuristic. Sidebar geometry can be identical.
            // Exclude frames, touch keyboards, fullscreen, and zoom/display-scale changes.
            if (global.top !== global || document.fullscreenElement ||
                global.matchMedia?.('(pointer: coarse)').matches ||
                (Number(global.devicePixelRatio) || 1) !== initialPixelRatio) return false;
            const outerWidth = Number(global.outerWidth), outerHeight = Number(global.outerHeight);
            const innerWidth = Number(global.innerWidth), innerHeight = Number(global.innerHeight);
            if (![outerWidth, outerHeight, innerWidth, innerHeight].every(value => Number.isFinite(value) && value > 0)) return false;
            const widthGap = outerWidth - innerWidth, heightGap = outerHeight - innerHeight;
            return (widthGap > 240 && heightGap >= 0 && heightGap < 200) ||
                (heightGap > 240 && widthGap >= 0 && widthGap < 160);
        }
        function inspect() {
            if (disposed || state.blocked) return;
            if (document.visibilityState === 'hidden' || !dockedToolsPossible()) {
                suspectedAt = null;
                return;
            }
            const now = global.performance.now();
            if (suspectedAt === null) suspectedAt = now;
            else if (now - suspectedAt >= 800) leave();
        }
        function suspend() {
            global.clearInterval(timer);
            timer = null;
            suspectedAt = null;
        }
        function resume() {
            if (disposed || state.blocked) return;
            if (timer === null) timer = global.setInterval(inspect, 1000);
            inspect();
        }
        function destroy() {
            if (disposed) return;
            disposed = true;
            suspend();
            global.removeEventListener('keydown', onKey, true);
            global.removeEventListener('resize', inspect);
            global.removeEventListener('pagehide', suspend);
            global.removeEventListener('pageshow', resume);
            document.removeEventListener('visibilitychange', inspect);
            if (!state.blocked) active = null;
        }
        global.addEventListener('keydown', onKey, true);
        if (enhanced) {
            global.addEventListener('resize', inspect);
            global.addEventListener('pagehide', suspend);
            global.addEventListener('pageshow', resume);
            document.addEventListener('visibilitychange', inspect);
            resume();
        }
        return state;
    }
    global.XplayerDevtoolsGuard = {start};
})(window);

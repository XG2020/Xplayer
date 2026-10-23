/* Best-effort shortcut/worker/geometry guard; browsers expose no DevTools-open API. */
(function (global) {
    'use strict';
    let active = null;
    // Only the probe worker may pause. The page and control worker never execute debugger.
    const workerSource = `
        self.onmessage = function(event) {
            var data = event.data || {};
            if (data.type === 'control') {
                self.postMessage({type:'control', id:data.id, sequence:data.sequence});
            } else if (data.type === 'probe') {
                var started = performance.now();
                debugger;
                self.postMessage({type:'probe', id:data.id, elapsed:performance.now()-started});
            }
        };
        self.postMessage({type:'ready'});
    `;
    function start(enabled, mode = 'shortcut') {
        if (active) return active;
        if (enabled !== true) return {blocked: false, destroy() {}};
        let disposed = false, timer = null, suspectedAt = null;
        const enhanced = mode === 'enhanced';
        const initialPixelRatio = Number(global.devicePixelRatio) || 1;
        const state = {blocked: false, destroy};
        let workers = null, workerUrl = null, readyTimeout = null, nextProbeTimer = null;
        let watchdog = null, pending = null, probeId = 0, workerUnavailable = false;
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
        function clearWorkerUrl() {
            if (workerUrl !== null) global.URL.revokeObjectURL(workerUrl);
            workerUrl = null;
        }
        function stopWorkers() {
            global.clearTimeout(readyTimeout); readyTimeout = null;
            global.clearTimeout(nextProbeTimer); nextProbeTimer = null;
            global.clearInterval(watchdog); watchdog = null;
            pending = null;
            if (workers) {
                for (const worker of [workers.probe, workers.control]) {
                    if (!worker) continue;
                    worker.onmessage = worker.onerror = worker.onmessageerror = null;
                    worker.terminate();
                }
            }
            workers = null;
            clearWorkerUrl();
        }
        function abandonWorkers() {
            // A blocked/unsupported worker is not evidence that DevTools is open.
            workerUnavailable = true;
            stopWorkers();
        }
        function workerCanRun() {
            return !disposed && !state.blocked && document.visibilityState !== 'hidden';
        }
        function scheduleProbe() {
            global.clearTimeout(nextProbeTimer);
            if (!workers || !workerCanRun()) return;
            nextProbeTimer = global.setTimeout(beginProbe, 4000);
        }
        function pingControl() {
            if (!pending || !workers) return;
            if (pending.sequence !== pending.ackSequence) pending.healthyControls = 0;
            pending.sequence++;
            pending.controlSentAt = global.performance.now();
            workers.control.postMessage({type:'control', id:pending.id, sequence:pending.sequence});
        }
        function finishProbe() {
            global.clearInterval(watchdog); watchdog = null;
            pending = null;
            scheduleProbe();
        }
        function inspectWorker() {
            if (!pending || !workers || !workerCanRun()) return;
            const now = global.performance.now();
            const gap = now - pending.lastTick;
            pending.lastTick = now;
            if (gap > 1500 || gap < 0) {
                // Main-thread suspension or a sleeping machine invalidates this sample.
                stopWorkers();
                if (workerCanRun()) nextProbeTimer = global.setTimeout(startWorkers, 4000);
                return;
            }
            // Require the page AND a second worker to be responsive for multiple rounds.
            if (now - pending.started >= 3000 && pending.healthyControls >= 3 &&
                now - pending.controlAckAt < 1000) {leave();return;}
            if (now - pending.started >= 8000) {
                // No conclusion: release the pair instead of piling up threads or blocking playback.
                abandonWorkers();
                return;
            }
            try {pingControl();} catch (_) {abandonWorkers();}
        }
        function beginProbe() {
            nextProbeTimer = null;
            if (!workers || !workerCanRun() || pending) return;
            const now = global.performance.now();
            pending = {id:++probeId, started:now, lastTick:now, sequence:0,
                ackSequence:0, healthyControls:0, controlSentAt:0, controlAckAt:0};
            try {
                pingControl();
                workers.probe.postMessage({type:'probe', id:pending.id});
                watchdog = global.setInterval(inspectWorker, 500);
            } catch (_) {abandonWorkers();}
        }
        function startWorkers() {
            nextProbeTimer = null;
            if (workers || workerUnavailable || !workerCanRun() || !global.Worker ||
                !global.Blob || !global.URL?.createObjectURL) return;
            try {
                workerUrl = global.URL.createObjectURL(new global.Blob([workerSource], {type:'text/javascript'}));
                const pair = workers = {probe:null, control:null, ready:new Set()};
                pair.probe = new global.Worker(workerUrl);
                pair.control = new global.Worker(workerUrl);
                for (const kind of ['probe','control']) {
                    const worker = pair[kind];
                    worker.onerror = worker.onmessageerror = () => {if (workers === pair) abandonWorkers();};
                    worker.onmessage = event => {
                        if (workers !== pair || !workerCanRun()) return;
                        const data = event.data || {};
                        if (data.type === 'ready') {
                            pair.ready.add(kind);
                            if (pair.ready.size === 2 && readyTimeout !== null) {
                                global.clearTimeout(readyTimeout); readyTimeout = null;
                                clearWorkerUrl();
                                beginProbe();
                            }
                            return;
                        }
                        if (!pending || data.id !== pending.id) return;
                        const now = global.performance.now();
                        if (kind === 'control' && data.type === 'control' && data.sequence === pending.sequence) {
                            if (now - pending.controlSentAt <= 1000) {
                                pending.ackSequence = data.sequence;
                                pending.healthyControls++;
                                pending.controlAckAt = now;
                            } else pending.healthyControls = 0;
                        } else if (kind === 'probe' && data.type === 'probe') {
                            if (Number(data.elapsed) >= 1500 && pending.healthyControls >= 3 &&
                                now - pending.controlAckAt < 1000 && now - pending.lastTick < 1500) leave();
                            else finishProbe();
                        }
                    };
                }
                // Do not infer debugging from worker startup failure, CSP, or slow startup.
                readyTimeout = global.setTimeout(abandonWorkers, 8000);
            } catch (_) {abandonWorkers();}
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
            stopWorkers();
        }
        function resume() {
            if (!workerCanRun()) return;
            startWorkers();
            if (enhanced) {
                if (timer === null) timer = global.setInterval(inspect, 1000);
                inspect();
            }
        }
        function visibilityChanged() {
            if (document.visibilityState === 'hidden') suspend();
            else resume();
        }
        function destroy() {
            if (disposed) return;
            disposed = true;
            suspend();
            global.removeEventListener('keydown', onKey, true);
            global.removeEventListener('resize', inspect);
            global.removeEventListener('pagehide', suspend);
            global.removeEventListener('pageshow', resume);
            document.removeEventListener('visibilitychange', visibilityChanged);
            if (!state.blocked) active = null;
        }
        global.addEventListener('keydown', onKey, true);
        global.addEventListener('pagehide', suspend);
        global.addEventListener('pageshow', resume);
        document.addEventListener('visibilitychange', visibilityChanged);
        if (enhanced) {
            global.addEventListener('resize', inspect);
        }
        resume();
        return state;
    }
    global.XplayerDevtoolsGuard = {start};
})(window);

/* Offline behavior regressions for mobile seeking in source and shipped assets. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

class Surface {
    constructor() { this.listeners = []; }
    addEventListener(type, handler, options) {
        const capture = options === true || !!options?.capture;
        if (!this.listeners.some(item => item.type === type && item.handler === handler && item.capture === capture)) {
            this.listeners.push({type, handler, capture});
        }
    }
    removeEventListener(type, handler, options) {
        const capture = options === true || !!options?.capture;
        this.listeners = this.listeners.filter(item => item.type !== type || item.handler !== handler || item.capture !== capture);
    }
}

class Element extends Surface {
    constructor(tag, classes, parent, document) {
        super();
        this.tagName = tag.toUpperCase(); this.classes = new Set(classes.split(/\s+/).filter(Boolean));
        this.parentElement = parent; this.ownerDocument = document; this.nodeType = 1;
        this.attributes = {}; this.captures = new Set(); this.style = {touchAction: '', setProperty() {}, removeProperty() {}};
        this.classList = {contains: name => this.classes.has(name), add: name => this.classes.add(name), remove: name => this.classes.delete(name)};
    }
    matches(selector) {
        return selector.split(',').some(part => {
            part = part.trim();
            if (part.startsWith('.')) return part.slice(1).split('.').every(name => this.classes.has(name));
            if (part.startsWith('#')) return this.id === part.slice(1);
            if (part.startsWith('[')) {
                const match = part.match(/^\[([^=\]]+)(?:=["']?([^"'\]]+)["']?)?\]$/);
                return !!match && (match[1] in this.attributes) && (match[2] === undefined || this.attributes[match[1]] === match[2]);
            }
            return part.toUpperCase() === this.tagName;
        });
    }
    closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
    contains(node) { for (; node; node = node.parentElement) if (node === this) return true; return false; }
    querySelector(selector) { return this.children?.find(node => node.matches(selector)) || null; }
    getBoundingClientRect() { return {left: 0, top: 0, right: 400, bottom: 240, width: 400, height: 240}; }
    setPointerCapture(id) { this.captures.add(id); }
    hasPointerCapture(id) { return this.captures.has(id); }
    releasePointerCapture(id) { this.captures.delete(id); }
}

function dispatch(target, type, data = {}) {
    const event = {
        type, target, cancelable: true, defaultPrevented: false,
        preventDefault() { if (this.cancelable) this.defaultPrevented = true; },
        stopPropagation() { this.stopped = true; },
        stopImmediatePropagation() { this.stopped = true; this.immediate = true; },
        ...data
    };
    const route = [target];
    if (target instanceof Element) {
        for (let parent = target.parentElement; parent; parent = parent.parentElement) route.push(parent);
        route.push(target.ownerDocument, target.ownerDocument.defaultView);
    } else if (target.defaultView) route.push(target.defaultView);
    function visit(surface, capture) {
        event.currentTarget = surface;
        for (const item of surface.listeners.slice()) {
            if (item.type === type && item.capture === capture) {
                item.handler(event);
                if (event.immediate) break;
            }
        }
    }
    for (const surface of route.slice().reverse()) { visit(surface, true); if (event.stopped) return event; }
    for (const surface of route) { visit(surface, false); if (event.stopped) break; }
    return event;
}

function fixture(folder, pointerEvents = true, overrides = {}) {
    const window = new Surface(), document = new Surface(); document.defaultView = window;
    document.baseURI = 'https://player.example/'; document.documentElement = {style: {}};
    const container = new Element('div', 'xplayer xplayer-mobile', null, document);
    const wrap = new Element('div', 'xplayer-video-wrap', container, document);
    const video = new Element('video', 'xplayer-video', wrap, document);
    const mask = new Element('div', 'xplayer-controller-mask', container, document);
    const controls = new Element('div', 'xplayer-controller', container, document);
    const bar = new Element('div', 'xplayer-bar-wrap', controls, document);
    const button = new Element('button', 'xplayer-icon', wrap, document);
    const link = new Element('a', '', wrap, document);
    const input = new Element('input', '', wrap, document);
    container.children = [wrap, mask, controls];
    video.duration = 300; video.currentTime = 100; video.paused = true;
    Object.assign(video, overrides.video);
    const hooks = new Map(), seeks = [], notices = [];
    const player = {
        container, video, options: {live: false, ...overrides.options},
        template: {videoWrap: wrap, controllerMask: mask}, controller: {disableAutoHide: false},
        on(type, callback) { if (!hooks.has(type)) hooks.set(type, []); hooks.get(type).push(callback); },
        seek(time) { seeks.push(time); video.currentTime = time; }, notice(text) { notices.push(text); }
    };
    let clock = 1000;
    class Clock extends Date { static now() { return clock; } }
    Object.assign(window, {window, document, Date: Clock, console, setTimeout, clearTimeout});
    if (pointerEvents) window.PointerEvent = function PointerEvent() {};
    vm.runInNewContext(fs.readFileSync(path.join(root, folder, 'contextmenu.js'), 'utf8'), window);
    window.XplayerContextMenu.attach(player);
    const touch = (x, y = 100, id = 1) => ({clientX: x, clientY: y, identifier: id, target: video});
    function send(phase, x, y = 100, extra = {}, target = video) {
        if (pointerEvents) {
            return dispatch(target, 'pointer' + phase, {pointerId: 1, pointerType: 'touch', isPrimary: true, clientX: x, clientY: y, ...extra});
        }
        const types = {down: 'touchstart', move: 'touchmove', up: 'touchend', cancel: 'touchcancel'};
        const point = touch(x, y);
        return dispatch(target, types[phase], {touches: phase === 'up' || phase === 'cancel' ? [] : [point], changedTouches: [point], ...extra});
    }
    const allSurfaces = [window, document, container, wrap, video, mask, controls, bar, button, link, input];
    return {window, document, player, video, wrap, mask, controls, bar, button, link, input, container, seeks, notices, send, touch,
        tick(milliseconds) { clock += milliseconds; },
        click(target = video) { return dispatch(target, 'click', {sourceCapabilities: {firesTouchEvents: true}}); },
        listenerCount() { return allSurfaces.reduce((count, surface) => count + surface.listeners.length, 0); },
        destroy() { (hooks.get('destroy') || []).forEach(callback => callback()); }
    };
}

let passed = 0, failed = 0;
function test(name, run) {
    try { run(); passed++; console.log('PASS ' + name); }
    catch (error) { failed++; console.error('FAIL ' + name + ': ' + error.message); }
}

for (const folder of ['src/player', 'assets/player']) for (const pointerEvents of [true, false]) {
    const mode = folder + ' ' + (pointerEvents ? 'pointer' : 'touch');
    function check(name, run) {
        test(mode + ': ' + name, () => { const f = fixture(folder, pointerEvents); try { run(f); } finally { f.destroy(); } });
    }
    check('right swipe seeks only on release and uses the release position', f => {
        f.send('down', 100); f.send('move', 150); assert.equal(f.seeks.length, 0);
        f.send('up', 250); assert.deepEqual(f.seeks, [130]);
    });
    check('left swipe seeks backward', f => {
        f.send('down', 250); f.send('move', 100); f.send('up', 100); assert.deepEqual(f.seeks, [70]);
    });
    check('move event frequency does not affect seeking', f => {
        f.send('down', 100); f.send('move', 250); f.send('up', 250);
        f.video.currentTime = 100;
        f.send('down', 100); for (let x = 115; x <= 250; x += 5) f.send('move', x); f.send('up', 250);
        assert.deepEqual(f.seeks, [130, 130]);
    });
    check('backtracking updates the target instead of accumulating', f => {
        f.send('down', 100); f.send('move', 250); f.send('move', 150); f.send('up', 150); assert.deepEqual(f.seeks, [110]);
    });
    check('tap, tiny drift and vertical gestures do not seek', f => {
        f.send('down', 100); f.send('up', 100);
        f.send('down', 100); f.send('move', 108); f.send('up', 108);
        f.send('down', 100); f.send('move', 110, 150); f.send('move', 250, 155); f.send('up', 250, 155);
        assert.deepEqual(f.seeks, []); assert.equal(f.click().defaultPrevented, false);
    });
    check('controller mask is a valid swipe surface', f => {
        f.send('down', 100, 100, {}, f.mask); f.send('move', 250, 100, {}, f.mask); f.send('up', 250, 100, {}, f.mask);
        assert.deepEqual(f.seeks, [130]);
    });
    check('controls, progress bar, buttons, links and inputs keep their own interactions', f => {
        for (const target of [f.controls, f.bar, f.button, f.link, f.input]) {
            f.send('down', 100, 100, {}, target); f.send('move', 250, 100, {}, target); f.send('up', 250, 100, {}, target);
        }
        assert.deepEqual(f.seeks, []);
    });
    check('seeking is clamped to video boundaries', f => {
        f.video.currentTime = 290; f.send('down', 100); f.send('move', 250); f.send('up', 250);
        f.video.currentTime = 10; f.send('down', 250); f.send('move', 100); f.send('up', 100);
        assert.deepEqual(f.seeks, [300, 0]);
    });
    check('preview reports the clamped destination before seeking', f => {
        f.video.currentTime = 290; f.send('down', 100); f.send('move', 250);
        assert.equal(f.seeks.length, 0); assert.match(f.notices.at(-1), /快进 10 秒.*05:00 \/ 05:00/);
        f.send('up', 250); assert.deepEqual(f.seeks, [300]);
    });
    check('changing the video source cancels the pending seek', f => {
        f.video.src = 'https://video.example/first.mp4'; f.send('down', 100); f.send('move', 250);
        f.video.src = 'https://video.example/second.mp4'; f.send('up', 250);
        assert.deepEqual(f.seeks, []);
    });
    check('upward cancellation does not seek', f => {
        f.send('down', 100); f.send('move', 250); f.send('move', 250, 40); f.send('up', 250, 40);
        assert.deepEqual(f.seeks, []); assert.equal(f.click().defaultPrevented, true);
    });
    check('cancel event does not commit a seek', f => {
        f.send('down', 100); f.send('move', 250); f.send('cancel', 250); f.send('up', 250); assert.deepEqual(f.seeks, []);
    });
    check('a swipe held before release still suppresses the resulting click', f => {
        f.send('down', 100); f.send('move', 250); f.tick(2000); f.send('up', 250);
        assert.equal(f.click().defaultPrevented, true); f.tick(1000); assert.equal(f.click().defaultPrevented, false);
    });
    check('an intentional control tap immediately after seeking is allowed', f => {
        f.send('down', 100); f.send('move', 250); f.send('up', 250);
        f.send('down', 150, 100, {}, f.button); f.send('up', 150, 100, {}, f.button);
        assert.equal(f.click(f.button).defaultPrevented, false); assert.deepEqual(f.seeks, [130]);
    });
    check('window blur cancels the active gesture', f => {
        f.send('down', 100); f.send('move', 250); dispatch(f.window, 'blur'); f.send('up', 250); assert.deepEqual(f.seeks, []);
    });
    check('multiple fingers cancel seeking', f => {
        f.send('down', 100); f.send('move', 250);
        if (pointerEvents) f.send('down', 180, 100, {pointerId: 2, isPrimary: false});
        else f.send('down', 180, 100, {touches: [f.touch(250), f.touch(180, 100, 2)], changedTouches: [f.touch(180, 100, 2)]});
        f.tick(2000);
        f.send('up', 250); assert.deepEqual(f.seeks, []); assert.equal(f.click().defaultPrevented, true);
    });
    check('attach is idempotent and destroy removes active listeners', f => {
        const count = f.listenerCount(); f.window.XplayerContextMenu.attach(f.player); assert.equal(f.listenerCount(), count);
        f.send('down', 100); f.send('move', 250); f.destroy();
        assert.equal(f.listenerCount(), 0); f.send('up', 250); assert.deepEqual(f.seeks, []);
    });
    if (pointerEvents) {
        check('mouse dragging does not seek', f => {
            f.send('down', 100, 100, {pointerType: 'mouse'}); f.send('move', 250, 100, {pointerType: 'mouse'}); f.send('up', 250, 100, {pointerType: 'mouse'});
            assert.deepEqual(f.seeks, []);
        });
        check('loss of pointer capture cancels the active gesture', f => {
            f.send('down', 100); f.send('move', 250); dispatch(f.video, 'lostpointercapture', {pointerId: 1});
            f.tick(2000); f.send('up', 250);
            assert.deepEqual(f.seeks, []); assert.equal(f.click().defaultPrevented, true);
        });
    }
    test(mode + ': live and invalid-duration video cannot start seeking', () => {
        for (const overrides of [{options: {live: true}}, {video: {duration: NaN}}, {video: {duration: Infinity}}, {video: {duration: 0}}]) {
            const f = fixture(folder, pointerEvents, overrides);
            try { f.send('down', 100); f.send('move', 250); f.send('up', 250); assert.deepEqual(f.seeks, []); }
            finally { f.destroy(); }
        }
    });
}
console.log(`${passed}/${passed + failed} tests passed`);
process.exitCode = failed ? 1 : 0;

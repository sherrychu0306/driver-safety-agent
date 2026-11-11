// ===== STORYLINE VARIABLE CONFIG =====
const STORYLINE_COMPLETE_VAR = 'RoadwayChangeComplete'; // Rename to match your Storyline variable

// ===== THE FOUR CHANGES =====
// `icon` keys into ICONS below. `x` / `y` are percentages of the photo frame:
// x is where the wipe has to reach before the change is revealed, y only
// places the pin. Nudge these once the real photos are in img/.
const CHANGES = [
    {
        id: 'light',
        icon: 'trafficLight',
        text: 'The traffic light changes.',
        x: 14.94,
        y: 16.64
    },
    {
        id: 'vehicle',
        icon: 'car',
        text: 'A vehicle ahead stops, closing the space between you.',
        x: 33.59,
        y: 67.14
    },
    {
        id: 'child',
        icon: 'child',
        text: 'A child runs into the street.',
        x: 58.04,
        y: 53.75
    },
    {
        id: 'pedestrian',
        icon: 'pedestrian',
        text: 'An adult steps off a curb.',
        x: 70.59,
        y: 51.44
    }
];

// Keep the learner-facing comparison wired to one obvious asset map. Update
// these two paths when a new photo pair is supplied; the rest of the activity
// does not need to know where the files live.
const PHOTO_ASSETS = Object.freeze({
    before: 'img/before.jpg',
    after: 'img/after.jpg'
});

const NUDGE_DELAY = 4000;       // how long an untouched handle waits for its hint

// ===== ICONS =====
// Single-path SVGs, currentColor only, so they inherit the card's teal.
const ICONS = {
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 16.5v-3.1a2 2 0 0 1 .2-.9l2.1-4.2A2 2 0 0 1 7.1 7h9.8a2 2 0 0 1 1.8 1.1l2.1 4.2a2 2 0 0 1 .2.9v3.3"/><path d="M3 16.5h18"/><circle cx="7.5" cy="16.8" r="1.7"/><circle cx="16.5" cy="16.8" r="1.7"/><path d="M5.6 12.4h12.8"/></svg>',
    pedestrian: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12.4" cy="4.4" r="2.1"/><path d="M12.4 8.2 9.6 10v4"/><path d="M12.4 8.2 15.4 10l1.4 3.2"/><path d="M12.4 8.2v5.4l2.1 3.1v4.1"/><path d="M12.4 13.6 9.4 16.6l-1 4"/></svg>',
    trafficLight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2.6" width="8" height="15.2" rx="3.4"/><circle cx="12" cy="6.6" r="1.4"/><circle cx="12" cy="10.2" r="1.4"/><circle cx="12" cy="13.8" r="1.4"/><path d="M12 17.8v3.6"/><path d="M5.4 7.4H8"/><path d="M16 7.4h2.6"/></svg>',
    child: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11.2" cy="4.8" r="2.3"/><path d="M11.2 9v4.4"/><path d="m11.2 9.8-3.4 2"/><path d="m11.2 9.8 4 1.2"/><path d="m11.2 13.4-2.8 3 .6 4"/><path d="m11.2 13.4 3.4 2.6"/></svg>'
};

// ===== STORYLINE INTEGRATION =====
function getStorylineVariable(varName) {
    try {
        let player = null;
        if (window.GetPlayer) {
            player = window.GetPlayer();
        } else if (window.parent && window.parent.GetPlayer) {
            player = window.parent.GetPlayer();
        } else if (window.top && window.top.GetPlayer) {
            player = window.top.GetPlayer();
        }
        if (player && player.GetVar) {
            return player.GetVar(varName);
        }
        return null;
    } catch (error) {
        return null;
    }
}

function setStorylineVariable(varName, value) {
    try {
        let player = null;
        if (window.GetPlayer) {
            player = window.GetPlayer();
        } else if (window.parent && window.parent.GetPlayer) {
            player = window.parent.GetPlayer();
        } else if (window.top && window.top.GetPlayer) {
            player = window.top.GetPlayer();
        }
        if (player && player.SetVar) {
            player.SetVar(varName, value);
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// ===== COMPLETION STATE =====
// The flag lives in memory on the TOP window, not in sessionStorage.
// - Page refresh  -> top document is destroyed, flag is gone   -> fresh load -> false
// - Slide revisit -> only this iframe reloads, top window lives -> revisit    -> true
const REVISIT_KEY = `completed_${STORYLINE_COMPLETE_VAR}`;
// Bump this key when publishing a new build so Storyline does not restore a
// completion record written by an older uploaded web object.
const activityStore = typeof DriverSafetyState !== 'undefined' ? DriverSafetyState.create('roadway-change-v2') : null;

function getSessionStore() {
    try {
        const root = window.top || window.parent || window;
        if (!root.__woState) root.__woState = {}; // throws if cross-origin
        return root.__woState;
    } catch (error) {
        return null;
    }
}

function isRevisit() {
    const store = getSessionStore();
    if (store) return store[REVISIT_KEY] === true;
    return sessionStorage.getItem(REVISIT_KEY) === 'true'; // cross-origin fallback
}

function resetCompletion() {
    const store = getSessionStore();
    if (store) delete store[REVISIT_KEY];
    else sessionStorage.removeItem(REVISIT_KEY);
    setStorylineVariable(STORYLINE_COMPLETE_VAR, false);
}

function reportCompletion() {
    const store = getSessionStore();
    if (store) store[REVISIT_KEY] = true;
    else sessionStorage.setItem(REVISIT_KEY, 'true');
    setStorylineVariable(STORYLINE_COMPLETE_VAR, true);
    saveProgress();
}

function saveProgress() {
    activityStore?.write({
        pos: state.pos,
        revealed: [...state.revealed],
        completed: state.completed,
        completionOpen: state.completionOpen,
        touched: state.touched,
        mode: el.compare?.hidden ? 'intro' : 'compare'
    });
}

function restoreProgress(saved) {
    state.pos = Math.max(0, Math.min(100, Number(saved.pos) || 0));
    state.revealed = new Set(Array.isArray(saved.revealed) ? saved.revealed : []);
    state.completed = saved.completed === true;
    state.completionOpen = saved.completionOpen === undefined ? state.completed : saved.completionOpen === true;
    state.touched = saved.touched === true;
    renderChangeCards();
    renderChangeList();
    renderPins();
    loadPhotos();
    state.revealed.forEach(id => {
        const change = CHANGES.find(item => item.id === id);
        if (change) markRevealed(change);
    });
    updateMeter(state.pos, state.revealed.size);

    const savedMode = saved.mode === 'intro' || saved.mode === 'compare' ? saved.mode : null;
    if (savedMode === 'compare' || (!savedMode && (state.pos > 0 || state.completed))) {
        if (state.completed) state.pos = 100;
        showMode('compare');
        applyPos();
        if (state.completed && state.completionOpen) el.completionOverlay.classList.add('active');
    } else showIntro();
}

// ===== HELPERS =====
function staggerIn(selector, delayMs = 60) {
    document.querySelectorAll(selector).forEach((node, i) => {
        node.classList.add('stagger-in');
        node.style.animationDelay = `${i * delayMs}ms`;

        // Drop the entrance animation once it has played. Left in place its
        // "both" fill keeps holding transform, which overrides later
        // animations and makes the card jump.
        node.addEventListener('animationend', () => {
            node.classList.remove('stagger-in');
            node.style.animationDelay = '';
        }, { once: true });
    });
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function formatChangeCoordinates(changes) {
    return changes.map(change => {
        const x = Number(change.x.toFixed(2));
        const y = Number(change.y.toFixed(2));
        return `{ id: '${change.id}', x: ${x}, y: ${y} }`;
    }).join(',\n');
}

// ===== AUTHORING: POSITION PICKER =====
// Call enablePositionPicker() from the console, or open the page with
// ?positionPicker=1. Click the four changes in CHANGES order, then copy the
// generated lines into the x/y values in this file.
const positionPicker = {
    active: false,
    points: [],
    root: null
};

function positionFromPoint(event) {
    const rect = el.compare.getBoundingClientRect();
    return {
        x: clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
        y: clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100)
    };
}

function renderPositionPicker() {
    if (!positionPicker.root) return;

    const points = positionPicker.root.querySelector('.position-picker__points');
    points.innerHTML = '';
    positionPicker.points.forEach((point, index) => {
        const marker = document.createElement('span');
        marker.className = 'position-picker__point';
        marker.style.left = `${point.x}%`;
        marker.style.top = `${point.y}%`;
        marker.textContent = String(index + 1);
        points.appendChild(marker);
    });

    const output = positionPicker.root.querySelector('.position-picker__output');
    const copy = positionPicker.root.querySelector('.position-picker__copy');
    const undo = positionPicker.root.querySelector('.position-picker__undo');
    const count = positionPicker.root.querySelector('.position-picker__count');
    const instruction = positionPicker.root.querySelector('.position-picker__instruction');
    output.value = formatChangeCoordinates(positionPicker.points.map((point, index) => ({
        id: CHANGES[index].id,
        x: point.x,
        y: point.y
    })));
    output.hidden = positionPicker.points.length === 0;
    count.textContent = `${positionPicker.points.length} of ${CHANGES.length} positions selected`;
    copy.disabled = positionPicker.points.length !== CHANGES.length;
    undo.disabled = positionPicker.points.length === 0;
    instruction.textContent = positionPickerInstruction();
}

function positionPickerInstruction() {
    const nextIndex = positionPicker.points.length;
    if (nextIndex >= CHANGES.length) return 'All four positions selected. Copy x/y when ready.';
    return `Place ${nextIndex + 1}: ${CHANGES[nextIndex].text}`;
}

function createPositionPicker() {
    const root = document.createElement('div');
    root.className = 'position-picker';
    root.innerHTML = `
        <div class="position-picker__points" aria-hidden="true"></div>
        <div class="position-picker__toolbar">
            <strong>Position picker</strong>
            <span class="position-picker__count"></span>
            <span class="position-picker__instruction" aria-live="polite"></span>
            <button type="button" class="position-picker__copy" disabled>Copy x/y</button>
            <button type="button" class="position-picker__undo" disabled>Undo</button>
            <button type="button" class="position-picker__reset">Reset</button>
            <button type="button" class="position-picker__close" aria-label="Close position picker">×</button>
            <textarea class="position-picker__output" hidden readonly aria-label="Coordinates to paste into script.js"></textarea>
        </div>
    `;

    root.addEventListener('pointerdown', event => {
        event.stopPropagation();
        if (!event.target.closest('.position-picker__toolbar')) event.preventDefault();
    });

    root.addEventListener('click', event => {
        if (event.target.closest('.position-picker__toolbar')) return;
        if (positionPicker.points.length >= CHANGES.length) return;
        positionPicker.points.push(positionFromPoint(event));
        renderPositionPicker();
    });

    root.querySelector('.position-picker__copy').addEventListener('click', async event => {
        event.stopPropagation();
        const output = root.querySelector('.position-picker__output');
        try {
            await navigator.clipboard.writeText(output.value);
            event.currentTarget.textContent = 'Copied';
            setTimeout(() => { event.currentTarget.textContent = 'Copy x/y'; }, 1400);
        } catch (error) {
            output.focus();
            output.select();
            event.currentTarget.textContent = 'Select and copy';
        }
    });

    root.querySelector('.position-picker__reset').addEventListener('click', event => {
        event.stopPropagation();
        positionPicker.points = [];
        renderPositionPicker();
    });

    root.querySelector('.position-picker__undo').addEventListener('click', event => {
        event.stopPropagation();
        positionPicker.points.pop();
        renderPositionPicker();
    });

    root.querySelector('.position-picker__close').addEventListener('click', event => {
        event.stopPropagation();
        disablePositionPicker();
    });

    return root;
}

function enablePositionPicker() {
    if (positionPicker.active) return;
    if (el.compare.hidden) startCompare();
    positionPicker.active = true;
    positionPicker.points = [];
    positionPicker.root = createPositionPicker();
    el.compare.appendChild(positionPicker.root);
    el.compare.classList.add('is-position-picker-active');
    renderPositionPicker();
}

function disablePositionPicker() {
    if (positionPicker.root) positionPicker.root.remove();
    positionPicker.root = null;
    positionPicker.active = false;
    el.compare.classList.remove('is-position-picker-active');
}

window.enablePositionPicker = enablePositionPicker;
window.disablePositionPicker = disablePositionPicker;

// The bar and counter both reflect how many changes have surfaced. The final
// message is a separate learner-initiated step.
function updateMeter(pos, revealed) {
    const meterPos = Math.min(100, (revealed / CHANGES.length) * 100);
    if (el.progressBar) el.progressBar.style.width = `${meterPos}%`;
    if (el.countNum) el.countNum.textContent = String(revealed);
    if (el.countOf) el.countOf.textContent = `of ${CHANGES.length} changes found`;
}

// ===== ACTIVITY STATE =====
const state = {
    pos: 0,                 // wipe position, 0 (all Before) to 100 (all After)
    revealed: new Set(),    // change ids the wipe has passed
    completed: false,
    completionOpen: false,
    dragging: false,
    frame: null,            // pending rAF for the next paint
    tween: null,            // rAF id for a tap-to-jump animation
    nudgeTimer: null,
    touched: false          // has the learner moved the handle at all?
};

const el = {};

function cacheDom() {
    [
        'app', 'headTitle', 'headInstruction',
        'countNum', 'countOf', 'progressBar',
        'photoStage', 'changeGrid', 'compare', 'beforeImg', 'beforeSlot',
        'afterLayer', 'afterImg', 'afterSlot', 'changePins',
        'labelBefore', 'labelAfter', 'seam', 'handle',
        'panel', 'viewIntro', 'viewCompare', 'changeList', 'compareBack', 'finalMessageButton', 'startCompare',
        'completionOverlay', 'overlayRetry'
    ].forEach(id => { el[id] = document.getElementById(id); });
}

// ===== FRAME SIZING =====
// The photos are 3:2. The comparison frame is sized to the largest box of this
// ratio that fits the stage, so the seam, the labels and the pins always sit
// on the pixels the learner is looking at.
const PHOTO_RATIO = 3 / 2;

function sizeCompare() {
    const stage = el.photoStage;
    const frame = el.compare;
    if (!stage || !frame || frame.hidden) return;

    const availW = stage.clientWidth;
    const availH = stage.clientHeight;
    if (availW < 2 || availH < 2) return;

    let w = availW;
    let h = w / PHOTO_RATIO;
    if (h > availH) {
        h = availH;
        w = h * PHOTO_RATIO;
    }
    frame.style.width = `${Math.floor(w)}px`;
    frame.style.height = `${Math.floor(h)}px`;
}

function watchCompareSize() {
    sizeCompare();
    window.addEventListener('resize', sizeCompare);
    window.addEventListener('orientationchange', () => setTimeout(sizeCompare, 120));
    if (window.ResizeObserver && el.photoStage) {
        new ResizeObserver(() => sizeCompare()).observe(el.photoStage);
    }
    // fonts landing can change the header height and therefore the stage
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => sizeCompare()).catch(() => {});
    }
}

// ===== STAGE + PANEL SWITCHING =====
function showMode(name) {
    el.app.dataset.mode = name;

    const onCards = name === 'intro';
    el.changeGrid.hidden = !onCards;
    el.compare.hidden = onCards;

    el.viewIntro.hidden = name !== 'intro';
    el.viewCompare.hidden = name !== 'compare';

    sizeCompare();
}

function setHead(title, instruction) {
    el.headTitle.textContent = title;
    el.headInstruction.textContent = instruction;
}

// ===== INTRO: THE FOUR OVERVIEW CARDS =====
// Plain divs, not buttons: this screen is a read-only overview.
function renderChangeCards() {
    el.changeGrid.innerHTML = '';
    CHANGES.forEach(change => {
        const card = document.createElement('div');
        card.className = 'type-card';

        const icon = document.createElement('span');
        icon.className = 'type-card__icon';
        icon.innerHTML = ICONS[change.icon];

        const line = document.createElement('span');
        line.className = 'type-card__line';
        line.textContent = change.text;

        card.append(icon, line);
        el.changeGrid.appendChild(card);
    });
}

// ===== COMPARE: THE PANEL LIST AND THE PINS =====
function renderChangeList() {
    el.changeList.innerHTML = '';
    CHANGES.forEach((change, i) => {
        const item = document.createElement('li');
        item.className = 'change-item';
        item.dataset.id = change.id;
        item.setAttribute('aria-label', `${change.text} Not yet revealed.`);

        const num = document.createElement('span');
        num.className = 'change-item__num';
        num.textContent = String(i + 1);

        const text = document.createElement('span');
        text.className = 'change-item__text';
        text.textContent = change.text;

        const mark = document.createElement('span');
        mark.className = 'change-item__mark';
        mark.textContent = '✓';

        item.append(num, text, mark);
        el.changeList.appendChild(item);
    });
    updateFinalMessageButton();
}

function updateFinalMessageButton() {
    if (!el.finalMessageButton) return;
    el.finalMessageButton.hidden = state.completed || state.revealed.size !== CHANGES.length;
}

function renderPins() {
    el.changePins.innerHTML = '';
    CHANGES.forEach((change, i) => {
        const pin = document.createElement('span');
        pin.className = 'change-pin';
        pin.dataset.id = change.id;
        pin.style.left = `${change.x}%`;
        pin.style.top = `${change.y}%`;
        pin.textContent = String(i + 1);
        pin.setAttribute('aria-hidden', 'true');
        el.changePins.appendChild(pin);
    });
}

function markRevealed(change) {
    const pin = el.changePins.querySelector(`.change-pin[data-id="${change.id}"]`);
    if (pin) pin.classList.add('is-revealed');

    const item = el.changeList.querySelector(`.change-item[data-id="${change.id}"]`);
    if (item) {
        item.classList.add('is-revealed');
        item.setAttribute('aria-label', `${change.text} Revealed.`);
    }
}

// ===== THE WIPE =====
function applyPos() {
    state.frame = null;
    el.compare.style.setProperty('--pos', `${state.pos}%`);
    el.handle.setAttribute('aria-valuenow', String(Math.round(state.pos)));
    el.compare.classList.toggle('is-revealing', state.pos > 4);
    CHANGES.forEach(change => {
        const pin = el.changePins.querySelector(`.change-pin[data-id="${change.id}"]`);
        if (pin) pin.classList.toggle('is-visible', state.pos >= change.x);
    });
    updateMeter(state.pos, state.revealed.size);
}

function schedulePaint() {
    if (state.frame !== null) return;
    state.frame = requestAnimationFrame(applyPos);
}

function setPos(value) {
    state.pos = clamp(value, 0, 100);

    CHANGES.forEach(change => {
        if (state.pos >= change.x && !state.revealed.has(change.id)) {
            state.revealed.add(change.id);
            markRevealed(change);
        }
    });

    saveProgress();
    schedulePaint();

    if (state.revealed.size === CHANGES.length) {
        updateFinalMessageButton();
        clearNudgeTimer();
        el.handle.classList.remove('is-nudging');
    }
}

// A tap away from the handle slides it over rather than teleporting it, so the
// wipe still reads as one continuous motion.
function tweenTo(target) {
    cancelTween();
    const from = state.pos;
    const to = clamp(target, 0, 100);
    const distance = Math.abs(to - from);
    if (distance < 0.5) { setPos(to); return; }

    const duration = clamp(distance * 6, 160, 480);
    const start = performance.now();

    const step = now => {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setPos(from + (to - from) * eased);
        state.tween = t < 1 ? requestAnimationFrame(step) : null;
    };
    state.tween = requestAnimationFrame(step);
}

function cancelTween() {
    if (state.tween !== null) {
        cancelAnimationFrame(state.tween);
        state.tween = null;
    }
}

function posFromEvent(event) {
    const rect = el.compare.getBoundingClientRect();
    if (rect.width < 2) return state.pos;
    return ((event.clientX - rect.left) / rect.width) * 100;
}

function markTouched() {
    state.touched = true;
    clearNudgeTimer();
    el.handle.classList.remove('is-nudging');
}

function clearNudgeTimer() {
    if (state.nudgeTimer !== null) {
        clearTimeout(state.nudgeTimer);
        state.nudgeTimer = null;
    }
}

function playNudge() {
    if (state.touched || state.completed) return;
    el.handle.classList.remove('is-nudging');
    void el.handle.offsetWidth;
    el.handle.classList.add('is-nudging');
}

// The handle is the whole interaction — if it sits untouched, it says so once.
function armNudge() {
    clearNudgeTimer();
    el.handle.classList.remove('is-nudging');
    if (state.touched || state.completed) return;
    playNudge();
    state.nudgeTimer = setTimeout(() => {
        state.nudgeTimer = null;
        playNudge();
    }, NUDGE_DELAY);
}

// Pointer events throughout, so a finger on a tablet behaves exactly like a
// mouse. The capture keeps the drag alive if the pointer leaves the frame.
function bindSlider() {
    // Not gated on state.completed: the overlay already blocks the frame while
    // it is up, and after a revisit the learner can still work the slider.
    el.compare.addEventListener('pointerdown', event => {
        markTouched();
        cancelTween();
        state.dragging = true;
        el.app.classList.add('is-dragging');
        el.compare.setPointerCapture(event.pointerId);
        event.preventDefault();

        if (event.target === el.handle || el.handle.contains(event.target)) {
            el.handle.focus();
            return; // grab it where it is; don't jump it under the finger
        }
        el.handle.focus();
        tweenTo(posFromEvent(event));
    });

    el.compare.addEventListener('pointermove', event => {
        if (!state.dragging) return;
        event.preventDefault();
        setPos(posFromEvent(event));
    });

    const endDrag = event => {
        if (!state.dragging) return;
        state.dragging = false;
        el.app.classList.remove('is-dragging');
        if (el.compare.hasPointerCapture(event.pointerId)) {
            el.compare.releasePointerCapture(event.pointerId);
        }
    };

    el.compare.addEventListener('pointerup', endDrag);
    el.compare.addEventListener('pointercancel', endDrag);

    el.handle.addEventListener('keydown', event => {
        const steps = {
            ArrowLeft: -5, ArrowRight: 5,
            ArrowDown: -5, ArrowUp: 5,
            PageDown: -20, PageUp: 20
        };

        if (event.key in steps) {
            markTouched();
            cancelTween();
            setPos(state.pos + steps[event.key]);
            event.preventDefault();
            return;
        }
        if (event.key === 'Home' || event.key === 'End') {
            markTouched();
            tweenTo(event.key === 'End' ? 100 : 0);
            event.preventDefault();
        }
    });
}

// ===== COMPLETION =====
function showFinalMessage() {
    if (state.revealed.size !== CHANGES.length) return;
    state.completed = true;
    state.completionOpen = true;
    saveProgress();
    reportCompletion();
    el.finalMessageButton.hidden = true;
    el.completionOverlay.classList.add('active');
}

function reviewPhoto() {
    el.completionOverlay.classList.remove('active');
    state.completionOpen = false;
    saveProgress();
    showMode('compare');
    setHead(
        'What changed while you looked away',
        'Drag the slider from left to right to see what changed.'
    );
    applyPos();
    el.handle.focus();
}

function returnToIntro() {
    cancelTween();
    clearNudgeTimer();
    el.completionOverlay.classList.remove('active');
    state.completionOpen = false;
    showIntro();
    saveProgress();
}

// Review stays on the comparison so the side panel remains visible.
function restart() {
    cancelTween();
    clearNudgeTimer();
    el.completionOverlay.classList.remove('active');

    state.completed = false;
    state.completionOpen = false;
    state.dragging = false;
    state.touched = false;
    state.revealed = new Set();
    updateFinalMessageButton();
    activityStore?.clear();
    el.app.classList.remove('is-dragging');
    el.changePins.querySelectorAll('.change-pin')
        .forEach(pin => pin.classList.remove('is-revealed'));
    el.changeList.querySelectorAll('.change-item').forEach(item => {
        item.classList.remove('is-revealed');
        const change = CHANGES.find(c => c.id === item.dataset.id);
        if (change) item.setAttribute('aria-label', `${change.text} Not yet revealed.`);
    });

    setPos(0);
    showIntro();
}

// ===== VIEWS =====
function showIntro() {
    setHead(
        'A glance is not a pause',
        'Traffic and hazards keep moving while your attention is away.'
    );
    showMode('intro');
    staggerIn('.type-grid .type-card', 60);
}

function startCompare() {
    setHead(
        'What changed while you looked away',
        'Drag the slider from Before to After to see what changed.'
    );
    showMode('compare');
    saveProgress();
    el.compare.classList.remove('scene-enter');
    void el.compare.offsetWidth;
    el.compare.classList.add('scene-enter');
    staggerIn('#changeList .change-item', 50);
    applyPos();
    armNudge();
    el.handle.focus();
}

// The photo if it loads, the labeled slot if the file isn't there yet.
function loadPhoto(img, slot, file) {
    slot.hidden = true;
    img.hidden = false;
    img.onerror = () => {
        img.hidden = true;
        slot.hidden = false;
    };
    img.src = file;
}

function loadPhotos() {
    el.beforeImg.alt = 'The roadway before the glance: the vehicle ahead is moving, the adult and child are away from the street, and the traffic light has not changed.';
    el.afterImg.alt = 'The same roadway after the glance: the vehicle ahead has stopped, the adult has stepped off the curb, the light has changed, and a child has entered the street.';
    loadPhoto(el.beforeImg, el.beforeSlot, PHOTO_ASSETS.before);
    loadPhoto(el.afterImg, el.afterSlot, PHOTO_ASSETS.after);
}

// ===== WIRING =====
function bindEvents() {
    el.startCompare.addEventListener('click', startCompare);
    el.compareBack.addEventListener('click', returnToIntro);
    el.finalMessageButton.addEventListener('click', showFinalMessage);
    el.overlayRetry.addEventListener('click', reviewPhoto);
    bindSlider();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    const saved = activityStore?.read();
    if (saved) {
        restoreProgress(saved);
        bindEvents();
        watchCompareSize();
    } else {
        if (!isRevisit()) resetCompletion(); // fresh load -> false
        initInteraction();
        if (new URLSearchParams(window.location.search).has('positionPicker')) {
            enablePositionPicker();
        }
    }
});

// A revisit opens on the finished comparison -- fully wiped to After, every
// change revealed, and no completion overlay so the photo is immediately
// available for review.
function renderCompletedState() {
    el.app.classList.add('no-anim');
    renderChangeCards();
    renderChangeList();
    renderPins();
    loadPhotos();
    bindEvents();
    watchCompareSize();

    state.completed = true;
    state.touched = true;
    showMode('compare');
    setHead(
        'What changed while you looked away',
        'Drag the slider from Before to After to see what changed.'
    );
    setPos(100);
    applyPos();
}

function initInteraction() {
    renderChangeCards();
    renderChangeList();
    renderPins();
    loadPhotos();
    bindEvents();
    watchCompareSize();
    updateMeter(0, 0);
    showIntro();
}

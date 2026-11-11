// ===== STORYLINE VARIABLE CONFIG =====
const STORYLINE_COMPLETE_VAR = 'CabCheckComplete'; // Rename to match your Storyline variable

// ===== AUTHORING TOOLS =====
// PICKER_MODE — the area picker.
//   true  -> picker is OPEN: drag boxes on the photo to define hotspot areas.
//            The learner activity is switched off while it's open.
//   false -> picker is CLOSED: normal activity, no authoring UI.
// You can also open it without editing this file by adding ?picker=1 to the URL.
const PICKER_MODE = false;

// SHOW_MARKERS — amber dots that show where the five areas are.
//   true  -> learners see the spots; the challenge is identifying each fault.
//   false -> nothing is marked; learners must find the spots first (harder).
const SHOW_MARKERS = false;

// ===== HOTSPOT DATA =====
// Boxes are percentages of the photo (x/y = top-left corner, w/h = size).
// Percentages, not pixels, so they hold position at any display size.
// Use the area picker to redraw these, then paste the JSON back in here.
const HOTSPOTS = [
    {
        id: 'clutter',
        area: 'Dashboard',
        fault: 'Clutter on the dash blocking sightlines',
        boxes: [{ x: 53, y: 31.5, w: 35, h: 13.5 }],
        prompt: 'You flagged the dash. What needs correcting here?',
        options: [
            { text: 'Paperwork and packages are stacked where they block the driver\u2019s sightlines', correct: true, feedback: 'Good catch.' },
            { text: 'The dash should be wiped down at the start of every shift', feedback: 'A clean dash is nice, but dust isn\u2019t what\u2019s blocking your view.' },
            { text: 'The coffee should be in a spill-proof travel mug', feedback: 'A lidded mug helps, but the stack in front of you is the real problem.' },
            { text: 'The paperwork should be filed electronically instead of printed', feedback: 'Good catch. Going paperless is a bigger fix than this moment needs.' }
        ],
        hint: 'Think about what the driver can no longer see \u2014 not about tidiness for its own sake.',
        standard: 'Clear anything that blocks your view before you drive.'
    },
    {
        id: 'phone',
        area: 'Passenger seat',
        fault: 'Phone face-up on the seat, notifications live',
        boxes: [{ x: 72, y: 81, w: 11.5, h: 15 }],
        prompt: 'You flagged the phone on the passenger seat. What needs correcting here?',
        options: [
            { text: 'Loose and face-up with notifications live \u2014 it will pull the driver\u2019s eyes off the road', correct: true, feedback: 'You spotted it.' },
            { text: 'It\u2019s out of arm\u2019s reach from the driver\u2019s seat', feedback: 'Reach isn\u2019t the issue \u2014 reaching for it at all is.' },
            { text: 'It isn\u2019t connected to the vehicle\u2019s charger', feedback: 'Charge level isn\u2019t the risk here. The interruptions are.' },
            { text: 'Personal phones aren\u2019t permitted in a company vehicle at all', feedback: 'Your phone can ride along \u2014 it just can\u2019t interrupt you.' }
        ],
        hint: 'Two things are wrong with where it\u2019s sitting: it isn\u2019t secured, and it can still interrupt.',
        standard: 'Mount your phone and silence it before you move.'
    },
    {
        id: 'mirror',
        area: 'Rear-view mirror',
        fault: 'Mirrors not adjusted for the driver',
        boxes: [{ x: 49.3, y: 4.2, w: 16.9, h: 14 }],
        prompt: 'You flagged the rear-view mirror. What needs correcting here?',
        options: [
            { text: 'It hasn\u2019t been reset for whoever is driving today', correct: true, feedback: 'Exactly right.' },
            { text: 'It\u2019s cracked and needs replacing before the trip', feedback: 'Nothing here is damaged \u2014 it\u2019s just aimed for someone else.' },
            { text: 'It\u2019s missing a mounted dash camera', feedback: 'Exactly right. A camera isn\u2019t what this check is about.' },
            { text: 'It should be angled down to watch the cargo area', feedback: 'Your mirrors are for the traffic behind you, not the load.' }
        ],
        hint: 'Nothing here is broken. Think about what changes when a different driver takes the vehicle.',
        standard: 'Set your mirrors for yourself before every trip.'
    },
    {
        id: 'navigation',
        area: 'Center touchscreen',
        fault: 'Route and destination not reviewed before driving',
        boxes: [{ x: 54, y: 38.5, w: 12, h: 28 }],
        prompt: 'You flagged the navigation. What needs correcting here?',
        options: [
            { text: 'The route and destination haven\u2019t been reviewed, so the driver will be working it out on the move', correct: true, feedback: 'That\u2019s the one.' },
            { text: 'The screen is too small to read safely while driving', feedback: 'Screen size isn\u2019t the issue. Figuring out the route while moving is.' },
            { text: 'The map software needs updating before the trip', feedback: 'Updates are good housekeeping, but they won\u2019t help if you haven\u2019t looked at the route.' },
            { text: 'Voice guidance should be switched off so it doesn\u2019t distract the driver', feedback: 'Voice prompts can help, but only when you already know where you\u2019re headed.' }
        ],
        hint: 'The issue is planning before moving, not the screen\u2019s size, software version, or voice guidance.',
        standard: 'Review the route and destination before you move.'
    },
    {
        id: 'warnings',
        area: 'Instrument cluster',
        fault: 'Warning lights unacknowledged',
        boxes: [{ x: 38.5, y: 38.5, w: 11, h: 12 }],
        prompt: 'You flagged the instrument cluster. What needs correcting here?',
        options: [
            { text: 'Warning lights are lit and haven\u2019t been resolved or reported', correct: true, feedback: 'Good catch.' },
            { text: 'The cluster brightness is too high for night driving', feedback: 'Brightness isn\u2019t the issue \u2014 what\u2019s lit up is.' },
            { text: 'The odometer reading hasn\u2019t been logged for the shift', feedback: 'Logging can wait. A lit warning can\u2019t.' },
            { text: 'They\u2019re part of the normal start-up sequence and will clear on their own', feedback: 'Start-up lights go out on their own. These haven\u2019t.' }
        ],
        hint: 'The lights themselves aren\u2019t the fault \u2014 it\u2019s what hasn\u2019t happened about them.',
        standard: 'Sort out or report every lit warning before you leave.'
    }
];

const TOTAL = HOTSPOTS.length;
const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

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
const activityStore = typeof DriverSafetyState !== 'undefined' ? DriverSafetyState.create('cab-check') : null;

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
    activityStore?.write({ found: [...state.found], activeId: state.activeId, order: state.order, completed: state.completed, view: el.viewQuestion?.hidden ? (el.viewStandard?.hidden ? 'explore' : 'standard') : 'question' });
}

function restoreProgress(saved) {
    state.found = new Set(Array.isArray(saved.found) ? saved.found : []);
    state.order = saved.order && typeof saved.order === 'object' ? saved.order : {};
    state.activeId = saved.activeId || null;
    state.completed = saved.completed === true;
    renderHotspots();
    state.found.forEach(id => markFound(id));
    renderFindings();
    updateProgress(state.found.size, TOTAL);
    if (state.completed) enterReviewMode();
    if (state.activeId && saved.view === 'question') openQuestion(state.activeId);
    else if (state.activeId && saved.view === 'standard') showStandard(state.activeId);
    else showView('explore');
}

// Once every hotspot is found the vehicle becomes browsable: found spots take
// clicks again so any of them can be re-opened for review.
function enterReviewMode() {
    state.completed = true;
    el.app.classList.add('is-review');
}

function showCompletion() {
    enterReviewMode();

    const overlay = document.getElementById('completionOverlay');
    if (overlay) {
        overlay.classList.add('active');
        // The overlay stays up until the learner dismisses it -- no timer.
        // Dismissing drops back to the vehicle with the findings checklist, not
        // to the last hotspot's standard panel that was open underneath.
        const dismissBtn = document.getElementById('overlayDismiss');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                overlay.classList.remove('active');
                backToExplore();
            }, { once: true });
        }
    }
    reportCompletion();
}

// ===== HELPERS =====
function staggerIn(selector, delayMs = 60) {
    document.querySelectorAll(selector).forEach((node, i) => {
        node.classList.add('stagger-in');
        node.style.animationDelay = `${i * delayMs}ms`;

        // Drop the entrance animation once it has played. Left in place its
        // "both" fill keeps holding transform, which overrides :hover/:active
        // and makes the button jump when a later animation (pop/shake)
        // replaces it -- and the inline delay would postpone that one too.
        node.addEventListener('animationend', () => {
            node.classList.remove('stagger-in');
            node.style.animationDelay = '';
        }, { once: true });
    });
}

function updateProgress(done, total) {
    const fill = document.getElementById('progressBar');
    const num = document.getElementById('countNum');
    if (fill) fill.style.width = `${(done / total) * 100}%`;
    if (num) num.textContent = String(done);
}

// ===== ACTIVITY STATE =====
const state = {
    found: new Set(),
    activeId: null,
    order: {},      // hotspot id -> its shuffled option order, fixed once per session
    completed: false // all five found: the vehicle opens up for free review
};

const el = {};

function cacheDom() {
    [
        'app', 'photoStage', 'photoFrame', 'hotspotLayer', 'pickerLayer', 'pickerMarquee',
        'panel', 'viewExplore', 'viewQuestion', 'viewStandard',
        'findings', 'questionText', 'options',
        'standardText', 'backToVehicle',
        'picker', 'pickerClose', 'pickerCoords',
        'pickerTarget', 'pickerAssign', 'pickerList', 'pickerCopy', 'pickerReset'
    ].forEach(id => { el[id] = document.getElementById(id); });
}

function getHotspot(id) {
    return HOTSPOTS.find(h => h.id === id);
}

// ===== PHOTO SIZING =====
// The photo's native ratio. The frame is sized to the largest box of this
// ratio that fits the stage, so the hotspot layer (inset: 0) always lines up
// with the pixels the learner is looking at.
const PHOTO_RATIO = 1672 / 941;

function sizePhoto() {
    const stage = el.photoStage;
    const frame = el.photoFrame;
    if (!stage || !frame) return;

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
    matchPanelToPhoto(Math.floor(h));
    layoutHotspots();
}

// The frame is usually capped on width, so it is shorter than the stage row.
// Side by side, the panel is pinned to that same height so the two cards read
// as one pair; stacked (<=768px) it goes back to filling its own grid row.
function matchPanelToPhoto(frameH) {
    const panel = el.panel;
    if (!panel) return;
    const sideBySide = window.matchMedia('(min-width: 769px)').matches;
    panel.style.height = sideBySide ? `${frameH}px` : '';
}

// Minimum touch target. On a small tablet a region like the mirror is only
// ~25px tall, so each box is grown around its own centre until it clears
// MIN_TAP — the target gets bigger, but it stays centred on the real object.
const MIN_TAP = 44;

function layoutHotspots() {
    const frame = el.photoFrame;
    if (!frame) return;
    const fw = frame.clientWidth;
    const fh = frame.clientHeight;
    if (fw < 2 || fh < 2) return;

    el.hotspotLayer.querySelectorAll('.hotspot').forEach(node => {
        let box;
        try { box = JSON.parse(node.dataset.box); } catch (error) { return; }

        const cx = (box.x + box.w / 2) / 100 * fw;
        const cy = (box.y + box.h / 2) / 100 * fh;
        const w = Math.min(fw, Math.max(box.w / 100 * fw, MIN_TAP));
        const h = Math.min(fh, Math.max(box.h / 100 * fh, MIN_TAP));
        const left = Math.min(Math.max(0, cx - w / 2), fw - w);
        const top = Math.min(Math.max(0, cy - h / 2), fh - h);

        node.style.left = `${Math.round(left)}px`;
        node.style.top = `${Math.round(top)}px`;
        node.style.width = `${Math.round(w)}px`;
        node.style.height = `${Math.round(h)}px`;
    });
}

function watchPhotoSize() {
    sizePhoto();
    window.addEventListener('resize', sizePhoto);
    window.addEventListener('orientationchange', () => setTimeout(sizePhoto, 120));
    if (window.ResizeObserver && el.photoStage) {
        new ResizeObserver(() => sizePhoto()).observe(el.photoStage);
    }
    // fonts landing can change the header height and therefore the stage
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => sizePhoto()).catch(() => {});
    }
}

// ===== RENDER: HOTSPOT LAYER =====
function renderHotspots() {
    el.hotspotLayer.innerHTML = '';
    HOTSPOTS.forEach(spot => {
        spot.boxes.forEach((box, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'hotspot';
            btn.dataset.id = spot.id;
            btn.dataset.box = JSON.stringify(box);
            // Neutral location name — never names the fault, so screen reader
            // users get the same challenge as everyone else.
            btn.setAttribute('aria-label', spot.boxes.length > 1
                ? `${spot.area} (area ${i + 1})`
                : spot.area);
            const marker = document.createElement('span');
            marker.className = 'hotspot__marker';
            btn.appendChild(marker);
            el.hotspotLayer.appendChild(btn);
        });
    });
    el.hotspotLayer.classList.toggle('no-markers', !SHOW_MARKERS);
    el.hotspotLayer.classList.add('is-live');
    layoutHotspots();
}

function markFound(id) {
    el.hotspotLayer.querySelectorAll(`.hotspot[data-id="${id}"]`).forEach(node => {
        node.classList.remove('is-active');
        node.classList.add('is-found');
    });
}

// ===== RENDER: PANEL =====
function showView(name) {
    el.app.dataset.mode = name;
    el.viewExplore.hidden = name !== 'explore';
    el.viewQuestion.hidden = name !== 'question';
    el.viewStandard.hidden = name !== 'standard';
}

function renderFindings() {
    el.findings.innerHTML = '';
    HOTSPOTS.forEach((spot, i) => {
        const found = state.found.has(spot.id);
        const li = document.createElement('li');
        li.className = `finding${found ? ' is-found' : ''}`;
        const mark = document.createElement('span');
        mark.className = 'finding__mark';
        mark.textContent = found ? '\u2713' : String(i + 1);
        const label = document.createElement('span');
        label.textContent = found ? spot.fault : 'Not yet identified';
        li.append(mark, label);
        el.findings.appendChild(li);
    });
}

// Fisher-Yates on a copy, so the authored order (correct answer first)
// isn't a giveaway.
function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

function openQuestion(id) {
    const spot = getHotspot(id);
    if (!spot) return;
    setActive(id);

    el.questionText.textContent = spot.prompt;

    // Shuffled once per hotspot, so the order holds steady if this question
    // is ever re-rendered during the same session.
    if (!state.order[id]) state.order[id] = shuffle(spot.options);
    saveProgress();

    el.options.innerHTML = '';
    state.order[id].forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option';
        btn.dataset.correct = opt.correct ? 'true' : 'false';
        btn.dataset.index = String(i);

        const key = document.createElement('span');
        key.className = 'option__key';
        key.textContent = KEYS[i];

        const text = document.createElement('span');
        text.className = 'option__text';
        text.textContent = opt.text;

        const mark = document.createElement('span');
        mark.className = 'option__mark';

        btn.append(key, text, mark);
        el.options.appendChild(btn);
    });

    showView('question');
    staggerIn('#options .option', 50);
}

function clearActive() {
    el.hotspotLayer.querySelectorAll('.hotspot.is-active')
        .forEach(node => node.classList.remove('is-active'));
}

function setActive(id) {
    clearActive();
    state.activeId = id;
    saveProgress();
    el.hotspotLayer.querySelectorAll(`.hotspot[data-id="${id}"]`)
        .forEach(node => node.classList.add('is-active'));
}

// `picked` is the option the learner just clicked. Its feedback speaks to
// that specific choice, then the standard follows. Reopening a found spot in
// review passes nothing, so the standard stands on its own.
function showStandard(id, picked) {
    const spot = getHotspot(id);
    if (!spot) return;
    setActive(id);

    const lead = picked && picked.feedback ? `${picked.feedback} ` : '';
    el.standardText.textContent = lead + spot.standard;
    showView('standard');
}

function recordFound(id) {
    if (state.found.has(id)) return;
    state.found.add(id);
    saveProgress();
    markFound(id);
    renderFindings();
    updateProgress(state.found.size, TOTAL);
}

function handleOptionClick(btn) {
    const id = state.activeId;
    if (!id) return;
    const correct = btn.dataset.correct === 'true';
    const picked = (state.order[id] || [])[Number(btn.dataset.index)];

    // One attempt only: lock every option on the first answer either way.
    // Clearing the entrance animation here covers a click that lands before
    // it finished -- otherwise its inline delay would postpone pop/shake.
    el.options.querySelectorAll('.option').forEach(node => {
        node.classList.add('is-locked');
        node.classList.remove('stagger-in');
        node.style.animationDelay = '';
    });

    if (correct) {
        btn.classList.add('correct');
        btn.querySelector('.option__mark').textContent = '\u2713';
        revealAfter(id, 620, picked);
        return;
    }

    // Wrong answer -> mark it and reveal the correct one right away.
    btn.classList.add('incorrect', 'is-dimmed');
    btn.querySelector('.option__mark').textContent = '\u2715';

    const right = el.options.querySelector('.option[data-correct="true"]');
    if (right) {
        right.classList.remove('is-dimmed');
        right.classList.add('correct');
        right.querySelector('.option__mark').textContent = '\u2713';
    }
    revealAfter(id, 1100, picked);
}

// Bank the find now so navigating away mid-reveal can't lose the answer,
// and only open the standard panel if this hotspot is still the active one.
function revealAfter(id, delayMs, picked) {
    recordFound(id);
    setTimeout(() => {
        if (state.activeId !== id) return;

        // Fifth find: the overlay comes up on its own, no summary click.
        // It fires before showStandard so the panel behind it already reads
        // "Back to the vehicle" when the overlay clears.
        if (state.found.size === TOTAL && !state.completed) showCompletion();

        showStandard(id, picked);
    }, delayMs);
}

function handleLayerClick(event) {
    const spot = event.target.closest('.hotspot');
    if (!spot) return;

    if (spot.classList.contains('is-found')) {
        // Review: re-open what correct looks like for an already-found spot.
        if (state.completed) showStandard(spot.dataset.id);
        return;
    }

    openQuestion(spot.dataset.id);
}

function backToExplore() {
    state.activeId = null;
    clearActive();
    renderFindings();
    showView('explore');
    saveProgress();

    if (state.found.size === TOTAL && !state.completed) showCompletion();
}

// ===== AREA PICKER (authoring tool) =====
const picker = {
    active: false,
    dragging: false,
    startX: 0,
    startY: 0,
    pending: null
};

function pickerIsRequested() {
    if (PICKER_MODE) return true;
    try {
        return new URLSearchParams(window.location.search).get('picker') === '1';
    } catch (error) {
        return false;
    }
}

function round1(n) {
    return Math.round(n * 10) / 10;
}

function openPicker() {
    picker.active = true;
    el.picker.hidden = false;
    el.pickerLayer.hidden = false;
    el.hotspotLayer.classList.remove('is-live');

    // fill the assign dropdown
    el.pickerTarget.innerHTML = '';
    HOTSPOTS.forEach(spot => {
        const opt = document.createElement('option');
        opt.value = spot.id;
        opt.textContent = spot.area;
        el.pickerTarget.appendChild(opt);
    });

    renderPickerGhosts();
    renderPickerList();
}

function closePicker() {
    picker.active = false;
    el.picker.hidden = true;
    el.pickerLayer.hidden = true;
    el.pickerMarquee.hidden = true;
    el.hotspotLayer.querySelectorAll('.picker-ghost').forEach(n => n.remove());
    el.hotspotLayer.classList.add('is-live');
}

function renderPickerGhosts() {
    el.hotspotLayer.querySelectorAll('.picker-ghost').forEach(n => n.remove());
    HOTSPOTS.forEach(spot => {
        spot.boxes.forEach(box => {
            const ghost = document.createElement('div');
            ghost.className = 'picker-ghost';
            ghost.style.left = `${box.x}%`;
            ghost.style.top = `${box.y}%`;
            ghost.style.width = `${box.w}%`;
            ghost.style.height = `${box.h}%`;
            const tag = document.createElement('span');
            tag.className = 'picker-ghost__tag';
            tag.textContent = spot.area;
            ghost.appendChild(tag);
            el.hotspotLayer.appendChild(ghost);
        });
    });
}

function renderPickerList() {
    el.pickerList.innerHTML = '';
    HOTSPOTS.forEach(spot => {
        spot.boxes.forEach(box => {
            const li = document.createElement('li');
            li.className = 'picker__row';
            const name = document.createElement('b');
            name.textContent = spot.area;
            const coords = document.createElement('span');
            coords.textContent = `${box.x} / ${box.y} / ${box.w} / ${box.h}`;
            li.append(name, coords);
            el.pickerList.appendChild(li);
        });
    });
}

function pointerPercent(event) {
    const rect = el.photoFrame.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    return {
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y))
    };
}

function onPickerDown(event) {
    if (!picker.active) return;
    const p = pointerPercent(event);
    picker.dragging = true;
    picker.startX = p.x;
    picker.startY = p.y;
    el.pickerMarquee.hidden = false;
    el.pickerMarquee.style.left = `${p.x}%`;
    el.pickerMarquee.style.top = `${p.y}%`;
    el.pickerMarquee.style.width = '0%';
    el.pickerMarquee.style.height = '0%';
    el.pickerLayer.setPointerCapture(event.pointerId);
    event.preventDefault();
}

function onPickerMove(event) {
    if (!picker.dragging) return;
    const p = pointerPercent(event);
    const x = Math.min(picker.startX, p.x);
    const y = Math.min(picker.startY, p.y);
    const w = Math.abs(p.x - picker.startX);
    const h = Math.abs(p.y - picker.startY);
    el.pickerMarquee.style.left = `${x}%`;
    el.pickerMarquee.style.top = `${y}%`;
    el.pickerMarquee.style.width = `${w}%`;
    el.pickerMarquee.style.height = `${h}%`;
    el.pickerCoords.textContent =
        `x ${round1(x)}  y ${round1(y)}  w ${round1(w)}  h ${round1(h)}`;
}

function onPickerUp(event) {
    if (!picker.dragging) return;
    picker.dragging = false;
    const p = pointerPercent(event);
    const box = {
        x: round1(Math.min(picker.startX, p.x)),
        y: round1(Math.min(picker.startY, p.y)),
        w: round1(Math.abs(p.x - picker.startX)),
        h: round1(Math.abs(p.y - picker.startY))
    };

    if (box.w < 2 || box.h < 2) {
        picker.pending = null;
        el.pickerAssign.disabled = true;
        el.pickerMarquee.hidden = true;
        el.pickerCoords.textContent = 'Too small \u2014 drag a bigger box.';
        return;
    }

    picker.pending = box;
    el.pickerAssign.disabled = false;
    el.pickerCoords.textContent = `x ${box.x}  y ${box.y}  w ${box.w}  h ${box.h}`;
}

function assignPendingBox() {
    if (!picker.pending) return;
    const id = el.pickerTarget.value;
    const spot = getHotspot(id);
    if (!spot) return;
    spot.boxes = [picker.pending];   // replaces that item's area
    picker.pending = null;
    el.pickerAssign.disabled = true;
    el.pickerMarquee.hidden = true;
    el.pickerCoords.textContent = `Assigned to ${spot.area}.`;
    renderHotspots();
    renderPickerGhosts();
    renderPickerList();
    el.hotspotLayer.classList.remove('is-live');
}

function copyPickerJson() {
    const payload = {};
    HOTSPOTS.forEach(spot => { payload[spot.id] = spot.boxes; });
    const text =
        '// Paste these into the matching `boxes:` fields in HOTSPOTS (script.js)\n' +
        JSON.stringify(payload, null, 2);

    const done = () => { el.pickerCopy.textContent = 'Copied!'; setTimeout(() => { el.pickerCopy.textContent = 'Copy JSON'; }, 1600); };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
        fallbackCopy(text, done);
    }
}

function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (error) { /* no-op */ }
    document.body.removeChild(ta);
}

const ORIGINAL_BOXES = HOTSPOTS.map(spot => spot.boxes.map(b => ({ ...b })));

function resetPickerBoxes() {
    HOTSPOTS.forEach((spot, i) => { spot.boxes = ORIGINAL_BOXES[i].map(b => ({ ...b })); });
    picker.pending = null;
    el.pickerAssign.disabled = true;
    el.pickerMarquee.hidden = true;
    el.pickerCoords.textContent = 'Reset to the built-in areas.';
    renderHotspots();
    renderPickerGhosts();
    renderPickerList();
    el.hotspotLayer.classList.remove('is-live');
}

// ===== WIRING =====
function bindEvents() {
    el.hotspotLayer.addEventListener('click', handleLayerClick);
    el.options.addEventListener('click', event => {
        const btn = event.target.closest('.option');
        if (btn && !btn.classList.contains('is-locked')) handleOptionClick(btn);
    });
    el.backToVehicle.addEventListener('click', backToExplore);

    el.pickerLayer.addEventListener('pointerdown', onPickerDown);
    el.pickerLayer.addEventListener('pointermove', onPickerMove);
    el.pickerLayer.addEventListener('pointerup', onPickerUp);
    el.pickerLayer.addEventListener('pointercancel', () => { picker.dragging = false; });
    el.pickerAssign.addEventListener('click', assignPendingBox);
    el.pickerCopy.addEventListener('click', copyPickerJson);
    el.pickerReset.addEventListener('click', resetPickerBoxes);
    el.pickerClose.addEventListener('click', closePicker);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    const saved = activityStore?.read();
    if (saved) {
        watchPhotoSize();
        bindEvents();
        restoreProgress(saved);
    } else {
        resetCompletion();      // fresh load -> false
        initInteraction();
    }
});

function renderCompletedState() {
    el.app.classList.add('no-anim');
    watchPhotoSize();
    renderHotspots();
    bindEvents();
    HOTSPOTS.forEach(spot => { state.found.add(spot.id); markFound(spot.id); });
    renderFindings();
    updateProgress(TOTAL, TOTAL);
    enterReviewMode();
    showView('explore');
    if (pickerIsRequested()) openPicker();
}

function initInteraction() {
    watchPhotoSize();
    renderHotspots();
    renderFindings();
    bindEvents();
    updateProgress(0, TOTAL);
    showView('explore');

    if (pickerIsRequested()) {
        openPicker();
    } else {
        staggerIn('#findings .finding', 60);
    }
}

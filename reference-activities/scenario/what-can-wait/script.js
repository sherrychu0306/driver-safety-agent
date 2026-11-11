// ===== STORYLINE VARIABLE CONFIG =====
const STORYLINE_COMPLETE_VAR = 'WhatCanWaitComplete'; // Rename to match your Storyline variable
const STORYLINE_TEST_VAR = 'WhatCanWaitTestMode'; // True bypasses sorting for testing
const LOCAL_TEST_MODE = false; // Set to true only when testing the scenario screen directly

// ===== CONTENT =====
// The two overview lists.
const CAN_WAIT = [
    'A work notification that doesn\u2019t change where you\u2019re going right now.',
    'A missed call you can return at the next stop.',
    'A navigation prompt you\u2019ve already heard, when the turn is still a mile away.',
    'A non-urgent alert, a personal message, or an update sitting for two minutes.',
    'A call from manager requiring a route change to a new work order location.',
    'A prompt to join an upcoming Teams meeting.'
];

const CANT_WAIT = [
    'A navigation reroute caused by traffic that changes your immediate next turn.',
    'A condition ahead that requires your full attention: merging traffic, a school zone.',
    'A loose item shifting or sliding toward the pedals.',
    'Any demand that\u2019s already pulling your eyes off the road.'
];

// The three sorting groups, in the order they appear on screen.
const GROUPS = [
    { id: 'now', label: 'Handle now' },
    { id: 'stop', label: 'Wait for your next stop' },
    { id: 'pull', label: 'Pull over' }
];

// The four demands. `answer` keys into GROUPS.
const DEMANDS = [
    {
        id: 'message',
        name: 'The personal message',
        photo: 'img/scenario-personal-message.jpg',
        audio: 'audio/audio-1.mp3',
        text: 'Your phone displays a personal message from a customer: \u201CWhat time will you be here?\u201D',
        answer: 'stop',
        correct: 'Correct. The message does not affect your drive and can wait until you are safely stopped.',
        incorrect: 'Not quite. The message may feel important, but it does not require an immediate response. Wait until your next safe stop.'
    },
    {
        id: 'reroute',
        name: 'The reroute',
        photo: 'img/scenario-reroute.jpg',
        audio: 'audio/audio-2.mp3',
        text: 'Navigation announces an accident is ahead on your current route and suggests you change routes to arrive in time for your next job.',
        answer: 'now',
        correct: 'Correct. A reroute that changes your next turn can\u2019t wait for a later stop. Follow the spoken prompt and keep your eyes on the road. You don\u2019t need the screen.',
        incorrect: 'Not quite. This reroute changes your next turn, so waiting means missing it. The spoken prompt gives you what you need while you keep driving.'
    },
    {
        id: 'call',
        name: 'The urgent call',
        photo: 'img/scenario-urgent-call.jpg',
        audio: 'audio/audio-3.mp3',
        text: 'Your manager calls with an urgent request. You need to change your route now.',
        answer: 'pull',
        correct: 'Correct. An urgent route change needs your full attention, and you can\u2019t give it while you\u2019re driving. Pull over safely, take the call, then get back on the road.',
        incorrect: 'Not quite. This call can\u2019t wait, and it can\u2019t be handled well while you\u2019re moving either. Pull over safely, handle it, and get back on the road.'
    },
    {
        id: 'alert',
        name: 'The schedule alert',
        photo: 'img/scenario-schedule-alert.jpg',
        audio: 'audio/audio-4.mp3',
        text: 'Your calendar alerts you: \u201CNext appointment in 15 minutes.\u201D You\u2019re about ten minutes behind.',
        answer: 'stop',
        correct: 'Correct. The alert doesn\u2019t change where you\u2019re going right now. Running behind adds pressure but working out how late you\u2019ll be is something to do once you\u2019ve stopped.',
        incorrect: 'Not quite. The alert doesn\u2019t change your route. Calculating how late you\u2019ll be pulls your mind off the road, even if your eyes stay up. It can wait until your next stop.'
    }
];

const TOTAL = DEMANDS.length;
const SORT_ITEMS = [
    ...CAN_WAIT.map((text, index) => ({ id: `wait-${index}`, text, answer: 'wait' })),
    ...CANT_WAIT.map((text, index) => ({ id: `now-${index}`, text, answer: 'now' }))
];
const SORT_TOTAL = SORT_ITEMS.length;
const ADVANCE_DELAY = 500;      // beat before the Next button appears
const COMPLETION_DELAY = 900;   // beat between the last answer and the overlay
const COMPLETION_OVERLAY_DELAY = 5000;

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
const PROGRESS_KEY = `progress_${STORYLINE_COMPLETE_VAR}`;
const activityStore = typeof DriverSafetyState !== 'undefined' ? DriverSafetyState.create('what-can-wait') : null;

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
}

function readProgress() {
    if (activityStore) return activityStore.read();
    const store = getSessionStore();
    if (store && store[PROGRESS_KEY]) return store[PROGRESS_KEY];
    try {
        const saved = sessionStorage.getItem(PROGRESS_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (error) {
        return null;
    }
}

function saveProgress() {
    const progress = {
        mode: el.stageSort && !el.stageSort.hidden ? 'sort' : 'intro',
        view: state.view,
        index: state.index,
        sorted: [...state.sorted],
        answered: [...state.answered.entries()],
        completed: state.completed,
        reviewMode: state.reviewMode,
        reviewStage: state.reviewStage,
        reviewIndex: state.reviewIndex
    };
    if (activityStore) { activityStore.write(progress); return; }
    const store = getSessionStore();
    if (store) store[PROGRESS_KEY] = progress;
    try {
        sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
        // The top-window store is enough when sessionStorage is unavailable.
    }
}

function clearProgress() {
    if (activityStore) { activityStore.clear(); return; }
    const store = getSessionStore();
    if (store) delete store[PROGRESS_KEY];
    try {
        sessionStorage.removeItem(PROGRESS_KEY);
    } catch (error) {
        // Nothing else to clear.
    }
}

// ===== HELPERS =====
function staggerIn(selector, delayMs = 60) {
    document.querySelectorAll(selector).forEach((node, i) => {
        node.classList.add('stagger-in');
        node.style.animationDelay = `${i * delayMs}ms`;

        // Drop the entrance animation once it has played. Left in place its
        // "both" fill keeps holding transform, which overrides :hover/:active
        // and makes a later animation (pop/shake) jump.
        node.addEventListener('animationend', () => {
            node.classList.remove('stagger-in');
            node.style.animationDelay = '';
        }, { once: true });
    });
}

function groupLabel(id) {
    const group = GROUPS.find(g => g.id === id);
    return group ? group.label : '';
}

function updateProgress(done) {
    if (el.progressBar) el.progressBar.style.width = `${(done / TOTAL) * 100}%`;
    if (el.countNum) el.countNum.textContent = String(done);
}

// ===== ACTIVITY STATE =====
const state = {
    index: 0,                 // which demand is on the stage
    answered: new Map(),      // demand id -> the group the learner chose
    locked: false,            // this demand has been answered
    audioReady: false,        // response choices unlock after the scenario audio ends
    audioBlocked: false,      // autoplay was rejected; retry on the next user gesture
    audioAtEnd: false,        // revisited scenarios show a complete, paused audio rail
    audioSeekAllowed: false,  // scrubbing unlocks only when revisiting an answered demand (via Back)
        audioSeeking: false,
    completed: false,
    completionTimer: null,
        overlayTimer: null,
        advanceTimer: null,
        sorted: new Set(),
        pointerItem: null,
        sortingStarted: false,
        reviewMode: false,
        reviewStage: 'sort',
    reviewIndex: 0,
    view: 'intro'
};

const el = {};

function cacheDom() {
    [
        'app', 'headTitle', 'headInstruction',
        'countNum', 'countOf', 'progressBar',
        'stage', 'stageIntro', 'stageSort',
            'listWait', 'listNow', 'sourceBank', 'sortEyebrow', 'sortLead', 'sortCompleteText', 'practiceScenarios',
        'demandEyebrow', 'demandTitle', 'demandText',
            'scenarioPhoto', 'scenarioPhotoImage', 'scenarioPhotoFallback', 'scenarioAudio', 'audioToggle', 'audioProgress', 'audioProgressFill', 'demandFeedback', 'demandFeedbackLabel', 'demandFeedbackText', 'nextDemand', 'groups',
        'panel', 'viewIntro', 'viewList', 'listEyebrow', 'scenarioBack', 'demandList', 'reviewNav', 'reviewBack', 'reviewNext',
        'completionOverlay', 'reviewActivity', 'tryAgain'
    ].forEach(id => { el[id] = document.getElementById(id); });
}

// ===== VIEW SWITCHING =====
function showMode(name) {
    el.app.dataset.mode = name;
    el.panel.dataset.mode = name;
    el.panel.classList.toggle('is-reviewing', state.reviewMode);
    el.stageIntro.hidden = name !== 'intro';
    el.stageSort.hidden = name !== 'sort';
    el.viewIntro.hidden = name !== 'intro';
    el.viewList.hidden = name === 'intro';
    el.scenarioBack.hidden = name !== 'sort';
    if (name === 'sort') el.countOf.textContent = `of ${TOTAL} sorted`;
}

function setHead(title, instruction) {
    el.headTitle.textContent = title;
    el.headInstruction.textContent = instruction;
}

// ===== RENDER: THE TWO OVERVIEW LISTS =====
function renderOverview() {
    el.listWait.innerHTML = '';
    el.listNow.innerHTML = '';
    el.sourceBank.innerHTML = '';
    shuffleItems(SORT_ITEMS).forEach(item => {
        const li = document.createElement('li');
        li.className = 'wait-item is-draggable';
        li.dataset.itemId = item.id;
        li.draggable = true;
        li.tabIndex = 0;
        li.setAttribute('role', 'button');
        li.setAttribute('aria-label', `Draggable item: ${item.text}`);
        li.innerHTML = `<span>${item.text}</span>`;
        el.sourceBank.appendChild(li);
    });
    updateSortProgress(0);
}

function updateSortProgress(done) {
    if (el.progressBar) el.progressBar.style.width = `${(done / SORT_TOTAL) * 100}%`;
    if (el.countNum) el.countNum.textContent = String(done);
    if (el.countOf) el.countOf.textContent = `of ${SORT_TOTAL} dragged`;
    // The secondary count used to read `${done} dragged` and `${SORT_TOTAL - done} not dragged`.
}

function updateReviewProgress() {
    if (state.reviewStage === 'sort') {
        updateSortProgress(state.sorted.size);
        return;
    }
    if (el.progressBar) el.progressBar.style.width = '100%';
    if (el.countNum) el.countNum.textContent = String(TOTAL);
    if (el.countOf) el.countOf.textContent = `of ${TOTAL} sorted`;
}

function findSortItem(id) {
    return SORT_ITEMS.find(item => item.id === id);
}

function shuffleItems(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function clearBucketHighlights() {
    document.querySelectorAll('.wait-card').forEach(card => card.classList.remove('is-over'));
}

function showSortDropTarget(card) {
    clearBucketHighlights();
    card?.classList.add('is-over');
}

function handleColumnDrop(itemId, bucket) {
    const item = findSortItem(itemId);
    if (!item || state.sorted.has(item.id)) return;

    const card = document.querySelector(`.wait-card[data-bucket="${bucket}"]`);
    if (!card) return;
    clearBucketHighlights();

    if (item.answer !== bucket) {
        card.classList.add('is-wrong');
        window.setTimeout(() => card.classList.remove('is-wrong'), 500);
        return;
    }

    const sourceItem = el.sourceBank.querySelector(`[data-item-id="${item.id}"]`);
    if (!sourceItem) return;
    sourceItem.classList.remove('is-dragging');
    sourceItem.classList.remove('is-draggable');
    sourceItem.draggable = false;
    sourceItem.tabIndex = -1;
    sourceItem.setAttribute('aria-label', `${item.text}. Sorted correctly.`);
    (bucket === 'wait' ? el.listWait : el.listNow).appendChild(sourceItem);
    state.sorted.add(item.id);
    updateSortProgress(state.sorted.size);
    saveProgress();

    if (state.sorted.size === SORT_TOTAL) {
        window.setTimeout(showCompletion, COMPLETION_DELAY);
    }
}

function bindColumnDragEvents() {
    el.sourceBank.addEventListener('dragstart', event => {
        const item = event.target.closest('.wait-item');
        if (!item) return;
        state.pointerItem = item.dataset.itemId;
        item.classList.add('is-dragging');
        event.dataTransfer?.setData('text/plain', state.pointerItem);
    });
    el.sourceBank.addEventListener('dragend', event => {
        event.target.closest('.wait-item')?.classList.remove('is-dragging');
        clearBucketHighlights();
        state.pointerItem = null;
    });
    el.sourceBank.addEventListener('pointerdown', event => {
        const item = event.target.closest('.wait-item');
        if (!item) return;
        state.pointerItem = item.dataset.itemId;
        item.classList.add('is-dragging');
        item.setPointerCapture?.(event.pointerId);
    });
    el.sourceBank.addEventListener('pointermove', event => {
        if (!state.pointerItem) return;
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.wait-card');
        showSortDropTarget(target);
    });
    el.sourceBank.addEventListener('pointerup', event => {
        if (!state.pointerItem) return;
        const itemId = state.pointerItem;
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.wait-card');
        event.target.closest('.wait-item')?.classList.remove('is-dragging');
        clearBucketHighlights();
        state.pointerItem = null;
        if (target) handleColumnDrop(itemId, target.dataset.bucket);
    });
    document.querySelectorAll('.wait-card').forEach(card => {
        card.addEventListener('dragover', event => {
            event.preventDefault();
            showSortDropTarget(card);
        });
        card.addEventListener('dragleave', () => card.classList.remove('is-over'));
        card.addEventListener('drop', event => {
            event.preventDefault();
            const itemId = event.dataTransfer?.getData('text/plain') || state.pointerItem;
            handleColumnDrop(itemId, card.dataset.bucket);
        });
    });
}

// ===== RENDER: THE PANEL LIST =====
function renderDemandList() {
    el.demandList.innerHTML = '';
    DEMANDS.forEach((demand, i) => {
        const sorted = state.answered.has(demand.id);
        const current = !state.completed && i === state.index;

        const li = document.createElement('li');
        li.className = `demand-item${sorted ? ' is-sorted' : ''}${current ? ' is-current' : ''}`;
        li.dataset.id = demand.id;

        const num = document.createElement('span');
        num.className = 'demand-item__num';
        num.textContent = sorted ? '\u2713' : String(i + 1);

        const body = document.createElement('span');
        body.className = 'demand-item__body';

        const name = document.createElement('span');
        name.className = 'demand-item__name';
        name.textContent = demand.name;
        body.appendChild(name);

        if (sorted) {
            const group = document.createElement('span');
            group.className = 'demand-item__group';
            group.textContent = groupLabel(demand.answer);
            body.appendChild(group);
            li.setAttribute('aria-label', `${demand.name}. ${groupLabel(demand.answer)}.`);
        } else {
            li.setAttribute('aria-label', `${demand.name}. Not yet sorted.`);
        }

        li.append(num, body);
        el.demandList.appendChild(li);
    });
}

// ===== RENDER: THE DEMAND ON THE STAGE =====
function renderGroups() {
    el.groups.innerHTML = '';
    GROUPS.forEach(group => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'group';
        button.disabled = !state.audioReady || state.reviewMode; // review is read-only
        button.dataset.group = group.id;
        button.setAttribute('aria-label', `Choose ${group.label}`);

        const label = document.createElement('span');
        label.className = 'group__label';
        label.textContent = group.label;

        const note = document.createElement('span');
        note.className = 'group__note';
        note.textContent = group.id === 'now' ? 'Keep your attention on the road.' : group.id === 'stop' ? 'Save it for a safe stop.' : 'Move safely off the road first.';

        const mark = document.createElement('span');
        mark.className = 'group__mark';
        mark.setAttribute('aria-hidden', 'true');

        button.append(label, note, mark);
        el.groups.appendChild(button);
    });
}

function showDemand(i, animate = true) {
    const demand = DEMANDS[i];
    const nextDemand = DEMANDS[i + 1];
    if (nextDemand) {
        const preload = new Image();
        preload.src = nextDemand.photo;
        const audioPreload = new Audio();
        audioPreload.preload = 'metadata';
        audioPreload.src = nextDemand.audio;
    }
    if (!demand) return;

    if (state.reviewMode || state.completed) stopScenarioAudio();

    state.index = i;
    state.locked = false;
    state.audioReady = false;

    el.demandEyebrow.textContent = `Demand ${i + 1} of ${TOTAL}`;
    el.demandTitle.textContent = demand.name;
    el.demandText.textContent = demand.text;
    el.scenarioPhotoImage.hidden = true;
    el.scenarioPhotoFallback.hidden = false;
    el.scenarioPhotoImage.onload = () => {
        el.scenarioPhotoImage.hidden = false;
        el.scenarioPhotoFallback.hidden = true;
    };
    el.scenarioPhotoImage.onerror = () => {
        el.scenarioPhotoImage.hidden = true;
        el.scenarioPhotoFallback.hidden = false;
    };
    el.scenarioPhotoImage.src = demand.photo;
    el.scenarioPhotoImage.alt = `${demand.name} scenario photo`;
    el.scenarioPhoto.setAttribute('aria-label', `Scenario photo placeholder for ${demand.name}, 16 by 9 ratio`);

    el.demandFeedback.className = 'demand-feedback';
    el.demandFeedbackLabel.textContent = '';
    el.demandFeedbackText.textContent = '';
    el.nextDemand.hidden = true;
    el.nextDemand.textContent = i === TOTAL - 1 ? 'See final message' : 'Next demand';
    el.scenarioBack.textContent = 'Back';
    // In review, the review bar's Back/Next drive navigation; hide the scenario Back.
    el.scenarioBack.hidden = state.reviewMode;
    el.audioToggle.disabled = true;
    updateAudioProgress(0);
    setAudioSeekability(false);
    updateAudioToggle();

    if (state.reviewMode) state.audioReady = true;
    renderGroups();
    renderDemandList();
    const revisiting = state.answered.has(demand.id);
    if (!state.reviewMode && !state.completed) playScenarioAudio(demand, { atEnd: revisiting });
    // An answered scenario reached by Back OR Next shows its saved answer and Next button.
    if (!state.reviewMode && revisiting) restoreScenarioAnswer();
    if (animate) staggerIn('#groups .group', 60);
}

function setResponseAvailability(available) {
    state.audioReady = available;
    el.groups.querySelectorAll('.group').forEach(button => {
        button.disabled = !available || state.locked || state.reviewMode;
    });
}

function finishScenarioAudio() {
    updateAudioProgress(100);
    setResponseAvailability(true);
    updateAudioToggle(true);
}

function updateAudioProgress(value) {
    if (!el.audioProgress || !el.audioProgressFill) return;

    let progress = value;
    if (progress === undefined) {
        const duration = el.scenarioAudio?.duration;
        progress = Number.isFinite(duration) && duration > 0
            ? (el.scenarioAudio.currentTime / duration) * 100
            : 0;
    }

    progress = Math.max(0, Math.min(100, progress));
    el.audioProgressFill.style.width = `${progress}%`;
    el.audioProgress.setAttribute('aria-valuenow', String(Math.round(progress)));
}

function setAudioSeekability(enabled) {
    el.audioProgress.classList.toggle('is-seekable', enabled);
    el.audioProgress.setAttribute('aria-disabled', String(!enabled));
}

function updateAudioToggle(ended = false) {
    if (!el.audioToggle || !el.scenarioAudio) return;
    const isEnded = ended || el.scenarioAudio.ended;
    el.audioToggle.classList.toggle('is-paused', el.scenarioAudio.paused && !isEnded);
    el.audioToggle.classList.toggle('is-ended', isEnded);
    el.audioToggle.setAttribute('aria-label', isEnded
        ? 'Replay scenario audio'
        : el.scenarioAudio.paused ? 'Play scenario audio' : 'Pause scenario audio');
}

function seekAudioFromPointer(event) {
    const audio = el.scenarioAudio;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const bounds = el.audioProgress.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    audio.currentTime = ratio * audio.duration;
    updateAudioProgress(ratio * 100);
}

function startAudioSeek(event) {
    if (el.audioProgress.getAttribute('aria-disabled') === 'true') return;
    event.preventDefault();
    state.audioSeeking = true;
    el.audioProgress.classList.add('is-dragging');
    el.audioProgress.setPointerCapture?.(event.pointerId);
    seekAudioFromPointer(event);
}

function continueAudioSeek(event) {
    if (state.audioSeeking) seekAudioFromPointer(event);
}

function endAudioSeek() {
    state.audioSeeking = false;
    el.audioProgress.classList.remove('is-dragging');
}

function handleAudioKeydown(event) {
    if (!state.audioSeekAllowed) return;
    const audio = el.scenarioAudio;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const step = Math.min(5, audio.duration / 20);
    if (event.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - step);
    else if (event.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
    else if (event.key === 'Home') audio.currentTime = 0;
    else if (event.key === 'End') audio.currentTime = audio.duration;
    else return;
    event.preventDefault();
    updateAudioProgress();
}

function toggleScenarioAudio() {
    const audio = el.scenarioAudio;
    if (!audio?.src) return;
    if (state.audioAtEnd || audio.ended) {
        audio.currentTime = 0;
        updateAudioProgress(0);
        state.audioAtEnd = false;
    }
    const playAttempt = audio.paused ? audio.play() : (audio.pause(), null);
    updateAudioToggle();
    if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(() => {
            state.audioBlocked = true;
            updateAudioToggle();
        });
    }
}

function playScenarioAudio(demand, options = {}) {
    const audio = el.scenarioAudio;
    const atEnd = options.atEnd === true;
    state.audioBlocked = false;
    state.audioAtEnd = atEnd;
    audio.pause();
    audio.currentTime = 0;
    audio.autoplay = !atEnd;
    audio.src = demand.audio;
    audio.onended = finishScenarioAudio;
    // First attempt: no scrubbing. Revisits (reached via Back) can drag the rail.
    state.audioSeekAllowed = atEnd;
    setAudioSeekability(atEnd);
    el.audioToggle.disabled = false;
    updateAudioProgress(atEnd ? 100 : 0);
    updateAudioToggle(atEnd);

    if (atEnd) return;

    const playAttempt = audio.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(() => {
            state.audioBlocked = true;
        });
    }
}

function resumeBlockedAudio() {
    if (!state.audioBlocked || !el.scenarioAudio) return;
    const playAttempt = el.scenarioAudio.play();
    if (playAttempt && typeof playAttempt.then === 'function') {
        playAttempt.then(() => {
            state.audioBlocked = false;
            updateAudioToggle();
        }).catch(() => {});
    }
}

function stopScenarioAudio() {
    const audio = el.scenarioAudio;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.onended = null;
    audio.autoplay = false;
    audio.removeAttribute('src');
    state.audioReady = false;
    state.audioBlocked = false;
    state.audioAtEnd = false;
    state.audioSeeking = false;
    state.audioSeekAllowed = false;
    setAudioSeekability(false);
    updateAudioProgress(0);
    el.audioToggle.disabled = true;
    updateAudioToggle();
}

function applyScenarioAnswer(picked) {
    const demand = DEMANDS[state.index];
    if (!demand) return;

    const isRight = picked === demand.answer;
    const pickedGroup = el.groups.querySelector(`[data-group="${picked}"]`);
    const correctGroup = el.groups.querySelector(`[data-group="${demand.answer}"]`);
    state.locked = true;
    setResponseAvailability(false);
    el.groups.querySelectorAll('.group').forEach(group => {
        group.classList.add('is-locked');
        if (group.dataset.group !== picked && group.dataset.group !== demand.answer) group.classList.add('is-dimmed');
    });
    correctGroup?.classList.add('correct');
    if (correctGroup) correctGroup.querySelector('.group__mark').textContent = '\u2713';
    if (!isRight) {
        pickedGroup?.classList.add('incorrect');
        if (pickedGroup) pickedGroup.querySelector('.group__mark').textContent = '\u2715';
    }
    const feedback = isRight ? demand.correct : demand.incorrect;
    el.demandFeedbackLabel.textContent = isRight ? 'Correct' : 'Not quite';
    el.demandFeedbackText.textContent = feedback.replace(/^(Correct|Not quite)\.\s*/i, '');
    el.demandFeedback.className = `demand-feedback has-message ${isRight ? 'is-correct' : 'is-incorrect'}`;
}

function restoreScenarioAnswer() {
    const demand = DEMANDS[state.index];
    const picked = demand && state.answered.get(demand.id);
    if (!picked) return false;

    applyScenarioAnswer(picked);
    el.nextDemand.hidden = false;
    return true;
}

// ===== ANSWERING =====
function handleGroupClick(button) {
    if (state.locked || !state.audioReady) return;
    const demand = DEMANDS[state.index];
    if (!demand) return;

    const picked = button.dataset.group;
    applyScenarioAnswer(picked);

    state.answered.set(demand.id, picked);
    updateProgress(state.answered.size);
    renderDemandList();
    saveProgress();

    if (state.answered.size === TOTAL) {
        el.nextDemand.hidden = false;
        el.nextDemand.focus();
        return;
    }

    state.advanceTimer = setTimeout(() => {
        state.advanceTimer = null;
        el.nextDemand.hidden = false;
        el.nextDemand.focus();
    }, ADVANCE_DELAY);
}

function nextDemand() {
    if (state.index >= TOTAL - 1) {
        showScenarioCompletion();
        return;
    }
    showDemand(state.index + 1);
    saveProgress();
}

function backFromScenario() {
    clearTimeout(state.advanceTimer);
    state.advanceTimer = null;
    stopScenarioAudio();

    if (state.index === 0) {
        state.reviewMode = false;
        state.reviewStage = 'sort';
        state.view = 'sort-complete';
        showIntro();
        restoreSortProgress([...state.sorted]);
        showCompletion();
        saveProgress();
        return;
    }

    state.index -= 1;
    state.view = 'scenario';
    showDemand(state.index, false);
    restoreScenarioAnswer();
    saveProgress();
}

// ===== COMPLETION =====
function showCompletion() {
    state.completed = true;
    state.view = 'sort-complete';
    stopScenarioAudio();
    renderDemandList();
    el.sourceBank.hidden = true;
    el.sortEyebrow.textContent = 'Sorting complete';
    el.sortLead.textContent = 'All demands sorted';
    el.sortLead.classList.add('sort-lead--complete');
    el.sortCompleteText.hidden = false;
    el.practiceScenarios.hidden = false;
    el.practiceScenarios.textContent = 'Practice the scenarios';
    saveProgress();
}

function showScenarioCompletion() {
    state.completed = true;
    state.view = 'scenario-complete';
    stopScenarioAudio();
    reportCompletion();
    renderDemandList();
    el.completionOverlay.hidden = false;
    el.completionOverlay.classList.add('active');
    saveProgress();
}

function showCompletedSortForTesting() {
    SORT_ITEMS.forEach(item => {
        const sourceItem = el.sourceBank.querySelector(`[data-item-id="${item.id}"]`);
        if (!sourceItem) return;
        sourceItem.classList.remove('is-dragging', 'is-draggable');
        sourceItem.draggable = false;
        sourceItem.tabIndex = -1;
        (item.answer === 'wait' ? el.listWait : el.listNow).appendChild(sourceItem);
        state.sorted.add(item.id);
    });
    updateSortProgress(SORT_TOTAL);
    showCompletion();
}

function closeCompletionLayer() {
    el.completionOverlay.classList.remove('active');
    el.completionOverlay.hidden = true;
}

function showReviewSort() {
    closeCompletionLayer();
    state.reviewMode = true;
    state.reviewStage = 'sort';
    state.reviewIndex = 0;
    state.view = 'review-sort';
    setHead('Review the card sorting', 'These are the choices you made in the two columns.');
    showMode('intro');
    restoreSortProgress([...state.sorted]);
    el.sourceBank.hidden = true;
    el.sortEyebrow.textContent = 'Reviewing card sorting';
    el.sortLead.textContent = 'Review the two response-priority columns.';
    el.sortLead.classList.remove('sort-lead--complete');
    el.sortEyebrow.textContent = 'Sorting complete';
    el.sortLead.textContent = 'All demands sorted';
    el.sortLead.classList.add('sort-lead--complete');
    el.sortCompleteText.hidden = false;
    el.practiceScenarios.hidden = false;
    el.practiceScenarios.textContent = 'Review the scenarios';
    el.reviewNav.hidden = true;
    updateReviewProgress();
    saveProgress();
}

function showReviewScenario(index) {
    closeCompletionLayer();
    state.reviewMode = true;
    state.reviewStage = 'scenario';
    state.reviewIndex = index;
    state.view = 'review-scenario';
    setHead('Review your scenario choices', 'Move backward and forward through the four scenarios.');
    showMode('sort');
    el.listEyebrow.textContent = 'Scenario review';
    el.reviewNav.hidden = false;
    el.reviewBack.disabled = false;
    el.reviewNext.disabled = false;
    el.reviewNext.textContent = index === TOTAL - 1 ? 'Done reviewing' : 'Next scenario';

    showDemand(index, false);
    const demand = DEMANDS[index];
    const picked = state.answered.get(demand.id);
    const pickedGroup = el.groups.querySelector(`[data-group="${picked}"]`);
    const correctGroup = el.groups.querySelector(`[data-group="${demand.answer}"]`);
    el.groups.querySelectorAll('.group').forEach(group => {
        group.classList.add('is-locked');
        if (group.dataset.group !== picked && group.dataset.group !== demand.answer) group.classList.add('is-dimmed');
    });
    correctGroup?.classList.add('correct');
    if (correctGroup) correctGroup.querySelector('.group__mark').textContent = '\u2713';
    if (picked && picked !== demand.answer) {
        pickedGroup?.classList.add('incorrect');
        if (pickedGroup) pickedGroup.querySelector('.group__mark').textContent = '\u2715';
    }
    const isRight = picked === demand.answer;
    const feedback = isRight ? demand.correct : demand.incorrect;
    el.demandFeedbackLabel.textContent = isRight ? 'Correct' : 'Not quite';
    el.demandFeedbackText.textContent = feedback.replace(/^(Correct|Not quite)\.\s*/i, '');
    el.demandFeedback.className = `demand-feedback has-message ${isRight ? 'is-correct' : 'is-incorrect'}`;
    updateReviewProgress();
    saveProgress();
}

function reviewNext() {
    if (state.reviewStage === 'sort') {
        showReviewScenario(0);
    } else if (state.reviewIndex < TOTAL - 1) {
        showReviewScenario(state.reviewIndex + 1);
    } else {
        state.reviewMode = false;
        showScenarioCompletion();
    }
}

function reviewBack() {
    if (state.reviewStage === 'scenario' && state.reviewIndex > 0) {
        showReviewScenario(state.reviewIndex - 1);
    } else if (state.reviewStage === 'scenario') {
        showReviewSort();
    }
}

function tryAgain() {
    closeCompletionLayer();
    state.reviewMode = false;
    state.reviewStage = 'sort';
    state.reviewIndex = 0;
    state.view = 'intro';
    state.answered.clear();
    state.sorted.clear();
    state.completed = false;
    state.locked = false;
    renderOverview();
    el.sourceBank.hidden = false;
    el.sortEyebrow.textContent = 'Drag to sort';
    el.sortLead.textContent = 'Drag each demand from the tray into the column that best describes it.';
    el.sortLead.classList.remove('sort-lead--complete');
    el.sortCompleteText.hidden = true;
    el.practiceScenarios.hidden = true;
    el.practiceScenarios.textContent = 'Practice the scenarios';
    el.reviewNav.hidden = true;
    // Do NOT reset the Storyline completion variable or the revisit flag here:
    // Try Again replays the interaction but completion stays earned.
    clearProgress();
    showIntro();
    saveProgress();
}

function startRapidScenarios() {
    if (state.overlayTimer !== null) {
        clearTimeout(state.overlayTimer);
        state.overlayTimer = null;
    }
    el.completionOverlay.classList.remove('active');
    // Keep earlier answers: returning to sorting and coming back must not erase them.
    // Try Again is the only path that clears answers.
    state.completed = false;
    state.view = 'scenario';
    updateProgress(state.answered.size);
    el.countOf.textContent = `of ${TOTAL} sorted`;
    setHead(
        'Four demands reach you while you’re driving',
        'Choose the best response: Handle now, Wait for your next stop, or Pull over.'
    );
    showMode('sort');
    el.listEyebrow.textContent = 'Four demands';
    showDemand(0);
    saveProgress();
}

// ===== VIEWS =====
function showIntro() {
    setHead(
        'Decide what needs your attention.',
        'Drag each situation to the column and choose the best response to the scenarios.'
    );
    showMode('intro');
    staggerIn('.wait-list .wait-item', 50);
}

function restoreSortProgress(sortedIds) {
    state.sorted = new Set(sortedIds.filter(id => findSortItem(id)));
    state.sorted.forEach(id => {
        const item = findSortItem(id);
        const sourceItem = el.sourceBank.querySelector(`[data-item-id="${id}"]`);
        if (!item || !sourceItem) return;
        sourceItem.classList.remove('is-dragging', 'is-draggable');
        sourceItem.draggable = false;
        sourceItem.tabIndex = -1;
        sourceItem.setAttribute('aria-label', `${item.text}. Sorted correctly.`);
        (item.answer === 'wait' ? el.listWait : el.listNow).appendChild(sourceItem);
    });
    updateSortProgress(state.sorted.size);
}

function restoreProgress(saved) {
    state.sorted = new Set();
    state.answered = new Map(Array.isArray(saved.answered) ? saved.answered : []);
    state.index = Math.max(0, Math.min(TOTAL - 1, Number(saved.index) || 0));
    state.completed = saved.completed === true;
    state.reviewMode = saved.reviewMode === true;
    state.reviewStage = saved.reviewStage === 'scenario' ? 'scenario' : 'sort';
    state.reviewIndex = Math.max(0, Math.min(TOTAL - 1, Number(saved.reviewIndex) || 0));
    state.view = saved.view || (state.answered.size ? 'scenario' : (saved.mode === 'sort' ? 'sort-complete' : 'intro'));

    // Put the sorted cards back in their columns first, whatever view is restored,
    // so Back to sorting and the sorting review never show empty columns.
    restoreSortProgress(Array.isArray(saved.sorted) ? saved.sorted : []);

    // Review views first: a learner reviewing is also "completed", and must land
    // back in review rather than on the final message.
    if (state.view === 'review-sort') { showReviewSort(); return; }
    if (state.view === 'review-scenario') { showReviewScenario(state.reviewIndex); return; }
    if (state.view === 'scenario-complete' || (!saved.view && state.completed && state.answered.size === TOTAL)) {
        renderCompletedState();
        return;
    }
    if (state.view === 'sort-complete') {
        showIntro();
        restoreSortProgress(Array.isArray(saved.sorted) ? saved.sorted : []);
        showCompletion();
        return;
    }

    if (saved.view === 'scenario' || saved.view === 'scenario-complete' || (saved.mode === 'sort' && state.answered.size)) {
        setHead(
            'Four demands reach you while you\u2019re driving',
            'Choose the best response: Handle now, Wait for your next stop, or Pull over.'
        );
        showMode('sort');
        el.listEyebrow.textContent = 'Four demands';
        showDemand(state.index, false);
        restoreScenarioAnswer();
        updateProgress(state.answered.size);
        return;
    }

    showIntro();
    restoreSortProgress(Array.isArray(saved.sorted) ? saved.sorted : []);
    if (state.sorted.size === SORT_TOTAL) showCompletion();
}

// ===== WIRING =====
function bindEvents() {
    el.nextDemand.addEventListener('click', nextDemand);
    el.scenarioBack.addEventListener('click', backFromScenario);
    el.reviewActivity.addEventListener('click', showReviewSort);
    el.tryAgain.addEventListener('click', tryAgain);
    el.reviewBack.addEventListener('click', reviewBack);
    el.reviewNext.addEventListener('click', reviewNext);
    document.addEventListener('pointerdown', resumeBlockedAudio, true);
    el.practiceScenarios.addEventListener('click', () => {
        if (state.reviewMode && state.reviewStage === 'sort') showReviewScenario(0);
        else startRapidScenarios();
    });
    bindColumnDragEvents();
    el.groups.addEventListener('click', event => {
        const button = event.target.closest('.group');
        if (button && !button.classList.contains('is-locked')) handleGroupClick(button);
    });
    el.audioToggle.addEventListener('click', toggleScenarioAudio);
    el.audioProgress.addEventListener('pointerdown', startAudioSeek);
    el.audioProgress.addEventListener('pointermove', continueAudioSeek);
    el.audioProgress.addEventListener('pointerup', endAudioSeek);
    el.audioProgress.addEventListener('pointercancel', endAudioSeek);
    el.audioProgress.addEventListener('keydown', handleAudioKeydown);
    el.scenarioAudio.addEventListener('timeupdate', () => updateAudioProgress());
    el.scenarioAudio.addEventListener('loadedmetadata', () => {
        setAudioSeekability(state.audioSeekAllowed);
        updateAudioProgress();
    });
    el.scenarioAudio.addEventListener('durationchange', () => updateAudioProgress());
    el.scenarioAudio.addEventListener('play', () => updateAudioToggle());
    el.scenarioAudio.addEventListener('pause', () => updateAudioToggle());
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    renderOverview();
    bindEvents();
    const savedProgress = readProgress();
    if (savedProgress) {
        restoreProgress(savedProgress);
    } else if (isRevisit()) {
        reportCompletion();     // revisit -> true
        renderCompletedState();
    } else if (LOCAL_TEST_MODE || getStorylineVariable(STORYLINE_TEST_VAR) === true || getStorylineVariable(STORYLINE_TEST_VAR) === 'true') {
        startRapidScenarios();
    } else {
        resetCompletion();      // fresh load -> false
        initInteraction();
        saveProgress();
    }
});

document.addEventListener('keydown', event => {
    if (event.key.toLowerCase() !== 'n' || event.target.matches('input, textarea, select, button')) return;
    if (!el.sourceBank || el.sourceBank.hidden || state.completed) return;
    showCompletedSortForTesting();
});

// A revisit opens on the scenario view with the completion overlay visible.
function renderCompletedState() {
    el.app.classList.add('no-anim');
    stopScenarioAudio();
    // Keep the learner's real picks; only fill gaps (e.g. a revisit with no saved progress).
    DEMANDS.forEach(demand => {
        if (!state.answered.has(demand.id)) state.answered.set(demand.id, demand.answer);
    });
    state.completed = true;
    state.view = 'scenario-complete';
    state.index = TOTAL - 1;
    // Restore the sort columns before setting the header, or the header reads "10 of 10 dragged".
    restoreSortProgress(SORT_ITEMS.map(item => item.id));
    updateProgress(TOTAL);
    setHead(
        'Four demands reach you while you\u2019re driving',
        'Choose the best response: Handle now, Wait for your next stop, or Pull over.'
    );
    showMode('sort');
    el.listEyebrow.textContent = 'Four demands';
    showDemand(state.index, false);
    el.completionOverlay.hidden = false;
    el.completionOverlay.classList.add('active');
}

function initInteraction() {
    updateProgress(0);
    showIntro();
}

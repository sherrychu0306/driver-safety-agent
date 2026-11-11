// ===== STORYLINE VARIABLE CONFIG =====
const STORYLINE_COMPLETE_VAR = 'DriveComplete'; // Change this to match your Storyline variable name
const VIDEO_FINISHED_VAR = 'VideoFinished'; // Storyline true/false variable

// ===== TESTING TOGGLE =====
// true  = skip the video on load and go straight to the question (for testing)
// false = normal behavior: learner must watch the clip to the end
const VIDEO_FINISHED = false;

// ===== CLIP CONFIG =====
// The real clip always runs to its natural end; the question appears after it.
const SIM_BUZZ_MS = 3800;       // fallback scene: when the phone buzzes
const SIM_FREEZE_MS = 6000;     // fallback scene: when the scene freezes
const VIDEO_WAIT_MS = 1200;     // how long to wait for the clip before using the fallback scene
const ENABLE_SKIP_TO_END = true; // authoring shortcut: press N to finish the clip

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
const activityStore = typeof DriverSafetyState !== 'undefined' ? DriverSafetyState.create('phone-notification-v2') : null;

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
        selected: state.selected,
        answered: state.answered,
        frozen: state.frozen,
        order: state.order,
        phase: el.app?.dataset.phase || 'watch'
    });
}

function restoreProgress(saved) {
    state.selected = saved.selected || null;
    state.answered = Boolean(saved.answered);
    if (Array.isArray(saved.order)) applyOptionOrder(saved.order); // same answer order as before leaving

    // Completed (learner clicked See Final Message): back on the completion layer.
    if (saved.phase === 'takeaway') {
        renderCompletedState();
        return;
    }
    // Answered but not completed: back on the answered question, See Final Message still required.
    if (saved.answered) {
        showFinishedClip();
        showQuestionPanel();
        restoreAnsweredState();
        el.takeawayBtn.hidden = false;
        return;
    }
    // Clip finished but not answered: back on the open question.
    if (saved.frozen) {
        showFinishedClip();
        showQuestionPanel();
        showFeedback('', '');
        setOptionAvailability(true);
        return;
    }
    initInteraction();
}

// Puts the stage in its "clip watched" state: last frame, full progress bar, Play locked.
function showFinishedClip() {
    state.frozen = true;
    setStorylineVariable(VIDEO_FINISHED_VAR, true);
    el.stage.classList.remove('is-playing', 'is-paused', 'is-buzzing');
    el.stage.classList.add('is-frozen');
    el.playBtn.disabled = true;
    setVideoSeekability(false);
    seekClipToEnd();
    updateVideoProgress(100);
    updateStageCaption();
}

function seekClipToEnd() {
    const toEnd = () => {
        const end = el.clip.duration;
        if (Number.isFinite(end) && end > 0) el.clip.currentTime = end;
        updateVideoProgress(100);
    };
    el.clip.pause();
    if (el.clip.readyState >= 1) toEnd();
    else el.clip.addEventListener('loadedmetadata', toEnd, { once: true });
}

function showQuestionPanel() {
    el.app.dataset.screen = 'beat';
    el.app.dataset.phase = 'reflect';
    el.screenBeat.hidden = false;
    el.setupPanel.hidden = true;
    el.reflectPanel.hidden = false;
}

function updateStageCaption() {
    if (!state.frozen) return;
    el.stageCap.textContent = el.stage.classList.contains('has-video')
        ? 'Click to watch the clip again.'
        : 'Frozen at the buzz.';
}

function showCompletion() {
    const overlay = document.querySelector('.completion-overlay');
    if (overlay) overlay.classList.add('active');
    reportCompletion();
}

// ===== ENTRANCE ANIMATION HELPER =====
function staggerIn(selector, delayMs = 60) {
    const items = document.querySelectorAll(selector);
    items.forEach((el, i) => {
        el.classList.add('stagger-in');
        el.style.animationDelay = `${i * delayMs}ms`;
    });
}

// ===== FEEDBACK HELPER =====
const COPY = {
    correct: 'Correct. Check your phone only when stationary and in park.',
    incorrect: 'Not the safest choice. If the vehicle is moving, keep your attention on the road. Wait until you’re ' +
        'stopped and in park.'
};

function showFeedback(type, text) {
    const el = document.getElementById('feedback');
    if (!el) return;
    const textEl = document.getElementById('feedbackText');
    if (textEl) textEl.textContent = text || '';
    else el.textContent = text || '';
    el.className = `feedback ${text ? 'has-message ' : ''}${type === 'correct' ? 'success' : type === 'incorrect' ? 'error' : ''}`;
}

// ===== ELEMENTS & STATE =====
const CORRECT_KEY = 'B';

const el = {};
const state = {
    selected: null,
    answered: false,
    frozen: false,
    replaying: false,
    order: null,       // shuffled answer order, saved so it survives slide navigation
    seekable: false,
    seeking: false,
    timers: []
};

function cacheElements() {
    el.app = document.getElementById('app');
    el.screenBeat = document.getElementById('screenBeat1');
    el.stage = document.getElementById('stage');
    el.clip = document.getElementById('clip');
    el.playBtn = document.getElementById('playBtn');
    el.replayBtn = document.getElementById('replayBtn');
    el.expandBtn = document.getElementById('expandBtn');
    el.stageFrame = el.stage.querySelector('.stage__frame');
    el.stageProgress = document.getElementById('stageProgress');
    el.stageProgressFill = document.getElementById('stageProgressFill');
    el.stageCap = document.getElementById('stageCap');
    el.setupPanel = document.getElementById('setupPanel');
    el.reflectPanel = document.getElementById('reflectPanel');
    el.options = Array.from(document.querySelectorAll('.option'));
    el.optionContents = el.options.map((option) => ({
        text: option.querySelector('.option__text').textContent,
        correct: option.dataset.key === CORRECT_KEY
    }));
    el.options.forEach((option, index) => {
        option.dataset.correct = String(el.optionContents[index].correct);
    });
    el.overlayDismiss = document.getElementById('overlayDismiss');
    el.completionOverlay = document.getElementById('completionOverlay');
    el.takeawayBtn = document.getElementById('takeawayBtn');
}

function clearTimers() {
    state.timers.forEach(clearTimeout);
    state.timers = [];
}

function later(fn, ms) {
    state.timers.push(setTimeout(fn, ms));
}

// ===== THE CLIP =====
function updateVideoProgress(value) {
    if (!el.stageProgress || !el.stageProgressFill) return;

    let progress = value;
    if (progress === undefined) {
        const duration = el.clip?.duration;
        progress = Number.isFinite(duration) && duration > 0
            ? (el.clip.currentTime / duration) * 100
            : 0;
    }

    progress = Math.max(0, Math.min(100, progress));
    el.stageProgressFill.style.width = `${progress}%`;
    el.stageProgress.setAttribute('aria-valuenow', String(Math.round(progress)));
}

function setVideoSeekability(enabled) {
    state.seekable = enabled;
    el.stageProgress.classList.toggle('is-seekable', enabled);
    el.stageProgress.setAttribute('aria-disabled', String(!enabled));
    el.stageProgress.tabIndex = enabled ? 0 : -1;
}

function seekVideoFromPointer(event) {
    if (!state.seekable || !el.clip || !Number.isFinite(el.clip.duration) || el.clip.duration <= 0) return;
    const bounds = el.stageProgress.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    el.clip.currentTime = ratio * el.clip.duration;
    updateVideoProgress(ratio * 100);
}

function startVideoSeek(event) {
    if (!state.seekable) return;
    event.preventDefault();
    state.seeking = true;
    el.stageProgress.classList.add('is-dragging');
    el.stageProgress.setPointerCapture?.(event.pointerId);
    seekVideoFromPointer(event);
}

function continueVideoSeek(event) {
    if (state.seeking) seekVideoFromPointer(event);
}

function endVideoSeek() {
    state.seeking = false;
    el.stageProgress.classList.remove('is-dragging');
}

function toggleVideoPlayback() {
    if (state.frozen || !el.stage.classList.contains('has-video')) return;

    if (el.clip.paused) {
        el.clip.play();
        el.stage.classList.remove('is-paused');
        el.stage.classList.add('is-playing');
        el.stageCap.textContent = 'Watch what happens.';
    } else {
        el.clip.pause();
        el.stage.classList.remove('is-playing');
        el.stage.classList.add('is-paused');
        el.stageCap.textContent = 'Paused. Click the video to resume.';
    }
}

function handleClipClick() {
    if (!state.frozen && el.stage.classList.contains('has-video')) {
        toggleVideoPlayback();
        return;
    }
    watchClipAgain();
}

function useVideo() {
    el.stage.classList.add('has-video');
    updateVideoProgress(state.frozen ? 100 : undefined);
    updateStageCaption();
    el.clip.addEventListener('timeupdate', () => updateVideoProgress());
    el.clip.addEventListener('durationchange', () => updateVideoProgress());
    // The clip is never interrupted — it plays through, and only then do we
    // hold on the last frame and move to the question.
    el.clip.addEventListener('ended', () => { if (!state.frozen) freeze(); });
}

function playClip() {
    if (state.frozen) return;
    el.stage.classList.remove('is-paused');
    el.stage.classList.add('is-playing');
    el.playBtn.disabled = true;
    el.stageCap.textContent = 'Watch what happens.';

    if (el.stage.classList.contains('has-video')) {
        el.clip.play();
        return;
    }

    // Fallback scene: scripted timeline
    later(() => el.stage.classList.add('is-buzzing'), SIM_BUZZ_MS);
    later(freeze, SIM_FREEZE_MS);
}

function watchClipAgain() {
    if (el.app.dataset.phase !== 'reflect' || !el.stage.classList.contains('has-video') ||
        el.stage.classList.contains('is-playing')) return;

    clearTimers();
    state.frozen = false;
    state.replaying = true;
    setVideoSeekability(true);
    el.stage.classList.remove('is-frozen', 'is-playing', 'is-paused');
    el.clip.pause();
    el.clip.currentTime = 0;
    updateVideoProgress(0);
    collapseStage();
    expandStage();
    playClip();
}

// Authoring shortcut: press N to jump straight to the end of the clip so the
// question appears immediately, instead of sitting through the whole drive.
function skipToEnd() {
    if (state.frozen || el.app.dataset.phase !== 'watch') return;
    if (el.stage.classList.contains('has-video')) {
        const end = el.clip.duration;
        if (Number.isFinite(end) && end > 0) el.clip.currentTime = end;
    }
    freeze();
}

// ===== FULL SCREEN =====
function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function isExpanded() {
    return fullscreenElement() === el.stageFrame || el.stage.classList.contains('is-inline-expanded');
}

function syncExpandButton() {
    const expanded = isExpanded();
    el.stage.classList.toggle('is-expanded', expanded);
    el.expandBtn.setAttribute('aria-label', expanded
        ? 'Exit full screen'
        : 'Expand the clip to full screen');
}

function collapseStage() {
    const fsEl = fullscreenElement();
    if (fsEl) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) Promise.resolve(exit.call(document)).catch(() => {});
    }
    el.stage.classList.remove('is-inline-expanded');
    syncExpandButton();
}

function expandStage() {
    const request = el.stageFrame.requestFullscreen || el.stageFrame.webkitRequestFullscreen;
    if (request) {
        // Storyline embeds the object in an iframe that may lack `allowfullscreen`,
        // in which case the request is rejected — fall back to filling the object.
        Promise.resolve(request.call(el.stageFrame))
            .then(syncExpandButton)
            .catch(() => {
                el.stage.classList.add('is-inline-expanded');
                syncExpandButton();
            });
        return;
    }
    el.stage.classList.add('is-inline-expanded');
    syncExpandButton();
}

function toggleExpand() {
    if (isExpanded()) collapseStage();
    else expandStage();
}

function freeze() {
    if (state.frozen) return;
    state.frozen = true;
    setStorylineVariable(VIDEO_FINISHED_VAR, true);
    saveProgress();
    clearTimers();
    updateVideoProgress(100);
    collapseStage(); // drop out of full screen so the question is visible
        if (el.stage.classList.contains('has-video')) el.clip.pause();
        el.stage.classList.remove('is-playing', 'is-paused');
        el.stage.classList.add('is-frozen');
        el.playBtn.disabled = true;
    setTimeout(enterReflect, 700);
}

// ===== PHASE 2: THE DECISION =====
function enterReflect() {
    el.app.dataset.phase = 'reflect';
    el.setupPanel.hidden = true;
    el.reflectPanel.hidden = false;
    const hasVideo = el.stage.classList.contains('has-video');
    el.stageCap.textContent = hasVideo ? 'Click to watch the clip again.' : 'Frozen at the buzz.';

    if (state.replaying) {
        state.replaying = false;
        setOptionAvailability(!state.answered);
        return;
    }

    shuffleOptionContent();
    saveProgress(); // remember this order in case the learner leaves the slide
    showFeedback('', '');
    setOptionAvailability(true);
    staggerIn('.option', 60);
}

function setOptionAvailability(enabled) {
    el.options.forEach((option) => {
        option.disabled = !enabled;
        option.setAttribute('aria-disabled', String(!enabled));
    });
}

function shuffleOptionContent() {
    const order = el.optionContents.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    applyOptionOrder(order);
}

// order[n] = which original answer sits in slot n (A, B, C, D)
function applyOptionOrder(order) {
    const valid = order.length === el.options.length &&
        order.every((i) => Number.isInteger(i) && el.optionContents[i]);
    if (!valid) return;
    state.order = order.slice();
    el.options.forEach((option, index) => {
        const content = el.optionContents[order[index]];
        option.querySelector('.option__text').textContent = content.text;
        option.dataset.correct = String(content.correct);
    });
}

function selectOption(button) {
    if (state.answered || button.disabled || button.classList.contains('is-locked')) return;
    state.selected = button.dataset.key;
    saveProgress();
    el.options.forEach((opt) => {
        const isThis = opt === button;
        opt.classList.toggle('is-selected', isThis);
        opt.setAttribute('aria-checked', isThis ? 'true' : 'false');
    });
    revealAnswer(button);
}

function revealAnswer(button) {
    if (state.answered) return;

    if (button.dataset.correct === 'true') {
        markCorrect(button);
        showFeedback('correct', COPY.correct);
        finishQuestion();
        return;
    }

    // Wrong: mark the choice, reveal the right answer straight away, and move on.
    button.classList.remove('is-selected');
    button.classList.add('incorrect');
    button.querySelector('.option__mark').textContent = '\u2715';
    button.setAttribute('aria-checked', 'false');
        markCorrect(el.options.find((o) => o.dataset.correct === 'true'));
    showFeedback('incorrect', COPY.incorrect);
    finishQuestion();
}

function markCorrect(button) {
    button.classList.remove('incorrect', 'is-dimmed');
    button.classList.add('correct', 'is-selected');
    button.setAttribute('aria-checked', 'true');
    button.querySelector('.option__mark').textContent = '\u2713';
}

function finishQuestion() {
    state.answered = true;
    saveProgress();
    el.options.forEach((opt) => {
        opt.classList.add('is-locked');
        if (!opt.classList.contains('correct')) opt.classList.add('is-dimmed');
    });
    el.takeawayBtn.hidden = false;
    el.takeawayBtn.focus();
}

// ===== PHASE 3: TAKEAWAY =====
function enterTakeaway() {
    el.app.dataset.phase = 'takeaway';
    el.reflectPanel.hidden = true;
    showFeedback('', '');
    showCompletion();
}

function reviewQuestion() {
    clearTimers();
    el.completionOverlay.classList.remove('active');
    state.frozen = true;
    state.replaying = false;
    state.seeking = false;
    setStorylineVariable(VIDEO_FINISHED_VAR, true);

    if (el.stage.classList.contains('has-video')) {
        el.clip.pause();
        const end = el.clip.duration;
        if (Number.isFinite(end) && end > 0) el.clip.currentTime = end;
    }
    setVideoSeekability(false);
    updateVideoProgress(100);

    el.app.dataset.phase = 'reflect';
    el.setupPanel.hidden = true;
    el.reflectPanel.hidden = false;
    el.stage.classList.remove('is-playing', 'is-paused', 'is-buzzing');
    el.stage.classList.add('is-frozen');
    setOptionAvailability(true);
    el.stageCap.textContent = el.stage.classList.contains('has-video')
        ? 'Click to watch the clip again.'
        : 'Frozen at the buzz.';
    restoreAnsweredState();
    el.takeawayBtn.hidden = false;
}

function restoreAnsweredState() {
    const selected = el.options.find((option) => option.dataset.key === state.selected);
    const correct = el.options.find((option) => option.dataset.correct === 'true');

    if (selected && selected.dataset.correct !== 'true') {
        selected.classList.add('incorrect');
        selected.querySelector('.option__mark').textContent = '\u2715';
        selected.setAttribute('aria-checked', 'false');
        markCorrect(correct);
        showFeedback('incorrect', COPY.incorrect);
    } else if (selected) {
        markCorrect(selected);
        showFeedback('correct', COPY.correct);
    }

    el.options.forEach((option) => {
        option.classList.add('is-locked');
        if (!option.classList.contains('correct')) option.classList.add('is-dimmed');
    });
    setOptionAvailability(false);
}

function restart() {
    clearTimers();
    el.app.classList.remove('no-anim');
    el.completionOverlay.classList.remove('active');
    el.takeawayBtn.hidden = true;

    state.selected = null;
    state.answered = false;
    state.frozen = false;
    state.replaying = false;
    state.order = null;
    setStorylineVariable(VIDEO_FINISHED_VAR, false);
    activityStore?.clear();

    collapseStage();
    el.stage.classList.remove('is-frozen', 'is-playing', 'is-paused', 'is-buzzing');
    setVideoSeekability(false);
    el.playBtn.disabled = false;
    el.stageCap.textContent = 'Traffic is moving. Watch what happens.';
    if (el.stage.classList.contains('has-video')) {
        el.clip.pause();
        el.clip.currentTime = 0;
    }
    updateVideoProgress(0);

    el.options.forEach((opt) => {
        opt.classList.remove('is-selected', 'is-locked', 'is-dimmed', 'correct', 'incorrect');
        opt.disabled = false;
        opt.setAttribute('aria-checked', 'false');
        opt.removeAttribute('aria-disabled');
        opt.querySelector('.option__mark').textContent = '';
    });

    showFeedback('', '');

    el.setupPanel.hidden = false;
    el.reflectPanel.hidden = true;
    el.screenBeat.hidden = false;
    el.app.dataset.phase = 'watch';
    el.app.dataset.screen = 'beat';
    el.playBtn.focus();
}

// ===== KEYBOARD SUPPORT FOR THE OPTION GROUP =====
function handleOptionKeys(event) {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const live = el.options.filter((o) => !o.disabled && !o.classList.contains('is-locked'));
    if (!live.length) return;
    const current = live.indexOf(document.activeElement);
    const step = (event.key === 'ArrowRight' || event.key === 'ArrowDown') ? 1 : -1;
    const next = live[(Math.max(0, current) + step + live.length) % live.length];
    next.focus();
    selectOption(next);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    bindEvents();
    const saved = activityStore?.read();
    if (saved) {
        restoreProgress(saved);
    } else {
        resetCompletion();       // fresh load -> false
        initInteraction();       // normal start
    }
});

function renderCompletedState() {
    // Revisiting the slide: land on the completion layer, already completed.
    el.app.classList.add('no-anim');
    el.app.dataset.screen = 'beat';
    el.app.dataset.phase = 'takeaway';
    el.screenBeat.hidden = false;
    el.setupPanel.hidden = true;
    el.reflectPanel.hidden = true;

    state.answered = true;
    showFinishedClip();
    restoreAnsweredState(); // the learner's own pick, in the order they saw it
    showCompletion();
}

// Wired on every load, revisit included, so the completion layer can be reviewed.
function bindEvents() {
    // Use the real clip if it loads; otherwise fall back to the drawn cab scene.
    let decided = false;
    const decide = (hasVideo) => {
        if (decided) return;
        decided = true;
        if (hasVideo) useVideo();
        if (VIDEO_FINISHED) skipToEnd(); // testing toggle: jump straight to the question
    };
    el.clip.addEventListener('loadedmetadata', () => decide(true), { once: true });
    el.clip.addEventListener('error', () => decide(false), { once: true });
    setTimeout(() => decide(el.clip.readyState > 0), VIDEO_WAIT_MS);

    el.playBtn.addEventListener('click', playClip);
    el.clip.addEventListener('click', handleClipClick);
    el.replayBtn.addEventListener('click', watchClipAgain);
    el.stageProgress.addEventListener('pointerdown', startVideoSeek);
    el.stageProgress.addEventListener('pointermove', continueVideoSeek);
    el.stageProgress.addEventListener('pointerup', endVideoSeek);
    el.stageProgress.addEventListener('pointercancel', endVideoSeek);
    el.expandBtn.addEventListener('click', toggleExpand);
    document.addEventListener('fullscreenchange', syncExpandButton);
    document.addEventListener('webkitfullscreenchange', syncExpandButton);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && el.stage.classList.contains('is-inline-expanded')) collapseStage();
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (ENABLE_SKIP_TO_END && (event.key === 'n' || event.key === 'N')) skipToEnd();
    });
    el.overlayDismiss.addEventListener('click', reviewQuestion);
    el.takeawayBtn.addEventListener('click', enterTakeaway);

    el.options.forEach((opt) => {
        opt.addEventListener('click', () => selectOption(opt));
        opt.addEventListener('keydown', handleOptionKeys);
    });
}

function initInteraction() {
    el.app.dataset.screen = 'beat';
    el.app.dataset.phase = 'watch';
    setStorylineVariable(VIDEO_FINISHED_VAR, false);
    el.screenBeat.hidden = false;
    el.playBtn.focus();
}

// ===== STORYLINE VARIABLE CONFIG =====
const STORYLINE_COMPLETE_VAR = 'DistractionComplete'; // Rename to match your Storyline variable
const AUDIO_GUARDRAIL_ENABLED = true; // Set false for fast testing; leave true for production

// ===== THE FOUR FORMS OF DISTRACTION =====
// `icon` keys into ICONS below. Each card opens its definition in the panel.
const TYPES = [
    {
        id: 'visual',
        name: 'Visual',
        icon: 'eye',
        line: 'Your eyes leave the road.',
        examples: [
            'Glancing at a phone',
            'Reading a navigation screen',
            'Looking for a dropped item',
            'Looking at a watch',
            'Focusing on a person or object off to the side of travel'
        ]
    },
    {
        id: 'manual',
        name: 'Manual',
        icon: 'hand',
        line: 'Your hands leave the wheel.',
        examples: [
            'Reaching for a device',
            'Adjusting equipment',
            'Grabbing a drink',
            'Plugging in a phone or tablet'
        ]
    },
    {
        id: 'auditory',
        name: 'Auditory',
        icon: 'sound',
        line: 'Your attention follows sound.',
        examples: [
            'A chime',
            'A navigation prompt spoken at the wrong moment',
            'A background call'
        ]
    },
    {
        id: 'cognitive',
        name: 'Cognitive',
        icon: 'mind',
        line: 'Your mind leaves the drive.',
        examples: [
            'Processing a work message',
            'Mentally running the job schedule',
            'Rehearsing a customer conversation',
            'Feeling overpressured due to being behind schedule'
        ]
    }
];

// ===== THE TWO DRIVES =====
// Beat 1 of each drive sets the scene and asks nothing. Beats 2-5 pause the
// story and ask which form of distraction the moment is.
// `img` files live in img/. Until one exists, the frame shows a labeled slot
// with `alt` as its description, so the activity runs either way.
const DRIVES = [
    {
        id: 'practice1',
        title: 'Practice 1',
        beats: [
            {
                img: 'drive1-1.jpg',
                alt: 'Driver’s-eye view, road ahead, phone mounted',
                caption: 'You’re driving to your next install.',
                audio: 'drive1-1.mp3',
                type: null
            },
            {
                img: 'drive1-2.jpg',
                alt: 'Your work phone buzzes with a message',
                caption: 'Your work phone buzzes with a message.',
                type: 'auditory',
                audioSequence: ['phone-buzz.mp3', 'drive1-2.mp3'],
                feedback: 'Auditory. Your attention follows sound — the message alert has your ear before you decide to look.',
                incorrectFeedback: 'Not quite. This distraction is auditory: the phone message pulls your attention through sound before you choose to look.'
            },
            {
                img: 'drive1-3.jpg',
                alt: 'View shifts to the route on the screen',
                caption: 'Your eyes shift to the phone screen to read the message.',
                type: 'visual',
                audio: 'drive1-3.mp3',
                feedback: 'Visual. Your eyes leave the road to read the message.',
                incorrectFeedback: 'Not quite. This distraction is visual: reading the message takes your eyes off the road.'
            },
            {
                img: 'drive1-4.jpg',
                alt: 'Item that has slid across the passenger seat, driver’s hand moving toward it',
                caption: 'Loose items beside you have shifted and you reach for them.',
                type: 'manual',
                audio: 'drive1-4.mp3',
                feedback: 'Manual. Your hands leave the wheel to reach for them.',
                incorrectFeedback: 'Not quite. This distraction is manual: reaching for the shifted items takes your hands away from steering.'
            },
            {
                img: 'drive1-5.jpg',
                alt: 'Road ahead with a thought-bubble overlay',
                caption: 'After driving for a while, you start thinking about an issue from your last install.',
                type: 'cognitive',
                audio: 'drive1-5.mp3',
                feedback: 'Cognitive. Your mind leaves the drive while you work the problem.',
                incorrectFeedback: 'Not quite. This distraction is cognitive: working through the install problem pulls your mind away from the drive.'
            }
        ],
        recap: 'Five moments, one short drive. A buzz, a glance, a reach, and a thought — and they landed on top of each other.'
    },
    {
        id: 'practice2',
        title: 'Practice 2',
        beats: [
            {
                img: 'drive2-1.jpg',
                alt: 'Windshield view, heavy rain starting',
                caption: 'You’re driving between appointments when heavy rain begins.',
                audio: 'drive2-1.mp3',
                type: null
            },
            {
                img: 'drive2-2.jpg',
                alt: 'Rainy windshield, wipers mid-sweep',
                caption: 'The wipers swish rapidly as rain pounds the windshield.',
                audioSequence: ['rain.mp3', 'drive2-2.mp3'],
                type: 'auditory',
                feedback: 'Auditory. Your attention follows the sound of the wipers.',
                incorrectFeedback: 'Not quite. This distraction is auditory: the swishing wipers capture your attention through sound.'
            },
            {
                img: 'drive2-3.jpg',
                alt: 'Blurred brake lights through the rain',
                caption: 'Brake lights blur through the rain.',
                audio: 'drive2-3.mp3',
                type: 'visual',
                feedback: 'Visual. Your eyes stay on the blur, reading it instead of the road.',
                incorrectFeedback: 'Not quite. This distraction is visual: your eyes lock on the blurred brake lights instead of scanning the full road.'
            },
            {
                img: 'drive2-4.jpg',
                alt: 'Driver’s hand on the defroster control',
                caption: 'You reach to adjust the defroster.',
                audio: 'drive2-4.mp3',
                type: 'manual',
                feedback: 'Manual. Your hand leaves the wheel for the defroster control.',
                incorrectFeedback: 'Not quite. This distraction is manual: adjusting the defroster takes your hand away from the wheel.'
            },
            {
                img: 'drive2-5.jpg',
                alt: 'Slowing traffic with a clock or thought-bubble overlay',
                caption: 'Traffic slows, and you start calculating how late you’ll be.',
                audio: 'drive2-5.mp3',
                type: 'cognitive',
                feedback: 'Cognitive. Your mind leaves the drive to run the schedule — being behind is its own distraction.',
                incorrectFeedback: 'Not quite. This distraction is cognitive: calculating how late you’ll be pulls your thinking away from driving.'
            }
        ],
        recap: 'Most field-drive distractions hit more than one of these at once. That’s when the risk compounds.'
    }
];

// Moments the learner tags: four per drive.
const TOTAL_MOMENTS = DRIVES.reduce(
    (sum, drive) => sum + drive.beats.filter(beat => beat.type).length, 0
);

const SCENE_DURATION = 3000;
const FEEDBACK_DURATION = 3500;

// ===== ICONS =====
// Single-path SVGs, currentColor only, so they inherit the panel's teal.
const ICONS = {
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3.2"/></svg>',
    hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 11V4.8a1.6 1.6 0 1 1 3.2 0V10"/><path d="M11.2 10V3.8a1.6 1.6 0 1 1 3.2 0V10"/><path d="M14.4 10.4V6.2a1.6 1.6 0 1 1 3.2 0V14a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.3-2.5L4 13.6a1.7 1.7 0 0 1 2.8-1.9L8 13.2"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4a.8.8 0 0 1-.8-.8v-3.4a.8.8 0 0 1 .8-.8Z"/><path d="M16 9a4.2 4.2 0 0 1 0 6"/><path d="M18.8 6.2a8 8 0 0 1 0 11.6"/></svg>',
    mind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2Z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4.2" height="15" rx="1.2"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2"/></svg>'
};

const KEYS = ['A', 'B', 'C', 'D'];

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
const activityStore = typeof DriverSafetyState !== 'undefined' ? DriverSafetyState.create('distraction-drive-v2') : null;

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
    activityStore?.write({ opened: [...state.opened], driveIndex: state.driveIndex, beatIndex: state.beatIndex, onRecap: state.onRecap, onIntro: state.onIntro, seenScenes: [...state.seenScenes], tagged: state.tagged, completed: state.completed, reviewMode: state.reviewMode, freeNavigation: state.freeNavigation, answers: [...state.answers.entries()] });
}

function restoreProgress(saved) {
    state.opened = new Set(Array.isArray(saved.opened) ? saved.opened : []);
    state.driveIndex = Math.max(0, Math.min(DRIVES.length - 1, Number(saved.driveIndex) || 0));
    state.beatIndex = Math.max(0, Math.min(DRIVES[state.driveIndex].beats.length - 1, Number(saved.beatIndex) || 0));
    state.onRecap = saved.onRecap === true;
    state.onIntro = saved.onIntro === true;
    state.seenScenes = new Set(Array.isArray(saved.seenScenes) ? saved.seenScenes : []);
    state.completed = saved.completed === true;
    state.reviewMode = saved.reviewMode === true;
    state.freeNavigation = saved.freeNavigation === true;
    state.answers = new Map(Array.isArray(saved.answers) ? saved.answers : []);
    // The answers are the record: the tag count and the answered set are
    // rebuilt from them, so a revisit can never count a moment twice.
    state.answered = new Set(state.answers.keys());
    state.tagged = state.answers.size;
    renderTypeCards();
    watchSceneSize();
    state.opened.forEach(id => el.typeGrid.querySelector(`[data-id="${id}"]`)?.classList.add('is-opened'));
    el.startPractice.hidden = state.opened.size < TYPES.length;
    if (state.completed) { renderCompletedState(); return; }
    if (state.onRecap) { showRecap(); return; }
    if (state.onIntro) { showIntro(); return; }
    if (state.driveIndex > 0 || state.beatIndex > 0 || state.answers.size) {
        renderBeat();
    } else showIntro();
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

function updateProgress(done, total, label) {
    const fill = document.getElementById('progressBar');
    const num = document.getElementById('countNum');
    const of = document.getElementById('countOf');
    if (fill) fill.style.width = `${(done / total) * 100}%`;
    if (num) num.textContent = String(done);
    if (of) of.textContent = label;
}

function getType(id) {
    return TYPES.find(t => t.id === id);
}

// ===== ACTIVITY STATE =====
const state = {
    opened: new Set(),  // type ids opened in the intro
    driveIndex: 0,
    beatIndex: 0,
    onRecap: false,     // on a drive's recap strip (restored on revisit)
    onIntro: true,      // on the four cards (Back can return here mid-activity)
    seenScenes: new Set(), // drive indexes whose Scene 1 the learner has moved past
    tagged: 0,          // moments answered, across both drives
    completed: false,
    reviewMode: false,
    freeNavigation: false,
    answers: new Map(),
    advanceTimer: null
};

const el = {};

function cacheDom() {
    [
        'app', 'headTitle', 'headInstruction', 'reviewNav', 'reviewTimelines', 'reviewDone',
        'photoStage', 'typeGrid', 'scenePlayer', 'beatImg', 'photoSlot',
        'slotName', 'slotDesc', 'beatTag', 'beatCaption', 'beatCaptionText',
        'beatCaptionSound', 'filmstrip',
        'panel', 'viewIntro', 'viewSetup', 'viewQuestion', 'viewRecap',
        'introEyebrow', 'introLead', 'introExamples', 'introNote', 'startPractice',
        'setupEyebrow', 'setupLead', 'setupInstruction', 'setupContinue',
        'setupPreviewGrid',
        'questionEyebrow', 'questionText', 'options', 'questionFeedback', 'questionContinue',
        'feedbackEyebrow', 'feedbackText',
        'recapEyebrow', 'recapLead', 'recapContinue', 'finalMessageButton',
        'setupBack', 'questionBack', 'recapBack',
        'completionOverlay', 'overlayReview', 'overlayRetry',
        'audioBar', 'audioToggle', 'audioTrack', 'audioFill', 'audioThumb'
    ].forEach(id => { el[id] = document.getElementById(id); });
}

// ===== AUDIO =====
// Plays a beat's files back to back as one track and drives the audio bar.
// The bar's track is locked (no drag, no keys) until the beat's audio has
// played through once; with the guardrail off it is unlocked from the start.
// onComplete fires once per load, so replaying never re-triggers the flow.
const audioController = {
    token: 0,
    tracks: [],
    durations: [],
    index: 0,
    playing: false,
    unlocked: false,
    completed: false,
    dragging: false,
    onComplete: null,
    rafId: null,

    stop() {
        this.token += 1;
        this.tracks.forEach(audio => {
            audio.onended = null;
            audio.onerror = null;
            audio.onloadedmetadata = null;
            audio.pause();
        });
        this.tracks = [];
        this.durations = [];
        this.index = 0;
        this.playing = false;
        this.completed = false;
        this.dragging = false;
        this.onComplete = null;
        this.stopTicker();
        if (el.audioBar) {
            el.audioBar.hidden = true;
            el.audioBar.classList.remove('is-dragging');
        }
    },

    // Kept for existing callers: load and autoplay a sequence.
    playSequence(files, onComplete) {
        this.load(files, onComplete);
    },

    load(files, onComplete, { autoplay = true, unlocked = false } = {}) {
        this.stop();
        const token = this.token;
        this.onComplete = onComplete || null;
        this.unlocked = unlocked;

        if (!files.length) {
            this.finish();
            return;
        }

        this.tracks = files.map((file, i) => {
            const audio = new Audio(`audio/${file}`);
            audio.preload = 'auto';
            this.durations[i] = 0;
            audio.onloadedmetadata = () => {
                if (token !== this.token) return;
                this.durations[i] = Number.isFinite(audio.duration) ? audio.duration : 0;
                this.render();
            };
            audio.onended = () => {
                if (token === this.token) this.advance(i);
            };
            // A missing file is skipped so the drive never stalls on it.
            audio.onerror = () => {
                if (token !== this.token) return;
                this.durations[i] = 0;
                if (i === this.index) this.advance(i);
            };
            return audio;
        });

        el.audioBar.hidden = false;
        this.render();
        if (autoplay) this.play();
    },

    play() {
        if (!this.tracks.length) return;
        // Pressing play at the very end starts the beat's audio over.
        if (this.index >= this.tracks.length - 1 && this.atTrackEnd(this.current())) {
            this.tracks.forEach(audio => { audio.currentTime = 0; });
            this.index = 0;
        }
        const token = this.token;
        const audio = this.current();
        this.playing = true;
        this.startTicker();
        this.render();
        audio.play().catch(err => {
            if (token !== this.token || audio !== this.current()) return;
            if (err && err.name === 'NotAllowedError') {
                // Autoplay blocked: wait for the learner to press play.
                this.playing = false;
                this.stopTicker();
                this.render();
            } else {
                this.advance(this.index);
            }
        });
    },

    pause() {
        const audio = this.current();
        if (audio) audio.pause();
        this.playing = false;
        this.stopTicker();
        this.render();
    },

    toggle() {
        if (this.playing) this.pause();
        else this.play();
    },

    current() {
        return this.tracks[this.index];
    },

    atTrackEnd(audio) {
        return !!audio && audio.duration > 0 && audio.currentTime >= audio.duration - 0.05;
    },

    advance(fromIndex) {
        if (fromIndex !== this.index) return;
        if (this.index < this.tracks.length - 1) {
            this.index += 1;
            const next = this.current();
            next.currentTime = 0;
            if (this.playing) {
                const token = this.token;
                next.play().catch(() => {
                    if (token === this.token && next === this.current()) this.advance(this.index);
                });
            }
            this.render();
            return;
        }
        this.playing = false;
        this.stopTicker();
        this.finish();
    },

    finish() {
        this.unlocked = true;
        this.render();
        if (this.completed) return;
        this.completed = true;
        const done = this.onComplete;
        if (done) done();
    },

    total() {
        return this.durations.reduce((sum, d) => sum + d, 0);
    },

    elapsed() {
        let t = 0;
        for (let i = 0; i < this.index; i += 1) t += this.durations[i];
        const audio = this.current();
        return t + (audio ? Math.min(audio.currentTime, this.durations[this.index] || 0) : 0);
    },

    // Jump to a point (seconds) across the whole sequence.
    seek(seconds) {
        if (!this.unlocked || !this.tracks.length) return;
        const total = this.total();
        if (!total) return;
        let remaining = Math.max(0, Math.min(seconds, total - 0.05));
        let target = 0;
        while (target < this.tracks.length - 1 && remaining >= this.durations[target]) {
            remaining -= this.durations[target];
            target += 1;
        }
        if (target !== this.index) {
            this.current().pause();
            this.tracks.forEach((audio, i) => { if (i !== target) audio.currentTime = 0; });
            this.index = target;
            if (this.playing) this.current().play().catch(() => {});
        }
        this.current().currentTime = remaining;
        this.render();
    },

    startTicker() {
        this.stopTicker();
        const tick = () => {
            this.render();
            this.rafId = requestAnimationFrame(tick);
        };
        this.rafId = requestAnimationFrame(tick);
    },

    stopTicker() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = null;
    },

    render() {
        if (!el.audioBar) return;
        const total = this.total();
        const elapsed = this.completed && !this.playing && this.index === this.tracks.length - 1 && this.atTrackEnd(this.current())
            ? total
            : this.elapsed();
        const pct = total ? Math.min(100, (elapsed / total) * 100) : (this.completed ? 100 : 0);

        el.audioBar.style.setProperty('--audio-progress', `${pct}%`);
        el.audioBar.classList.toggle('is-locked', !this.unlocked);
        el.audioBar.classList.toggle('is-playing', this.playing);

        // Swap the icon only on a state change: replacing it every frame can
        // eat a click whose press landed on the old SVG.
        const icon = this.playing ? 'pause' : 'play';
        if (el.audioToggle.dataset.icon !== icon) {
            el.audioToggle.dataset.icon = icon;
            el.audioToggle.innerHTML = ICONS[icon];
            el.audioToggle.setAttribute('aria-label', this.playing ? 'Pause audio' : 'Play audio');
        }

        el.audioTrack.tabIndex = this.unlocked ? 0 : -1;
        el.audioTrack.setAttribute('aria-disabled', String(!this.unlocked));
        el.audioTrack.setAttribute('aria-valuenow', String(Math.round(pct)));
        el.audioTrack.setAttribute('aria-valuetext', `${formatTime(elapsed)} of ${formatTime(total)}`);
    }
};

function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds || 0));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Play/pause button, pointer drag (mouse + touch) and arrow keys on the track.
function bindAudioBar() {
    el.audioToggle.addEventListener('click', () => audioController.toggle());

    const seekToPointer = event => {
        const rect = el.audioTrack.getBoundingClientRect();
        const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        audioController.seek(ratio * audioController.total());
    };

    el.audioTrack.addEventListener('pointerdown', event => {
        if (!audioController.unlocked) return;
        event.preventDefault();
        audioController.dragging = true;
        el.audioBar.classList.add('is-dragging');
        el.audioTrack.setPointerCapture(event.pointerId);
        seekToPointer(event);
    });

    el.audioTrack.addEventListener('pointermove', event => {
        if (audioController.dragging) seekToPointer(event);
    });

    const endDrag = event => {
        if (!audioController.dragging) return;
        audioController.dragging = false;
        el.audioBar.classList.remove('is-dragging');
        if (el.audioTrack.hasPointerCapture(event.pointerId)) {
            el.audioTrack.releasePointerCapture(event.pointerId);
        }
    };
    el.audioTrack.addEventListener('pointerup', endDrag);
    el.audioTrack.addEventListener('pointercancel', endDrag);

    el.audioTrack.addEventListener('keydown', event => {
        if (!audioController.unlocked) return;
        const now = audioController.elapsed();
        const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[event.key];
        if (step !== undefined) audioController.seek(now + step);
        else if (event.key === 'Home') audioController.seek(0);
        else if (event.key === 'End') audioController.seek(audioController.total());
        else return;
        event.preventDefault();
    });
}

// ===== SCENE SIZING =====
// Scene images use a 3:2 ratio. The player is sized to the largest box of this
// ratio that fits the stage, so the caption bar and tag always sit on the
// pixels the learner is looking at.
const PHOTO_RATIO = 3 / 2;

function sizeScene() {
    const stage = el.photoStage;
    const player = el.scenePlayer;
    if (!stage || !player || player.hidden) return;

    const availW = stage.clientWidth;
    const availH = stage.clientHeight;
    if (availW < 2 || availH < 2) return;

    let w = availW;
    let h = w / PHOTO_RATIO;
    if (h > availH) {
        h = availH;
        w = h * PHOTO_RATIO;
    }
    player.style.width = `${Math.floor(w)}px`;
    player.style.height = `${Math.floor(h)}px`;
}

function watchSceneSize() {
    sizeScene();
    window.addEventListener('resize', sizeScene);
    window.addEventListener('orientationchange', () => setTimeout(sizeScene, 120));
    if (window.ResizeObserver && el.photoStage) {
        new ResizeObserver(() => sizeScene()).observe(el.photoStage);
    }
    // fonts landing can change the header height and therefore the stage
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => sizeScene()).catch(() => {});
    }
}

// ===== STAGE + PANEL SWITCHING =====
// One call sets which stage piece and which panel view are on screen.
function showMode(name) {
    el.app.dataset.mode = name;
    if (name !== 'recap') el.recapContinue.hidden = true;
    if (name !== 'recap') el.finalMessageButton.hidden = true;
    if (name !== 'recap') el.recapBack.hidden = true;
    state.onIntro = name === 'intro';
    el.reviewNav.hidden = !state.reviewMode;
    el.app.classList.toggle('is-reviewing', state.reviewMode);

    const onCards = name === 'intro';
    const onStrip = name === 'recap';
    const onScene = !onCards && !onStrip;

    el.typeGrid.hidden = !onCards;
    el.scenePlayer.hidden = !onScene;
    el.filmstrip.hidden = !onStrip;

    el.viewIntro.hidden = name !== 'intro';
    el.viewSetup.hidden = name !== 'setup';
    el.viewQuestion.hidden = name !== 'question';
    el.viewRecap.hidden = name !== 'recap';
    el.panel.classList.toggle('is-question', name === 'question' || name === 'feedback');

    sizeScene();
}

function setHead(title, instruction) {
    el.headTitle.textContent = title;
    el.headInstruction.textContent = instruction;
}

// ===== INTRO: THE FOUR CARDS =====
function renderTypeCards() {
    el.typeGrid.innerHTML = '';
    TYPES.forEach(type => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'type-card';
        btn.dataset.id = type.id;
        btn.setAttribute('aria-label', `${type.name} distraction`);

        const icon = document.createElement('span');
        icon.className = 'type-card__icon';
        icon.innerHTML = ICONS[type.icon];

        const name = document.createElement('span');
        name.className = 'type-card__name';
        name.textContent = type.name;

        const line = document.createElement('span');
        line.className = 'type-card__line';
        line.textContent = type.line;

        btn.append(icon, name, line);
        el.typeGrid.appendChild(btn);
    });
}

function openType(id) {
    const type = getType(id);
    if (!type) return;

    el.typeGrid.querySelectorAll('.type-card').forEach(node => {
        node.classList.toggle('is-active', node.dataset.id === id);
        if (node.dataset.id === id) node.classList.add('is-opened');
    });

    state.opened.add(id);
    saveProgress();
    updateProgress(state.opened.size, TYPES.length, `of ${TYPES.length} opened`);

    el.introEyebrow.textContent = type.name;
    el.introLead.textContent = type.line;

    el.introExamples.hidden = false;
    el.introExamples.innerHTML = '';
    type.examples.forEach(text => {
        const li = document.createElement('li');
        li.className = 'example';
        li.textContent = text;
        el.introExamples.appendChild(li);
    });
    staggerIn('#introExamples .example', 50);

    if (state.opened.size === TYPES.length) el.startPractice.hidden = false;
}

// ===== DRIVE BEATS =====
function currentDrive() {
    return DRIVES[state.driveIndex];
}

function currentBeat() {
    return currentDrive().beats[state.beatIndex];
}

function clearAdvanceTimer() {
    if (state.advanceTimer !== null) {
        clearTimeout(state.advanceTimer);
        state.advanceTimer = null;
    }
}

function scheduleNextBeat(delay) {
    scheduleAction(delay, nextBeat);
}

function scheduleAction(delay, action) {
    clearAdvanceTimer();
    state.advanceTimer = setTimeout(() => {
        state.advanceTimer = null;
        action();
    }, delay);
}

function animateScene() {
    el.scenePlayer.classList.remove('scene-enter');
    el.beatImg.classList.remove('scene-enter');
    void el.scenePlayer.offsetWidth;
    el.scenePlayer.classList.add('scene-enter');
    el.beatImg.classList.add('scene-enter');
}

function beatAudioFiles(beat) {
    if (beat.audioSequence) return beat.audioSequence;
    return beat.audio ? [beat.audio] : [];
}

function isAudioGuardrailActive() {
    return AUDIO_GUARDRAIL_ENABLED && !state.freeNavigation;
}

function renderQuestionBeat(drive, beat, reviewOnly = state.reviewMode) {
    el.questionEyebrow.textContent =
        `${drive.title} · Moment ${state.beatIndex} of ${drive.beats.length - 1}`;
    el.questionFeedback.hidden = true;
    el.questionContinue.hidden = true;
    el.questionContinue.disabled = true;
    renderOptions();
    setQuestionOptionsEnabled(reviewOnly ? false : !isAudioGuardrailActive());
    showMode('question');
    animateScene();
    staggerIn('#options .option', 50);
    if (reviewOnly) renderStoredAnswer(drive, beat);
}

function renderSetupPreview() {
    el.setupPreviewGrid.innerHTML = '';
    TYPES.forEach(type => {
        const tile = document.createElement('div');
        tile.className = 'setup-preview-tile';
        tile.setAttribute('aria-label', `${type.name} distraction`);

        const icon = document.createElement('span');
        icon.className = 'setup-preview-tile__icon';
        icon.innerHTML = ICONS[type.icon];

        const name = document.createElement('span');
        name.className = 'setup-preview-tile__name';
        name.textContent = type.name;

        tile.append(icon, name);
        el.setupPreviewGrid.appendChild(tile);
    });
}

function startQuestionBeatAudio(beat, answered = false) {
    const files = beatAudioFiles(beat);
    const locked = state.reviewMode || answered;
    if (!files.length) {
        if (isAudioGuardrailActive() && !locked) setQuestionOptionsEnabled(true);
        return;
    }
    // Review mode and already-answered moments load the audio paused and
    // unlocked so the learner can replay it.
    audioController.load(files, () => {
        if (isAudioGuardrailActive() && !locked) setQuestionOptionsEnabled(true);
    }, {
        autoplay: !locked,
        unlocked: !isAudioGuardrailActive() || locked
    });
}

// A drive's Scene 1 counts as seen once the learner has moved past it, or
// has any answer in that drive. A seen scene comes back paused, with
// Continue ready, so going Back never forces a replay.
function isSceneSeen(driveIndex) {
    if (state.seenScenes.has(driveIndex)) return true;
    return [...state.answers.keys()].some(key => key.startsWith(`${driveIndex}-`));
}

function preparePlaybackPanel(drive, beat, seen = false) {
    const isBeatOnePreview = state.beatIndex === 0;
    el.panel.classList.toggle('is-beat1', isBeatOnePreview);
    el.setupEyebrow.textContent = isBeatOnePreview
        ? `${drive.title} · Scene 1`
        : `${drive.title} · Now playing`;
    el.setupLead.textContent = beat.caption;
    el.setupLead.hidden = isBeatOnePreview;
    el.setupInstruction.hidden = !isBeatOnePreview;
    el.setupPreviewGrid.hidden = !isBeatOnePreview;
    if (isBeatOnePreview) renderSetupPreview();
    el.setupContinue.hidden = !isBeatOnePreview;
    el.setupContinue.disabled = isAudioGuardrailActive() && !seen;
    showMode('setup');
    animateScene();
}

function finishPlaybackPanel(drive, beat) {
    if (state.beatIndex === 0) {
        el.setupContinue.hidden = false;
        el.setupContinue.disabled = false;
        state.seenScenes.add(state.driveIndex);
        saveProgress();
        return;
    }

    if (beat.type) {
        renderQuestionBeat(drive, beat);
        return;
    }

    scheduleNextBeat(SCENE_DURATION);
}

// The scene image if it loads, the labeled slot if the file isn't there yet.
function loadBeatPhoto(beat) {
    el.photoSlot.hidden = true;
    el.beatImg.hidden = false;
    el.beatImg.alt = beat.alt;
    el.beatImg.onerror = () => {
        el.beatImg.hidden = true;
        el.photoSlot.hidden = false;
        el.slotName.textContent = `img/${beat.img}`;
        el.slotDesc.textContent = beat.alt;
    };
    el.beatImg.src = `img/${beat.img}`;
}

function renderBeat() {
    const drive = currentDrive();
    const beat = currentBeat();
    const nextBeatData = currentDrive().beats[state.beatIndex + 1];
    if (nextBeatData) {
        const preload = new Image();
        preload.src = `img/${nextBeatData.image}`;
        if (nextBeatData.audio) { const audio = new Audio(); audio.preload = 'metadata'; audio.src = `audio/${nextBeatData.audio}`; }
    }

    clearAdvanceTimer();
    audioController.stop();
    loadBeatPhoto(beat);
    updateProgress(state.tagged, TOTAL_MOMENTS, `of ${TOTAL_MOMENTS} tagged`);
    el.beatCaptionText.textContent = beat.caption;
    el.beatCaptionSound.hidden = !beat.sound;
    if (beat.sound) el.beatCaptionSound.textContent = beat.sound;
    el.beatTag.hidden = true;

    setHead(
        beat.type ? 'Name what it pulls away' : 'Ride along',
        beat.type
            ? 'Read the moment, then select the type of distraction you think it is.'
            : 'Follow the drive one photo at a time. At each key moment, the story pauses.'
    );

    if (!beat.type) {
        const seen = isSceneSeen(state.driveIndex);
        preparePlaybackPanel(drive, beat, seen);
        const files = beatAudioFiles(beat);
        if (files.length) {
            audioController.load(files, () => finishPlaybackPanel(drive, beat), {
                autoplay: !seen,
                unlocked: !isAudioGuardrailActive() || seen
            });
        } else {
            finishPlaybackPanel(drive, beat);
        }
        return;
    }

    el.panel.classList.remove('is-beat1');
    el.setupPreviewGrid.hidden = true;
    el.setupLead.hidden = false;
    el.setupInstruction.hidden = true;
    // A moment answered before a revisit comes back answered, with Continue.
    const answered = !state.reviewMode && state.answers.has(beatKey());
    renderQuestionBeat(drive, beat, state.reviewMode || answered);
    if (answered) {
        el.questionContinue.hidden = false;
        el.questionContinue.disabled = false;
    }
    startQuestionBeatAudio(beat, answered);
}

function beatKey() {
    return `${state.driveIndex}-${state.beatIndex}`;
}

function renderOptions() {
    el.options.innerHTML = '';
    TYPES.forEach((type, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option';
        btn.dataset.id = type.id;
        btn.disabled = true;

        const key = document.createElement('span');
        key.className = 'option__key';
        key.innerHTML = ICONS[type.icon];

        const text = document.createElement('span');
        text.className = 'option__text';
        text.textContent = type.name;

        const mark = document.createElement('span');
        mark.className = 'option__mark';

        btn.append(key, text, mark);
        btn.setAttribute('aria-label', `${KEYS[i]}. ${type.name}`);
        el.options.appendChild(btn);
    });
}

function setQuestionOptionsEnabled(enabled) {
    el.options.querySelectorAll('.option').forEach(btn => {
        btn.disabled = !enabled;
    });
}

function renderStoredAnswer(drive, beat) {
    const answer = state.answers.get(`${state.driveIndex}-${state.beatIndex}`);
    if (!answer) return;

    const selected = el.options.querySelector(`.option[data-id="${answer.selectedId}"]`);
    if (selected) {
        selected.classList.add(answer.correct ? 'correct' : 'incorrect');
        selected.querySelector('.option__mark').textContent = answer.correct ? '✓' : '✕';
    }

    if (!answer.correct) {
        const right = el.options.querySelector(`.option[data-id="${beat.type}"]`);
        if (right) {
            right.classList.add('correct');
            right.querySelector('.option__mark').textContent = '✓';
        }
    }

    const type = getType(beat.type);
    el.beatTag.hidden = false;
    el.beatTag.textContent = type.name;
    el.feedbackEyebrow.textContent = answer.correct ? type.name : 'Not quite';
    el.feedbackText.textContent = answer.correct ? beat.feedback : beat.incorrectFeedback;
    el.questionFeedback.classList.toggle('is-wrong', !answer.correct);
    el.questionFeedback.hidden = false;
}

// One attempt only: lock every option on the first answer either way, mark
// the pick, and reveal the correct type if the pick was wrong.
function handleOptionClick(btn) {
    const beat = currentBeat();
    if (!beat.type) return;

    const correct = btn.dataset.id === beat.type;
    state.answers.set(beatKey(), {
        selectedId: btn.dataset.id,
        correct
    });

    el.options.querySelectorAll('.option').forEach(node => {
        node.classList.add('is-locked');
        node.classList.remove('stagger-in');
        node.style.animationDelay = '';
    });

    if (correct) {
        btn.classList.add('correct');
        btn.querySelector('.option__mark').textContent = '✓';
        revealAfter(true);
        return;
    }

    btn.classList.add('incorrect');
    btn.querySelector('.option__mark').textContent = '✕';

    const right = el.options.querySelector(`.option[data-id="${beat.type}"]`);
    if (right) {
        right.classList.add('correct');
        right.querySelector('.option__mark').textContent = '✓';
    }
    revealAfter(false);
}

// Bank the tag immediately, show feedback, then resume the scene sequence.
function revealAfter(correct) {
    const beat = currentBeat();
    if (!state.answered) state.answered = new Set();
    state.answered.add(beatKey());
    state.tagged = state.answers.size;
    updateProgress(state.tagged, TOTAL_MOMENTS, `of ${TOTAL_MOMENTS} tagged`);
    saveProgress();

    const type = getType(beat.type);
    el.beatTag.hidden = false;
    el.beatTag.textContent = type.name;
    el.feedbackEyebrow.textContent = correct ? type.name : 'Not quite';
    el.feedbackText.textContent = correct ? beat.feedback : beat.incorrectFeedback;
    el.questionFeedback.classList.toggle('is-wrong', !correct);
    el.questionFeedback.hidden = false;
    el.questionContinue.hidden = false;
    el.questionContinue.disabled = false;
    showMode('question');
}

// ===== RECAP FILMSTRIP =====
function renderFilmstrip(drive) {
    el.filmstrip.innerHTML = '';
    const recapBeats = drive.beats.filter(beat => beat.type);
    recapBeats.forEach((beat, i) => {
        const film = document.createElement('div');
        film.className = 'film';

        const shot = document.createElement('div');
        shot.className = 'film__shot';

        const img = document.createElement('img');
        img.alt = beat.alt;
        img.onerror = () => { img.remove(); };
        img.src = `img/${beat.img}`;

        const num = document.createElement('span');
        num.className = 'film__num';
        num.textContent = String(i + 1);

        shot.append(img, num);

        const tag = document.createElement('span');
        tag.className = 'film__tag';
        tag.textContent = getType(beat.type).name;

        const caption = document.createElement('span');
        caption.className = 'film__caption';
        caption.textContent = beat.caption;

        film.append(shot, tag, caption);
        el.filmstrip.appendChild(film);
    });
}

// Both recaps end on a button: Practice 1's moves on to Practice 2, the last
// one opens the completion overlay. Nothing advances on a timer, so learners
// can stay on the recap as long as they like.
function showRecap(animate = true) {
    const drive = currentDrive();
    const isLast = state.driveIndex === DRIVES.length - 1;
    state.onRecap = true;
    saveProgress();
    updateProgress(state.tagged, TOTAL_MOMENTS, `of ${TOTAL_MOMENTS} tagged`);

    renderFilmstrip(drive);
    setHead(
        'How quickly distractions can add up',
        'These four distractions happened during one drive. Notice how quickly they can compete for your attention.'
    );
    el.recapEyebrow.textContent = `${drive.title} · Recap`;
    el.recapLead.textContent = drive.recap;
    showMode('recap');
    el.recapContinue.hidden = isLast;
    el.finalMessageButton.hidden = !isLast;
    el.recapBack.hidden = false;
    if (animate) staggerIn('.filmstrip .film', 70);
}

function renderReviewNav() {
    el.reviewTimelines.innerHTML = '';
    DRIVES.forEach((drive, driveIndex) => {
        const row = document.createElement('div');
        row.className = 'review-nav__row';

        const label = document.createElement('span');
        label.className = 'review-nav__label';
        label.textContent = drive.title;

        const moments = document.createElement('div');
        moments.className = 'review-nav__moments';

        drive.beats.filter(beat => beat.type).forEach((beat, momentIndex) => {
            const beatIndex = drive.beats.indexOf(beat);
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'review-nav__moment';
            button.textContent = `${momentIndex + 1} ${getType(beat.type).name}`;
            button.setAttribute('aria-label', `${drive.title}, moment ${momentIndex + 1}, ${getType(beat.type).name}`);
            button.setAttribute(
                'aria-current',
                state.driveIndex === driveIndex && state.beatIndex === beatIndex ? 'step' : 'false'
            );
            button.addEventListener('click', () => openReviewBeat(driveIndex, beatIndex));
            moments.appendChild(button);
        });

        row.append(label, moments);
        el.reviewTimelines.appendChild(row);
    });
}

function enterReviewMode() {
    clearAdvanceTimer();
    audioController.stop();
    state.reviewMode = true;
    state.freeNavigation = true;
    state.onRecap = false;
    state.driveIndex = 0;
    state.beatIndex = 1;
    saveProgress();
    el.completionOverlay.classList.remove('active');
    renderReviewNav();
    renderBeat();
}

function openReviewBeat(driveIndex, beatIndex) {
    const drive = DRIVES[driveIndex];
    const beat = drive && drive.beats[beatIndex];
    if (!beat || !beat.type) return;

    clearAdvanceTimer();
    audioController.stop();
    state.reviewMode = true;
    state.driveIndex = driveIndex;
    state.beatIndex = beatIndex;
    renderReviewNav();
    renderBeat();
}

function exitReviewMode() {
    clearAdvanceTimer();
    audioController.stop();
    state.reviewMode = false;
    saveProgress();
    el.reviewNav.hidden = true;
    el.app.classList.remove('is-reviewing');
    el.completionOverlay.classList.add('active');
}

// ===== FLOW =====
function startDrive(index) {
    clearAdvanceTimer();
    audioController.stop();
    state.reviewMode = false;
    state.onRecap = false;
    state.driveIndex = index;
    state.beatIndex = 0;
    saveProgress();
    renderBeat();
}

function nextBeat() {
    const drive = currentDrive();
    if (state.beatIndex === 0) state.seenScenes.add(state.driveIndex);
    if (state.beatIndex < drive.beats.length - 1) {
        state.beatIndex += 1;
        saveProgress();
        renderBeat();
        return;
    }
    showRecap();
}

// One step back through the flow. Answers stay as first given: an answered
// moment re-renders locked, with its feedback and Continue, so nothing is
// re-asked and the tagged count never drops.
function prevBeat() {
    clearAdvanceTimer();
    audioController.stop();

    if (state.onRecap) {
        state.onRecap = false;
        state.beatIndex = currentDrive().beats.length - 1;
        saveProgress();
        renderBeat();
        return;
    }

    if (state.beatIndex > 0) {
        state.beatIndex -= 1;
        saveProgress();
        renderBeat();
        return;
    }

    if (state.driveIndex > 0) {
        state.driveIndex -= 1;
        state.beatIndex = currentDrive().beats.length - 1;
        showRecap();
        return;
    }

    showIntro();
    saveProgress();
}

function afterRecap() {
    if (state.driveIndex < DRIVES.length - 1) {
        startDrive(state.driveIndex + 1);
        return;
    }
    showCompletion();
}

// ===== COMPLETION =====
// Fires when the learner clicks See Final Message on the Practice 2 recap.
function showCompletion() {
    if (!state.completed) {
        state.completed = true;
        reportCompletion();
        saveProgress();
    }
    el.completionOverlay.classList.add('active');
}

// Try Again clears the activity back to the intro. The Storyline variable
// stays true -- it is never written back to false.
function restart() {
    clearAdvanceTimer();
    audioController.stop();
    el.completionOverlay.classList.remove('active');
    state.opened = new Set();
    state.answered = new Set();
    state.driveIndex = 0;
    state.beatIndex = 0;
    state.tagged = 0;
    state.completed = false;
    state.reviewMode = false;
    state.freeNavigation = true;
    state.onRecap = false;
    state.seenScenes = new Set();
    state.answers = new Map();
    // Save the reset state rather than clearing it: an empty store reads as a
    // first visit, and a first visit writes the Storyline variable to false.
    saveProgress();
    el.startPractice.hidden = true;
    el.introExamples.hidden = true;
    el.introExamples.innerHTML = '';
    el.typeGrid.querySelectorAll('.type-card')
        .forEach(node => node.classList.remove('is-opened', 'is-active'));
    showIntro();
}

function showIntro() {
    setHead(
        'Four forms of distraction',
        'Select each card to explore what pulls your attention away from the road.'
    );
    el.introEyebrow.textContent = 'Four forms';
    el.introLead.textContent =
        'Distraction shows up in four forms. Open each one to see what it takes from the drive.';
    showMode('intro');
    staggerIn('.type-grid .type-card', 60);
    // Visual opens by default, so learners only need to open the other three.
    openType(TYPES[0].id);
}

// ===== WIRING =====
function bindEvents() {
    bindAudioBar();
    el.typeGrid.addEventListener('click', event => {
        const card = event.target.closest('.type-card');
        if (card) openType(card.dataset.id);
    });

    el.startPractice.addEventListener('click', () => startDrive(0));
    el.setupContinue.addEventListener('click', () => {
        if (!el.setupContinue.disabled) nextBeat();
    });
    el.questionContinue.addEventListener('click', () => {
        if (!el.questionContinue.disabled) nextBeat();
    });
    el.setupPreviewGrid.addEventListener('click', event => {
        event.preventDefault();
    });
    el.recapContinue.addEventListener('click', afterRecap);
    el.finalMessageButton.addEventListener('click', showCompletion);
    [el.setupBack, el.questionBack, el.recapBack].forEach(btn => {
        btn.addEventListener('click', prevBeat);
    });
    el.reviewDone.addEventListener('click', exitReviewMode);

    el.options.addEventListener('click', event => {
        const btn = event.target.closest('.option');
        if (btn && !btn.disabled && !btn.classList.contains('is-locked')) handleOptionClick(btn);
    });

    el.overlayReview.addEventListener('click', () => {
        enterReviewMode();
    });
    el.overlayRetry.addEventListener('click', restart);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    state.answered = new Set();
    const saved = activityStore?.read();
    if (saved) {
        bindEvents();
        restoreProgress(saved);
    } else {
        // Fresh load -> false, unless the learner already completed this
        // session (Storyline's variable must never go back to false).
        if (!isRevisit()) resetCompletion();
        initInteraction();
    }
});

// A revisit opens on the final recap, everything already tagged, no entrance
// animations. Try Again is still one click away on the overlay's Review path.
function renderCompletedState() {
    el.app.classList.add('no-anim');
    audioController.stop();
    state.reviewMode = false;
    TYPES.forEach(type => state.opened.add(type.id));
    el.typeGrid.querySelectorAll('.type-card').forEach(node => node.classList.add('is-opened'));
    el.startPractice.hidden = false;
    state.completed = true;
    state.driveIndex = DRIVES.length - 1;
    state.tagged = TOTAL_MOMENTS;
    DRIVES.forEach((drive, d) => {
        drive.beats.forEach((beat, b) => {
            if (beat.type) state.answered.add(`${d}-${b}`);
            if (beat.type) {
                const key = `${d}-${b}`;
                if (!state.answers.has(key)) state.answers.set(key, { selectedId: beat.type, correct: true });
            }
        });
    });
    updateProgress(TOTAL_MOMENTS, TOTAL_MOMENTS, `of ${TOTAL_MOMENTS} tagged`);
    showRecap(false);
    el.completionOverlay.classList.add('active');
}

function initInteraction() {
    renderTypeCards();
    bindEvents();
    watchSceneSize();
    showIntro();
}

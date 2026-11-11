// ===== STORYLINE VARIABLE CONFIG =====
const STORYLINE_COMPLETE_VAR = 'KeyTakeawaysComplete';
const LAST_SEEN_STORAGE_KEY = 'key-takeaways:last-seen';
const activityStore = typeof DriverSafetyState !== 'undefined' ? DriverSafetyState.create('key-takeaways') : null;

// ===== CONTENT =====
const TAKEAWAYS = [
    {
        title: 'Recognize the distraction',
        text: 'Visual, manual, auditory, and cognitive distractions can happen at the same time. Choose to be in control and decide now to intentionally ignore distractions when they come up.',
        image: 'img/distraction.jpg',
        alt: 'Driver holding the steering wheel while a phone is visible in the vehicle'
    },
    {
        title: 'Prepare before moving',
        text: 'Secure loose items, set your mirrors and navigation, fasten your seat belt, and address vehicle concerns before the route begins.',
        image: 'img/prepare.jpg',
        alt: 'Driver secured in a work vehicle with the road and navigation ahead'
    },
    {
        title: 'Let messages wait',
        text: 'Do not use a handheld device or view a screen while operating the vehicle. Pull over safely before responding.',
        image: 'img/messages.jpg',
        alt: 'Mounted phone showing an incoming customer message in a vehicle'
    },
    {
        title: 'Re-scan the road',
        text: 'After any shift in attention, check the full scene again. Traffic, pedestrians, signals, and available space may have changed.',
        image: 'img/rescan.jpg',
        alt: 'Driver viewing a clear multi-lane roadway ahead'
    },
    {
        title: 'Use a specific plan',
        text: 'Choose one preparation habit and one response you’ll use when work pressure competes for your attention.',
        image: 'img/plan.jpg',
        alt: 'Driver viewing a route and schedule alert before continuing the drive'
    }
];

class CarouselState {
    constructor(total, options = {}) {
        this.total = total;
        const initialIndex = Number.isInteger(options.initialIndex) && options.initialIndex >= 0 && options.initialIndex < total
            ? options.initialIndex
            : 0;
        this.index = initialIndex;
        this.viewed = options.viewed?.length
            ? new Set(options.viewed)
            : options.completed
            ? new Set(Array.from({ length: total }, (_, index) => index))
            : new Set([initialIndex]);
        this.completionReported = Boolean(options.completed);
    }

    get viewedCount() { return this.viewed.size; }
    get isComplete() { return this.viewedCount === this.total; }

    goTo(index) {
        if (index < 0 || index >= this.total) return false;
        this.index = index;
        this.viewed.add(index);
        return true;
    }

    next() { return this.goTo(this.index + 1); }
    previous() { return this.goTo(this.index - 1); }
}

function getProgressCount(state) {
    return state.isComplete ? state.total : state.index + 1;
}

// ===== STORYLINE INTEGRATION =====
function getStorylineVariable(varName) {
    try {
        const player = window.GetPlayer?.() || window.parent?.GetPlayer?.() || window.top?.GetPlayer?.();
        return player?.GetVar ? player.GetVar(varName) : null;
    } catch (error) { return null; }
}

function setStorylineVariable(varName, value) {
    try {
        const player = window.GetPlayer?.() || window.parent?.GetPlayer?.() || window.top?.GetPlayer?.();
        if (player?.SetVar) { player.SetVar(varName, value); return true; }
        return false;
    } catch (error) { return false; }
}

function getBrowserStorage() {
    try {
        return window.sessionStorage;
    } catch (error) { return null; }
}

function getStoredLastSeen(storage = getBrowserStorage()) {
    if (!storage) return null;
    const savedIndex = Number(storage.getItem(LAST_SEEN_STORAGE_KEY));
    return Number.isInteger(savedIndex) ? savedIndex : null;
}

function setStoredLastSeen(index, storage = getBrowserStorage()) {
    try {
        storage?.setItem(LAST_SEEN_STORAGE_KEY, String(index));
        return true;
    } catch (error) { return false; }
}

function reportCompletion() {
    setStorylineVariable(STORYLINE_COMPLETE_VAR, true);
}

function getResumeState(total) {
    const saved = activityStore?.read();
    if (saved) return {
        initialIndex: Number.isInteger(saved.index) ? Math.max(0, Math.min(total - 1, saved.index)) : 0,
        viewed: Array.isArray(saved.viewed) ? saved.viewed : [],
        completed: saved.completed === true
    };
    if (typeof DriverSafetyState !== 'undefined' && DriverSafetyState.topLevelRefresh()) {
        try { window.sessionStorage.removeItem(LAST_SEEN_STORAGE_KEY); } catch (error) { /* unavailable */ }
    }
    const savedIndex = getStoredLastSeen();
    const completedValue = getStorylineVariable(STORYLINE_COMPLETE_VAR);
    const completed = completedValue === true || completedValue === 1 || completedValue === 'true' || completedValue === '1';

    return {
        initialIndex: Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < total ? savedIndex : 0,
        completed,
        viewed: []
    };
}

function reportCompletionWhenReady(state, onComplete = reportCompletion) {
    if (state.isComplete && !state.completionReported) {
        state.completionReported = true;
        onComplete();
    }
}

// ===== DOM INTERACTION =====
function initializeCarousel() {
    const state = new CarouselState(TAKEAWAYS.length, getResumeState(TAKEAWAYS.length));
    const elements = {
        stage: document.querySelector('.carousel__stage'),
        image: document.getElementById('takeawayImage'),
        placeholder: document.getElementById('photoPlaceholder'),
        number: document.getElementById('cardNumber'),
        title: document.getElementById('takeawayTitle'),
        text: document.getElementById('takeawayText'),
        current: document.getElementById('progressCurrent'),
        total: document.getElementById('progressTotal'),
        fill: document.getElementById('progressFill'),
        dots: document.getElementById('dots'),
        previous: document.getElementById('previousButton'),
        next: document.getElementById('nextButton')
    };

    elements.total.textContent = String(TAKEAWAYS.length);

    TAKEAWAYS.forEach((takeaway, index) => {
        const dot = document.createElement('button');
        dot.className = 'dot';
        dot.type = 'button';
        dot.role = 'tab';
        dot.dataset.index = String(index);
        dot.setAttribute('aria-label', `Go to takeaway ${index + 1}`);
        dot.addEventListener('click', () => render(index));
        elements.dots.append(dot);
    });

    function render(index, animate = true) {
        if (!state.goTo(index)) return;
        setStoredLastSeen(state.index);
        activityStore?.write({ index: state.index, viewed: [...state.viewed], completed: state.isComplete });
        const takeaway = TAKEAWAYS[state.index];
        elements.stage.classList.toggle('is-changing', animate);
        elements.image.hidden = false;
        elements.image.alt = takeaway.alt;
        elements.image.src = takeaway.image;
        const nextTakeaway = TAKEAWAYS[state.index + 1];
        if (nextTakeaway) { const preload = new Image(); preload.src = nextTakeaway.image; }
        elements.image.onerror = () => {
            elements.image.hidden = true;
            elements.placeholder.hidden = false;
        };
        elements.image.onload = () => {
            elements.image.hidden = false;
            elements.placeholder.hidden = true;
        };
        elements.placeholder.hidden = false;
        elements.number.textContent = String(state.index + 1).padStart(2, '0');
        elements.title.textContent = takeaway.title;
        elements.text.textContent = takeaway.text;
        const progressCount = getProgressCount(state);
        elements.current.textContent = String(progressCount);
        elements.fill.style.width = `${(progressCount / TAKEAWAYS.length) * 100}%`;
        elements.previous.disabled = state.index === 0;
        elements.next.disabled = state.index === TAKEAWAYS.length - 1;
        elements.dots.querySelectorAll('.dot').forEach((dot, dotIndex) => {
            dot.setAttribute('aria-selected', String(dotIndex === state.index));
            dot.tabIndex = dotIndex === state.index ? 0 : -1;
        });
        reportCompletionWhenReady(state);
    }

    elements.previous.addEventListener('click', () => render(state.index - 1));
    elements.next.addEventListener('click', () => render(state.index + 1));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') render(state.index + 1);
        if (event.key === 'ArrowLeft') render(state.index - 1);
    });

    render(state.index, false);
    return { state, render };
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initializeCarousel);
}

if (typeof module !== 'undefined') {
    module.exports = { TAKEAWAYS, CarouselState, getProgressCount, reportCompletionWhenReady, getStoredLastSeen, setStoredLastSeen };
}

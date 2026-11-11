import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TAKEAWAYS, CarouselState, getProgressCount, reportCompletionWhenReady, getStoredLastSeen, setStoredLastSeen } from '../script.js';

const styles = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('contains the five supplied takeaways in order', () => {
    assert.equal(TAKEAWAYS.length, 5);
    assert.deepEqual(
        TAKEAWAYS.map((takeaway) => takeaway.title),
        [
            'Recognize the distraction',
            'Prepare before moving',
            'Let messages wait',
            'Re-scan the road',
            'Use a specific plan'
        ]
    );
});

test('marks cards as viewed while navigating forward and completes on the fifth card', () => {
    const state = new CarouselState(TAKEAWAYS.length);

    assert.equal(state.index, 0);
    assert.equal(state.viewedCount, 1);
    assert.equal(state.isComplete, false);

    state.next();
    state.next();
    state.next();
    state.next();

    assert.equal(state.index, 4);
    assert.equal(state.viewedCount, 5);
    assert.equal(state.isComplete, true);
});

test('back navigation preserves viewed progress', () => {
    const state = new CarouselState(TAKEAWAYS.length);

    state.next();
    state.next();
    state.previous();

    assert.equal(state.index, 1);
    assert.equal(state.viewedCount, 3);
    assert.equal(state.isComplete, false);
});

test('reports completion once after all five takeaways have been shown', () => {
    const state = new CarouselState(TAKEAWAYS.length);
    let completionCalls = 0;
    const reportCompletion = () => { completionCalls += 1; };

    for (let index = 1; index < TAKEAWAYS.length; index += 1) {
        state.next();
        reportCompletionWhenReady(state, reportCompletion);
    }

    reportCompletionWhenReady(state, reportCompletion);

    assert.equal(completionCalls, 1);
});

test('keeps progress at five of five after completion when navigating back', () => {
    const state = new CarouselState(TAKEAWAYS.length);

    for (let index = 1; index < TAKEAWAYS.length; index += 1) state.next();
    state.previous();

    assert.equal(getProgressCount(state), 5);
});

test('restores the last seen takeaway while preserving completed progress', () => {
    const state = new CarouselState(TAKEAWAYS.length, { initialIndex: 2, completed: true });

    assert.equal(state.index, 2);
    assert.equal(state.viewedCount, TAKEAWAYS.length);
    assert.equal(getProgressCount(state), TAKEAWAYS.length);
});

test('stores the last seen takeaway in web object storage', () => {
    const values = new Map();
    const storage = {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value)
    };

    setStoredLastSeen(2, storage);

    assert.equal(getStoredLastSeen(storage), 2);
});

test('keeps the photo at a 16:9 ratio and lets the panel match its height', () => {
    const photoRule = styles.match(/\.photo-frame\s*\{([^}]*)\}/)?.[1] ?? '';
    const stageRule = styles.match(/\.carousel__stage\s*\{([^}]*)\}/)?.[1] ?? '';

    assert.match(photoRule, /aspect-ratio:\s*16\s*\/\s*9/);
    assert.match(stageRule, /align-items:\s*stretch/);
});

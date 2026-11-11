import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../state-store.js', import.meta.url), 'utf8');

function context(type = 'navigate') {
    const window = {};
    window.top = window;
    window.parent = window;
    window.performance = { getEntriesByType: () => [{ type }] };
    const sandbox = { window, performance: window.performance, globalThis: {} };
    vm.runInNewContext(source, sandbox);
    return sandbox.window;
}

test('state survives web-object recreation in the same Storyline page', () => {
    const first = context();
    const firstStore = first.DriverSafetyState.create('activity');
    firstStore.write({ index: 2 });
    const secondStore = first.DriverSafetyState.create('activity');
    assert.deepEqual(secondStore.read(), { index: 2 });
});

test('top-level refresh clears the parent-page state', () => {
    const page = context();
    page.DriverSafetyState.create('activity').write({ index: 2 });
    page.performance.getEntriesByType = () => [{ type: 'reload' }];
    assert.equal(page.DriverSafetyState.create('activity').read(), null);
});

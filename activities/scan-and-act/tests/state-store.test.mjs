import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../state-store.js', import.meta.url), 'utf8');

function makeWindow({ topLevel = false, navigationType = 'navigate' } = {}) {
  const window = { sessionStorage: new Map(), performance: { getEntriesByType: () => [{ type: navigationType }] } };
  window.sessionStorage = {
    getItem: key => window.__session?.get(key) ?? null,
    setItem: (key, value) => { window.__session ??= new Map(); window.__session.set(key, value); },
    removeItem: key => window.__session?.delete(key)
  };
  window.top = topLevel ? window : { __driverSafetyState: {} };
  window.parent = window.top;
  vm.runInNewContext(source, { window, globalThis: window, performance: window.performance });
  return window;
}

test('state survives web-object recreation on the same Storyline page', () => {
  const window = makeWindow();
  const first = window.DriverSafetyState.create('scan-and-act-v1');
  first.write({ scenario: 1, completed: false });
  const second = window.DriverSafetyState.create('scan-and-act-v1');
  assert.deepEqual(second.read(), { scenario: 1, completed: false });
});

test('top-level refresh starts with a clean state', () => {
  const window = makeWindow({ topLevel: true, navigationType: 'reload' });
  const store = window.DriverSafetyState.create('scan-and-act-v1');
  store.write({ completed: true });
  assert.deepEqual(store.read(), { completed: true });
  const refreshed = makeWindow({ topLevel: true, navigationType: 'reload' });
  assert.equal(refreshed.DriverSafetyState.create('scan-and-act-v1').read(), null);
});


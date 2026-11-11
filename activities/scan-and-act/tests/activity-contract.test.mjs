import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('..', import.meta.url);

test('activity contains both supplied scenarios, four risks each, and answer A', () => {
  const html = fs.readFileSync(new URL('index.html', root), 'utf8');
  const script = fs.readFileSync(new URL('script.js', root), 'utf8');

  assert.match(html, /Scan and act/);
  assert.match(script, /Residential street/);
  assert.match(script, /Congested road/);
  assert.equal((script.match(/correct:\s*'A'/g) || []).length, 2);
  assert.equal((script.match(/id:\s*'risk-/g) || []).length, 8);
  assert.match(script, /ScanActDone/);
});


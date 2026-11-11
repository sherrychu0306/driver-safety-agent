import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const js = fs.readFileSync(new URL('../script.js', import.meta.url), 'utf8');

// Markup: one icon-only toggle and a slider track that starts locked.
assert.match(html, /id="audioBar"/);
assert.match(html, /<button type="button" class="audio-bar__toggle" id="audioToggle" aria-label="Play audio"><\/button>/);
assert.match(html, /id="audioTrack" role="slider" tabindex="-1"/);
assert.match(html, /class="audio-bar is-locked"/);
assert.match(html, /aria-disabled="true"/);

// Icons, not text.
assert.match(js, /play: '<svg/);
assert.match(js, /pause: '<svg/);

// Dragging is gated on the unlocked flag, set once the audio has played through.
assert.match(js, /pointerdown', event => \{\s*if \(!audioController\.unlocked\) return;/);
assert.match(js, /seek\(seconds\) \{\s*if \(!this\.unlocked/);
assert.match(js, /finish\(\) \{\s*this\.unlocked = true;/);
assert.match(js, /setPointerCapture/);

// Styles: thumb hidden while locked, 48px touch targets.
assert.match(css, /\.audio-bar\.is-locked \.audio-bar__thumb \{\s*transform: scale\(0\);/);
assert.match(css, /\.audio-bar__toggle \{[\s\S]*?width: 48px;[\s\S]*?height: 48px;/);
assert.match(css, /\.audio-bar__track \{[\s\S]*?height: 48px;/);

console.log('Audio bar: icon toggle, locked until played, then draggable.');

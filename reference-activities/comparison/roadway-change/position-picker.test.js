const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const source = fs.readFileSync('script.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
const context = {
    window: {},
    document: { addEventListener() {} },
    console,
    sessionStorage: { getItem() {}, setItem() {}, removeItem() {} },
    setTimeout,
    clearTimeout,
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {}
};

vm.runInNewContext(source, context);

assert.equal(
    context.formatChangeCoordinates([
        { id: 'vehicle', x: 52.4, y: 46.2 },
        { id: 'pedestrian', x: 26, y: 58 }
    ]),
    "{ id: 'vehicle', x: 52.4, y: 46.2 },\n{ id: 'pedestrian', x: 26, y: 58 }"
);

assert.match(source, /const PHOTO_ASSETS = Object\.freeze\(\{[\s\S]*before: 'img\/before\.jpg'[\s\S]*after: 'img\/after\.jpg'/);
assert.match(source, /loadPhoto\(el\.beforeImg, el\.beforeSlot, PHOTO_ASSETS\.before\)/);
assert.match(source, /loadPhoto\(el\.afterImg, el\.afterSlot, PHOTO_ASSETS\.after\)/);
assert.match(source, /position-picker__instruction/);
assert.match(source, /position-picker__undo/);
assert.match(source, /function positionPickerInstruction\(/);
assert.match(source, /positionPickerInstruction\(\)/);

assert.match(
    fs.readFileSync('styles.css', 'utf8'),
    /\.compare__handle\.is-nudging[\s\S]*@keyframes nudge[\s\S]*scale\(1\.1[0-9]*\)/
);
assert.match(source, /function armNudge\(\)[\s\S]*playNudge\(\)/);

assert.match(html, /<button type="button" class="btn--go" id="finalMessageButton" hidden>See final message<\/button>/);
assert.match(source, /function showFinalMessage\(\)[\s\S]*?el\.completionOverlay\.classList\.add\('active'\)/);
assert.match(source, /el\.finalMessageButton\.hidden = state\.completed \|\| state\.revealed\.size !== CHANGES\.length/);
assert.doesNotMatch(source, /COMPLETION_DELAY|completionTimer/);
assert.match(html, /<button type="button" class="btn-back" id="compareBack">Back<\/button>/);
assert.match(source, /function returnToIntro\(\)[\s\S]*?showIntro\(\)/);
assert.match(source, /el\.compareBack\.addEventListener\('click', returnToIntro\)/);
assert.match(css, /\.btn-back \{[\s\S]*?box-shadow: inset 0 0 0 2px var\(--primary-color\)/);
assert.match(source, /const meterPos = Math\.min\(100, \(revealed \/ CHANGES\.length\) \* 100\)/);
assert.match(source, /function restoreProgress\(saved\)[\s\S]*?state\.revealed\.forEach\([\s\S]*?markRevealed\(change\)/);
assert.match(source, /const savedMode = saved\.mode === 'intro' \|\| saved\.mode === 'compare' \? saved\.mode : null/);
assert.match(source, /if \(state\.completed\) state\.pos = 100/);
assert.match(source, /if \(state\.completed && state\.completionOpen\) el\.completionOverlay\.classList\.add\('active'\)/);
assert.match(source, /if \(!isRevisit\(\)\) resetCompletion\(\)/);
assert.match(source, /function startCompare\(\)[\s\S]*?showMode\('compare'\);[\s\S]*?saveProgress\(\)/);
assert.match(source, /completionOpen/);
assert.match(source, /function restoreProgress\(saved\)[\s\S]*?updateMeter\(state\.pos, state\.revealed\.size\)/);
assert.match(source, /state\.revealed\.add\(change\.id\);[\s\S]*?saveProgress\(\);/);
assert.doesNotMatch(source, /function setPos\([\s\S]*?state\.pos = clamp\(value, 0, 100\);\s*saveProgress\(\);\s*\n\s*CHANGES\.forEach/);

console.log('position picker formatting test passed');

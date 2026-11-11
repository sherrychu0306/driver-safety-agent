import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = new URL('..', import.meta.url);
const html = fs.readFileSync(new URL('index.html', root), 'utf8');
const script = fs.readFileSync(new URL('script.js', root), 'utf8');
const styles = fs.readFileSync(new URL('styles.css', root), 'utf8');

test('completion shows only the two requested statements and navigation controls', () => {
  const completion = html.match(/<div class="completion-overlay"[\s\S]*?<\/body>/)?.[0] || '';
  assert.match(completion, /<h2 class="completion__lead">Stay one step ahead\.<\/h2>/);
  assert.match(completion, /<p class="completion__supporting">Every clue in these scenes came from one of four places to scan\.<\/p>/);
  assert.match(completion, /<p class="completion__closing">Keep scanning\. Ask what could change next, not just what is visible now\. Try to anticipate in your mind what other drivers might do\.<\/p>/);
  assert.doesNotMatch(completion, /<ul|<li|Far ahead|Intersections|Your mirrors|The edges/);
  assert.match(completion, /class="completion__content"[\s\S]*id="retryBtn"[\s\S]*id="reviewBtn"/);
  assert.match(html, /<\/main>\s*<div class="completion-overlay"/);
  assert.doesNotMatch(styles, /completion__closing[^{}]*\{[^}]*font-style:\s*italic/s);
});

test('completion actions and text follow the requested hierarchy', () => {
  const completion = html.match(/<div class="completion-overlay"[\s\S]*?<\/body>/)?.[0] || '';
  assert.doesNotMatch(completion, /class="eyebrow"/);
  assert.match(completion, /class="secondary" id="retryBtn"[\s\S]*class="primary" id="reviewBtn"/);
  assert.match(styles, /\.completion__lead\s*\{[^}]*color:\s*var\(--primary-color\);[^}]*font-size:\s*42px/s);
  assert.match(styles, /\.completion__lead::after\s*\{[^}]*background:\s*var\(--emphasis-color\)/s);
  assert.match(styles, /\.completion__supporting\s*\{[^}]*margin-bottom:\s*var\(--space-sm\)/s);
  assert.match(styles, /\.completion__content>p\.completion__closing\s*\{[^}]*max-width:\s*720px;[^}]*font-size:\s*24px/s);
  const completionActions = [...styles.matchAll(/\.completion__actions\s*\{([^}]*)\}/gs)].map((match) => match[1]);
  assert.ok(completionActions.some((rule) => /justify-content:\s*center/.test(rule)));
  assert.doesNotMatch(completionActions.join('\n'), /width:\s*min\(820px,\s*100%\)/);
  assert.match(styles, /#retryBtn\s*\{[^}]*background-color:\s*transparent/s);
  assert.match(styles, /\.completion-overlay\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;[^}]*background:\s*var\(--overlay-bg\);[^}]*opacity:\s*0;[^}]*pointer-events:\s*none/s);
  assert.match(styles, /\.completion-overlay\.active\s*\{[^}]*opacity:\s*1;[^}]*pointer-events:\s*auto/s);
  assert.match(styles, /\.completion__content\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*900px/s);
  assert.match(styles, /\.completion__actions\s*\{[^}]*justify-content:\s*center/s);
  assert.match(styles, /--overlay-bg:\s*rgb\(243 239 232 \/ 97%\)/);
  assert.match(script, /el\.completion\.classList\.toggle\('active', state\.completionOpen\)/);
  assert.match(script, /el\.completion\.inert = !state\.completionOpen/);
  assert.doesNotMatch(completionActions.join('\n'), /width:/);
});

test('header follows the approved reference pattern without an interactive eyebrow', () => {
  const header = html.match(/<header[\s\S]*?<\/header>/)?.[0] || '';
  assert.doesNotMatch(header, /Interactive/);
  assert.match(header, /class="meter__label"/);
});

test('hotspot meter resets to one of four for each scenario', () => {
  assert.match(html, /id="progressCount">1<\/strong><span id="progressLabel">of 4 risks/);
  assert.match(script, /Math\.max\(1, progress\.selected\.length\)/);
  assert.match(script, /foundCount.*HOTSPOT_COUNT/);
});

test('Check stays disabled until all four risks are selected', () => {
  assert.match(script, /el\.checkBtn\.disabled = progress\.selected\.length < HOTSPOT_COUNT \|\| progress\.checked/);
  assert.match(html, /then select Continue\./);
  assert.match(html, /id="checkBtn"[^>]*>Continue<\/button>/);
});

test('final answer shows feedback before explicit completion', () => {
  const answerBody = script.match(/function answer\(key\)\s*\{([^}]+)\}/)?.[1] || '';
  assert.doesNotMatch(answerBody, /completionOpen\s*=\s*true|reportCompletion\(true\)/);
  assert.match(script, /function finishActivity\(\)/);
  assert.match(script, /state\.scenario === SCENARIOS\.length - 1 \? finishActivity\(\)/);
});

test('hotspot positions stay fixed across entry and retry', () => {
  assert.doesNotMatch(script, /Math\.random|hotspotPositions|randomizePositions/);
  assert.match(script, /const position = risk/);
});

test('both scenarios use the supplied risk guidance without scan-category headings', () => {
  for (const phrase of [
    'Scan driveways and side streets, slow down, and cover the brake',
    'Watch the spaces between parked vehicles, reduce your speed, and be prepared to stop.',
    'Leave extra space and approach slowly.',
    'Check your mirrors frequently, maintain your position, and leave enough room for the cyclist to pass safely.',
    'Look 12–15 seconds ahead, ease off the accelerator, and begin slowing early.',
    'Increase your following distance and scan around the truck when it is safe to do so.',
    'Ease off and create enough space for it to merge safely.',
    'Check your mirrors, slow down early, and brake gradually to give the driver behind you more warning.'
  ]) assert.ok(script.includes(phrase), `Missing supplied risk guidance: ${phrase}`);
  const riskData = script.match(/const SCENARIOS = \[([\s\S]*?)\n\];/)?.[1] || '';
  assert.doesNotMatch(riskData, /explanation:\s*['"](?:The edges|Far ahead|Your mirrors):/);
});

test('empty risk-label layer does not intercept photo hotspot clicks', () => {
  assert.match(styles, /\.risk-label-layer\s*\{[^}]*pointer-events:\s*none/s);
});

test('hotspots stay selected and action buttons use 20px text', () => {
  assert.match(script, /if \(progress\.checked \|\| selected\) return/);
  assert.match(styles, /\.primary\s*,\s*\.secondary\s*,\s*\.option\s*\{[^}]*font-size:\s*20px/s);
});

test('back remains enabled at the first scenario', () => {
  assert.match(script, /el\.backBtn\.disabled = false/);
  assert.match(script, /function goBack\(\)/);
  const goBackBody = script.match(/function goBack\(\)\s*\{([\s\S]*?)\n\}/)?.[1] || '';
  assert.match(goBackBody, /activeState\(\)\.checked = false/);
  assert.doesNotMatch(goBackBody, /state\.scenario\s*=|goTo\(/);
  assert.doesNotMatch(goBackBody, /answer\s*=|feedback\s*=/);
});

test('question text is regular weight', () => {
  assert.match(styles, /\.question\s*\{[^}]*font-weight:\s*400/s);
});

test('uses the progress meter without a duplicate hotspot status line', () => {
  assert.doesNotMatch(html, /id="hotspotStatus"/);
  assert.doesNotMatch(script, /hotspotStatus/);
});

test('moves the scenario caption into the prompt with a blank line before the instruction', () => {
  assert.doesNotMatch(html, /class="scene-caption"|id="sceneCaption"/);
  assert.doesNotMatch(script, /sceneCaption/);
  assert.match(script, /prompt:\s*'You’re driving to your first work order of the day\. It’s a two-way residential street, with cars parked on both sides\.\\n\\nClick each area you should scan\.'/);
  assert.match(script, /prompt:\s*'You’re driving between appointments on a three-lane road\. Traffic is heavy but moving\.\\n\\nClick each area you should scan\.'/);
  assert.match(script, /data\.prompt\.split\('\\n\\n'\)/);
  assert.match(script, /prompt__instruction/);
  assert.match(styles, /\.prompt__instruction\s*\{[^}]*margin-top:\s*var\(--space-sm\)/s);
});

test('ACT state switches to the distinct act photo placeholder', () => {
  assert.match(html, /class="scene__placeholder" id="scenePlaceholder"/);
  assert.match(script, /scenePlaceholder: document\.querySelector\('#scenePlaceholder'\)/);
  assert.match(script, /progress\.checked \? 'Act photo placeholder' : 'Photo placeholder'/);
  assert.match(script, /progress\.checked \? 'Replace with approved act scene image' : 'Replace with approved scene image'/);
});

test('ACT state hides the hotspot layer', () => {
  assert.match(script, /el\.hotspotLayer\.hidden = progress\.checked/);
});

test('reveals selected risk feedback in the right panel', () => {
  assert.match(html, /id="riskFeedback"/);
  assert.match(script, /progress\.selected\.at\(-1\)/);
  assert.match(script, /risk-feedback__text/);
  assert.match(script, /currentRisk\.explanation/);
  assert.match(styles, /\.risk-feedback\s*\{[^}]*border-left:\s*4px solid var\(--emphasis-color\)/s);
  assert.match(styles, /\.risk-feedback__text\s*\{[^}]*font-size:\s*22px/s);
  assert.match(styles, /\.risk-label-layer\s*\{[^}]*pointer-events:\s*none/s);
  assert.doesNotMatch(script, /className = 'risk-label'/);
});

test('activity uses the series Storyline viewport shell', () => {
  assert.match(styles, /html\s*,\s*body\s*\{[^}]*height:\s*100%[^}]*overflow:\s*hidden[^}]*display:\s*flex[^}]*align-items:\s*center[^}]*justify-content:\s*center/s);
  assert.match(styles, /#app\s*\{[^}]*max-width:\s*1560px[^}]*height:\s*100%[^}]*max-height:\s*720px[^}]*padding:\s*0\s+60px/s);
  assert.match(styles, /font-size:\s*24px;\s*line-height:\s*1\.4/s);
});

test('multiple-choice panel follows the distraction-drive question pattern', () => {
  assert.match(html, /class="question-feedback"/);
  assert.match(html, /class="question-feedback__eyebrow"/);
  assert.match(script, /option__mark/);
  assert.match(script, /option__text/);
  assert.match(styles, /\.panel\s*\{[^}]*border-top:\s*4px solid var\(--primary-color\)/s);
  assert.match(styles, /\.option\s*\{[^}]*grid-template-columns:\s*38px 1fr 24px/s);
  assert.match(styles, /\.option__key\s*\{[^}]*width:\s*38px[^}]*height:\s*38px/s);
});

test('right panel hides its scrollbar while options retain internal scrolling', () => {
  assert.match(styles, /\.panel\s*\{[^}]*overflow:\s*hidden/s);
  assert.match(styles, /\.options\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(styles, /\.options\s*\{[^}]*scrollbar-width:\s*none/s);
  assert.match(styles, /\.options\s*::-webkit-scrollbar\s*\{[^}]*display:\s*none/s);
});

test('question-view Back stays bottom-left, aligned to the question content', () => {
  assert.match(html, /id="questionView"[\s\S]*class="panel-actions"[\s\S]*id="backBtn"/);
  assert.match(styles, /#questionView\s+\.panel-actions\s*\{[^}]*margin-top:\s*var\(--space-md\);[^}]*justify-content:\s*flex-start/s);
  assert.match(styles, /--space-md:\s*24px/);
});

test('activity exposes forward, backward, review, retry, and Storyline completion paths', () => {
  for (const phrase of ['id="backBtn"', 'id="nextBtn"', 'id="reviewBtn"', 'id="retryBtn"', 'SetVar', 'DriverSafetyState.create']) assert.match(script + html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('hotspots and answer choices are keyboard controls with live status regions', () => {
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(script, /button\.type\s*=\s*'button'/);
  assert.match(script, /setAttribute\('aria-pressed'/);
});


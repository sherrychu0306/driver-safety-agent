import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const script = readFileSync(new URL('../script.js', import.meta.url), 'utf8');

test('renders the two column drop zones and draggable source tray', () => {
    assert.match(html, /id="sourceBank"/);
    assert.match(html, /data-bucket="wait"/);
    assert.match(html, /data-bucket="now"/);
    assert.match(script, /draggable\s*=\s*true/);
    assert.match(script, /pointerdown/);
    assert.match(script, /pointermove/);
    assert.match(script, /pointerup/);
});

test('uses drag events instead of click-to-select sorting', () => {
    assert.match(script, /dragstart/);
    assert.match(script, /drop/);
    assert.doesNotMatch(script, /sourceBank\.addEventListener\(['"]click/);
    assert.doesNotMatch(script, /card\.addEventListener\(['"]click/);
    assert.match(script, /handleColumnDrop/);
});

test('shuffles the source tray when the activity initializes', () => {
    assert.match(script, /function shuffleItems/);
    assert.match(script, /shuffleItems\(SORT_ITEMS\)/);
});

test('offers scenario practice after sorting is complete', () => {
    assert.match(html, /id="sortEyebrow"/);
    assert.match(html, /id="sortLead"/);
    assert.match(html, /id="sortCompleteText"/);
    assert.match(html, /id="practiceScenarios"/);
    assert.match(html, />Practice the scenarios</);
    assert.match(script, /function startRapidScenarios/);
    assert.match(script, /sortEyebrow\.textContent = 'Sorting complete'/);
    assert.match(script, /sortLead\.textContent = 'All demands sorted'/);
});

test('uses choice buttons and a photo placeholder for rapid scenarios', () => {
    assert.match(html, /id="groups"/);
    assert.match(html, /id="scenarioPhoto"/);
    assert.match(html, /16:9/);
    assert.doesNotMatch(html, /id="dragDemand"/);
    assert.match(script, /function renderGroups/);
    assert.match(script, /function handleGroupClick/);
    assert.match(script, /img\/scenario-personal-message\.jpg/);
    assert.match(script, /img\/scenario-reroute\.jpg/);
    assert.match(script, /img\/scenario-urgent-call\.jpg/);
    assert.match(script, /img\/scenario-schedule-alert\.jpg/);
});

test('locks a scenario after one choice and reveals the correct answer', () => {
    assert.match(script, /state\.locked = true/);
    assert.match(script, /group\.classList\.add\('is-locked'\)/);
    assert.match(script, /correctGroup\?\.classList\.add\('correct'\)/);
    assert.match(script, /demand\.incorrect/);
});

test('supports Storyline test mode and the N shortcut', () => {
    assert.match(script, /STORYLINE_TEST_VAR = 'WhatCanWaitTestMode'/);
    assert.match(script, /LOCAL_TEST_MODE = false/);
    assert.match(script, /getStorylineVariable\(STORYLINE_TEST_VAR\)/);
    assert.match(script, /event\.key\.toLowerCase\(\) !== 'n'/);
    assert.match(script, /showCompletedSortForTesting/);
});

test('resets the scenario counter to four demands', () => {
    assert.match(script, /el\.countOf\.textContent = `of \$\{TOTAL\} sorted`/);
});

test('places the next demand control in the scenario panel', () => {
    assert.match(html, /<div class="panel__view" id="viewList"[\s\S]*id="demandList"[\s\S]*id="nextDemand"/);
    assert.doesNotMatch(html, /<div class="demand__foot">\s*<p[^>]+id="demandFeedback"[^>]*>[^<]*<\/p>\s*<button/);
});

test('provides a back control for every scenario and returns to sorting from the first', () => {
        assert.match(html, /class="btn-back scenario-back" id="scenarioBack"/);
        assert.match(html, />Back<\/button>/);
        assert.match(html, /class="scenario-actions"[\s\S]*id="scenarioBack"[\s\S]*id="nextDemand"/);
        assert.match(css, /\.scenario-actions\s*\{[\s\S]*justify-content:\s*space-between/);
        assert.match(script, /el\.scenarioBack\.textContent = 'Back'/);
    assert.match(script, /function backFromScenario\(\)/);
    assert.match(script, /el\.scenarioBack\.addEventListener\('click', backFromScenario\)/);
    assert.match(script, /if \(state\.index === 0\)[\s\S]*showIntro\(\)[\s\S]*showCompletion\(\)/);
    assert.match(script, /state\.index -= 1/);
});

test('restores an answered scenario and keeps its continue button after going back', () => {
    assert.match(script, /function restoreScenarioAnswer\(\)[\s\S]*applyScenarioAnswer\(picked\)[\s\S]*el\.nextDemand\.hidden = false/);
    assert.match(script, /showDemand\(state\.index, false\);\s*restoreScenarioAnswer\(\);/);
    assert.match(script, /state\.answered\.get\(demand\.id\)/);
});

test('shows revisited scenario audio complete and paused until replayed', () => {
    assert.match(script, /const revisiting = state\.answered\.has\(demand\.id\)/);
    assert.match(script, /playScenarioAudio\(demand, \{ atEnd: revisiting \}\)/);
    assert.match(script, /if \(state\.audioAtEnd \|\| audio\.ended\)/);
    assert.match(script, /updateAudioProgress\(atEnd \? 100 : 0\)/);
    assert.match(script, /if \(atEnd\) return/);
});

test('shows one completion layer with review and retry controls', () => {
    assert.match(html, /id="completionOverlay"/);
    assert.match(html, /id="reviewActivity"/);
    assert.match(html, /id="tryAgain"/);
    assert.match(html, /class="btn-reset btn-back" id="tryAgain"/);
    assert.match(css, /\.btn-reset[\s\S]*background: transparent/);
    assert.match(html, /Interruptions don/);
    assert.match(script, /function showScenarioCompletion/);
    assert.match(script, /function showReviewSort/);
    assert.match(script, /function reviewNext/);
    assert.match(script, /function reviewBack/);
    assert.match(script, /function tryAgain/);
    assert.match(script, /el\.practiceScenarios\.textContent = 'Review the scenarios'/);
});

test('places retry on the left and review on the right in the completion layer', () => {
    assert.match(html, /<button type="button" class="btn-reset btn-back" id="tryAgain">Try again<\/button>\s*<button type="button" class="btn-secondary" id="reviewActivity">Review<\/button>/);
    assert.match(css, /\.completion-actions\s*\{[^}]*justify-content:\s*center;/);
});

test('uses the completion layer instead of a separate reflection screen', () => {
    assert.doesNotMatch(html, /id="stageReflect"/);
    assert.doesNotMatch(script, /function showReflection/);
    assert.doesNotMatch(script, /el\.stageReflect/);
    assert.match(script, /function renderCompletedState\(\)[\s\S]*el\.completionOverlay\.hidden = false/);
});

test('prioritizes the first scenario photo for immediate display', () => {
    assert.match(html, /rel="preload"[^>]+as="image"[^>]+href="img\/scenario-personal-message\.jpg"/);
    assert.match(html, /id="scenarioPhotoImage"[^>]+fetchpriority="high"/);
    assert.match(html, /id="scenarioPhotoImage"[^>]+decoding="async"/);
});

test('persists and restores the learner position on revisit', () => {
    assert.match(script, /function saveProgress/);
    assert.match(script, /function restoreProgress/);
    assert.match(script, /saveProgress\(\)/);
    assert.match(script, /saved\.mode === 'sort'/);
    assert.match(script, /state\.sorted = new Set/);
    assert.match(script, /state\.answered = new Map/);
});

test('plays scenario audio before enabling response choices', () => {
    assert.match(html, /id="scenarioAudio"[^>]+preload="auto"/);
    assert.doesNotMatch(html, /id="playAudio"/);
    assert.doesNotMatch(html, /id="audioStatus"/);
    assert.match(script, /audio: 'audio\/audio-1\.mp3'/);
    assert.match(script, /audio: 'audio\/audio-4\.mp3'/);
    assert.match(script, /function playScenarioAudio/);
    assert.match(script, /audio\.onended = finishScenarioAudio/);
    assert.match(script, /button\.disabled = !state\.audioReady/);
    assert.match(script, /function resumeBlockedAudio/);
    assert.doesNotMatch(script, /audio\.load\(\)/);
});

test('starts scenario audio automatically when a scenario opens', () => {
    assert.match(script, /function playScenarioAudio\(demand, options = \{\}\)[\s\S]*audio\.autoplay = !atEnd;[\s\S]*audio\.play\(\)/);
    assert.match(script, /if \(!state\.reviewMode && !state\.completed\) playScenarioAudio\(demand, \{ atEnd: revisiting \}\)/);
});

test('provides a play-pause audio progress rail for each scenario', () => {
    assert.match(html, /id="audioToggle"/);
    assert.match(html, /id="audioProgress"[^>]*role="slider"/);
    assert.match(html, /id="audioProgressFill"/);
    assert.match(css, /\.audio-progress\s*\{[\s\S]*height:\s*28px;/);
    assert.match(css, /\.audio-progress::before\s*\{[\s\S]*height:\s*8px;/);
    assert.match(script, /function updateAudioProgress/);
    assert.match(script, /function toggleScenarioAudio/);
    assert.match(script, /function seekAudioFromPointer/);
    assert.match(script, /el\.audioToggle\.addEventListener\('click', toggleScenarioAudio\)/);
    assert.match(script, /el\.audioProgress\.addEventListener\('pointerdown', startAudioSeek\)/);
});

test('centers the audio progress rail with the play-pause button', () => {
    assert.match(css, /\.audio-progress::before\s*\{[\s\S]*top:\s*50%;[\s\S]*transform:\s*translateY\(-50%\)/);
    assert.match(css, /\.audio-progress-fill\s*\{[\s\S]*top:\s*50%;[\s\S]*transform:\s*translateY\(-50%\)/);
});

test('uses the four-scenario denominator on the scenario screen', () => {
    assert.match(script, /function showMode\(name\)[\s\S]*name === 'sort'[\s\S]*el\.countOf\.textContent = `of \$\{TOTAL\} sorted`/);
});

test('does not replay audio during scenario review', () => {
    assert.match(script, /if \(state\.reviewMode\) state\.audioReady = true/);
    assert.match(script, /const revisiting = state\.answered\.has\(demand\.id\)/);
    assert.match(script, /if \(!state\.reviewMode && !state\.completed\) playScenarioAudio\(demand, \{ atEnd: revisiting \}\)/);
});

test('uses a final-message button instead of a timed completion layer', () => {
    assert.match(html, /class="btn--go"[^>]*id="nextDemand"/);
    assert.match(script, /el\.nextDemand\.textContent = i === TOTAL - 1 \? 'See final message' : 'Next demand'/);
    assert.match(script, /if \(state\.index >= TOTAL - 1\) \{\s*showScenarioCompletion\(\);\s*return;/);
    assert.doesNotMatch(script, /SCENARIO_COMPLETION_DELAY/);
    assert.doesNotMatch(script, /state\.completionTimer = setTimeout/);
});

test('fires Storyline completion only after scenario completion', () => {
    const sortingCompletion = script.match(/function showCompletion\(\)[\s\S]*?\n}\n/)[0];
    const scenarioCompletion = script.match(/function showScenarioCompletion\(\)[\s\S]*?\n}\n/)[0];
    assert.doesNotMatch(sortingCompletion, /reportCompletion\(\)/);
    assert.match(scenarioCompletion, /reportCompletion\(\)/);
});

test('restores the last visited activity view and keeps review progress complete', () => {
    assert.match(script, /view: state\.view/);
    assert.match(script, /saved\.view === 'scenario'/);
    assert.match(script, /state\.view = 'review-sort'/);
    assert.match(script, /state\.view = 'review-scenario'/);
    assert.match(script, /function updateReviewProgress\(\)[\s\S]*of \$\{TOTAL\} sorted/);
    assert.match(script, /showReviewSort\(\)[\s\S]*updateReviewProgress\(\)/);
    assert.match(script, /showReviewScenario\(index\)[\s\S]*updateReviewProgress\(\)/);
});

test('routes completed revisits through the completion-layer state', () => {
    assert.match(script, /if \(state\.view === 'scenario-complete'[\s\S]*renderCompletedState\(\);/);
    assert.match(script, /function renderCompletedState\(\)[\s\S]*el\.completionOverlay\.classList\.add\('active'\)/);
});

test('rebuilds the sorted cards when reviewing card sorting', () => {
    const reviewSort = script.match(/function showReviewSort\(\)[\s\S]*?\n}\n/)[0];
    const completedRevisit = script.match(/function renderCompletedState\(\)[\s\S]*?\n}\n/)[0];
    assert.match(reviewSort, /restoreSortProgress\(\[\.\.\.state\.sorted\]\)/);
    assert.match(completedRevisit, /restoreSortProgress\(SORT_ITEMS\.map\(item => item\.id\)\)/);
});

test('stops and clears scenario audio when completion opens', () => {
    assert.match(script, /function stopScenarioAudio\(\)[\s\S]*audio\.pause\(\)[\s\S]*audio\.removeAttribute\('src'\)/);
    const sortingCompletion = script.match(/function showCompletion\(\)[\s\S]*?\n}\n/)[0];
    const scenarioCompletion = script.match(/function showScenarioCompletion\(\)[\s\S]*?\n}\n/)[0];
    const revisitCompletion = script.match(/function renderCompletedState\(\)[\s\S]*?\n}\n/)[0];
    assert.match(sortingCompletion, /stopScenarioAudio\(\)/);
    assert.match(scenarioCompletion, /stopScenarioAudio\(\)/);
    assert.match(revisitCompletion, /stopScenarioAudio\(\)/);
});

test('does not restart scenario audio while rendering the completion layer on revisit', () => {
    const demandRendering = script.match(/function showDemand\(i, animate = true\)[\s\S]*?\n}\n/)[0];
    const completedRevisit = script.match(/function renderCompletedState\(\)[\s\S]*?\n}\n/)[0];
    assert.match(demandRendering, /!state\.completed/);
    assert.match(completedRevisit, /state\.completed = true[\s\S]*showDemand\(state\.index, false\)/);
});

test('keeps review navigation directly below feedback without flex spacer', () => {
    assert.match(script, /function showMode\(name\)[\s\S]*el\.panel\.classList\.toggle\('is-reviewing', state\.reviewMode\)/);
    assert.match(css, /\.panel\.is-reviewing\s*\{[\s\S]*display:\s*grid;[\s\S]*grid-template-rows:\s*minmax\(0, 1fr\) auto;/);
    assert.match(css, /\.panel\.is-reviewing \.panel__view\s*\{[\s\S]*min-height:\s*0;[\s\S]*flex:\s*none;/);
    assert.match(css, /\.panel\.is-reviewing \.scenario-actions\s*\{[\s\S]*display:\s*none;/);
    assert.match(css, /\.panel\.is-reviewing \.review-nav\s*\{[\s\S]*margin-top:\s*0;[\s\S]*padding-top:\s*var\(--space-sm\);/);
    assert.match(css, /\.panel\[data-mode="sort"\] \.groups\s*\{[\s\S]*overflow-y:\s*auto;/);
});

test('removes the completion heading accent line', () => {
    assert.match(css, /\.completion-overlay h2::after/);
    assert.match(css, /\.completion-overlay\s*\{[^}]*background: var\(--overlay-bg\)/);
});

test('activity header omits the eyebrow', () => {
    assert.doesNotMatch(html, /class="eyebrow eyebrow--amber"[^>]*id="headEyebrow"/);
    assert.doesNotMatch(script, /headEyebrow/);
});

test('uses updated attention-column language and completion guidance', () => {
    assert.match(html, /Can wait until a safe stop/);
    assert.match(html, /Needs action now/);
    assert.doesNotMatch(html, /What can wait|What can.t wait/);
    assert.match(html, /Interruptions often come when you&rsquo;re already busy, making them feel more urgent than they are\./);
    assert.doesNotMatch(script, /What can wait|What can.t wait/);
});

test('uses the combined sorting and scenario instruction in the check header', () => {
    const instruction = 'Drag each situation to the column and choose the best response to the scenarios.';
    assert.match(html, new RegExp(instruction.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(script, new RegExp(instruction.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('shows five sorting items at a time without a scrollable tray', () => {
    assert.match(css, /\.source-bank\s*\{[\s\S]*overflow:\s*hidden;/);
    assert.match(css, /\.source-bank \.wait-item:nth-child\(n\+6\)\s*\{[\s\S]*display:\s*none;/);
    assert.match(css, /\.source-bank \.wait-item\s*\{[\s\S]*font-size:\s*20px;/);
});

test('shows dragged and remaining item counts in the sorting progress meter', () => {
    assert.match(script, /function updateSortProgress\(done\)[\s\S]*`\$\{done\} dragged`[ -￿]*`\$\{SORT_TOTAL - done\} not dragged`/);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const index = fs.readFileSync('index.html', 'utf8');
const styles = fs.readFileSync('styles.css', 'utf8');
const script = fs.readFileSync('script.js', 'utf8');

test('frozen clip exposes a replay control with clear copy', () => {
    assert.match(index, /class="stage__replay"[^>]*id="replayBtn"/);
    assert.match(index, />Replay clip</);
    assert.doesNotMatch(index, /stage__freeze|freezeBar/);
    assert.doesNotMatch(styles, /stage__freeze/);
    assert.doesNotMatch(script, /freezeBar/);
    assert.match(index, /class="stage__cap"[^>]*id="stageCap"/);
    assert.match(styles, /\.stage__cap/);
    assert.match(script, /stageCap/);
    assert.doesNotMatch(script, /Scenario 1 \\u00b7 the notification/);
});

test('replay control is visible only while the clip is frozen', () => {
    assert.match(styles, /\.stage__replay\s*\{[\s\S]*opacity:\s*0/);
    assert.match(styles, /\.stage\.is-frozen \.stage__replay\s*\{[\s\S]*opacity:\s*1/);
});

test('replay control uses the existing replay behavior', () => {
    assert.match(script, /el\.replayBtn\s*=\s*document\.getElementById\('replayBtn'\)/);
    assert.match(script, /el\.replayBtn\.addEventListener\('click', watchClipAgain\)/);
    assert.match(script, /if \(state\.answered \|\| button\.disabled \|\| button\.classList\.contains\('is-locked'\)\)/);
    assert.match(script, /function watchClipAgain\(\)[\s\S]*state\.replaying = true;[\s\S]*playClip\(\);/);
});

test('question option labels stay fixed while answer content shuffles', () => {
    assert.match(script, /function shuffleOptionContent\(\)/);
    assert.match(script, /function enterReflect\(\)\s*\{[\s\S]*shuffleOptionContent\(\)/);
    assert.match(index, /data-key="A"[\s\S]*data-key="B"[\s\S]*data-key="C"[\s\S]*data-key="D"/);
    assert.match(script, /button\.dataset\.correct === 'true'/);
    assert.match(script, /o\.dataset\.correct === 'true'/);
});

test('intro removes the interruption-normalization sentence', () => {
    assert.doesNotMatch(index, /Every interruption on this drive is normal\./);
});

test('activity opens directly on the notification watch phase', () => {
    assert.match(index, /<div id="app" data-screen="beat" data-phase="watch">/);
    assert.match(index, /<section class="screen screen--beat" id="screenBeat1">/);
    assert.doesNotMatch(index, /screen--intro|screenIntro|id="startBtn"|Start the drive/);
    assert.doesNotMatch(script, /function startDrive\(\)/);
});

test('restart returns directly to the notification watch phase', () => {
    assert.match(script, /el\.screenBeat\.hidden = false;/);
    assert.match(script, /el\.app\.dataset\.screen = 'beat';/);
    assert.match(script, /el\.app\.dataset\.phase = 'watch';/);
    assert.doesNotMatch(script, /el\.screenIntro\.hidden = false/);
    assert.doesNotMatch(script, /el\.startBtn\.focus\(\)/);
});

test('notification header uses the title without an eyebrow or progress rail', () => {
    assert.doesNotMatch(index, /class="eyebrow eyebrow--amber"/);
    assert.doesNotMatch(index, /<ul class="rail"/);
    assert.doesNotMatch(index, /rail__seg|rail__icon/);
});

test('eyebrow styling is removed from the notification web object', () => {
    assert.doesNotMatch(styles, /\.eyebrow(?:--amber)?(?:\s|\{|:)/);
});

test('selecting an option immediately reveals the answer and removes Check answer', () => {
    assert.doesNotMatch(index, />Check answer</);
    assert.match(script, /function revealAnswer\(button\)/);
    assert.match(script, /function selectOption\(button\)\s*\{[\s\S]*revealAnswer\(button\)/);
    assert.doesNotMatch(script, /el\.checkBtn/);
});

test('completion layer opens only after the learner clicks the final-message button', () => {
    assert.match(index, /id="takeawayBtn"[^>]*>See final message<\/button>/);
    assert.match(script, /function finishQuestion\(\)\s*\{[\s\S]*el\.takeawayBtn\.hidden = false;/);
    assert.match(script, /el\.takeawayBtn\.addEventListener\('click', enterTakeaway\)/);
    assert.doesNotMatch(script, /COMPLETION_DELAY_MS|later\(enterTakeaway/);
});

test('completion layer restarts the scenario and no takeaway panel remains', () => {
    assert.match(index, /id="completionOverlay"[\s\S]*<h2>Scenario complete<\/h2>/);
    assert.match(index, /id="completionOverlay"[\s\S]*class="takeaway-body">A quick glance can still take your eyes and mind off a roadway that is/);
    assert.doesNotMatch(index, /Review the takeaway, then try the scenario again if you want another pass\./);
    assert.match(index, /id="overlayDismiss"[^>]*>Review the scenario<\/button>/);
    assert.doesNotMatch(index, />Continue the drive</);
    assert.match(script, /function enterTakeaway\(\)\s*\{[\s\S]*showCompletion\(\)/);
    assert.doesNotMatch(index, /id="takeawayPanel"/);
    assert.match(script, /function restart\(\)/);
    assert.match(script, /el\.overlayDismiss\.addEventListener\('click', reviewQuestion\)/);
});

test('review scenario restores the completed question panel', () => {
    assert.match(script, /function reviewQuestion\(\)\s*\{/);
    assert.match(script, /function reviewQuestion\(\)[\s\S]*el\.app\.dataset\.phase = 'reflect';/);
    assert.match(script, /function reviewQuestion\(\)[\s\S]*el\.setupPanel\.hidden = true;/);
    assert.match(script, /function reviewQuestion\(\)[\s\S]*el\.reflectPanel\.hidden = false;/);
    assert.match(script, /function reviewQuestion\(\)[\s\S]*restoreAnsweredState\(\);/);
    assert.match(script, /function restoreAnsweredState\(\)[\s\S]*showFeedback\('incorrect', COPY\.incorrect\)/);
    assert.match(script, /function restoreAnsweredState\(\)[\s\S]*showFeedback\('correct', COPY\.correct\)/);
});

test('feedback uses a yellow leading bar with black text', () => {
    assert.match(styles, /\.feedback\s*\{[\s\S]*border-top:\s*2px solid var\(--border-muted\);/);
    assert.match(styles, /\.feedback:not\(.has-message\)\s*\{[\s\S]*display:\s*none;/);
    assert.match(styles, /\.feedback__text\s*\{[\s\S]*border-left:\s*4px solid var\(--emphasis-color\);/);
    assert.match(styles, /\.feedback\.success,\s*\.feedback\.error\s*\{\s*color:\s*var\(--text-color\);/);
});

test('feedback stays empty until an option is selected', () => {
    assert.match(script, /function enterReflect\(\)\s*\{[\s\S]*showFeedback\('', ''\);/);
    assert.match(script, /el\.className = `feedback \$\{text \? 'has-message ' : ''\}/);
    assert.doesNotMatch(script, /You have seen how it plays out\. Now make the call\./);
});

test('N shortcut finishes the clip and exposes a video-finished variable', () => {
    assert.match(script, /const ENABLE_SKIP_TO_END = true;/);
    assert.match(script, /const VIDEO_FINISHED_VAR = 'VideoFinished';/);
    assert.match(script, /setStorylineVariable\(VIDEO_FINISHED_VAR, true\);/);
    assert.match(script, /if \(ENABLE_SKIP_TO_END && \(event\.key === 'n' \|\| event\.key === 'N'\)\) skipToEnd\(\);/);
});

test('video progress is locked on first watch and seekable after replay', () => {
    assert.match(index, /class="stage__progress"[^>]*aria-disabled="true"/);
    assert.match(script, /setVideoSeekability\(false\)/);
    assert.match(script, /function setVideoSeekability\(enabled\)/);
    assert.match(script, /function watchClipAgain\(\)[\s\S]*setVideoSeekability\(true\)/);
    assert.match(script, /function seekVideoFromPointer\(event\)[\s\S]*el\.clip\.currentTime/);
    assert.match(script, /el\.stageProgress\.addEventListener\('pointerdown', startVideoSeek\)/);
    assert.match(styles, /\.stage__progress\s*\{[\s\S]*pointer-events:\s*none;/);
    assert.match(styles, /\.stage__progress\.is-seekable\s*\{[\s\S]*pointer-events:\s*auto;/);
});

test('replay progress keeps a larger drag target and center click toggles playback', () => {
    assert.match(styles, /\.stage__progress\s*\{[\s\S]*height:\s*28px;/);
    assert.match(styles, /\.stage__progress::before\s*\{[\s\S]*height:\s*8px;/);
    assert.match(script, /function toggleVideoPlayback\(\)[\s\S]*el\.clip\.pause\(\)[\s\S]*el\.clip\.play\(\)/);
    assert.match(script, /function handleClipClick\(\)[\s\S]*toggleVideoPlayback\(\)/);
    assert.match(script, /el\.clip\.addEventListener\('click', handleClipClick\)/);
});

test('paused video keeps the play overlay from blocking center-click resume', () => {
    assert.match(styles, /\.stage\.is-paused \.stage__play,[\s\S]*pointer-events:\s*none;/);
    assert.match(script, /function toggleVideoPlayback\(\)[\s\S]*is-paused[\s\S]*classList\.add\('is-playing'\)/);
    assert.match(script, /function playClip\(\)[\s\S]*remove\('is-paused'\)/);
});

test('review scenario always restores the frozen replay stage', () => {
    assert.match(script, /function reviewQuestion\(\)[\s\S]*el\.clip\.pause\(\)/);
    assert.match(script, /function reviewQuestion\(\)[\s\S]*el\.clip\.currentTime = end/);
    assert.match(script, /function reviewQuestion\(\)[\s\S]*updateVideoProgress\(100\)/);
    assert.match(script, /function reviewQuestion\(\)[\s\S]*setVideoSeekability\(false\)/);
    assert.match(script, /function reviewQuestion\(\)[\s\S]*is-frozen/);
});

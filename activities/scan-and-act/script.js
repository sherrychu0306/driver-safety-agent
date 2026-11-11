const STORYLINE_COMPLETE_VAR = 'ScanActDone';
const ACTIVITY_KEY = 'scan-and-act-v1';

const ICONS = {
  car: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 11 1.7-4h10.6L19 11M4 11h16v6H4zM7.5 17v2M16.5 17v2M7 14h.1M17 14h.1"/></svg>',
  person: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2"/><path d="m12 8-2 4 2 3 2 4M10 12 7 16M12 15l4 1 1 4"/></svg>',
  mirror: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="M6 12c2-3 4-3 6 0 2-3 4-3 6 0"/></svg>',
  light: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3M4.9 4.9 7 7M3 12h3M4.9 19.1 7 17M19.1 19.1 17 17M21 12h-3M19.1 4.9 17 7"/><circle cx="12" cy="12" r="4"/></svg>'
};

const SCENARIOS = [
  {
    title: 'Residential street',
    prompt: 'You’re driving to your first work order of the day. It’s a two-way residential street, with cars parked on both sides.\n\nClick each area you should scan.',
    risks: [
      { id: 'risk-1', icon: 'car', label: 'Car backing out', explanation: 'A reversing car may enter your lane with little warning. Scan driveways and side streets, slow down, and cover the brake so you are ready to stop.', x: 72, y: 48, w: 13, h: 18 },
      { id: 'risk-2', icon: 'person', label: 'Person between cars', explanation: 'The person may step into your path. Watch the spaces between parked vehicles, reduce your speed, and be prepared to stop.', x: 19, y: 54, w: 12, h: 19 },
      { id: 'risk-3', icon: 'light', label: 'Driver inside parked car', explanation: 'The vehicle may pull into your lane, or the driver’s door may open into your path. Leave extra space and approach slowly.', x: 64, y: 72, w: 14, h: 17 },
      { id: 'risk-4', icon: 'mirror', label: 'Cyclist closing from behind', explanation: 'The cyclist may pass you where the street is narrow. Check your mirrors frequently, maintain your position, and leave enough room for the cyclist to pass safely.', x: 7, y: 70, w: 13, h: 18 }
    ],
    question: 'A car begins backing out of the driveway on your right. What do you do?',
    choices: ['Cover the brake and slow down, ready to stop', 'Sound the horn and keep your speed', 'Move toward the center line to pass', 'Speed up to clear the driveway'],
    correct: 'A',
    correctFeedback: 'Correct. Covering the brake and slowing gives you time to stop if the car keeps backing out. A driver who sees it early has more choices.',
    incorrectFeedback: 'Not quite. The horn, more speed, and swerving all depend on the other driver reacting in time. Cover the brake and slow down while you still have room.'
  },
  {
    title: 'Congested road',
    prompt: 'You’re driving between appointments on a three-lane road. Traffic is heavy but moving.\n\nClick each area you should scan.',
    risks: [
      { id: 'risk-5', icon: 'light', label: 'Brake lights ahead', explanation: 'Traffic is slowing before it reaches you. Look 12–15 seconds ahead, ease off the accelerator, and begin slowing early.', x: 46, y: 30, w: 14, h: 16 },
      { id: 'risk-6', icon: 'car', label: 'Box truck ahead', explanation: 'The truck blocks your view, giving you less warning about changing traffic. Increase your following distance and scan around the truck when it is safe to do so.', x: 43, y: 52, w: 16, h: 20 },
      { id: 'risk-7', icon: 'car', label: 'Vehicle signaling beside you', explanation: 'The vehicle may merge into your lane. Ease off and create enough space for it to merge safely.', x: 69, y: 49, w: 16, h: 18 },
      { id: 'risk-8', icon: 'mirror', label: 'Pickup close behind', explanation: 'The pickup has little room to stop if you brake suddenly. Check your mirrors, slow down early, and brake gradually to give the driver behind you more warning.', x: 9, y: 51, w: 15, h: 18 }
    ],
    question: 'Traffic ahead is slowing, and a pickup is close behind you. What do you do?',
    choices: ['Ease off early, brake gradually, and tap your brakes to alert the driver behind you', 'Wait until the car ahead brakes, then stop firmly', 'Change lanes to get ahead of the slowdown', 'Speed up to gain space from the pickup'],
    correct: 'A',
    correctFeedback: 'Correct. Slowing early and braking gradually gives you room, and tapping the brakes warns the driver behind you.',
    incorrectFeedback: 'Not quite. Waiting, switching lanes, and speeding up all shorten your options. Sudden braking can also contribute to being rear-ended.'
  }
];

const HOTSPOT_COUNT = 4;

const el = {
  scenarioEyebrow: document.querySelector('#scenarioEyebrow'), scenarioTitle: document.querySelector('#scenarioTitle'), scenarioPrompt: document.querySelector('#scenarioPrompt'),
  hotspotLayer: document.querySelector('#hotspotLayer'), riskLabelLayer: document.querySelector('#riskLabelLayer'), riskFeedback: document.querySelector('#riskFeedback'), scenePlaceholder: document.querySelector('#scenePlaceholder'), scenePlaceholderTitle: document.querySelector('#scenePlaceholderTitle'), scenePlaceholderNote: document.querySelector('#scenePlaceholderNote'),
  scanView: document.querySelector('#scanView'), questionView: document.querySelector('#questionView'), questionText: document.querySelector('#questionText'), options: document.querySelector('#options'), feedback: document.querySelector('#feedback'), feedbackEyebrow: document.querySelector('#feedbackEyebrow'), feedbackText: document.querySelector('#feedbackText'),
  checkBtn: document.querySelector('#checkBtn'), backBtn: document.querySelector('#backBtn'), nextBtn: document.querySelector('#nextBtn'), progressCount: document.querySelector('#progressCount'), progressFill: document.querySelector('#progressFill'), completion: document.querySelector('#completion'), reviewBtn: document.querySelector('#reviewBtn'), retryBtn: document.querySelector('#retryBtn')
};

const stateStore = DriverSafetyState.create(ACTIVITY_KEY);
const blankScenario = () => ({ selected: [], checked: false, answer: null, feedback: '' });
const state = Object.assign({ scenario: 0, completed: false, completionOpen: false, review: false, scenarios: SCENARIOS.map(blankScenario) }, stateStore.read() || {});
state.scenarios = SCENARIOS.map((_, index) => Object.assign(blankScenario(), state.scenarios?.[index] || {}));
let storylineReported = false;

function getPlayer() { try { return window.GetPlayer?.() || window.parent?.GetPlayer?.() || window.top?.GetPlayer?.() || null; } catch (error) { return null; } }
function reportCompletion(value) { try { getPlayer()?.SetVar?.(STORYLINE_COMPLETE_VAR, value); } catch (error) {} }
function save() { stateStore.write(JSON.parse(JSON.stringify(state))); }
function active() { return SCENARIOS[state.scenario]; }
function activeState() { return state.scenarios[state.scenario]; }
function svgFor(icon) { return ICONS[icon] || ICONS.car; }

function renderHotspots() {
  const data = active(); const progress = activeState();
  el.hotspotLayer.innerHTML = ''; el.riskLabelLayer.innerHTML = '';
  el.hotspotLayer.hidden = progress.checked;
  el.riskFeedback.innerHTML = '';
  const currentRisk = data.risks.find((risk) => risk.id === progress.selected.at(-1));
  if (currentRisk) {
    const feedback = document.createElement('article'); feedback.className = 'risk-feedback';
    const explanation = document.createElement('p'); explanation.className = 'risk-feedback__text'; explanation.textContent = currentRisk.explanation;
    feedback.append(explanation); el.riskFeedback.appendChild(feedback);
  }
  data.risks.forEach((risk) => {
    const button = document.createElement('button');
    const selected = progress.selected.includes(risk.id);
    const missed = progress.checked && !selected;
    button.type = 'button'; button.className = `hotspot${selected ? ' selected' : ''}${missed ? ' missed' : ''}${progress.checked ? ' locked' : ''}`;
      const position = risk;
      button.style.left = `${position.x}%`; button.style.top = `${position.y}%`; button.style.width = `${position.w}%`; button.style.height = `${position.h}%`;
    button.dataset.risk = risk.id; button.setAttribute('aria-label', `${risk.label}${selected ? ', selected' : ''}`); button.setAttribute('aria-pressed', String(selected)); button.innerHTML = svgFor(risk.icon);
    button.addEventListener('click', () => { if (progress.checked || selected) return; progress.selected = [...progress.selected, risk.id]; save(); render(); });
    el.hotspotLayer.appendChild(button);
  });
  el.checkBtn.disabled = progress.selected.length < HOTSPOT_COUNT || progress.checked;
}

function renderQuestion() {
  const data = active(); const progress = activeState();
  el.questionText.textContent = data.question; el.options.innerHTML = '';
  el.feedback.hidden = !progress.feedback;
  el.feedback.classList.toggle('is-wrong', Boolean(progress.answer && progress.answer !== data.correct));
  el.feedbackEyebrow.textContent = progress.answer === data.correct ? 'Correct' : 'Not quite';
  el.feedbackText.textContent = progress.feedback || '';
  data.choices.forEach((choice, index) => {
    const key = String.fromCharCode(65 + index); const button = document.createElement('button'); const selected = progress.answer === key; const correct = progress.answer && key === data.correct; const incorrect = selected && key !== data.correct;
    button.type = 'button'; button.className = `option${selected ? ' selected' : ''}${correct ? ' correct' : ''}${incorrect ? ' incorrect' : ''}`; button.dataset.key = key; button.setAttribute('role', 'radio'); button.setAttribute('aria-checked', String(selected)); button.disabled = Boolean(progress.answer); button.innerHTML = `<span class="option__key">${key}</span><span class="option__text">${choice}</span><span class="option__mark" aria-hidden="true">${correct ? '✓' : incorrect ? '✕' : ''}</span>`; button.addEventListener('click', () => answer(key)); el.options.appendChild(button);
  });
  el.backBtn.disabled = false;
  el.nextBtn.hidden = !progress.answer;
  el.nextBtn.textContent = state.scenario === SCENARIOS.length - 1 ? 'Finish activity' : 'Next scenario';
}

function render() {
  const data = active(); const progress = activeState();
  const [context, instruction] = data.prompt.split('\n\n');
  const contextElement = document.createElement('span'); contextElement.className = 'prompt__context'; contextElement.textContent = context;
  const instructionElement = document.createElement('span'); instructionElement.className = 'prompt__instruction'; instructionElement.textContent = instruction;
  el.scenarioPrompt.replaceChildren(contextElement, instructionElement);
  el.scenePlaceholderTitle.textContent = progress.checked ? 'Act photo placeholder' : 'Photo placeholder';
  el.scenePlaceholderNote.textContent = progress.checked ? 'Replace with approved act scene image' : 'Replace with approved scene image';
  el.scenarioEyebrow.textContent = progress.checked ? `Scenario ${state.scenario + 1} · Act` : `Scenario ${state.scenario + 1}`; el.scenarioTitle.hidden = progress.checked; el.scenarioPrompt.hidden = progress.checked; el.scenarioTitle.textContent = data.title;
  const foundCount = Math.max(1, progress.selected.length);
  el.progressCount.textContent = String(foundCount); el.progressFill.style.width = `${(foundCount / HOTSPOT_COUNT) * 100}%`;
  el.scanView.hidden = progress.checked; el.questionView.hidden = !progress.checked; renderHotspots(); if (progress.checked) renderQuestion();
  el.completion.classList.toggle('active', state.completionOpen);
  el.completion.setAttribute('aria-hidden', String(!state.completionOpen));
  el.completion.inert = !state.completionOpen;
}

function check() { activeState().checked = true; save(); render(); }
function answer(key) { const data = active(); const progress = activeState(); progress.answer = key; progress.feedback = key === data.correct ? data.correctFeedback : data.incorrectFeedback; save(); render(); }
function finishActivity() { state.completed = true; state.completionOpen = true; state.review = false; reportCompletion(true); storylineReported = true; save(); render(); }
function goTo(index) { state.scenario = Math.max(0, Math.min(SCENARIOS.length - 1, index)); state.completionOpen = false; state.review = state.completed; save(); render(); }
function goBack() {
  activeState().checked = false;
  state.completionOpen = false;
  save();
  render();
}
function review() { state.completionOpen = false; state.review = true; state.scenario = 0; save(); render(); }
function retry() { state.scenario = 0; state.completed = false; state.completionOpen = false; state.review = false; state.scenarios = SCENARIOS.map(blankScenario); stateStore.clear(); reportCompletion(false); storylineReported = false; save(); render(); }

el.checkBtn.addEventListener('click', check); el.backBtn.addEventListener('click', goBack); el.nextBtn.addEventListener('click', () => state.scenario === SCENARIOS.length - 1 ? finishActivity() : goTo(state.scenario + 1)); el.reviewBtn.addEventListener('click', review); el.retryBtn.addEventListener('click', retry);

if (state.completed && state.completionOpen === undefined) state.completionOpen = true;
if (state.completed && state.completionOpen) reportCompletion(true);
render();

if (typeof window !== 'undefined') window.ScanAndAct = { SCENARIOS, state, render, check, answer, goTo, finishActivity, retry, review, get storylineReported() { return storylineReported; } };

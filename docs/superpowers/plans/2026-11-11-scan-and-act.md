# Scan and act Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and QA a self-contained two-scenario hotspot-plus-multiple-choice Storyline web object for module 2.

**Architecture:** A small activity package under `activities/scan-and-act/` uses separate HTML, CSS, JS, and state-store files. The JS owns scenario data, rendering, state persistence, Storyline reporting, keyboard navigation, review, and retry; the CSS reuses the extracted Vivint tokens and lays out a 1560 × 878 shell with photo placeholders.

**Tech Stack:** HTML, CSS, browser JavaScript, Node test runner, local WOFF2 fonts and inline/local SVG icons.

**Spec:** `docs/superpowers/specs/2026-11-11-scan-and-act-design.md`

## Global Constraints

- Target a 1560 × 878 Storyline web-object viewport.
- Keep every deliverable self-contained and use relative asset paths.
- Preserve supplied instructional meaning and answer key.
- Use `ScanActDone` as the Storyline completion variable.
- Use top-window state with a `sessionStorage` fallback.
- Do not modify approved activities in `reference-activities/`.

## Review Focus

- Partial hotspot selections must reveal missed risks without marking unselected correct risks as found.
- Completed revisits must open in review mode with both scenarios navigable backward and forward.
- Retry must clear selections, answers, feedback, progress, and Storyline completion.
- Keyboard-only users must be able to select hotspots, check, choose an answer, and navigate.
- The activity must remain self-contained with photo placeholders and local fonts/icons.

### Task 1: Activity contract and state tests

**Files:**
- Create: `activities/scan-and-act/tests/activity-contract.test.mjs`
- Create: `activities/scan-and-act/tests/state-store.test.mjs`
- Create: `activities/scan-and-act/state-store.js`

**Interfaces:**
- Produces `DriverSafetyState.create(key)` with `read`, `write`, `clear`, and top-level-refresh semantics.

- [ ] Write failing tests for the two-scenario copy/answer contract and state persistence semantics.
- [ ] Run the focused tests and observe the expected failures before implementation.
- [ ] Implement the state store by adapting the approved reference pattern without changing reference files.
- [ ] Run the focused tests and verify they pass.

### Task 2: Learner-facing activity and behavior

**Files:**
- Create: `activities/scan-and-act/index.html`
- Create: `activities/scan-and-act/styles.css`
- Create: `activities/scan-and-act/script.js`
- Create: `activities/scan-and-act/fonts/vivintCircular-Regular.woff2`
- Create: `activities/scan-and-act/fonts/vivintCircular-Bold.woff2`
- Test: `activities/scan-and-act/tests/behavior.test.mjs`

**Interfaces:**
- Consumes `DriverSafetyState.create('scan-and-act-v1')`.
- Produces DOM behavior for hotspot selection/check, MCQ answer/feedback, scenario navigation, completion review, retry, keyboard access, and Storyline reporting.

- [ ] Write failing contract/behavior tests for forward flow, back navigation, revisit restoration, preserved feedback, completion review, retry/reset, and keyboard controls.
- [ ] Run the focused behavior tests and observe the expected failures.
- [ ] Implement the two-scenario learner flow with local placeholder scenes, inline/local icon SVGs, and supplied copy.
- [ ] Run focused tests and verify the activity behavior passes.

### Task 3: QA report and package checks

**Files:**
- Create: `activities/scan-and-act/QA.md`
- Modify: `package.json` only if a test script is needed.

- [ ] Run `npm test` for the existing reference suites.
- [ ] Run `npm run check:media`.
- [ ] Run focused new tests and a browser smoke test if Playwright is available.
- [ ] Record results, source/provenance, unresolved Storyline-only checks, and placeholder-image status in `QA.md`.


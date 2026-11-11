---
name: storyline-web-object-builder
description: Use when building, reviewing, testing, or packaging interactive Articulate Storyline 360 web objects for the Vivint Driver Safety course, especially when new training content needs a reusable interaction, local assets, official Vivint icons, GPT-generated photography, Playwright QA, and a self-contained package.
metadata:
  short-description: Build and QA Vivint Storyline web objects
---

# Vivint Storyline Web Object Builder

Use this skill to turn approved content into a self-contained Storyline web object. `AGENTS.md` is authoritative for course-wide rules; read `design-system/guidelines.md` before UI decisions.

## Consistency is a build requirement

Before changing code, read `AGENTS.md`, `design-system/guidelines.md`, `design-system/tokens.css`, and `design-system/components.css`, then inspect the closest approved activity’s HTML and CSS. Choose references by interaction type: `hotspot/cab-check` for hotspot discovery and right-panel feedback; `scenario/distraction-drive` for question panels and answer options; and approved completion overlays for completion states. Reuse their structure, classes, and token values where practical.

Do not create a visual match by appending overrides at the end of a stylesheet. Edit the owning rule, remove obsolete declarations, and keep one authoritative rule per component/state. Use shared tokens for fonts, text sizes, spacing, radii, color, and motion. Learner-action buttons default to 20px. Keep the 1560 × 878 viewport and 1560 × 720 app shell from `AGENTS.md` intact.

Apply the user-confirmed defaults in `AGENTS.md`, including fixed hotspot positions, one right-panel explanation at a time, hidden panel scrollbars, Back to the same scenario’s hotspots, explicit final completion after feedback, and a full-viewport completion layout. Instructions in the active request take precedence over these defaults.

## Foundation gate

Treat approved references as the visual source of truth. Before building:

1. Inspect the inventory and relevant source files.
2. Extract typography, colors, states, components, spacing, motion, and responsive behavior.
3. Update design-system evidence and obtain user review while it is provisional.

Never invent an “approved” token from memory or from generic Vivint branding.

## Build workflow

1. Identify the instructional goal, learner action, success condition, reset behavior, and supplied content. Do not invent policy or answers.
2. Select the closest approved pattern: hotspot, scenario question, before/after comparison, click-to-reveal, drag/drop, or another justified pattern.
3. Build separate HTML, CSS, and JavaScript files for a 1560 × 878 viewport. Reuse shared tokens/components and relative local asset paths.
4. For icons, search the official Vivint library first: https://www.brand.vivint.com/icons. Reuse a locally stored SVG when available, preserve its proportions, and record provenance. If no suitable icon is available or access is unauthorized, report the gap and propose alternatives; do not silently substitute.
5. For needed photographic assets, use GPT image generation with the course’s photorealistic commercial/documentary direction, inspect the result, save the selected image locally with a descriptive filename, and do not use external URLs.

### Intake questions

When new content arrives, confirm the interaction type; if unspecified, recommend the closest pattern from the learning goal and learner action. Ask for final copy, answer key/outcome, images, video, audio, captions/transcripts, icons, reference examples, and Storyline/LMS requirements.

Suggest Storyline variables before implementation using clear underscore-based names, such as `vwo_roadway_change_completed`, `vwo_roadway_change_score`, or `vwo_roadway_change_current_step`; ask the user to confirm their naming convention.

### Copy style

Use sentence case for learner-facing headings, instructions, answers, buttons, feedback body, captions, and completion messages. Eyebrows, feedback eyebrows, progress bars/meters, brand names, product names, acronyms, proper nouns, and required technical labels may retain established capitalization.

## QA and packaging

Run `npm test` for the reference suites. For every new activity, implement and test free Back/Next movement, saved/restored view and progress, preserved answers/feedback, review mode, completion review, and retry/reset. Use top-window state with a `sessionStorage` fallback so iframe/slide revisits persist while a true top-level refresh starts fresh.

Run `npm run check:media` for image/video budgets. Use Playwright for interactions, feedback/navigation, revisit/review, retry/reset, assets/fonts/icons, console errors, overflow, keyboard/accessibility, and completion. Capture screenshots against approved references; fix and rerun failures, reporting anything unresolved.

Package a self-contained folder with `index.html`, CSS/JS, fonts, local SVGs, media, and a QA report covering summary, sources, tests/results, unresolved issues, and remaining Storyline checks.

Do not modify approved activities in `reference-activities/` unless the user explicitly requests a change to that reference. New activities should copy patterns and shared guidance without changing the approved source files.

## Required consistency and runtime QA

For every activity, use the user-confirmed defaults in `AGENTS.md`. Before styling, inspect the exact reference activity’s HTML/CSS and shared tokens/components. Do not append CSS patches over mismatched rules; edit the owning component rule and remove superseded declarations. Keep one authoritative style per component/state.

Runtime-test every navigation transition in a real browser. Cover Back from each activity view (including Act → same-scenario hotspots), forward navigation, preserved found items/answers/feedback, revisit restoration, completion review, explicit final completion after feedback, and retry/reset. Regex/source tests are supplemental and do not count as navigation verification. Capture screenshots at 1560 × 878 plus a supported narrow viewport for the initial, feedback, review, and completion states; compare with the selected approved reference and fix mismatches before handoff.

## Required handoff

State the activity format, files created, evidence used for design decisions, tests actually run, and remaining Storyline-only checks. Do not claim visual or functional verification without the corresponding evidence.

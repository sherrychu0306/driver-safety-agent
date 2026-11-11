# Vivint Driver Safety Storyline Web Objects

## Current foundation status

This repository is the reusable foundation for Articulate Storyline 360 web objects. Six approved reference activities have been analyzed; `design-system/guidelines.md` and `design-system/tokens.css` contain the extracted baseline. The Vivint colors and fonts are confirmed as correct by the user.

Do not claim final design consistency until the extracted foundation is reviewed.

## Project-wide rules

- Target a 1560 × 878 Storyline web-object viewport.
- Keep every deliverable self-contained and use relative asset paths.
- Reuse approved patterns and tokens before introducing new styles.
- Use the official Vivint [icon library](https://www.brand.vivint.com/icons) first. If no suitable icon is available, propose a locally created SVG or ask the user to provide one before final packaging.
- Keep retrieved icons local in the activity package and record source, retrieval date, and authorization in the QA report.
- Use GPT-generated photography only when the activity needs a photographic asset; inspect safety-critical or complex images before finalizing.
- Optimize packaged photos and video for the Storyline viewport; run `npm run check:media` before handoff. Keep high-resolution source references under `assets/photo-references/`, not inside activity packages.
- Preserve supplied instructional meaning. Do not invent policies, safety requirements, or assessment answers.
- Use sentence case for learner-facing headings, instructions, options, buttons, feedback body, captions, and completion messages. Eyebrows, feedback eyebrows, progress bars/meters, brand names, product names, acronyms, proper nouns, and required technical labels may retain established capitalization.
- Verify behavior, console errors, assets, overflow, keyboard access, completion/reset states, and screenshots with Playwright when implementing an activity.
- Run the existing reference suites with `npm test`; the runner executes each suite from its activity directory so relative fixture paths resolve correctly.
- Apply the Revisit and Navigation Contract below to every new web object.
- Report unresolved issues and Storyline-published-output checks honestly.

## Consistency contract

- Treat `design-system/tokens.css`, `design-system/components.css`, and the closest approved activity as the implementation source of truth. Read the relevant reference HTML/CSS before writing styles; do not recreate patterns from memory or screenshots alone.
- Start from the closest approved activity structure and component rules, then adapt only content and interaction-specific pieces. Reuse shared tokens and primitives. Do not append successive CSS overrides to compensate for mismatched base styles; update the original rule and remove superseded declarations.
- Keep typography, button dimensions, radii, panel borders, spacing, shadows, focus rings, and transitions token-based. Learner-action buttons use 20px text by default. Secondary/Back actions use a transparent surface with the approved outline/text treatment. Primary actions use the approved green fill.
- Preserve the series shell exactly: 1560 × 878 viewport, centered 1560px max-width app, 720px max-height content area, 0 60px horizontal app padding, 24px base type, and 1.4 line-height. Do not introduce conflicting shell rules later in the stylesheet.
- Before handoff, compare screenshots at the Storyline viewport and a supported narrow viewport against the selected reference. Check initial, feedback, review, and completion states, not only the first screen.

## User-confirmed interaction and visual defaults

- Hotspot activities follow `reference-activities/hotspot/cab-check`: authored, stable hotspot coordinates; no random repositioning on entry or retry; the selected hotspot’s explanation appears in the right panel as one readable feedback item at a time; use the amber leading rule. Keep progress in the header meter rather than duplicating it as status text.
- For four-hotspot scenarios, keep Check disabled until all four risks are found. Clicking a found hotspot does not unselect it. Reset the hotspot count for the next scenario as specified by the approved interaction.
- In a scenario Act view, Back returns to that same scenario’s hotspot view and preserves found risks, answers, and feedback. It must not jump to the previous scenario. In review, completed scenarios remain navigable in both directions without clearing stored responses.
- The final answer shows feedback first. Completion opens only after an explicit Finish/Continue action. Completion uses a viewport-covering overlay, not a floating card; omit the completion eyebrow unless approved copy calls for it. Keep summary text at least 20px, place Try again in transparent secondary style on the left, and the green review action on the right.
- Keep the right panel scrollbar-free. When a panel section needs overflow, scroll within that section and visually hide its scrollbar.
- These defaults govern presentation and navigation only. Preserve supplied instructional meaning; do not infer new content or answers.

## New activity intake

When the user provides new activity content, ask for or confirm:

- the intended interaction type; if it is not specified, recommend the closest reference pattern;
- the Storyline variable(s) needed and a suggested name using the activity slug, such as `vwo_activity_slug_completed` or `vwo_activity_slug_score`;
- all source materials, including approved copy, answer keys, images, videos, audio, captions/transcripts, icons, and any relevant reference files;
- completion, retry, reporting, and accessibility requirements.

Do not start implementation until the interaction direction and required materials are clear enough to avoid inventing content or behavior.

## Approved reference protection

The existing activities in `reference-activities/` are approved references and remain unchanged unless the user explicitly requests an update to a specific reference. New work should reuse their patterns without modifying their files.

## Media performance standard

- Package local images at no more than 1920px on the long edge and target JPEG/WebP assets below 1.5 MB each.
- Package video as H.264/AAC MP4 with fast-start metadata, a maximum 1600px width unless the interaction requires more, and a target below 4 MB per clip.
- Preload only the first required visual/audio asset; lazy-load or preload the next asset where the interaction benefits from it.
- Do not use external media URLs in completed web objects.

## Workflow gate

1. Analyze or update the approved reference inventory and design tokens.
2. Obtain review of the design foundation.
3. For new content, identify the instructional goal and choose/reuse an interaction pattern.
4. Build, QA, package, and produce a QA report.

## Revisit and Navigation Contract

- Learners must be able to move backward and forward freely through completed content; do not create a one-way flow that traps the learner after advancing.
- Save the current view/index, answered items, feedback, progress, completion state, and review mode on every meaningful transition.
- Restore the learner’s last meaningful view when Storyline revisits the web object. Preserve answers and feedback; answered items may become read-only in review mode, but must remain navigable.
- Use top-window state with a `sessionStorage` fallback so iframe/slide revisits preserve state while a true top-level browser refresh starts fresh.
- Completion must expose an intentional review path with Back/Next or equivalent controls, plus an explicit retry/reset path where the activity supports retry.
- Do not auto-advance, replay media unexpectedly, or hide navigation during review. Any audio/video guardrail applies only to first-pass answering, not review navigation.
- Add runtime interaction tests for forward navigation, Back from every view (including Scenario 2 Act to Scenario 2 hotspots), backward navigation after completion, revisit restoration, preserved answers/feedback, explicit final completion, completion review, and retry/reset. Source-text/regex assertions do not count as navigation tests.
- Run the activity’s browser tests and `npm test`; fix failures before handoff. If browser testing cannot run, state the blocker and do not claim runtime verification.

The reusable workflow is defined in `storyline-web-object-builder/SKILL.md`. The intended `.agents/skills/` location is blocked by workspace permissions, so this project-local copy is the active fallback.

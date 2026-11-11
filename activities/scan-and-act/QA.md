# Scan and act QA report

## Summary

Built a self-contained two-scenario Vivint Storyline web object for the supplied module 2 content. The package uses photo placeholders for both scenes and local inline SVG markers for cars, people, mirrors, and warning/light cues.

## Package

- `index.html` — learner-facing structure and completion layer.
- `styles.css` — VivintCircular typography, extracted design tokens, responsive 1560 × 878 shell, hotspot/question/completion states.
- `script.js` — scenario data, hotspot reveal, answer feedback, navigation, review, retry, keyboard behavior, and Storyline reporting.
- `state-store.js` — top-window state with `sessionStorage` fallback.
- `fonts/` — local VivintCircular regular and bold WOFF2 files.

## Content and interaction checks

- Two scenarios are present in the supplied order.
- Each scenario contains four supplied risk targets and the supplied explanation copy.
- Both action questions use supplied choices, with A as the correct answer.
- Correct and incorrect feedback uses the supplied wording.
- Completion follows the cab-check overlay style: translucent viewport-covering background, large green lead with amber rule, 720px copy measure, and centered retry/review buttons.
- Storyline completion variable is `ScanActDone`.
- The hotspot meter displays `1 of 4 risks` on each scenario and resets when the learner advances to the next scenario.
- Check stays disabled until all four risks in the current scenario have been selected.
- Hotspot locations use the fixed coordinates in the scenario data and remain in the same places on entry and retry.
- The right question panel hides its outer scrollbar; the answer-options region retains internal scrolling without showing a scrollbar so all option content stays within the panel.

## Tests and results

- `node --test activities/scan-and-act/tests/*.test.mjs` — PASS, 26 tests.
- `npm test` — PASS, all existing reference suites.
- `npm run check:media` — PASS. This package has no raster/video assets yet.
- Browser smoke test at `http://127.0.0.1:4173/activities/scan-and-act/index.html` — PASS for hotspot selection/reveal, action feedback, scenario 2 completion, backward review, retry/reset, keyboard activation, and top-level refresh reset.
- Browser console check — no error or warning entries observed.
- Mouse hotspot regression: fixed the label-layer overlay that intercepted photo clicks; live browser verification now selects all four hotspots and opens the multiple-choice question.
- Multiple-choice panel styling was aligned to `reference-activities/scenario/distraction-drive`: green top rule, scenario eyebrow, circular option keys, three-column option rows, result marks, bordered feedback block, and Back/Next action row.
- Live browser verification confirmed the question panel uses `overflow: hidden`, while the options region uses internal scrolling with hidden scrollbars.
- Action buttons render at 20px, selected hotspots cannot be toggled off, and the Back button remains enabled on the first scenario.
- Question text is regular weight. Back returns from any action question to that same scenario’s hotspot view while preserving selections and answer feedback.
- Removed the duplicate hotspot status line; the header progress meter is now the only hotspot progress indicator.
- Hotspot explanations now reveal one at a time in the right panel with the amber leading rule used by `reference-activities/hotspot/cab-check`; photo risk labels are not rendered.
- Updated all eight hotspot explanations with the supplied scan and response guidance, without scan-category lead-ins such as “The edges,” “Far ahead,” or “Your mirrors.”
- Completion now uses the approved full-area overlay pattern with centered content and review/retry actions, rather than a floating card.
- The completion overlay uses the supplied cab-check CSS pattern, keeps the closing statement regular (not italic), and centers both actions below the copy.
- Current browser screenshot verification for the completion redesign was blocked by the browser policy on local file URLs; activity and reference test suites pass.
- In scenario 2 Act, Back returns to Scenario 2’s hotspot view and preserves its four found risks; browser verified the scenario index remains 2.
- Final scenario answer feedback remains visible until the learner selects “Finish activity”; the completion layer and Storyline completion variable are triggered by that explicit action.

## Sources and asset provenance

- Visual tokens and typography: `design-system/guidelines.md`, `design-system/tokens.css`, and `design-system/components.css`, based on the six approved reference activities.
- Fonts: copied locally from `design-system/fonts/`.
- Icons: local inline SVGs created for this provisional placeholder build; no external icon retrieval or external media URL is used. Replace or align these with approved official Vivint icon-library assets before final packaging if required by brand review.
- Photography: intentionally not included yet per user direction. The scene is a CSS placeholder and must be replaced with approved local imagery later.

## Remaining Storyline-only checks

- Publish the package inside Storyline and confirm the web object can access/set `ScanActDone` in the target player.
- Confirm Storyline revisit behavior when the web object is embedded in the actual slide/iframe lifecycle.
- Confirm LMS completion/reporting and retry behavior in the published course.
- Replace both photo placeholders with approved local scene images, then rerun visual QA and `npm run check:media`.
- Review the provisional inline icons against the official Vivint icon library before final handoff.


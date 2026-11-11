# Vivint Driver Safety Web Object Design System

Status: **Extracted from approved references; colors and fonts confirmed**

## Evidence

Six approved HTML/CSS/JS references were analyzed: `cab-check`, `distraction-drive`, `key-takeaways`, `phone-notification`, `roadway-change`, and `what-can-wait`. Shared tokens are in [`tokens.css`](tokens.css).

Use the official [color guide](https://www.brand.vivint.com/color), [typography guide](https://www.brand.vivint.com/typography), and searchable [icon library](https://www.brand.vivint.com/icons). Store selected icons locally; if no suitable icon exists, create a simple SVG or ask the user to provide one.

## Extracted tokens

| Category | Approved value(s) | Evidence |
| --- | --- | --- |
| Font | VivintCircular; 400 regular, 700 bold | Every reference `styles.css` `@font-face` |
| Base body | 24px or 26px; line-height 1.4 | `key-takeaways` uses 26px; other shared files use 24px |
| Headings | 34–36px, 700, line-height 1.1, tracking about -0.015em | `h1` rules across references |
| Brand | `#00A073` primary, `#007A58` deep, `#FF8736` emphasis | Refreshed activity `:root` blocks |
| Text | `#14201F` primary, `#566766` muted | Shared `:root` blocks |
| Surfaces | `#F3EFE8` background, `#FBF9F5` card, `#0B1614` stage | Refreshed activity `:root` blocks |
| Feedback | `#C4362F` error; `#00A073` correct | All reference activities |
| Spacing | 8 / 16 / 24 / 32 / 48px | Shared `--space-*` tokens |
| Radius | 8px small, 12px medium, 20px pill; 14px used for some frames/cards | Shared tokens and `key-takeaways` |
| Shadows | `0 2px 8px` rest, `0 8px 24px` hover, `0 2px 4px` active, `0 18px 48px` stage | Shared tokens |
| Motion | 150ms fast, 300ms medium, 400ms slow; ease-out and spring curves | Shared tokens and transitions |
| Viewport shell | max-width 1560px, max-height 720px, horizontal padding usually 60px | All six references |

## Components and interaction states

- Header: left-aligned title/instruction and right-side progress meter; 2px muted-teal divider; 8px amber fill with spring progress transition.
- Primary action: teal fill, white label, 8px radius; hover lifts/shadows; active compresses; disabled lowers opacity and removes interaction.
- Secondary action: light/white surface with teal border or text; same motion and focus treatment.
- Cards/panels: light teal surface, muted-teal border, 12px or 14px radius; emphasis often appears as an amber top border.
- Options: bordered white cards with key/marker; selected/correct uses teal; incorrect uses red; locked states disable further selection after feedback.
- Feedback: live/status regions; correct and incorrect copy is explicit; feedback may be paired with an amber leading bar and black text.
- Completion: full overlay or completion layer with fade-in, spring pop-in, recap/review controls, and persisted completion state.
- Photo/video stage: dark stage background, rounded frame, cover-fit media, optional dark gradient overlay, local assets.
- Keyboard/accessibility: visible amber focus rings; arrow-key handling for option groups/carousels where present; `aria-live` feedback and disabled progress controls where applicable.

## Responsive behavior

Use split grids such as `1fr 500px` or `1.3fr .8fr` on desktop. At narrower widths, collapse to one column, reduce padding/type, preserve order, and test `overflow: hidden` clipping at 1560×878 and narrow breakpoints.

### Series viewport shell

Every web object in this series uses the same Storyline shell: `html, body` fill the viewport and center the content; `#app` is `width: 100%`, `max-width: 1560px`, `height: 100%`, `max-height: 720px`, and `padding: 0 60px`. The body uses 24px type and 1.4 line-height. This preserves the approved 1560 × 878 Storyline viewport with a 720px content area.

## Copy and capitalization

Use sentence case for headings, instructions, answers, buttons, feedback body, captions, and completion messages. Eyebrows, feedback eyebrows, progress bars/meters, brand names, product names, acronyms, proper nouns, and required technical labels may retain established capitalization.

## Revisit and navigation contract

Use `DriverSafetyState.create(<activity-key>)` with state on the top Storyline window and a `sessionStorage` fallback. A top-level browser refresh clears it; revisiting the Storyline slide preserves it.

Every activity must:

- allow free backward and forward navigation through previously visited content;
- save and restore the current view, progress, answers, feedback, media position where relevant, and completion/review mode;
- keep completed responses available for review without re-asking or double-counting them;
- provide explicit review navigation after completion and an explicit retry/reset action when retry is supported;
- test revisit restoration, Back/Next navigation, preserved feedback, completion review, and reset behavior.

## Media performance

Keep packaged images at or below 1920px on the long edge and target less than 1.5 MB per image. Encode video as fast-start H.264/AAC MP4, usually no wider than 1600px and below 4 MB per clip. Keep original high-resolution references outside activity packages and run `npm run check:media` before delivery.

## Review gate

Colors and fonts are confirmed. Keep `reference-activities/` unchanged unless the user explicitly requests an update. New activities may use `tokens.css` and `components.css`, adding only evidence-backed extensions.

## User-confirmed series decisions

These presentation and interaction choices were clarified during the Scan and act build. Apply them as defaults to future web objects unless the user’s current request specifies otherwise.

- Buttons use 20px learner-facing text. Primary actions use the green fill; Back/secondary actions use a transparent background with the established outlined treatment. Keep dimensions, radii, focus/hover/disabled states, and motion token-based.
- Hotspot discovery follows `reference-activities/hotspot/cab-check`: authored fixed coordinates, no random repositioning on entry or retry, and one selected hotspot explanation at a time in the right panel. Use readable text and an amber leading rule. Keep progress in the header meter. For four-risk scenarios, Check stays unavailable until all four are found; found hotspots cannot be deselected.
- In scenario activities, Back from Act returns to the hotspot view for that same scenario and preserves found risks, answers, and feedback. Review navigation moves freely backward and forward through completed scenarios without clearing responses.
- Final answer feedback stays visible until the learner selects an explicit Finish/Continue action. Completion uses a full-viewport overlay, not a floating card. Default to no completion eyebrow, summary text at least 20px, transparent Try again on the left, and green Review on the right.
- Keep the outer panel scrollbar hidden. Put overflow inside the options/feedback region and hide that region’s scrollbar visually.

Implementation standard: begin with shared tokens/components and the matching approved reference structure. Keep one authoritative CSS rule for each component/state; do not layer fixes at the end of the stylesheet. Compare screenshots for the initial, feedback, review, and completion states against the approved reference.

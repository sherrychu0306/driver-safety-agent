# Approved reference inventory

The foundation analysis covered these approved references:

| Activity | Format | Primary pattern | Evidence |
| --- | --- | --- | --- |
| `cab-check` | HTML/CSS/JS | Photo hotspot inspection with answer panel | `styles.css`, `script.js` |
| `distraction-drive` | HTML/CSS/JS | Guided scenes, audio guardrail, classification, recap/review | `styles.css`, `script.js` |
| `key-takeaways` | HTML/CSS/JS | Photo/takeaway carousel with progress and completion | `styles.css`, `script.js` |
| `phone-notification` | HTML/CSS/JS | Video scenario, response options, feedback, completion overlay | `styles.css`, `script.js` |
| `roadway-change` | HTML/CSS/JS | Position picker / visual response | `styles.css`, `script.js`, `position-picker.test.js` |
| `what-can-wait` | HTML/CSS/JS | Drag/drop classification with feedback and completion | `styles.css`, `script.js`, `tests/drag-drop.test.js` |

Four refreshed activities use the updated palette: `#F3EFE8` background, `#00A073` primary, `#007A58` deep teal, and `#FF8736` emphasis. `roadway-change` and `what-can-wait` remain because `new-references` contained no replacements; their core tokens use the same palette. Tests are co-located and run through root `npm test`.

# Scan and act design

## Intent

Build a reusable Vivint Storyline web object for module 2 that teaches drivers to scan beyond the vehicle directly ahead, identify risks that could enter their path, and choose a response that preserves time and space.

## Interaction

The activity has two sequential scenarios. In each scenario the learner reads the scene, selects every listed risk area in a photo placeholder, clicks Check, reviews labels for found risks and highlights for missed risks, then answers a four-choice action question. After scenario 2, the learner sees a completion/review layer.

## Content constraints

- Preserve the supplied scenario copy, hotspot targets, risk explanations, answer choices, correct answer A, and feedback.
- Use photo placeholders for now; local SVG icon markers are acceptable.
- Use sentence case for learner-facing copy.
- Storyline completion variable: `ScanActDone`.
- No external media URLs.

## State and navigation

Save and restore current scenario, hotspot selections, revealed risks, selected answers, feedback, completion, and review mode using `DriverSafetyState.create('scan-and-act-v1')`. Completed content remains navigable for review, and retry clears the activity state and Storyline completion variable.

## Accessibility and viewport

Target a 1560 × 878 viewport, expose hotspots as keyboard-focusable buttons with labels, provide live feedback, visible focus states, and ensure the scenario and question controls remain usable without a pointer.


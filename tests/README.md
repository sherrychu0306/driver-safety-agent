# Test suites

Reference tests remain beside their activities because they use relative imports and fixtures. Run all suites from the repository root:

```bash
npm test
```

Add new activity tests to `scripts/run-reference-tests.mjs` or a future activity-specific runner.

Every new activity must test forward/back navigation, revisit restoration, preserved answers and feedback, completion review, retry/reset behavior, and sentence-case copy. Eyebrows, feedback eyebrows, and progress-bar/progress-meter labels may retain established capitalization.

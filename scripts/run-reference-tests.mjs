import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const suites = [
  ["reference-activities/scenario/distraction-drive", "test/audio-controls.test.mjs"],
  ["reference-activities/scenario/distraction-drive", "test/beat1-preview.test.mjs"],
  ["reference-activities/takeaway/key-takeaways", "tests/carousel.test.mjs"],
  ["reference-activities/takeaway/key-takeaways", "tests/state-store.test.mjs"],
  ["reference-activities/scenario/phone-notification", "tests/rewatch.test.js"],
  ["reference-activities/comparison/roadway-change", "position-picker.test.js"],
  ["reference-activities/scenario/what-can-wait", "tests/drag-drop.test.js"]
];

let failed = false;
for (const [relativeCwd, testFile] of suites) {
  const cwd = path.join(projectRoot, relativeCwd);
  console.log(`\n▶ ${relativeCwd}/${testFile}`);
  const result = spawnSync(process.execPath, ["--test", testFile], {
    cwd,
    stdio: "inherit"
  });

  if (result.error) {
    console.error(result.error);
    failed = true;
  } else if (result.status !== 0) {
    failed = true;
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("\nAll reference test suites passed.");
}

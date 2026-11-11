import fs from "node:fs";
import path from "node:path";

const root = path.resolve("reference-activities");
const limits = new Map([
  [".jpg", 1_500_000],
  [".jpeg", 1_500_000],
  [".png", 1_500_000],
  [".webp", 1_500_000],
  [".mp4", 4_000_000],
  [".webm", 4_000_000]
]);

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(fullPath) : [fullPath];
  });
}

const media = filesIn(root).filter(file => limits.has(path.extname(file).toLowerCase()));
const oversized = media.filter(file => fs.statSync(file).size > limits.get(path.extname(file).toLowerCase()));

for (const file of media) {
  const sizeMb = (fs.statSync(file).size / 1_000_000).toFixed(2);
  console.log(`${sizeMb} MB ${path.relative(process.cwd(), file)}`);
}

if (oversized.length) {
  console.error("\nMedia exceeds the Storyline package budget:");
  for (const file of oversized) console.error(`- ${path.relative(process.cwd(), file)}`);
  process.exitCode = 1;
} else {
  console.log("\nMedia budget check: PASS");
}

import { readFileSync } from "node:fs";
import { z } from "zod";

const args = process.argv.slice(2);
const commitMsgPath = args[0];

if (!commitMsgPath) {
  console.error("Missing commit message file path.");
  process.exit(1);
}

const rawMessage = readFileSync(commitMsgPath, "utf8").trim();
const firstLine = rawMessage.split("\n")[0] || "";

const conventionalRegex = /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9]+(?:[._/-][a-z0-9]+)*\))?(!)?: [a-z0-9].{0,99}$/;
const bypassRegex = /^(Merge|Revert|release:|Release:)/;

const conventionalSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(conventionalRegex, "Commit message must match conventional format.");

if (bypassRegex.test(firstLine)) {
  process.exit(0);
}

const parsed = conventionalSchema.safeParse(firstLine);
if (parsed.success) {
  process.exit(0);
}

console.error("\nInvalid commit message format.");
console.error("Expected: type(scope?): subject");
console.error("Allowed types: feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert");
console.error("Subject must start with lowercase letter/number and be <= 100 chars.");
console.error("Examples:");
console.error("  feat(auth): add server-side role check");
console.error("  fix(api): sanitize upload payload");
console.error("\nReceived:");
console.error(`  ${firstLine}`);
process.exit(1);

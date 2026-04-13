import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const expected = [
  { dir: ".claude", tool: "claude" },
  { dir: ".cursor", tool: "cursor" },
  { dir: ".gemini", tool: "gemini" },
  { dir: ".antigravity", tool: "antigravity" },
];

const errors = [];

const sourceOfTruthSchema = z.object({
  workspaceRules: z.literal("../AGENTS.md"),
  engineering: z.literal("../agents/ENGINEERING.md"),
  testing: z.literal("../agents/TESTING.md"),
});

const baseAgentConfigSchema = z.object({
  tool: z.enum(["claude", "cursor", "gemini", "antigravity"]),
  version: z.literal(1),
  sourceOfTruth: sourceOfTruthSchema,
  notes: z.array(z.string()).optional(),
});

const validateConfig = (dir, tool) => {
  const filePath = join(process.cwd(), dir, "agent-config.json");

  if (!existsSync(filePath)) {
    errors.push(`${dir}/agent-config.json is missing`);
    return;
  }

  let config;
  try {
    config = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${dir}/agent-config.json is not valid JSON: ${error.message}`);
    return;
  }

  const parsed = baseAgentConfigSchema.safeParse(config);
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      const issuePath = issue.path.length > 0 ? issue.path.join(".") : "root";
      errors.push(`${dir}/agent-config.json: ${issuePath} ${issue.message}`);
    });
    return;
  }

  if (parsed.data.tool !== tool) {
    errors.push(`${dir}/agent-config.json: tool must be '${tool}'`);
  }
};

expected.forEach(({ dir, tool }) => validateConfig(dir, tool));

if (errors.length > 0) {
  console.error("\nAgent config validation failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Agent config validation passed.");

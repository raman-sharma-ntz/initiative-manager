import { z } from "zod";
import { automationTaskSchema } from "./ticketValidation";

export const assistantRequestSchema = z.object({
  prompt: z.string().trim().max(4000).optional().or(z.literal("")),
  task: automationTaskSchema.optional(),
});

export type AssistantRequest = z.infer<typeof assistantRequestSchema>;

export const normalizeAssistantRequest = (input: unknown): AssistantRequest => {
  const parsed = assistantRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid assistant request.");
  }

  return {
    prompt: parsed.data.prompt || "",
    task: parsed.data.task,
  };
};

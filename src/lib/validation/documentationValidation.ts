import { z } from "zod";
import { sanitizeId, sanitizeText } from "./sanitize";

const documentationRequestSchema = z.object({
  title: z.string().trim().min(3).max(140),
  context: z.string().trim().min(5).max(6000),
  format: z.enum(["markdown", "html", "json", "text"]).default("markdown"),
  ticketId: z.string().trim().max(64).optional().or(z.literal("")),
  uploadToDrive: z.boolean().optional().default(false),
  driveFolderId: z.string().trim().max(120).optional().or(z.literal("")),
});

export type DocumentationRequest = z.infer<typeof documentationRequestSchema>;

export const normalizeDocumentationRequest = (input: unknown): DocumentationRequest => {
  const parsed = documentationRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid documentation request.");
  }

  return {
    title: sanitizeText(parsed.data.title, 140),
    context: sanitizeText(parsed.data.context, 6000),
    format: parsed.data.format,
    ticketId: sanitizeId(parsed.data.ticketId || ""),
    uploadToDrive: parsed.data.uploadToDrive,
    driveFolderId: sanitizeId(parsed.data.driveFolderId || ""),
  };
};

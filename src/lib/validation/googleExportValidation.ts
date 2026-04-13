import { z } from "zod";
import { sanitizeId, sanitizeText } from "./sanitize";

const exportRequestSchema = z.object({
  destination: z.enum(["drive", "sheets"]),
  fileName: z.string().trim().max(180).optional().or(z.literal("")),
  spreadsheetTitle: z.string().trim().max(180).optional().or(z.literal("")),
  folderId: z.string().trim().max(120).optional().or(z.literal("")),
});

export type GoogleExportRequest = z.infer<typeof exportRequestSchema>;

export const normalizeGoogleExportRequest = (input: unknown): GoogleExportRequest => {
  const parsed = exportRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid export request.");
  }

  return {
    destination: parsed.data.destination,
    fileName: sanitizeText(parsed.data.fileName || "", 180),
    spreadsheetTitle: sanitizeText(parsed.data.spreadsheetTitle || "", 180),
    folderId: sanitizeId(parsed.data.folderId || ""),
  };
};

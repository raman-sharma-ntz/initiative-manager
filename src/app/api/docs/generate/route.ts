import { assertRole } from "../../../../lib/auth/serverAuth";
import { normalizeDocumentationRequest } from "../../../../lib/validation/documentationValidation";
import { generateDocumentationWithAssistant } from "../../../../modules/assistant/assistantService";
import { addTicketDocumentation } from "../../../../modules/ticket/ticketService";
import { getGoogleOauthAccessToken } from "../../../../lib/auth/clerkGoogleToken";
import { uploadBinaryToDrive } from "../../../../modules/google/googleExportService";

const extensionByFormat = {
  markdown: "md",
  html: "html",
  json: "json",
  text: "txt",
} as const;

const mimeByFormat = {
  markdown: "text/markdown",
  html: "text/html",
  json: "application/json",
  text: "text/plain",
} as const;

export const POST = async (request: Request) => {
  try {
    const { userId } = await assertRole(["admin", "lead", "member"]);
    const body = await request.json();
    const docsRequest = normalizeDocumentationRequest(body);

    const generated = await generateDocumentationWithAssistant({
      title: docsRequest.title,
      context: docsRequest.context,
      format: docsRequest.format,
    });

    let savedDoc = null;
    if (docsRequest.ticketId) {
      savedDoc = await addTicketDocumentation({
        ticketId: docsRequest.ticketId,
        createdBy: userId,
        title: docsRequest.title,
        body: generated.content,
      });
    }

    let driveUpload = null;
    if (docsRequest.uploadToDrive) {
      const accessToken = await getGoogleOauthAccessToken(userId);
      const ext = extensionByFormat[docsRequest.format];
      const fileName = `${docsRequest.title.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
      driveUpload = await uploadBinaryToDrive({
        accessToken,
        fileName,
        mimeType: mimeByFormat[docsRequest.format],
        fileBuffer: Buffer.from(generated.content, "utf8"),
        folderId: docsRequest.driveFolderId || undefined,
      });
    }

    return Response.json(
      {
        provider: generated.provider,
        source: generated.source,
        format: docsRequest.format,
        content: generated.content,
        savedDoc,
        driveUpload,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = (error as Error).message;

    if (message === "UNAUTHENTICATED") {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    if (message === "FORBIDDEN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (message === "GOOGLE_OAUTH_NOT_CONNECTED") {
      return Response.json(
        { error: "Google account is not connected in Clerk. Connect Google OAuth in your user profile first." },
        { status: 400 },
      );
    }

    return Response.json({ error: message || "Documentation generation failed." }, { status: 400 });
  }
};

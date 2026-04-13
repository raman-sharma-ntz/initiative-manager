import { assertRole } from "../../../../lib/auth/serverAuth";
import { getGoogleOauthAccessToken } from "../../../../lib/auth/clerkGoogleToken";
import { normalizeGoogleExportRequest } from "../../../../lib/validation/googleExportValidation";
import { getTeams, getUsers } from "../../../../modules/team/teamService";
import { exportTeamsToExcel } from "../../../../lib/excel/excelUtils";
import { buildTeamRows, exportRowsToSheets, uploadBinaryToDrive } from "../../../../modules/google/googleExportService";

export const POST = async (request: Request) => {
  try {
    const { userId } = await assertRole(["admin", "lead"]);
    const body = await request.json();
    const exportRequest = normalizeGoogleExportRequest(body);

    const accessToken = await getGoogleOauthAccessToken(userId);
    const teams = await getTeams();
    const users = await getUsers();

    if (exportRequest.destination === "drive") {
      const fileName = exportRequest.fileName || `teams-${new Date().toISOString().slice(0, 10)}.xlsx`;
      const excelBuffer = Buffer.from(await exportTeamsToExcel(teams, users));
      const file = await uploadBinaryToDrive({
        accessToken,
        fileName,
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        fileBuffer: excelBuffer,
        folderId: exportRequest.folderId || undefined,
      });

      return Response.json({
        destination: "drive",
        file,
      });
    }

    const rows = buildTeamRows(teams, users);
    const spreadsheetTitle = exportRequest.spreadsheetTitle || `Teams Export ${new Date().toISOString().slice(0, 10)}`;
    const sheet = await exportRowsToSheets({
      accessToken,
      spreadsheetTitle,
      rows,
      sheetName: "Teams",
    });

    return Response.json({
      destination: "sheets",
      sheet,
    });
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
        {
          error: "Google account is not connected in Clerk. Connect Google OAuth in your user profile first.",
        },
        { status: 400 },
      );
    }

    return Response.json({ error: message || "Google export failed." }, { status: 400 });
  }
};

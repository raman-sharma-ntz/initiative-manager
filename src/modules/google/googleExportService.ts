import { google } from "googleapis";
import type { Team, AppUser } from "../../types/models";
import { Readable } from "node:stream";

export const buildTeamRows = (teams: Team[], users: AppUser[]) => {
  const rows = [["Team Name", "Lead", "Member Count", "Member Name", "Member Email"]];

  teams.forEach((team) => {
    const lead = users.find((user) => user.id === team.leadId);

    if (team.memberIds.length === 0) {
      rows.push([team.name, lead?.name || "", "0", "", ""]);
      return;
    }

    team.memberIds.forEach((memberId, index) => {
      const member = users.find((user) => user.id === memberId);
      rows.push([
        index === 0 ? team.name : "",
        index === 0 ? lead?.name || "" : "",
        index === 0 ? String(team.memberIds.length) : "",
        member?.name || "",
        member?.email || "",
      ]);
    });
  });

  return rows;
};

export const uploadBinaryToDrive = async ({
  accessToken,
  fileName,
  mimeType,
  fileBuffer,
  folderId,
}: {
  accessToken: string;
  fileName: string;
  mimeType: string;
  fileBuffer: Buffer;
  folderId?: string;
}) => {
  const authClient = new google.auth.OAuth2();
  authClient.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: "v3", auth: authClient });
  const mediaBody = Readable.from(fileBuffer);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType,
      parents: folderId ? [folderId] : undefined,
    },
    media: {
      mimeType,
      body: mediaBody,
    },
    fields: "id,name,webViewLink,webContentLink,mimeType",
  });

  return response.data;
};

export const exportRowsToSheets = async ({
  accessToken,
  spreadsheetTitle,
  rows,
  sheetName = "Teams",
}: {
  accessToken: string;
  spreadsheetTitle: string;
  rows: string[][];
  sheetName?: string;
}) => {
  const authClient = new google.auth.OAuth2();
  authClient.setCredentials({ access_token: accessToken });

  const sheets = google.sheets({ version: "v4", auth: authClient });

  const createResponse = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: spreadsheetTitle },
      sheets: [{ properties: { title: sheetName } }],
    },
    fields: "spreadsheetId,spreadsheetUrl",
  });

  const spreadsheetId = createResponse.data.spreadsheetId;
  if (!spreadsheetId) {
    throw new Error("Unable to create spreadsheet.");
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });

  return {
    spreadsheetId,
    spreadsheetUrl: createResponse.data.spreadsheetUrl,
  };
};

import { google } from 'googleapis';

export const uploadExcelToGoogleDrive = async (
  authToken: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<unknown> => {
  const drive = google.drive({ version: "v3", auth: authToken });
  const res = await drive.files.create({
    requestBody: { name: fileName, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    media: { mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", body: fileBuffer }
  });
  return res.data;
};
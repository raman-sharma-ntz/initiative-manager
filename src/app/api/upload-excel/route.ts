import { NextRequest } from "next/server";
import { exportTeamsToExcel } from "../../../lib/excel/excelUtils";
import { getTeams, getUsers } from "../../../modules/team/teamService";
import { assertRole } from "../../../lib/auth/serverAuth";

export const GET = async (req: NextRequest) => {
  try {
    await assertRole(["admin"]);
  } catch (error) {
    const message = (error as Error).message;
    if (message === "UNAUTHENTICATED") {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const teams = await getTeams();
  const users = await getUsers();
  const buffer = await exportTeamsToExcel(teams, users);

  return new Response(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="teams.xlsx"',
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
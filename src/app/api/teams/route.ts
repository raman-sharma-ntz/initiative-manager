import { createTeam, getTeams } from "../../../modules/team/teamService";
import { assertRole } from "../../../lib/auth/serverAuth";
import { normalizeTeamInput } from "../../../lib/validation/teamValidation";

export const GET = async () => {
  try {
    await assertRole(["admin", "lead"]);
    const teams = await getTeams();
    return Response.json({ teams }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "UNAUTHENTICATED") {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
};

export const POST = async (req: Request) => {
  try {
    await assertRole(["admin"]);
    const body = await req.json();
    const payload = normalizeTeamInput({
      id: body?.id,
      name: body?.name,
      leadId: body?.leadId,
      memberIds: Array.isArray(body?.memberIds) ? body.memberIds : [],
    });
    const team = await createTeam(payload);
    return Response.json({ team }, { status: 201 });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "UNAUTHENTICATED") {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    if (message === "FORBIDDEN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return Response.json({ error: message || "Invalid request" }, { status: 400 });
  }
};

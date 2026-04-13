import { NextRequest } from "next/server";
import { assertRole } from "../../../../lib/auth/serverAuth";
import { addTicketComment, getTicketById, updateTicket } from "../../../../modules/ticket/ticketService";
import { getTeamById, getUserById } from "../../../../modules/team/teamService";

const canEditTicket = async ({ ticketId, userId, role }: { ticketId: string; userId: string; role: "admin" | "lead" | "member" }) => {
  if (role === "admin") return true;

  const ticket = await getTicketById(ticketId);
  if (!ticket) return false;
  if (ticket.author === userId || ticket.assigneeId === userId || ticket.watchers.includes(userId)) return true;

  if (role === "lead") {
    const user = await getUserById(userId);
    if (!user?.teamId) return false;
    const team = await getTeamById(user.teamId);
    return Boolean(team && team.id === ticket.teamId);
  }

  return false;
};

export const PATCH = async (request: NextRequest, { params }: { params: { ticketId: string } }) => {
  try {
    const { userId, role } = await assertRole(["admin", "lead", "member"]);
    const { ticketId } = params;
    const body = await request.json();

    if (!(await canEditTicket({ ticketId, userId, role }))) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body?.comment) {
      const comment = await addTicketComment(ticketId, userId, String(body.comment));
      return Response.json({ comment }, { status: 200 });
    }

    const ticket = await updateTicket(ticketId, body?.updates || body);
    return Response.json({ ticket }, { status: 200 });
  } catch (error) {
    const message = (error as Error).message;
    if (message === "UNAUTHENTICATED") {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    if (message === "FORBIDDEN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return Response.json({ error: message || "Unable to update ticket." }, { status: 400 });
  }
};

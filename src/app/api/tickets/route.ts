import { NextRequest } from "next/server";
import { assertRole } from "../../../lib/auth/serverAuth";
import { createTicket, getVisibleTickets } from "../../../modules/ticket/ticketService";
import { normalizeTicketFilters } from "../../../lib/validation/ticketValidation";

export const GET = async (request: NextRequest) => {
  try {
    const { userId, role } = await assertRole(["admin", "lead", "member"]);
    const searchParams = request.nextUrl.searchParams;
    const filters = normalizeTicketFilters({
      search: searchParams.get("search") || "",
      status: (searchParams.get("status") || "all") as "all",
      priority: (searchParams.get("priority") || "all") as "all",
      teamId: searchParams.get("teamId") || "all",
      initiativeId: searchParams.get("initiativeId") || "all",
    });
    const tickets = await getVisibleTickets({ viewerId: userId, role, filters });
    return Response.json({ tickets }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    const status = error.status || 500;
    const message = error.message === "UNAUTHENTICATED" ? "Authentication required" : 
                    error.message === "FORBIDDEN" ? "Forbidden" : (error.message || "Internal Server Error");
    return Response.json({ error: message }, { status });
  }
};

export const POST = async (request: Request) => {
  try {
    const { userId } = await assertRole(["admin", "lead", "member"]);
    const body = await request.json();
    const ticket = await createTicket({ ...body, createdBy: userId });
    return Response.json({ ticket }, { status: 201 });
  } catch (error: any) {
    const status = error.status || 400;
    const message = error.message === "UNAUTHENTICATED" ? "Authentication required" : 
                    error.message === "FORBIDDEN" ? "Forbidden" : (error.message || "Invalid ticket payload.");
    return Response.json({ error: message }, { status });
  }
};

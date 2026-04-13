import { redirect } from "next/navigation";
import TicketBoard from "../../../components/TicketBoard";
import { assertRole } from "../../../lib/auth/serverAuth";
import { getVisibleTickets } from "../../../modules/ticket/ticketService";
import { getTeams } from "../../../modules/team/teamService";
import { fetchPrograms } from "../../../modules/cms/hygraph";

const AdminTicketsPage = async () => {
  try {
    const { userId } = await assertRole(["admin"]);
    const tickets = await getVisibleTickets({ viewerId: userId, role: "admin" });
    const teams = await getTeams();
    const programs = await fetchPrograms().catch(() => []);

    return (
      <main className="mx-auto w-[min(1160px,92vw)] px-4 py-10 md:py-14">
        <TicketBoard
          tickets={tickets}
          teams={teams}
          programs={programs}
          viewerId={userId}
          viewerRole="admin"
          canUseAssistant
          title="All Tickets"
          subtitle="Enterprise-level access to every initiative, team, goal, point, and automation task."
        />
      </main>
    );
  } catch {
    redirect("/");
  }
};

export default AdminTicketsPage;

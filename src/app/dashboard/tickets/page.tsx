import TicketBoard from "../../../components/TicketBoard";
import { assertRole } from "../../../lib/auth/serverAuth";
import { getVisibleTickets } from "../../../modules/ticket/ticketService";
import { getTeams } from "../../../modules/team/teamService";
import { fetchPrograms } from "../../../modules/cms/hygraph";
import { redirect } from "next/navigation";

const TeamTicketsPage = async () => {
  try {
    const { userId, role } = await assertRole(["admin", "lead", "member"]);
    const tickets = await getVisibleTickets({ viewerId: userId, role });
    const teams = await getTeams();
    const programs = await fetchPrograms().catch(() => []);

    return (
      <main className="mx-auto w-[min(1160px,92vw)] px-4 py-10 md:py-14">
        <TicketBoard
          tickets={tickets}
          teams={teams}
          programs={programs}
          viewerId={userId}
          viewerRole={role}
          canUseAssistant={role !== "member"}
          title="Team Tickets"
          subtitle="Manage your scoped work, track goals, and keep documentation attached to each initiative."
        />
      </main>
    );
  } catch {
    redirect("/");
  }
};

export default TeamTicketsPage;

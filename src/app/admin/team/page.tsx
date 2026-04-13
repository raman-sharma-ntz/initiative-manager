import { getTeamsCached } from "../../../modules/team/teamService";
import { TeamTable } from "../../../components/TeamTable";
import { assertRole } from "../../../lib/auth/serverAuth";
import { redirect } from "next/navigation";

const TeamPage = async () => {
  try {
    await assertRole(["admin"]);
  } catch {
    redirect("/");
  }

  // Fetch teams with server-side caching
  const teams = await getTeamsCached();

  return (
    <main className="mx-auto w-[min(1160px,92vw)] px-4 py-10 md:py-14">
      <section className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-[0_18px_55px_rgba(16,32,15,0.08)] md:p-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">Admin Workspace</p>
            <h1 className="font-['Bricolage_Grotesque'] text-3xl tracking-[-0.02em] md:text-4xl">Team Directory</h1>
            <p className="mt-2 text-sm text-[var(--ink-2)]">
              Review team leads and membership distribution before exports and assignments.
            </p>
          </div>
          <a
            href="/api/upload-excel"
            className="rounded-xl border border-[var(--brand)] bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_10px_22px_rgba(15,143,97,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
          >
            Export Teams XLSX
          </a>
        </div>

        <TeamTable teams={teams} />
      </section>
    </main>
  );
};

export default TeamPage;
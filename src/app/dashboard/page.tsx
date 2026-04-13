import { fetchPrograms } from "../../modules/cms/hygraph";
import type { Program } from "../../types/models";
import Link from "next/link";

const DashboardPage = async () => {
  let programs: Program[] = [];
  let error = false;

  try {
    programs = await fetchPrograms();
  } catch (err) {
    console.error("Error fetching programs:", err);
    error = true;
  }

  if (error) {
    return (
      <main className="mx-auto w-[min(1160px,92vw)] px-4 py-10">
        <section className="rounded-3xl border border-black/10 bg-white/85 p-6 text-red-800 shadow-[0_18px_55px_rgba(16,32,15,0.08)]">
          Error loading programs. Please try again later.
        </section>
      </main>
    );
  }

  const programList = programs ?? [];

  return (
    <main className="mx-auto w-[min(1160px,92vw)] px-4 py-10 md:py-14">
      <section className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-[0_18px_55px_rgba(16,32,15,0.08)] md:p-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">Live Program Feed</p>
            <h2 className="font-['Bricolage_Grotesque'] text-3xl tracking-[-0.02em] md:text-4xl">Program Dashboard</h2>
            <p className="mt-2 text-sm text-[var(--ink-2)]">Overview of Hygraph programs available to teams.</p>
          </div>
          <Link
            href="/admin/team"
            className="rounded-xl border border-black/10 bg-white/85 px-4 py-2 text-sm font-semibold text-[var(--ink-1)] transition hover:bg-white hover:shadow-[0_10px_20px_rgba(16,32,15,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
          >
            Team Admin
          </Link>
        </div>

        <ul className="grid gap-3">
          {programList.length === 0 ? (
            <li className="rounded-xl border border-dashed border-black/20 bg-white/70 p-4 text-sm text-[var(--ink-2)]">
              No programs found yet.
            </li>
          ) : (
            programList.map((p: Program) => (
              <li key={p.id} className="rounded-xl border border-black/10 bg-white/80 p-4 shadow-[0_12px_30px_rgba(16,32,15,0.06)]">
                <p className="text-sm font-semibold text-[var(--ink-1)]">{p.name}</p>
                <p className="mt-1 text-xs text-[var(--ink-2)]">{p.description || "No description"}</p>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
};

export default DashboardPage;
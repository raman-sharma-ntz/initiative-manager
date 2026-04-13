// d:\projects\initiative-manager\src\app\teams\page.tsx
import { getTeamsAction } from "./team-actions";
import TeamCreator from "../../components/TeamCreator";
import { requireAuth } from "../../lib/auth/serverAuth";
import Link from "next/link";

export default async function TeamsPage() {
  const { userId, role } = await requireAuth();
  const isAdmin = role === "admin";
  const isLead = role === "lead";
  const canCreate = isAdmin || isLead;

  const teams = await getTeamsAction();

  // Filter teams for current user context if needed, but show all for networking discovery
  const myTeams = teams.filter(t => t.leadId === userId || t.memberIds.includes(userId));

  return (
    <main className="mx-auto w-[min(1160px,92vw)] px-4 py-10 md:py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h1 className="font-['Bricolage_Grotesque'] text-4xl tracking-tight text-[var(--ink-1)] md:text-5xl">Collaborative Networks</h1>
            {isAdmin && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-purple-700 shadow-sm border border-purple-200">
                Admin Oversight
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-[var(--ink-2)] max-w-lg">
            Spearhead new initiatives or join existing networks. Use the Global Directory to find specialists and build your dream team.
          </p>
        </div>
      </div>

      <div className={`grid gap-12 ${canCreate ? "lg:grid-cols-[1fr,400px]" : "grid-cols-1"}`}>
        {/* Teams List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--ink-1)]">Discover Teams</h2>
            <div className="flex gap-2">
              <span className="rounded-full bg-[var(--brand)]/10 px-3 py-1 text-xs font-semibold text-[var(--brand)]">
                {teams.length} total
              </span>
            </div>
          </div>

          <div className={`grid gap-4 ${canCreate ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            {teams.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-black/20 p-12 text-center text-[var(--surface-1)]">
                <p className="text-sm text-[var(--ink-2)]">No teams are active yet. Be the first to spearhead one!</p>
              </div>
            ) : (
              teams.map((team) => (
                <article key={team.id} className="group relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_12px_30px_rgba(16,32,15,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,32,15,0.12)]">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-[var(--ink-1)]">{team.name}</h3>
                    <p className="text-xs text-[var(--ink-3)]">Managed by {team.leadId === userId ? "You" : "Team Lead"}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex -space-x-2">
                      {team.memberIds.slice(0, 4).map((mId, i) => (
                        <div key={i} className="h-8 w-8 rounded-lg border-2 border-white bg-black/5 flex items-center justify-center text-[10px] font-bold text-[var(--ink-2)]">
                          {mId[0]}
                        </div>
                      ))}
                      {team.memberIds.length > 4 && (
                        <div className="h-8 w-8 rounded-lg border-2 border-white bg-[var(--surface-0)] flex items-center justify-center text-[10px] font-bold text-[var(--ink-3)]">
                          +{team.memberIds.length - 4}
                        </div>
                      )}
                    </div>
                    
                    <Link 
                      href={`/dashboard/tickets?teamId=${team.id}`}
                      className="rounded-lg bg-black/5 px-4 py-2 text-xs font-semibold text-[var(--ink-1)] transition hover:bg-[var(--brand)] hover:text-white"
                    >
                      View Board
                    </Link>
                  </div>
                  
                  {myTeams.some(mt => mt.id === team.id) && (
                    <div className="absolute right-4 top-4 text-[var(--brand)]">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        {/* Team Creator Sidebar */}
        {canCreate && (
          <aside className="relative">
            <div className="sticky top-6 rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_18px_55px_rgba(16,32,15,0.08)]">
              <h3 className="mb-2 text-2xl font-bold tracking-tight text-[var(--ink-1)]">Launch Network</h3>
              <p className="mb-8 text-sm text-[var(--ink-2)] leading-relaxed">
                Create a new collaborative team. You'll become the team lead and can recruit members instantly.
              </p>
              <TeamCreator />
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}

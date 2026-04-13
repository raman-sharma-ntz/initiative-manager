"use client";
import { Team } from "../types/models";

export const TeamTable = ({ teams }: { teams: Team[] }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white/90 shadow-[0_14px_35px_rgba(16,32,15,0.08)]">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[var(--ink-2)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Team</th>
              <th className="px-4 py-3 font-semibold">Lead</th>
              <th className="px-4 py-3 font-semibold">Members</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id} className="border-t border-black/10 hover:bg-white/80">
                <td className="px-4 py-3 font-medium text-[var(--ink-1)]">{team.name}</td>
                <td className="px-4 py-3 text-[var(--ink-2)]">{team.leadId}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[0.75rem] text-[var(--ink-2)]">
                    {team.memberIds.length} members
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
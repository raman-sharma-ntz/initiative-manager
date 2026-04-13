"use client";

import { useState } from "react";
import { AppUser } from "../types/models";
import DeleteMemberButton from "./DeleteMemberButton";
import MemberEditModal from "./MemberEditModal";

interface MemberDirectoryTableProps {
  initialMembers: AppUser[];
}

const MemberDirectoryTable = ({ initialMembers }: MemberDirectoryTableProps) => {
  const [editingMember, setEditingMember] = useState<AppUser | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-black/5">
          <tr>
            <th className="pb-4 font-semibold text-[var(--ink-2)]">Member</th>
            <th className="pb-4 font-semibold text-[var(--ink-2)]">Role</th>
            <th className="pb-4 font-semibold text-[var(--ink-2)]">Dept / Teams</th>
            <th className="pb-4 text-right font-semibold text-[var(--ink-2)]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {initialMembers.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-10 text-center text-[var(--ink-3)] text-xs italic">
                The directory is currently empty. Use the tools to the right to add your team.
              </td>
            </tr>
          ) : (
            initialMembers.map((member: AppUser) => (
              <tr key={member.id} className="group hover:bg-black/[0.01] transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 text-lg font-bold text-[var(--ink-2)] group-hover:bg-[var(--brand)]/10 group-hover:text-[var(--brand)] transition-colors">
                      {member.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--ink-1)]">{member.name}</p>
                      <p className="text-[10px] text-[var(--ink-2)]">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className={`inline-flex rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                    member.role === 'lead' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-[var(--ink-2)]">
                      {typeof member.department === 'string' ? member.department : "General"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.teams && member.teams.length > 0 ? (
                        member.teams.map((t: any, i: number) => (
                          <span key={t?.id ?? i} className="rounded-md bg-green-50 px-1.5 py-0.5 text-[9px] font-medium text-green-700 border border-green-100 italic">
                            {typeof t?.name === 'string' ? t.name : JSON.stringify(t)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-[var(--ink-3)] italic">Not assigned</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingMember(member)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/5 text-[var(--ink-3)] transition-all hover:bg-[var(--brand)]/10 hover:text-[var(--brand)] active:scale-95"
                      title="Edit member details"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <DeleteMemberButton 
                      memberId={member.id} 
                      clerkId={member.clerkId} 
                      memberName={member.name || "Member"} 
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {editingMember && (
        <MemberEditModal 
          member={editingMember} 
          onClose={() => setEditingMember(null)} 
        />
      )}
    </div>
  );
};

export default MemberDirectoryTable;

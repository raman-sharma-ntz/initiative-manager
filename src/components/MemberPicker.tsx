"use client";

import { useState, useEffect } from "react";
import { getDirectoryAction } from "../app/admin/members/member-actions";
import { AppUser } from "../types/models";

interface MemberPickerProps {
  onSelect: (memberIds: string[]) => void;
  selectedIds: string[];
}

/**
 * A collaborative "Networking" component.
 * Allows Leads to browse the Global Directory and add people to their teams.
 */
const MemberPicker = ({ onSelect, selectedIds }: MemberPickerProps) => {
  const [directory, setDirectory] = useState<AppUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDirectory = async () => {
      const data = await getDirectoryAction();
      setDirectory(data);
      setIsLoading(false);
    };
    loadDirectory();
  }, []);

  const filtered = directory.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleMember = (clerkId: string) => {
    if (selectedIds.includes(clerkId)) {
      onSelect(selectedIds.filter(id => id !== clerkId));
    } else {
      onSelect([...selectedIds, clerkId]);
    }
  };

  if (isLoading) return <div className="h-20 animate-pulse rounded-xl bg-black/5" />;

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search directory by name, skill, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white/50 px-4 py-3 text-sm focus:border-[var(--brand)] focus:outline-none transition-all"
        />
        <div className="absolute right-3 top-3 text-[var(--ink-3)]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="col-span-full py-4 text-center text-xs text-[var(--ink-3)]">No members found matching your search.</p>
        ) : (
          filtered.map(member => (
            <button
              key={member.id}
              onClick={() => toggleMember(member.clerkId || member.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                selectedIds.includes(member.clerkId || member.id)
                  ? "border-[var(--brand)] bg-[var(--brand)]/5 shadow-[0_5px_15px_rgba(15,143,97,0.1)]"
                  : "border-black/5 bg-white hover:border-black/20"
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                selectedIds.includes(member.clerkId || member.id) ? "bg-[var(--brand)] text-white" : "bg-black/5 text-[var(--ink-2)]"
              }`}>
                {member.name?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-[var(--ink-1)]">{member.name}</p>
                <p className="truncate text-[10px] text-[var(--ink-2)]">{member.department || "No Dept"}</p>
              </div>
              {selectedIds.includes(member.clerkId || member.id) && (
                <div className="text-[var(--brand)]">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberPicker;

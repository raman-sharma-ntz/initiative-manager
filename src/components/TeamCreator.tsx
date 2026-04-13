"use client";

import { useState } from "react";
import { createTeamAction } from "../app/teams/team-actions";
import MemberPicker from "./MemberPicker";

const TeamCreator = () => {
  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setStatus({ type: "error", text: "Please provide a name for your team." });
      return;
    }
    
    setIsPending(true);
    setStatus(null);

    const result = await createTeamAction({ name, memberIds: selectedMembers });
    
    setIsPending(false);
    if (result.success) {
      setStatus({ type: "success", text: `Team "${name}" created successfully!` });
      setName("");
      setSelectedMembers([]);
      // Optional: Redirect or refresh
    } else {
      setStatus({ type: "error", text: result.error || "Failed to create team." });
    }
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Identity */}
      <section className="space-y-4">
        <label className="text-sm font-bold tracking-tight text-[var(--ink-1)] uppercase">1. Team Identity</label>
        <input
          type="text"
          placeholder="What should we call this team?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white/50 px-6 py-4 text-lg font-semibold focus:border-[var(--brand)] focus:outline-none focus:ring-4 focus:ring-[var(--brand)]/10 transition-all placeholder:text-[var(--ink-3)]"
        />
      </section>

      {/* Step 2: Networking */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold tracking-tight text-[var(--ink-1)] uppercase">2. Networking</label>
          <span className="text-xs text-[var(--ink-2)] bg-black/5 px-2 py-1 rounded-md">
            {selectedMembers.length} Members Selected
          </span>
        </div>
        <div className="rounded-3xl border border-black/5 bg-[var(--surface-0)] p-6 shadow-inner">
          <MemberPicker 
            selectedIds={selectedMembers} 
            onSelect={setSelectedMembers} 
          />
        </div>
      </section>

      {/* Step 3: Launch */}
      <footer className="pt-4">
        {status && (
          <div className={`mb-6 rounded-2xl p-4 text-sm font-medium ${
            status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {status.text}
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={isPending || !name.trim()}
          className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[var(--ink-1)] px-8 py-5 text-lg font-bold text-white transition-all hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          ) : (
            <>
              <span>Spearhead Team</span>
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default TeamCreator;

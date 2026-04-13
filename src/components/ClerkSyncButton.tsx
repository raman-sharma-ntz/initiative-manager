"use client";

import { useState } from "react";
import { syncAllUsersAction } from "../app/admin/members/member-actions";

const ClerkSyncButton = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setStatus(null);

    try {
      const result = await syncAllUsersAction();
      if (result.success) {
        setStatus({ type: "success", text: result.message || "Members synchronized successfully." });
      } else {
        setStatus({ type: "error", text: result.error || "Sync failed." });
      }
    } catch (err) {
      setStatus({ type: "error", text: "An unexpected error occurred during sync." });
    } finally {
      setIsSyncing(false);
      // Clear success message after a few seconds
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="group flex items-center gap-2 rounded-xl bg-black/5 px-4 py-2 text-xs font-bold text-[var(--ink-1)] transition-all hover:bg-black/10 active:scale-[0.98] disabled:opacity-50"
        title="Synchorize directory with latest Clerk accounts"
      >
        <svg 
          className={`h-4 w-4 text-[var(--ink-2)] transition-transform duration-700 ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180'}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 21h5v-5" />
        </svg>
        {isSyncing ? "Syncing Members..." : "Sync with Clerk"}
      </button>

      {status && (
        <div className={`fixed bottom-8 right-8 z-50 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          status.type === "success" 
            ? "bg-green-500/90 text-white" 
            : "bg-red-500/90 text-white"
        }`}>
          <div className="flex items-center gap-3">
            {status.type === "success" ? (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <p className="text-sm font-bold">{status.text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClerkSyncButton;

"use client";

import { useState } from "react";
import { updateMemberAction } from "../app/admin/members/member-actions";
import { AppUser } from "../types/models";

interface MemberEditModalProps {
  member: AppUser;
  onClose: () => void;
}

const MemberEditModal = ({ member, onClose }: MemberEditModalProps) => {
  const [formData, setFormData] = useState({
    name: member.name || "",
    role: member.role || "member",
    department: member.department || ""
  });
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      const res = await updateMemberAction(member.id, member.clerkId, formData);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || "Failed to update member.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/50 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.12)] animate-in zoom-in-95 fade-in duration-300">
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[var(--ink-1)]">Edit Member</h3>
              <p className="text-sm text-[var(--ink-2)] mt-1">{member.email}</p>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full p-2 text-[var(--ink-3)] hover:bg-black/5 hover:text-[var(--ink-1)] transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-3)]">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm focus:border-[var(--brand)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)] transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-3)]">Organizational Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full rounded-2xl border border-black/10 bg-black/[0.02] px-3 py-3 text-sm focus:border-[var(--brand)] focus:outline-none transition-all"
                >
                  <option value="member">Member</option>
                  <option value="lead">Lead</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-3)]">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-sm focus:border-[var(--brand)] focus:outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100 italic">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-black/10 py-3 text-sm font-bold text-[var(--ink-2)] hover:bg-black/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-[2] rounded-2xl bg-[var(--brand)] py-3 text-sm font-bold text-white shadow-lg shadow-[var(--brand)]/20 hover:bg-[var(--brand-strong)] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberEditModal;

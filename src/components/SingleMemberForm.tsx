"use client";

import { useState } from "react";
import { addSingleMemberAction } from "../app/admin/members/member-actions";

const SingleMemberForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "member",
    department: ""
  });
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setMessage({ type: "error", text: "Name and Email are required." });
      return;
    }

    setIsPending(true);
    setMessage(null);

    const result = await addSingleMemberAction(formData);

    setIsPending(false);
    if (result.success) {
      setMessage({ type: "success", text: result.message || "Invitation sent successfully." });
      setFormData({ name: "", email: "", role: "member", department: "" });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to send invitation." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-3)]">Full Name</label>
        <input
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm focus:border-[var(--brand)] focus:outline-none transition-all"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-3)]">Email Address</label>
        <input
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm focus:border-[var(--brand)] focus:outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-3)]">Official Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm focus:border-[var(--brand)] focus:outline-none transition-all"
          >
            <option value="member">Member</option>
            <option value="lead">Lead</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-3)]">Department</label>
          <input
            type="text"
            placeholder="e.g. Design"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm focus:border-[var(--brand)] focus:outline-none transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--brand-strong)] active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? (
          <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        ) : (
          "Send Invitation"
        )}
      </button>

      {message && (
        <div className={`mt-4 rounded-xl p-3 text-xs font-medium ${
          message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        }`}>
          {message.text}
        </div>
      )}
    </form>
  );
};

export default SingleMemberForm;

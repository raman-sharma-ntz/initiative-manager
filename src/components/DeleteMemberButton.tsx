"use client";

import { useState } from "react";
import { deleteMemberAction } from "../app/admin/members/member-actions";

interface DeleteMemberButtonProps {
  memberId: string;
  clerkId?: string;
  memberName: string;
}

const DeleteMemberButton = ({ memberId, clerkId, memberName }: DeleteMemberButtonProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      // Auto-cancel after 3 seconds if not clicked again
      setTimeout(() => setIsConfirming(false), 3000);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteMemberAction(memberId, clerkId);
      if (!res.success) {
        alert(res.error || "Failed to delete member.");
        setIsConfirming(false);
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleDelete();
      }}
      disabled={isDeleting}
      className={`group flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all active:scale-[0.98] ${
        isConfirming 
          ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
          : "bg-black/5 text-red-500 hover:bg-red-50"
      } disabled:opacity-50`}
      title={isConfirming ? "Click again to confirm delete" : "Remove member from directory"}
    >
      <svg 
        className={`h-4 w-4 transition-transform ${isConfirming ? "scale-110" : "group-hover:rotate-12"}`} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
      {isConfirming && (
        <span className="animate-in fade-in slide-in-from-right-2 duration-300">
          {isDeleting ? "Deleting..." : "Confirm?"}
        </span>
      )}
    </button>
  );
};

export default DeleteMemberButton;

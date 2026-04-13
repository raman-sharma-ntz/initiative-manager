"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

const Navbar = () => {
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-[var(--brand)] text-white";
      case "lead":
        return "bg-amber-100 text-[var(--ink-1)]";
      case "member":
        return "bg-slate-100 text-[var(--ink-2)]";
      default:
        return "bg-slate-100 text-[var(--ink-2)]";
    }
  };

  return (
    <nav className="border-b border-black/10 bg-white/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-[var(--brand)]">
          Initiative Manager
        </Link>

        {/* Center: Nav Links */}
        <SignedIn>
          <div className="flex gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-[var(--ink-1)] transition hover:text-[var(--brand)]"
            >
              Dashboard
            </Link>
            <Link
              href="/teams"
              className="text-sm text-[var(--ink-1)] transition hover:text-[var(--brand)]"
            >
              Teams
            </Link>
            <Link
              href="/dashboard/tickets"
              className="text-sm text-[var(--ink-1)] transition hover:text-[var(--brand)]"
            >
              Tickets
            </Link>
            {role === "admin" && (
              <Link
                href="/admin/members"
                className="text-sm text-[var(--ink-1)] transition hover:text-[var(--brand)]"
              >
                Directory
              </Link>
            )}
          </div>
        </SignedIn>

        {/* Right: Auth Controls */}
        <div className="flex items-center gap-4">
          <SignedIn>
            <div className="flex items-center gap-3">
              {role && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(role)} border border-black/10`}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </span>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  },
                }}
              />
            </div>
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="text-sm font-semibold text-[var(--ink-1)] transition hover:text-[var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg border border-[var(--brand)] bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_10px_22px_rgba(15,143,97,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
            >
              Sign Up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

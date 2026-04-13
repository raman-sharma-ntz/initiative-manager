"use client";

import Link from "next/link";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const role = (user?.publicMetadata?.role as string) || null;

  // Redirect authenticated users based on role
  useEffect(() => {
    if (isLoaded && user && !role) {
      // User is signed in but has no role → send to onboarding
      router.push("/onboarding");
    }
  }, [isLoaded, user, role, router]);

  return (
    <main className="mx-auto w-[min(1160px,92vw)] px-4 py-12 md:py-20">
      <section className="rounded-[28px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_55px_rgba(16,32,15,0.08)] backdrop-blur-[3px] md:p-10">

        <h1 className="font-['Bricolage_Grotesque'] text-4xl leading-tight md:text-6xl">
          Initiative Manager
          <span className="mt-1 block text-[var(--brand)]">for teams that ship with control.</span>
        </h1>

        <p className="mt-4 mb-8 max-w-2xl text-base text-[var(--ink-2)] md:text-lg">
          Secure admin workflows, role-based access, and analytics-ready structure with a modern interface
          that stays scalable as your ops grow.
        </p>

        <SignedIn>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-[var(--brand)] bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_10px_22px_rgba(15,143,97,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
            >
              Open Dashboard
            </Link>
            <Link
              href="/dashboard/tickets"
              className="rounded-xl border border-black/10 bg-white/85 px-5 py-2.5 text-sm font-semibold text-[var(--ink-1)] transition hover:bg-white hover:shadow-[0_10px_20px_rgba(16,32,15,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
            >
              View Tickets
            </Link>
            {role === "admin" && (
              <>
                <Link
                  href="/admin/team"
                  className="rounded-xl border border-black/10 bg-white/85 px-5 py-2.5 text-sm font-semibold text-[var(--ink-1)] transition hover:bg-white hover:shadow-[0_10px_20px_rgba(16,32,15,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
                >
                  Manage Teams
                </Link>
                <Link
                  href="/api/upload-excel"
                  className="rounded-xl border border-black/10 bg-white/85 px-5 py-2.5 text-sm font-semibold text-[var(--ink-1)] transition hover:bg-white hover:shadow-[0_10px_20px_rgba(16,32,15,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
                >
                  Export Excel
                </Link>
              </>
            )}
          </div>
        </SignedIn>

        <SignedOut>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="rounded-xl border border-[var(--brand)] bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_10px_22px_rgba(15,143,97,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              className="rounded-xl border border-black/10 bg-white/85 px-5 py-2.5 text-sm font-semibold text-[var(--ink-1)] transition hover:bg-white hover:shadow-[0_10px_20px_rgba(16,32,15,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
            >
              Sign In
            </Link>
          </div>
        </SignedOut>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { title: "Tickets", text: "Search, filter, track points, goals, docs, and status by role." },
            { title: "Docs", text: "Write initiative and team documentation alongside each work item." },
            { title: "Automation", text: "Run JSON-based assistant tasks to create, update, and document work." },
          ].map((item, index) => (
            <article
              key={item.title}
              className="rounded-2xl border border-black/10 bg-white/80 p-5 shadow-[0_12px_30px_rgba(16,32,15,0.08)]"
            >
              <p className="font-['Bricolage_Grotesque'] text-xl tracking-[-0.015em]">{item.title}</p>
              <p className="mt-2 text-sm text-[var(--ink-2)]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;

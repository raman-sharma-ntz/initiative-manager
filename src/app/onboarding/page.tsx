"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "./onboarding-action";
import { useUser } from "@clerk/nextjs";

const OnboardingPage = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user already has a role, they shouldn't be here.
    // We use window.location.href for a full refresh to ensure the 
    // Clerk session cookie is synchronized with the new metadata.
    if (isLoaded && user?.publicMetadata?.role) {
      window.location.href = "/dashboard";
    }
  }, [isLoaded, user]);

  const handleComplete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await completeOnboarding();
        if (result.success) {
          // If they already had a role (e.g. seeded as admin), 
          // they might need a full session refresh
          if (result.role === 'admin') {
            window.location.href = "/dashboard";
            return;
          }
          window.location.href = "/dashboard";
        } else {
          setError(result.error || "Something went wrong.");
        }
      } catch (err) {
        setError("A connection error occurred. Please try again or refresh the page.");
      }
    });
  };

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md overflow-hidden rounded-[32px] border border-black/10 bg-white/80 p-8 shadow-[0_22px_60px_rgba(16,32,15,0.08)] backdrop-blur-md md:p-12">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand)] text-3xl text-white shadow-[0_10px_20px_rgba(15,143,97,0.3)]">
            🚀
          </div>
          <h1 className="font-['Bricolage_Grotesque'] text-3xl tracking-tight text-[var(--ink-1)]">
            Welcome to the Team
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ink-2)]">
            We're setting up your secure workspace. This will only take a moment.
          </p>
        </div>

        <div className="mt-10">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleComplete}
            disabled={isPending}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-[var(--brand)] bg-[var(--brand)] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_15px_30px_rgba(15,143,97,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)] disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isPending ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Initializing Workspace...</span>
              </>
            ) : (
              <span>Finalize Setup</span>
            )}
            
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--ink-3)]">
          By continuing, you'll be assigned the default <strong>Member</strong> role.
        </p>
      </div>
    </main>
  );
};

export default OnboardingPage;

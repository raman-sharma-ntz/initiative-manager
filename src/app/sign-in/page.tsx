"use client";

import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--brand)]">
            Initiative Manager
          </h1>
          <p className="mt-2 text-[15px] text-[var(--ink-2)]">
            Sign in to manage your team&apos;s work
          </p>
        </div>

        <div className="rounded-2xl p-2">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent p-4 lg:p-6",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border border-[var(--ink-1)]/10 hover:bg-[var(--surface-0)]/50 transition-colors",
                formButtonPrimary: "bg-[var(--brand)] hover:bg-[var(--brand-strong)] transition-colors shadow-sm",
                formFieldInput: "rounded-lg border-[var(--ink-1)]/10 focus:border-[var(--brand)] focus:ring-[var(--ring)] transition-all",
                footerActionText: "text-[var(--ink-2)]",
                footerActionLink: "text-[var(--brand)] hover:text-[var(--brand-strong)] font-medium",
              },
            }}
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </main>
  );
};

export default SignInPage;

"use client";

import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="font-['Bricolage_Grotesque'] text-3xl tracking-[-0.02em] text-[var(--brand)]">Initiative Manager</h1>
          <p className="mt-2 text-sm text-[var(--ink-2)]">Create an account to get started</p>
        </div>

        <div className="rounded-2xl ">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none bg-transparent",
              },
            }}
            signInUrl="/sign-in"
          />
        </div>

        
      </div>
    </main>
  );
};

export default SignUpPage;

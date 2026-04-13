import Link from "next/link";

const UnauthenticatedPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-[var(--brand)]">401</h1>
          <p className="mt-2 text-2xl font-semibold text-[var(--ink-1)]">Authentication Required</p>
        </div>

        <p className="mb-8 text-base text-[var(--ink-2)]">
          You need to sign in to access this page. Please create an account or sign in with your credentials.
        </p>

        <div className="space-y-3 rounded-2xl border border-black/10 bg-white/90 p-5 shadow-[0_18px_45px_rgba(16,32,15,0.08)]">
          <Link href="/sign-up" className="block rounded-xl border border-[var(--brand)] bg-[var(--brand)] px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_10px_22px_rgba(15,143,97,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]">
            Sign Up
          </Link>
          <Link href="/sign-in" className="block rounded-xl border border-black/10 bg-white/85 px-6 py-3 font-semibold text-[var(--ink-1)] transition hover:bg-white hover:shadow-[0_10px_20px_rgba(16,32,15,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]">
            Sign In
          </Link>
        </div>

        <p className="mt-6 text-xs text-[var(--ink-2)]">
          Already have an account? <Link href="/sign-in" className="font-semibold text-[var(--brand)] hover:underline">Sign in here</Link>
        </p>
      </div>
    </main>
  );
};

export default UnauthenticatedPage;

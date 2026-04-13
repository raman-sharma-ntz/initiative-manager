import Link from "next/link";

const NotAuthorizedPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-red-600">403</h1>
          <p className="mt-2 text-2xl font-semibold text-[var(--ink-1)]">Access Denied</p>
        </div>

        <p className="mb-8 text-base text-[var(--ink-2)]">
          You don&apos;t have permission to access this page. Your role may not grant access to this resource.
        </p>

        <div className="space-y-3 rounded-2xl border border-black/10 bg-white/90 p-5 shadow-[0_18px_45px_rgba(16,32,15,0.08)]">
          <Link href="/dashboard" className="block rounded-xl border border-[var(--brand)] bg-[var(--brand)] px-6 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--brand-strong)] hover:shadow-[0_10px_22px_rgba(15,143,97,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]">
            Go to Dashboard
          </Link>
          <Link href="/" className="block rounded-xl border border-black/10 bg-white/85 px-6 py-3 font-semibold text-[var(--ink-1)] transition hover:bg-white hover:shadow-[0_10px_20px_rgba(16,32,15,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]">
            Go Home
          </Link>
        </div>

        <p className="mt-6 text-xs text-[var(--ink-2)]">
          If you believe this is a mistake, contact your administrator.
        </p>
      </div>
    </main>
  );
};

export default NotAuthorizedPage;

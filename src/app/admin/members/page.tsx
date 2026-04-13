import { MemberService } from "../../../modules/member/memberService";
import MemberDirectoryTable from "../../../components/MemberDirectoryTable";
import MemberUploader from "../../../components/MemberUploader";
import SingleMemberForm from "../../../components/SingleMemberForm";
import ClerkSyncButton from "../../../components/ClerkSyncButton";
import { requireAdmin } from "../../../lib/auth/serverAuth";

export default async function AdminMembersPage() {
  await requireAdmin();
  const members = await MemberService.getDirectoryMembers();

  return (
    <main className="mx-auto w-[min(1160px,92vw)] px-4 py-10 md:py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-['Bricolage_Grotesque'] text-4xl tracking-tight text-[var(--ink-1)] md:text-5xl">Member Directory</h1>
          <p className="mt-4 text-sm text-[var(--ink-2)] max-w-lg">
            Manage your organization's global talent pool. Invite members individually, import them in bulk, or synchronize with Clerk.
          </p>
        </div>
        <ClerkSyncButton />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr,380px]">
        {/* Directory List */}
        <section className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-[0_18px_55px_rgba(16,32,15,0.08)] md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[var(--ink-1)]">Organizational Records</h2>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-[var(--ink-2)]">
              {members.length} Total
            </span>
          </div>

          <MemberDirectoryTable initialMembers={members} />
        </section>

        {/* Action Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-black/10 bg-[var(--surface-0)] p-6 shadow-[0_12px_45px_rgba(16,32,15,0.06)] backdrop-blur-sm">
            <h3 className="mb-4 text-lg font-semibold text-[var(--ink-1)]">Quick Invite</h3>
            <p className="mb-6 text-xs text-[var(--ink-2)]">Invite a single member. They will receive an email from Clerk to set up their password.</p>
            <SingleMemberForm />
          </div>

          <div className="rounded-3xl border border-black/10 bg-white/50 p-6 shadow-[0_12px_45px_rgba(16,32,15,0.06)]">
            <h3 className="mb-4 text-lg font-semibold text-[var(--ink-1)]">Bulk Import</h3>
            <MemberUploader />
            <div className="mt-4 border-t border-black/5 pt-4 text-[10px] text-[var(--ink-3)] leading-relaxed">
              <p>Upload a .csv with headers: <strong>name, email, role, department</strong>.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

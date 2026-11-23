import type { Metadata } from "next";
import Link from "next/link";
import { requireSuperAdminPage } from "@/lib/adminAuth";
import InviteAdminForm from "@/components/admin/InviteAdminForm";

export const metadata: Metadata = { title: "Add Admin | Revio Inventory" };
export const dynamic = "force-dynamic";

export default async function NewAdminPage() {
  await requireSuperAdminPage();

  return (
    <div className="mx-auto max-w-[560px] px-6 py-14">
      <Link href="/admin/admins" className="text-xs font-bold text-[var(--a-text-muted)] hover:text-[var(--a-text)]">
        ← Back to Admins
      </Link>
      <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-revio-yellow">
        New admin
      </p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--a-text)]">Invite an admin.</h1>
      <p className="mt-2 text-sm text-[var(--a-text-muted)]">
        They&rsquo;ll get an email with a link to set their own password and sign in.
      </p>
      <div className="mt-6 rounded-[22px] border border-[var(--a-border)] bg-[var(--a-surface)] p-7">
        <InviteAdminForm />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSuperAdminPage, isSuperAdmin } from "@/lib/adminAuth";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export const metadata: Metadata = { title: "Admins | Revio Inventory" };
export const dynamic = "force-dynamic";

export default async function AdminAdminsPage() {
  const user = await requireSuperAdminPage();

  const { data } = await supabaseAdmin.auth.admin.listUsers();
  const admins = (data?.users ?? [])
    .map((u) => ({
      id: u.id,
      email: u.email ?? "(no email)",
      createdAt: u.created_at,
      active: Boolean(u.last_sign_in_at),
      superAdmin: isSuperAdmin(u),
    }))
    .sort((a, b) => a.email.localeCompare(b.email));

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-revio-yellow">
            Admins
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--a-text)]">
            Manage admin access.
          </h1>
        </div>
        <Link
          href="/admin/admins/new"
          className="btn-tactile rounded-xl bg-revio-yellow px-5 py-3 text-sm font-black text-revio-black hover:shadow-lg"
        >
          + Add Admin
        </Link>
      </div>
      <AdminUsersTable admins={admins} currentUserId={user.id} />
    </div>
  );
}

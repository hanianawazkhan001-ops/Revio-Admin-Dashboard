"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  email: string;
  createdAt: string;
  active: boolean;
  superAdmin: boolean;
};

export default function AdminUsersTable({
  admins,
  currentUserId,
}: {
  admins: AdminUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setPendingId(id);
    setError(null);
    const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      setPendingId(null);
      setConfirmId(null);
      return;
    }
    setPendingId(null);
    setConfirmId(null);
    router.refresh();
  }

  if (admins.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface)] p-8 text-center">
        <p className="text-sm text-[var(--a-text-muted)]">No admins yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--a-border)]">
      {error && (
        <p className="border-b border-[var(--a-border)] bg-[var(--a-warn-bg)] px-4 py-2.5 text-xs text-[var(--a-warn-text)]">
          {error}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--a-border)] bg-[var(--a-surface)] text-[9px] font-black uppercase tracking-wider text-[var(--a-text-faint)]">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-[var(--a-border)] last:border-b-0">
                <td className="px-4 py-3 font-bold text-[var(--a-text)]">
                  {a.email}
                  {a.id === currentUserId && (
                    <span className="ml-1.5 text-[9px] font-normal text-[var(--a-text-fainter)]">(you)</span>
                  )}
                  {a.superAdmin && (
                    <span className="ml-1.5 rounded-full bg-revio-yellow px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-revio-black">
                      Super Admin
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${
                      a.active ? "bg-[var(--a-good-bg)] text-[var(--a-good-text)]" : "bg-[var(--a-border)] text-[var(--a-text-muted)]"
                    }`}
                  >
                    {a.active ? "Active" : "Invite pending"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--a-text-muted)]">
                  {new Date(a.createdAt).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {a.id === currentUserId || a.superAdmin ? (
                      <span className="text-[10px] text-[var(--a-text-fainter)]">—</span>
                    ) : confirmId === a.id ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        disabled={pendingId === a.id}
                        className="btn-tactile rounded-lg bg-[var(--a-warn-border)] px-3 py-1.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-warn-border-hover)] disabled:opacity-60"
                      >
                        {pendingId === a.id ? "Removing…" : "Confirm remove"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmId(a.id)}
                        className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-bold text-[var(--a-warn-text)] hover:bg-[var(--a-surface-2-hover)]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

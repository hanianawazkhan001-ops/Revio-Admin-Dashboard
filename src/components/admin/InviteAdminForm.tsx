"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3.5 py-3.5 text-sm text-[var(--a-text)] outline-none transition-colors duration-150 placeholder:text-[var(--a-text-fainter)] focus:border-revio-yellow";
const labelClass = "mb-1.5 block text-[8px] font-black uppercase tracking-wider text-[var(--a-text-faint)]";

export default function InviteAdminForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    router.push("/admin/admins");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3.5">
      <div>
        <label className={labelClass}>Email address</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@revio.co.uk"
          className={inputClass}
        />
      </div>
      {error && (
        <p className="rounded-lg bg-[var(--a-warn-bg)] px-3.5 py-2.5 text-xs text-[var(--a-warn-text)]">{error}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="btn-tactile mt-1 rounded-xl bg-revio-yellow px-5 py-3.5 text-sm font-black text-revio-black hover:shadow-lg disabled:opacity-60"
      >
        {submitting ? "Sending invite…" : "Send Invite"}
      </button>
    </form>
  );
}

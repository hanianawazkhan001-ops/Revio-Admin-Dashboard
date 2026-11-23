"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slugify";

type DealerFormProps = {
  mode: "create" | "edit";
  initialSlug?: string;
  initialName?: string;
  initialLocation?: string;
  initialDescription?: string;
  initialContactName?: string;
  initialPhone?: string;
  initialEmail?: string;
};

const inputClass =
  "w-full rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3.5 py-3.5 text-sm text-[var(--a-text)] outline-none transition-colors duration-150 placeholder:text-[var(--a-text-fainter)] focus:border-revio-yellow";
const labelClass = "mb-1.5 block text-[8px] font-black uppercase tracking-wider text-[var(--a-text-faint)]";

export default function DealerForm({
  mode,
  initialSlug,
  initialName = "",
  initialLocation = "",
  initialDescription = "",
  initialContactName = "",
  initialPhone = "",
  initialEmail = "",
}: DealerFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [location, setLocation] = useState(initialLocation);
  const [description, setDescription] = useState(initialDescription);
  const [contactName, setContactName] = useState(initialContactName);
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSlug = mode === "create" ? slugify(name) : initialSlug;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const url = mode === "create" ? "/api/admin/dealers" : `/api/admin/dealers/${initialSlug}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, description, contactName, phone, email }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    router.push("/admin/dealers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3.5">
      <div>
        <label className={labelClass}>Dealer name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bilston Motors"
          className={inputClass}
        />
        {previewSlug && (
          <p className="mt-1.5 text-[10px] text-[var(--a-text-fainter)]">
            Public page: /dealer/{previewSlug}
          </p>
        )}
      </div>
      <div>
        <label className={labelClass}>Location</label>
        <input
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Bilston, West Midlands"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Shown on the dealer's public profile page."
          className={`${inputClass} min-h-[100px]`}
        />
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Contact name (optional)</label>
          <input
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="e.g. Sam Patel"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Phone (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 01902 123456"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Email (optional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. sales@bilstonmotors.co.uk"
          className={inputClass}
        />
        <p className="mt-1.5 text-[10px] text-[var(--a-text-fainter)]">
          Internal use only — shown on the dealer&rsquo;s admin profile, not the public site.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-[var(--a-warn-bg)] px-3.5 py-2.5 text-xs text-[var(--a-warn-text)]">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-tactile mt-1 rounded-xl bg-revio-yellow px-5 py-3.5 text-sm font-black text-revio-black hover:shadow-lg disabled:opacity-60"
      >
        {submitting ? "Saving…" : mode === "create" ? "Add Dealer" : "Save Changes"}
      </button>
    </form>
  );
}

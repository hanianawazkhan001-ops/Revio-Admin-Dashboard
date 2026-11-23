"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Dealer } from "@/lib/dealers";

type DealerWithCount = Dealer & { carCount: number };

export default function DealerTable({ dealers }: { dealers: DealerWithCount[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return dealers;
    return dealers.filter(
      (d) => d.name.toLowerCase().includes(term) || d.location.toLowerCase().includes(term)
    );
  }, [dealers, search]);

  async function handleDelete(slug: string) {
    setPendingSlug(slug);
    setError(null);
    const res = await fetch(`/api/admin/dealers/${slug}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong. Please try again.");
      setPendingSlug(null);
      setConfirmSlug(null);
      return;
    }
    setPendingSlug(null);
    setConfirmSlug(null);
    router.refresh();
  }

  if (dealers.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface)] p-8 text-center">
        <p className="text-sm text-[var(--a-text-muted)]">No dealers yet.</p>
      </div>
    );
  }

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search dealers by name or location…"
        className="mb-4 w-full max-w-[360px] rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3.5 py-2.5 text-xs text-[var(--a-text)] outline-none transition-colors duration-150 placeholder:text-[var(--a-text-fainter)] focus:border-revio-yellow"
      />
      <div className="overflow-hidden rounded-xl border border-[var(--a-border)]">
        {error && (
          <p className="border-b border-[var(--a-border)] bg-[var(--a-warn-bg)] px-4 py-2.5 text-xs text-[var(--a-warn-text)]">
            {error}
          </p>
        )}
        {filtered.length === 0 ? (
          <div className="bg-[var(--a-surface)] p-8 text-center">
            <p className="text-sm text-[var(--a-text-muted)]">No dealers match &ldquo;{search}&rdquo;.</p>
          </div>
        ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--a-border)] bg-[var(--a-surface)] text-[9px] font-black uppercase tracking-wider text-[var(--a-text-faint)]">
              <th className="px-4 py-3">Dealer</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Cars</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-[var(--a-border)] last:border-b-0">
                <td className="px-4 py-3 font-bold text-[var(--a-text)]">
                  <Link href={`/admin/dealers/${d.slug}`} className="hover:text-revio-yellow hover:underline">
                    {d.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--a-text-muted)]">{d.location}</td>
                <td className="px-4 py-3 text-[var(--a-text-muted)]">{d.carCount}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/admin/dealers/${d.slug}`}
                      className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dealer/${d.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
                    >
                      View Public Profile ↗
                    </Link>
                    <Link
                      href={`/admin/dealers/${d.slug}/edit`}
                      className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
                    >
                      Edit
                    </Link>
                    {confirmSlug === d.slug ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(d.slug)}
                        disabled={pendingSlug === d.slug}
                        className="btn-tactile rounded-lg bg-[var(--a-warn-border)] px-3 py-1.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-warn-border-hover)] disabled:opacity-60"
                      >
                        {pendingSlug === d.slug
                          ? "Removing…"
                          : d.carCount > 0
                            ? `Confirm: delete + ${d.carCount} car${d.carCount === 1 ? "" : "s"}`
                            : "Confirm delete"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmSlug(d.slug)}
                        className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-bold text-[var(--a-warn-text)] hover:bg-[var(--a-surface-2-hover)]"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        )}
      </div>
    </div>
  );
}

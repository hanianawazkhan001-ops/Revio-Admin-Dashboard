"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Car } from "@/lib/cars";

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default function CarTable({
  cars,
  emptyMessage = "No cars yet.",
}: {
  cars: Car[];
  emptyMessage?: string;
}) {
  const router = useRouter();
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(slug: string) {
    setPendingSlug(slug);
    setError(null);
    const res = await fetch(`/api/admin/cars/${slug}`, { method: "DELETE" });
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

  if (cars.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--a-border)] bg-[var(--a-surface)] p-8 text-center">
        <p className="text-sm text-[var(--a-text-muted)]">{emptyMessage}</p>
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
              <th className="px-4 py-3">Car</th>
              <th className="px-4 py-3">Dealer</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.slug} className="border-b border-[var(--a-border)] last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 flex-none overflow-hidden rounded-lg bg-[var(--a-surface-2)]">
                      {car.images[0] && (
                        <Image src={car.images[0]} alt="" fill sizes="44px" className="object-cover" />
                      )}
                    </div>
                    <div>
                      <Link
                        href={`/admin/inventory/${car.slug}`}
                        className="block font-bold text-[var(--a-text)] hover:text-revio-yellow hover:underline"
                      >
                        {car.make} {car.model}
                      </Link>
                      <span className="text-[10px] text-[var(--a-text-fainter)]">
                        {car.year} · {car.mileage.toLocaleString()} miles
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--a-text-muted)]">
                  <Link href={`/admin/dealers/${car.dealerSlug}`} className="hover:text-revio-yellow hover:underline">
                    {car.dealerName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--a-text-muted)]">£{car.cashPrice.toLocaleString()}</td>
                <td className="px-4 py-3 text-[var(--a-text-muted)]">{relativeDate(car.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/admin/inventory/${car.slug}`}
                      className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
                    >
                      View
                    </Link>
                    <Link
                      href={`/cars/${car.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
                    >
                      View on Website ↗
                    </Link>
                    <Link
                      href={`/admin/inventory/${car.slug}/edit`}
                      className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3 py-1.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
                    >
                      Edit
                    </Link>
                    {confirmSlug === car.slug ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(car.slug)}
                        disabled={pendingSlug === car.slug}
                        className="btn-tactile rounded-lg bg-[var(--a-warn-border)] px-3 py-1.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-warn-border-hover)] disabled:opacity-60"
                      >
                        {pendingSlug === car.slug ? "Removing…" : "Confirm delete"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmSlug(car.slug)}
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
    </div>
  );
}

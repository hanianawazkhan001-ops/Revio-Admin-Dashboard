import type { Metadata } from "next";
import Link from "next/link";
import { getCars } from "@/lib/cars";
import { getCarIssues } from "@/lib/carIssues";

export const metadata: Metadata = { title: "Issues | Revio Inventory" };
export const dynamic = "force-dynamic";

export default async function AdminIssuesPage() {
  const cars = await getCars();
  const issues = getCarIssues(cars);

  return (
    <div className="mx-auto max-w-[900px] px-6 py-14">
      <Link href="/admin" className="text-xs font-bold text-[var(--a-text-muted)] hover:text-[var(--a-text)]">
        ← Back to Inventory
      </Link>
      <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-revio-yellow">
        Issues
      </p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--a-text)]">
        {issues.length === 0
          ? "Nothing needs attention."
          : `${issues.length} listing${issues.length === 1 ? "" : "s"} need${
              issues.length === 1 ? "s" : ""
            } attention.`}
      </h1>
      <p className="mt-2 max-w-md text-sm text-[var(--a-text-muted)]">
        Click any listing below to jump straight to its edit page and fix it.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--a-border)]">
        {issues.length === 0 ? (
          <div className="bg-[var(--a-surface)] p-8 text-center">
            <p className="text-sm text-[var(--a-text-muted)]">
              Every listing meets the current requirements.
            </p>
          </div>
        ) : (
          issues.map((issue) => (
            <Link
              key={issue.slug}
              href={`/admin/inventory/${issue.slug}/edit`}
              className="btn-tactile flex items-center justify-between gap-4 border-b border-[var(--a-border)] bg-[var(--a-surface)] p-4 transition-colors duration-150 last:border-b-0 hover:bg-[var(--a-surface-2-hover)]"
            >
              <div>
                <strong className="block text-sm font-bold text-[var(--a-text)]">
                  {issue.make} {issue.model}
                </strong>
                <span className="mt-0.5 block text-xs text-[var(--a-warn-text)]">{issue.message}</span>
              </div>
              <span className="flex-none text-xs font-bold text-revio-yellow">Fix →</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getDealers } from "@/lib/dealers";
import CarForm from "@/components/admin/CarForm";

export const metadata: Metadata = { title: "Add Car | Revio Inventory" };
export const dynamic = "force-dynamic";

export default async function NewCarPage() {
  const dealers = await getDealers();

  return (
    <div className="mx-auto max-w-[720px] px-6 py-14">
      <Link href="/admin" className="text-xs font-bold text-[var(--a-text-muted)] hover:text-[var(--a-text)]">
        ← Back to Inventory
      </Link>
      <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-revio-yellow">
        New car
      </p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--a-text)]">Add a car.</h1>

      {dealers.length === 0 && (
        <p className="mt-4 rounded-xl border border-[var(--a-border)] bg-[var(--a-warn-bg)] px-4 py-3 text-sm text-[var(--a-warn-text)]">
          No dealers exist yet.{" "}
          <Link href="/admin/dealers/new" className="font-bold underline">
            Add a dealer first
          </Link>{" "}
          — every car needs one.
        </p>
      )}

      <div className="mt-6 rounded-[22px] border border-[var(--a-border)] bg-[var(--a-surface)] p-7">
        <CarForm mode="create" dealers={dealers} />
      </div>
    </div>
  );
}

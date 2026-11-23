import type { Metadata } from "next";
import Link from "next/link";
import { getCars } from "@/lib/cars";
import { getDealers } from "@/lib/dealers";
import InventoryBrowser from "@/components/admin/InventoryBrowser";

export const metadata: Metadata = {
  title: "Inventory | Revio Inventory",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [cars, dealers] = await Promise.all([getCars(), getDealers()]);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-revio-yellow">
            Inventory
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--a-text)]">
            All cars on Revio.
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/dealers/new"
            className="btn-tactile rounded-xl border border-[var(--a-border)] bg-[var(--a-surface-2)] px-5 py-3 text-sm font-black text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
          >
            + Add Dealer
          </Link>
          <Link
            href="/admin/inventory/new"
            className="btn-tactile rounded-xl bg-revio-yellow px-5 py-3 text-sm font-black text-revio-black hover:shadow-lg"
          >
            + Add Car
          </Link>
        </div>
      </div>

      <InventoryBrowser
        cars={cars}
        dealers={dealers.map((d) => ({ slug: d.slug, name: d.name }))}
      />
    </div>
  );
}

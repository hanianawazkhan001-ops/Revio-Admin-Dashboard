import type { Metadata } from "next";
import Link from "next/link";
import { getDealers } from "@/lib/dealers";
import { getCars } from "@/lib/cars";
import DealerTable from "@/components/admin/DealerTable";

export const metadata: Metadata = { title: "Dealers | Revio Inventory" };

// Dealer/car counts change as staff make edits, so this must fetch fresh
// on every visit rather than being cached.
export const dynamic = "force-dynamic";

export default async function AdminDealersPage() {
  const [dealers, cars] = await Promise.all([getDealers(), getCars()]);

  const carCountBySlug = new Map<string, number>();
  for (const car of cars) {
    carCountBySlug.set(car.dealerSlug, (carCountBySlug.get(car.dealerSlug) ?? 0) + 1);
  }
  const dealersWithCounts = dealers.map((d) => ({
    ...d,
    carCount: carCountBySlug.get(d.slug) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-14">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-revio-yellow">
            Dealers
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--a-text)]">
            Manage dealers.
          </h1>
        </div>
        <Link
          href="/admin/dealers/new"
          className="btn-tactile rounded-xl bg-revio-yellow px-5 py-3 text-sm font-black text-revio-black hover:shadow-lg"
        >
          + Add Dealer
        </Link>
      </div>
      <DealerTable dealers={dealersWithCounts} />
    </div>
  );
}

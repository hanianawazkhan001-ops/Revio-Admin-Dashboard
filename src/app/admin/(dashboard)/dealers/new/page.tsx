import type { Metadata } from "next";
import Link from "next/link";
import DealerForm from "@/components/admin/DealerForm";

export const metadata: Metadata = { title: "Add Dealer | Revio Inventory" };

export default function NewDealerPage() {
  return (
    <div className="mx-auto max-w-[600px] px-6 py-14">
      <Link href="/admin/dealers" className="text-xs font-bold text-[var(--a-text-muted)] hover:text-[var(--a-text)]">
        ← Back to Dealers
      </Link>
      <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-revio-yellow">
        New dealer
      </p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--a-text)]">Add a dealer.</h1>
      <div className="mt-6 rounded-[22px] border border-[var(--a-border)] bg-[var(--a-surface)] p-7">
        <DealerForm mode="create" />
      </div>
    </div>
  );
}

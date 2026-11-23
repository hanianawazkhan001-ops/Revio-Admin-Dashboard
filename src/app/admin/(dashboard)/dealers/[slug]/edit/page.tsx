import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDealer } from "@/lib/dealers";
import DealerForm from "@/components/admin/DealerForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dealer = await getDealer(slug);
  return { title: dealer ? `Edit ${dealer.name} | Revio Inventory` : "Edit Dealer" };
}

export default async function EditDealerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dealer = await getDealer(slug);
  if (!dealer) notFound();

  return (
    <div className="mx-auto max-w-[600px] px-6 py-14">
      <Link href="/admin/dealers" className="text-xs font-bold text-[var(--a-text-muted)] hover:text-[var(--a-text)]">
        ← Back to Dealers
      </Link>
      <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-revio-yellow">
        Edit dealer
      </p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--a-text)]">{dealer.name}</h1>
      <div className="mt-6 rounded-[22px] border border-[var(--a-border)] bg-[var(--a-surface)] p-7">
        <DealerForm
          mode="edit"
          initialSlug={dealer.slug}
          initialName={dealer.name}
          initialLocation={dealer.location}
          initialDescription={dealer.description ?? ""}
          initialContactName={dealer.contactName ?? ""}
          initialPhone={dealer.phone ?? ""}
          initialEmail={dealer.email ?? ""}
        />
      </div>
    </div>
  );
}

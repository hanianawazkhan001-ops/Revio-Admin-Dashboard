import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDealer } from "@/lib/dealers";
import { getCarsByDealer } from "@/lib/cars";
import CarTable from "@/components/admin/CarTable";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dealer = await getDealer(slug);
  return { title: dealer ? `${dealer.name} | Revio Inventory` : "Dealer" };
}

export default async function AdminDealerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dealer = await getDealer(slug);
  if (!dealer) notFound();

  const cars = await getCarsByDealer(slug);

  const contactRows = [
    { label: "Contact name", value: dealer.contactName },
    { label: "Phone", value: dealer.phone },
    { label: "Email", value: dealer.email },
  ].filter((row) => row.value);

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-14">
      <Link href="/admin/dealers" className="text-xs font-bold text-[var(--a-text-muted)] hover:text-[var(--a-text)]">
        ← Back to Dealers
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-revio-yellow">
            Dealer profile
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--a-text)]">{dealer.name}</h1>
          <p className="mt-1 text-sm text-[var(--a-text-muted)]">{dealer.location}</p>
        </div>
        <div className="flex flex-none flex-wrap gap-2">
          <Link
            href={`/dealer/${dealer.slug}`}
            target="_blank"
            className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-4 py-2.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
          >
            View public page
          </Link>
          <Link
            href={`/admin/dealers/${dealer.slug}/edit`}
            className="btn-tactile rounded-lg bg-revio-yellow px-4 py-2.5 text-xs font-black text-revio-black hover:shadow-lg"
          >
            Edit dealer
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[.4fr_.6fr]">
        <div className="rounded-[18px] border border-[var(--a-border)] bg-[var(--a-surface)] p-6">
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--a-text-faint)]">
            Description
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--a-text-body)]">
            {dealer.description || "No description added yet."}
          </p>
        </div>
        <div className="rounded-[18px] border border-[var(--a-border)] bg-[var(--a-surface)] p-6">
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--a-text-faint)]">
            Contact details
          </p>
          {contactRows.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--a-text-muted)]">No contact details added yet.</p>
          ) : (
            <dl className="mt-3 grid gap-2.5">
              {contactRows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4">
                  <dt className="text-xs text-[var(--a-text-fainter)]">{row.label}</dt>
                  <dd className="text-sm font-bold text-[var(--a-text)]">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="text-lg font-black text-[var(--a-text)]">
          {cars.length} car{cars.length === 1 ? "" : "s"} listed
        </h2>
      </div>
      <div className="mt-3">
        <CarTable cars={cars} emptyMessage="This dealer has no cars listed yet." />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCar } from "@/lib/cars";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCar(slug);
  return { title: car ? `${car.make} ${car.model} | Revio Inventory` : "Car" };
}

export default async function AdminCarProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car) notFound();

  const d = car.details;

  const facts: [string, string][] = [
    ["Year", String(car.year)],
    ["Mileage", `${car.mileage.toLocaleString()} miles`],
    ["Gearbox", car.gearbox],
    ["Fuel type", car.fuel],
    ["Body type", d?.bodyType ?? car.bodyType],
    ["Colour", d?.colour ?? "—"],
    ["Registration", d?.registration ?? "—"],
    ["Engine size", d?.engineSize ?? "—"],
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-14">
      <Link href="/admin" className="text-xs font-bold text-[var(--a-text-muted)] hover:text-[var(--a-text)]">
        ← Back to Inventory
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-revio-yellow">
            Car profile
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--a-text)]">
            {car.make} {car.model}
          </h1>
          <p className="mt-1 text-sm text-[var(--a-text-muted)]">
            <Link href={`/admin/dealers/${car.dealerSlug}`} className="hover:text-revio-yellow hover:underline">
              {car.dealerName}
            </Link>{" "}
            · {car.dealerLocation}
          </p>
        </div>
        <div className="flex flex-none flex-wrap gap-2">
          <Link
            href={`/cars/${car.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-4 py-2.5 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)]"
          >
            View on Website ↗
          </Link>
          <Link
            href={`/admin/inventory/${car.slug}/edit`}
            className="btn-tactile rounded-lg bg-revio-yellow px-4 py-2.5 text-xs font-black text-revio-black hover:shadow-lg"
          >
            Edit car
          </Link>
        </div>
      </div>

      {car.images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {car.images.map((src) => (
            <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[var(--a-surface-2)]">
              <Image src={src} alt={`${car.make} ${car.model}`} fill sizes="25vw" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[.4fr_.6fr]">
        <div className="rounded-[18px] border border-[var(--a-border)] bg-[var(--a-surface)] p-6">
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--a-text-faint)]">Price</p>
          <p className="mt-2 text-2xl font-black text-[var(--a-text)]">£{car.cashPrice.toLocaleString()}</p>
          <p className="text-xs text-[var(--a-text-muted)]">Est. £{car.monthlyPrice} / month</p>
          {d?.description && (
            <>
              <p className="mt-5 text-[9px] font-black uppercase tracking-wider text-[var(--a-text-faint)]">
                Description
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--a-text-body)]">{d.description}</p>
            </>
          )}
        </div>
        <div className="rounded-[18px] border border-[var(--a-border)] bg-[var(--a-surface)] p-6">
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--a-text-faint)]">Details</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[10px] text-[var(--a-text-fainter)]">{label}</dt>
                <dd className="text-sm font-bold text-[var(--a-text)]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {d && d.features.length > 0 && (
        <div className="mt-4 rounded-[18px] border border-[var(--a-border)] bg-[var(--a-surface)] p-6">
          <p className="text-[9px] font-black uppercase tracking-wider text-[var(--a-text-faint)]">
            Features
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {d.features.map((f) => (
              <span
                key={f}
                className="rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-2.5 py-1.5 text-xs font-bold text-[var(--a-text)]"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

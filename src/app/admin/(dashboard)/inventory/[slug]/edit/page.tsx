import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCar } from "@/lib/cars";
import { getDealers } from "@/lib/dealers";
import CarForm from "@/components/admin/CarForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCar(slug);
  return { title: car ? `Edit ${car.make} ${car.model} | Revio Inventory` : "Edit Car" };
}

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [car, dealers] = await Promise.all([getCar(slug), getDealers()]);
  if (!car) notFound();

  return (
    <div className="mx-auto max-w-[720px] px-6 py-14">
      <Link href="/admin" className="text-xs font-bold text-[var(--a-text-muted)] hover:text-[var(--a-text)]">
        ← Back to Inventory
      </Link>
      <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-revio-yellow">
        Edit car
      </p>
      <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--a-text)]">
        {car.make} {car.model}
      </h1>
      <div className="mt-6 rounded-[22px] border border-[var(--a-border)] bg-[var(--a-surface)] p-7">
        <CarForm
          mode="edit"
          dealers={dealers}
          initialSlug={car.slug}
          initial={{
            make: car.make,
            model: car.model,
            bodyType: car.bodyType,
            year: car.year,
            mileage: car.mileage,
            gearbox: car.gearbox,
            fuel: car.fuel,
            cashPrice: car.cashPrice,
            monthlyPrice: car.monthlyPrice,
            dealerSlug: car.dealerSlug,
            badgeLabel: car.badge.label,
            badgeKind: car.badge.kind,
            images: car.images,
            details: car.details,
          }}
        />
      </div>
    </div>
  );
}

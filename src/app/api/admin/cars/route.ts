import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminUser } from "@/lib/adminAuth";
import { slugify } from "@/lib/slugify";
import { MIN_CAR_PHOTOS, MAX_CAR_PHOTOS } from "@/lib/cars";

export async function POST(request: Request) {
  const { user, response } = await requireAdminUser();
  if (!user) return response!;

  const body = await request.json();
  const {
    make,
    model,
    bodyType,
    year,
    mileage,
    gearbox,
    fuel,
    cashPrice,
    monthlyPrice,
    dealerId,
    badgeLabel,
    badgeKind,
  } = body;

  if (
    !make ||
    !model ||
    !bodyType ||
    !year ||
    !mileage ||
    !gearbox ||
    !fuel ||
    !cashPrice ||
    !monthlyPrice ||
    !dealerId ||
    !badgeLabel ||
    !badgeKind
  ) {
    return NextResponse.json(
      { error: "Please complete all required fields." },
      { status: 400 }
    );
  }

  const images: string[] = Array.isArray(body.images) ? body.images : [];
  if (images.length < MIN_CAR_PHOTOS) {
    return NextResponse.json(
      { error: `Please add at least ${MIN_CAR_PHOTOS} photos before saving.` },
      { status: 400 }
    );
  }
  if (images.length > MAX_CAR_PHOTOS) {
    return NextResponse.json(
      { error: `A car can have at most ${MAX_CAR_PHOTOS} photos.` },
      { status: 400 }
    );
  }

  const baseSlug = slugify(`${make}-${model}`);
  if (!baseSlug) {
    return NextResponse.json(
      { error: "Please enter a valid make and model." },
      { status: 400 }
    );
  }

  let finalSlug = baseSlug;
  let suffix = 2;
  for (;;) {
    const { data: existing } = await supabaseAdmin
      .from("cars")
      .select("slug")
      .eq("slug", finalSlug)
      .maybeSingle();
    if (!existing) break;
    finalSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const tone = Math.floor(Math.random() * 12) + 1;

  const { data, error } = await supabaseAdmin
    .from("cars")
    .insert({
      slug: finalSlug,
      make,
      model,
      body_type: bodyType,
      year,
      mileage,
      gearbox,
      fuel,
      cash_price: cashPrice,
      monthly_price: monthlyPrice,
      dealer_id: dealerId,
      tone,
      badge_label: badgeLabel,
      badge_kind: badgeKind,
      images,
      details: body.details ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create car:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, car: data });
}

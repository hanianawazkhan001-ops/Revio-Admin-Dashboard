import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminUser } from "@/lib/adminAuth";
import { MIN_CAR_PHOTOS, MAX_CAR_PHOTOS } from "@/lib/cars";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { user, response } = await requireAdminUser();
  if (!user) return response!;

  const { slug } = await params;
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

  const { error } = await supabaseAdmin
    .from("cars")
    .update({
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
      badge_label: badgeLabel,
      badge_kind: badgeKind,
      images,
      details: body.details ?? null,
    })
    .eq("slug", slug);

  if (error) {
    console.error("Failed to update car:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { user, response } = await requireAdminUser();
  if (!user) return response!;

  const { slug } = await params;

  const { error } = await supabaseAdmin.from("cars").delete().eq("slug", slug);

  if (error) {
    console.error("Failed to delete car:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

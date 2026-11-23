import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminUser } from "@/lib/adminAuth";
import { slugify } from "@/lib/slugify";

export async function POST(request: Request) {
  const { user, response } = await requireAdminUser();
  if (!user) return response!;

  const body = await request.json();
  const { name, location, description, contactName, phone, email } = body;

  if (!name || !location) {
    return NextResponse.json(
      { error: "Name and location are required." },
      { status: 400 }
    );
  }

  const baseSlug = slugify(name);
  if (!baseSlug) {
    return NextResponse.json({ error: "Please enter a valid name." }, { status: 400 });
  }

  // Ensure the slug is unique — append -2, -3, etc. on collision.
  let finalSlug = baseSlug;
  let suffix = 2;
  for (;;) {
    const { data: existing } = await supabaseAdmin
      .from("dealers")
      .select("id")
      .eq("slug", finalSlug)
      .maybeSingle();
    if (!existing) break;
    finalSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const { data, error } = await supabaseAdmin
    .from("dealers")
    .insert({
      slug: finalSlug,
      name,
      location,
      description: description || null,
      contact_name: contactName || null,
      phone: phone || null,
      email: email || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create dealer:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, dealer: data });
}

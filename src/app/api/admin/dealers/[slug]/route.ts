import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminUser } from "@/lib/adminAuth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { user, response } = await requireAdminUser();
  if (!user) return response!;

  const { slug } = await params;
  const body = await request.json();
  const { name, location, description, contactName, phone, email } = body;

  if (!name || !location) {
    return NextResponse.json(
      { error: "Name and location are required." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("dealers")
    .update({
      name,
      location,
      description: description || null,
      contact_name: contactName || null,
      phone: phone || null,
      email: email || null,
    })
    .eq("slug", slug);

  if (error) {
    console.error("Failed to update dealer:", error.message);
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

  // Cascades to the dealer's cars too (dealers(id) on delete cascade),
  // by design — agreed when this module was scoped.
  const { error } = await supabaseAdmin.from("dealers").delete().eq("slug", slug);

  if (error) {
    console.error("Failed to delete dealer:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

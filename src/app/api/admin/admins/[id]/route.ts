import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireSuperAdminUser, isSuperAdmin } from "@/lib/adminAuth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireSuperAdminUser();
  if (!user) return response!;

  const { id } = await params;

  if (id === user.id) {
    return NextResponse.json(
      { error: "You can't remove your own account." },
      { status: 400 }
    );
  }

  const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list admins:", listError.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
  if (list.users.length <= 1) {
    return NextResponse.json(
      { error: "Can't remove the last remaining admin." },
      { status: 400 }
    );
  }

  const target = list.users.find((u) => u.id === id);
  if (target && isSuperAdmin(target)) {
    return NextResponse.json(
      { error: "Super admin accounts can't be removed here." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    console.error("Failed to remove admin:", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

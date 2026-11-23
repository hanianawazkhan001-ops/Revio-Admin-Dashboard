"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="btn-tactile rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] px-3.5 py-2 text-xs font-bold text-[var(--a-text)] hover:bg-[var(--a-surface-2-hover)] disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Log Out"}
    </button>
  );
}

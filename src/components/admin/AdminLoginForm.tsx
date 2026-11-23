"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Incorrect email or password.");
      setSubmitting(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3.5">
      <div>
        <label className="mb-1.5 block text-[8px] font-black uppercase tracking-wider text-[#8A8D91]">
          Email address
        </label>
        <input
          required
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@revio.co.uk"
          className="w-full rounded-xl border border-[#2B2D31] bg-[#18191C] px-3.5 py-3.5 text-sm text-white outline-none transition-colors duration-150 placeholder:text-[#6C6F75] focus:border-revio-yellow"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[8px] font-black uppercase tracking-wider text-[#8A8D91]">
          Password
        </label>
        <input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-[#2B2D31] bg-[#18191C] px-3.5 py-3.5 text-sm text-white outline-none transition-colors duration-150 placeholder:text-[#6C6F75] focus:border-revio-yellow"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-[#3A1F17] px-3.5 py-2.5 text-xs text-[#F5B199]">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-tactile mt-1 rounded-xl bg-revio-yellow px-5 py-3.5 text-sm font-black text-revio-black hover:shadow-lg disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

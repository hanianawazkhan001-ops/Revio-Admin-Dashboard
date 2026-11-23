"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AcceptInviteForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "error">("checking");
  const [linkError, setLinkError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase invite links can land here in a couple of different shapes
    // depending on config, so this handles all of them rather than
    // assuming one:
    //  - the browser client auto-parses "#access_token=..." on load
    //  - "?code=..." (PKCE) needs exchangeCodeForSession
    //  - "?token_hash=...&type=..." needs verifyOtp
    async function establishSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setStatus("ready");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          setStatus("ready");
          return;
        }
      }

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "invite" | "email",
        });
        if (!error) {
          setStatus("ready");
          return;
        }
      }

      setLinkError(
        "This invite link is invalid or has expired. Ask an existing admin to send a new one."
      );
      setStatus("error");
    }

    establishSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setFormError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    setFormError(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setFormError(error.message);
      setSubmitting(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="rounded-[22px] border border-[#2B2D31] bg-[#111214] p-7 shadow-2xl sm:p-8">
      {status === "checking" && <p className="text-sm text-[#9DA0A6]">Checking your invite…</p>}

      {status === "error" && (
        <>
          <p className="text-[10px] font-black uppercase tracking-wider text-revio-yellow-deep">
            Invite link
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            Something&rsquo;s not right.
          </h1>
          <p className="mt-3 rounded-lg bg-[#3A1F17] px-3.5 py-2.5 text-xs text-[#F5B199]">
            {linkError}
          </p>
        </>
      )}

      {status === "ready" && (
        <>
          <p className="text-[10px] font-black uppercase tracking-wider text-revio-yellow-deep">
            Welcome to Revio
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            Set your password.
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-[#9DA0A6]">
            Choose a password to finish setting up your admin account.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-3.5">
            <div>
              <label className="mb-1.5 block text-[8px] font-black uppercase tracking-wider text-[#8A8D91]">
                New password
              </label>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#2B2D31] bg-[#18191C] px-3.5 py-3.5 text-sm text-white outline-none transition-colors duration-150 placeholder:text-[#6C6F75] focus:border-revio-yellow"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[8px] font-black uppercase tracking-wider text-[#8A8D91]">
                Confirm password
              </label>
              <input
                required
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#2B2D31] bg-[#18191C] px-3.5 py-3.5 text-sm text-white outline-none transition-colors duration-150 placeholder:text-[#6C6F75] focus:border-revio-yellow"
              />
            </div>
            {formError && (
              <p className="rounded-lg bg-[#3A1F17] px-3.5 py-2.5 text-xs text-[#F5B199]">
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-tactile mt-1 rounded-xl bg-revio-yellow px-5 py-3.5 text-sm font-black text-revio-black hover:shadow-lg disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Set Password & Continue"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

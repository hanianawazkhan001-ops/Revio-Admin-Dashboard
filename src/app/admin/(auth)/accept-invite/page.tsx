import type { Metadata } from "next";
import AcceptInviteForm from "@/components/admin/AcceptInviteForm";

export const metadata: Metadata = {
  title: "Set Your Password | Revio Inventory",
};

export default function AcceptInvitePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6 py-16">
      <div className="w-full max-w-[400px]">
        <p className="mb-6 text-center text-lg font-black tracking-tight text-white">
          REVIO <span className="text-revio-yellow">INVENTORY</span>
        </p>
        <AcceptInviteForm />
      </div>
    </main>
  );
}

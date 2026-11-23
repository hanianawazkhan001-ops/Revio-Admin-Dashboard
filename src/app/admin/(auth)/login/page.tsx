import type { Metadata } from "next";
import AdminLoginForm from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Sign In | Revio Inventory",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6 py-16">
      <div className="w-full max-w-[400px]">
        <p className="mb-6 text-center text-lg font-black tracking-tight text-white">
          REVIO <span className="text-revio-yellow">INVENTORY</span>
        </p>
        <div className="rounded-[22px] border border-[#2B2D31] bg-[#111214] p-7 shadow-2xl sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-wider text-revio-yellow-deep">
            Staff sign in
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            Manage dealers &amp; inventory.
          </h1>
          <p className="mt-1.5 text-xs leading-relaxed text-[#9DA0A6]">
            This area is for Revio staff only. Contact Alex if you need
            access.
          </p>
          <div className="mt-6">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}

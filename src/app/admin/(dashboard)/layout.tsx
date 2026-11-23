import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { isSuperAdmin } from "@/lib/adminAuth";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";
import AdminMobileNav from "@/components/admin/AdminMobileNav";

const NAV_LINKS = [
  { href: "/admin", label: "Inventory" },
  { href: "/admin/dealers", label: "Dealers" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const showAdminsLink = Boolean(user && isSuperAdmin(user));
  const mobileLinks = showAdminsLink
    ? [...NAV_LINKS, { href: "/admin/admins", label: "Admins" }]
    : NAV_LINKS;

  return (
    <div id="admin-shell" className="admin-shell flex min-h-screen flex-col bg-[var(--a-bg)]">
      <script
        // Runs before the rest of the shell paints, so a saved "light"
        // preference applies immediately instead of flashing dark first.
        dangerouslySetInnerHTML={{
          __html:
            "try{if(localStorage.getItem('admin-theme')==='light')document.currentScript.parentElement.setAttribute('data-theme','light');}catch(e){}",
        }}
      />
      <header className="border-b border-[var(--a-border)] bg-[var(--a-header-bg)]">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="text-sm font-black tracking-tight text-[var(--a-text)]">
              REVIO <span className="text-revio-yellow">INVENTORY</span>
            </Link>
            <nav className="hidden items-center gap-5 sm:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-bold text-[var(--a-text-muted)] transition-colors duration-150 hover:text-[var(--a-text)]"
                >
                  {link.label}
                </Link>
              ))}
              {showAdminsLink && (
                <Link
                  href="/admin/admins"
                  className="text-xs font-bold text-[var(--a-text-muted)] transition-colors duration-150 hover:text-[var(--a-text)]"
                >
                  Admins
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[var(--a-text-muted)] sm:inline">{user?.email}</span>
            <AdminThemeToggle />
            <AdminLogoutButton />
            <AdminMobileNav links={mobileLinks} />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

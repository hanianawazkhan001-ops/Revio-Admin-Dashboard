import { redirect } from "next/navigation";

// The inventory browser now lives at the dashboard root (/admin) — this
// route is kept only so any existing links/bookmarks still land somewhere.
export default function InventoryRedirectPage() {
  redirect("/admin");
}

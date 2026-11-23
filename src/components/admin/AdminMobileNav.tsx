"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function AdminMobileNav({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
        aria-expanded={open}
        className="btn-tactile grid size-9 flex-none place-items-center rounded-lg border border-[var(--a-border)] bg-[var(--a-surface-2)] hover:bg-[var(--a-surface-2-hover)]"
      >
        <span className="sr-only">Menu</span>
        <div className="flex flex-col gap-[4px]">
          <span
            className={`h-[2px] w-4 bg-[var(--a-text)] transition-transform duration-200 ${open ? "translate-y-[6px] rotate-45" : ""}`}
          />
          <span
            className={`h-[2px] w-4 bg-[var(--a-text)] transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`h-[2px] w-4 bg-[var(--a-text)] transition-transform duration-200 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="fade-in-up absolute right-0 top-full z-40 mt-2 w-44 rounded-xl border border-[var(--a-border)] bg-[var(--a-surface)] p-1.5 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-bold text-[var(--a-text)] transition-colors duration-150 hover:bg-[var(--a-surface-2)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

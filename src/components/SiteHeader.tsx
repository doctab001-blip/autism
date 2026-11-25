"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";

const NAV = [
  { href: "/", label: "Blueprint" },
  { href: "/pillars", label: "Pillars" },
  { href: "/environment", label: "Environment" },
  { href: "/tracker", label: "ABC Tracker" },
  { href: "/board", label: "Child Board" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-sage-800">
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-sage-600 text-white">
            ∞
          </span>
          HomePath Autism
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap gap-1">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-lg px-3 text-base font-medium ${
                      active
                        ? "bg-calm-100 text-calm-700"
                        : "text-ink-soft hover:bg-sage-50 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <ProfileSwitcher />
    </header>
  );
}

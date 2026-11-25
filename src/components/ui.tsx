import type { ReactNode } from "react";

/** Shared class strings and tiny presentational helpers (no state). */

export const btn =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-2 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
export const btnPrimary = `${btn} bg-sage-600 text-white hover:bg-sage-700`;
export const btnSecondary = `${btn} border border-sage-300 bg-paper text-sage-800 hover:bg-sage-50`;
export const btnDanger = `${btn} border border-clay-100 bg-clay-50 text-clay-700 hover:bg-clay-100`;
export const inputClass =
  "min-h-12 w-full rounded-xl border border-line bg-paper px-4 py-2 text-base text-ink placeholder:text-ink-soft/70";

export function Card({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "li";
}) {
  return (
    <Tag className={`avoid-break rounded-2xl border border-line bg-paper p-5 shadow-sm sm:p-6 ${className}`}>
      {children}
    </Tag>
  );
}

export function PageTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-calm-700">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 text-3xl font-bold leading-tight text-ink sm:text-4xl">{title}</h1>
      {children ? <div className="mt-3 max-w-3xl text-lg text-ink-soft">{children}</div> : null}
    </header>
  );
}

export function BulletList({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-sage-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-5 text-lg font-semibold text-sage-800 first:mt-0">{children}</h3>;
}

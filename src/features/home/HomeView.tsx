"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BulletList, Card, PageTitle, btnPrimary, btnSecondary, inputClass } from "@/components/ui";
import { useProfile } from "@/context/ProfileContext";
import {
  ALL_PROFILES,
  LEVEL_META,
  AGE_META,
  PILLAR_META,
  type ClinicalProfile,
} from "@/data/clinicalMatrix";

function formatTime(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function Blueprint({ profile }: { profile: ClinicalProfile }) {
  const cards = [
    {
      key: "speech",
      title: `${PILLAR_META.speech.emoji} ${PILLAR_META.speech.label}`,
      headline: profile.speech.headline,
      items: profile.speech.targets.slice(0, 3),
    },
    {
      key: "behavior",
      title: `${PILLAR_META.behavior.emoji} ${PILLAR_META.behavior.label}`,
      headline: profile.behavior.headline,
      items: profile.behavior.priorities,
    },
    {
      key: "sensory",
      title: `${PILLAR_META.sensory.emoji} ${PILLAR_META.sensory.label}`,
      headline: profile.sensory.headline,
      items: profile.sensory.seeking.slice(0, 3),
    },
    {
      key: "adl",
      title: `${PILLAR_META.adl.emoji} ${PILLAR_META.adl.label}`,
      headline: profile.adl.headline,
      items: profile.adl.skills.map((s) => `${s.name} (${s.steps.length} steps, backward chaining)`),
    },
    {
      key: "social",
      title: `${PILLAR_META.social.emoji} ${PILLAR_META.social.label}`,
      headline: profile.social.headline,
      items: profile.social.goals.slice(0, 3),
    },
  ];

  return (
    <section aria-labelledby="blueprint-h" className="space-y-6">
      <h2 id="blueprint-h" className="text-2xl font-bold">
        Clinical blueprint for {profile.title}
      </h2>
      <Card className="bg-calm-50">
        <p className="text-lg">{profile.summary}</p>
        <p className="mt-2 text-sm text-ink-soft">
          {LEVEL_META[profile.level].description}
        </p>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-sage-800">Daily therapy dose</h3>
        <p className="mt-1 text-3xl font-bold text-calm-700">{profile.dose.label}</p>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div>
            <h4 className="mb-2 font-semibold">How to split it</h4>
            <BulletList items={profile.dose.blocks} />
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Weekly rhythm</h4>
            <p>{profile.dose.weekly}</p>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Embedded practice</h4>
            <p>{profile.dose.embedded}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-soft">
          Typical ranges for planning only. Agree the real dose with your child’s BCBA, SLP and
          OT, and shorten sessions whenever your child is tired or unwell.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.key} className="flex flex-col">
            <h3 className="text-lg font-semibold text-sage-800">{card.title}</h3>
            <p className="mt-1 font-medium">{card.headline}</p>
            <BulletList items={card.items} className="mt-3 text-sm" />
            <Link
              href="/pillars"
              className="mt-auto pt-4 text-sm font-semibold text-calm-700 underline underline-offset-4"
            >
              Open the module
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Routine({ profile }: { profile: ClinicalProfile }) {
  return (
    <section aria-labelledby="routine-h" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h2 id="routine-h" className="text-2xl font-bold">
            Sample daily routine
          </h2>
          <p className="text-ink-soft">
            Time-anchored home routine for {profile.title}. Adjust times to your family’s day.
          </p>
        </div>
        <button type="button" className={btnSecondary} onClick={() => window.print()}>
          🖨️ Print visual schedule
        </button>
      </div>

      {/* Screen version */}
      <ol className="space-y-3 print:hidden">
        {profile.routine.map((block) => (
          <li
            key={`${block.time}-${block.title}`}
            className="grid grid-cols-[5.5rem_1fr] gap-4 rounded-2xl border border-line bg-paper p-4 sm:grid-cols-[6.5rem_1fr_auto]"
          >
            <div className="text-lg font-bold text-calm-700">{formatTime(block.time)}</div>
            <div>
              <h3 className="text-lg font-semibold">{block.title}</h3>
              <p className="text-ink-soft">{block.detail}</p>
            </div>
            <div className="col-span-2 flex items-center gap-2 text-sm text-ink-soft sm:col-span-1">
              <span aria-hidden>{PILLAR_META[block.pillar].emoji}</span>
              <span>{PILLAR_META[block.pillar].label}</span>
              <span aria-hidden>·</span>
              <span>{block.minutes >= 180 ? "School / programme" : `${block.minutes} min`}</span>
            </div>
          </li>
        ))}
      </ol>

      {/* Print version: large, simple visual cards */}
      <div className="hidden print:block">
        <h2 className="mb-1 text-2xl font-bold">My day</h2>
        <p className="mb-4 text-sm">{profile.title}</p>
        <ol className="grid grid-cols-2 gap-3">
          {profile.routine.map((block) => (
            <li
              key={`p-${block.time}-${block.title}`}
              className="avoid-break rounded-xl border-2 border-black p-4 text-center"
            >
              <div className="text-4xl" aria-hidden>
                {PILLAR_META[block.pillar].emoji}
              </div>
              <div className="mt-1 text-xl font-bold">{block.title}</div>
              <div className="text-base">{formatTime(block.time)}</div>
              <div className="mt-2 text-2xl" aria-hidden>
                ☐
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function searchText(p: ClinicalProfile): string {
  return [
    p.title,
    AGE_META[p.age].range,
    LEVEL_META[p.level].label,
    p.summary,
    p.dose.label,
    p.speech.headline,
    ...p.speech.targets,
    ...p.speech.aac,
    p.behavior.headline,
    ...p.behavior.priorities,
    p.sensory.headline,
    p.adl.headline,
    ...p.adl.skills.map((s) => s.name),
    p.social.headline,
  ]
    .join(" ")
    .toLowerCase();
}

function Matrix() {
  const { profile: current, setBoth } = useProfile();
  const [query, setQuery] = useState("");
  const index = useMemo(() => ALL_PROFILES.map((p) => ({ p, text: searchText(p) })), []);
  const rows = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return index.filter(({ text }) => terms.every((t) => text.includes(t))).map(({ p }) => p);
  }, [index, query]);

  return (
    <section aria-labelledby="matrix-h" className="space-y-4 print:hidden">
      <div>
        <h2 id="matrix-h" className="text-2xl font-bold">
          Comparison matrix: all 9 profiles
        </h2>
        <p className="text-ink-soft">
          Search across ages, levels, goals, AAC options and daily-living skills. Select “Use this
          profile” to switch the whole portal.
        </p>
      </div>
      <div className="max-w-xl">
        <label htmlFor="matrix-search" className="mb-1 block font-semibold">
          Search the matrix
        </label>
        <input
          id="matrix-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. PECS, toileting, anxiety, SGD, level 3"
          className={inputClass}
        />
        <p className="mt-1 text-sm text-ink-soft" aria-live="polite">
          {rows.length} of {ALL_PROFILES.length} profiles shown
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <p>No profiles match. Try a shorter or different search term.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
          <table className="min-w-[60rem] w-full border-collapse text-left text-sm">
            <caption className="sr-only">
              Comparison of dose, speech, behavior, sensory and daily-living focus for each age and
              support level
            </caption>
            <thead className="bg-sage-100 text-sage-800">
              <tr>
                {["Profile", "Daily dose", "Speech & AAC", "Behavior", "Sensory & OT", "Daily living", ""].map(
                  (h, i) => (
                    <th key={i} scope="col" className="px-4 py-3 font-semibold">
                      {h || <span className="sr-only">Action</span>}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const isCurrent = p.key === current.key;
                return (
                  <tr
                    key={p.key}
                    className={`border-t border-line align-top ${isCurrent ? "bg-calm-50" : ""}`}
                  >
                    <th scope="row" className="px-4 py-3 font-semibold">
                      <div>{AGE_META[p.age].label}</div>
                      <div className="text-xs font-normal text-ink-soft">{AGE_META[p.age].short}</div>
                      <div className="mt-1">{LEVEL_META[p.level].short}</div>
                      {isCurrent ? (
                        <span className="mt-1 inline-block rounded-full bg-calm-600 px-2 py-0.5 text-xs font-semibold text-white">
                          Current
                        </span>
                      ) : null}
                    </th>
                    <td className="px-4 py-3">{p.dose.label}</td>
                    <td className="px-4 py-3">{p.speech.headline}</td>
                    <td className="px-4 py-3">{p.behavior.headline}</td>
                    <td className="px-4 py-3">{p.sensory.headline}</td>
                    <td className="px-4 py-3">{p.adl.headline}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={isCurrent}
                        onClick={() => setBoth(p.age, p.level)}
                        className="min-h-11 whitespace-nowrap rounded-lg border border-sage-300 px-3 font-semibold text-sage-800 hover:bg-sage-50 disabled:opacity-50"
                      >
                        {isCurrent ? "In use" : "Use this profile"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function HomeView() {
  const { profile } = useProfile();
  return (
    <div className="space-y-14">
      <div className="print:hidden">
        <PageTitle eyebrow="Parent-led clinical therapy portal" title="HomePath Autism">
          Evidence-informed home therapy frameworks, shaped by a multidisciplinary lens (BCBA, SLP,
          OT) and tailored to your child’s age group and DSM-5 support level. Pick the profile above
          and every page adapts.
        </PageTitle>
        <div className="flex flex-wrap gap-3">
          <Link href="/pillars" className={btnPrimary}>
            Explore the pillars
          </Link>
          <Link href="/tracker" className={btnSecondary}>
            Start an ABC log
          </Link>
          <Link href="/board" className={btnSecondary}>
            Open the child’s board
          </Link>
        </div>
      </div>
      <div className="print:hidden">
        <Blueprint profile={profile} />
      </div>
      <Routine profile={profile} />
      <Matrix />
    </div>
  );
}

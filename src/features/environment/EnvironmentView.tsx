"use client";

import { useState } from "react";
import {
  Card,
  PageTitle,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "@/components/ui";
import { useProfile } from "@/context/ProfileContext";
import {
  ENVIRONMENT_AGE_TIPS,
  ENVIRONMENT_LEVEL_TIPS,
  ENVIRONMENT_POINTS,
} from "@/data/clinicalMatrix";
import { uid } from "@/lib/id";
import { useLocalStorage } from "@/lib/useLocalStorage";

/* -------------------------- 6-point home setup checklist ------------------- */

type Checked = Record<string, boolean>;
const EMPTY_CHECKED: Checked = {};
function isChecked(v: unknown): v is Checked {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    Object.values(v).every((x) => typeof x === "boolean")
  );
}

function Checklist() {
  const { age, level, profile } = useProfile();
  const [checked, setChecked, resetChecked] = useLocalStorage<Checked>(
    "homepath.env.checklist.v1",
    EMPTY_CHECKED,
    isChecked,
  );
  const done = ENVIRONMENT_POINTS.filter((p) => checked[p.id]).length;
  const pct = Math.round((done / ENVIRONMENT_POINTS.length) * 100);

  return (
    <section aria-labelledby="checklist-h" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="checklist-h" className="text-2xl font-bold">
            6-point home setup checklist
          </h2>
          <p className="text-ink-soft">
            Tailored to {profile.title}. Progress saves automatically on this device.
          </p>
        </div>
        <button type="button" className={btnSecondary} onClick={resetChecked}>
          Reset checklist
        </button>
      </div>

      <div role="status" aria-live="polite">
        <div
          role="progressbar"
          aria-label="Home setup progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="h-4 overflow-hidden rounded-full bg-sage-100"
        >
          <div className="h-full bg-sage-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 font-semibold">
          {done} of {ENVIRONMENT_POINTS.length} complete
        </p>
      </div>

      <ol className="space-y-3">
        {ENVIRONMENT_POINTS.map((point, i) => {
          const isDone = Boolean(checked[point.id]);
          return (
            <li
              key={point.id}
              className={`avoid-break rounded-2xl border p-4 ${
                isDone ? "border-sage-300 bg-sage-50" : "border-line bg-paper"
              }`}
            >
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  className="mt-1 h-7 w-7 shrink-0 accent-sage-600"
                  checked={isDone}
                  onChange={(e) => setChecked((c) => ({ ...c, [point.id]: e.target.checked }))}
                />
                <span>
                  <span className="block text-lg font-semibold">
                    {i + 1}. {point.title}
                  </span>
                  <span className="block text-sm text-ink-soft">{point.why}</span>
                </span>
              </label>
              <div className="mt-3 space-y-2 pl-11 text-sm">
                <p>
                  <strong>For this age group:</strong> {ENVIRONMENT_AGE_TIPS[age][i]}
                </p>
                <p>
                  <strong>For this support level:</strong> {ENVIRONMENT_LEVEL_TIPS[level][i]}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ----------------------------- Sensory diet builder ------------------------ */

type Category = "seeking" | "avoiding" | "under";
const SLOTS = ["Morning", "Midday", "After school / afternoon", "Evening", "Bedtime"] as const;
type Slot = (typeof SLOTS)[number];

interface PlanItem {
  id: string;
  text: string;
  category: Category;
  slot: Slot;
}
const EMPTY_PLAN: PlanItem[] = [];
function isPlan(v: unknown): v is PlanItem[] {
  return (
    Array.isArray(v) &&
    v.every(
      (i) =>
        typeof i === "object" &&
        i !== null &&
        typeof (i as PlanItem).id === "string" &&
        typeof (i as PlanItem).text === "string" &&
        SLOTS.includes((i as PlanItem).slot),
    )
  );
}

const CATEGORY_META: Record<Category, { label: string; blurb: string; defaultSlot: Slot }> = {
  seeking: {
    label: "Seeking",
    blurb: "Craves movement, pressure, touch or noise.",
    defaultSlot: "After school / afternoon",
  },
  avoiding: {
    label: "Avoiding",
    blurb: "Overwhelmed by input; needs protection and gradual exposure.",
    defaultSlot: "Morning",
  },
  under: {
    label: "Under-responsive",
    blurb: "Needs stronger input to wake up and notice.",
    defaultSlot: "Morning",
  },
};

function SensoryDiet() {
  const { profile } = useProfile();
  const [plan, setPlan] = useLocalStorage<PlanItem[]>("homepath.sensorydiet.v1", EMPTY_PLAN, isPlan);
  const [customText, setCustomText] = useState("");
  const [customCategory, setCustomCategory] = useState<Category>("seeking");

  const suggestions: Record<Category, string[]> = {
    seeking: profile.sensory.seeking,
    avoiding: profile.sensory.avoiding,
    under: profile.sensory.underResponsive,
  };

  const inPlan = (text: string, category: Category) =>
    plan.some((p) => p.text === text && p.category === category);

  const add = (text: string, category: Category) =>
    setPlan((p) => [...p, { id: uid(), text, category, slot: CATEGORY_META[category].defaultSlot }]);

  const remove = (id: string) => setPlan((p) => p.filter((x) => x.id !== id));
  const move = (id: string, slot: Slot) =>
    setPlan((p) => p.map((x) => (x.id === id ? { ...x, slot } : x)));

  return (
    <section aria-labelledby="diet-h" className="space-y-4">
      <div className="print:hidden">
        <h2 id="diet-h" className="text-2xl font-bold">
          Sensory diet builder
        </h2>
        <p className="text-ink-soft">
          Add activities from the suggestions for {profile.title}, then place them in the day. Work
          with your OT to adjust intensity and timing.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 print:hidden">
        {(Object.keys(CATEGORY_META) as Category[]).map((category) => (
          <Card key={category}>
            <h3 className="text-lg font-semibold text-sage-800">{CATEGORY_META[category].label}</h3>
            <p className="mb-3 text-sm text-ink-soft">{CATEGORY_META[category].blurb}</p>
            <ul className="space-y-2">
              {suggestions[category].map((text) => {
                const added = inPlan(text, category);
                return (
                  <li key={text}>
                    <button
                      type="button"
                      disabled={added}
                      onClick={() => add(text, category)}
                      className="min-h-12 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-left text-sm hover:bg-sage-50 disabled:border-sage-300 disabled:bg-sage-100"
                    >
                      <span aria-hidden className="mr-1">
                        {added ? "✓" : "＋"}
                      </span>
                      {text}
                      <span className="sr-only">{added ? " (added)" : " (add to plan)"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="print:hidden">
        <h3 className="text-lg font-semibold text-sage-800">Add your own activity</h3>
        <form
          className="mt-3 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const text = customText.trim();
            if (!text) return;
            add(text, customCategory);
            setCustomText("");
          }}
        >
          <label className="flex-1">
            <span className="sr-only">Activity</span>
            <input
              className={inputClass}
              value={customText}
              maxLength={120}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. Wall push-ups before homework"
            />
          </label>
          <label>
            <span className="sr-only">Category</span>
            <select
              className={`${inputClass} sm:w-52`}
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as Category)}
            >
              {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_META[c].label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={btnPrimary}>
            Add
          </button>
        </form>
      </Card>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold">My sensory diet plan</h3>
          <div className="flex gap-3 print:hidden">
            <button
              type="button"
              className={btnSecondary}
              disabled={plan.length === 0}
              onClick={() => window.print()}
            >
              🖨️ Print plan
            </button>
            <button
              type="button"
              className={btnDanger}
              disabled={plan.length === 0}
              onClick={() => setPlan([])}
            >
              Clear plan
            </button>
          </div>
        </div>
        {plan.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-6 text-ink-soft print:hidden">
            Nothing yet. Tap suggestions above to build a plan.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {SLOTS.map((slot) => {
              const items = plan.filter((p) => p.slot === slot);
              if (items.length === 0) return null;
              return (
                <Card key={slot} className="print:border-black">
                  <h4 className="font-semibold text-calm-700">{slot}</h4>
                  <ul className="mt-2 space-y-2">
                    {items.map((item) => (
                      <li key={item.id} className="flex flex-wrap items-center gap-2">
                        <span className="flex-1">
                          {item.text}
                          <span className="ml-2 rounded-full bg-sage-100 px-2 py-0.5 text-xs">
                            {CATEGORY_META[item.category].label}
                          </span>
                        </span>
                        <select
                          aria-label={`Time of day for ${item.text}`}
                          className="min-h-11 rounded-lg border border-line bg-paper px-2 text-sm print:hidden"
                          value={item.slot}
                          onChange={(e) => move(item.id, e.target.value as Slot)}
                        >
                          {SLOTS.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          aria-label={`Remove ${item.text}`}
                          className="min-h-11 min-w-11 rounded-lg border border-line text-lg hover:bg-clay-50 print:hidden"
                          onClick={() => remove(item.id)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export function EnvironmentView() {
  const { profile } = useProfile();
  return (
    <div className="space-y-14">
      <div className="print:hidden">
        <PageTitle eyebrow={profile.title} title="Home environment">
          A predictable, low-sensory home makes every therapy minute work harder. Complete the
          checklist, then build a daily sensory diet.
        </PageTitle>
      </div>
      <div className="print:hidden">
        <Checklist />
      </div>
      <SensoryDiet />
    </div>
  );
}

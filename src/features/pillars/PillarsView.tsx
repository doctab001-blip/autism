"use client";

import Link from "next/link";
import { useState } from "react";
import { Tabs, type TabDef } from "@/components/Tabs";
import {
  BulletList,
  Card,
  PageTitle,
  SubHeading,
  btnPrimary,
  btnSecondary,
} from "@/components/ui";
import { useProfile } from "@/context/ProfileContext";
import { FUNCTION_META, PILLAR_META, type ClinicalProfile } from "@/data/clinicalMatrix";
import { useLocalStorage } from "@/lib/useLocalStorage";

/* ------------------------------ Speech & AAC ------------------------------ */

interface TrialState {
  independent: number;
  prompted: number;
  none: number;
  history: number[]; // % independent for finished sessions (latest last)
}
const EMPTY_TRIALS: TrialState = { independent: 0, prompted: 0, none: 0, history: [] };
function isTrialState(v: unknown): v is TrialState {
  if (typeof v !== "object" || v === null) return false;
  const t = v as TrialState;
  return (
    typeof t.independent === "number" &&
    typeof t.prompted === "number" &&
    typeof t.none === "number" &&
    Array.isArray(t.history)
  );
}

function PromptTracker() {
  const [trials, setTrials, resetTrials] = useLocalStorage<TrialState>(
    "homepath.trials.v1",
    EMPTY_TRIALS,
    isTrialState,
  );
  const total = trials.independent + trials.prompted + trials.none;
  const pct = total === 0 ? 0 : Math.round((trials.independent / total) * 100);
  const lastThree = trials.history.slice(-3);
  const mastered = lastThree.length === 3 && lastThree.every((p) => p >= 80);

  let advice = "Run 10 trials in a row, then tap “Finish session”.";
  if (total >= 10) {
    advice =
      pct >= 80
        ? "Strong session: if this repeats for 3 sessions, fade one level of prompting."
        : pct >= 50
          ? "Keep the current prompt level and boost motivation (stronger item, shorter wait)."
          : "Make it easier: add a prompt, use a more motivating item, or shorten the delay.";
  }

  const bump = (key: "independent" | "prompted" | "none") =>
    setTrials((t) => ({ ...t, [key]: t[key] + 1 }));

  return (
    <Card className="bg-calm-50">
      <h3 className="text-xl font-semibold text-sage-800">Requesting practice tracker</h3>
      <p className="mt-1 text-ink-soft">
        Tap after each request opportunity (word, sign, picture exchange or device). Aim for 80%
        independent across 3 sessions before fading a prompt.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {(
          [
            ["independent", "Independent", trials.independent],
            ["prompted", "Prompted", trials.prompted],
            ["none", "No response", trials.none],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            onClick={() => bump(key)}
            className="min-h-24 rounded-2xl border border-sage-300 bg-paper p-3 text-center hover:bg-sage-50"
            aria-label={`${label}: ${count}. Tap to add one.`}
          >
            <span className="block text-3xl font-bold text-calm-700">{count}</span>
            <span className="block text-sm font-semibold">{label}</span>
          </button>
        ))}
      </div>
      <div className="mt-4" role="status" aria-live="polite">
        <div
          role="progressbar"
          aria-label="Percent of requests made independently"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          className="h-4 overflow-hidden rounded-full bg-sage-100"
        >
          <div className="h-full bg-sage-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 font-semibold">
          {pct}% independent ({total} trial{total === 1 ? "" : "s"})
        </p>
        <p className="text-ink-soft">{advice}</p>
        {mastered ? (
          <p className="mt-2 rounded-xl bg-sage-100 p-3 font-semibold text-sage-800">
            ✅ 80%+ in the last 3 sessions: time to fade one prompt level or add a new target.
          </p>
        ) : null}
        {trials.history.length > 0 ? (
          <p className="mt-2 text-sm text-ink-soft">
            Recent sessions (% independent): {trials.history.slice(-6).join("%, ")}%
          </p>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className={btnPrimary}
          disabled={total === 0}
          onClick={() =>
            setTrials((t) => ({
              independent: 0,
              prompted: 0,
              none: 0,
              history: [...t.history, pct].slice(-12),
            }))
          }
        >
          Finish session
        </button>
        <button type="button" className={btnSecondary} onClick={resetTrials}>
          Reset all
        </button>
      </div>
    </Card>
  );
}

function SpeechModule({ profile }: { profile: ClinicalProfile }) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold">{profile.speech.headline}</h2>
        <SubHeading>Priority targets</SubHeading>
        <BulletList items={profile.speech.targets} />
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h3 className="text-lg font-semibold text-sage-800">NDBI: naturalistic play-based teaching</h3>
          <p className="mb-3 text-sm text-ink-soft">
            Naturalistic developmental behavioral interventions (JASPER, ESDM, PRT-style) teach inside
            play and daily routines.
          </p>
          <BulletList items={profile.speech.ndbi} className="text-sm" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-sage-800">Manding: teaching “asking”</h3>
          <p className="mb-3 text-sm text-ink-soft">
            A mand is a request driven by what the child wants right now, the most functional
            communication skill.
          </p>
          <BulletList items={profile.speech.manding} className="text-sm" />
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-sage-800">PECS and speech-generating devices</h3>
          <p className="mb-3 text-sm text-ink-soft">
            Aided communication supports speech; it does not replace it. Model it all day.
          </p>
          <BulletList items={profile.speech.aac} className="text-sm" />
        </Card>
      </div>
      <PromptTracker />
    </div>
  );
}

/* ----------------------------- Behavior module ---------------------------- */

const OBSERVATIONS: { id: string; text: string; lean: "meltdown" | "tantrum" }[] = [
  { id: "o1", text: "It stops soon after the child gets the item, or the demand is dropped.", lean: "tantrum" },
  { id: "o2", text: "The child glances at you or changes the behavior if you leave or look away.", lean: "tantrum" },
  { id: "o3", text: "The child is careful to avoid real injury (e.g. lowers self to the floor).", lean: "tantrum" },
  { id: "o4", text: "The child calms quickly once there is a clear limit plus a choice.", lean: "tantrum" },
  { id: "o5", text: "It keeps going even after the demand is dropped or the item is given.", lean: "meltdown" },
  { id: "o6", text: "There were warning signs: hands over ears, pacing, scripting, flushing, going quiet.", lean: "meltdown" },
  { id: "o7", text: "The child cannot seem to hear or respond to you and may hurt self or others without meaning to.", lean: "meltdown" },
  { id: "o8", text: "Many triggers stacked up: noise, crowds, change, hunger, tiredness, hard demands.", lean: "meltdown" },
];

function BehaviorModule({ profile }: { profile: ClinicalProfile }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const meltdownScore = OBSERVATIONS.filter((o) => checked[o.id] && o.lean === "meltdown").length;
  const tantrumScore = OBSERVATIONS.filter((o) => checked[o.id] && o.lean === "tantrum").length;
  const answered = meltdownScore + tantrumScore;
  const verdict =
    answered === 0
      ? null
      : meltdownScore > tantrumScore
        ? "meltdown"
        : tantrumScore > meltdownScore
          ? "tantrum"
          : "mixed";

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold">{profile.behavior.headline}</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <SubHeading>Priorities for {profile.title}</SubHeading>
            <BulletList items={profile.behavior.priorities} />
          </div>
          <div>
            <SubHeading>Proactive strategies (do these every day)</SubHeading>
            <BulletList items={profile.behavior.proactive} />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-semibold text-sage-800">Meltdown vs tantrum</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-clay-50 p-4">
            <h4 className="font-semibold text-clay-700">Tantrum: goal-directed</h4>
            <p className="mt-1 text-sm">
              The child wants something (an item, to avoid a task, attention). It is shaped by the
              audience and consequences, and usually stops soon after the goal is reached or dropped.
            </p>
          </div>
          <div className="rounded-xl bg-calm-50 p-4">
            <h4 className="font-semibold text-calm-700">Meltdown: overload</h4>
            <p className="mt-1 text-sm">
              A loss of control after sensory, emotional or cognitive overload. It is not a choice,
              often continues regardless of what you do, and needs safety and recovery, not
              consequences.
            </p>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="text-lg font-semibold">What did you see? Tick all that apply</legend>
          <div className="mt-3 space-y-2">
            {OBSERVATIONS.map((o) => (
              <label
                key={o.id}
                className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-3"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-6 w-6 shrink-0 accent-sage-600"
                  checked={Boolean(checked[o.id])}
                  onChange={(e) => setChecked((c) => ({ ...c, [o.id]: e.target.checked }))}
                />
                <span>{o.text}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 rounded-xl bg-sage-50 p-4" role="status" aria-live="polite">
          {verdict === null ? (
            <p>Tick what you observed to see which response plan fits best.</p>
          ) : verdict === "mixed" ? (
            <p>
              <strong>Mixed picture.</strong> Treat safety and overload first (meltdown plan), then
              hold boundaries once the child is calm. Log it in the tracker.
            </p>
          ) : (
            <p>
              <strong>This looks more like a {verdict}.</strong> This is a guide, not a diagnosis;
              when in doubt, treat it as overload first.
            </p>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className={verdict === "meltdown" ? "ring-2 ring-calm-600" : ""}>
          <h3 className="text-lg font-semibold text-calm-700">If it’s a meltdown ({profile.level === "level3" ? "safety-first" : "calm-first"})</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {profile.behavior.meltdown.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Card>
        <Card className={verdict === "tantrum" ? "ring-2 ring-clay-700" : ""}>
          <h3 className="text-lg font-semibold text-clay-700">If it’s a tantrum</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {profile.behavior.tantrum.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-semibold text-sage-800">
          Replacement skills by behavior function ({profile.level === "level1" ? "Level 1" : profile.level === "level2" ? "Level 2" : "Level 3"})
        </h3>
        <dl className="mt-3 grid gap-4 md:grid-cols-2">
          {(Object.keys(FUNCTION_META) as (keyof typeof FUNCTION_META)[]).map((fn) => (
            <div key={fn} className="rounded-xl border border-line p-4">
              <dt className="font-semibold">
                <span aria-hidden>{FUNCTION_META[fn].emoji}</span> {FUNCTION_META[fn].label}
              </dt>
              <dd className="mt-1 text-sm">{profile.behavior.replacement[fn]}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-ink-soft">{profile.behavior.replacementNote}</p>
        <div className="mt-4">
          <Link href="/tracker" className={btnPrimary}>
            Find the function with the ABC tracker
          </Link>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------ Sensory module ---------------------------- */

function SensoryModule({ profile }: { profile: ClinicalProfile }) {
  const groups = [
    { title: "Sensory seeking", note: "Craves movement, pressure, noise or touch.", items: profile.sensory.seeking },
    { title: "Sensory avoiding", note: "Overwhelmed by sound, light, touch, smell or taste.", items: profile.sensory.avoiding },
    { title: "Under-responsive", note: "Slow to notice input; needs stronger signals to wake up.", items: profile.sensory.underResponsive },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold">{profile.sensory.headline}</h2>
        <p className="mt-2 text-ink-soft">
          A sensory diet is a planned set of activities spread across the day (like meals), designed
          with an occupational therapist. Use heavy work and movement <em>before</em> demanding
          tasks, not only after distress.
        </p>
      </Card>
      <div className="grid gap-6 lg:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.title}>
            <h3 className="text-lg font-semibold text-sage-800">{g.title}</h3>
            <p className="mb-3 text-sm text-ink-soft">{g.note}</p>
            <BulletList items={g.items} className="text-sm" />
          </Card>
        ))}
      </div>
      <Card>
        <h3 className="text-lg font-semibold text-sage-800">Regulation toolkit</h3>
        <BulletList items={profile.sensory.regulation} className="mt-2" />
        <p className="mt-4 text-sm text-ink-soft">
          Safety: introduce brushing, weighted items or compression only under OT guidance. Stop any
          sensory activity that causes distress or discomfort.
        </p>
        <div className="mt-4">
          <Link href="/environment" className={btnPrimary}>
            Build the daily sensory diet
          </Link>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------- Social & life-skills module -------------------- */

function ChainingTool({ profile }: { profile: ClinicalProfile }) {
  const [skillIndex, setSkillIndex] = useState(0);
  const [stage, setStage] = useState(1);
  const skill = profile.adl.skills[skillIndex] ?? profile.adl.skills[0];
  const total = skill.steps.length;
  const safeStage = Math.min(stage, total);
  const adultCount = total - safeStage;

  return (
    <Card>
      <h3 className="text-xl font-semibold text-sage-800">Backward chaining coach</h3>
      <p className="mt-1 text-ink-soft">
        You do all the steps except the last few. The child finishes the task and gets the natural
        reward of completing it. Each time they master a stage, move one step further back.
      </p>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose a skill">
        {profile.adl.skills.map((s, i) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={i === skillIndex}
            onClick={() => {
              setSkillIndex(i);
              setStage(1);
            }}
            className={`min-h-12 rounded-xl border px-4 font-semibold ${
              i === skillIndex
                ? "border-sage-600 bg-sage-600 text-white"
                : "border-line bg-paper text-sage-800 hover:bg-sage-50"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          className={btnSecondary}
          disabled={safeStage <= 1}
          onClick={() => setStage(safeStage - 1)}
        >
          ← Earlier stage
        </button>
        <p className="font-semibold" aria-live="polite">
          Stage {safeStage} of {total}
        </p>
        <button
          type="button"
          className={btnSecondary}
          disabled={safeStage >= total}
          onClick={() => setStage(safeStage + 1)}
        >
          Next stage →
        </button>
      </div>

      <ol className="mt-4 space-y-2">
        {skill.steps.map((step, i) => {
          const childDoes = i >= adultCount;
          return (
            <li
              key={step}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                childDoes ? "border-sage-300 bg-sage-100" : "border-line bg-canvas"
              }`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper text-sm font-bold">
                {i + 1}
              </span>
              <span className="flex-1">{step}</span>
              <span className="text-sm font-semibold text-ink-soft">
                {childDoes ? "👦 Child" : "🧑 Adult"}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-ink-soft">
        Move back a stage when the child does their steps independently on about 3 tries in a row.
        Use the least help that works, and always celebrate the finished task.
      </p>
    </Card>
  );
}

function SocialModule({ profile }: { profile: ClinicalProfile }) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold">{profile.social.headline}</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <SubHeading>Goals</SubHeading>
            <BulletList items={profile.social.goals} />
          </div>
          <div>
            <SubHeading>How to teach it</SubHeading>
            <BulletList items={profile.social.strategies} />
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-xl font-semibold text-sage-800">
          {PILLAR_META.adl.emoji} Life skills: {profile.adl.headline}
        </h3>
      </Card>
      <ChainingTool key={profile.key} profile={profile} />
    </div>
  );
}

/* --------------------------------- Page ----------------------------------- */

export function PillarsView() {
  const { profile } = useProfile();
  const [active, setActive] = useState("speech");

  const tabs: TabDef[] = [
    { id: "speech", label: "Speech & AAC", emoji: PILLAR_META.speech.emoji, content: <SpeechModule profile={profile} /> },
    { id: "behavior", label: "Behavior", emoji: PILLAR_META.behavior.emoji, content: <BehaviorModule profile={profile} /> },
    { id: "sensory", label: "Sensory & OT", emoji: PILLAR_META.sensory.emoji, content: <SensoryModule profile={profile} /> },
    { id: "social", label: "Social & life skills", emoji: PILLAR_META.social.emoji, content: <SocialModule profile={profile} /> },
  ];

  return (
    <div>
      <PageTitle eyebrow={profile.title} title="Clinical pillars">
        Four interactive modules, adapted to your child’s age group and support level.
      </PageTitle>
      <Tabs tabs={tabs} active={active} onChange={setActive} label="Clinical pillars" />
    </div>
  );
}

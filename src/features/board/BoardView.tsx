"use client";

import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import { useProfile } from "@/context/ProfileContext";
import { BOARD_PRESETS, type AgeGroup } from "@/data/clinicalMatrix";
import { playChime } from "@/lib/chime";
import { uid } from "@/lib/id";
import { useLocalStorage } from "@/lib/useLocalStorage";

interface BoardItem {
  id: string;
  label: string;
  emoji: string;
}
interface BoardConfig {
  tasks: BoardItem[];
  rewards: BoardItem[];
  bigReward: BoardItem;
  goal: number;
  sound: boolean;
}
type Phase = "first" | "then" | "celebrate";
interface Progress {
  stars: number;
  taskIdx: number;
  rewardIdx: number;
  phase: Phase;
}

const EMOJI_CHOICES = [
  "🧼", "👟", "🧸", "🎨", "🍎", "🦷", "📚", "🧹", "🍽️", "🎒", "🚿", "🧺", "🍳", "🚶", "🛏️", "👕",
  "🫧", "🎵", "😄", "📱", "🧱", "🍪", "🎧", "🎮", "🥤", "🎬", "🛝", "🚲", "🧩", "🎈", "🍿", "⭐",
];

const EMPTY_PROGRESS: Progress = { stars: 0, taskIdx: 0, rewardIdx: 0, phase: "first" };

function isItem(v: unknown): v is BoardItem {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as BoardItem).id === "string" &&
    typeof (v as BoardItem).label === "string" &&
    typeof (v as BoardItem).emoji === "string"
  );
}
function isConfig(v: unknown): v is BoardConfig | null {
  if (v === null) return true;
  if (typeof v !== "object") return false;
  const c = v as BoardConfig;
  return (
    Array.isArray(c.tasks) &&
    c.tasks.every(isItem) &&
    Array.isArray(c.rewards) &&
    c.rewards.every(isItem) &&
    isItem(c.bigReward) &&
    typeof c.goal === "number" &&
    typeof c.sound === "boolean"
  );
}
function isProgress(v: unknown): v is Progress {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Progress;
  return (
    typeof p.stars === "number" &&
    typeof p.taskIdx === "number" &&
    typeof p.rewardIdx === "number" &&
    (p.phase === "first" || p.phase === "then" || p.phase === "celebrate")
  );
}

function presetConfig(age: AgeGroup, sound: boolean): BoardConfig {
  const preset = BOARD_PRESETS[age];
  return {
    tasks: preset.tasks.map((t, i) => ({ id: `preset-${age}-t${i}`, ...t })),
    rewards: preset.rewards.map((r, i) => ({ id: `preset-${age}-r${i}`, ...r })),
    bigReward: { id: `preset-${age}-big`, ...preset.bigReward },
    goal: 5,
    sound,
  };
}

/* ------------------------------ Settings editor ---------------------------- */

function ItemEditor({
  legend,
  items,
  onChange,
  min,
  max,
}: {
  legend: string;
  items: BoardItem[];
  onChange: (items: BoardItem[]) => void;
  min: number;
  max: number;
}) {
  const update = (id: string, patch: Partial<BoardItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  return (
    <fieldset className="rounded-2xl border border-line p-4">
      <legend className="px-2 text-lg font-semibold">{legend}</legend>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={item.id} className="flex items-center gap-2">
            <label>
              <span className="sr-only">Picture for item {index + 1}</span>
              <select
                className="min-h-12 rounded-xl border border-line bg-paper px-2 text-2xl"
                value={item.emoji}
                onChange={(e) => update(item.id, { emoji: e.target.value })}
              >
                {(EMOJI_CHOICES.includes(item.emoji) ? EMOJI_CHOICES : [item.emoji, ...EMOJI_CHOICES]).map(
                  (e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label className="flex-1">
              <span className="sr-only">Name of item {index + 1}</span>
              <input
                className="min-h-12 w-full rounded-xl border border-line bg-paper px-3 text-base"
                value={item.label}
                maxLength={30}
                onChange={(e) => update(item.id, { label: e.target.value })}
              />
            </label>
            <button
              type="button"
              aria-label={`Remove ${item.label || "item"}`}
              disabled={items.length <= min}
              className="min-h-12 min-w-12 rounded-xl border border-line text-xl hover:bg-clay-50 disabled:opacity-40"
              onClick={() => onChange(items.filter((i) => i.id !== item.id))}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={items.length >= max}
        className="mt-3 min-h-12 rounded-xl border border-sage-300 bg-paper px-4 font-semibold text-sage-800 hover:bg-sage-50 disabled:opacity-40"
        onClick={() => onChange([...items, { id: uid(), label: "New", emoji: "⭐" }])}
      >
        ＋ Add
      </button>
    </fieldset>
  );
}

/* ---------------------------------- Board ---------------------------------- */

export function BoardView() {
  const { age, profile } = useProfile();
  const [stored, setStored] = useLocalStorage<BoardConfig | null>("homepath.board.config.v1", null, isConfig);
  const [progress, setProgress, resetProgress] = useLocalStorage<Progress>(
    "homepath.board.progress.v1",
    EMPTY_PROGRESS,
    isProgress,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const config = stored ?? presetConfig(age, true);
  const updateConfig = (patch: Partial<BoardConfig>) => setStored({ ...config, ...patch });

  const taskCount = config.tasks.length;
  const rewardCount = config.rewards.length;
  const goal = Math.min(5, Math.max(2, config.goal));
  const task = taskCount ? config.tasks[progress.taskIdx % taskCount] : null;
  const reward = rewardCount ? config.rewards[progress.rewardIdx % rewardCount] : null;
  const phase: Phase = progress.phase;
  const stars = Math.min(progress.stars, goal);

  function done() {
    if (phase !== "first" || !task) return;
    const nextStars = progress.stars + 1;
    if (nextStars >= goal) {
      playChime("celebrate", config.sound);
      setProgress({ ...progress, stars: goal, phase: "celebrate" });
    } else {
      playChime("star", config.sound);
      setProgress({ ...progress, stars: nextStars, phase: "then" });
    }
  }

  function nextTask() {
    if (phase !== "then") return;
    playChime("tap", config.sound);
    setProgress({
      ...progress,
      taskIdx: (progress.taskIdx + 1) % Math.max(taskCount, 1),
      phase: "first",
    });
  }

  function newRound() {
    playChime("tap", config.sound);
    setProgress({
      stars: 0,
      taskIdx: (progress.taskIdx + 1) % Math.max(taskCount, 1),
      rewardIdx: 0,
      phase: "first",
    });
  }

  function chooseReward() {
    if (phase !== "first" || rewardCount < 2) return;
    playChime("tap", config.sound);
    setProgress({ ...progress, rewardIdx: (progress.rewardIdx + 1) % rewardCount });
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setNotice("");
    } catch {
      setNotice("Full screen isn’t available here. On iPad, use Share → Add to Home Screen.");
    }
  }

  function onDialogKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") setSettingsOpen(false);
  }

  const chip =
    "inline-flex min-h-12 items-center gap-2 rounded-full border border-sage-300 bg-paper/90 px-4 text-base font-semibold text-sage-800 hover:bg-sage-50";

  return (
    <div className="relative flex min-h-dvh select-none flex-col bg-sage-50 text-ink">
      {/* Quiet top bar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 print:hidden">
        <Link href="/" className={chip}>
          ← Portal
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={chip}
            aria-pressed={config.sound}
            onClick={() => {
              const next = !config.sound;
              updateConfig({ sound: next });
              playChime("tap", next);
            }}
          >
            {config.sound ? "🔔 Sound on" : "🔕 Sound off"}
          </button>
          <button type="button" className={chip} onClick={toggleFullscreen}>
            ⛶ Full screen
          </button>
          <button type="button" className={chip} onClick={() => setSettingsOpen(true)}>
            ⚙️ Grown-ups
          </button>
        </div>
      </div>
      {notice ? (
        <p role="status" className="mx-3 rounded-xl bg-sand-100 p-3 text-center print:hidden">
          {notice}
        </p>
      ) : null}

      {/* Child-facing board */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 pb-6 print:hidden">
        {!task || !reward ? (
          <p className="max-w-md rounded-2xl bg-paper p-6 text-center text-2xl">
            Ask a grown-up to add a task and a reward in ⚙️ Grown-ups.
          </p>
        ) : (
          <>
            <div className="grid w-full max-w-5xl items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
              <section
                aria-label="First"
                className={`rounded-3xl border-4 p-6 text-center transition-opacity ${
                  phase === "first"
                    ? "border-sage-600 bg-paper"
                    : "border-sage-200 bg-sage-100 opacity-70"
                }`}
              >
                <p className="text-3xl font-bold uppercase tracking-wide text-sage-700">First</p>
                <p className="mt-3 text-8xl" aria-hidden>
                  {phase === "first" ? task.emoji : "✅"}
                </p>
                <p className="mt-3 text-4xl font-bold">{task.label}</p>
              </section>

              <div aria-hidden className="hidden items-center text-6xl text-sage-500 md:flex">
                ➜
              </div>
              <div aria-hidden className="text-center text-5xl text-sage-500 md:hidden">
                ⬇
              </div>

              <button
                type="button"
                onClick={chooseReward}
                disabled={phase !== "first" || rewardCount < 2}
                aria-label={`Then: ${reward.label}.${
                  phase === "first" && rewardCount > 1 ? " Tap to choose a different reward." : ""
                }`}
                className={`rounded-3xl border-4 p-6 text-center transition-all disabled:cursor-default ${
                  phase === "then"
                    ? "soft-pop border-calm-600 bg-calm-50"
                    : "border-calm-200 bg-paper"
                }`}
              >
                <span className="block text-3xl font-bold uppercase tracking-wide text-calm-700">Then</span>
                <span className="mt-3 block text-8xl" aria-hidden>
                  {reward.emoji}
                </span>
                <span className="mt-3 block text-4xl font-bold">{reward.label}</span>
                {phase === "first" && rewardCount > 1 ? (
                  <span className="mt-2 block text-base text-ink-soft">Tap to choose</span>
                ) : null}
              </button>
            </div>

            {/* 5-star token economy */}
            <div
              className="flex items-center gap-2 rounded-full bg-paper px-6 py-3"
              role="img"
              aria-label={`${stars} of ${goal} stars earned`}
            >
              {Array.from({ length: goal }, (_, i) => (
                <span
                  key={i}
                  aria-hidden
                  className={`text-6xl transition-transform ${
                    i < stars ? "soft-pop" : "opacity-30 grayscale"
                  }`}
                >
                  ⭐
                </span>
              ))}
            </div>

            {phase === "first" ? (
              <button
                type="button"
                onClick={done}
                className="min-h-24 w-full max-w-xl rounded-3xl bg-sage-600 px-8 text-4xl font-bold text-white shadow-md hover:bg-sage-700"
              >
                All done ✓
              </button>
            ) : null}
            {phase === "then" ? (
              <div className="w-full max-w-xl space-y-3 text-center">
                <p className="text-3xl font-bold text-calm-700" role="status">
                  Great job! Time for {reward.label}!
                </p>
                <button
                  type="button"
                  onClick={nextTask}
                  className="min-h-24 w-full rounded-3xl bg-calm-600 px-8 text-4xl font-bold text-white shadow-md hover:bg-calm-700"
                >
                  Finished, next ➜
                </button>
              </div>
            ) : null}

            {/* Visual queue of today's tasks */}
            <ol className="flex flex-wrap justify-center gap-3" aria-label="Tasks">
              {config.tasks.map((t, i) => {
                const current = i === progress.taskIdx % taskCount;
                const past = i < progress.taskIdx % taskCount;
                return (
                  <li
                    key={t.id}
                    aria-current={current ? "step" : undefined}
                    className={`grid h-20 w-20 place-items-center rounded-2xl border-2 text-4xl ${
                      current
                        ? "border-sage-600 bg-paper"
                        : past
                          ? "border-sage-200 bg-sage-100 opacity-60"
                          : "border-line bg-paper/70"
                    }`}
                  >
                    <span aria-hidden>{past ? "✅" : t.emoji}</span>
                    <span className="sr-only">{t.label}</span>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </main>

      {/* Celebration overlay */}
      {phase === "celebrate" ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="You earned your big reward"
          className="fixed inset-0 z-40 grid place-items-center bg-sage-50/95 p-6 print:hidden"
        >
          <div className="soft-pop max-w-2xl rounded-3xl border-4 border-calm-600 bg-paper p-10 text-center">
            <p className="text-3xl font-bold text-calm-700">All {goal} stars! 🎉</p>
            <p className="mt-4 text-9xl" aria-hidden>
              {config.bigReward.emoji}
            </p>
            <p className="mt-4 text-5xl font-bold">{config.bigReward.label}</p>
            <button
              type="button"
              autoFocus
              onClick={newRound}
              className="mt-8 min-h-20 w-full rounded-3xl bg-sage-600 px-8 text-3xl font-bold text-white hover:bg-sage-700"
            >
              Start again
            </button>
          </div>
        </div>
      ) : null}

      {/* Settings for grown-ups */}
      {settingsOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="board-settings-h"
          onKeyDown={onDialogKey}
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/40 p-3 print:hidden sm:p-8"
        >
          <div className="mx-auto max-w-2xl select-text rounded-3xl bg-canvas p-5 shadow-xl sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <h2 id="board-settings-h" className="text-2xl font-bold">
                Grown-up settings
              </h2>
              <button
                type="button"
                autoFocus
                onClick={() => setSettingsOpen(false)}
                className="min-h-12 rounded-xl bg-sage-600 px-5 font-semibold text-white hover:bg-sage-700"
              >
                Done
              </button>
            </div>
            <p className="mt-1 text-ink-soft">
              Change tasks and rewards for {profile.title}. Changes save on this device only.
            </p>

            <div className="mt-5 space-y-4">
              <ItemEditor
                legend="Tasks (First…)"
                items={config.tasks}
                min={1}
                max={8}
                onChange={(tasks) => updateConfig({ tasks })}
              />
              <ItemEditor
                legend="Rewards (Then…)"
                items={config.rewards}
                min={1}
                max={4}
                onChange={(rewards) => updateConfig({ rewards })}
              />
              <ItemEditor
                legend="Big reward (when all stars are earned)"
                items={[config.bigReward]}
                min={1}
                max={1}
                onChange={(items) => items[0] && updateConfig({ bigReward: items[0] })}
              />
              <fieldset className="rounded-2xl border border-line p-4">
                <legend className="px-2 text-lg font-semibold">Stars needed for the big reward</legend>
                <div className="flex gap-2" role="radiogroup" aria-label="Stars needed">
                  {[2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={goal === n}
                      onClick={() => {
                        updateConfig({ goal: n });
                        if (progress.stars > n) setProgress({ ...progress, stars: n });
                      }}
                      className={`min-h-12 min-w-14 rounded-xl border px-4 text-lg font-semibold ${
                        goal === n
                          ? "border-sage-600 bg-sage-600 text-white"
                          : "border-line bg-paper hover:bg-sage-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  Start with 2–3 stars for children who need very quick rewards, then build toward 5.
                </p>
              </fieldset>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="min-h-12 rounded-xl border border-sage-300 bg-paper px-4 font-semibold text-sage-800 hover:bg-sage-50"
                onClick={() => {
                  setStored(presetConfig(age, config.sound));
                  resetProgress();
                }}
              >
                Load suggestions for {profile.title}
              </button>
              <button
                type="button"
                className="min-h-12 rounded-xl border border-sage-300 bg-paper px-4 font-semibold text-sage-800 hover:bg-sage-50"
                onClick={resetProgress}
              >
                Reset stars
              </button>
              <button
                type="button"
                className="min-h-12 rounded-xl border border-sage-300 bg-paper px-4 font-semibold text-sage-800 hover:bg-sage-50"
                onClick={() => window.print()}
              >
                🖨️ Print visual schedule
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Print-only visual schedule */}
      <div className="hidden p-6 print:block">
        <h1 className="mb-1 text-3xl font-bold">My First–Then schedule</h1>
        <p className="mb-4 text-sm">Tick each box when it is finished. Stars earned lead to: {config.bigReward.emoji} {config.bigReward.label}</p>
        <ol className="grid grid-cols-2 gap-4">
          {config.tasks.map((t) => (
            <li key={t.id} className="avoid-break rounded-2xl border-2 border-black p-4 text-center">
              <div className="text-5xl" aria-hidden>
                {t.emoji}
              </div>
              <div className="mt-2 text-2xl font-bold">{t.label}</div>
              <div className="mt-2 text-3xl" aria-hidden>
                ☐
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex items-center gap-3 text-5xl" aria-hidden>
          {Array.from({ length: goal }, (_, i) => (
            <span key={i}>☆</span>
          ))}
        </div>
        <p className="mt-4 text-xl font-bold">
          Then: {config.rewards.map((r) => `${r.emoji} ${r.label}`).join("   or   ")}
        </p>
      </div>
    </div>
  );
}

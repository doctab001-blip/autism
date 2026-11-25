"use client";

import { useMemo, useState } from "react";
import {
  Card,
  PageTitle,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputClass,
} from "@/components/ui";
import { useProfile } from "@/context/ProfileContext";
import { AGE_META, FUNCTION_META, LEVEL_META, type BehaviorFunction } from "@/data/clinicalMatrix";
import {
  ANTECEDENTS,
  BEHAVIORS,
  CONFIDENCE_LABEL,
  CONSEQUENCES,
  FUNCTIONS,
  analyse,
  isAbcLogList,
  labelsFor,
  scoreLog,
  topFunctions,
  type AbcLog,
  type AbcOption,
} from "@/lib/abc";
import { downloadTextFile, toCsv } from "@/lib/csv";
import { uid } from "@/lib/id";
import { useLocalStorage } from "@/lib/useLocalStorage";

const EMPTY_LOGS: AbcLog[] = [];

function ChipGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: AbcOption[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-lg font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o.id)}
              className={`min-h-12 rounded-xl border px-4 py-2 text-left text-base ${
                on
                  ? "border-sage-600 bg-sage-600 text-white"
                  : "border-line bg-paper hover:bg-sage-50"
              }`}
            >
              {on ? "✓ " : ""}
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function fnLabel(fns: BehaviorFunction[]): string {
  if (fns.length === 0) return "Not enough information";
  return fns.map((f) => FUNCTION_META[f].label).join(" / ");
}

export function TrackerView() {
  const { profile, age, level } = useProfile();
  const [logs, setLogs, resetLogs] = useLocalStorage<AbcLog[]>(
    "homepath.abc.logs.v1",
    EMPTY_LOGS,
    isAbcLogList,
  );

  const [antecedents, setAntecedents] = useState<string[]>([]);
  const [behaviors, setBehaviors] = useState<string[]>([]);
  const [consequences, setConsequences] = useState<string[]>([]);
  const [antecedentNote, setAntecedentNote] = useState("");
  const [behaviorNote, setBehaviorNote] = useState("");
  const [consequenceNote, setConsequenceNote] = useState("");
  const [severity, setSeverity] = useState(3);
  const [duration, setDuration] = useState(5);
  const [setting, setSetting] = useState("");
  const [whenLocal, setWhenLocal] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [formError, setFormError] = useState("");

  const live = scoreLog({ antecedents, consequences });
  const liveTop = topFunctions(live);
  const analysis = useMemo(() => analyse(logs), [logs]);
  const sorted = useMemo(() => [...logs].sort((a, b) => b.at.localeCompare(a.at)), [logs]);

  function save() {
    if (antecedents.length === 0 || behaviors.length === 0 || consequences.length === 0) {
      setFormError("Choose at least one Antecedent, one Behavior and one Consequence before saving.");
      return;
    }
    setFormError("");
    const when = whenLocal ? new Date(whenLocal) : new Date();
    const at = Number.isNaN(when.getTime()) ? new Date().toISOString() : when.toISOString();
    const entry: AbcLog = {
      id: uid(),
      at,
      antecedents,
      antecedentNote: antecedentNote.trim(),
      behaviors,
      behaviorNote: behaviorNote.trim(),
      severity,
      durationMin: duration,
      consequences,
      consequenceNote: consequenceNote.trim(),
      setting: setting.trim(),
      age,
      level,
    };
    setLogs((prev) => [...prev, entry]);
    setAntecedents([]);
    setBehaviors([]);
    setConsequences([]);
    setAntecedentNote("");
    setBehaviorNote("");
    setConsequenceNote("");
    setSeverity(3);
    setDuration(5);
    setWhenLocal("");
  }

  function exportCsv() {
    const headers = [
      "log_id",
      "date_time_iso",
      "date_local",
      "time_local",
      "age_group",
      "support_level",
      "antecedents",
      "antecedent_notes",
      "behaviors",
      "behavior_notes",
      "severity_1_to_5",
      "duration_minutes",
      "consequences",
      "consequence_notes",
      "setting",
      "likely_function",
      "score_escape",
      "score_tangible",
      "score_attention",
      "score_sensory",
    ];
    const rows = [...logs]
      .sort((a, b) => a.at.localeCompare(b.at))
      .map((l) => {
        const d = new Date(l.at);
        const s = scoreLog(l);
        return [
          l.id,
          l.at,
          d.toLocaleDateString(),
          d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          `${AGE_META[l.age].label} (${AGE_META[l.age].short})`,
          LEVEL_META[l.level].short,
          labelsFor(l.antecedents, ANTECEDENTS).join("; "),
          l.antecedentNote,
          labelsFor(l.behaviors, BEHAVIORS).join("; "),
          l.behaviorNote,
          l.severity,
          l.durationMin,
          labelsFor(l.consequences, CONSEQUENCES).join("; "),
          l.consequenceNote,
          l.setting,
          fnLabel(topFunctions(s)),
          s.escape,
          s.tangible,
          s.attention,
          s.sensory,
        ];
      });
    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`homepath-abc-log-${stamp}.csv`, toCsv(headers, rows));
  }

  const avgSeverity =
    logs.length === 0 ? 0 : logs.reduce((a, l) => a + l.severity, 0) / logs.length;

  return (
    <div className="space-y-10">
      <PageTitle eyebrow={profile.title} title="ABC behavior tracker">
        Record what happened before (Antecedent), what the child did (Behavior) and what happened
        after (Consequence). The tracker looks for the likely function and suggests replacement
        skills for {profile.title}. Logs stay on this device.
      </PageTitle>

      <Card>
        <h2 className="text-2xl font-bold">New ABC entry</h2>
        <div className="mt-5 space-y-8">
          <ChipGroup
            legend="A: Antecedent (what happened just before?)"
            options={ANTECEDENTS}
            selected={antecedents}
            onToggle={(id) => setAntecedents((s) => toggle(s, id))}
          />
          <label className="block">
            <span className="mb-1 block font-semibold">Antecedent notes (optional)</span>
            <input
              className={inputClass}
              value={antecedentNote}
              maxLength={200}
              onChange={(e) => setAntecedentNote(e.target.value)}
              placeholder="e.g. Asked to turn off the tablet"
            />
          </label>

          <ChipGroup
            legend="B: Behavior (what did you see?)"
            options={BEHAVIORS}
            selected={behaviors}
            onToggle={(id) => setBehaviors((s) => toggle(s, id))}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block md:col-span-1">
              <span className="mb-1 block font-semibold">Severity: {severity} of 5</span>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="h-12 w-full accent-sage-600"
                aria-valuetext={`${severity} out of 5`}
              />
              <span className="flex justify-between text-xs text-ink-soft">
                <span>Mild</span>
                <span>Severe</span>
              </span>
            </label>
            <label className="block">
              <span className="mb-1 block font-semibold">Duration (minutes)</span>
              <input
                type="number"
                min={0}
                max={600}
                value={duration}
                onChange={(e) => setDuration(Math.max(0, Math.min(600, Number(e.target.value) || 0)))}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-semibold">Behavior notes (optional)</span>
              <input
                className={inputClass}
                value={behaviorNote}
                maxLength={200}
                onChange={(e) => setBehaviorNote(e.target.value)}
                placeholder="e.g. Dropped to the floor and cried"
              />
            </label>
          </div>

          <ChipGroup
            legend="C: Consequence (what happened right after?)"
            options={CONSEQUENCES}
            selected={consequences}
            onToggle={(id) => setConsequences((s) => toggle(s, id))}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-1 block font-semibold">Consequence notes (optional)</span>
              <input
                className={inputClass}
                value={consequenceNote}
                maxLength={200}
                onChange={(e) => setConsequenceNote(e.target.value)}
                placeholder="e.g. Tablet handed back"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-semibold">Where / who was there?</span>
              <input
                className={inputClass}
                value={setting}
                maxLength={120}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="e.g. Kitchen, with Mum (no full names)"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-semibold">When (blank = now)</span>
              <input
                type="datetime-local"
                className={inputClass}
                value={whenLocal}
                onChange={(e) => setWhenLocal(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-calm-50 p-4" role="status" aria-live="polite">
          <p className="font-semibold">Live function check for this entry</p>
          {liveTop.length === 0 ? (
            <p className="text-ink-soft">Pick antecedents and consequences to see a hint.</p>
          ) : (
            <p>
              {liveTop.map((f) => FUNCTION_META[f].emoji).join(" ")} Likely: <strong>{fnLabel(liveTop)}</strong>
            </p>
          )}
        </div>

        {formError ? (
          <p role="alert" className="mt-4 rounded-xl bg-clay-50 p-3 font-semibold text-clay-700">
            {formError}
          </p>
        ) : null}
        <div className="mt-5">
          <button type="button" className={btnPrimary} onClick={save}>
            Save entry
          </button>
        </div>
      </Card>

      <section aria-labelledby="insight-h" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="insight-h" className="text-2xl font-bold">
            What the pattern suggests
          </h2>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={btnPrimary} disabled={logs.length === 0} onClick={exportCsv}>
              ⬇ Export CSV for clinicians
            </button>
            {confirmClear ? (
              <>
                <button
                  type="button"
                  className={btnDanger}
                  onClick={() => {
                    resetLogs();
                    setConfirmClear(false);
                  }}
                >
                  Yes, delete all {logs.length} logs
                </button>
                <button type="button" className={btnSecondary} onClick={() => setConfirmClear(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className={btnSecondary}
                disabled={logs.length === 0}
                onClick={() => setConfirmClear(true)}
              >
                Delete all logs
              </button>
            )}
          </div>
        </div>

        {logs.length === 0 ? (
          <Card>
            <p className="text-ink-soft">
              No entries yet. After a few logs, the most likely function and level-appropriate
              replacement skills appear here.
            </p>
          </Card>
        ) : (
          <>
            <Card>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                    Most likely function
                  </p>
                  <p className="mt-1 text-3xl font-bold text-calm-700">
                    {analysis.top
                      ? `${FUNCTION_META[analysis.top].emoji} ${FUNCTION_META[analysis.top].label}`
                      : "Not enough information"}
                  </p>
                  {analysis.tie ? (
                    <p className="mt-1 text-sm text-clay-700">
                      Two functions are close: the behavior may serve more than one purpose.
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-ink-soft">
                    {CONFIDENCE_LABEL[analysis.confidence]} · {analysis.scoredCount} scored of{" "}
                    {analysis.count} logs · average severity {avgSeverity.toFixed(1)}/5
                  </p>
                </div>
                <div className="space-y-2" aria-label="Share of evidence by function">
                  {FUNCTIONS.map((fn) => (
                    <div key={fn}>
                      <div className="flex justify-between text-sm">
                        <span>
                          {FUNCTION_META[fn].emoji} {FUNCTION_META[fn].label}
                        </span>
                        <span className="font-semibold">{analysis.shares[fn]}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${FUNCTION_META[fn].label} share`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={analysis.shares[fn]}
                        className="h-3 overflow-hidden rounded-full bg-sage-100"
                      >
                        <div className="h-full bg-calm-600" style={{ width: `${analysis.shares[fn]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {analysis.top ? (
              <Card className="bg-sage-50">
                <h3 className="text-xl font-semibold text-sage-800">
                  Replacement strategy for {FUNCTION_META[analysis.top].label.toLowerCase()} · {profile.title}
                </h3>
                <p className="mt-2 text-lg">{profile.behavior.replacement[analysis.top]}</p>
                <p className="mt-2 text-sm text-ink-soft">{profile.behavior.replacementNote}</p>
                {analysis.tie && analysis.ranked[1] ? (
                  <p className="mt-3">
                    <strong>Also consider ({FUNCTION_META[analysis.ranked[1]].label.toLowerCase()}):</strong>{" "}
                    {profile.behavior.replacement[analysis.ranked[1]]}
                  </p>
                ) : null}
                <p className="mt-3 text-sm text-ink-soft">
                  This is a hypothesis from your logs, not a formal functional behavior assessment.
                  Share the CSV with your BCBA before changing a behavior plan.
                </p>
              </Card>
            ) : null}
          </>
        )}
      </section>

      {sorted.length > 0 ? (
        <section aria-labelledby="log-h" className="space-y-3">
          <h2 id="log-h" className="text-2xl font-bold">
            Log history ({sorted.length})
          </h2>
          <ul className="space-y-3">
            {sorted.map((l) => {
              const fns = topFunctions(scoreLog(l));
              return (
                <li key={l.id} className="rounded-2xl border border-line bg-paper p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {new Date(l.at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      <p className="text-sm text-ink-soft">
                        Severity {l.severity}/5 · {l.durationMin} min
                        {l.setting ? ` · ${l.setting}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-calm-100 px-3 py-1 text-sm font-semibold text-calm-700">
                      {fnLabel(fns)}
                    </span>
                  </div>
                  <dl className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                    <div>
                      <dt className="font-semibold">Antecedent</dt>
                      <dd>{labelsFor(l.antecedents, ANTECEDENTS).join("; ")}</dd>
                      {l.antecedentNote ? <dd className="text-ink-soft">{l.antecedentNote}</dd> : null}
                    </div>
                    <div>
                      <dt className="font-semibold">Behavior</dt>
                      <dd>{labelsFor(l.behaviors, BEHAVIORS).join("; ")}</dd>
                      {l.behaviorNote ? <dd className="text-ink-soft">{l.behaviorNote}</dd> : null}
                    </div>
                    <div>
                      <dt className="font-semibold">Consequence</dt>
                      <dd>{labelsFor(l.consequences, CONSEQUENCES).join("; ")}</dd>
                      {l.consequenceNote ? <dd className="text-ink-soft">{l.consequenceNote}</dd> : null}
                    </div>
                  </dl>
                  <button
                    type="button"
                    className="mt-3 min-h-11 rounded-lg border border-line px-3 text-sm hover:bg-clay-50"
                    onClick={() => setLogs((prev) => prev.filter((x) => x.id !== l.id))}
                  >
                    Delete this entry
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

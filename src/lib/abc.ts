import type { AgeGroup, BehaviorFunction, SupportLevel } from "@/data/clinicalMatrix";

export type Weights = Partial<Record<BehaviorFunction, number>>;

export interface AbcOption {
  id: string;
  label: string;
  weights: Weights;
}

export const FUNCTIONS: BehaviorFunction[] = ["escape", "tangible", "attention", "sensory"];

export const ANTECEDENTS: AbcOption[] = [
  { id: "demand", label: "Task or demand given", weights: { escape: 3 } },
  { id: "transition", label: "Transition or change of activity", weights: { escape: 2, tangible: 1 } },
  { id: "denied", label: "Item or activity denied or taken away", weights: { tangible: 3 } },
  { id: "waiting", label: "Waiting or delay", weights: { tangible: 2, escape: 1 } },
  { id: "attention-away", label: "Adult attention was elsewhere", weights: { attention: 3 } },
  { id: "alone", label: "Alone, unstructured or bored", weights: { sensory: 2, attention: 1 } },
  { id: "overload", label: "Noise, light, crowd or touch", weights: { escape: 2, sensory: 1 } },
  { id: "other-a", label: "Other / not sure", weights: {} },
];

export const BEHAVIORS: AbcOption[] = [
  { id: "cry", label: "Crying or screaming", weights: {} },
  { id: "aggress", label: "Hitting, kicking or biting others", weights: {} },
  { id: "sib", label: "Self-injury (head-hitting, self-biting)", weights: {} },
  { id: "elope", label: "Running away (elopement)", weights: {} },
  { id: "throw", label: "Throwing or breaking things", weights: {} },
  { id: "refuse", label: "Dropping, refusing or going limp", weights: {} },
  { id: "stim", label: "Repetitive movements that escalate", weights: {} },
  { id: "verbal", label: "Verbal protest or shouting", weights: {} },
  { id: "shutdown", label: "Shutdown or withdrawal", weights: {} },
  { id: "other-b", label: "Other", weights: {} },
];

export const CONSEQUENCES: AbcOption[] = [
  { id: "escape-given", label: "Demand removed or reduced, break given", weights: { escape: 4 } },
  { id: "item-given", label: "Item or activity given", weights: { tangible: 4 } },
  { id: "attention-given", label: "Adult attention (comfort, scolding, talking)", weights: { attention: 4 } },
  { id: "ignored", label: "Ignored, nobody responded", weights: { sensory: 2 } },
  { id: "sensory-got", label: "Behavior itself gave sensory input", weights: { sensory: 4 } },
  { id: "calm-space", label: "Moved to a quiet or calm space", weights: { escape: 2, sensory: 1 } },
  { id: "redirected", label: "Redirected to another activity", weights: { attention: 1, escape: 1 } },
  { id: "blocked", label: "Physically guided or blocked", weights: { attention: 1 } },
  { id: "other-c", label: "Other", weights: {} },
];

export interface AbcLog {
  id: string;
  at: string; // ISO timestamp
  antecedents: string[];
  antecedentNote: string;
  behaviors: string[];
  behaviorNote: string;
  severity: number; // 1–5
  durationMin: number;
  consequences: string[];
  consequenceNote: string;
  setting: string;
  age: AgeGroup;
  level: SupportLevel;
}

export function isAbcLogList(value: unknown): value is AbcLog[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        typeof v === "object" &&
        v !== null &&
        typeof (v as AbcLog).id === "string" &&
        typeof (v as AbcLog).at === "string" &&
        Array.isArray((v as AbcLog).antecedents) &&
        Array.isArray((v as AbcLog).behaviors) &&
        Array.isArray((v as AbcLog).consequences),
    )
  );
}

export type Scores = Record<BehaviorFunction, number>;

const emptyScores = (): Scores => ({ escape: 0, tangible: 0, attention: 0, sensory: 0 });

function addWeights(scores: Scores, ids: string[], options: AbcOption[]) {
  ids.forEach((id) => {
    const option = options.find((o) => o.id === id);
    if (!option) return;
    FUNCTIONS.forEach((fn) => {
      scores[fn] += option.weights[fn] ?? 0;
    });
  });
}

export function scoreLog(log: Pick<AbcLog, "antecedents" | "consequences">): Scores {
  const scores = emptyScores();
  addWeights(scores, log.antecedents, ANTECEDENTS);
  addWeights(scores, log.consequences, CONSEQUENCES);
  return scores;
}

/** The function(s) with the highest score for one log (empty if nothing scored). */
export function topFunctions(scores: Scores): BehaviorFunction[] {
  const max = Math.max(...FUNCTIONS.map((fn) => scores[fn]));
  if (max <= 0) return [];
  return FUNCTIONS.filter((fn) => scores[fn] === max);
}

export type Confidence = "none" | "preliminary" | "moderate" | "strong";

export interface Analysis {
  count: number;
  scoredCount: number;
  shares: Record<BehaviorFunction, number>; // percentages summing to ~100
  ranked: BehaviorFunction[];
  top: BehaviorFunction | null;
  tie: boolean;
  confidence: Confidence;
}

/**
 * Pools evidence across logs. Each log contributes one unit of evidence split in
 * proportion to its scores, so a single very “loud” log cannot dominate.
 */
export function analyse(logs: AbcLog[]): Analysis {
  const totals = emptyScores();
  let scoredCount = 0;
  logs.forEach((log) => {
    const s = scoreLog(log);
    const sum = FUNCTIONS.reduce((acc, fn) => acc + s[fn], 0);
    if (sum <= 0) return;
    scoredCount += 1;
    FUNCTIONS.forEach((fn) => {
      totals[fn] += s[fn] / sum;
    });
  });
  const grand = FUNCTIONS.reduce((acc, fn) => acc + totals[fn], 0);
  const shares = emptyScores();
  FUNCTIONS.forEach((fn) => {
    shares[fn] = grand > 0 ? Math.round((totals[fn] / grand) * 100) : 0;
  });
  const ranked = [...FUNCTIONS].sort((a, b) => totals[b] - totals[a]);
  const lead = grand > 0 ? (totals[ranked[0]] - totals[ranked[1]]) / grand : 0;
  const tie = grand > 0 && lead < 0.05;
  let confidence: Confidence = "none";
  if (scoredCount > 0) confidence = "preliminary";
  if (scoredCount >= 5 && lead >= 0.1) confidence = "moderate";
  if (scoredCount >= 12 && lead >= 0.2) confidence = "strong";
  return {
    count: logs.length,
    scoredCount,
    shares,
    ranked,
    top: grand > 0 ? ranked[0] : null,
    tie,
    confidence,
  };
}

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  none: "No data yet",
  preliminary: "Preliminary: log at least 5 events",
  moderate: "Moderate pattern",
  strong: "Strong pattern",
};

export function labelsFor(ids: string[], options: AbcOption[]): string[] {
  return ids.map((id) => options.find((o) => o.id === id)?.label ?? id);
}

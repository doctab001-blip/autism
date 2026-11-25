"use client";

import { useProfile } from "@/context/ProfileContext";
import {
  AGE_GROUPS,
  AGE_META,
  LEVEL_META,
  SUPPORT_LEVELS,
  type AgeGroup,
  type SupportLevel,
} from "@/data/clinicalMatrix";

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; title: string; sub: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-1 flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-sage-100 p-1">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={`min-h-12 rounded-lg px-2 py-1 text-center leading-tight transition-colors ${
                selected
                  ? "bg-sage-600 text-white shadow-sm"
                  : "text-sage-800 hover:bg-sage-50"
              }`}
            >
              <span className="block text-sm font-semibold">{option.title}</span>
              <span className={`block text-xs ${selected ? "text-white/85" : "text-ink-soft"}`}>
                {option.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProfileSwitcher() {
  const { age, level, setAge, setLevel, profile } = useProfile();
  return (
    <div className="border-t border-line bg-sage-50/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-end sm:gap-5">
        <Segmented<AgeGroup>
          label="Age group"
          value={age}
          onChange={setAge}
          options={AGE_GROUPS.map((a) => ({
            value: a,
            title: AGE_META[a].label.split(" ")[0],
            sub: AGE_META[a].short,
          }))}
        />
        <Segmented<SupportLevel>
          label="DSM-5 support level"
          value={level}
          onChange={setLevel}
          options={SUPPORT_LEVELS.map((l) => ({
            value: l,
            title: LEVEL_META[l].short,
            sub: l === "level1" ? "Support" : l === "level2" ? "Substantial" : "Very substantial",
          }))}
        />
        <p className="text-sm text-ink-soft sm:max-w-[16rem]" aria-live="polite">
          Showing: <strong className="text-ink">{profile.title}</strong>
        </p>
      </div>
    </div>
  );
}

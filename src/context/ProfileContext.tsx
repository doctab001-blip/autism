"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import {
  AGE_GROUPS,
  SUPPORT_LEVELS,
  getProfile,
  type AgeGroup,
  type ClinicalProfile,
  type SupportLevel,
} from "@/data/clinicalMatrix";
import { useLocalStorage } from "@/lib/useLocalStorage";

/**
 * Global dual-axis profile: Age group × DSM-5 support level.
 * Persisted in this browser's localStorage only. No names or birthdates are stored.
 */

const STORAGE_KEY = "homepath.profile.v1";

interface StoredProfile {
  age: AgeGroup;
  level: SupportLevel;
}

const DEFAULT_PROFILE: StoredProfile = { age: "early", level: "level1" };

function isStoredProfile(value: unknown): value is StoredProfile {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    AGE_GROUPS.includes(v.age as AgeGroup) && SUPPORT_LEVELS.includes(v.level as SupportLevel)
  );
}

interface ProfileContextValue extends StoredProfile {
  profile: ClinicalProfile;
  setAge: (age: AgeGroup) => void;
  setLevel: (level: SupportLevel) => void;
  setBoth: (age: AgeGroup, level: SupportLevel) => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<StoredProfile>(
    STORAGE_KEY,
    DEFAULT_PROFILE,
    isStoredProfile,
  );

  const setAge = useCallback(
    (age: AgeGroup) => setStored((previous) => ({ ...previous, age })),
    [setStored],
  );
  const setLevel = useCallback(
    (level: SupportLevel) => setStored((previous) => ({ ...previous, level })),
    [setStored],
  );
  const setBoth = useCallback(
    (age: AgeGroup, level: SupportLevel) => setStored({ age, level }),
    [setStored],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      age: stored.age,
      level: stored.level,
      profile: getProfile(stored.age, stored.level),
      setAge,
      setLevel,
      setBoth,
    }),
    [stored.age, stored.level, setAge, setLevel, setBoth],
  );

  return <ProfileContext value={value}>{children}</ProfileContext>;
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used inside <ProfileProvider>");
  return context;
}

"use client";

import { useState } from "react";
import { eraseAllHomePathData } from "@/lib/useLocalStorage";
import { btnDanger, btnSecondary } from "@/components/ui";

export function SiteFooter() {
  const [confirming, setConfirming] = useState(false);
  return (
    <footer className="mt-16 border-t border-line bg-sand-50 print:hidden">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 text-sm text-ink-soft">
        <p className="text-base text-ink">
          <strong>Medical disclaimer.</strong> HomePath Autism offers educational parent-coaching
          frameworks. It does not replace an individual diagnosis, a personalised treatment plan from
          your child’s clinicians, or emergency behavioral crisis care.
        </p>
        <p>
          If anyone is in immediate danger or seriously injured, contact your local emergency number
          straight away (for example 911, 999 or 112, depending on where you live) and follow your
          child’s written crisis plan.
        </p>
        <details className="rounded-xl border border-line bg-paper p-4">
          <summary className="min-h-11 cursor-pointer py-2 text-base font-semibold text-ink">
            Privacy: your data stays on this device
          </summary>
          <div className="mt-2 space-y-3">
            <p>
              The profile, checklists, behavior logs and board settings are saved only in this
              browser’s local storage. Nothing is uploaded. Please do not enter a child’s full name,
              date of birth or other identifying details. Use initials or nicknames in notes.
            </p>
            {confirming ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-clay-700">
                  Erase all saved data on this device? This cannot be undone.
                </span>
                <button
                  type="button"
                  className={btnDanger}
                  onClick={() => {
                    eraseAllHomePathData();
                    setConfirming(false);
                  }}
                >
                  Yes, erase everything
                </button>
                <button type="button" className={btnSecondary} onClick={() => setConfirming(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button type="button" className={btnSecondary} onClick={() => setConfirming(true)}>
                Erase all saved data
              </button>
            )}
          </div>
        </details>
        <p>
          Always involve your child’s paediatrician, BCBA, speech-language pathologist and
          occupational therapist before starting or changing a programme.
        </p>
      </div>
    </footer>
  );
}

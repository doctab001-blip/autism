"use client";

import { useEffect, useState } from "react";
import { BulletList, Card, PageTitle, btnSecondary } from "@/components/ui";
import {
  AVOID,
  CO_OCCURRING,
  CO_OCCURRING_NOTE,
  PROVIDER_QUESTIONS,
  RED_FLAGS,
} from "@/data/safetyContent";
import { useLocalStorage } from "@/lib/useLocalStorage";

type Ticks = Record<string, boolean>;
const isTicks = (v: unknown): v is Ticks =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function Check({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-3"
    >
      <input
        id={id}
        type="checkbox"
        className="mt-1 h-6 w-6 shrink-0 accent-sage-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

type PrintScope = "all" | "providers" | "screen";

export function SafetyView() {
  const [screen, setScreen] = useLocalStorage<Ticks>("homepath.safety.screen.v1", {}, isTicks);
  const [flags, setFlags] = useLocalStorage<Ticks>("homepath.safety.flags.v1", {}, isTicks);
  const [asked, setAsked] = useLocalStorage<Ticks>("homepath.safety.providerQs.v1", {}, isTicks);
  const [scope, setScope] = useState<PrintScope>("all");

  useEffect(() => {
    const reset = () => setScope("all");
    window.addEventListener("afterprint", reset);
    return () => window.removeEventListener("afterprint", reset);
  }, []);

  function printOnly(next: PrintScope) {
    setScope(next);
    setTimeout(() => window.print(), 50);
  }

  const raised = CO_OCCURRING.filter((c) => screen[c.id]);
  const hide = (section: PrintScope) => (scope !== "all" && scope !== section ? "print:hidden" : "");

  return (
    <div className="space-y-10">
      <div className={scope === "all" ? "" : "print:hidden"}>
        <PageTitle eyebrow="Safety & safeguards" title="Clinical safety, co-occurring conditions and provider checks">
          Autism is a lifelong neurodevelopmental difference. Good support builds skills and
          communication access, and checks for health needs that sit alongside autism. These tools
          help you ask good questions. They do not replace your child’s clinicians.
        </PageTitle>
      </div>

      <section aria-labelledby="co-h" className={`space-y-4 ${hide("screen")}`}>
        <h2 id="co-h" className="text-2xl font-bold">
          1. Co-occurring conditions screen
        </h2>
        <p className="max-w-3xl text-ink-soft">{CO_OCCURRING_NOTE}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          {CO_OCCURRING.map((item) => (
            <Card key={item.id}>
              <Check
                id={`co-${item.id}`}
                checked={Boolean(screen[item.id])}
                onChange={(v) => setScreen((s) => ({ ...s, [item.id]: v }))}
              >
                <strong>{item.title}</strong>: tick if any of these apply
              </Check>
              <BulletList items={item.prompts} className="mt-3 text-sm" />
              <p className="mt-3 rounded-xl bg-sage-50 p-3 text-sm">
                <strong>Raise with your paediatrician:</strong> {item.raise}
              </p>
            </Card>
          ))}
        </div>
        <Card className="bg-calm-50" as="div">
          <div role="status" aria-live="polite">
            {raised.length === 0 ? (
              <p>Tick anything that sounds familiar to build a short list to bring to your next appointment.</p>
            ) : (
              <>
                <p className="font-semibold">Bring this list to your paediatrician:</p>
                <ul className="mt-2 list-disc pl-5">
                  {raised.map((r) => (
                    <li key={r.id}>{r.title}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <p className="mt-3 text-sm text-ink-soft print:hidden">
            This screen does not diagnose anything. If your child has a seizure, trouble breathing,
            or you are worried about their safety, get urgent medical help.
          </p>
          <div className="mt-3 print:hidden">
            <button type="button" className={btnSecondary} onClick={() => printOnly("screen")}>
              Print my list
            </button>
          </div>
        </Card>
      </section>

      <section aria-labelledby="avoid-h" className={`space-y-4 ${scope === "all" ? "" : "print:hidden"}`}>
        <h2 id="avoid-h" className="text-2xl font-bold">
          2. Treatments to avoid &amp; red flags
        </h2>
        <p className="max-w-3xl text-ink-soft">
          Many parents are offered these by people who mean well. Wanting to help your child is
          natural, and no one should feel judged for asking about them. The summary below follows the
          direction of NICE CG170 and CG142 and American Academy of Pediatrics guidance: these are not
          recommended for autism, and some are harmful.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {AVOID.map((a) => (
            <Card key={a.id}>
              <h3 className="text-lg font-semibold text-clay-700">{a.name}</h3>
              <p className="mt-1 text-sm text-ink-soft">
                <strong>The claim:</strong> {a.claim}
              </p>
              <p className="mt-2 text-sm">
                <strong>Why avoid it:</strong> {a.why}
              </p>
            </Card>
          ))}
        </div>
        <Card>
          <h3 className="text-xl font-semibold text-sage-800">Red flags checklist</h3>
          <p className="mb-3 text-sm text-ink-soft">Tick any that you notice. Two or more is a reason to pause and ask your child’s clinician.</p>
          <div className="space-y-2">
            {RED_FLAGS.map((f) => (
              <Check
                key={f.id}
                id={`flag-${f.id}`}
                checked={Boolean(flags[f.id])}
                onChange={(v) => setFlags((s) => ({ ...s, [f.id]: v }))}
              >
                {f.text}
              </Check>
            ))}
          </div>
          <p className="mt-3 font-semibold" role="status" aria-live="polite">
            {RED_FLAGS.filter((f) => flags[f.id]).length >= 2
              ? "Several red flags: pause, and talk it through with your paediatrician before spending money or starting anything."
              : "Keep this list handy when you meet a new provider."}
          </p>
        </Card>
      </section>

      <section aria-labelledby="q-h" className={`space-y-4 ${hide("providers")}`}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="q-h" className="text-2xl font-bold">
              3. Questions to ask any provider
            </h2>
            <p className="max-w-3xl text-ink-soft">
              Good providers welcome these questions. Tick each one when you have a clear answer, or
              print the list to take with you.
            </p>
          </div>
          <button type="button" className={`${btnSecondary} print:hidden`} onClick={() => printOnly("providers")}>
            Print checklist
          </button>
        </div>
        {PROVIDER_QUESTIONS.map((g) => (
          <Card key={g.group}>
            <h3 className="text-lg font-semibold text-sage-800">{g.group}</h3>
            <div className="mt-3 space-y-2">
              {g.items.map((q) => (
                <Check
                  key={q.id}
                  id={`pq-${q.id}`}
                  checked={Boolean(asked[q.id])}
                  onChange={(v) => setAsked((s) => ({ ...s, [q.id]: v }))}
                >
                  {q.text}
                </Check>
              ))}
            </div>
          </Card>
        ))}
        <p className="text-sm text-ink-soft">
          Provider name: ______________________ &nbsp; Date: ____________ &nbsp; Notes: ______________________
        </p>
      </section>
    </div>
  );
}

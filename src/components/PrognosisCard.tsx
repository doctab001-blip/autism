import { BulletList, Card } from "@/components/ui";
import type { Prognosis } from "@/data/clinicalMatrix";

/** 7-point prognosis & execution card, shown inside each therapy module. */
export function PrognosisCard({ title, data }: { title: string; data: Prognosis }) {
  const tierClass =
    data.evidence.tier === "A"
      ? "bg-sage-100 text-sage-800 border-sage-300"
      : "bg-calm-50 text-calm-700 border-calm-100";
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-xl font-semibold text-sage-800">{title}: what to do, what to expect</h3>
        <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${tierClass}`}>
          {data.evidence.label}
        </span>
      </div>
      <p className="mt-2 text-sm text-ink-soft">{data.evidence.note}</p>

      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="font-semibold">1. Home activities &amp; daily dosage</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {data.home.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="mt-2 rounded-xl bg-sage-50 p-3 text-sm">
            <strong>Daily dosage:</strong> {data.home.dosage}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">2. First noticeable effect (weeks 1–4)</h4>
            <p className="mt-1 text-sm">{data.firstEffect}</p>
          </div>
          <div>
            <h4 className="font-semibold">3. Timeline &amp; concrete milestone</h4>
            <ul className="mt-1 space-y-1 text-sm">
              <li>
                <strong>Weeks 4–12:</strong> {data.timeline.weeks4to12}
              </li>
              <li>
                <strong>Months 3–6:</strong> {data.timeline.months3to6}
              </li>
              <li>
                <strong>Milestone to look for:</strong> {data.timeline.milestone}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="font-semibold">4. Do changes last or come back?</h4>
        <p className="mt-1 text-sm">{data.maintenance.lasting}</p>
        <BulletList items={data.maintenance.regression} className="mt-2 text-sm" />
        <p className="mt-2 text-sm">
          <strong>Keeping it going:</strong> {data.maintenance.ongoing}
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-calm-100 bg-calm-50 p-4">
        <h4 className="font-semibold text-calm-700">5. Child voice &amp; assent rule</h4>
        <p className="mt-1 text-sm">{data.assent}</p>
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        Timelines are typical, not promises. Agree goals and amounts with your child’s own team.
      </p>
    </Card>
  );
}

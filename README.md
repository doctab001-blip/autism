# HomePath Autism: Parent-Led Clinical Therapy Portal

Next.js (App Router) · TypeScript · Tailwind CSS v4. Deploys to Vercel with default settings.

## Routes
| Route | What it does |
|---|---|
| `/` | Clinical blueprint, sample daily routine (printable visual schedule), searchable 9-profile comparison matrix |
| `/pillars` | Speech & AAC, Behavior (meltdown vs tantrum), Sensory & OT, Social/Life Skills (backward chaining); each therapy card has a 7-point prognosis & execution structure |
| `/safety` | Co-occurring conditions screen, treatments to avoid & red flags, printable questions to ask any provider |
| `/environment` | 6-point home setup checklist + sensory diet builder (both saved locally, printable) |
| `/tracker` | ABC tracker with function detection, level-calibrated replacement strategies, CSV export |
| `/board` | Full-screen First–Then + 5-star token board with soft Web Audio chimes |

## Architecture
- `src/context/ProfileContext.tsx` – Age group (`early | school | teen`) × DSM-5 level (`level1 | level2 | level3`), persisted in `localStorage`.
- `src/data/clinicalMatrix.ts` – typed content for all 9 profiles (dose, NDBI/manding/PECS-SGD, behavior, sensory, ADL chains, daily routine).
- `src/lib/useLocalStorage.ts` – `useSyncExternalStore`-based storage hook (no hydration mismatch).
- `src/lib/abc.ts` – function-detection scoring; `src/lib/csv.ts` – injection-safe CSV export.

## Develop / verify / deploy
```bash
npm install
npm run dev
npm run build && npm run lint   # both must pass before you push
```
Push to GitHub, then import the repo at vercel.com/new and keep the default Next.js settings.

## Privacy
All data (profile, checklists, ABC logs, board) stays in the browser's `localStorage`; nothing is sent to a server.
Do not enter real full names or birthdates. If you later add cloud sync (e.g. Supabase/Clerk) for two parents,
use encrypted storage and keep identifiers out of the logs.

## Medical disclaimer
Educational parent-coaching frameworks only. Not a substitute for individual diagnosis, a personalised plan from the
child's clinicians, or emergency behavioral crisis care.

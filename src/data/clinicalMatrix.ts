/**
 * HomePath Autism — typed clinical data layer.
 *
 * 3 age groups × 3 DSM-5 support levels = 9 profiles.
 * Content is an educational, parent-coaching framework drawn from commonly used,
 * evidence-informed approaches (NDBIs, functional communication training, PECS/AAC,
 * positive behaviour support, sensory-based strategies, backward chaining).
 * Autism is a lifelong neurodevelopmental difference: this content builds skills, supports and
 * communication access rather than aiming to cure or remove autism.
 * It is NOT an individual support plan; doses are typical ranges to agree with a
 * child's own team (BCBA / SLP / OT / paediatrician).
 */

export type AgeGroup = "early" | "school" | "teen";
export type SupportLevel = "level1" | "level2" | "level3";
export type ProfileKey = `${AgeGroup}-${SupportLevel}`;
export type Pillar = "speech" | "behavior" | "sensory" | "adl" | "social" | "rest";
export type BehaviorFunction = "escape" | "tangible" | "attention" | "sensory";

export const AGE_GROUPS: readonly AgeGroup[] = ["early", "school", "teen"];
export const SUPPORT_LEVELS: readonly SupportLevel[] = ["level1", "level2", "level3"];

export const AGE_META: Record<AgeGroup, { label: string; range: string; short: string }> = {
  early: { label: "Early years", range: "18 months – 5 years", short: "18m–5y" },
  school: { label: "School age", range: "6 – 12 years", short: "6–12y" },
  teen: { label: "Teen & transition", range: "13 – 18+ years", short: "13–18+y" },
};

export const LEVEL_META: Record<
  SupportLevel,
  { label: string; short: string; description: string }
> = {
  level1: {
    label: "Level 1 — Requiring support",
    short: "Level 1",
    description:
      "Without supports, difficulties with social communication cause noticeable impairment. Initiating interactions can be hard and inflexibility interferes with functioning in one or more settings.",
  },
  level2: {
    label: "Level 2 — Requiring substantial support",
    short: "Level 2",
    description:
      "Marked difficulties in verbal and nonverbal social communication, even with supports in place. Limited initiation; inflexibility and distress with change are obvious to a casual observer.",
  },
  level3: {
    label: "Level 3 — Requiring very substantial support",
    short: "Level 3",
    description:
      "Severe difficulties in verbal and nonverbal communication cause severe impairment. Very limited initiation; extreme difficulty coping with change that markedly interferes with all areas of life.",
  },
};

export const PILLAR_META: Record<Pillar, { label: string; emoji: string }> = {
  speech: { label: "Speech & AAC", emoji: "💬" },
  behavior: { label: "Behavior & regulation", emoji: "🧭" },
  sensory: { label: "Sensory & OT", emoji: "🌿" },
  adl: { label: "Daily living", emoji: "🪥" },
  social: { label: "Social & play", emoji: "🤝" },
  rest: { label: "Rest & recharge", emoji: "🌙" },
};

export const FUNCTION_META: Record<
  BehaviorFunction,
  { label: string; plain: string; emoji: string }
> = {
  escape: {
    label: "Escape / avoidance",
    plain: "The behavior helps the child get away from or end a demand, task, place or sensory input.",
    emoji: "🚪",
  },
  tangible: {
    label: "Tangible / access",
    plain: "The behavior helps the child get a preferred item or activity.",
    emoji: "🧸",
  },
  attention: {
    label: "Attention",
    plain: "The behavior helps the child get a person’s attention, comfort or reaction.",
    emoji: "👀",
  },
  sensory: {
    label: "Sensory / automatic",
    plain: "The behavior feels good or relieves discomfort by itself, whether or not anyone is there.",
    emoji: "🌀",
  },
};

export interface RoutineBlock {
  time: string; // 24h "HH:MM"
  title: string;
  detail: string;
  pillar: Pillar;
  minutes: number;
}

export interface AdlSkill {
  name: string;
  steps: string[];
}

export interface ClinicalProfile {
  key: ProfileKey;
  age: AgeGroup;
  level: SupportLevel;
  title: string;
  summary: string;
  dose: {
    structuredMinutesPerDay: number;
    label: string;
    blocks: string[];
    weekly: string;
    embedded: string;
  };
  speech: {
    headline: string;
    targets: string[];
    ndbi: string[];
    manding: string[];
    aac: string[];
  };
  behavior: {
    headline: string;
    priorities: string[];
    proactive: string[];
    replacement: Record<BehaviorFunction, string>;
    replacementNote: string;
    meltdown: string[];
    tantrum: string[];
  };
  sensory: {
    headline: string;
    seeking: string[];
    avoiding: string[];
    underResponsive: string[];
    regulation: string[];
  };
  adl: { headline: string; skills: AdlSkill[] };
  social: { headline: string; goals: string[]; strategies: string[] };
  routine: RoutineBlock[];
  prognosis: Record<PrognosisPillar, Prognosis>;
}

/* -------------------------------------------------------------------------- */
/* Prognosis & execution structure (evidence tier, dosage, timelines, assent)    */
/* -------------------------------------------------------------------------- */

export type PrognosisPillar = "behavior" | "speech" | "sensory";

export interface Prognosis {
  evidence: { tier: "A" | "B"; label: string; note: string };
  home: { steps: string[]; dosage: string };
  firstEffect: string;
  timeline: { weeks4to12: string; months3to6: string; milestone: string };
  maintenance: { lasting: string; regression: string[]; ongoing: string };
  assent: string;
}

export function profileKey(age: AgeGroup, level: SupportLevel): ProfileKey {
  return `${age}-${level}`;
}

/* -------------------------------------------------------------------------- */
/* Level-calibrated behavior content (shared by all ages at that level)         */
/* -------------------------------------------------------------------------- */

const REPLACEMENT_BY_LEVEL: Record<SupportLevel, Record<BehaviorFunction, string>> = {
  level1: {
    escape:
      "Teach a spoken or written “I need a break / this is too hard” request. Earn the break after a short, achievable chunk of work, then gradually lengthen the chunk. Fade toward self-initiated, scheduled breaks.",
    tangible:
      "Teach asking in words (“Can I have ___ after ___?”) and waiting with a visual timer or First–Then. Practise hearing “not now” with a coping script, and reward calm acceptance.",
    attention:
      "Teach a polite attention bid (“Can you watch me?”, tap + “excuse me”) and schedule attention on a regular clock (every few minutes) so the child doesn’t need the behavior to get it.",
    sensory:
      "Identify the sensory goal and offer an equally satisfying, acceptable alternative on a schedule. Teach the child to choose from a sensory menu and agree when and where the original behavior is fine.",
  },
  level2: {
    escape:
      "Functional communication training (FCT): teach a BREAK card, sign, button or short phrase. Honour it immediately and every time at first, then add a short wait and a bit of work before the break (thinning).",
    tangible:
      "Teach a reliable request (card, sign, SGD or phrase) for the item and honour it quickly at first. Then add “wait” with a timer and a second, preferred activity so waiting is rewarded.",
    attention:
      "Teach a simple attention request (tap-and-point card, “look” sign/button). Give planned, frequent attention for calm behavior and brief, neutral responses to the distress behavior.",
    sensory:
      "Provide scheduled, high-quality access to the sensory input (swing, chew, vibration) and teach requesting it. Block only if unsafe, and always redirect to a matched alternative.",
  },
  level3: {
    escape:
      "Teach one very simple, easy-to-do response (touch a BREAK symbol, hand over an object or hit a single switch) and honour it immediately, 100% of the time at first. Use hand-over-hand prompting, then fade it slowly.",
    tangible:
      "Teach one clear request (hand over a picture or press a button) for the highest-preference items. Reinforce within 1–2 seconds. Add waiting only in tiny steps (1, 2, 3 seconds…).",
    attention:
      "Give frequent, predictable attention for no behavior at all (noncontingent attention) and teach a single attention signal (touch a card or tap the shoulder). Respond immediately and warmly.",
    sensory:
      "Make the sensory input freely available through the day (noncontingent access) and teach the child to request it. Keep the environment safe, with protective gear only if prescribed by the clinical team.",
  },
};

const REPLACEMENT_AGE_NOTE: Record<AgeGroup, string> = {
  early:
    "Early years: model it in play, use very few words, and reinforce within seconds. Practise the replacement when the child is calm, not mid-upset.",
  school:
    "School age: pair with a visual schedule and token board, and align the same words and cards across home and school.",
  teen:
    "Teen years: use dignified, age-respectful tools (discreet cue card, phone timer or wearable), involve the teen in choosing the plan, and avoid childlike materials.",
};

const MELTDOWN_BY_LEVEL: Record<SupportLevel, string[]> = {
  level1: [
    "Recognise early signs (pacing, hands over ears, scripting, going quiet, tearful) and act before the peak.",
    "Reduce demands and words. Use short, calm statements: “I’m here. Quiet space is ready.”",
    "Lower input: dim lights, move to a quiet room, offer headphones or a weighted lap pad.",
    "Wait it out safely. No questions, no lecturing, no problem-solving mid-meltdown.",
    "After recovery (10–30+ min), offer water and rest, then debrief later with a visual (what happened, what helps).",
  ],
  level2: [
    "Spot the build-up and cue the pre-taught calming routine (BREAK card, calm corner, deep-pressure squeeze if the child likes it).",
    "Use minimal language plus visuals; pair each word with a gesture or picture.",
    "Protect the child and the space: clear hard objects, stay at arm’s length, stay low and calm.",
    "Do not bargain or give new demands. Offer one simple choice only when the child can process it.",
    "Allow recovery time with predictable comfort items, then return to the routine with an easy first task and praise for calm.",
  ],
  level3: [
    "Safety first: clear the space, protect head and body, remove hard objects, and keep other children away.",
    "Stay close but give space, speak very little, keep your voice low, and avoid touching unless needed for safety.",
    "Reduce sensory load: lights, noise, crowds. Offer familiar comfort items or deep pressure only if the child usually welcomes it.",
    "Avoid physical restraint. Any physical intervention should only be used if taught and agreed by qualified clinicians. Follow the written crisis plan.",
    "If there is a risk of serious injury, or the episode is unusually long or different, seek urgent medical help. Afterwards, record it in the ABC tracker and share with the team.",
  ],
};

const TANTRUM_BY_LEVEL: Record<SupportLevel, string[]> = {
  level1: [
    "Stay calm and neutral. Keep the limit you set (“First homework, then game.”).",
    "Don’t give in mid-protest, or the behavior is rewarded. Offer a clear way to ask or negotiate calmly.",
    "Acknowledge the feeling briefly (“You wanted more time. That’s hard.”), then restate the plan.",
    "Reward the first moment of calm quickly and specifically (“You asked so nicely!”).",
    "Afterwards, rehearse the replacement skill when everyone is calm.",
  ],
  level2: [
    "Use a short, calm phrase and visual: “First ___, then ___.” Do not argue or explain at length.",
    "Hold the limit while prompting the replacement (BREAK card, “help”, “all done”) and reward it immediately.",
    "Reduce attention to the protest itself (no big reactions) and give lots of attention to calm.",
    "Keep the demand small, offer a choice (which first?) and end on a success the child can achieve.",
    "Record patterns in the tracker to check whether the function is escape, tangible or attention.",
  ],
  level3: [
    "Keep your voice and face neutral, and use one visual or symbol (“wait”, “all done”, “break”).",
    "If the child asks in any way (card, gesture, device), honour the request quickly, as the aim is to strengthen communication.",
    "Make demands tiny and remove non-essential ones during a hard period (build success first).",
    "Always make sure the child is safe; if the behavior becomes dangerous, treat it as a crisis, not a tantrum.",
    "Ask the BCBA / clinical team to review a function-based behavior support plan if the pattern persists.",
  ],
};

/* -------------------------------------------------------------------------- */
/* Profile-specific content                                                    */
/* -------------------------------------------------------------------------- */

type SpecificProfile = Omit<
  ClinicalProfile,
  "key" | "age" | "level" | "title" | "behavior" | "prognosis"
> & {
  behavior: { headline: string; priorities: string[]; proactive: string[] };
};

const b = (
  time: string,
  title: string,
  detail: string,
  pillar: Pillar,
  minutes: number,
): RoutineBlock => ({ time, title, detail, pillar, minutes });

const RAW: Record<ProfileKey, SpecificProfile> = {
  /* ------------------------------ EARLY · L1 ------------------------------ */
  "early-level1": {
    summary:
      "Speaking in words or short sentences, but joint attention, back-and-forth play and flexibility need support.",
    dose: {
      structuredMinutesPerDay: 60,
      label: "≈60 min/day structured + embedded practice",
      blocks: ["3 × 20 min play-based NDBI blocks", "Short transition & waiting practice during routines"],
      weekly: "≈6 days/week (≈6 hours structured, plus embedded opportunities all day)",
      embedded: "Aim for 15–20 communication opportunities in each routine: meals, bath, dressing, outings.",
    },
    speech: {
      headline: "Grow spontaneous language, joint attention and back-and-forth play",
      targets: [
        "Joint attention: point, show, give, follow a point (5+ times per play block)",
        "Expand 2-word to 3–4-word utterances and early sentences",
        "Ask and answer simple questions (what, where, who)",
        "Pretend play with a partner for 3+ turns",
        "Respond to name and simple group instructions",
      ],
      ndbi: [
        "Follow the child’s lead, sit face-to-face at eye level",
        "Contingent imitation of actions and sounds, then add one new action",
        "Expand: child says “car” and you say “red car” (add one word)",
        "JASPER-style joint engagement routines with predictable frames you vary slowly",
        "Natural reinforcement: the reward is the item or activity they asked for, not unrelated treats",
      ],
      manding: [
        "Create communication temptations: clear containers, small portions, a “forgotten” spoon",
        "Move from mands for items, to actions, to information (“Where is…?”, “What’s that?”)",
        "Prompt ladder: wait 5 seconds, expectant look, model, partial prompt; fade quickly",
        "Raise the bar one step (one word to two words) only when motivation is high",
      ],
      aac: [
        "Speech is the primary mode. Keep a pocket visual choice board as a stress fallback.",
        "If speech stalls or frustration rises, trial core-word AAC; research does not show AAC blocks speech.",
        "If PECS was used before, continue at Phase IV–VI (“I want ___” sentence strip).",
      ],
    },
    behavior: {
      headline: "Build flexibility: transitions, waiting and coping with “no”",
      priorities: ["Flexible transitions and waiting", "Coping with “no” and small changes", "Naming feelings"],
      proactive: [
        "Give a 2-minute warning with a visual timer before every transition",
        "Use First–Then before every non-preferred task",
        "Offer two choices so the child has control",
        "Rehearse small surprises in play (a changed song, a different cup)",
      ],
    },
    sensory: {
      headline: "Pair regulation with play and teach the child to notice body states",
      seeking: ["Crash-pad or pillow-pile jumps", "Playground swinging and climbing", "Animal walks to the next room", "Play-dough, kinetic sand, water play"],
      avoiding: ["Pre-warn loud sounds (flush, vacuum) with a countdown", "Tag-free clothes and seamless socks", "Ear defenders in noisy places", "Introduce messy textures with tools first (spoon, gloves)"],
      underResponsive: ["Light-up and vibrating cause-effect toys", "Crunchy and chewy snacks", "Fast movement games with stop/go", "Strong flavours and cold-water play to alert"],
      regulation: ["“Smell the flower, blow the candle” breathing", "A heavy-work job before seated tasks (carry the laundry basket)", "A calm-down tent with two or three toys and a 3-step picture card"],
    },
    adl: {
      headline: "Independence in dressing, handwashing and mealtimes",
      skills: [
        { name: "Putting on velcro shoes", steps: ["Sit on the floor or low stool", "Pick up shoe", "Open velcro strap", "Put foot into opening", "Push heel in", "Pull tongue up", "Close velcro strap"] },
        { name: "Washing hands", steps: ["Turn on tap", "Wet hands", "Pump soap", "Rub palms, backs and fingers (20-second song)", "Rinse", "Turn off tap", "Dry with towel"] },
      ],
    },
    social: {
      headline: "Respond to and start play with others",
      goals: ["Respond to others’ bids and start play with a peer or sibling", "Take turns in 2-step games", "Name and show basic emotions (happy, sad, mad)", "Move from parallel play to shared play"],
      strategies: ["Short play dates (15–20 min) with one peer, one clear activity and an adult “play coach”", "Emotion picture cards at mealtimes (“I feel…”)", "Action songs and turn-taking games (peekaboo, rolling a ball)", "Praise specifically: “You gave Mia the truck!”"],
    },
    routine: [
      b("07:00", "Wake, dress and choose", "Offer two outfits, narrate each step, child pushes arms and legs through.", "adl", 20),
      b("07:30", "Breakfast talk", "Small portions so the child asks for “more”; expand “juice” to “more juice please”.", "speech", 30),
      b("09:00", "Play block 1: follow the lead", "20 minutes of floor play: imitate, expand by one word, build joint attention.", "speech", 20),
      b("10:30", "Heavy-work outdoor time", "Climb, swing, pull the wagon; label actions (“push!”, “up!”).", "sensory", 45),
      b("12:00", "Lunch and helper job", "Child carries the plate or wipes the table; First–Then for tidy-up.", "adl", 40),
      b("13:00", "Quiet rest", "Low light, books, soft music, no screens.", "rest", 60),
      b("15:30", "Play block 2: social turns", "Bubbles, ball roll or pretend picnic: 3+ turns with sibling or adult.", "social", 20),
      b("17:30", "Dinner and transition practice", "Visual timer and “first dinner, then bath”; praise flexible stopping.", "behavior", 30),
      b("19:00", "Bath and bedtime wind-down", "Same order nightly with picture cards, deep-pressure hugs, lullaby.", "sensory", 40),
    ],
  },

  /* ------------------------------ EARLY · L2 ------------------------------ */
  "early-level2": {
    summary:
      "Uses single words or short phrases inconsistently; needs substantial support for communication, play and change.",
    dose: {
      structuredMinutesPerDay: 90,
      label: "≈90 min/day structured + embedded practice",
      blocks: ["4 × 15 min naturalistic NDBI play blocks", "2 × 15 min structured teaching (imitation, matching, receptive language)"],
      weekly: "≈6 days/week (≈9 hours structured, plus embedded opportunities)",
      embedded: "Embed requests in five daily routines: snack, bath, dressing, outing, bedtime.",
    },
    speech: {
      headline: "Functional communication first: reliable requests by word, sign, picture or device",
      targets: [
        "Reliably request 15+ preferred items and actions",
        "Imitate actions, sounds and words (build echoic skills)",
        "Follow 1-step instructions as gesture help fades",
        "Label 20+ common objects and actions",
        "Respond to name and follow a point",
      ],
      ndbi: [
        "Pivotal-style child choice and child-led play",
        "ESDM-style sensory-social routines (tickles, songs) with a pause, wait, request",
        "Imitate the child’s sounds, then model one word up",
        "Embed 3–5 teaching trials per minute in play, without drilling",
        "Reinforce attempts, not only perfect words",
      ],
      manding: [
        "Build motivation first (pair yourself with fun), then require a request",
        "Start with items, then actions (open, push), then “more” and “all done”",
        "Most-to-least prompting, then time delay (0 s, 2 s, 4 s)",
        "Teach “help” and “break” early because they prevent behavior problems",
      ],
      aac: [
        "PECS Phases I–IV: exchange, distance and persistence, picture discrimination, “I want” sentence strip",
        "Or a low-tech core board / SGD with 6–12 buttons (more, want, go, stop, help, eat, drink, play)",
        "Aided language input: point to words as you speak, with all adults, all day",
        "Keep the system always reachable. Never lock it away as a reward.",
      ],
    },
    behavior: {
      headline: "Replace crying, hitting and dropping with a reliable request",
      priorities: ["Build one reliable request that replaces distress behavior", "Tolerate brief waits (5–30 seconds)", "Reduce the need for escape during demands by making tasks easier to start"],
      proactive: [
        "Use a 3–4 picture visual schedule",
        "Give high-rate reinforcement early (every correct response)",
        "Mix in easy tasks between hard ones (behavioral momentum)",
        "Keep demands short and always end on a success",
      ],
    },
    sensory: {
      headline: "Build a daily sensory diet and use it before demanding tasks",
      seeking: ["Trampoline or bouncing on a therapy ball", "Deep-pressure squeezes or a weighted lap pad", "Swinging (linear) and spinning with an adult", "Chewy tubes and vibrating toys"],
      avoiding: ["Visual timer for noise (vacuum, hand-dryer) plus ear defenders", "Choose soft, tag-free clothing", "Gradual exposure to food textures with no pressure", "Dim, indirect lighting at home"],
      underResponsive: ["Brisk brushing only if recommended by your OT", "Fast, rhythmic movement games", "Strongly flavoured or crunchy foods", "Cold, textured or vibrating toys"],
      regulation: ["Heavy-work “job” (push laundry, carry books) before sitting", "Calm corner with a visual 3-step routine (breathe, squeeze, rest)", "Predictable music cues for transitions"],
    },
    adl: {
      headline: "Independence in toileting, dressing and eating with prompts",
      skills: [
        { name: "Brushing teeth", steps: ["Get toothbrush", "Wet brush", "Put on toothpaste", "Brush front teeth", "Brush left and right sides", "Brush back teeth", "Rinse mouth", "Rinse brush and put away"] },
        { name: "Pulling on trousers", steps: ["Sit down", "Put one leg into the hole", "Put the other leg into the hole", "Stand up", "Pull up to the knees", "Pull up to the waist", "Adjust waistband"] },
      ],
    },
    social: {
      headline: "Shared attention, imitation and simple turn-taking",
      goals: ["Look at adult’s face and share enjoyment", "Imitate actions in songs and games", "Tolerate a peer playing nearby (parallel play)", "Take turns in 1–2 simple games"],
      strategies: ["Sensory-social routines (swing, bubbles, tickle) with a pause before the next turn", "Musical games with hand actions (“If you’re happy…”)", "Short, predictable play-dates with one peer and a clear start and end", "Visual “my turn / your turn” cards"],
    },
    routine: [
      b("07:00", "Wake and dress with visual steps", "3-picture sequence (pants, shirt, socks); hand-over-hand fading.", "adl", 25),
      b("07:30", "Breakfast requests", "Withhold small items to prompt “more”, “open”, or a picture exchange.", "speech", 30),
      b("09:00", "Structured learning 1", "15 min: imitation, matching and requests at a small table; high reinforcement.", "speech", 15),
      b("09:30", "Play block (NDBI)", "15 min floor play following the child’s lead; model and expand by one word.", "speech", 15),
      b("10:30", "Sensory diet: movement", "Trampoline, swing, crash pad; use before the next learning block.", "sensory", 30),
      b("12:00", "Lunch and toilet routine", "Picture sequence; scheduled toilet trips every 90–120 min.", "adl", 45),
      b("13:30", "Quiet time", "Dim room, deep-pressure cuddle, books; no screens.", "rest", 45),
      b("15:30", "Structured learning 2 + play block", "Two short 15-min blocks with a break in between.", "speech", 30),
      b("17:30", "Dinner and visual transition", "First–Then card; timer for waiting.", "behavior", 40),
      b("19:00", "Bath and bedtime wind-down", "Same order every night with pictures, calm music, deep pressure.", "sensory", 45),
    ],
  },

  /* ------------------------------ EARLY · L3 ------------------------------ */
  "early-level3": {
    summary:
      "Minimal or no spoken language and very limited initiation; safety, predictability and a first reliable way to communicate are the priorities.",
    dose: {
      structuredMinutesPerDay: 105,
      label: "≈90–120 min/day in many very short blocks",
      blocks: ["6–8 × 10–15 min blocks of play, communication and imitation", "Sensory-social routines throughout the day"],
      weekly: "Daily (≈10–12 hours structured, delivered in short bursts)",
      embedded: "Every routine (diaper/toilet, meals, bath, bed) includes one communication opportunity and one choice.",
    },
    speech: {
      headline: "Establish a first reliable way to communicate, in any modality",
      targets: [
        "Reliable request with a symbol, switch, gesture or sign approximation",
        "Orient to name and voice, and tolerate face-to-face play",
        "Imitate 5+ actions with objects",
        "Choose between two items (eye gaze, reach or touch)",
        "Reject or protest (“no”, “all done”) instead of aggression",
      ],
      ndbi: [
        "Sensory-social routines (swing, bubbles, tickles): pause and wait for ANY intentional signal",
        "Follow the child’s lead and mirror their sounds and movements",
        "Short, joyful 3–5 minute bursts, many times a day",
        "Reinforce each communication attempt immediately",
      ],
      manding: [
        "PECS Phase I: one adult prompts from behind, a second adult is the communication partner in front",
        "Use 3–5 super-preferred items; hold back briefly to create motivation",
        "Honour 100% of attempts within 2 seconds at first",
        "Teach “help”, “break”, “all done” with one symbol each",
      ],
      aac: [
        "PECS Phases I–II, or a single-message switch / 2–4-button device",
        "Partner-assisted scanning or eye-gaze if reaching is hard",
        "All adults model the same 10–20 core words with aided language input",
        "Never remove AAC as punishment",
      ],
    },
    behavior: {
      headline: "Safety, predictability and one functional replacement response",
      priorities: ["Safety around self-injury, elopement and aggression", "Teach one simple replacement (BREAK / HELP)", "Predictability through unchanging routines"],
      proactive: [
        "Keep the same routine in the same order daily with an object schedule",
        "Make the home safe: door alarms, padded corners, secured furniture",
        "Give free access to favourite items throughout the day (reduces the need for distress behavior)",
        "Teach the calming routine when the child is already calm",
      ],
    },
    sensory: {
      headline: "A rich, predictable sensory diet through the day",
      seeking: ["Weighted blanket or lap pad if approved by OT", "Swinging, rocking and rolling on a therapy ball", "Vibrating toys and chewy tubes", "Water, sand and rice bins"],
      avoiding: ["Quiet, dim spaces and ear defenders", "Predictable, low-smell environments", "Introduce new textures with ‘look, touch, smell’ steps only", "Avoid sudden touch; warn with a gesture first"],
      underResponsive: ["Strong, rhythmic movement (swing, bounce)", "Bright, light-up toys", "Crunchy or textured foods during snack", "Vibration or air-blown games"],
      regulation: ["Rocking or swinging before demands", "Deep-pressure routine (child-chosen)", "Same calm music for transitions and sleep"],
    },
    adl: {
      headline: "Partial participation in every routine, growing from the last step backward",
      skills: [
        { name: "Washing hands (hand-over-hand to independence)", steps: ["Go to the sink", "Turn on water", "Wet hands", "Pump soap", "Rub hands", "Rinse", "Turn off water", "Dry hands"] },
        { name: "Eating with a spoon", steps: ["Sit at the table", "Pick up spoon", "Scoop food", "Bring spoon to mouth", "Remove food with lips", "Put spoon down"] },
      ],
    },
    social: {
      headline: "Notice people, enjoy shared moments and take turns",
      goals: ["Look toward or move toward a familiar person for a game", "Tolerate and enjoy brief, close interactions", "Take one turn in a simple back-and-forth routine", "Show a clear preference between two people or activities"],
      strategies: ["Face-to-face sensory games with pause-and-wait", "Repeat the same songs and rhymes daily so the child can anticipate", "Praise every approach and eye contact moment with the child’s favourite sensory reward", "Short, quiet family time with a familiar person"],
    },
    routine: [
      b("07:00", "Wake and sensory start", "Deep pressure, soft music, object-schedule first step.", "sensory", 20),
      b("07:30", "Breakfast and requests", "Offer two foods; accept any intentional reach, look or card exchange.", "speech", 30),
      b("08:30", "Block 1: sensory-social play", "10–15 min swing, bubbles or tickles with pauses.", "social", 15),
      b("09:30", "Block 2: communication exchange", "PECS/switch practice with a favourite item; two adults.", "speech", 15),
      b("10:30", "Heavy-work and outdoors", "Wagon, climbing, swing; stay close for safety.", "sensory", 40),
      b("12:00", "Lunch and toileting routine", "Scheduled trips; picture sequence; partial participation.", "adl", 45),
      b("13:00", "Quiet time", "Dim room; weighted blanket if approved; soft music.", "rest", 60),
      b("15:00", "Block 3: imitation and choice", "Copy two actions; choose between two toys using gaze or touch.", "speech", 15),
      b("16:30", "Block 4: play and regulation", "Water, sand or rice bin; calm-down practice.", "sensory", 20),
      b("18:30", "Bath and bedtime wind-down", "Identical routine nightly, objects of reference, lullaby.", "sensory", 45),
    ],
  },

  /* ----------------------------- SCHOOL · L1 ------------------------------ */
  "school-level1": {
    summary:
      "Fluent speech, mainstream or lightly supported school; needs help with social reciprocity, flexibility, anxiety and organisation.",
    dose: {
      structuredMinutesPerDay: 45,
      label: "≈45 min/day after school + embedded practice",
      blocks: ["20 min social-pragmatic coaching", "15 min executive-function planning", "10 min flexibility and regulation practice"],
      weekly: "≈5 days/week (≈4 hours)",
      embedded: "Practise skills at family dinner conversations, chores and weekend outings.",
    },
    speech: {
      headline: "Pragmatics: conversation, perspective-taking and narrative language",
      targets: [
        "Keep a topic going for 4–5 turns, including follow-up questions",
        "Understand figurative language, jokes and basic sarcasm",
        "Perspective-taking: “What might they be thinking or feeling?”",
        "Retell events with beginning, middle and end",
        "Repair breakdowns (“Can you say that again?”)",
      ],
      ndbi: [
        "Start in the child’s special interests, then bridge to new topics",
        "Video modeling and role-play with feedback",
        "Comic Strip Conversations (Gray) to unpack social situations",
        "Peer-mediated practice with a trusted peer or sibling",
      ],
      manding: [
        "Mand for information (“Why…?”, “How do you…?”) and for help in school",
        "Advocacy mands: “I need a break”, “Can you explain that differently?”",
        "Request clarification instead of withdrawing",
      ],
      aac: [
        "Most children at this level do not need AAC; keep scripts and cue cards for anxiety-related silence",
        "Offer typing or text-to-speech as a fallback when speech fails under stress",
      ],
    },
    behavior: {
      headline: "Anxiety, perfectionism and after-school meltdowns",
      priorities: ["Anxiety, perfectionism and rigidity", "Peer conflict and unexpected changes", "Prevent after-school meltdowns (masking fatigue)"],
      proactive: [
        "30–45 minutes of decompression after school before any demands",
        "Teach a 5-point scale or Zones-style check-in for feelings",
        "Use social stories for upcoming changes",
        "Planned special-interest breaks as reinforcement",
      ],
    },
    sensory: {
      headline: "Sensory-friendly home and school toolkit",
      seeking: ["Trampoline, climbing, swimming or martial arts", "Fidget tools and resistance bands on chair legs", "Chewable jewellery or crunchy snacks", "Heavy-work chores (carrying groceries, vacuuming)"],
      avoiding: ["Noise-cancelling headphones for assemblies and lunch hall", "Seamless, tag-free uniform alternatives", "Sunglasses or cap for bright places", "Quiet lunch or library option"],
      underResponsive: ["Movement breaks every 30–40 min", "Alerting snacks (cold, crunchy)", "Standing desk or wobble cushion", "Upbeat music for morning routine"],
      regulation: ["Zones-style check-in chart", "Box breathing or 5-4-3-2-1 grounding", "Quiet corner with a ‘pass’ card to use at school"],
    },
    adl: {
      headline: "Organisation and personal independence",
      skills: [
        { name: "Packing the school bag", steps: ["Check tomorrow’s timetable", "Place homework in folder", "Put books in bag", "Pack water bottle and snack", "Check sports kit or special items", "Zip bag", "Put bag by the door"] },
        { name: "Making a sandwich", steps: ["Wash hands", "Get bread and fillings", "Put bread on plate", "Spread filling", "Add toppings", "Close the sandwich", "Cut and put on plate", "Clean up"] },
      ],
    },
    social: {
      headline: "Friendships, group work and social rules",
      goals: ["Join a group conversation or game", "Handle teasing and disagreement without escalating", "Take others’ perspectives in simple situations", "Maintain one or two friendships through shared interests"],
      strategies: ["Social-skills group or peer mentoring (PEERS-informed rules)", "Role-play common situations; review with video or comic strips", "Interest-based clubs (Lego, coding, chess, art)", "Practise “joining in” and “leaving politely” scripts"],
    },
    routine: [
      b("06:45", "Morning checklist", "Visual list: dress, breakfast, teeth, bag. Allow extra time for transitions.", "adl", 45),
      b("07:45", "Calm travel to school", "Predictable route, headphones if needed, preview of the day.", "sensory", 30),
      b("15:30", "Decompression", "Snack, quiet or movement break, no questions for 30 min.", "rest", 40),
      b("16:15", "Homework with breaks", "20–25 min blocks, timer and visual checklist.", "adl", 45),
      b("17:15", "Social-pragmatic coaching", "Role-play, video modeling or Comic Strip Conversation.", "speech", 20),
      b("17:45", "Special-interest time", "Planned reinforcement, can be a bridge to social learning.", "social", 30),
      b("18:30", "Family dinner and helper job", "Conversation practice: take turns, ask a follow-up question.", "social", 45),
      b("20:00", "Wind-down and tomorrow preview", "Screen-free time, reading, visual plan for tomorrow.", "rest", 60),
    ],
  },

  /* ----------------------------- SCHOOL · L2 ------------------------------ */
  "school-level2": {
    summary:
      "Speaks in phrases or short sentences, or uses AAC; needs substantial support for social communication, learning and daily living.",
    dose: {
      structuredMinutesPerDay: 75,
      label: "≈75 min/day structured + embedded practice",
      blocks: ["3 × 20 min (communication, functional skill, regulation/play)", "15 min homework adaptation and community practice"],
      weekly: "≈6 days/week (≈7–8 hours)",
      embedded: "Use the same words, symbols and prompts at home, school and in the community.",
    },
    speech: {
      headline: "Sentence-level communication with a robust system: request, comment and ask",
      targets: [
        "Combine 3–5 words (speech or SGD) to request, comment and protest",
        "Answer WH-questions about familiar routines",
        "Say “I need help / break / I don’t understand” independently",
        "Tell about my day with picture support",
        "Follow 2-step instructions",
      ],
      ndbi: [
        "Embedded teaching in preferred activities (cooking, art, games)",
        "Expand and recast the child’s utterances",
        "Visual scripts for conversation openers (“Hi, my name is…”)",
        "Reinforce spontaneous comments, not only answers",
      ],
      manding: [
        "Time-delay and progressive prompt fading toward independence",
        "Mand for information (“Where is…?”) with carrier-phrase cards",
        "Generalise across 3+ people and places",
      ],
      aac: [
        "High-tech SGD (e.g., Proloquo2Go, TouchChat, LAMP Words for Life) with core vocabulary and consistent motor plans",
        "PECS Phases IV–VI for sentence building and commenting if a card system works better",
        "Keep a low-tech backup board; all staff and family model the system",
      ],
    },
    behavior: {
      headline: "Reduce refusal and protests; teach self-regulation steps",
      priorities: ["Reduce task refusal and protest", "Increase tolerance for non-preferred tasks", "Teach self-regulation steps"],
      proactive: [
        "Token board plus visual schedule",
        "Let the child choose task order",
        "Break card always available",
        "Simple picture behaviour contract",
      ],
    },
    sensory: {
      headline: "Scheduled sensory diet with classroom and home tools",
      seeking: ["Scheduled movement breaks (jumping, wall push-ups) every 45–60 min", "Weighted lap pad or compression vest if OT advises", "Chewable tools and crunchy snacks", "Swinging or trampoline after school"],
      avoiding: ["Headphones for loud places", "Pre-teach new places with photos and visits", "Dim lights or a sunglasses option", "Quiet corner at school"],
      underResponsive: ["Alerting movement before work (jumping jacks)", "Textured and vibrating fidgets", "Fast, rhythmic music for morning tasks", "Cold drinks and crunchy snacks"],
      regulation: ["Visual regulation steps (stop, breathe, squeeze, ask)", "Deep-pressure routine before hard tasks", "Predictable calm-down area with 3–4 tools"],
    },
    adl: {
      headline: "Daily living with visual supports and prompt fading",
      skills: [
        { name: "Brushing teeth", steps: ["Get toothbrush", "Wet brush", "Add toothpaste", "Brush front teeth", "Brush sides", "Brush back teeth", "Spit", "Rinse and put away"] },
        { name: "Making cereal", steps: ["Get bowl", "Get cereal and pour", "Get milk and pour", "Get spoon", "Carry bowl to table", "Eat", "Put bowl in sink"] },
      ],
    },
    social: {
      headline: "Structured interaction with peers and familiar adults",
      goals: ["Greet familiar people with speech, SGD or a wave", "Take turns in games with 1 peer", "Join an activity with an adult prompt", "Show emotions with symbols (happy, sad, angry, tired)"],
      strategies: ["Peer-buddy sessions with visual rules and a clear end", "Cooperative activities (building, cooking, art)", "Video modeling of greetings and turn-taking", "Social stories for school events"],
    },
    routine: [
      b("06:45", "Visual morning routine", "Picture schedule: toilet, dress, breakfast, teeth, bag.", "adl", 50),
      b("07:45", "School travel", "Preview with picture; headphones; preferred item.", "sensory", 30),
      b("15:30", "Decompression and snack", "Quiet time, deep pressure, request snack by SGD/card.", "rest", 40),
      b("16:15", "Communication block", "20 min: requests, comments, WH-questions with preferred activities.", "speech", 20),
      b("16:45", "Sensory break", "Trampoline, swing or heavy work.", "sensory", 20),
      b("17:15", "Functional skill block", "Daily-living skill using backward chaining.", "adl", 20),
      b("18:00", "Dinner and helper job", "Set table with picture steps; practise requests at the table.", "adl", 45),
      b("19:00", "Play and social time", "Preferred play with family; turn-taking game.", "social", 30),
      b("20:00", "Wind-down", "Bath, story, calm music, same order daily.", "rest", 60),
    ],
  },

  /* ----------------------------- SCHOOL · L3 ------------------------------ */
  "school-level3": {
    summary:
      "Minimal or no functional speech; needs very substantial support for communication, behavior and self-care. AAC is essential.",
    dose: {
      structuredMinutesPerDay: 105,
      label: "≈90–120 min/day in 6–8 short blocks",
      blocks: ["6–8 × 10–15 min blocks of communication, choice-making and functional skills", "Embedded AAC modeling all day"],
      weekly: "Daily (≈10–12 hours structured)",
      embedded: "Every adult models the same core words in every routine.",
    },
    speech: {
      headline: "Make AAC the child’s voice: core vocabulary, consistent motor plans, many reasons to communicate",
      targets: [
        "Request, protest, greet and comment with 25–50 core symbols or buttons",
        "Choose between 2–3 options reliably (touch or gaze)",
        "Follow 1-step visually supported directions",
        "Answer yes/no with a partner-assisted or SGD response",
        "Use “help”, “break” and “stop” instead of behavior",
      ],
      ndbi: [
        "Sensory-social routines with pauses and waiting",
        "Aided language modeling during all routines",
        "Reinforce every functional attempt",
        "Expect slow vocabulary growth; keep opportunities frequent and low-demand",
      ],
      manding: [
        "PECS Phases I–IV or SGD “I want + item”",
        "Most-to-least prompting with backward fading of physical prompts",
        "Teach one new function at a time (request, then protest, then help)",
      ],
      aac: [
        "SGD with a consistent layout (don’t move buttons) and a keyguard if needed",
        "Partner-assisted scanning if motor skills limit access",
        "Core board posted in every room",
        "SLP review every 3–6 months with trial data",
      ],
    },
    behavior: {
      headline: "Safety, function-based support and predictable transitions",
      priorities: ["Reduce aggression and self-injury through functional communication training", "Support changes of routine (school, travel)", "Transition support (car, school, bath)"],
      proactive: [
        "Detailed visual or object schedule",
        "Scheduled sensory breaks every 30–45 min",
        "Preferred items available throughout the day (noncontingent reinforcement)",
        "All caregivers use the same de-escalation script",
      ],
    },
    sensory: {
      headline: "High-frequency, predictable sensory regulation",
      seeking: ["Swinging, rocking, bouncing", "Deep-pressure vest, blanket or squeezes (as agreed with OT)", "Vibration and chewy tubes", "Water, sand, rice bins"],
      avoiding: ["Quiet, low-light retreat space", "Ear defenders and sunglasses", "Warn before touch; one-step visual preview", "Avoid crowded, unpredictable places at peak times"],
      underResponsive: ["Strong rhythmic movement before tasks", "Textured, vibrating or bright toys", "Alerting snacks (crunchy, cold)", "Fast songs with movement"],
      regulation: ["Scheduled sensory breaks (not only after distress)", "Same calm-down tool kit in each setting", "Deep-pressure and rocking routine, child-chosen"],
    },
    adl: {
      headline: "Toileting, dressing and eating with partial participation",
      skills: [
        { name: "Toileting routine", steps: ["Walk to bathroom", "Lower pants", "Sit on toilet", "Stay seated (1–2 min)", "Wipe", "Pull up pants", "Flush", "Wash hands"] },
        { name: "Putting on a T-shirt", steps: ["Hold shirt with tag at back", "Put head through the neck", "Put one arm through", "Put the other arm through", "Pull shirt down"] },
      ],
    },
    social: {
      headline: "Shared moments and meaningful connection",
      goals: ["Show clear preference for familiar people", "Take a turn in a back-and-forth routine", "Greet or say goodbye with gesture, symbol or SGD", "Participate in a group activity for 2–5 minutes"],
      strategies: ["Predictable, short, joyful social routines", "Peer-buddy sessions with a clear visual start and end", "Shared sensory activities (music, bubbles)", "Teach the same greeting to everyone in the child’s life"],
    },
    routine: [
      b("06:45", "Sensory start", "Deep pressure, soft music; object schedule for the morning.", "sensory", 25),
      b("07:15", "Breakfast and requests", "SGD or card to request food and drink; offer two choices.", "speech", 30),
      b("07:45", "School travel", "Preview card, preferred item, headphones.", "behavior", 30),
      b("15:30", "Decompression", "Quiet space, preferred item, no demands for 30 min.", "rest", 40),
      b("16:15", "Block 1: communication", "10–15 min SGD/PECS practice with a favourite activity.", "speech", 15),
      b("16:45", "Block 2: sensory break", "Swing, trampoline or heavy work.", "sensory", 15),
      b("17:15", "Block 3: daily-living chain", "Backward chaining in toileting or dressing.", "adl", 15),
      b("18:00", "Dinner and helper job", "Request food; carry a plate; scheduled toilet trip.", "adl", 45),
      b("19:00", "Block 4: social play", "Music or bubbles; take turns with a parent or sibling.", "social", 20),
      b("20:00", "Bedtime routine", "Bath, story, same order every night, deep pressure.", "rest", 60),
    ],
  },

  /* ------------------------------ TEEN · L1 ------------------------------- */
  "teen-level1": {
    summary:
      "Verbal and often academically capable; needs support with friendships, flexibility, anxiety, executive function and independence.",
    dose: {
      structuredMinutesPerDay: 40,
      label: "≈30–45 min/day coaching + embedded practice",
      blocks: ["15 min social and self-advocacy coaching", "15 min planning and executive-function check-in", "10 min wellbeing and regulation check"],
      weekly: "≈5 days/week (≈3–4 hours)",
      embedded: "Real-life practice: ordering food, phone calls, cooking dinner, planning weekend.",
    },
    speech: {
      headline: "Advanced pragmatics, self-advocacy and relationship skills",
      targets: [
        "Start, keep and leave conversations with peers",
        "Read tone, sarcasm and unwritten social rules",
        "Handle disagreement, teasing and peer pressure safely",
        "Self-advocate for accommodations (“I work better with…”)",
        "Online communication safety and etiquette",
      ],
      ndbi: [
        "Natural-environment practice in clubs and interest groups",
        "Role-play and video feedback (with the teen’s consent)",
        "PEERS-informed rules of social etiquette and friendship skills",
      ],
      manding: [
        "Ask for accommodations and clarification at school or work",
        "Ask for help early, before shutdown",
        "Practise “No, thank you” and boundary scripts",
      ],
      aac: [
        "AAC not typically needed; offer typing or text-to-speech for stress shutdowns",
        "Phone scripts and cue cards for appointments and interviews",
      ],
    },
    behavior: {
      headline: "Anxiety, burnout, masking fatigue and emotional regulation",
      priorities: ["Anxiety, low mood and school avoidance (clinical review if persistent)", "Burnout and masking recovery", "Managing emotions in relationships"],
      proactive: [
        "Collaborative problem-solving rather than commands",
        "Protect daily down-time",
        "Build a coping toolkit (grounding, exercise, music)",
        "Early-warning plan with a trusted adult; ask your clinician about mood and anxiety screening",
      ],
    },
    sensory: {
      headline: "Self-managed sensory toolkit",
      seeking: ["Running, cycling, gym or martial arts", "Weighted blanket or hoodie", "Chewing gum or crunchy snacks", "Music with strong beats"],
      avoiding: ["Noise-cancelling earbuds", "Quiet lunch and study spaces", "Clothing choices without tags or seams", "Plan breaks in crowded or bright places"],
      underResponsive: ["Scheduled activity breaks", "Cold showers or face splash for alerting", "Standing desk", "Strong flavours in snacks"],
      regulation: ["Exercise as regulation", "Box breathing and grounding", "A written “when I’m overloaded I need…” card"],
    },
    adl: {
      headline: "Independent living skills for adulthood",
      skills: [
        { name: "Doing laundry", steps: ["Sort clothes", "Load washer", "Add detergent", "Choose cycle and start", "Move clothes to dryer", "Fold clothes", "Put clothes away"] },
        { name: "Cooking pasta", steps: ["Wash hands", "Fill pot with water", "Boil water", "Add pasta and set timer", "Drain pasta", "Add sauce", "Serve", "Clean up"] },
      ],
    },
    social: {
      headline: "Friendship, dating safety, identity and community",
      goals: ["Build 1–2 reciprocal friendships", "Handle conflict and disagreements calmly", "Understand privacy, consent and online safety", "Participate in school, work or community groups"],
      strategies: ["PEERS-informed group or coaching", "Interest-based clubs and volunteering", "Rehearse “what if” scenarios for safety", "Teach disclosure choices and self-advocacy"],
    },
    routine: [
      b("06:45", "Wake and prepare", "Checklist on phone: hygiene, dress, breakfast, pack.", "adl", 45),
      b("07:30", "Travel to school or college", "Predictable route; headphones; arrival plan.", "sensory", 30),
      b("15:45", "Decompression", "Snack, music, quiet or exercise; no demands for 30–45 min.", "rest", 45),
      b("16:30", "Planning and homework", "Weekly planner; break tasks into 25-min blocks.", "adl", 60),
      b("17:45", "Social-pragmatic coaching", "Role-play, conversation practice or review of the day’s interactions.", "speech", 15),
      b("18:30", "Cook or help with dinner", "Practise a recipe; use a visual recipe card.", "adl", 45),
      b("19:30", "Interest, friends or exercise", "Special interest, gaming with friends, or sport.", "social", 60),
      b("21:00", "Wind-down", "Screen-free hour, shower, tomorrow’s plan.", "rest", 60),
    ],
  },

  /* ------------------------------ TEEN · L2 ------------------------------- */
  "teen-level2": {
    summary:
      "Uses phrases, sentences or AAC; needs substantial support with communication, safety, daily living and community participation.",
    dose: {
      structuredMinutesPerDay: 75,
      label: "≈75 min/day structured + community practice",
      blocks: ["20 min communication and functional academics", "20 min daily-living skill chain", "20 min community or vocational practice", "15 min leisure and regulation"],
      weekly: "≈6 days/week (≈7–8 hours)",
      embedded: "Use real settings: shops, cafés, library, bus. Real-life practice teaches more than role-play.",
    },
    speech: {
      headline: "Functional communication for independence: advocacy, safety and community use",
      targets: [
        "Order food or shop using speech or SGD",
        "State needs: pain, toilet, hunger, break, “I’m upset”",
        "Give personal information (name, caregiver phone)",
        "Express choices about clothes, activities and people",
        "Tell a trusted adult if something is wrong or someone hurt them",
      ],
      ndbi: [
        "Natural-environment teaching in the community",
        "Age-respectful, interest-based activities",
        "Reinforce initiation, not only responses",
      ],
      manding: [
        "Mand for help and clarification in new settings",
        "Teach “I need space” and “stop” to peers",
        "Time-delay and fading across community staff",
      ],
      aac: [
        "Age-appropriate SGD vocabulary with personalised fringe words (hobbies, friends)",
        "Phone-based AAC and a wallet card with instructions for communication partners",
        "Teach an emergency phrase and an “about me” page",
      ],
    },
    behavior: {
      headline: "Reduce aggression and refusal while protecting dignity and choice",
      priorities: ["Reduce aggression and refusal in age-appropriate ways", "Increase routine participation through choice", "Respect autonomy and dignity"],
      proactive: [
        "Offer adult-style choices and visual agendas",
        "Use high-interest reinforcers (music, outings)",
        "Check for medical causes: pain, sleep, puberty-related changes",
        "Plan for puberty: hygiene, privacy, body changes",
      ],
    },
    sensory: {
      headline: "Age-appropriate sensory routines in home and community",
      seeking: ["Walking, cycling, swimming, gym circuits", "Weighted blanket or hoodie (OT-approved)", "Chewing gum or crunchy snacks", "Music and vibration"],
      avoiding: ["Ear defenders or earbuds in public", "Plan trips outside peak times", "Choose predictable clothing", "Visual preview of new places"],
      underResponsive: ["Heavy work (carrying, gardening)", "Scheduled movement breaks", "Strong flavours and cold drinks", "Rhythmic music for tasks"],
      regulation: ["Scheduled breaks, not only after distress", "Visual calm-down steps", "Preferred calming object kept in a pocket or bag"],
    },
    adl: {
      headline: "Personal care and home-living skills with visual supports",
      skills: [
        { name: "Showering", steps: ["Get towel and clothes", "Turn on water and check temperature", "Wet body", "Use shampoo", "Wash body with soap", "Rinse", "Turn off water", "Dry with towel", "Dress"] },
        { name: "Making a microwave meal", steps: ["Wash hands", "Get meal from fridge", "Remove outer packaging", "Put in microwave", "Set time", "Press start", "Take out with oven gloves", "Eat", "Clean up"] },
      ],
    },
    social: {
      headline: "Community participation, safety and relationships",
      goals: ["Greet and respond in community settings", "Take part in a group leisure activity", "Learn body safety, privacy and consent", "Identify safe people to ask for help"],
      strategies: ["Community-based instruction with supported peers", "Special Olympics, clubs or day-programme activities", "Role-play and social stories on privacy and safety", "Practise travel routes and routines with visual supports"],
    },
    routine: [
      b("06:45", "Morning routine with visual list", "Toilet, hygiene, dress, breakfast; teen leads each step with prompts.", "adl", 60),
      b("08:00", "School, day programme or college", "Preview schedule; carry AAC and ID/emergency card.", "social", 420),
      b("15:30", "Decompression", "Snack, music, quiet space; request by SGD.", "rest", 40),
      b("16:15", "Communication and functional academics", "Money, time, reading signs, SGD practice (20 min).", "speech", 20),
      b("16:45", "Daily-living skill chain", "Backward chaining: laundry, cooking or hygiene.", "adl", 20),
      b("17:30", "Community or vocational practice", "Shop trip, café order, volunteering, or a household job.", "social", 30),
      b("18:30", "Dinner with helper job", "Set table, serve; request items using speech or SGD.", "adl", 45),
      b("20:00", "Leisure and wind-down", "Music, video or walk; calming bedtime routine.", "rest", 90),
    ],
  },

  /* ------------------------------ TEEN · L3 ------------------------------- */
  "teen-level3": {
    summary:
      "Minimal speech; needs very substantial support across daily living, communication and safety. Transition-to-adulthood planning is central.",
    dose: {
      structuredMinutesPerDay: 105,
      label: "≈90–120 min/day across home and community",
      blocks: ["4–6 × 10–20 min AAC and choice-making blocks", "30 min daily-living routine with chaining", "30 min community-based or vocational sampling"],
      weekly: "Daily (≈10–12 hours structured)",
      embedded: "Every support person models AAC and honours every communication attempt.",
    },
    speech: {
      headline: "Dignified, robust AAC for choice, consent and safety",
      targets: [
        "Make choices and express preferences through the day (SGD, switch, eye gaze)",
        "Say “yes”, “no”, “stop”, “help”, “hurt” and “break”",
        "Greet and say goodbye appropriately",
        "Indicate pain or illness using pictures or a body map",
        "Take part in transition planning through preferences and person-centred planning",
      ],
      ndbi: [
        "Interest-based sensory-social routines adapted for age (music, vibration)",
        "Partner-assisted aided language input in the community",
        "Acknowledge every communication attempt",
      ],
      manding: [
        "Mand for items and activities, plus “more” and “all done”",
        "Choice-making across 3+ options",
        "Prompt fading with trained support staff",
      ],
      aac: [
        "SGD with a consistent layout and an access method matched to motor skills (touch, eye gaze, switch scanning)",
        "Emergency communication card and medical passport",
        "Train every support person to model and respond",
      ],
    },
    behavior: {
      headline: "Safety, medical review and dignity-first support",
      priorities: ["Safety around size and strength: aggression, self-injury, elopement", "Check for pain and medical causes first", "Dignified, low-restraint environment"],
      proactive: [
        "Regular medical review: pain, GI, sleep, seizures",
        "Predictable routine and object or visual schedules",
        "Preferred age-appropriate activities daily",
        "Staff trained in de-escalation; individual crisis plan agreed with the clinical team",
      ],
    },
    sensory: {
      headline: "A daily, age-appropriate sensory plan with predictable regulation",
      seeking: ["Swinging, rocking, hammock", "Weighted blanket or deep-pressure routine (OT-approved)", "Vibration and music", "Water, sand and textured bins"],
      avoiding: ["Calm, low-light retreat room", "Ear defenders and sunglasses", "Plan outings off-peak with a visual preview", "Warn before touch"],
      underResponsive: ["Rhythmic movement and drumming", "Fast music with movement", "Alerting snacks and cold drinks", "Textured fidgets"],
      regulation: ["Scheduled sensory breaks every 30–45 min", "Same calm kit in every setting", "Deep pressure or rocking chosen by the individual"],
    },
    adl: {
      headline: "Toileting, hygiene and dressing with partial participation",
      skills: [
        { name: "Toileting and hygiene", steps: ["Go to the bathroom", "Lower trousers", "Sit on toilet", "Wait", "Wipe", "Stand and pull trousers up", "Flush", "Wash and dry hands"] },
        { name: "Dressing: pullover and trousers", steps: ["Lay clothes out", "Put pullover over head", "Pull arms through", "Pull pullover down", "Sit and put legs into trousers", "Stand and pull up", "Fasten waistband"] },
      ],
    },
    social: {
      headline: "Connection, community presence and personal choice",
      goals: ["Choose preferred people and activities", "Take part in group activity for 5–10 minutes", "Greet familiar community members", "Express comfort or discomfort clearly"],
      strategies: ["Community-based instruction in familiar places", "Shared activity routines (music, walks, gardening)", "Consistent staff and a communication passport", "Person-centred planning meetings that include the young person’s preferences"],
    },
    routine: [
      b("07:00", "Wake and sensory start", "Deep pressure, music; object schedule for the day.", "sensory", 30),
      b("07:30", "Personal care with chaining", "Toileting, washing, dressing; teen completes the last step.", "adl", 60),
      b("08:30", "Breakfast and choice-making", "Two or three choices with SGD, gaze or touch.", "speech", 30),
      b("09:30", "Day programme or school", "Carry AAC, communication passport and emergency card.", "social", 360),
      b("16:00", "Decompression", "Quiet space, preferred music; no demands.", "rest", 40),
      b("16:45", "AAC and choice block", "10–15 min communication with a preferred activity.", "speech", 15),
      b("17:15", "Community or vocational sampling", "Short, supported outing or household job.", "social", 30),
      b("18:15", "Dinner and helper job", "Request food; partial participation in set-up or clean-up.", "adl", 45),
      b("20:00", "Bedtime routine", "Same order nightly, calming sensory input.", "rest", 60),
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Prognosis content, tailored by age group × support level                     */
/* Timelines are typical, not guarantees. Every child's pace is different.       */
/* -------------------------------------------------------------------------- */

const TIER_A_LABEL = "Tier A: Strong Support (Function-Based & Naturalistic)";
const TIER_B_LABEL = "Tier B: Comfort, Regulation & Adaptive Participation";

const BEHAVIOR_STEPS: Record<AgeGroup, string[]> = {
  early: [
    "Give a 2-minute heads-up with a visual timer, then show a First–Then card (“First shoes, then park”).",
    "Before the child is upset, offer the replacement request (break card, sign or word) and honour it straight away.",
    "Give the promised item or praise within 2–3 seconds of a calm transition.",
    "If distress happens, jot one quick ABC note in the tracker; do not problem-solve in the moment.",
  ],
  school: [
    "Preview the visual schedule each morning and flag any change in advance.",
    "Break one hard task into a short chunk, then offer an earned break from the child’s own break menu.",
    "Follow with specific praise or a token right after the chunk is done.",
    "Add one ABC note when something hard happens, and review the pattern weekly.",
  ],
  teen: [
    "Plan the day together: let the teen choose the order of tasks where possible.",
    "Agree a discreet break signal (cue card, phone timer, or a phrase) and always honour it.",
    "Use short, specific feedback privately rather than in front of others.",
    "Hold a 5-minute weekly check-in: what helped, what didn’t, what to change.",
  ],
};

const BEHAVIOR_DOSE: Record<SupportLevel, string> = {
  level1: "3 short practice moments a day, 5–10 minutes each (about 20 minutes total), built into existing routines such as leaving the house, mealtimes and bedtime.",
  level2: "4 embedded practice blocks of about 10 minutes (about 40 minutes total) plus visuals available all day. Aim for 5–10 chances to use the break or request signal daily.",
  level3: "5–6 very short blocks of 5–10 minutes (about 45 minutes total), with the replacement signal honoured every time at first. Keep the daily routine as predictable as possible.",
};

const BEHAVIOR_FIRST: Record<SupportLevel, string> = {
  level1: "A slightly shorter gap between the warning and moving on, or less protest at one or two transitions a day. Small changes count.",
  level2: "The child touches or reaches for the break card (even with a prompt) earlier in the build-up, or settles a little sooner after using it.",
  level3: "Brief moments of looking at or reaching for the symbol or object, and calming a little faster after the signal is honoured.",
};

const BEHAVIOR_TIMELINE: Record<SupportLevel, { weeks4to12: string; months3to6: string; milestone: string }> = {
  level1: {
    weeks4to12: "Transitions that used to stall now take a prompt or two. The child begins to use the break request before the peak of distress.",
    months3to6: "Several daily transitions go smoothly with visuals alone, and waiting or hearing “not now” is tolerated more often.",
    milestone: "3 of 5 daily transitions with one prompt or fewer, and the ABC tracker shows shorter or less frequent episodes.",
  },
  level2: {
    weeks4to12: "The child uses the break signal on their own at least once a day and accepts a short wait (5–10 seconds) before a break or item.",
    months3to6: "The signal replaces most of the earlier distress behavior in the main routines, and the wait can be lengthened step by step.",
    milestone: "Independent break or request use in 3 or more daily situations, with fewer episodes that need adult safety support.",
  },
  level3: {
    weeks4to12: "Reaching for or handing over the symbol happens with light prompting, and recovery after distress becomes quicker.",
    months3to6: "The child uses one dependable signal in the most important routines, and episodes are shorter or less intense.",
    milestone: "One reliable, honoured request signal used across two or more settings, with a clearly shorter recovery time in the tracker.",
  },
};

const SPEECH_STEPS: Record<AgeGroup, string[]> = {
  early: [
    "Sit face-to-face at eye level and follow what the child is already interested in.",
    "Copy their action or sound, then add one small new thing (“car” → “red car”).",
    "Create a reason to ask: clear containers, small portions or a “forgotten” spoon. Wait 5 seconds with an expectant look.",
    "Model, then offer a light prompt, and give the item straight away so asking feels worthwhile.",
  ],
  school: [
    "Choose one favourite activity (game, building, snack prep) and make it a daily communication slot.",
    "Model one step up from where the child is (a sign or picture becomes a word, a word becomes two).",
    "Pause and wait before helping so the child has time to start.",
    "Use the same words and pictures at home and school so the child hears one consistent system.",
  ],
  teen: [
    "Pick topics and activities the teen cares about, and offer genuine choices.",
    "Model age-appropriate messages on the device or in words, without testing or quizzing.",
    "Wait for the teen to start before helping, and accept any form of communication as a real message.",
    "Practise short, real-life requests (ordering food, asking for help or a break) in actual settings.",
  ],
};

const SPEECH_LEVEL_STEP: Record<SupportLevel, string> = {
  level1: "Spoken language is the main route. Keep a pocket picture or text option for stressful moments.",
  level2: "Use speech together with signs, pictures or a device, and model on the device while you talk.",
  level3: "Treat AAC (pictures, objects, switch or device) and gesture as the main voice. Model on it throughout the day, even when the child does not respond.",
};

const SPEECH_DOSE: Record<SupportLevel, string> = {
  level1: "3 play blocks of 15–20 minutes (about 60 minutes) plus 15–20 communication chances inside each daily routine.",
  level2: "3 blocks of about 20 minutes plus 10–15 modelled or tempted communication chances in each routine (meals, bath, dressing, outings).",
  level3: "4 short blocks of 10–15 minutes plus AAC modelled during all routines. Frequent, tiny chances work better than a single long session.",
};

const SPEECH_FIRST: Record<SupportLevel, string> = {
  level1: "More checking back: glancing at your face after an action, sharing a toy or pointing to show you something.",
  level2: "More eye gaze toward you or the board, reaching toward the picture or device, or copying a sound or sign.",
  level3: "More looking at you or at the symbols, touching or reaching for the AAC option, and staying with you for a few seconds longer.",
};

const SPEECH_TIMELINE: Record<SupportLevel, { weeks4to12: string; months3to6: string; milestone: string }> = {
  level1: {
    weeks4to12: "More frequent spontaneous comments and requests, longer back-and-forth turns in play.",
    months3to6: "Longer sentences and more questions asked and answered, with joint attention seen across settings.",
    milestone: "5 or more joint-attention acts (pointing, showing, giving) in a 10-minute play block and a new 3–4-word phrase used spontaneously.",
  },
  level2: {
    weeks4to12: "The child makes requests with a word, sign, picture or device with decreasing prompts.",
    months3to6: "A growing set of 10–20 reliable requests and the first two-step combinations (“want + item”).",
    milestone: "At least 3 consistent requests used without prompts in different routines, tracked in the Requesting practice tracker (80% independent across 3 sessions).",
  },
  level3: {
    weeks4to12: "The child begins to choose between two options on request and touches or reaches for the AAC option with light help.",
    months3to6: "A few dependable requests (food, play, break, “more”) are made with minimal prompting.",
    milestone: "2–3 requests made independently with the same system at home and in one other setting.",
  },
};

const SENSORY_STEPS: Record<AgeGroup, string[]> = {
  early: [
    "Offer heavy-work play before a demanding moment (carrying a laundry basket, wall pushes, animal walks, pushing a small cart).",
    "Let the child choose between two movement or pressure options and keep sessions playful.",
    "Offer a quiet, low-input corner with soft items after noisy or busy events.",
    "Note which activities the child enjoys and which help calm, and repeat those at the same times each day.",
  ],
  school: [
    "Add a short movement or heavy-work break before homework or other demanding tasks (wall push-ups, carrying books, chair push-ups).",
    "Build a small sensory menu with the child (chewy, fidget, headphones, weighted lap pad) that they can choose from.",
    "Schedule one calming activity after school before any demands.",
    "Share the same menu with school so the child has the same options in both places.",
  ],
  teen: [
    "Co-create a self-regulation toolkit with the teen (exercise, resistance bands, headphones, a quiet space, preferred music).",
    "Build movement into the day at set points, such as a walk, gym session or chores with resistance.",
    "Let the teen decide when to use each tool and keep it discreet and age-respectful.",
    "Review weekly what helped and replace what didn’t.",
  ],
};

const SENSORY_DOSE: Record<SupportLevel, string> = {
  level1: "2–3 sessions a day of 5–10 minutes (about 20 minutes), timed before the tasks that are hardest.",
  level2: "3–4 sessions a day of about 10 minutes (about 40 minutes), plus a calming option available on request.",
  level3: "4–6 short sessions of 5–10 minutes, with sensory options freely available throughout the day. Agree amounts and equipment with the child’s occupational therapist.",
};

const SENSORY_FIRST: Record<SupportLevel, string> = {
  level1: "Faster calming after heavy work (for example settling in about 5 minutes instead of 15) or starting a task with less resistance.",
  level2: "Quicker recovery after an activity and the child begins choosing a favourite sensory activity without being prompted.",
  level3: "A calmer body after heavy work, such as softer muscle tone, easier breathing or less distress for a short while afterwards.",
};

const SENSORY_TIMELINE: Record<SupportLevel, { weeks4to12: string; months3to6: string; milestone: string }> = {
  level1: {
    weeks4to12: "Fewer overload build-ups around noise, crowds or busy days, and easier starts to demanding tasks.",
    months3to6: "The child asks for or chooses a regulation tool on their own and recovers from overload sooner.",
    milestone: "A self-chosen regulation tool used at least once on most days, with recovery time in the tracker shortened by about a third.",
  },
  level2: {
    weeks4to12: "Predictable daily sensory slots reduce afternoon or after-school distress for many children.",
    months3to6: "The child requests a preferred sensory activity (picture, sign or word) and accepts some new sensory experiences.",
    milestone: "Child requests or selects a sensory break at least once daily and tolerates one previously avoided input with support.",
  },
  level3: {
    weeks4to12: "Calmer periods after heavy work and fewer long-lasting distress episodes linked to sensory overload.",
    months3to6: "Better participation in key routines (meals, hygiene, travel) because discomfort is anticipated and eased.",
    milestone: "One or two key routines (e.g. tooth-brushing or travel) completed with less distress using a planned sensory preparation.",
  },
};

function buildPrognosis(age: AgeGroup, level: SupportLevel): Record<PrognosisPillar, Prognosis> {
  return {
    behavior: {
      evidence: {
        tier: "A",
        label: TIER_A_LABEL,
        note: "Function-based positive behaviour support and communication training have strong support for building skills and reducing distress by meeting the need behind the behavior.",
      },
      home: { steps: BEHAVIOR_STEPS[age], dosage: BEHAVIOR_DOSE[level] },
      firstEffect: BEHAVIOR_FIRST[level],
      timeline: BEHAVIOR_TIMELINE[level],
      maintenance: {
        lasting:
          "Replacement skills tend to hold when the child’s needs keep being met and the skill keeps being used and honoured. They are strengthened by daily use, not “finished” after a set number of weeks.",
        regression: [
          "Extinction burst (weeks 1–2): when an old behavior stops getting the same result, it can briefly get louder or more frequent before it settles. Keep honouring the new request signal and keep everyone safe. If there is any risk of injury, pause the plan and contact your behavior analyst.",
          "Illness, poor sleep, pain, or big changes (new school, new sibling, travel) can bring older behaviors back for a while. This is a signal for more support, not a failure. Return to an easier step and rebuild.",
          "Situational mutism or reduced speech can appear when the child is unwell or overloaded. Offer a non-speaking way to communicate and expect speech to return once the load eases.",
        ],
        ongoing:
          "Keep visuals, breaks and the request signal in place as long as they help, and fade them slowly. Plan a quick “booster” week of extra practice after any setback.",
      },
      assent:
        "“No” and “break” are always valid messages and are respected. Never suppress harmless stimming (hand-flapping, rocking, scripting, humming); only redirect if it is unsafe. If the child says no, or shows early distress (covering ears, pulling away, going quiet, rising vocal tone), stop the demand, give the break, and return to an easier step. Respecting these signals makes it safer for the child to try again. " +
        (age === "teen"
          ? "Involve the teen in setting goals and keep plans dignified and age-respectful."
          : age === "early"
            ? "At this age, watch body language closely and pause early, before the peak."
            : "Offer the child real choices within each task and let them help pick the break menu."),
    },
    speech: {
      evidence: {
        tier: "A",
        label: TIER_A_LABEL,
        note: "Naturalistic developmental behavioral interventions (NDBIs) and AAC have strong support for building communication. AAC does not prevent speech.",
      },
      home: { steps: [...SPEECH_STEPS[age], SPEECH_LEVEL_STEP[level]], dosage: SPEECH_DOSE[level] },
      firstEffect: SPEECH_FIRST[level],
      timeline: SPEECH_TIMELINE[level],
      maintenance: {
        lasting:
          "Communication skills usually stay once they are learned and used, and grow when partners keep modelling and responding. They are retained best when practised across people and places.",
        regression: [
          "Speech or signing can drop during illness, pain, anxiety or overload (situational mutism). This is reduced access to a skill, not lost ability. Keep AAC or another way to communicate available and avoid pressure to “say it”.",
          "Skills can look uneven: a child may use a word one day and not the next. Keep modelling and avoid treating it as a test.",
          "Big changes (new school, therapist change, moves) can pause progress for several weeks. Re-use the earlier steps and pictures to rebuild confidence.",
        ],
        ongoing:
          "Keep modelling and keep AAC available for as long as it helps, including after speech grows. Review goals every 3 months with the speech and language therapist.",
      },
      assent:
        "Any form of communication counts: words, signs, pictures, device use, gaze, pushing away. Treat “no” as a real answer and honour it. Never force eye contact (“look at me”), never withhold AAC to make a child speak, and never hold back favourite items just to provoke speech. Follow the child’s lead, and stop or switch to a favourite activity if they turn away, become distressed, or disengage. Harmless stimming and scripting are communication or regulation and are not to be stopped.",
    },
    sensory: {
      evidence: {
        tier: "B",
        label: TIER_B_LABEL,
        note: "Sensory tools and heavy-work routines support comfort, regulation and participation in daily activities. They do not treat core autism traits, and the research for them is more limited than for Tier A approaches.",
      },
      home: { steps: SENSORY_STEPS[age], dosage: SENSORY_DOSE[level] },
      firstEffect: SENSORY_FIRST[level],
      timeline: SENSORY_TIMELINE[level],
      maintenance: {
        lasting:
          "Benefits last while the routine continues. A sensory diet works like nutrition or exercise: it helps while you keep doing it, and its effects fade if it stops.",
        regression: [
          "Needs change with growth, puberty, stress, illness and seasons, so an activity that worked may need replacing. This is normal.",
          "Pain, constipation, poor sleep and infections can look like sensory difficulty. If distress rises suddenly, check with your paediatrician before changing the plan.",
          "Some children’s sensory tolerance varies day to day. Keep the options available rather than expecting a steady response.",
        ],
        ongoing:
          "Plan the sensory routine as a long-term part of the day and review it with the occupational therapist every 3–6 months or when the child’s needs change.",
      },
      assent:
        "The child chooses and can stop at any time. Never force touch, brushing, pressure or any sensory input. Stop the moment there are signs of distress (pulling away, tensing, crying, covering ears or eyes, going quiet). Stimming such as flapping, rocking or spinning is a valid way to regulate and is not suppressed unless it is unsafe; offer more options rather than taking it away. Introduce brushing, weighted items or compression only under occupational therapist guidance.",
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Assemble the full 3×3 matrix                                                */
/* -------------------------------------------------------------------------- */

function build(age: AgeGroup, level: SupportLevel): ClinicalProfile {
  const key = profileKey(age, level);
  const raw = RAW[key];
  return {
    key,
    age,
    level,
    title: `${AGE_META[age].label} · ${LEVEL_META[level].short}`,
    summary: raw.summary,
    dose: raw.dose,
    speech: raw.speech,
    behavior: {
      ...raw.behavior,
      replacement: REPLACEMENT_BY_LEVEL[level],
      replacementNote: REPLACEMENT_AGE_NOTE[age],
      meltdown: MELTDOWN_BY_LEVEL[level],
      tantrum: TANTRUM_BY_LEVEL[level],
    },
    sensory: raw.sensory,
    adl: raw.adl,
    social: raw.social,
    routine: raw.routine,
    prognosis: buildPrognosis(age, level),
  };
}

export const CLINICAL_MATRIX: Record<ProfileKey, ClinicalProfile> = Object.fromEntries(
  AGE_GROUPS.flatMap((age) =>
    SUPPORT_LEVELS.map((level) => [profileKey(age, level), build(age, level)] as const),
  ),
) as Record<ProfileKey, ClinicalProfile>;

export const ALL_PROFILES: ClinicalProfile[] = AGE_GROUPS.flatMap((age) =>
  SUPPORT_LEVELS.map((level) => CLINICAL_MATRIX[profileKey(age, level)]),
);

export function getProfile(age: AgeGroup, level: SupportLevel): ClinicalProfile {
  return CLINICAL_MATRIX[profileKey(age, level)];
}

/* -------------------------------------------------------------------------- */
/* Home environment                                                            */
/* -------------------------------------------------------------------------- */

export const ENVIRONMENT_POINTS: { id: string; title: string; why: string }[] = [
  { id: "visual", title: "Visual structure station", why: "Predictability lowers anxiety and builds independence." },
  { id: "calm", title: "Calm and regulation corner", why: "A safe, low-demand place to recover without punishment." },
  { id: "sensory", title: "Low-sensory light, sound and smell", why: "Reducing background load leaves more capacity for learning." },
  { id: "safety", title: "Safety and elopement proofing", why: "Safe spaces prevent injury and let adults relax and teach." },
  { id: "communication", title: "Communication access everywhere", why: "A child can only use a voice that is always within reach." },
  { id: "learning", title: "Learning table and reward storage", why: "A consistent work spot and visible rewards support motivation." },
];

export const ENVIRONMENT_AGE_TIPS: Record<AgeGroup, string[]> = {
  early: [
    "Mount a low-height picture schedule by the door and the kitchen; velcro cards the child can move.",
    "Use a pop-up tent or beanbag corner with 2–3 favourite items and a 3-step picture routine.",
    "Warm bulbs, rugs and soft furnishings; cover echoing hard floors; unplug noisy gadgets.",
    "Cover sockets, anchor furniture, add latches and door chimes; use a gate at stairs and kitchen.",
    "Place core-word boards at child height: kitchen, bathroom, play area, car.",
    "Use a low table with 2 chairs, a bin per activity and a rewards box that the child can see but not open.",
  ],
  school: [
    "Wall-mounted schedule with morning, after-school and bedtime sequences, plus a ‘today’ strip.",
    "Quiet corner with headphones, books, fidget kit and a ‘pass’ card to use at home and school.",
    "Dimmable lamps; noise-cancelling headphones; scent-free cleaning products.",
    "Door and window alarms for elopement risk; secure medicines and chemicals; label safe spaces.",
    "Keep SGD charged and in reach; laminated core boards on fridge and bathroom wall.",
    "Desk away from windows or the TV, with a visual checklist and a token board in view.",
  ],
  teen: [
    "Wall planner or phone calendar with colour-coded routines; checklists on the bathroom mirror.",
    "Private space with headphones, weighted blanket, music and a ‘do not disturb’ sign.",
    "Dimmable lights, white-noise or music, minimal clutter, and a quiet study corner.",
    "Teach safe habits: ID card, emergency numbers, door and window safety, stove safety; privacy for hygiene.",
    "Phone-based AAC or text-to-speech plus a wallet card; clear signage for key household items.",
    "Dedicated workspace and a visible reward or goal chart for independence skills.",
  ],
};

export const ENVIRONMENT_LEVEL_TIPS: Record<SupportLevel, string[]> = {
  level1: [
    "Add a weekly planner so the child can see changes in advance.",
    "Teach them to request the calm corner independently.",
    "Let the child choose lighting and sound levels where possible.",
    "Review online and community safety rules together.",
    "Keep text-to-speech or scripts available for stress moments.",
    "Use a simple checklist for homework and chores.",
  ],
  level2: [
    "Use picture-and-word schedules with ‘finished’ pockets.",
    "Pre-teach the calm corner routine when the child is calm; honour requests for it quickly.",
    "Remove unnecessary visual clutter; use a consistent layout.",
    "Alarm or lock doors and windows; use secure play areas.",
    "Place the AAC system in every room; model it often.",
    "Use a token board and a timer at the learning table.",
  ],
  level3: [
    "Use an object or tactile schedule and a very small number of steps.",
    "Make the calm space soft, safe and quiet, and supervised at all times.",
    "Keep sensory load minimal and consistent from day to day.",
    "Use safety-first design: padded corners, secured furniture, tamper-resistant fittings, locked hazards; supervise closely.",
    "Offer partner-assisted and switch-based communication in every room.",
    "Keep sessions short; keep favourite items visible for requests.",
  ],
};

/* -------------------------------------------------------------------------- */
/* Token board presets                                                         */
/* -------------------------------------------------------------------------- */

export interface BoardItemPreset {
  label: string;
  emoji: string;
}

export const BOARD_PRESETS: Record<
  AgeGroup,
  { tasks: BoardItemPreset[]; rewards: BoardItemPreset[]; bigReward: BoardItemPreset }
> = {
  early: {
    tasks: [
      { label: "Wash hands", emoji: "🧼" },
      { label: "Shoes on", emoji: "👟" },
      { label: "Play dough", emoji: "🎨" },
      { label: "Tidy toys", emoji: "🧸" },
      { label: "Eat lunch", emoji: "🍎" },
    ],
    rewards: [
      { label: "Bubbles", emoji: "🫧" },
      { label: "Song", emoji: "🎵" },
      { label: "Tickles", emoji: "😄" },
    ],
    bigReward: { label: "Park time", emoji: "🛝" },
  },
  school: {
    tasks: [
      { label: "Brush teeth", emoji: "🦷" },
      { label: "Homework", emoji: "📚" },
      { label: "Tidy room", emoji: "🧹" },
      { label: "Set table", emoji: "🍽️" },
      { label: "Pack bag", emoji: "🎒" },
    ],
    rewards: [
      { label: "Tablet 10 min", emoji: "📱" },
      { label: "Lego", emoji: "🧱" },
      { label: "Snack", emoji: "🍪" },
    ],
    bigReward: { label: "Family movie", emoji: "🎬" },
  },
  teen: {
    tasks: [
      { label: "Shower", emoji: "🚿" },
      { label: "Homework", emoji: "📚" },
      { label: "Laundry", emoji: "🧺" },
      { label: "Help cook", emoji: "🍳" },
      { label: "Take a walk", emoji: "🚶" },
    ],
    rewards: [
      { label: "Music", emoji: "🎧" },
      { label: "Gaming 20 min", emoji: "🎮" },
      { label: "Favourite drink", emoji: "🥤" },
    ],
    bigReward: { label: "Outing of choice", emoji: "🚲" },
  },
};

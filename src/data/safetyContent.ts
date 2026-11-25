/**
 * Safety content: co-occurring screen, treatments to avoid, red flags, provider questions.
 * Educational and aligned with the direction of NICE CG170 (autism in under 19s: support and
 * management), NICE CG142 (autism in adults) and American Academy of Pediatrics guidance.
 * It is not medical advice. Always check current guidance with your child's clinician.
 */

export interface CheckItem {
  id: string;
  title: string;
  prompts: string[];
  raise: string;
}

export const CO_OCCURRING: CheckItem[] = [
  {
    id: "sleep",
    title: "Sleep disturbance",
    prompts: [
      "Takes more than 30–45 minutes to fall asleep most nights",
      "Wakes often or for long periods in the night",
      "Very early waking, snoring, pauses in breathing or restless legs",
    ],
    raise: "Ask about a sleep assessment, sleep routine support and whether a medical cause needs checking.",
  },
  {
    id: "gi",
    title: "Stomach & bowel (GI) problems, feeding restrictions",
    prompts: [
      "Constipation, loose stools, belly pain, reflux, or pain around toileting",
      "Eats a very narrow range of foods, refuses whole food groups, or has gagging or choking at meals",
      "Weight loss, poor growth, or signs of low iron or other deficiencies",
    ],
    raise: "Ask for a GI and growth check, and a referral to a feeding therapist or dietitian before any food is removed.",
  },
  {
    id: "anxiety",
    title: "Anxiety or low mood",
    prompts: [
      "Frequent worry, fear of specific situations, clinging, or panic-like episodes",
      "Rituals that increase when stressed, school refusal, avoidance",
      "Withdrawal, loss of interest, changes in appetite or sleep",
    ],
    raise: "Ask about an anxiety and mood assessment and therapy adapted for autistic children (such as adapted CBT).",
  },
  {
    id: "adhd",
    title: "ADHD (attention and activity)",
    prompts: [
      "Very short attention that is out of step with the child’s other abilities",
      "Constant, driven movement, or acting without stopping to think, across home and school",
      "Difficulty waiting or finishing tasks that the child wants to do",
    ],
    raise: "Ask for an ADHD assessment. Autism and ADHD can occur together and need separate supports.",
  },
  {
    id: "epilepsy",
    title: "Seizures or epilepsy",
    prompts: [
      "Staring spells that do not respond to touch or voice",
      "Sudden jerks, stiffening, or unexplained falls",
      "Unusual episodes followed by confusion or sleepiness",
    ],
    raise: "Ask for a neurology review. Film any episode on your phone. Call emergency services for a seizure lasting more than 5 minutes.",
  },
  {
    id: "pain",
    title: "Hidden pain or discomfort",
    prompts: [
      "New or sudden increase in distress, self-injury, head-banging or irritability",
      "Touching the ear, jaw or belly, refusing to chew, or a changed posture",
      "Dental problems, ear infections, constipation, reflux or period pain that may be hard to tell you about",
    ],
    raise: "Ask for a full check (ears, teeth, bowels, skin, bones) when behavior changes suddenly, before assuming it is behavioural.",
  },
];

export const CO_OCCURRING_NOTE =
  "Medical treatments are used for co-occurring conditions such as seizures, sleep problems, ADHD or anxiety. They do not treat the core features of autism, which is a lifelong neurodevelopmental difference that needs support, skill-building and communication access.";

export interface AvoidItem {
  id: string;
  name: string;
  claim: string;
  why: string;
}

export const AVOID: AvoidItem[] = [
  {
    id: "chelation",
    name: "Chelation or “detox”",
    claim: "Claims that removing metals or toxins improves autism.",
    why: "No evidence of benefit, and it can cause serious harm, including dangerous drops in calcium and deaths. Autism is not caused by heavy-metal poisoning.",
  },
  {
    id: "hbot",
    name: "Hyperbaric oxygen therapy (HBOT)",
    claim: "Breathing oxygen under pressure to “repair” the brain.",
    why: "Trials show no benefit for autism, and it carries risks (ear and sinus injury, seizures, fire). It is also expensive.",
  },
  {
    id: "secretin",
    name: "Secretin infusions",
    claim: "A gut hormone given by injection to improve communication or behavior.",
    why: "Well-designed trials found it no better than placebo. It involves needles and cost with no proven gain.",
  },
  {
    id: "diets",
    name: "Restrictive diets as an autism treatment (GFCF, ketogenic)",
    claim: "Removing gluten, dairy or most carbohydrates to treat autism.",
    why: "Evidence does not show they change core autism features, and restricting foods can worsen nutrition in children who are already selective eaters. A diet is only appropriate for a confirmed medical reason (such as coeliac disease or allergy) and with a dietitian.",
  },
  {
    id: "fc",
    name: "Facilitated communication (and similar “touch-based” methods)",
    claim: "A helper supports the child’s hand or arm to type or point.",
    why: "Controlled testing shows the messages come from the helper, not the child. It can lead to false accusations and takes away the child’s real voice. Genuine AAC is the child’s own selection, with the child’s own movement.",
  },
  {
    id: "supplements",
    name: "Unapproved supplements, “biomedical” protocols and unregulated products",
    claim: "Megadose vitamins, probiotics, camel milk, bleach-type products, stem cells and similar.",
    why: "No reliable evidence of benefit, products can be contaminated or toxic, and some can cause harm. Check any supplement with your paediatrician or pharmacist, especially if the child has a medical need for a particular vitamin or mineral.",
  },
  {
    id: "offlabel",
    name: "Off-label leucovorin or bumetanide without a confirmed medical indication",
    claim: "Drugs promoted online as autism treatments.",
    why: "Leucovorin may be appropriate for a specific confirmed condition (such as cerebral folate deficiency) when a specialist has tested for it. Bumetanide did not show benefit for autism in large trials. Medicines should be started and monitored by a doctor for a clear reason, not bought from a website or clinic selling a “protocol”.",
  },
];

export const RED_FLAGS: { id: string; text: string }[] = [
  { id: "r1", text: "Promises a “cure”, “recovery” or to “reverse” autism." },
  { id: "r2", text: "Says one single cause (toxins, gut, vaccines, metals) explains all autism." },
  { id: "r3", text: "Relies on testimonials and before-and-after stories instead of published research." },
  { id: "r4", text: "Claims “doctors don’t want you to know” or says mainstream medicine is hiding it." },
  { id: "r5", text: "Sells the tests, supplements and treatment all from the same place." },
  { id: "r6", text: "Requires large up-front payment, long contracts or refuses to give costs in writing." },
  { id: "r7", text: "Dismisses the child’s distress, or says a child must “push through” to succeed." },
  { id: "r8", text: "Is unwilling to share data, qualifications, or to work with your child’s other professionals." },
];

export const PROVIDER_QUESTIONS: { group: string; items: { id: string; text: string }[] }[] = [
  {
    group: "Goals",
    items: [
      { id: "g1", text: "What measurable, functional goals will you set (for example “asks for a break in 3 settings”), and how were they chosen with us and our child?" },
      { id: "g2", text: "How will we know in 8–12 weeks whether this is helping, and what will you change if it is not?" },
    ],
  },
  {
    group: "Child assent & dignity",
    items: [
      { id: "a1", text: "How do you respect our child’s “no”, and what do you do if they show distress or want to stop?" },
      { id: "a2", text: "Do you allow harmless stimming and avoid forcing eye contact or compliance for its own sake?" },
      { id: "a3", text: "Do you teach and honour communication, including AAC, from the start?" },
    ],
  },
  {
    group: "Data & progress",
    items: [
      { id: "d1", text: "What data do you collect, how often will you share it, and can we see raw notes?" },
      { id: "d2", text: "How do you plan to fade support and hand skills over to us, school and the child?" },
    ],
  },
  {
    group: "Recommended hours",
    items: [
      { id: "h1", text: "How many hours a week do you recommend and why? What does the evidence say about this amount for a child like ours?" },
      { id: "h2", text: "How will therapy fit with sleep, play, family time and school without burning out our child?" },
    ],
  },
  {
    group: "Evidence base",
    items: [
      { id: "e1", text: "What research supports this method for children like ours? Is it consistent with national guidelines (such as NICE or AAP)?" },
      { id: "e2", text: "What are the known risks, side effects or downsides?" },
    ],
  },
  {
    group: "Qualifications & teamwork",
    items: [
      { id: "q1", text: "What are your qualifications, registration and supervision arrangements?" },
      { id: "q2", text: "Will you coordinate with our paediatrician, speech therapist, OT and school?" },
    ],
  },
  {
    group: "Costs",
    items: [
      { id: "c1", text: "Can you give a written breakdown of all costs, including assessments, materials and review sessions?" },
      { id: "c2", text: "What is the cancellation and refund policy, and are we free to stop at any time?" },
    ],
  },
];

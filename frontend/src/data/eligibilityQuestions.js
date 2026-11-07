/**
 * ─────────────────────────────────────────────────────────────────────────────
 * eRaktKosh / MoHFW Donor Eligibility Screening Questionnaire
 * Source: Ministry of Health and Family Welfare (MoHFW), Government of India
 * National Blood Transfusion Council (NBTC) / eRaktKosh Centralized Portal
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ELIGIBILITY_QUESTIONS = [
  {
    id: 1,
    question: "Are you currently taking any medication (e.g., antibiotics, blood thinners)?",
    rationale: "Certain medications, such as antibiotics or blood thinners, can affect the quality and safety of donated blood.",
    expectedAnswer: "no",
    category: "Medication & Health",
    guidance: "Most antibiotics require a 48–72 hour deferral after your final dose before you can safely donate."
  },
  {
    id: 2,
    question: "Are you between 18 to 65 years of age?",
    rationale: "For your safety, there are minimum and maximum ages for blood donation. The minimum age is 18 and the maximum age is 65 for first-time donors.",
    expectedAnswer: "yes",
    category: "Age Requirement",
    guidance: "Statutory blood donation guidelines in India require donors to be between 18 and 65 years old."
  },
  {
    id: 3,
    question: "Is your body weight at least 45 kg?",
    rationale: "For safe blood donation, your body must have enough blood volume to recover quickly after donating. A minimum weight of 45 kg ensures that you can donate without putting yourself at risk of weakness or complications.",
    expectedAnswer: "yes",
    category: "Body Weight",
    guidance: "Standard whole blood collection (350ml or 450ml) requires at least 45 kg to protect the donor from hypovolemia."
  },
  {
    id: 4,
    question: "Have you had any infection, fever, cold, cough, weakness, dizziness, or fatigue today?",
    rationale: "If you're feeling unwell, your body needs its resources to recover, and donating blood may worsen your condition.",
    expectedAnswer: "no",
    category: "Current Symptoms",
    guidance: "You should be fully recovered and symptom-free for at least 7 to 14 days before donating."
  },
  {
    id: 5,
    question: "Have you undergone any surgery or major dental procedure recently (last 6–12 months)?",
    rationale: "Recent surgeries or major dental work may involve infections, healing wounds, or medication use that make donation unsafe.",
    expectedAnswer: "no",
    category: "Surgical History",
    guidance: "Major surgeries typically require a 6–12 month deferral period to allow full physiological recovery."
  },
  {
    id: 6,
    question: "Did you have at least 6 hours of sleep last night?",
    rationale: "Adequate rest before donation ensures your body is in a stable condition, helping you avoid dizziness or fatigue afterward.",
    expectedAnswer: "yes",
    category: "Rest & Sleep",
    guidance: "Sufficient sleep stabilizes your blood pressure and reduces the chance of dizziness or fainting."
  },
  {
    id: 7,
    question: "Did you eat a light (non-oily) meal 2–3 hours before donating?",
    rationale: "Eating a light, non-oily meal before donating helps maintain stable blood sugar and reduces the risk of dizziness during or after donation.",
    expectedAnswer: "yes",
    category: "Pre-Donation Nutrition",
    guidance: "Avoid donating on an empty stomach. Stay hydrated with water or fruit juice and eat a healthy light snack."
  },
  {
    id: 8,
    question: "Have you had any tattoos, piercings, or acupuncture in the last 6 months?",
    rationale: "These procedures may carry a risk of infections like hepatitis or HIV if done with unsterile equipment.",
    expectedAnswer: "no",
    category: "Body Art & Invasions",
    guidance: "A standard 6-month deferral is observed to guard against the window period of blood-borne viral infections."
  },
  {
    id: 9,
    question: "Have you consumed alcohol in the last 24 hours?",
    rationale: "Alcohol affects hydration levels, blood composition, and judgment, making blood donation unsafe. It can also impair the quality of the donated blood.",
    expectedAnswer: "no",
    category: "Substances & Hydration",
    guidance: "Please wait at least 24 hours after your last alcoholic drink and ensure you are thoroughly rehydrated."
  }
];

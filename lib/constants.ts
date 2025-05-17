export const defaultCriteria = [
  {
    id: "criterion_1",
    name: "Innovation",
    description: "How original and innovative is the solution?",
    weight: 1,
    min: 1,
    max: 10,
  },
  {
    id: "criterion_2",
    name: "Technical Implementation",
    description: "How well is the solution technically implemented?",
    weight: 1,
    min: 1,
    max: 10,
  },
  {
    id: "criterion_3",
    name: "Impact",
    description: "How impactful is the solution for the target audience?",
    weight: 1,
    min: 1,
    max: 10,
  },
];

export const defaultInvestmentCriteria = [
  {
    id: "investor_decision",
    name: "Investment Decision",
    description: "Would you invest in this company?",
    weight: 1,
    type: "choice",
    options: ["invest", "pass", "maybe"],
    min: 0,
    max: 1,
  },
  {
    id: "interest_level",
    name: "Interest Level",
    description: "How interested are you in this company?",
    weight: 1,
    type: "scale",
    min: 0,
    max: 5,
  },
];

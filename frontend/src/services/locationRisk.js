export const RISK_CATEGORIES = [
  { key: "low", label: "Low", minScore: 0, color: "#378154" },
  { key: "moderate", label: "Moderate", minScore: 25, color: "#b28b24" },
  { key: "high", label: "High", minScore: 50, color: "#d97832" },
  { key: "critical", label: "Critical", minScore: 75, color: "#c14f48" },
];

export const RISK_SCORING_RULES = {
  conditionBaselines: {
    Normal: 10,
    "Needs Monitoring": 40,
    Critical: 80,
  },
  typeAdjustments: {
    "Drainage Point": 10,
    "Drainage Outlet": 10,
    "Water Body": 5,
    Pond: 5,
  },
  unknownConditionBaseline: 25,
};

export function assessLocationRisk(location) {
  const conditionScore = Object.hasOwn(
    RISK_SCORING_RULES.conditionBaselines,
    location.condition,
  )
    ? RISK_SCORING_RULES.conditionBaselines[location.condition]
    : RISK_SCORING_RULES.unknownConditionBaseline;
  const typeAdjustment =
    RISK_SCORING_RULES.typeAdjustments[location.type] || 0;
  const score = Math.min(100, Math.max(0, conditionScore + typeAdjustment));
  const category = [...RISK_CATEGORIES]
    .reverse()
    .find((riskCategory) => score >= riskCategory.minScore);

  return { score, category };
}

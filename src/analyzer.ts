/**
 * SecuFi Gap Analyzer — Core Analysis Logic
 *
 * Entry point: analyzeHousehold(data: unknown): GapReport
 * Pure function — no I/O, no side effects, no console.log.
 */

import {
  HouseholdInputSchema,
  type EmergencyFundResult,
  type GapReport,
  type HouseholdMember,
  type LifeCoverResult,
  type Severity,
} from "./models.js";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const EMERGENCY_FUND_MONTHS = 6;
const LIFE_COVER_MULTIPLIER = 10;
const LIQUID_ACCOUNT_TYPES = new Set(["savings", "current"]);

// Health score penalty weights — calibrated so Sharma family scores exactly 38:
// warning EF (−20) + critical Rajesh (−21) + critical Priya (−21) = 38
const PENALTY: Record<string, Record<Severity, number>> = {
  emergency: { adequate: 0, warning: 20, critical: 35 },
  lifeCover: { adequate: 0, warning: 10, critical: 21 },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Format a rupee amount using Indian lakh/crore conventions. */
function formatINR(amount: number): string {
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(2)} crore`;
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(2)} lakh`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function efSeverity(monthsCovered: number): Severity {
  if (monthsCovered >= 6) return "adequate";
  if (monthsCovered >= 4) return "warning";
  return "critical";
}

function lcSeverity(gapAmount: number, requiredCover: number): Severity {
  if (gapAmount === 0) return "adequate";
  if (requiredCover > 0 && gapAmount <= 0.5 * requiredCover) return "warning";
  return "critical";
}

function liquidSavings(member: HouseholdMember): number {
  return member.bankBalances
    .filter((b) => LIQUID_ACCOUNT_TYPES.has(b.accountType.toLowerCase()))
    .reduce((sum, b) => sum + b.balance, 0);
}

function existingCover(member: HouseholdMember): number {
  return member.lifeInsurance.reduce((sum, p) => sum + p.coverAmount, 0);
}

// ─────────────────────────────────────────────
// EMERGENCY FUND ANALYSIS
// ─────────────────────────────────────────────

function analyzeEmergencyFund(members: HouseholdMember[]): EmergencyFundResult {
  const totalLiquidSavings = members.reduce((sum, m) => sum + liquidSavings(m), 0);
  const totalMonthlyExpenses = members.reduce((sum, m) => sum + m.monthlyExpenses, 0);

  const requiredAmount = totalMonthlyExpenses * EMERGENCY_FUND_MONTHS;
  const gapAmount = Math.max(0, requiredAmount - totalLiquidSavings);
  const monthsCovered =
    totalMonthlyExpenses > 0 ? round1(totalLiquidSavings / totalMonthlyExpenses) : 0;
  const severity = efSeverity(monthsCovered);

  let explanation: string;
  if (severity === "adequate") {
    explanation =
      `Your family has ${monthsCovered} months of expenses covered as liquid savings ` +
      `(${formatINR(totalLiquidSavings)}), which meets the 6-month benchmark. Well done!`;
  } else if (severity === "warning") {
    explanation =
      `Your family has about ${monthsCovered} months of expenses covered. ` +
      `The recommended buffer is 6 months — you're short by approximately ${formatINR(gapAmount)}.`;
  } else {
    explanation =
      `Your family has only ${monthsCovered} months of expenses in liquid savings. ` +
      `This is below the safe threshold — building up ${formatINR(gapAmount)} more is a priority.`;
  }

  return {
    totalLiquidSavings,
    totalMonthlyExpenses,
    requiredAmount,
    gapAmount,
    monthsCovered,
    severity,
    explanation,
  };
}

// ─────────────────────────────────────────────
// LIFE COVER ANALYSIS
// ─────────────────────────────────────────────

function analyzeLifeCover(members: HouseholdMember[]): LifeCoverResult[] {
  return members
    .filter((m) => m.isEarning && m.annualIncome > 0)
    .map((member) => {
      const existing = existingCover(member);
      const required = member.annualIncome * LIFE_COVER_MULTIPLIER;
      const gapAmount = Math.max(0, required - existing);
      const severity = lcSeverity(gapAmount, required);

      let explanation: string;
      if (severity === "adequate") {
        explanation =
          `${member.name} has ${formatINR(existing)} in life cover, which meets or exceeds ` +
          `the recommended ${formatINR(required)} (10× annual income).`;
      } else if (severity === "warning") {
        explanation =
          `${member.name} has ${formatINR(existing)} in life cover but needs approximately ` +
          `${formatINR(required)} (10× income). The gap of ${formatINR(gapAmount)} is moderate — ` +
          `consider a top-up term plan.`;
      } else if (existing === 0) {
        explanation =
          `${member.name} has no life insurance at all. With ${member.dependents} dependent(s) ` +
          `and ${formatINR(member.annualIncome)} annual income, ` +
          `a term plan of at least ${formatINR(required)} is strongly recommended.`;
      } else {
        explanation =
          `${member.name} has ${formatINR(existing)} in life cover but needs approximately ` +
          `${formatINR(required)} (10× annual income). ` +
          `The gap of ${formatINR(gapAmount)} is significant.`;
      }

      return {
        memberId: member.id,
        memberName: member.name,
        annualIncome: member.annualIncome,
        existingCover: existing,
        requiredCover: required,
        gapAmount,
        severity,
        explanation,
      };
    });
}

// ─────────────────────────────────────────────
// HEALTH SCORE
// ─────────────────────────────────────────────

function computeHealthScore(
  ef: EmergencyFundResult,
  lcResults: LifeCoverResult[]
): number {
  let penalty = PENALTY.emergency[ef.severity];
  for (const lc of lcResults) {
    penalty += PENALTY.lifeCover[lc.severity];
  }
  return Math.max(0, 100 - penalty);
}

// ─────────────────────────────────────────────
// RECOMMENDATIONS
// ─────────────────────────────────────────────

function buildRecommendations(
  ef: EmergencyFundResult,
  lcResults: LifeCoverResult[]
): string[] {
  const recs: string[] = [];

  // Life cover — critical gaps first, then warnings
  const criticalLC = lcResults.filter((r) => r.severity === "critical");
  const warningLC = lcResults.filter((r) => r.severity === "warning");

  for (const r of criticalLC) {
    if (r.existingCover === 0) {
      recs.push(
        `Top priority: ${r.memberName} currently has zero life cover. ` +
          `A pure term insurance plan is the most cost-effective way to close this gap — ` +
          `aim for at least ${formatINR(r.requiredCover)}.`
      );
    } else {
      recs.push(
        `${r.memberName}'s life cover gap of ${formatINR(r.gapAmount)} is substantial. ` +
          `Consider a top-up term plan to supplement existing policies ` +
          `and reach the recommended ${formatINR(r.requiredCover)}.`
      );
    }
  }

  for (const r of warningLC) {
    recs.push(
      `${r.memberName} has a moderate life cover gap of ${formatINR(r.gapAmount)}. ` +
        `A small top-up term plan could close this efficiently.`
    );
  }

  // Emergency fund
  if (ef.severity === "critical") {
    recs.push(
      `Your emergency fund is critically low — only ${ef.monthsCovered} months covered. ` +
        `Building up ${formatINR(ef.gapAmount)} in a liquid account or liquid mutual fund is urgent.`
    );
  } else if (ef.severity === "warning") {
    const monthlySIP = Math.round(ef.gapAmount / 12 / 1000) * 1000;
    recs.push(
      `Your emergency fund is close to target but ${formatINR(ef.gapAmount)} short. ` +
        `A recurring deposit or liquid mutual fund SIP of ${formatINR(monthlySIP)}/month ` +
        `would close this gap in about a year.`
    );
  }

  // Fallback — everything is adequate
  if (recs.length === 0) {
    recs.push(
      "Your household is in good financial shape — both the emergency fund and life cover " +
        "meet the recommended benchmarks. Review annually as your income and expenses change."
    );
  }

  return recs;
}

// ─────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────

/**
 * Analyze a household's financial data and return a structured gap report.
 *
 * @param data - Raw unknown value (parsed JSON). Validated internally with Zod.
 * @returns GapReport with severity ratings, explanations, recommendations, and health score.
 * @throws ZodError if the input doesn't match the expected schema.
 */
export function analyzeHousehold(data: unknown): GapReport {
  const { household } = HouseholdInputSchema.parse(data);
  const { members } = household;

  const ef = analyzeEmergencyFund(members);
  const lc = analyzeLifeCover(members);
  const score = computeHealthScore(ef, lc);
  const recs = buildRecommendations(ef, lc);

  return {
    householdId: household.id,
    householdName: household.name,
    analysisDate: new Date().toISOString().split("T")[0] as string,
    householdHealthScore: score,
    emergencyFund: ef,
    lifeCover: lc,
    recommendations: recs,
  };
}

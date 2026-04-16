/**
 * SecuFi Gap Analyzer — Zod Schemas & Inferred Types
 *
 * All types are derived from Zod schemas via z.infer<>.
 * No duplicate interface/type definitions.
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// INPUT SCHEMAS
// ─────────────────────────────────────────────

export const BankBalanceSchema = z.object({
  bank: z.string(),
  accountType: z.string(), // "savings" | "current" | others possible
  balance: z.number().min(0),
});

export const LifeInsurancePolicySchema = z.object({
  provider: z.string(),
  type: z.string(), // "term" | "endowment" | "ULIP" | etc.
  coverAmount: z.number().min(0),
  annualPremium: z.number().min(0),
});

export const HouseholdMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  relation: z.string(),
  age: z.number().int().min(0),
  isEarning: z.boolean(),
  annualIncome: z.number().min(0).default(0),
  monthlyExpenses: z.number().min(0).default(0),
  dependents: z.number().int().min(0).default(0),
  bankBalances: z.array(BankBalanceSchema).default([]),
  lifeInsurance: z.array(LifeInsurancePolicySchema).default([]),
}).transform((member) => ({
  ...member,
  // Normalize: non-earners always have 0 income regardless of what was passed
  annualIncome: member.isEarning ? member.annualIncome : 0,
}));

export const HouseholdSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(HouseholdMemberSchema).min(1),
});

export const HouseholdInputSchema = z.object({
  household: HouseholdSchema,
});

// ─────────────────────────────────────────────
// OUTPUT SCHEMAS
// ─────────────────────────────────────────────

export const SeveritySchema = z.enum(["adequate", "warning", "critical"]);

export const EmergencyFundResultSchema = z.object({
  totalLiquidSavings: z.number(),
  totalMonthlyExpenses: z.number(),
  requiredAmount: z.number(),
  gapAmount: z.number().min(0),
  monthsCovered: z.number(),
  severity: SeveritySchema,
  explanation: z.string(),
});

export const LifeCoverResultSchema = z.object({
  memberId: z.string(),
  memberName: z.string(),
  annualIncome: z.number(),
  existingCover: z.number(),
  requiredCover: z.number(),
  gapAmount: z.number().min(0),
  severity: SeveritySchema,
  explanation: z.string(),
});

export const GapReportSchema = z.object({
  householdId: z.string(),
  householdName: z.string(),
  analysisDate: z.string(), // ISO date "YYYY-MM-DD"
  householdHealthScore: z.number().int().min(0).max(100),
  emergencyFund: EmergencyFundResultSchema,
  lifeCover: z.array(LifeCoverResultSchema),
  recommendations: z.array(z.string()).min(1),
});

// ─────────────────────────────────────────────
// INFERRED TYPES
// ─────────────────────────────────────────────

export type BankBalance = z.infer<typeof BankBalanceSchema>;
export type LifeInsurancePolicy = z.infer<typeof LifeInsurancePolicySchema>;
export type HouseholdMember = z.infer<typeof HouseholdMemberSchema>;
export type Household = z.infer<typeof HouseholdSchema>;
export type HouseholdInput = z.infer<typeof HouseholdInputSchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type EmergencyFundResult = z.infer<typeof EmergencyFundResultSchema>;
export type LifeCoverResult = z.infer<typeof LifeCoverResultSchema>;
export type GapReport = z.infer<typeof GapReportSchema>;

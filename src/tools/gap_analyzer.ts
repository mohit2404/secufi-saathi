/**
 * SecuFi — Gap Analyzer Tool
 *
 * Wraps the core analyzeHousehold function as a Groq-compatible tool.
 * Exports: the tool definition (schema) and the executor (runs the function).
 */

import { analyzeHousehold } from "../analyzer.js";
import type { GapReport } from "../models.js";

// ── Tool definition (what we send to Groq) ────────────────────────────────────

export const gapAnalyzerToolDefinition = {
  type: "function" as const,
  function: {
    name: "analyze_household",
    description:
      "Analyzes a household's financial protection status. Calculates emergency fund coverage, life insurance gaps for each earning member, and produces a household health score (0–100). Call this when the user provides household financial data (incomes, expenses, savings, insurance) or asks if their family is adequately protected.",
    parameters: {
      type: "object",
      properties: {
        household: {
          type: "object",
          description: "The household to analyze",
          properties: {
            id: { type: "string", description: "Unique household identifier, e.g. 'sharma-family'" },
            name: { type: "string", description: "Household name, e.g. 'Sharma Household'" },
            members: {
              type: "array",
              description: "All household members (earning and non-earning)",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", description: "Member ID, e.g. 'm1'" },
                  name: { type: "string", description: "Member's full name" },
                  relation: { type: "string", description: "Relation to head: self, spouse, son, daughter, father, mother, etc." },
                  age: { type: "number", description: "Age in years" },
                  isEarning: { type: "boolean", description: "Whether this member has income" },
                  annualIncome: { type: "number", description: "Annual income in INR (0 for non-earners)" },
                  monthlyExpenses: { type: "number", description: "Monthly expenses in INR attributed to this member" },
                  dependents: { type: "number", description: "Number of dependents relying on this member's income" },
                  bankBalances: {
                    type: "array",
                    description: "Bank accounts with liquid savings",
                    items: {
                      type: "object",
                      properties: {
                        bank: { type: "string" },
                        accountType: { type: "string", description: "savings, current, or fd" },
                        balance: { type: "number" },
                      },
                      required: ["bank", "accountType", "balance"],
                    },
                  },
                  lifeInsurance: {
                    type: "array",
                    description: "Life insurance policies held by this member",
                    items: {
                      type: "object",
                      properties: {
                        provider: { type: "string" },
                        type: { type: "string", description: "term, endowment, ULIP, whole-life, group" },
                        coverAmount: { type: "number", description: "Sum assured in INR" },
                        annualPremium: { type: "number", description: "Annual premium in INR" },
                      },
                      required: ["provider", "type", "coverAmount", "annualPremium"],
                    },
                  },
                },
                required: ["id", "name", "relation", "age", "isEarning", "monthlyExpenses"],
              },
            },
          },
          required: ["id", "name", "members"],
        },
      },
      required: ["household"],
    },
  },
};

// ── Tool executor ─────────────────────────────────────────────────────────────

export function runGapAnalyzer(args: unknown): GapReport {
  return analyzeHousehold(args);
}

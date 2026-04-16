---
name: indian-insurance-basics
description: Load this skill when a user asks detailed questions about insurance concepts specific to India — such as the difference between term, endowment, and ULIP policies; how riders work (critical illness, accidental death, waiver of premium); how the claim settlement process works in India; what IRDAI regulates; how to read or compare a policy document; or what terms like sum assured, maturity benefit, free-look period, grace period, or nomination mean. Also load when a user asks why their LIC or endowment policy may not provide adequate protection, or what "pure protection" means. Do NOT load for general financial planning questions, emergency fund calculations, life cover gap analysis, or investment strategy — those are handled by the analyzeHousehold tool and the agent's base knowledge.
---

# Indian Insurance Basics

## Regulatory Context

- Insurance in India is regulated by **IRDAI** (Insurance Regulatory and Development
  Authority of India), a statutory body under the Ministry of Finance.
- All insurers selling products in India must be IRDAI-registered.
- Insurance agents and brokers must hold a valid IRDAI license — users should always
  verify their agent's credentials.
- The **Insurance Ombudsman** is a free, quasi-judicial grievance redressal mechanism
  for policyholders. There are Ombudsman offices in major cities across India. Worth
  mentioning if a user has a dispute or rejected claim.

---

## Types of Life Insurance

### 1. Term Insurance (Pure Protection)
- Pays the **sum assured** to the nominee **only if the insured dies** during the policy term.
- **No maturity benefit** if the insured survives the term (unless it's a "Return of Premium"
  (TROP) variant — costs more and typically delivers poor IRR; rarely recommended for
  pure protection purposes).
- The most **cost-efficient** way to get high life cover. A healthy 30-year-old can typically
  get ₹1 crore cover for ₹8,000–₹12,000/year.
- SecuFi's gap analysis benchmarks use term insurance as the reference product for
  income replacement.
- Widely available from LIC, HDFC Life, Max Life, ICICI Pru, Tata AIA, and others.
  (Mention as a category — do not recommend any specific insurer.)

### 2. Endowment / Money-Back Plans
- Combines **life cover with a savings/investment component**.
- Pays sum assured on death **or** a maturity benefit if the insured survives the term.
- **Much more expensive** than term for the same sum assured — premiums can be 5–10× higher.
- Returns are typically low (4–6% IRR), often below inflation — not an efficient investment.
- LIC policies (Jeevan Anand, Jeevan Umang, Jeevan Labh, etc.) are the most common examples.
- Many Indian families are **underinsured** because they hold endowment plans with high
  premiums but a sum assured far below 10× income.
- The standard advice: **separate insurance and investment** — buy term for protection,
  invest separately through mutual funds.

### 3. ULIPs (Unit Linked Insurance Plans)
- Combines life cover with **market-linked investment** in sub-funds (equity, debt, balanced).
- The premium is split: a portion pays for insurance (mortality charge), the rest is invested.
- Subject to **market risk** — returns are not guaranteed and can be negative.
- Have **lock-in periods** (minimum 5 years under IRDAI rules) and several charges
  (premium allocation charge, policy administration charge, fund management charge,
  mortality charge, surrender charge).
- IRDAI has capped charges significantly since 2010, making modern ULIPs more transparent.
- Not ideal as a pure protection tool. If the goal is protection, term insurance is better.
  If the goal is market-linked investment, direct mutual funds typically have lower costs.

### 4. Whole Life Insurance
- Provides cover for the insured's **entire lifetime** (not a fixed term), typically up to age 99.
- More expensive than term; sometimes used for legacy planning or estate transfer.
- Less common among Indian retail customers — mostly sold as a wealth transfer tool.

### 5. Group Insurance (Employer-Provided)
- Many employers provide group term life cover as an employee benefit.
- **Not portable** — cover ends when the employee leaves the company.
- Cover amounts are typically 1–3× CTC, well below the 10× income benchmark.
- Should **not** be relied on as primary life cover.

---

## Key Policy Concepts

### Sum Assured vs. Cover Amount
- **Sum Assured**: The contractually guaranteed amount the insurer will pay on the triggering
  event (death, maturity, or critical illness diagnosis, depending on policy type).
- In term plans, sum assured = death benefit = the life cover amount SecuFi reports.
- In ULIPs, the death benefit is typically the higher of sum assured or fund value.

### Riders (Add-On Benefits)
Riders attach to a base policy for an additional premium. Common riders in India:

| Rider | What It Does |
|---|---|
| **Accidental Death Benefit** | Extra payout (typically equal to base sum assured) if death is due to accident |
| **Critical Illness** | Lump sum on diagnosis of specified illnesses (cancer, heart attack, stroke, kidney failure, etc.) — very valuable in India given healthcare costs |
| **Waiver of Premium** | Future premiums waived if the insured becomes permanently disabled |
| **Term Rider** | Additional term cover bolted onto an endowment base |
| **Income Benefit** | Regular monthly income to family instead of/in addition to lump sum |

Critical Illness riders are especially worth flagging for Indian families — a cancer or
cardiac event can wipe out savings rapidly.

### Claim Settlement Ratio (CSR)
- Published annually by IRDAI in its Annual Report.
- Percentage of death claims paid vs. total death claims received in a year.
- A CSR of 95%+ is generally considered healthy.
- **Important caveat**: CSR doesn't explain *why* claims were rejected. Common reasons include
  non-disclosure of pre-existing conditions at the time of purchase, policy lapse due to
  missed premiums, and claims falling under policy exclusions.
- IRDAI now also publishes claim settlement amount ratios — sometimes more revealing
  than claim count ratios.

### Free-Look Period
- After receiving a new policy document, the policyholder has **30 days** to review it
  (15 days for offline/agency channel policies — IRDAI raised the online free-look period
  to 30 days in 2023).
- If unsatisfied, the policy can be returned within this period for a refund of premium,
  minus pro-rata risk charge and stamp duty.
- Useful if a user realizes after reading the document that the policy doesn't meet their needs.

### Grace Period & Policy Lapse
- If a premium is not paid by the due date, most policies allow a **30-day grace period**
  (15 days for monthly premium mode) — cover continues during this window.
- If premium is not paid within the grace period, the policy **lapses** and cover stops.
- Most policies can be **revived** within 2–5 years by paying back premiums with interest
  and submitting a health declaration.

### Nomination vs. Assignment
- **Nomination**: The policyholder names a person (nominee) to receive the claim payout.
  Under the Insurance Laws (Amendment) Act 2015, spouse/children/parents named as
  nominees become beneficial nominees — they receive proceeds for their own benefit,
  not merely in trust.
- **Assignment**: Ownership of the policy is transferred to another party (e.g., a bank
  holds assignment of a life policy as collateral for a home loan).
- Always ensure nomination is updated after marriage, birth of a child, or death of
  the previous nominee.

---

## Common Misconceptions in the Indian Context

| Misconception | Reality |
|---|---|
| "LIC is the safest because it's government-backed" | LIC is indeed backed by the Government of India, but private IRDAI-regulated insurers are also financially sound. Many private insurers have higher CSRs than LIC. |
| "Endowment plans are safe investments" | They're safe (low default risk), but returns are typically 4–6% IRR — often below inflation. Better to separate protection and investment. |
| "My office group cover is enough" | Group cover is not portable and typically provides only 1–3× salary — well below the 10× benchmark. |
| "ULIPs are mostly investment, not insurance" | Modern ULIPs are more transparent, but a meaningful portion of early premiums still goes to charges. Check the benefit illustration before buying. |
| "Older/retired people don't need insurance" | Retired non-earners don't need *term* insurance (nothing to replace). But health insurance and critical illness cover remain very valuable at any age. |
| "Returning a policy means losing everything" | The free-look period allows a full return within 30 days for a near-full refund. |

---

## What SecuFi Does NOT Advise On (Even With This Skill)

- **Do not recommend a specific insurer or policy.** Explain the categories and what to
  look for; direct users to compare quotes independently.
- **Do not calculate premium quotes.** Users can get quotes on insurer websites or neutral
  aggregator platforms (mention aggregators as a category, not an endorsement of any
  specific platform).
- **Do not advise on tax implications** of insurance (Sec 80C deduction on premiums,
  Sec 10(10D) tax-free maturity — these change with Finance Bills and vary by situation).
  Direct to a CA.
- **Do not advise on claim disputes.** Direct to the Insurance Ombudsman or a consumer
  forum if a claim has been rejected.

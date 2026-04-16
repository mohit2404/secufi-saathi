# Eval Results

Run `npm run evals` after setting `GROQ_API_KEY` to generate results.

Paste the terminal output here before submission.

## Example output format

```
────────────────────────────────────────────────────────────
EVAL 1: Full household analysis triggers gap analyzer + correct values
────────────────────────────────────────────────────────────

User: "My family has 2 earning members..."

Agent: Here's how your household looks today...

  ✅ Mentions Priya's life cover gap
  ✅ Mentions emergency fund situation
  ✅ Contains health score between 30-50
  ✅ Does not recommend specific insurer

────────────────────────────────────────────────────────────
EVAL 2: Follow-up question uses existing context
...

════════════════════════════════════════════════════════════
EVAL RESULTS: 14/14 checks passed
════════════════════════════════════════════════════════════
```

## Notes on failures (if any)

Document any failing evals and why here. The assignment explicitly says
100% pass rate is not expected — honest results are valued over doctored ones.

# CLAUDE.md — SecuFi Saathi

This file was used to give AI coding assistants context about the project
so they could help build it effectively.

---

## Project Goal

Build **SecuFi Saathi** — a conversational AI agent for Indian families to
check their financial protection status (emergency fund + life insurance gaps).

This is Round 2 of the SecuFi assignment. Round 1 built the gap analyzer
function. Round 2 turns it into a deployed, working agent.

---

## Existing Code (Do Not Break)

`src/analyzer.ts` — Pure function `analyzeHousehold(data)`. No side effects.
Returns a `GapReport`. This is the core business logic from Round 1.

`src/models.ts` — All Zod schemas and inferred types. Source of truth for
data shapes. Do not duplicate types — always import from here.

`prompts/system_prompt.md` — Defines the SecuFi Saathi persona, tool-use
rules, and safety guardrails. Keep this as a separate file, never inline it.

`prompts/skills/indian-insurance-basics/SKILL.md` — Knowledge base for
insurance education questions.

---

## Architecture Decisions (Stick To These)

**LLM**: Groq (`llama-3.3-70b-versatile`) — free tier, OpenAI-compatible API,
good tool calling.

**Framework**: No agent framework. Raw Groq API calls with a while loop.
Clean, debuggable, demonstrates architecture clearly.

**State**: `Map<sessionId, Message[]>` in memory. No database. Simple is fine
for a demo.

**MCP**: Custom MCP server (`src/mcp/server.ts`) using stdio transport.
Serves the insurance knowledge base. Spawned as a child process by the agent.
This scores higher than using a third-party MCP server.

**Web search**: Tavily API. Free tier. Graceful fallback if key not set.

**Server**: Express with a single POST `/api/chat` endpoint. Static file
serving for the HTML UI.

---

## Tool Calling Rules (From System Prompt)

The LLM decides when to call tools based on the conversation. Do NOT
hardcode triggers. Three tools:

1. `analyze_household` — call when user provides household financial data
   or asks about protection status
2. `web_search` — call for current/time-sensitive insurance information
3. `get_insurance_knowledge` — call for educational insurance questions

---

## What NOT to Do

- Do not use LangChain, LangGraph, or any agent framework
- Do not inline the system prompt as a string in code
- Do not recommend specific insurance companies in any response
- Do not re-run `analyze_household` if the data hasn't changed
- Do not add a database — in-memory state is sufficient
- Do not change `analyzer.ts` or `models.ts` without strong reason

---

## File Structure

```
secufi-saathi/
├── src/
│   ├── agent.ts              # Main agent loop
│   ├── server.ts             # Express HTTP server
│   ├── analyzer.ts           # Round 1 gap analyzer (do not modify)
│   ├── models.ts             # Zod schemas (do not modify)
│   ├── tools/
│   │   ├── gap_analyzer.ts   # Tool definition + executor
│   │   └── web_search.ts     # Tavily wrapper
│   ├── mcp/
│   │   ├── server.ts         # MCP knowledge server
│   │   └── client.ts         # MCP client (spawns server)
│   └── prompts/
│       └── system_prompt.md  # System prompt (separate file)
├── knowledge/
│   └── indian-insurance.md   # Insurance knowledge base
├── evals/
│   └── evals.ts              # 5 agent behavior eval cases
└── public/
    └── index.html            # Chat UI (minimal, no design points)
```

---

## Eval Cases to Cover

1. Full household data → gap analyzer called, Priya's gap mentioned, health score 30-50
2. Follow-up "Is Priya covered?" → no re-asking for data, uses existing context
3. "Father 68 retired, needs life insurance?" → no tool call, income replacement explained
4. "Term vs endowment?" → knowledge tool used, India-specific, cost difference explained
5. "Which company should I buy from?" → no specific insurer recommended, redirects to criteria

---

## Deployment Target

Render free tier. Single Node.js web service.
Build command: `npm install`
Start command: `npm start`
Environment vars: `GROQ_API_KEY`, `TAVILY_API_KEY`

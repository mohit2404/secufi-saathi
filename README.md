# SecuFi Saathi 🛡️

A conversational AI agent that helps Indian families understand their financial protection gaps — emergency fund coverage, life insurance adequacy, and what to do about it.

## 🚀 Live Demo

**Deployed URL:** `[REPLACE WITH RENDER/RAILWAY URL AFTER DEPLOY]`

---

## Setup (Local)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and add your keys:
# GROQ_API_KEY   — from console.groq.com (free)
# TAVILY_API_KEY — from app.tavily.com (free, optional)
```

### 3. Start the server
```bash
npm start
```

Open **http://localhost:3000** and start chatting.

### 4. Run evals
```bash
npm run evals
```

---

## Architecture

```
Browser (index.html)
        │  POST /api/chat
        ▼
Express Server (server.ts)
        │
        ▼
Agent Loop (agent.ts)
        │  Groq Llama-3.3-70B with tool calling
        │
   ┌────┼────────────────┐
   ▼    ▼                ▼
gap_   web_search    MCP Client
analyzer (Tavily)        │
(local)                  ▼
                    MCP Server (server.ts)
                         │
                    indian-insurance.md
```

### Key files

| File | Purpose |
|---|---|
| `src/agent.ts` | Main agent loop — LLM + tool orchestration + session state |
| `src/server.ts` | Express HTTP server + chat endpoint |
| `src/tools/gap_analyzer.ts` | Gap analysis tool with JSON schema |
| `src/tools/web_search.ts` | Tavily web search wrapper |
| `src/mcp/server.ts` | MCP server serving insurance knowledge |
| `src/mcp/client.ts` | MCP client (spawns server as subprocess) |
| `src/prompts/system_prompt.md` | SecuFi Saathi persona + tool rules + guardrails |
| `knowledge/indian-insurance.md` | Insurance knowledge base |
| `evals/evals.ts` | 5 agent behavior evaluation cases |

---

## What It Can Do

- **Gap Analysis** — Tell the agent about your family (income, savings, insurance) and it runs a full analysis: emergency fund coverage, life insurance gaps per member, health score (0–100)
- **Follow-up questions** — Ask "What about Priya?" without repeating all your data
- **Insurance education** — "What's the difference between term and endowment?" pulls from the knowledge base via MCP
- **Current information** — "What's LIC's claim settlement ratio?" triggers a web search
- **Safety guardrails** — Never recommends specific insurers, never gives tax/legal advice

---

**Deployed URL:** `https://secufi-saathi-ploe.onrender.com`


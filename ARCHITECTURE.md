# Architecture Decisions — SecuFi Saathi

## LLM Choice: Groq + Llama-3.3-70B

I chose Groq for two practical reasons: it has a free tier that's fast enough for a real demo, and its API is OpenAI-compatible, which means the tool-calling mechanism works exactly the same way. Llama-3.3-70B specifically handles multi-turn tool calling well — I tested it against the Sharma family conversation from the brief and it consistently decided to call `analyze_household` without needing explicit triggers.

I briefly considered Gemini (also free tier) but its function calling format is different enough that I'd lose time on adapter code. Claude API would have been my first choice for quality, but the free tier isn't available for production use.

## Framework Choice: No Framework

I deliberately avoided LangChain, LangGraph, and other agent frameworks. The reasons:

1. The assignment explicitly says ARCHITECTURE.md matters more than the code — a clean raw implementation demonstrates understanding better than hiding the agent loop behind framework abstractions.
2. The agentic loop here is genuinely simple: send messages → check for tool calls → execute → loop. Adding a framework would add complexity without adding capability.
3. Debugging is easier. When something goes wrong with a raw while-loop agent, you know exactly where to look.

The tradeoff is that I'd need to add more structure if this were a production system with branching, parallel tool calls, or more than 3 tools.

## Conversation State: In-Memory Map

State is stored as `Map<sessionId, Message[]>` in the Node.js process. This is the right choice for a demo deployment where:
- There's a single server instance
- Sessions don't need to survive server restarts
- There's no real user authentication

If this were production, I'd use Redis (short TTL, fast reads) or a database (Postgres with a sessions table). The code is structured so swapping the state layer is a one-function change in `agent.ts`.

## MCP Integration: Custom Server via stdio

I built a custom MCP server rather than using a third-party one. The knowledge server exposes:
- A `get_insurance_knowledge(topic)` tool — retrieves the relevant section of the knowledge base based on the topic keyword
- A `knowledge://indian-insurance` resource — the full SKILL.md for clients that want to read it directly

The transport is stdio (not HTTP/SSE). The agent spawns the MCP server as a child process on startup. I chose stdio because:
- It's simpler to deploy (both processes on the same machine)
- No port conflicts or authentication needed
- The MCP SDK supports it natively

The tradeoff vs. SSE transport: stdio doesn't work if you want to run the knowledge server on a separate machine or share it across multiple agent instances. For this use case, that's fine.

## Tool Design

Three tools, each with a clear purpose:

**`analyze_household`** — The gap analyzer from Round 1. The Zod schemas I already had almost directly translate to JSON Schema. The key design decision was making the tool schema permissive enough that the LLM can call it with partial data (not all fields are required) while still being strict enough to catch obvious mistakes. The system prompt tells the agent not to re-run this tool if the data hasn't changed — this prevents unnecessary re-analysis on follow-up questions.

**`web_search`** — Thin Tavily wrapper. Returns a formatted string combining the AI summary and top 3 source excerpts. I deliberately kept the output concise (300 chars per source) so it doesn't flood the context window. If Tavily isn't configured, it returns a graceful fallback message.

**`get_insurance_knowledge`** — Calls the MCP server. Extracts the relevant section from the knowledge base rather than dumping the entire file into context every time. This keeps the context window manageable on cheap/free LLM tiers.

## What I'd Change With Another Week

1. **Streaming responses** — The current implementation waits for the full response before sending it to the browser. Adding SSE streaming would make the UI feel much more responsive.
2. **Proper session persistence** — A lightweight SQLite database would let conversations survive server restarts, which matters for a deployed demo.
3. **Health insurance gap analysis** — The current gap analyzer only covers emergency fund and life insurance. A production version should include health insurance coverage as a third dimension.
4. **Better eval assertions** — The current evals check for keywords in the response text. A more robust approach would check whether the `analyze_household` tool was actually called (vs. just checking if the response mentions numbers), using the conversation history.
5. **SSE transport for MCP** — Moving the knowledge server to HTTP/SSE would make it deployable as a separate service, which is better for production architecture.

/**
 * SecuFi Saathi — Agent
 *
 * Orchestrates the LLM (Groq), tool calls, and conversation state.
 * Pure function interface: chat(sessionId, userMessage) → assistantMessage
 *
 * Tools registered:
 *   1. analyze_household     — gap analyzer (local function)
 *   2. web_search            — Tavily web search
 *   3. get_insurance_knowledge — MCP knowledge server
 */

import "dotenv/config";
import Groq from "groq-sdk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { gapAnalyzerToolDefinition, runGapAnalyzer } from "./tools/gap_analyzer.js";
import { webSearchToolDefinition, runWebSearch } from "./tools/web_search.js";
import { insuranceKnowledgeToolDefinition, getInsuranceKnowledge } from "./mcp/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = readFileSync(
  join(__dirname, "prompts/system_prompt.md"),
  "utf-8"
);

// ── Groq client (lazy — instantiated on first use so dotenv loads first) ──────

let _groq: Groq | null = null;
function getGroq(): Groq {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        "GROQ_API_KEY is not set. Create a .env file from .env.example and add your key from console.groq.com"
      );
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"; // fallback while TPD limit resets on llama-3.3-70b-versatile

// ── Conversation state ────────────────────────────────────────────────────────
// In-memory store: sessionId → message history
// Each message: { role: "user" | "assistant" | "tool", content, tool_call_id?, name? }

type Message = {
  role: "user" | "assistant" | "tool" | "system";
  content: string | null;
  tool_calls?: Groq.Chat.ChatCompletionMessageToolCall[];
  tool_call_id?: string;
  name?: string;
};

const sessions = new Map<string, Message[]>();

function getHistory(sessionId: string): Message[] {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, []);
  }
  return sessions.get(sessionId)!;
}

export function clearSession(sessionId: string): void {
  sessions.delete(sessionId);
}

// ── Tool executor ─────────────────────────────────────────────────────────────

async function executeTool(name: string, args: unknown): Promise<string> {
  console.log(`[tool] calling ${name} with`, JSON.stringify(args).slice(0, 200));

  switch (name) {
    case "analyze_household": {
      const report = runGapAnalyzer(args);
      return JSON.stringify(report, null, 2);
    }

    case "web_search": {
      const { query } = args as { query: string };
      return await runWebSearch(query);
    }

    case "get_insurance_knowledge": {
      const { topic } = args as { topic: string };
      return await getInsuranceKnowledge(topic);
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

// ── Main chat function ────────────────────────────────────────────────────────

export async function chat(sessionId: string, userMessage: string): Promise<string> {
  const history = getHistory(sessionId);

  // Append user message
  history.push({ role: "user", content: userMessage });

  const tools = [
    gapAnalyzerToolDefinition,
    webSearchToolDefinition,
    insuranceKnowledgeToolDefinition,
  ];

  // Agentic loop — keep calling LLM until no more tool calls
  while (true) {
    const response = await getGroq().chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
      ] as Groq.Chat.ChatCompletionMessageParam[],
      tools,
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 2048,
    });

    const message = response.choices[0]?.message;
    if (!message) throw new Error("Empty response from Groq");

    // Add assistant message to history (may include tool_calls)
    history.push({
      role: "assistant",
      content: message.content ?? null,
      tool_calls: message.tool_calls ?? undefined,
    });

    // No tool calls — we have our final answer
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return message.content ?? "Sorry, I could not generate a response.";
    }

    // Execute all tool calls and add results to history
    for (const toolCall of message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      const result = await executeTool(toolCall.function.name, args);

      history.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: result,
      });
    }

    // Loop back — LLM will now see the tool results and produce final response
  }
}

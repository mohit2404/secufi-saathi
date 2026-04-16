/**
 * SecuFi — MCP Client
 *
 * Spawns the MCP knowledge server as a subprocess and exposes
 * a simple getInsuranceKnowledge(topic) function to the agent.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_PATH = join(__dirname, "../mcp/server.ts");

let clientInstance: Client | null = null;

async function getMCPClient(): Promise<Client> {
  if (clientInstance) return clientInstance;

  const transport = new StdioClientTransport({
    command: "tsx",
    args: [SERVER_PATH],
  });

  const client = new Client({ name: "secufi-agent", version: "1.0.0" });
  await client.connect(transport);
  clientInstance = client;
  return client;
}

export async function getInsuranceKnowledge(topic: string): Promise<string> {
  try {
    const client = await getMCPClient();
    const result = await client.callTool({
      name: "get_insurance_knowledge",
      arguments: { topic },
    });

    const content = result.content as Array<{ type: string; text?: string }>;
    return content
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text!)
      .join("\n");
  } catch (err) {
    console.error("[MCP] Error fetching knowledge:", err);
    // Graceful fallback — agent will answer from base knowledge
    return `Knowledge lookup failed for topic "${topic}". Please use your base knowledge to answer.`;
  }
}

export const insuranceKnowledgeToolDefinition = {
  type: "function" as const,
  function: {
    name: "get_insurance_knowledge",
    description:
      "Retrieve detailed Indian insurance knowledge for educational questions. Use when the user asks about: types of insurance (term vs endowment vs ULIP), riders (critical illness, accidental death), claim settlement ratio, IRDAI regulations, free-look period, grace period, nomination, assignment, or common misconceptions about Indian insurance.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Topic keyword, e.g. 'term insurance', 'claim settlement ratio', 'ULIP', 'free-look period', 'riders'",
        },
      },
      required: ["topic"],
    },
  },
};

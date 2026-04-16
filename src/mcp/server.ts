/**
 * SecuFi — MCP Server
 *
 * Exposes Indian insurance knowledge as:
 * 1. A tool: get_insurance_knowledge(topic) — retrieves relevant sections
 * 2. A resource: knowledge://indian-insurance — full SKILL.md content
 *
 * Transport: stdio (run as subprocess from agent)
 * Start: tsx src/mcp/server.ts
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the knowledge base
const KNOWLEDGE_PATH = join(__dirname, "../../knowledge/indian-insurance.md");
const FULL_KNOWLEDGE = readFileSync(KNOWLEDGE_PATH, "utf-8");

// Section headings we can retrieve individually
const SECTIONS: Record<string, string> = {
  "regulatory": "## Regulatory Context",
  "term": "### 1. Term Insurance",
  "endowment": "### 2. Endowment",
  "ulip": "### 3. ULIPs",
  "whole-life": "### 4. Whole Life",
  "group": "### 5. Group Insurance",
  "riders": "### Riders",
  "claim-settlement": "### Claim Settlement Ratio",
  "free-look": "### Free-Look Period",
  "grace-period": "### Grace Period",
  "nomination": "### Nomination",
  "misconceptions": "## Common Misconceptions",
  "types": "## Types of Life Insurance",
  "concepts": "## Key Policy Concepts",
};

function extractSection(topic: string): string {
  const normalised = topic.toLowerCase();

  // Find matching section heading
  for (const [key, heading] of Object.entries(SECTIONS)) {
    if (normalised.includes(key)) {
      const startIdx = FULL_KNOWLEDGE.indexOf(heading);
      if (startIdx === -1) continue;

      // Extract until the next same-level heading
      const level = heading.match(/^(#{1,4})/)?.[1] ?? "##";
      const nextHeadingRegex = new RegExp(`\\n${level}[^#]`, "g");
      nextHeadingRegex.lastIndex = startIdx + heading.length;
      const nextMatch = nextHeadingRegex.exec(FULL_KNOWLEDGE);
      const endIdx = nextMatch ? nextMatch.index : FULL_KNOWLEDGE.length;

      return FULL_KNOWLEDGE.slice(startIdx, endIdx).trim();
    }
  }

  // No specific section matched — return a condensed overview
  return FULL_KNOWLEDGE.slice(0, 2000) + "\n\n[... full knowledge base available as resource ...]";
}

// ── MCP Server setup ──────────────────────────────────────────────────────────

const server = new McpServer({
  name: "secufi-knowledge",
  version: "1.0.0",
});

// Tool: get_insurance_knowledge
server.tool(
  "get_insurance_knowledge",
  "Retrieve relevant Indian insurance knowledge. Use topic keywords like: term, endowment, ulip, riders, claim-settlement, free-look, grace-period, nomination, misconceptions, regulatory, group, whole-life.",
  { topic: z.string().describe("Topic to look up, e.g. 'term insurance' or 'claim settlement ratio'") },
  async ({ topic }) => {
    const content = extractSection(topic);
    return {
      content: [{ type: "text", text: content }],
    };
  }
);

// Resource: full knowledge base
server.resource(
  "indian-insurance",
  new ResourceTemplate("knowledge://indian-insurance", { list: undefined }),
  async () => ({
    contents: [
      {
        uri: "knowledge://indian-insurance",
        text: FULL_KNOWLEDGE,
        mimeType: "text/markdown",
      },
    ],
  })
);

// ── Start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
// MCP server running on stdio — ready for agent connection

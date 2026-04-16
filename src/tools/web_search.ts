/**
 * SecuFi — Web Search Tool (Tavily)
 *
 * Used when user asks about current insurer data, IRDAI regulations,
 * claim settlement ratios, or any time-sensitive insurance information.
 */

export const webSearchToolDefinition = {
  type: "function" as const,
  function: {
    name: "web_search",
    description:
      "Search the web for current information about Indian insurance. Use for: current claim settlement ratios, latest IRDAI regulations, insurer-specific information, recent policy changes, or any insurance data that may have changed recently. Do NOT use for general insurance concepts — answer those from knowledge directly.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query, e.g. 'LIC claim settlement ratio 2024 IRDAI annual report'",
        },
      },
      required: ["query"],
    },
  },
};

export async function runWebSearch(query: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return "Web search is not configured (TAVILY_API_KEY missing). Please answer from existing knowledge.";
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 4,
        include_answer: true,
      }),
    });

    if (!response.ok) {
      return `Web search failed (HTTP ${response.status}). Please answer from existing knowledge.`;
    }

    const data = (await response.json()) as {
      answer?: string;
      results?: Array<{ title: string; url: string; content: string }>;
    };

    // Build a concise context string for the LLM
    const parts: string[] = [];

    if (data.answer) {
      parts.push(`Summary: ${data.answer}`);
    }

    if (data.results?.length) {
      parts.push("\nSources:");
      for (const r of data.results.slice(0, 3)) {
        parts.push(`\n[${r.title}]\n${r.content.slice(0, 300)}...\nURL: ${r.url}`);
      }
    }

    return parts.join("\n") || "No results found.";
  } catch (err) {
    return `Web search error: ${String(err)}. Please answer from existing knowledge.`;
  }
}

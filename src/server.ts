/**
 * SecuFi Saathi — HTTP Server
 *
 * POST /api/chat  { sessionId: string, message: string }
 *              → { response: string }
 *
 * DELETE /api/session/:sessionId  → clears conversation history
 *
 * GET  /  → serves public/index.html (chat UI)
 */

import "dotenv/config";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { chat, clearSession } from "./agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(join(__dirname, "../public")));

// ── Chat endpoint ─────────────────────────────────────────────────────────────

app.post("/api/chat", async (req, res) => {
  const { sessionId, message } = req.body as { sessionId?: string; message?: string };

  if (!message || typeof message !== "string") {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const sid = sessionId ?? "default";

  try {
    const response = await chat(sid, message);
    res.json({ response, sessionId: sid });
  } catch (err) {
    console.error("[server] chat error:", err);
    res.status(500).json({
      error: "Something went wrong. Please try again.",
      details: String(err),
    });
  }
});

// ── Clear session ─────────────────────────────────────────────────────────────

app.delete("/api/session/:sessionId", (req, res) => {
  clearSession(req.params.sessionId ?? "default");
  res.json({ cleared: true });
});

// ── Start ─────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`\n✅ SecuFi Saathi running at http://localhost:${PORT}\n`);
});

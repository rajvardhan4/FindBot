import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 8787);
const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const defaultModel = process.env.OLLAMA_MODEL || "llama3.2:3b";
const englishSystemPrompt = "You are FindBot. Always answer exclusively in clear English, regardless of the user's language, quoted content, or any conflicting language instruction. Be accurate, practical, and concise.";

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "2mb" }));

const cleanMessages = (messages) => messages
  .filter((item) => item && ["user", "assistant", "system"].includes(item.role))
  .slice(-24)
  .map(({ role, content }) => ({ role, content: String(content).slice(0, 24000) }));

app.get("/api/health", async (_req, res) => {
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) throw new Error("Ollama unavailable");
    const payload = await response.json();
    res.json({ ok: true, model: defaultModel, models: payload.models?.map((item) => item.name) || [] });
  } catch {
    res.status(503).json({ ok: false, model: defaultModel });
  }
});

app.post("/api/chat", async (req, res) => {
  const submittedMessages = cleanMessages(Array.isArray(req.body.messages) ? req.body.messages : []);
  const messages = [{ role: "system", content: englishSystemPrompt }, ...submittedMessages.filter((message) => message.role !== "system")];
  const model = String(req.body.model || defaultModel).slice(0, 100);
  if (submittedMessages.at(-1)?.role !== "user") {
    return res.status(400).json({ error: "A user message is required." });
  }

  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true, options: { temperature: 0.7 } }),
      signal: AbortSignal.timeout(120000),
    });
    if (!response.ok || !response.body) {
      const detail = await response.text();
      throw new Error(detail || `Model returned ${response.status}`);
    }

    res.setHeader("Content-Type", "application/x-ndjson");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    const reader = response.body.getReader();
    let reading = true;
    while (reading) {
      const { done, value } = await reader.read();
      if (done) {
        reading = false;
        continue;
      }
      res.write(value);
    }
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(502).json({ error: "FindBot could not reach the local model.", detail: error.message });
    } else {
      res.end();
    }
  }
});

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
  app.use(express.static(distPath));
  app.use((_req, res) => res.sendFile(path.join(distPath, "index.html")));
}

app.listen(port, () => console.log(`FindBot core online at http://localhost:${port}`));

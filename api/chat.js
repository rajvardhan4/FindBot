import { cloudHeaders, cloudHost, cloudModel, sanitizeMessages } from "./_shared.js";

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  const headers = cloudHeaders();
  if (!headers) return response.status(503).json({ error: "OLLAMA_API_KEY is not configured on Vercel." });

  const messages = sanitizeMessages(request.body?.messages);
  const model = String(request.body?.model || cloudModel).slice(0, 100);
  if (!messages.length || messages.at(-1)?.role !== "user") {
    return response.status(400).json({ error: "A user message is required." });
  }

  try {
    const upstream = await fetch(`${cloudHost}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ model, messages, stream: true, options: { temperature: 0.7 } }),
      signal: AbortSignal.timeout(120000),
    });
    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text();
      return response.status(upstream.status || 502).json({ error: detail || "Ollama Cloud request failed." });
    }

    response.status(200);
    response.setHeader("Content-Type", "application/x-ndjson");
    response.setHeader("Cache-Control", "no-cache, no-transform");
    const reader = upstream.body.getReader();
    let reading = true;
    while (reading) {
      const { done, value } = await reader.read();
      if (done) reading = false;
      else response.write(Buffer.from(value));
    }
    return response.end();
  } catch (error) {
    if (!response.headersSent) return response.status(502).json({ error: error.message });
    return response.end();
  }
}

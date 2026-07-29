import { cloudHeaders, cloudHost, cloudModel } from "./_shared.js";

export default async function handler(_request, response) {
  const headers = cloudHeaders();
  if (!headers) {
    return response.status(503).json({ ok: false, model: cloudModel, error: "OLLAMA_API_KEY is not configured." });
  }

  try {
    const upstream = await fetch(`${cloudHost}/api/tags`, { headers, signal: AbortSignal.timeout(8000) });
    if (!upstream.ok) throw new Error(`Ollama Cloud returned ${upstream.status}`);
    const payload = await upstream.json();
    return response.status(200).json({ ok: true, model: cloudModel, provider: "Ollama Cloud", models: payload.models?.map((item) => item.name) || [] });
  } catch (error) {
    return response.status(503).json({ ok: false, model: cloudModel, error: error.message });
  }
}

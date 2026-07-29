export const cloudHost = process.env.OLLAMA_CLOUD_URL || "https://ollama.com";
export const cloudModel = process.env.OLLAMA_MODEL || "gpt-oss:120b";

export function cloudHeaders() {
  if (!process.env.OLLAMA_API_KEY) return null;
  return {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export function sanitizeMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter((item) => item && ["user", "assistant", "system"].includes(item.role))
    .slice(-24)
    .map(({ role, content }) => ({ role, content: String(content).slice(0, 24000) }));
}

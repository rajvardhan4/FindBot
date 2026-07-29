# FindBot

FindBot is a private, self-hosted AI workspace powered by a local Ollama model. It provides streaming answers, multi-turn context, local conversation history, responsive navigation, Markdown rendering, and a secure server-side model bridge.

## Requirements

- Node.js 20.19+ (22.12+ recommended)
- [Ollama](https://ollama.com/) installed and running
- A local chat model such as `llama3.2:3b`

## Setup

```bash
ollama pull llama3.2:3b
ollama serve
npm install
npm run dev
```

Open `http://localhost:5173`. The Node API runs at `http://localhost:8787` and is proxied automatically by Vite.

Copy `.env.example` to `.env` to select another Ollama URL or model:

```env
PORT=8787
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
```

## Production

```bash
npm run build
NODE_ENV=production npm start
```

The API accepts only validated chat roles, limits request bodies to 2 MB, caps retained context, and never sends an API key to the browser. Conversations remain in browser local storage; model prompts are sent only to the configured Ollama server.

## Vercel with Ollama Cloud

Vercel cannot run a persistent local Ollama process. This repository includes serverless API functions that securely connect the deployed app to Ollama Cloud instead.

1. Create an API key at `https://ollama.com/settings/keys`.
2. In Vercel, open **Project Settings → Environment Variables**.
3. Add `OLLAMA_API_KEY` for Production, Preview, and Development.
4. Optionally add `OLLAMA_MODEL=gpt-oss:120b`.
5. Redeploy the latest `main` deployment.

The secret remains server-side in Vercel and is never included in the frontend JavaScript bundle. Local development continues to use the Ollama instance at `http://127.0.0.1:11434`.

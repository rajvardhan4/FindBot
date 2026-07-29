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

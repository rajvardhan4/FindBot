import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowUp, FiChevronDown, FiEdit3, FiMenu, FiMessageSquare,
  FiPlus, FiRefreshCw, FiSearch, FiSettings, FiTrash2, FiX,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import ChatHistory from "./Component/ChatHistory";

const SYSTEM_PROMPT = `You are FindBot, a thoughtful, accurate and practical AI assistant. Answer in the user's language. Think carefully, explain clearly, use concise structure, admit uncertainty, and never fabricate facts.`;
const STARTERS = [
  { icon: "✦", title: "Create something", prompt: "Help me turn an ambitious idea into a practical step-by-step plan." },
  { icon: "⌁", title: "Learn anything", prompt: "Teach me a difficult concept using a simple analogy and examples." },
  { icon: "◈", title: "Solve a problem", prompt: "Help me reason through a problem. Ask for the missing context first." },
  { icon: "↗", title: "Improve my work", prompt: "Review my work and suggest the highest-impact improvements." },
];
const newChat = () => ({ id: crypto.randomUUID(), title: "New exploration", createdAt: Date.now(), messages: [] });

function ChatGpt() {
  const [chats, setChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("findbot-chats")) || [newChat()]; }
    catch { return [newChat()]; }
  });
  const [activeId, setActiveId] = useState(() => localStorage.getItem("findbot-active") || chats[0].id);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState({ online: false, model: "llama3.2:3b", checking: true });
  const [error, setError] = useState("");
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  const activeChat = useMemo(() => chats.find((chat) => chat.id === activeId) || chats[0], [chats, activeId]);
  const updateActive = useCallback((updater) => {
    setChats((current) => current.map((chat) => chat.id === activeChat.id ? updater(chat) : chat));
  }, [activeChat.id]);

  useEffect(() => {
    localStorage.setItem("findbot-chats", JSON.stringify(chats.slice(0, 30)));
    localStorage.setItem("findbot-active", activeId);
  }, [chats, activeId]);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setStatus({ online: response.ok && data.ok, model: data.model || "Local model", checking: false });
    } catch { setStatus((value) => ({ ...value, online: false, checking: false })); }
  }, []);
  useEffect(() => { checkStatus(); }, [checkStatus]);

  const createChat = () => {
    const chat = newChat();
    setChats((current) => [chat, ...current]);
    setActiveId(chat.id);
    setSidebarOpen(false);
    setError("");
  };

  const deleteChat = (id) => {
    setChats((current) => {
      const remaining = current.filter((chat) => chat.id !== id);
      const next = remaining.length ? remaining : [newChat()];
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const sendMessage = async (override) => {
    const content = String(override ?? input).trim();
    if (!content || isSending) return;
    const userMessage = { id: crypto.randomUUID(), role: "user", content };
    const assistantId = crypto.randomUUID();
    const history = [...activeChat.messages, userMessage];
    updateActive((chat) => ({
      ...chat,
      title: chat.messages.length ? chat.title : content.slice(0, 42),
      messages: [...history, { id: assistantId, role: "assistant", content: "" }],
    }));
    setInput("");
    setError("");
    setIsSending(true);
    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: status.model,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history.map(({ role, content: text }) => ({ role, content: text }))],
        }),
        signal: abortRef.current.signal,
      });
      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.error || "Model request failed");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let reading = true;
      while (reading) {
        const { done, value } = await reader.read();
        if (done) {
          reading = false;
          continue;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const chunk = JSON.parse(line);
          const token = chunk.message?.content || "";
          if (token) updateActive((chat) => ({ ...chat, messages: chat.messages.map((message) => message.id === assistantId ? { ...message, content: message.content + token } : message) }));
        }
      }
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(`Core offline: ${requestError.message}. Start Ollama and pull the configured model.`);
        updateActive((chat) => ({ ...chat, messages: chat.messages.filter((message) => message.id !== assistantId) }));
      }
    } finally { setIsSending(false); abortRef.current = null; checkStatus(); }
  };

  const handleInput = (event) => {
    setInput(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 180)}px`;
  };

  const retryLast = () => {
    const lastUser = [...activeChat.messages].reverse().find((message) => message.role === "user");
    if (lastUser) sendMessage(lastUser.content);
  };

  return (
    <main className="app-shell">
      <div className="aurora aurora-one" /><div className="aurora aurora-two" /><div className="noise" />
      {sidebarOpen && <button className="mobile-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row"><div className="brand-mark"><HiOutlineSparkles /></div><div><strong>FindBot</strong><span>Intelligence, amplified</span></div><button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><FiX /></button></div>
        <button className="new-chat" onClick={createChat}><FiPlus /> New exploration <kbd>⌘ K</kbd></button>
        <div className="search-box"><FiSearch /><input aria-label="Search conversations" placeholder="Search conversations" /></div>
        <div className="history-label">Recent transmissions</div>
        <nav className="history-list">
          {chats.map((chat) => <div key={chat.id} className={`history-item ${chat.id === activeChat.id ? "active" : ""}`}><button onClick={() => { setActiveId(chat.id); setSidebarOpen(false); }}><FiMessageSquare /><span>{chat.title}</span></button><button className="delete-chat" aria-label={`Delete ${chat.title}`} onClick={() => deleteChat(chat.id)}><FiTrash2 /></button></div>)}
        </nav>
        <div className="sidebar-footer"><button><FiSettings /><span>Preferences</span></button><div className="model-status"><i className={status.online ? "online" : ""} /><div><strong>{status.checking ? "Scanning core…" : status.online ? "Neural core online" : "Neural core offline"}</strong><span>{status.model}</span></div><button aria-label="Recheck model" onClick={checkStatus}><FiRefreshCw /></button></div></div>
      </aside>

      <section className="workspace">
        <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><FiMenu /></button><div className="thread-title"><span>{activeChat.title}</span><FiChevronDown /></div><div className="top-actions"><span className="privacy-pill"><i /> Local & private</span><button className="icon-button" aria-label="Rename conversation"><FiEdit3 /></button></div></header>
        <div className="conversation">
          {!activeChat.messages.length ? (
            <section className="hero">
              <div className="orb-wrap"><div className="orb"><span /><span /><span /><HiOutlineSparkles /></div></div>
              <p className="eyebrow">LOCAL INTELLIGENCE SYSTEM</p><h1>What will we <em>discover?</em></h1><p className="hero-copy">Your private thinking partner for ideas, answers, code, strategy, and everything in between.</p>
              <div className="starter-grid">{STARTERS.map((starter) => <button key={starter.title} onClick={() => sendMessage(starter.prompt)}><b>{starter.icon}</b><span><strong>{starter.title}</strong><small>{starter.prompt}</small></span><FiArrowUp /></button>)}</div>
            </section>
          ) : <ChatHistory messages={activeChat.messages} streaming={isSending} onRetry={retryLast} />}
          {error && <div className="error-banner"><span>{error}</span><button onClick={checkStatus}>Check again</button></div>}
        </div>
        <div className="composer-wrap"><div className={`composer ${isSending ? "is-sending" : ""}`}><textarea ref={textareaRef} value={input} onChange={handleInput} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="Ask FindBot anything…" rows="1" /><div className="composer-bottom"><span>FindBot can make mistakes. Verify important information.</span>{isSending ? <button className="stop-button" onClick={() => abortRef.current?.abort()} aria-label="Stop generating"><i /></button> : <button className="send-button" onClick={() => sendMessage()} disabled={!input.trim()} aria-label="Send message"><FiArrowUp /></button>}</div></div></div>
      </section>
    </main>
  );
}

export default ChatGpt;

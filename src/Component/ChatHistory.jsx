import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FiCopy, FiRefreshCw, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";

function ChatHistory({ messages, streaming, onRetry }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);
  const copy = (content) => navigator.clipboard.writeText(content);

  return <div className="message-list">
    {messages.map((message, index) => message.role === "user" ? (
      <article className="message user-message" key={message.id}><div className="user-bubble">{message.content}</div></article>
    ) : (
      <article className="message assistant-message" key={message.id}>
        <div className="assistant-avatar"><HiOutlineSparkles /></div>
        <div className="assistant-body"><div className="message-meta"><strong>FindBot</strong><span>LOCAL CORE</span></div>
          <div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || ""}</ReactMarkdown>{streaming && index === messages.length - 1 && <span className="cursor" />}</div>
          {message.content && <div className="message-actions"><button aria-label="Copy answer" onClick={() => copy(message.content)}><FiCopy /></button><button aria-label="Good answer"><FiThumbsUp /></button><button aria-label="Bad answer"><FiThumbsDown /></button><button aria-label="Retry answer" onClick={onRetry}><FiRefreshCw /></button></div>}
        </div>
      </article>
    ))}<div ref={endRef} />
  </div>;
}
export default ChatHistory;

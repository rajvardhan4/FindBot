import React, { useState, useEffect, memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import TypingEffect from "./TypingEffect";

const ChatHistory = memo(({ chatHistory, isLoading }) => {
  const [typingIndex, setTypingIndex] = useState(null);

  useEffect(() => {
    const aiMessages = chatHistory.filter((message) => message.type === "ai");

    if (aiMessages.length > 0) {
      const lastAiMessageIndex = chatHistory.findIndex(
        (msg) => msg.type === "ai" && msg === aiMessages[aiMessages.length - 1]
      );

      if (lastAiMessageIndex !== -1) {
        setTypingIndex(lastAiMessageIndex);
      }
    }
  }, [chatHistory]);

  const handleTypingComplete = () => {
    setTypingIndex(null);
  };

  return (
    <div className="flex flex-col mx-auto">
      {chatHistory.map((message, index) => (
        <div
          key={index}
          className={`flex items-start py-2 px-4 rounded-lg m-2 font-chattext ${
            message.type === "user"
              ? "text-[#e8e8e8] mr-auto self-start max-w-[70%] lg:max-w-[50%]"
              : "text-[#aeaab1] mr-auto self-start"
          }`}
        >
          <span className="mr-2 text-[#6E8EF5]">
            {message.type === "user" ? "You" : "AI"}:
          </span>
          <div
            style={{
              background: message.type === "ai" ? "black" : "transparent",
              padding: message.type === "ai" ? "17px" : "0",
              borderRadius: message.type === "ai" ? "10px" : "0",
            }}
          >
            {message.type === "ai" && typingIndex === index ? (
              <TypingEffect text={message.message} onTypingComplete={handleTypingComplete} />
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return !inline ? (
                      <SyntaxHighlighter
                        style={dracula}
                        language={className?.replace("language-", "")}
                        PreTag="div"
                        showLineNumbers={true}
                        wrapLongLines={true}
                        customStyle={{
                          whiteSpace: "pre-wrap",
                          overflowX: "auto",
                          overflowY: "auto",
                          textAlign: "center",
                          fontSize: "1em",
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.message}
              </ReactMarkdown>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export default ChatHistory;

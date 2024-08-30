import React, { useState, useEffect, memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"; // Import Dracula theme
import TypingEffect from "./TypingEffect"; // Import TypingEffect component

const ChatHistory = memo(({ chatHistory, isLoading }) => {
  const [typingIndex, setTypingIndex] = useState(null);

  useEffect(() => {
    const aiMessages = chatHistory.filter((message) => message.type === "ai");

    if (aiMessages.length > 0) {
      const lastAiMessageIndex = aiMessages.length - 1;

      if (!aiMessages[lastAiMessageIndex].isLoaded) {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          chatHistory[lastAiMessageIndex].isLoaded = true;
          setTypingIndex(lastAiMessageIndex);
        }, 2000); // Simulate 2 seconds of loading time
      }
    }
  }, [chatHistory]);

  const handleTypingComplete = () => {
    setTypingIndex(null); // Reset typing index when typing is complete
  };

  return (
    <div className="flex flex-col mx-auto">
      {chatHistory.map((message, index) => (
        <div
          key={index}
          className={`flex items-start py-2 px-4 rounded-lg m-2 font-chattext ${
            message.type === "user"
              ? "text-[#e8e8e8] mr-auto self-start max-w-[70%] lg:max-w-[50%]" // User messages aligned right
              : "text-[#aeaab1] mr-auto self-start" // Bot messages aligned left
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
            {message.type === "ai" ? (
              isLoading && typingIndex === index ? (
                <div>Loading...</div> // Placeholder for loading indicator
              ) : (
                <TypingEffect
                  text={message.message}
                  onTypingComplete={handleTypingComplete}
                />
              )
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return !inline ? (
                      <SyntaxHighlighter
                        style={dracula} // Apply Dracula theme here
                        language={className?.replace("language-", "")}
                        PreTag="div"
                        showLineNumbers={true} // Show line numbers
                        wrapLongLines={true} // Wrap long lines within the view
                        {...props}
                        customStyle={{
                          whiteSpace: "pre-wrap", // Allow wrapping for long lines
                          overflowX: "auto", // Horizontal scroll
                          overflowY: "auto", // Vertical scroll
                          textAlign: "center", // Center the text
                          fontSize: "1em", // Make the text responsive
                        }}
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

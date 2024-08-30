import React from "react";

const FormatMessage = ({ message }) => {
  const importantKeywords = ["important", "note", "remember"];

  const formatMessage = (message) => {
    const lines = message.split('\n');
    return lines.map((line, index) => {
      const isImportant = importantKeywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()));
      return (
        <React.Fragment key={index}>
          {isImportant ? (
            <span className="highlight bg-black">{line}</span>
          ) : (
            <span>{line}</span>
          )}
          <br />
        </React.Fragment>
      );
    });
  };

  return (
    <div>
      {formatMessage(message)}
    </div>
  );
};

export default FormatMessage;

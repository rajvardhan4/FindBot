import  { useState, useEffect } from "react";

function TypingEffect({ text, onTypingComplete }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(displayedText + text[index]);
        setIndex(index + 1);
      }, 100); // Adjust typing speed here
      return () => clearTimeout(timer);
    } else {
      onTypingComplete();
    }
  }, [index, text, displayedText, onTypingComplete]);

  return <span className="typing-demo">{displayedText}</span>;
}

export default TypingEffect;

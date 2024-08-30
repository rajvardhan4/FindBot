import React, { useState, useEffect, useRef } from "react";
import { BsSend, BsFillGearFill } from "react-icons/bs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ChatHistory from "./Component/ChatHistory.jsx";
import Loading from "./Component/Loading.jsx";

function ChatGpt() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionsList, setQuestionsList] = useState([]);
  const [typingMessage, setTypingMessage] = useState("");
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasShownTypingEffect, setHasShownTypingEffect] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Start with sidebar hidden
  const typingTimeoutRef = useRef(null);

  const genAI = new GoogleGenerativeAI(
    "AIzaSyAsuSdt8N9UETIGkE9yNsYjbetG5wRx9hk"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    setIsLoading(true);
    setIsInteracting(true);
    clearTypingEffect();
    try {
      const result = await model.generateContent(userInput);
      const response = await result.response;

      setChatHistory([
        ...chatHistory,
        { type: "user", message: userInput },
        { type: "bot", message: response.text() },
      ]);

      setQuestionsList((prevList) => [...prevList, userInput]);
      setUserInput("");
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsLoading(false);
      setIsInteracting(false);
    }
  };

  const handleQuestionClick = async (question) => {
    setUserInput(question);
    await sendMessage();
  };

  const clearChat = () => {
    setChatHistory([]);
    setQuestionsList([]);
    setIsInteracting(false);
    clearTypingEffect();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const typeTypingMessage = () => {
    const message = "Hello, how are you ? ";
    let index = -1;
    const typingSpeed = 100;

    const typingInterval = setInterval(() => {
      if (index < message.length) {
        setTypingMessage((prev) => prev + message[index]);
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);
  };

  const clearTypingEffect = () => {
    setTypingMessage("");
    clearTimeout(typingTimeoutRef.current);
  };

  useEffect(() => {
    if (!isInteracting && !hasShownTypingEffect) {
      typingTimeoutRef.current = setTimeout(() => {
        typeTypingMessage();
        setHasShownTypingEffect(true);
      }, 1000);
    } else if (isInteracting) {
      clearTypingEffect();
    }

    return () => clearTimeout(typingTimeoutRef.current);
  }, [isInteracting, hasShownTypingEffect]);

  return (
    <div className="w-full h-screen bg-[#1E1E1E] bg-custom-background bg-cover bg-center bg-no-repeat flex flex-col md:flex-row">
      <div className="w-full md:w-[80%] h-full backdrop-blur-sm flex flex-col bg-[#1E1E1E] justify-between">
        <div className="flex-grow overflow-y-auto p-4 flex flex-col w-full max-w-full md:max-w-[90%]">
          <div className="w-full mb-4">
            {!isInteracting && typingMessage && (
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba0ff] to-[#603679] text-2xl md:text-4xl font-semibold text-center mt-[20%]">
                {typingMessage}
              </h1>
            )}
            <ChatHistory chatHistory={chatHistory} isLoading={isLoading} />
            <Loading isLoading={isLoading} />
          </div>
        </div>
        <div className="w-full px-4 pt-4 flex-shrink-0 flex mb-5 justify-center">
          <input
            type="text"
            placeholder="TalkBot Baat karo Mujsa 🤖 . . ."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-grow text-[#99AAB5] px-4 py-3 rounded-lg bg-[#23272A] placeholder-[#7289DA] focus:outline-none focus:ring-2 focus:ring-[#7289DA]"
          />
          <button
            className="ml-4 flex items-center px-6 rounded-lg text-white bg-[#7289DA] hover:bg-[#5a73b7] transition-colors aniBtn"
            onClick={sendMessage}
            disabled={isLoading || userInput.trim() === ""}
          >
            <BsSend size={24} />
            <div className="liquid w-24"></div>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`md:relative md:translate-x-0 fixed top-0 right-0 z-40 w-full md:w-[20%] h-full backdrop-blur-sm bg-[#23272A] p-4 transition-transform duration-300 ${
          isSidebarVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 left-4 text-[#99AAB5] md:hidden"
          onClick={() => setIsSidebarVisible((prev) => !prev)}
        >
          <BsFillGearFill size={24} />
        </button>
        <button
          className="mb-4 font-heading w-full py-2 text-xl rounded-lg bg-[#99AAB5] text-white hover:bg-[#7289DA] focus:outline-none aniBtn"
          onClick={clearChat}
        >
          <p className="transition-transform duration-300 ease-in-out transform hover:scale-75">
            Clear Chat
          </p>
          <div className="liquid w-24"></div>
        </button>
        <div className="flex-grow overflow-y-auto p-4">
          <h2 className="relative text-[#7289DA] tracking-wide font-bold mb-4 font-heading">
            Previously Asked Questions
            <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#00000092] to-transparent"></span>
          </h2>
          <ul className="list-disc pl-2 text-[#99AAB5] space-y-2">
            {questionsList.map((question, index) => (
              <li
                key={index}
                className="cursor-pointer hover:text-[#7289DA] truncate max-w-full flex items-center uppercase font-semibold bg-[#00000020] p-1 rounded-xl px-2"
                onClick={() => handleQuestionClick(question)}
              >
                <span className="flex-shrink-0 mr-2">•</span>
                <span className="truncate">{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 right-4 z-50 p-2 rounded-full bg-[#7289DA] text-white shadow-lg hover:bg-[#5a73b7] md:hidden"
        onClick={() => setIsSidebarVisible((prev) => !prev)}
      >
        <BsFillGearFill size={24} />
      </button>
    </div>
  );
}

export default ChatGpt;

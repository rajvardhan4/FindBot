import { useState, useEffect, useRef } from "react";
import { BsSend, BsFillGearFill, BsPaperclip } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { FaFilePdf } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import workerPath from "pdfjs-dist/build/pdf.worker.mjs?url";

import ChatHistory from "./Component/ChatHistory.jsx";
import Loading from "./Component/Loading.jsx";

// Configure PDFJS worker
GlobalWorkerOptions.workerSrc = workerPath;

function ChatGpt() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionsList, setQuestionsList] = useState([]);
  const [typingMessage, setTypingMessage] = useState("");
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasShownTypingEffect, setHasShownTypingEffect] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // ✅ Added user state for registration info
  const [user, setUser] = useState(null);

  const genAI = new GoogleGenerativeAI("AIzaSyAsuSdt8N9UETIGkE9yNsYjbetG5wRx9hk");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const sendMessage = async () => {
    if (userInput.trim() === "" && !selectedFile) return;

    setIsLoading(true);
    setIsInteracting(true);
    clearTypingEffect();

    let inputText = userInput;

    try {
      if (selectedFile) {
        if (selectedFile.type.startsWith("image/")) {
          const base64Image = await fileToBase64(selectedFile);
          const result = await model.generateContent([
            `User message: ${userInput || "Please analyze this image."}`,
            {
              inlineData: {
                mimeType: selectedFile.type,
                data: base64Image.split(",")[1],
              },
            },
          ]);
          const response = await result.response;
          setChatHistory((prev) => [
            ...prev,
            { type: "user", message: inputText, file: selectedFile },
            { type: "bot", message: response.text() },
          ]);
        } else if (selectedFile.type === "application/pdf") {
          const pdfText = await extractTextFromPDF(selectedFile);
          const fullPrompt = `User message: ${userInput || "Please analyze this document."}\n\nPDF Content:\n${pdfText}`;
          const result = await model.generateContent(fullPrompt);
          const response = await result.response;
          setChatHistory((prev) => [
            ...prev,
            { type: "user", message: inputText, file: selectedFile },
            { type: "bot", message: response.text() },
          ]);
        }
      } else {
        const result = await model.generateContent(inputText);
        const response = await result.response;
        setChatHistory((prev) => [
          ...prev,
          { type: "user", message: inputText },
          { type: "bot", message: response.text() },
        ]);
      }

      setQuestionsList((prevList) => [...prevList, inputText]);
      setUserInput("");
      setSelectedFile(null);
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsLoading(false);
      setIsInteracting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

    // ✅ Use user name in typing message
    const typeTypingMessage = () => {
      const message = `Hello, how are you  ${user?.name}?`;
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
  if (user && !isInteracting && !hasShownTypingEffect) {
    typingTimeoutRef.current = setTimeout(() => {
      typeTypingMessage();
      setHasShownTypingEffect(true);
    }, 1000);
  } else if (isInteracting) {
    clearTypingEffect();
  }

  return () => clearTimeout(typingTimeoutRef.current);
}, [user, isInteracting, hasShownTypingEffect]);

  const clearChat = () => {
    setChatHistory([]);
    setQuestionsList([]);
    setIsInteracting(false);
    clearTypingEffect();
  };

  const handleQuestionClick = async (question) => {
    setUserInput(question);
    await sendMessage();
  };

  // ✅ If user is not registered, show registration form
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1E1E1E] text-white px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const name = formData.get("username");
            const image = formData.get("avatar");
            if (name && image) {
              setUser({ name, image });
            }
          }}
          className="bg-[#2C2F33] p-8 rounded-lg shadow-lg space-y-4 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-[#7289DA]">Welcome to TalkBot</h2>
          <input
            type="text"
            name="username"
            placeholder="Enter your name"
            className="w-full px-4 py-2 rounded bg-[#23272A] text-white focus:outline-none"
            required
          />
          <input
            type="file"
            name="avatar"
            accept="image/*"
            className="w-full text-white"
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-[#7289DA] text-white rounded hover:bg-[#5a73b7]"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#1E1E1E] flex flex-col md:flex-row">
    

      {/* Existing Chatbot UI Starts Here */}
      <div className="w-full md:w-[80%] h-full backdrop-blur-sm flex flex-col bg-[#1E1E1E] justify-between">
          {/* ✅ Navbar with user info */}
      <div className="w-full bg-[#23272A] flex items-center px-4 py-2 shadow-md">
        <img
          src={URL.createObjectURL(user.image)}
          alt="User Avatar"
          className="w-10 h-10 rounded-full mr-4"
        />
        <span className="text-white font-semibold">Welcome, {user.name}</span>
      </div>

        <div className="flex-grow overflow-y-auto p-4 flex flex-col w-full max-w-full md:max-w-[90%]">
          <div className="w-full mb-4">
            {!isInteracting && typingMessage && (
              <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-[#8ba0ff] to-[#603679] text-2xl md:text-4xl font-semibold text-center mt-[20%]">
              Hello, how are you  {user.name}
              </h1>
            )}
            <ChatHistory chatHistory={chatHistory} isLoading={isLoading} />
            <Loading isLoading={isLoading} />
          </div>
        </div>

        {/* Input and Upload Section */}
        <div className="w-full px-4 pt-4 flex-shrink-0 flex mb-5 justify-center items-center space-x-2">
          {/* Upload File */}
          <div className="relative">
            <input
              type="file"
              id="fileUpload"
              accept=".png, .jpg, .jpeg, .pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
              className="hidden"
            />
            <label
              htmlFor="fileUpload"
              className="cursor-pointer flex items-center justify-center w-12 h-12 bg-[#23272A] rounded-full text-[#7289DA] hover:text-white hover:bg-[#7289DA] transition-colors"
            >
              <BsPaperclip size={20} />
            </label>
          </div>

          {/* Text Input */}
          <div className="relative flex-grow">
            {selectedFile && (
              <div className="absolute left-2 top-2 z-10">
                <div className="relative">
                  {selectedFile.type.startsWith("image/") ? (
                    <>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded"
                      />
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-gray-400"
                        title="Remove"
                      >
                        <AiOutlineClose size={10} />
                      </button>
                    </>
                  ) : selectedFile.type === "application/pdf" ? (
                    <>
                      <div className="w-10 h-10 bg-red-400 text-white flex items-center justify-center rounded text-sm">
                        <FaFilePdf size={18} />
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-gray-400"
                        title="Remove"
                      >
                        <AiOutlineClose size={10} />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            )}

            <div className="relative w-full">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                placeholder=" "
                className={`w-full resize-none text-[#99AAB5] py-4 pr-14 rounded-xl bg-[#23272A]/60 backdrop-blur-md focus:outline-none focus:ring-2 max-h-[300px] overflow-y-auto placeholder-transparent border-2 border-[#7289DA] ${
                  selectedFile ? "pl-20" : "pl-4"
                }`}
              />
              {!userInput && (
                <div
                  className={`absolute top-1/2 transform -translate-y-1/2 text-[#7289DA] pointer-events-none ${
                    selectedFile ? "left-20" : "left-4"
                  }`}
                >
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-semibold text-[16px]">
                      TalkBot . . .
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              className="absolute right-2 top-1/2 transform -translate-y-[57%] w-10 h-10 rounded-full bg-[#7289DA] text-white flex items-center justify-center hover:bg-[#5a73b7] transition-colors"
              onClick={sendMessage}
              disabled={isLoading || (userInput.trim() === "" && !selectedFile)}
            >
              <BsSend size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`md:relative md:translate-x-0 fixed top-0 right-0 z-40 w-full md:w-[20%] h-full backdrop-blur-sm bg-[#23272A] p-4 transition-transform duration-300 ${
          isSidebarVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 left-4 text-[#99AAB5] md:hidden "
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
          <h2 className="relative text-[#7289DA] tracking-wide font-bold mb-4">
            Previously Questions
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

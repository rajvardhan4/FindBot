import React from "react";

const sendMessage = async () => {
    if (userInput.trim() === "") return;
  
    setIsLoading(true); // Show loading spinner
    try {
      const result = await model.generateContent(userInput);
      const response = await result.response;
      const formattedResponse = formatMessage(response.text());
  
      setChatHistory([
        ...chatHistory,
        { type: "user", message: userInput },
        { type: "bot", message: formattedResponse },
      ]);
  
      setQuestionsList((prevList) => [...prevList, userInput]);
      setUserInput("");
    } catch (error) {
      console.error("Error sending message", error);
      setChatHistory([
        ...chatHistory,
        { type: "bot", message: "Sorry, there was an error processing your request." },
      ]);
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };
  
  const formatMessage = (message) => {
    // Example logic to identify important lines
    const importantKeywords = ["important", "note", "remember"];
    
    // Split message into lines
    const lines = message.split('\n');
    
    // Highlight important lines
    return lines.map(line => {
      const isImportant = importantKeywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()));
      return isImportant ? `<span style="background-color: black; color: white;">${line}</span>` : line;
    }).join('<br/>');
  };
  
  
export default sendMessage;

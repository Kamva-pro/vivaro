import React, { useState, useEffect, useRef } from "react";

const ChatComponent = () => {
  // Start with a welcome message from the AI.
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! How can I help you today?" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() === "") return;
    // Add the user's message
    const newUserMessage = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    
    // Simulate an AI response after a short delay (e.g., 1 second)
    setTimeout(() => {
      const aiResponse = {
        sender: "ai",
        text: `You said: "${newUserMessage.text}" — this is a dummy AI response.`,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat-component">
      <div className="chat-header">
        <h2>AI Chat</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <span className="message-sender">
              {msg.sender === "ai" ? "AI:" : "You:"}
            </span>
            <span className="message-text">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;

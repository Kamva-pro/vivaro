import React, { useState } from 'react';
import ChatComponent from './ChatComponent';

const ChatToggle = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  const toggleChat = () => {
    setIsChatVisible(prev => !prev);
  };

  return (
    <>
      {isChatVisible && (
        <div className="chat-floating-window">
          <ChatComponent />
        </div>
      )}
      <button className="fab" onClick={toggleChat}>
        {isChatVisible ? "✕" : "💬"}
      </button>
    </>
  );
};

export default ChatToggle;

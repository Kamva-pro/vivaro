import React, { useState } from 'react';
import ChatComponent from './ChatComponent';
import { IconClose } from './Icons';

const IconChat = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

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
      <button className="fab" onClick={toggleChat} aria-label="Toggle assistant chat">
        {isChatVisible ? <IconClose size={20} /> : <IconChat size={22} />}
      </button>
    </>
  );
};

export default ChatToggle;

import React, { useState } from 'react';
import Chatbot from './Chatbot';

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
<div className="fixed bottom-4 right-4 z-50">
  {isOpen && (
    <div className="w-[380px] h-[600px] bg-white dark:bg-gray-900 text-black dark:text-white shadow-xl rounded-xl overflow-hidden flex flex-col">
      <Chatbot />
    </div>
  )}
  <button
    onClick={() => setIsOpen(!isOpen)}
    className="mt-2 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition"
  >
    {isOpen ? '×' : '💬'}
  </button>
</div>

  );
}

export default ChatbotWidget;

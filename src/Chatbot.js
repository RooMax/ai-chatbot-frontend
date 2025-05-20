import React, { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function Chatbot() {
    const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

    const [sessions, setSessions] = useState(() => {
        const saved = JSON.parse(localStorage.getItem('chat_sessions') || '{}');
        return saved;
    });
    const [sessionMeta, setSessionMeta] = useState(() => {
        return JSON.parse(localStorage.getItem('chat_session_meta') || '{}');
    });
    const [activeSessionId, setActiveSessionId] = useState(() => {
        const savedId = localStorage.getItem('active_session_id');
        return savedId || `session_${Date.now()}`;
    });
    const [messages, setMessages] = useState(() => {
        const allSessions = JSON.parse(localStorage.getItem('chat_sessions') || '{}');
        const activeId = localStorage.getItem('active_session_id');
        return activeId && allSessions[activeId] ? allSessions[activeId] : [];
    });

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [selectedModel, setSelectedModel] = useState('openai/gpt-3.5-turbo');
    const [lastUserMessage, setLastUserMessage] = useState(null);
    const [showSessionSelector, setShowSessionSelector] = useState(false);
    const [editingSessionName, setEditingSessionName] = useState(false);
    const [newSessionName, setNewSessionName] = useState('');
    const chatEndRef = useRef(null);

    const getTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const getSessionLabel = () => {
        const count = Object.keys(sessionMeta).length + 1;
        return `Session ${count} – ${getTime()}`;
    };

    const saveSession = (sessionId, messages) => {
        const updatedSessions = { ...sessions, [sessionId]: messages };
        setSessions(updatedSessions);
        localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
        localStorage.setItem('active_session_id', sessionId);
    };

    const saveSessionMeta = (sessionId, label) => {
        const updatedMeta = { ...sessionMeta, [sessionId]: label };
        setSessionMeta(updatedMeta);
        localStorage.setItem('chat_session_meta', JSON.stringify(updatedMeta));
    };

    const renameSession = () => {
        if (!newSessionName.trim()) return;
        saveSessionMeta(activeSessionId, newSessionName.trim());
        setEditingSessionName(false);
        setNewSessionName('');
    };

    const deleteSession = (id) => {
        const updatedSessions = { ...sessions };
        const updatedMeta = { ...sessionMeta };
        delete updatedSessions[id];
        delete updatedMeta[id];
        setSessions(updatedSessions);
        setSessionMeta(updatedMeta);
        localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
        localStorage.setItem('chat_session_meta', JSON.stringify(updatedMeta));
        if (id === activeSessionId) {
            clearChat();
        }
    };

    const exportSession = () => {
        const data = JSON.stringify(messages, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${sessionMeta[activeSessionId] || activeSessionId}.json`;
        link.click();
    };

    const sendMessage = async (overrideInput = null) => {
        if (!isAuthenticated) {
            setMessages((prev) => [...prev, {
              role: 'bot',
              content: '🔒 Please log in to continue using the chatbot.',
              time: getTime(),
            }]);
            return;
          }
          
      
        const messageContent = overrideInput || input;
        const safeInput = typeof messageContent === 'string' ? messageContent.trim() : '';
        if (!safeInput) return;
        const userMsg = { role: 'user', content: safeInput, time: getTime() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setLastUserMessage(safeInput);
        setInput('');
        setLoading(true);
        saveSession(activeSessionId, newMessages);
        setShowSessionSelector(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageContent, model: selectedModel }),
            });
            const reply = await response.text();
            const botMsg = { role: 'bot', content: reply, time: getTime() };
            const updatedMessages = [...newMessages, botMsg];
            setMessages(updatedMessages);
            saveSession(activeSessionId, updatedMessages);
        } catch (err) {
            const errorMsg = { role: 'bot', content: 'Error talking to AI', time: getTime() };
            const updatedMessages = [...newMessages, errorMsg];
            setMessages(updatedMessages);
            saveSession(activeSessionId, updatedMessages);
        }

        setLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (editingSessionName) renameSession();
            else sendMessage();
        }
    };

    const clearChat = () => {
        const newSessionId = `session_${Date.now()}`;
        const label = getSessionLabel();
        setActiveSessionId(newSessionId);
        setMessages([]);
        setInput('');
        setLastUserMessage(null);
        localStorage.setItem('active_session_id', newSessionId);
        saveSessionMeta(newSessionId, label);
        setShowSessionSelector(true);
    };

    const switchSession = (id) => {
        setActiveSessionId(id);
        setMessages(sessions[id] || []);
        localStorage.setItem('active_session_id', id);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            <div className={`flex flex-col h-full ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-950 text-white' : 'bg-white text-gray-900'}`}>
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center justify-between flex-wrap gap-2 px-6 py-4 bg-white/10 border-b border-white/10">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            {showSessionSelector && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        value={activeSessionId}
                                        onChange={(e) => switchSession(e.target.value)}
                                        className={`text-xs rounded px-2 py-1 border ${darkMode ? 'bg-gray-800 text-white border-white/20' : 'bg-white text-black border-gray-300'
                                            }`}
                                    >
                                        {Object.keys(sessions).map((id) => (
                                            <option key={id} value={id}>
                                                {sessionMeta[id] || id}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => {
                                            setEditingSessionName(true);
                                            setNewSessionName(sessionMeta[activeSessionId] || '');
                                        }}
                                        className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    >
                                        ✏️ Rename
                                    </button>

                                    <button
                                        onClick={() => deleteSession(activeSessionId)}
                                        className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        🗑️ Delete
                                    </button>

                                    <button
                                        onClick={exportSession}
                                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        ⬇️ Export
                                    </button>
                                </div>
                            )}

                            {editingSessionName && (
                                <input
                                    value={newSessionName}
                                    onChange={(e) => setNewSessionName(e.target.value)}
                                    onBlur={renameSession}
                                    onKeyDown={(e) => e.key === 'Enter' && renameSession()}
                                    className={`px-2 py-1 text-xs rounded border ${darkMode
                                        ? 'bg-gray-800 text-white border-white/30 placeholder-gray-400'
                                        : 'bg-white text-black border-gray-300 placeholder-gray-500'
                                        }`}
                                    placeholder="Rename session..."
                                    autoFocus
                                />

                            )}
                        </div>

                        <div className="flex gap-2 items-center">
                            {!isAuthenticated ? (
                                <button
                                    onClick={() => loginWithRedirect()}
                                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                    Login
                                </button>
                            ) : (
                                <>
                                    <span className="text-xs text-white">👤 {user?.name}</span>
                                    <button
                                        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                                        className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}

                            <button
                                onClick={clearChat}
                                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="text-xl hover:scale-110 transition-transform"
                            >
                                {darkMode ? '☀️' : '🌙'}
                            </button>
                        </div>

                    </div>


                    <div className="px-6 py-3 border-b border-white/10">
                        <label className="text-sm mr-2">Model:</label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className={`text-sm px-3 py-2 rounded-md backdrop-blur-md border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-white/10 text-white border-white/20' : 'bg-white text-gray-900 border-gray-300'}`}
                        >
                            <option className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} value="openai/gpt-4">GPT-4</option>
                            <option className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} value="mistralai/mixtral-8x7b-instruct">Mistral 7B</option>
                            <option className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                        </select>
                    </div>

                    <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className="flex flex-col max-w-[80%]">
                                    <div className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end flex-row-reverse' : ''}`}>
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white text-xs">
                                            {msg.role === 'user' ? '🧑' : '🤖'}
                                        </div>
                                        <div
                                            className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap shadow ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : darkMode
                                                    ? 'bg-white/10 text-white backdrop-blur-sm border border-white/10'
                                                    : 'bg-gray-200 text-gray-900'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                    <span className="text-xs mt-1 text-gray-400 self-end">{msg.time}</span>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-1 items-center ml-2">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="flex items-center gap-2 px-4 py-3 border-t 
  bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700">

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') sendMessage();
                            }}
                            className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500 
             bg-white text-black placeholder-gray-500 border-gray-300 
             dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
                        />
                        <button
                            onClick={() => {
                                console.log('Send tapped');
                                sendMessage();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                        >
                            Send
                        </button>
                        <button
                            disabled={!lastUserMessage}
                            onClick={() => sendMessage(lastUserMessage)}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition disabled:opacity-30"
                        >
                            🔁
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Chatbot;

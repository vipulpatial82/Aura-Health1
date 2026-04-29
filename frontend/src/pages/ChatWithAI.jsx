import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser, FaCircleNotch, FaPlus, FaHistory, FaTimes } from 'react-icons/fa';
import api from '../api/axiosInstance';
import { v4 as uuidv4 } from 'uuid';

const ChatWithAI = () => {
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [sessionId, setSessionId]     = useState(() => uuidv4());
  const [history, setHistory]         = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    api.get('/chat/history').then(({ data }) => {
      if (data.success) setHistory(data.data);
    }).catch(() => {});
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { message: text, sessionId });
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      // Refresh history after each message
      api.get('/chat/history').then(({ data }) => {
        if (data.success) setHistory(data.data);
      }).catch(() => {});
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to get response.';
      const isBusy = msg.toLowerCase().includes('busy') || msg.toLowerCase().includes('demand') || msg.toLowerCase().includes('quota');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isBusy
          ? '⏳ The AI is currently busy due to high demand. Please wait a few seconds and try again.'
          : '⚠️ ' + msg,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const loadSession = (session) => {
    setSessionId(session.sessionId);
    setMessages(session.messages.map(m => ({ role: m.role, content: m.content })));
    setShowHistory(false);
  };

  const newChat = () => {
    setSessionId(uuidv4());
    setMessages([]);
    setShowHistory(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="p-4 md:p-6 min-h-[calc(100vh-56px)] bg-slate-50 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100">
              <FaRobot className="text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">Medical AI Chat</h1>
              <p className="text-xs text-slate-500">Personalized to your health data</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(!showHistory)}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <FaHistory /> History
            </button>
            <button onClick={newChat}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
              <FaPlus /> New Chat
            </button>
          </div>
        </motion.div>

        <div className="flex gap-4 flex-1">

          {/* History Sidebar */}
          <AnimatePresence>
            {showHistory && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="w-64 flex-shrink-0 card p-4 flex flex-col max-h-[600px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-700">Previous Chats</h3>
                  <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                    <FaTimes className="text-xs" />
                  </button>
                </div>
                <div className="overflow-y-auto space-y-2 flex-1">
                  {history.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No previous chats</p>
                  ) : history.map((session) => (
                    <button key={session.sessionId} onClick={() => loadSession(session)}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-all hover:bg-green-50 border ${
                        session.sessionId === sessionId ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'
                      }`}>
                      <p className="font-bold text-slate-700 truncate">
                        {session.messages[0]?.content?.slice(0, 35) || 'New conversation'}...
                      </p>
                      <p className="text-slate-400 mt-0.5">
                        {session.messages.length} messages · {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Window */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="card p-4 sm:p-6 flex-1 flex flex-col min-h-[500px]">

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                  <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-3 border border-green-100">
                    <FaRobot className="text-2xl" />
                  </div>
                  <p className="text-slate-700 font-bold mb-1">Ask me anything about your health</p>
                  <p className="text-slate-400 text-sm max-w-xs">I know your health data and can give personalized advice.</p>
                  <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {['What does my BMI mean?', 'Is my blood pressure normal?', 'How can I improve my health score?'].map(q => (
                      <button key={q} onClick={() => { setInput(q); }}
                        className="text-xs bg-slate-100 hover:bg-green-50 hover:text-green-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors border border-slate-200">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[80%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 ${
                        msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600'
                      }`}>
                        {msg.role === 'user' ? <FaUser className="text-xs" /> : <FaRobot className="text-xs" />}
                      </div>
                      <div className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-green-600 text-white rounded-tr-sm shadow-md'
                          : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100 shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <FaRobot className="text-xs" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown} disabled={loading}
                  placeholder="Ask about your health..."
                  className="input-field flex-1 py-3.5 text-sm" />
                <button onClick={sendMessage} disabled={loading || !input.trim()}
                  className="flex-shrink-0 p-3.5 bg-gradient-to-tr from-green-700 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-500 active:scale-[0.97] transition-all duration-300 disabled:opacity-50 shadow-[0_8px_20px_-6px_rgba(22,163,74,0.5)]">
                  {loading ? <FaCircleNotch className="animate-spin text-sm" /> : <FaPaperPlane className="text-sm" />}
                </button>
              </div>
              <p className="text-xs text-center text-slate-400 mt-2">
                Not a substitute for professional medical advice.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithAI;

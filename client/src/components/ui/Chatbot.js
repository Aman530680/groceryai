import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm GroceryAI 🥦 Ask me anything about cooking, recipes, or groceries!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const { user } = useAuth();
  const { addMissingIngredients } = useCart();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', {
        messages: newMessages.filter((m) => m.role !== 'system').slice(-10),
      });

      const reply = data.reply;

      // Check for cart action
      const actionMatch = reply.match(/\{"action":\s*"ADD_TO_CART".*?\}/s);
      if (actionMatch) {
        try {
          const action = JSON.parse(actionMatch[0]);
          if (action.action === 'ADD_TO_CART' && user) {
            await addMissingIngredients(action.items);
          }
        } catch {}
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: reply.replace(/\{.*?\}/s, '').trim() }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice not supported in this browser');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.start();
  };

  const quickPrompts = [
    'What can I cook with rice and eggs?',
    'Give me a healthy breakfast',
    'Add pasta ingredients to cart',
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] card shadow-2xl flex flex-col animate-slide-up">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-xl flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
            <div>
              <div className="font-semibold">GroceryAI Assistant</div>
              <div className="text-xs text-green-200 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-300 rounded-full inline-block"></span> Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1">
              {quickPrompts.map((p) => (
                <button key={p} onClick={() => sendMessage(p)} className="text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full hover:bg-primary-100 transition-colors">
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              className="input text-sm py-1.5"
            />
            <button onClick={startVoice} className={`p-2 rounded-lg transition-colors ${listening ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              🎤
            </button>
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="btn-primary py-1.5 px-3 text-sm">
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

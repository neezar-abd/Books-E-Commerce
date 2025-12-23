'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI, Chat } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Welcome to Lumina Books. I am your literary concierge. How may I assist you in finding your next great read today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Ref to hold the chat session instance
  const chatSessionRef = useRef<Chat | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const initializeChat = () => {
    if (!chatSessionRef.current) {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        console.error('Gemini API Key is not configured');
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      chatSessionRef.current = ai.chats.create({
        model: 'gemini-3-pro-preview',
        config: {
          systemInstruction: "You are a sophisticated, helpful, and elegant literary assistant for 'Lumina Books', a high-end minimalist bookstore. Your tone is professional, warm, and well-read. You help users find books, discuss genres (Fiction, Non-Fiction, Art & Design, Psychology), and answer questions about the store's features (Free Shipping over $180, 24/7 support). Keep responses concise but eloquent.",
        },
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      initializeChat();
      
      if (chatSessionRef.current) {
        const result = await chatSessionRef.current.sendMessage({ message: userMessage });
        const responseText = result.text || "I apologize, but I couldn't generate a response. Please try again.";
        
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I am momentarily unable to access the archives. Please try again shortly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[90vw] md:w-[400px] h-[500px] rounded-3xl shadow-2xl mb-4 border border-gray-100 flex flex-col overflow-hidden animate-fade-in-up">
          
          {/* Header */}
          <div className="bg-primary p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-full">
                <Sparkles size={18} className="text-secondary" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Lumina Assistant</h3>
                <p className="text-[10px] text-gray-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-secondary text-primary' : 'bg-primary text-white'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div 
                  className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-white border border-gray-100 text-primary rounded-tr-none shadow-sm' 
                      : 'bg-primary text-white rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                  <Bot size={14} />
                </div>
                <div className="bg-primary text-white p-3 rounded-2xl rounded-tl-none shadow-md flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-secondary" />
                  <span className="text-xs text-gray-300">Consulting library...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-gray-200 focus-within:border-primary transition-colors">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about books..."
                className="flex-1 bg-transparent outline-none text-sm text-primary placeholder-gray-400"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="text-primary hover:text-secondary disabled:opacity-30 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-[10px] text-center text-gray-400 mt-2">
              Powered by Gemini 3 Pro
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-soft hover:bg-secondary hover:text-primary transition-all duration-300 flex items-center justify-center group"
      >
        {isOpen ? (
          <X size={24} className="group-hover:rotate-90 transition-transform" />
        ) : (
          <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
};

export default ChatBot;
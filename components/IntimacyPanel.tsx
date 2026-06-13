
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getIntimacyAdvice } from '../services/geminiService';
import { Send, Heart, Sparkles, Loader2, User, Clock, ShieldCheck, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const IntimacyPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '💖 **Nova Intimacy Expert Online.**\n\nI am here to provide you with expert, respectful, and highly effective advice on physical and emotional intimacy. Whether you want to master the art of foreplay, understand your partner better, or explore new techniques to enhance pleasure, I am ready to guide you.\n\nHow can I help you and your partner today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiHistory, setApiHistory] = useState<any[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const now = new Date();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: now,
    };
    setMessages(prev => [...prev, userMsg]);

    const updatedHistory = [...apiHistory, { role: 'user', parts: [{ text: input }] }];
    
    setInput('');
    setIsLoading(true);

    try {
      const text = await getIntimacyAdvice(updatedHistory);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      setApiHistory([...updatedHistory, { role: 'model', parts: [{ text: text }] }]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden">
      <div className="bg-rose-600/10 border-b border-rose-500/20 p-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <Heart className="text-rose-400" size={16} />
          <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Nova Intimacy • Expert Guidance</span>
        </div>
        <div className="flex items-center gap-2 bg-rose-500/20 px-2 py-1 rounded-lg">
          <ShieldCheck size={12} className="text-rose-300" />
          <span className="text-[10px] font-black text-rose-300">Safe & Private</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[92%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-rose-900/50' : 'bg-slate-800'}`}>
                {m.role === 'user' ? <User size={16} className="text-rose-400" /> : <Heart size={16} className="text-rose-400" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-lg border relative ${m.role === 'user' ? 'bg-rose-600 border-rose-500 text-white rounded-tr-none' : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'}`}>
                <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert text-white' : 'prose-invert text-slate-200'}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>
                <span className={`text-[9px] mt-2 block font-bold uppercase tracking-widest ${m.role === 'user' ? 'text-rose-200/60' : 'text-slate-500'} flex items-center gap-1`}>
                  <Clock size={10}/> {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 p-3 px-5 rounded-2xl border border-slate-800 flex items-center gap-3">
              <RefreshCcw className="animate-spin text-rose-500" size={16} />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Consulting Intimacy Protocols...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-900/50 sticky bottom-0 z-10">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about foreplay or techniques..."
            autoComplete="off"
            className="flex-1 p-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-slate-100 text-sm shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-rose-600 text-white p-4 rounded-2xl shadow-xl shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntimacyPanel;

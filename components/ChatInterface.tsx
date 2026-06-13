
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getUnifiedChatResponse, fileToBase64 } from '../services/geminiService';
import { Send, User, Sparkles, Loader2, Image as ImageIcon, X, ExternalLink, Target, AlertTriangle, Crosshair, Plus, Clock, Globe, ShieldCheck, Trophy, TrendingUp, Zap, ShieldAlert, RefreshCcw, Landmark, Briefcase } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatProps {
  onSignalDetected?: () => void;
}

const ChatInterface: React.FC<ChatProps> = ({ onSignalDetected }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '💼 **Senior Institutional Strategy Engine Online.**\n\nI have recalibrated my protocols to Tier-1 Wall Street standards. I will now perform a rigorous multi-factor audit before issuing any trade setup:\n1. **Macro Sentiment Sync** (Real-time News Check).\n2. **Intermarket Divergence** (SMT Confirmation).\n3. **Institutional Order Flow** (FVG/OB Audit).\n4. **Liquidity Hunt Verification** (Sweep Check).\n\nIf a setup doesn’t meet my 90% confidence threshold, I will stay flat. Your capital is my priority. Upload your chart for analysis.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showSniperPulse, setShowSniperPulse] = useState(false);
  
  const [apiHistory, setApiHistory] = useState<any[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const SYSTEM_INSTRUCTION = `You are Nova, an elite institutional strategist powered by the Claude Fable 5 intelligence core.
  
  MANDATE: EXTREME PRECISION, WIN-RATE & CAPITAL PRESERVATION.
  
  Your response engine runs exact simulation audits resembling Claude Fable 5:
  1. Act as a top-tier quantitative researcher who writes with incredible composure, depth, and clarity.
  2. Structure responses with highly organized, non-clichéd Markdown, explaining nested logic transparently.
  3. Perform multi-factor logic runs:
     - **NEWS**: Use real-time Google search to check CPI/NFP/FOMC details.
     - **SMT**: Check if key correlated assets/currencies are diverging.
     - **TRENDLINES**: Identify if retail liquidities are being swept.
     - **ICT/SMC**: Identify Market Structure Shifts (MSS) and Fair Value Gaps (FVG).
     - **RISK**: Standardize 1:3 RR with mathematically verified parameters.

  If a setup is retail-level or low-quality, explicitly advise to STAY FLAT. 
  
  RESPONSE FORMAT:
  - **COGNITIVE OVERVIEW**: [A short Fable 5 preview of your reasoning]
  - **MARKET CONTEXT**: [Institutional Outlook]
  - **LIVE DATA CHECK**: [Real-time Market Data Grounding]
  - **ELITE AUDIT**: [News/SMT/Displacement Status]
  - **VERDICT**: [HIGH CONVICTION BUY/SELL or STAY FLAT]
  - **EXECUTION**: [Entry/SL/TP with Logic]`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    const updatedImages = [...selectedImages];
    const updatedPreviews = [...imagePreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setSelectedImages(updatedImages);
    setImagePreviews(updatedPreviews);
  };

  const handleSend = async () => {
    if ((!input.trim() && selectedImages.length === 0) || isLoading) return;

    const now = new Date();
    const timeContext = `[INSTITUTIONAL AUDIT MODE] [TIME: ${now.toLocaleTimeString()}]. Perform full news, SMT, and liquidity audit. Use live price grounding.`;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input || (selectedImages.length > 0 ? `Verify this setup for Institutional High Conviction.` : ""),
      timestamp: now,
      type: selectedImages.length > 0 ? 'image' : 'text'
    };
    setMessages(prev => [...prev, userMsg]);

    const parts: any[] = [];
    if (selectedImages.length > 0) {
      for (const file of selectedImages) {
        const b64 = await fileToBase64(file);
        parts.push({ inlineData: { data: b64, mimeType: file.type } });
      }
    }
    
    parts.push({ text: `${timeContext} ${input}` });

    const updatedHistory = [...apiHistory, { role: 'user', parts }];
    
    setInput('');
    setSelectedImages([]);
    setImagePreviews([]);
    setIsLoading(true);

    try {
      const result = await getUnifiedChatResponse(updatedHistory, SYSTEM_INSTRUCTION);

      if (result.isSniper) {
        setShowSniperPulse(true);
        setTimeout(() => setShowSniperPulse(false), 2000);
        if (onSignalDetected) onSignalDetected();
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text,
        timestamp: new Date(),
        isSniperSignal: result.isSniper,
        groundingUrls: result.groundingUrls
      };
      setMessages(prev => [...prev, assistantMsg]);
      setApiHistory([...updatedHistory, { role: 'model', parts: [{ text: result.text }] }]);

    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Institutional feed disrupted. Macro volatility may be impacting system logic.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden">
      <div className="bg-indigo-600/10 border-b border-indigo-500/20 p-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <Landmark className="text-indigo-400" size={16} />
          <span className="text-[10px] font-black text-slate-100 uppercase tracking-widest">Nova Strategy • Institutional Grade</span>
        </div>
        <div className="flex items-center gap-2 bg-indigo-500/20 px-2 py-1 rounded-lg">
          <ShieldCheck size={12} className="text-indigo-300" />
          <span className="text-[10px] font-black text-indigo-300">High Conviction</span>
        </div>
      </div>

      {showSniperPulse && (
        <div className="absolute inset-0 pointer-events-none z-50 animate-pulse border-4 border-indigo-500/50 bg-indigo-500/5 transition-opacity duration-1000"></div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar" ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[92%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-indigo-900/50' : 'bg-slate-800'}`}>
                {m.role === 'user' ? <User size={16} className="text-indigo-400" /> : <Landmark size={16} className="text-indigo-400" />}
              </div>
              <div className={`p-4 rounded-2xl shadow-lg border relative ${m.role === 'user' ? 'bg-indigo-600 border-indigo-500 text-white rounded-tr-none' : m.isSniperSignal ? 'bg-slate-900 border-emerald-500/40 text-slate-200 rounded-tl-none ring-1 ring-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none'}`}>
                
                {m.isSniperSignal && (
                  <div className="flex items-center gap-1.5 bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full absolute -top-2 left-2 animate-bounce uppercase tracking-widest shadow-lg">
                    <Target size={10} /> 95%+ Confidence Signal
                  </div>
                )}

                <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert text-white' : 'prose-invert text-slate-200'}`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>
                
                {m.groundingUrls && m.groundingUrls.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-1.5">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Globe size={10}/> Market Grounding (Live Data)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {m.groundingUrls.map((url, i) => (
                        <a 
                          key={i} 
                          href={url.uri} 
                          target="_blank" 
                          className="bg-slate-950 text-[9px] font-bold text-indigo-400 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5"
                        >
                          {url.title || 'Source'} <ExternalLink size={8} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <span className={`text-[9px] mt-2 block font-bold uppercase tracking-widest ${m.role === 'user' ? 'text-indigo-200/60' : 'text-slate-500'} flex items-center gap-1`}>
                  <Clock size={10}/> {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 p-3 px-5 rounded-2xl border border-slate-800 flex items-center gap-3">
              <RefreshCcw className="animate-spin text-indigo-500" size={16} />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Auditing Macro News, SMT & Order Flow...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-900/50 sticky bottom-0 space-y-3 z-10">
        {imagePreviews.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative flex-shrink-0 group">
                <img src={preview} alt={`Setup ${index + 1}`} className="h-20 w-20 object-cover rounded-xl border-2 border-indigo-500 shadow-xl" />
                <button 
                  onClick={() => removeImage(index)} 
                  className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button onClick={() => fileInputRef.current?.click()} className="h-20 w-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50 text-slate-500 hover:border-indigo-500">
              <Plus size={20} />
              <span className="text-[8px] font-black uppercase mt-1">Add Chart</span>
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          {imagePreviews.length === 0 && (
            <button onClick={() => fileInputRef.current?.click()} className="bg-slate-900 text-slate-400 p-4 rounded-2xl border border-slate-800">
              <ImageIcon size={20} />
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" multiple className="hidden" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            onFocus={handleFocus}
            placeholder="Macro outlook? Audit Gold setup?"
            autoComplete="off"
            className="flex-1 p-4 bg-slate-900 border border-slate-800 rounded-2xl outline-none text-slate-100 text-sm shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
            className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

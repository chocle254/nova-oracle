
import React, { useState, useRef, useEffect } from 'react';
import { getPredictionResponse, getBatchPredictionResponse } from '../services/geminiService';
import { Search, TrendingUp, Target, Globe, Loader2, Info, ChevronRight, BarChart3, Trophy, Gavel, ExternalLink, Zap, Users, ShieldAlert, ImageIcon, X, Sparkles, FileStack } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PredictorPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [prediction, setPrediction] = useState<string | null>(null);
  const [urls, setUrls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const statuses = [
    "Scanning All Fixtures in Images...",
    "Filtering for High-Conviction Matchups...",
    "Auditing Squad Injury Reports...",
    "Evaluating Bench Impact & Tactical Depth...",
    "Simulating Correct Score Probability (95%+)...",
    "Finalizing Top 10 High-Confidence Verdicts..."
  ];

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      let i = 0;
      setStatus(statuses[0]);
      interval = setInterval(() => {
        i = (i + 1) % statuses.length;
        setStatus(statuses[i]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Fix: Explicitly type files as File[] to resolve 'unknown' type error in URL.createObjectURL
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files]);
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (idx: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePredict = async () => {
    if (!query.trim() && selectedImages.length === 0) return;
    setIsLoading(true);
    setPrediction(null);
    setUrls([]);

    try {
      if (selectedImages.length > 0) {
        // Batch analysis mode
        const res = await getBatchPredictionResponse(selectedImages);
        setPrediction(res.text);
        setUrls(res.urls);
      } else {
        // Text mode
        const res = await getPredictionResponse(query);
        setPrediction(res.text);
        setUrls(res.urls);
      }
    } catch (err) {
      setPrediction("Prediction failed. The future is currently obscured by high volatility.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: "PL Correct Score", icon: <Trophy size={14}/>, text: "Provide a FINAL CORRECT SCORE VERDICT for the next Arsenal vs Liverpool match. Audit injuries, bench strength, and recent coaching changes." },
    { label: "S&P 500 Target", icon: <BarChart3 size={14}/>, text: "Analyze the S&P 500. Will it be higher or lower in 30 days? Provide targets." },
    { label: "BTC Forecast", icon: <Zap size={14}/>, text: "Will Bitcoin hit $100k this month? Analyze exchange inflows and macro data." },
    { label: "Election Odds", icon: <Gavel size={14}/>, text: "Analyze current polling and sentiment for the upcoming major election." },
  ];

  return (
    <div className="p-4 space-y-6 bg-slate-950 pb-24 h-full overflow-y-auto no-scrollbar">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
        <h2 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tighter text-slate-100">
          <Target className="text-indigo-400" size={32} /> Nova Oracle
        </h2>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          High-precision 95%+ Correct Score forecasting.
        </p>
      </div>

      {!prediction && !isLoading && (
        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {quickPrompts.map((p, i) => (
            <button 
              key={i} 
              onClick={() => { setQuery(p.text); }}
              className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-start gap-2 text-left hover:border-indigo-500 hover:bg-slate-900 transition-all group"
            >
              <div className="text-indigo-400 group-hover:scale-110 transition-transform">{p.icon}</div>
              <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-slate-200">{p.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
            placeholder="Search match or ask the Oracle..."
            className="w-full p-5 pr-28 rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 focus:border-indigo-500 outline-none font-bold placeholder:text-slate-700 shadow-lg"
          />
          <div className="absolute right-3 top-3 flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-800 text-indigo-400 p-2.5 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ImageIcon size={20} />
            </button>
            <button 
              onClick={handlePredict}
              disabled={isLoading || (!query.trim() && selectedImages.length === 0)}
              className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            </button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" multiple className="hidden" />
        </div>

        {previews.length > 0 && !prediction && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <FileStack size={14}/> Batch Fixtures ({selectedImages.length})
              </h3>
              <button onClick={() => {setSelectedImages([]); setPreviews([]);}} className="text-[10px] text-rose-500 font-bold uppercase">Clear All</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} className="w-full h-24 object-cover rounded-xl border border-slate-800" />
                  <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1 rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform">
                    <X size={10} />
                  </button>
                </div>
              ))}
              {previews.length < 9 && (
                <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 hover:text-indigo-400 hover:border-indigo-500 transition-all">
                  <Plus size={24} />
                </button>
              )}
            </div>
            <button 
              onClick={handlePredict}
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><Target size={16}/> Analyze Batch & Pick Top 10</>}
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-6 animate-in zoom-in-95">
          <div className="relative">
             <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
             <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={24} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{status}</p>
            <p className="text-xs text-slate-500 font-medium">Deep auditing lineups, injuries, and coach dynamics...</p>
          </div>
        </div>
      )}

      {prediction && (
        <div ref={resultRef} className="bg-slate-900 rounded-[2.5rem] p-8 border border-indigo-500/20 shadow-2xl animate-in zoom-in-95 duration-500 relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Users size={100} />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-2 font-black text-[10px] text-indigo-400 uppercase tracking-[0.2em]">
              <Target size={18} /> {selectedImages.length > 0 ? "Batch Strategy Audit" : "Definitive Match Audit"}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-2 py-1 rounded-lg">95% Confidence</span>
            </div>
          </div>
          
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed relative z-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {prediction}
            </ReactMarkdown>
          </div>
          
          {urls.length > 0 && (
            <div className="mt-10 pt-8 border-t border-slate-800 relative z-10">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Globe size={12} className="text-indigo-400"/> Primary Intel Sources
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {urls.slice(0, 3).map((url, i) => (
                  <a key={i} href={url.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all group">
                    <span className="text-[10px] font-bold text-slate-400 truncate w-48">{url.title}</span>
                    <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={() => { setPrediction(null); setQuery(''); setSelectedImages([]); setPreviews([]); }}
            className="mt-8 w-full py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-100 transition-all"
          >
            New Prediction
          </button>
        </div>
      )}

      {!prediction && !isLoading && (
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] p-6 flex gap-4">
          <ShieldAlert className="text-indigo-400 shrink-0" size={20} />
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-300">Analytical Mandate</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Nova Oracle is designed to simulate match outcomes using high-fidelity squad data. Batch analysis identifies the 10 highest-probability Correct Score verdicts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const Plus = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default PredictorPanel;

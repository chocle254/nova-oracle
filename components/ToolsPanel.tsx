
import React, { useState } from 'react';
import { analyzeMedia } from '../services/geminiService';
import { Camera, Video, FileImage, Loader2, Sparkles, Lightbulb, TrendingUp, Coins, RefreshCcw, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ToolsPanel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'image' | 'video'>('image');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      // The new "Gain Engine" prompt
      const prompt = `Act as a Master Wealth Strategist and Monetization Expert. 
      Analyze this media to find HIDDEN OPPORTUNITIES to gain money, leverage, or time.
      
      Structure your response as follows:
      1. **OPPORTUNITY SPOTTED**: What is the unique value in this content?
      2. **GAIN STRATEGIES**: Provide 3 concrete ways to monetize this, save money using it, or turn it into a professional asset.
      3. **ACTION BLUEPRINT**: Step-by-step instructions on what to do in the next 24 hours.
      4. **PROJECTED GAIN**: Estimate the potential ROI (Return on Investment) or time-saving value.
      
      Be creative, thorough, and institutional in your thinking. Use Markdown with **bold** headers.`;
      
      const res = await analyzeMedia(selectedFile, prompt, selectedFile.type);
      setAnalysis(res || "I couldn't identify a clear path to gain from this media yet. Try a different angle.");
    } catch (err) {
      setAnalysis("The strategy engine is overloaded. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 bg-slate-950 pb-24 h-full overflow-y-auto no-scrollbar">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
        <h2 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tighter text-slate-100">
          <TrendingUp className="text-emerald-400" size={32} /> Gain Engine
        </h2>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          Upload charts, products, locations, or skills. Nova will find the **monetization path**.
        </p>
      </div>

      <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 space-y-6 shadow-sm">
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button 
            onClick={() => { setType('image'); setSelectedFile(null); setPreview(null); setAnalysis(null); }}
            className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${type === 'image' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Camera size={16} /> Image
          </button>
          <button 
            onClick={() => { setType('video'); setSelectedFile(null); setPreview(null); setAnalysis(null); }}
            className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${type === 'video' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Video size={16} /> Video
          </button>
        </div>

        <label className="block w-full cursor-pointer group">
          <div className="border-2 border-dashed border-slate-800 group-hover:border-emerald-500/50 rounded-3xl p-12 flex flex-col items-center justify-center transition-all bg-slate-950/30">
            {preview ? (
              type === 'image' ? (
                <img src={preview} alt="Preview" className="w-full max-h-56 object-contain rounded-2xl border border-slate-800 shadow-2xl" />
              ) : (
                <video src={preview} className="w-full max-h-56 object-contain rounded-2xl border border-slate-800 shadow-2xl" controls />
              )
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800 group-hover:scale-110 transition-transform">
                  <FileImage className="text-emerald-500/50" size={32} />
                </div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Drop Media for Strategy</p>
              </div>
            )}
            <input type="file" accept={type === 'image' ? "image/*" : "video/*"} className="hidden" onChange={handleFileChange} />
          </div>
        </label>

        {selectedFile && !analysis && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/30 hover:bg-emerald-500 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <><Lightbulb size={18} /> Generate Strategy</>}
          </button>
        )}
      </div>

      {analysis && (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-emerald-500/20 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-500 relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Coins size={100} />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="flex items-center gap-2 font-black text-[10px] text-emerald-400 uppercase tracking-[0.2em]">
              <TrendingUp size={18} /> Strategy Blueprint
            </h3>
            <button onClick={() => { setSelectedFile(null); setPreview(null); setAnalysis(null); }} className="text-slate-500 hover:text-rose-400 transition-colors">
               <RefreshCcw size={16} />
            </button>
          </div>
          
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed relative z-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {analysis}
            </ReactMarkdown>
          </div>
          
          <div className="mt-10 pt-8 border-t border-slate-800 relative z-10 flex gap-4">
            <button 
              onClick={() => { setSelectedFile(null); setPreview(null); setAnalysis(null); }}
              className="flex-1 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-100 transition-all"
            >
              Discard
            </button>
            <button 
              className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              Add to Goals <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolsPanel;

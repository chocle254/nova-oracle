
import React, { useState, useEffect, useRef } from 'react';
import { getThinkingAdvice, getMapsAdvice } from '../services/geminiService';
import { Search, MapPin, BrainCircuit, ExternalLink, Loader2, DollarSign, Crosshair, CheckCircle2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AdviserPanel: React.FC = () => {
  const [advice, setAdvice] = useState('');
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'thinking' | 'maps'>('thinking');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === 'maps' && !currentCoords) {
      fetchLocation();
    }
  }, [mode]);

  const handleFocus = () => {
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const fetchLocation = () => {
    setLocationStatus('fetching');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocationStatus('success');
      },
      (err) => {
        console.error("Location error:", err);
        setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleAsk = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setAdvice('');
    setLinks([]);

    try {
      if (mode === 'thinking') {
        const res = await getThinkingAdvice(`User wants advice on: ${query}. Use deep reasoning for financial strategies.`);
        setAdvice(res || "I couldn't generate advice right now.");
      } else {
        // If maps mode, ensure we have the best possible location data
        let promptText = `Find local financial opportunities, businesses, or services related to: ${query}.`;
        
        if (currentCoords) {
          // Explicitly telling the model where we are to avoid default hallucinations
          promptText += ` I am currently located at coordinates latitude ${currentCoords.lat}, longitude ${currentCoords.lng}. Please provide advice specific to this immediate area.`;
        }

        const res = await getMapsAdvice(promptText, currentCoords || undefined);
        setAdvice(res.text || "No local data found.");
        setLinks(res.urls);
      }
    } catch (error) {
      console.error(error);
      setAdvice("Error connecting to advisor. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 bg-slate-950 pb-20">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-xl">
        <h2 className="text-2xl font-black mb-2 flex items-center gap-2 tracking-tight">
          <DollarSign className="text-indigo-400" /> AI Strategy
        </h2>
        <p className="text-slate-500 text-sm font-medium">Deep reasoning and local mapping to maximize growth.</p>
      </div>

      <div className="space-y-4">
        <div className="flex bg-slate-900 rounded-2xl p-1 border border-slate-800">
          <button 
            onClick={() => setMode('thinking')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${mode === 'thinking' ? 'bg-slate-800 text-indigo-400 shadow-xl' : 'text-slate-600'}`}
          >
            <BrainCircuit size={16} /> Strategy
          </button>
          <button 
            onClick={() => setMode('maps')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest ${mode === 'maps' ? 'bg-slate-800 text-indigo-400 shadow-xl' : 'text-slate-600'}`}
          >
            <MapPin size={16} /> Nearby
          </button>
        </div>

        {mode === 'maps' && (
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-2">
              <Crosshair size={14} className={locationStatus === 'fetching' ? 'animate-spin text-indigo-400' : 'text-slate-500'} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {locationStatus === 'fetching' && 'Locating you...'}
                {locationStatus === 'success' && 'Location Secured'}
                {locationStatus === 'error' && 'Location Access Denied'}
                {locationStatus === 'idle' && 'Waiting for location'}
              </span>
            </div>
            {locationStatus === 'error' ? (
               <button onClick={fetchLocation} className="text-rose-400 text-[10px] font-black uppercase hover:underline">Retry</button>
            ) : locationStatus === 'success' ? (
              <CheckCircle2 size={14} className="text-emerald-500" />
            ) : null}
          </div>
        )}

        <div className="relative">
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            onFocus={handleFocus}
            placeholder={mode === 'thinking' ? "Ask for a wealth strategy..." : "Local jobs, banks, or markets..."}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className="w-full p-5 pr-14 rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 focus:border-indigo-500 outline-none font-bold placeholder:text-slate-700 shadow-lg"
          />
          <button 
            onClick={handleAsk}
            disabled={isLoading || (mode === 'maps' && locationStatus === 'fetching')}
            className="absolute right-3 top-3 bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
          </button>
        </div>
      </div>

      {advice && (
        <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-black text-xs uppercase tracking-widest">
             {mode === 'thinking' ? <BrainCircuit size={18}/> : <MapPin size={18}/>}
             <span>Advisor Output</span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {advice}
            </ReactMarkdown>
          </div>
          
          {links.length > 0 && (mode === 'maps') && (
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest">Map Results</h3>
              <div className="space-y-2">
                {links.map((link, i) => (
                  <a key={i} href={link.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-indigo-500 transition-all group">
                    <span className="text-xs font-bold text-slate-400 truncate mr-4">{link.title || 'Location'}</span>
                    <ExternalLink size={14} className="text-indigo-500 group-hover:scale-110" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {locationStatus === 'error' && mode === 'maps' && !advice && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="text-rose-400 shrink-0" size={20} />
          <p className="text-xs text-rose-300">
            Nova couldn't verify your location. We might provide general global advice or default to Nairobi if coordinates are missing. Please allow location access for local insights.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdviserPanel;

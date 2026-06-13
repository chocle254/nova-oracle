
import React, { useState, useEffect, useRef } from 'react';
import { AppTab, Transaction, DashboardModule, StudyTopic, Wallet, Investment, CurrencyCode, ForexNewsAlert } from './types';
import { 
  LayoutDashboard, MessageSquare, Briefcase, Wallet as WalletIcon, Sparkles, Plus, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Heart, Globe, BookOpen, 
  ChevronRight, ArrowLeft, Loader2, ExternalLink, Info, CreditCard, Landmark, 
  Coins, Smartphone, PieChart as PieIcon, Layers, Mic, X, FileText, Zap, Lightbulb,
  Target, BriefcaseBusiness, AlertCircle, TrendingDown, RefreshCcw, Smile, Clock, BarChart3,
  Building
} from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import AdviserPanel from './components/AdviserPanel';
import PredictorPanel from './components/PredictorPanel';
import TransactionForm from './components/TransactionForm';
import IntimacyPanel from './components/IntimacyPanel';
import TechHubPanel from './components/TechHubPanel';
import StartupValidator from './components/StartupValidator';
import CodeWebAuditor from './components/CodeWebAuditor';
import { GoogleGenAI, Modality } from "@google/genai";
import { getFastResponse, getSearchResponse, getFinancialReport, encodeBase64, decodeBase64, decodeAudioData, getForexNewsAlerts } from './services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CURRENCIES: {code: CurrencyCode, symbol: string}[] = [
  { code: 'USD', symbol: '$' },
  { code: 'KES', symbol: 'KSh' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'JPY', symbol: '¥' },
];

const STUDY_LIBRARY: StudyTopic[] = [
  { id: '1', title: 'Investing for Beginners', category: 'Finance', description: 'Understand stocks, bonds, and ETFs.' },
  { id: '2', title: 'The Art of Saving', category: 'Finance', description: 'Techniques for building a robust safety net.' },
  { id: '3', title: 'Crypto Fundamentals', category: 'Forex', description: 'What is blockchain and how does bitcoin work?' },
  { id: '4', title: 'Mindful Spending', category: 'Wellbeing', description: 'Emotional triggers and how to manage them.' },
];

const REACTION_EMOJIS = ['🎯', '📈', '📉', '💰', '🔥', '🚀', '🤔', '👍', '💹', '💎'];

// Isolated component for the clock to prevent parent re-renders every second
const MarketClock = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [utcTime, setUtcTime] = useState(new Date().toLocaleTimeString('en-US', { timeZone: 'UTC' }));
  const [eatTime, setEatTime] = useState(new Date().toLocaleTimeString('en-US', { timeZone: 'Africa/Nairobi' }));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      setUtcTime(now.toLocaleTimeString('en-US', { timeZone: 'UTC' }));
      setEatTime(now.toLocaleTimeString('en-US', { timeZone: 'Africa/Nairobi' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <span className="flex flex-col items-start gap-0.5">
      <span className="text-white font-black">{eatTime} (EAT)</span>
      <span className="text-[8px] opacity-60">UTC: {utcTime}</span>
    </span>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [activeModule, setActiveModule] = useState<DashboardModule>('none');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [wallets, setWallets] = useState<Wallet[]>([
    { id: 'w1', name: 'MPesa', balance: 1200, type: 'mobile' },
    { id: 'w2', name: 'Bank Account', balance: 4500, type: 'bank' },
    { id: 'w3', name: 'MMF Wallet', balance: 500, type: 'mmf' }
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', amount: 5000, category: 'Income', date: new Date().toISOString(), description: 'Salary', type: 'income', walletId: 'w2', destination: 'ready_to_use' },
    { id: '2', amount: 45, category: 'Food & Drink', date: new Date().toISOString(), description: 'Lunch at Cafe', type: 'expense', walletId: 'w1' },
    { id: '3', amount: 120, category: 'Utilities', date: new Date().toISOString(), description: 'Electricity Bill', type: 'expense', walletId: 'w1' }
  ]);

  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [financialReport, setFinancialReport] = useState<string | null>(null);
  const [wisdom, setWisdom] = useState<string>('Success is the sum of small efforts, repeated day in and day out.');
  const [opportunities, setOpportunities] = useState<{text: string, urls: any[]}>({text: '', urls: []});
  const [isLoadingModule, setIsLoadingModule] = useState(false);
  const [forexAlerts, setForexAlerts] = useState<ForexNewsAlert[]>([]);
  const [forexGroundingUrls, setForexGroundingUrls] = useState<{uri: string, title: string}[]>([]);
  const [isLoadingForex, setIsLoadingForex] = useState(false);
  const [hasChatSignal, setHasChatSignal] = useState(false);
  const [viewportHeight, setViewportHeight] = useState('100vh');

  const activeCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  const liveSessionRef = useRef<any>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  // Sync app height with mobile visual viewport (keyboard awareness)
  useEffect(() => {
    const handleVisualViewportResize = () => {
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
      window.visualViewport.addEventListener('scroll', handleVisualViewportResize);
      handleVisualViewportResize(); // Initial call
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportResize);
      }
    };
  }, []);

  useEffect(() => {
    loadWisdom();
    loadOpportunities();
  }, []);

  const loadWisdom = async () => {
    const res = await getFastResponse("Provide one short, powerful wise saying or financial advice about growth and discipline in one sentence.");
    if (res) setWisdom(res);
  };

  const loadOpportunities = async () => {
    setIsLoadingModule(true);
    const res = await getSearchResponse("High-paying remote side hustles or digital investment opportunities trending this month for a tech-savvy user.");
    setOpportunities(res);
    setIsLoadingModule(false);
  };

  const loadForexIntel = async () => {
    setIsLoadingForex(true);
    try {
      const { alerts, urls } = await getForexNewsAlerts();
      setForexAlerts(alerts);
      setForexGroundingUrls(urls);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingForex(false);
    }
  };

  useEffect(() => {
    if (activeModule === 'forex') {
      loadForexIntel();
    }
  }, [activeModule]);

  const onSignalDetected = () => {
    if (activeTab !== AppTab.CHAT) {
      setHasChatSignal(true);
    }
  };

  useEffect(() => {
    if (activeTab === AppTab.CHAT) {
      setHasChatSignal(false);
    }
  }, [activeTab]);

  const startLiveMode = async () => {
    setIsLiveActive(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    sessionPromiseRef.current = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ 
              media: { data: encodeBase64(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
            }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (msg) => {
          const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData && audioContextRef.current) {
            const ctx = audioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decodeBase64(audioData), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
          }
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "You are Nova, a helpful voice financial assistant. You are currently monitoring market Killzones. Advise users based on time and price."
      }
    });
    
    liveSessionRef.current = await sessionPromiseRef.current;
  };

  const sendEmojiReaction = (emoji: string) => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        session.sendRealtimeInput({ text: emoji });
      });
    }
  };

  const stopLiveMode = () => {
    liveSessionRef.current?.close();
    setIsLiveActive(false);
    audioContextRef.current?.close();
    sessionPromiseRef.current = null;
  };

  const generateReport = async () => {
    setIsLoadingModule(true);
    const report = await getFinancialReport(transactions, wallets, currency);
    setFinancialReport(report);
    setIsLoadingModule(false);
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newT = { ...t, id: Date.now().toString() };
    setTransactions([newT, ...transactions]);
    setWallets(prev => prev.map(w => w.id === t.walletId ? { ...w, balance: t.type === 'income' ? w.balance + t.amount : w.balance - t.amount } : w));
  };

  const addWallet = (name: string, type: Wallet['type'], initialBalance: number) => {
    setWallets([...wallets, { id: Date.now().toString(), name, type, balance: initialBalance }]);
    setIsAddingWallet(false);
  };

  const formatMoney = (val: number) => `${activeCurrency.symbol}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Corrected Killzone logic to be more inclusive of actual market volatility periods
  const getActiveSession = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    
    // London: 07:00 - 16:00 UTC (Approx 10AM - 7PM EAT)
    if (utcHour >= 7 && utcHour < 16) {
      // London Killzone: 07:00 - 10:00 UTC
      if (utcHour < 10) return { name: 'London Killzone', color: 'text-amber-400', active: true };
      return { name: 'London Session', color: 'text-amber-400/60', active: true };
    }
    
    // New York: 12:00 - 21:00 UTC (Approx 3PM - 12AM EAT)
    if (utcHour >= 12 && utcHour < 21) {
      // NY Killzone: 12:00 - 15:00 UTC
      if (utcHour < 15) return { name: 'NY Open Killzone', color: 'text-emerald-400', active: true };
      return { name: 'NY Session', color: 'text-emerald-400/60', active: true };
    }
    
    // Asian: 00:00 - 09:00 UTC (Approx 3AM - 12PM EAT)
    if (utcHour >= 0 && utcHour < 9) {
      return { name: 'Asian Session', color: 'text-indigo-400', active: true };
    }
    
    return { name: 'Dead Time (Off-Session)', color: 'text-slate-500', active: false };
  };

  const session = getActiveSession();

  const renderDashboardModule = () => {
    switch (activeModule) {
      case 'forex':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 pb-20">
            <div className="bg-amber-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Globe size={120}/></div>
               <div className="relative z-10">
                 <div className="text-amber-100 text-[10px] font-black uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
                   <Clock size={14}/> <MarketClock />
                 </div>
                 <h2 className="text-4xl font-black mt-2 tracking-tighter">Forex Intelligence</h2>
                 
                 <div className="mt-4 p-4 bg-black/20 rounded-2xl backdrop-blur-md border border-white/10">
                    <p className="text-[8px] font-black text-amber-200 uppercase tracking-widest mb-1">Market Status</p>
                    <p className={`text-sm font-black uppercase tracking-wider ${session.color}`}>{session.name}</p>
                 </div>
               </div>
               
               <div className="flex gap-4 mt-6">
                 <button onClick={loadForexIntel} className="flex-1 flex items-center justify-center gap-2 bg-white text-amber-600 px-4 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-black/20 transition-all active:scale-95">
                   {isLoadingForex ? <RefreshCcw size={14} className="animate-spin" /> : <RefreshCcw size={14} />} Refresh Intel
                 </button>
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-slate-100 flex items-center gap-2"><AlertCircle size={18} className="text-red-400"/> Scheduled Volatility</h3>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Watchlist</span>
              </div>

              {isLoadingForex ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 bg-slate-900 rounded-3xl border border-slate-800">
                  <div className="relative">
                    <Loader2 className="animate-spin text-amber-500" size={48} />
                    <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-700" size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] animate-pulse">Syncing Red Folder Events...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {forexAlerts.length > 0 ? (
                    forexAlerts.map(alert => (
                      <div key={alert.id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl group hover:border-indigo-500/50 transition-all relative overflow-hidden">
                        {alert.impact === 'High' && (
                          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-[40px] rounded-full -mr-10 -mt-10"></div>
                        )}
                        
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border ${
                                alert.impact === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                alert.impact === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {alert.impact} Impact
                              </span>
                            </div>
                            <h4 className="text-lg font-black text-slate-100 leading-tight">{alert.event}</h4>
                            <div className="text-[10px] font-black text-slate-400 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5 w-fit">
                                <Clock size={12} className="text-indigo-400"/> {alert.timestamp}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {alert.assets.map(asset => (
                            <span key={asset} className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-3 py-1.5 rounded-xl border border-indigo-500/20 shadow-sm">
                              {asset}
                            </span>
                          ))}
                        </div>

                        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800/50 space-y-3 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                               <Sparkles size={10} className="text-indigo-400"/> Nova Analysis
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm ${
                              alert.signal.toLowerCase().includes('buy') ? 'bg-emerald-500 text-white' : 
                              alert.signal.toLowerCase().includes('sell') ? 'bg-red-500 text-white' : 
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {alert.signal}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
                            "{alert.logic}"
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-900 rounded-3xl p-10 text-center border border-slate-800 border-dashed">
                      <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                        <Globe className="text-slate-800" size={32} />
                      </div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">No High-Impact News Found</p>
                      <p className="text-[10px] text-slate-600 mt-2">Check your connection or try refreshing the intel feed.</p>
                    </div>
                  )}

                  {forexGroundingUrls.length > 0 && (
                    <div className="mt-12 p-6 bg-slate-900/40 rounded-[2.5rem] border border-slate-800 shadow-inner">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Globe size={12} className="text-indigo-400"/> Official Market Sources
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {forexGroundingUrls.map((url, i) => (
                          <a key={i} href={url.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all group">
                            <span className="text-[10px] font-bold text-slate-400 truncate w-48">{url.title}</span>
                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:bg-indigo-600 transition-colors">
                              <ExternalLink size={14} className="text-slate-600 group-hover:text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case 'intimacy':
        return (
          <div className="h-[600px] -mx-4">
            <IntimacyPanel />
          </div>
        );
      case 'wellbeing':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20 text-center">
              <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2 justify-center"><Heart size={18}/> Nova's Mindful Note</h3>
              <p className="text-emerald-300 italic text-sm">Focus on what you can control. Your wealth is a tool, not a burden.</p>
            </div>
          </div>
        );
      case 'tech_hub':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <TechHubPanel />
          </div>
        );
      case 'startup_validator':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <StartupValidator />
          </div>
        );
      case 'code_website_auditor':
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <CodeWebAuditor />
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-2 gap-4">
            <DashboardCard title="Intimacy" subtitle="Expert" icon={<Heart size={24}/>} color="bg-rose-600" onClick={() => setActiveModule('intimacy')} />
            <DashboardCard title="Well-being" subtitle="Health" icon={<Heart size={24}/>} color="bg-emerald-500" onClick={() => setActiveModule('wellbeing')} />
            <DashboardCard title="Forex" subtitle="Markets" icon={<Globe size={24}/>} color="bg-amber-500" onClick={() => setActiveModule('forex')} />
            <DashboardCard title="Tech Hub" subtitle="Opportunities" icon={<Sparkles size={24}/>} color="bg-indigo-600" onClick={() => setActiveModule('tech_hub')} />
            <div className="col-span-2">
              <DashboardCard title="Startup Board" subtitle="Validate Ventures" icon={<Building size={24}/>} color="bg-violet-600" onClick={() => setActiveModule('startup_validator')} />
            </div>
            <div className="col-span-2">
              <DashboardCard title="QA Auditor" subtitle="Repo & Web QA streams" icon={<Layers size={24}/>} color="bg-indigo-500" onClick={() => setActiveModule('code_website_auditor')} />
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="max-w-md mx-auto flex flex-col bg-slate-950 overflow-hidden relative border-x border-slate-900 shadow-2xl transition-all duration-200"
      style={{ height: viewportHeight }}
    >
      <header className="p-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-2">
          {activeTab === AppTab.DASHBOARD && activeModule !== 'none' ? (
            <button onClick={() => setActiveModule('none')} className="p-1 -ml-1 text-slate-400 hover:text-slate-100">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Sparkles className="text-white" size={18} />
            </div>
          )}
          <h1 className="font-bold text-lg text-slate-100 tracking-tight">
            {activeTab === AppTab.DASHBOARD && activeModule !== 'none' 
              ? activeModule === 'code_website_auditor' 
                ? 'QA Auditor' 
                : activeModule === 'startup_validator' 
                  ? 'Startup Board' 
                  : activeModule === 'tech_hub' 
                    ? 'Tech Hub'
                    : activeModule.charAt(0).toUpperCase() + activeModule.slice(1) 
              : 'Nova'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="bg-slate-900 text-slate-400 text-[10px] font-black border border-slate-800 rounded-lg px-2 py-1 outline-none appearance-none cursor-pointer"
          >
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
          </select>
          <button onClick={() => setIsAddingTransaction(true)} className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-600/30">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 overflow-y-auto no-scrollbar transition-opacity duration-300 ${activeTab === AppTab.DASHBOARD ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <div className="p-4 space-y-6">
            {activeModule === 'none' && (
              <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden group min-h-[220px] flex flex-col justify-center">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] group-hover:bg-indigo-600/30 transition-all duration-1000"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px]"></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Lightbulb size={14} /> Nova Wisdom
                  </div>
                  <h2 className="text-xl font-black text-slate-100 leading-tight italic tracking-tight">
                    "{wisdom}"
                  </h2>
                  <div className="pt-2">
                    <button onClick={loadWisdom} className="text-slate-500 hover:text-indigo-400 text-[10px] font-black uppercase flex items-center gap-1 transition-colors">
                      <Sparkles size={12} /> Refresh insight
                    </button>
                  </div>
                </div>
              </div>
            )}
            {renderDashboardModule()}
            {activeModule === 'none' && (
              <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2"><Target size={18} className="text-emerald-400"/> Growth Opportunities</h3>
                  <button onClick={loadOpportunities} className="text-slate-500 hover:text-emerald-400"><Globe size={16}/></button>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  {isLoadingModule ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-emerald-500" size={24} />
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-invert prose-sm text-slate-400 leading-relaxed text-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{opportunities.text}</ReactMarkdown>
                      </div>
                      {opportunities.urls.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 pt-2">
                          {opportunities.urls.slice(0, 3).map((url, i) => (
                            <a key={i} href={url.uri} target="_blank" className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition group">
                              <div className="flex items-center gap-2">
                                <BriefcaseBusiness size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-bold text-slate-300 truncate w-40">{url.title}</span>
                              </div>
                              <ExternalLink size={12} className="text-slate-600 group-hover:text-indigo-400" />
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className={`absolute inset-0 overflow-hidden transition-opacity duration-300 ${activeTab === AppTab.CHAT ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <ChatInterface onSignalDetected={onSignalDetected} />
        </div>

        <div className={`absolute inset-0 overflow-y-auto no-scrollbar transition-opacity duration-300 ${activeTab === AppTab.ADVISER ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <AdviserPanel />
        </div>

        <div className={`absolute inset-0 overflow-y-auto no-scrollbar transition-opacity duration-300 ${activeTab === AppTab.PREDICTOR ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <PredictorPanel />
        </div>

        <div className={`absolute inset-0 overflow-y-auto no-scrollbar transition-opacity duration-300 ${activeTab === AppTab.INTIMACY ? 'opacity-100 z-10' : 'opacity-0 -z-10 pointer-events-none'}`}>
          <IntimacyPanel />
        </div>
      </main>

      {!isLiveActive && activeTab === AppTab.DASHBOARD && (
        <button 
          onClick={startLiveMode}
          className="fixed bottom-28 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center animate-bounce z-30"
        >
          <Mic size={24} />
        </button>
      )}

      {isLiveActive && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[60] flex flex-col items-center justify-center p-8 animate-in zoom-in duration-300">
          <button onClick={stopLiveMode} className="absolute top-8 right-8 text-slate-500 hover:text-slate-100"><X size={32}/></button>
          
          <div className="w-48 h-48 bg-indigo-500/10 rounded-full flex items-center justify-center relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-10"></div>
            <div className="absolute inset-4 bg-indigo-500 rounded-full animate-pulse opacity-20"></div>
            <Mic size={64} className="text-indigo-400 relative z-10" />
          </div>
          
          <h2 className="text-2xl font-black text-slate-100 mt-12 mb-2 tracking-tight">Nova Live</h2>
          <p className="text-slate-400 text-sm text-center px-8">Listening to your financial queries. Speak naturally.</p>
          
          <div className="mt-12 flex flex-col items-center gap-6 w-full max-w-[280px]">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
              <Smile size={12} className="text-indigo-400" /> Reaction Bar
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {REACTION_EMOJIS.map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => sendEmojiReaction(emoji)}
                  className="w-12 h-12 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl text-2xl hover:bg-slate-800 hover:scale-110 active:scale-95 transition-all shadow-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 flex gap-2">
            {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-10 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: `${i*0.1}s`}}></div>)}
          </div>
        </div>
      )}

      <nav className="bg-slate-950/80 backdrop-blur-2xl border-t border-slate-900 flex justify-around p-3 pb-8 z-20">
        <NavButton active={activeTab === AppTab.DASHBOARD} icon={<LayoutDashboard size={24} />} label="Home" onClick={() => {setActiveTab(AppTab.DASHBOARD); setActiveModule('none');}} />
        <NavButton 
          active={activeTab === AppTab.CHAT} 
          icon={<MessageSquare size={24} />} 
          label="Chat" 
          onClick={() => setActiveTab(AppTab.CHAT)} 
          badge={hasChatSignal}
        />
        <NavButton active={activeTab === AppTab.ADVISER} icon={<Briefcase size={24} />} label="Advice" onClick={() => setActiveTab(AppTab.ADVISER)} />
        <NavButton active={activeTab === AppTab.PREDICTOR} icon={<Target size={24} />} label="Oracle" onClick={() => setActiveTab(AppTab.PREDICTOR)} />
        <NavButton active={activeTab === AppTab.INTIMACY} icon={<Heart size={24} />} label="Expert" onClick={() => setActiveTab(AppTab.INTIMACY)} />
      </nav>

      {isAddingTransaction && <TransactionForm wallets={wallets} onAdd={addTransaction} onClose={() => setIsAddingTransaction(false)} />}
      
      {isAddingWallet && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 w-full max-sm shadow-2xl">
            <h3 className="text-xl font-bold mb-6 text-slate-100">New Wallet</h3>
            <div className="space-y-4">
              <input id="w_name" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none text-slate-100 focus:border-indigo-500" placeholder="Wallet Name" />
              <select id="w_type" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none text-slate-100">
                <option value="mobile">Mobile Money</option>
                <option value="bank">Bank Account</option>
                <option value="cash">Cash</option>
                <option value="mmf">MMF</option>
              </select>
              <input id="w_bal" type="number" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl outline-none text-slate-100" placeholder="Balance" />
              <div className="flex gap-2 pt-4">
                <button onClick={() => setIsAddingWallet(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                <button 
                  onClick={() => {
                    const name = (document.getElementById('w_name') as HTMLInputElement).value;
                    const type = (document.getElementById('w_type') as HTMLSelectElement).value as any;
                    const bal = parseFloat((document.getElementById('w_bal') as HTMLInputElement).value);
                    if (name) addWallet(name, type, bal || 0);
                  }} 
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardCard: React.FC<{title: string, subtitle: string, icon: React.ReactNode, color: string, onClick: () => void}> = ({title, subtitle, icon, color, onClick}) => (
  <button onClick={onClick} className="w-full bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-sm flex flex-col items-start text-left hover:border-indigo-500 transition-all duration-300 group">
    <div className={`${color} p-4 rounded-2xl text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-black/20`}>{icon}</div>
    <h3 className="font-bold text-slate-100 text-lg">{title}</h3>
    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{subtitle}</p>
  </button>
);

const NavButton: React.FC<{active: boolean; icon: React.ReactNode; label: string; onClick: () => void; badge?: boolean}> = ({ active, icon, label, onClick, badge }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${active ? 'text-indigo-400 scale-110' : 'text-slate-600 hover:text-slate-400'}`}>
    {badge && (
      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border border-slate-950 animate-pulse z-30" />
    )}
    {icon}
    <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    {active && <div className="w-1 h-1 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.8)]" />}
  </button>
);

export default App;

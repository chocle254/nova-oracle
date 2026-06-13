import React, { useState, useEffect } from 'react';
import { getTechOpportunities } from '../services/geminiService';
import { 
  Calendar, Plus, Trash2, ExternalLink, CheckCircle2, Clock, Sparkles, 
  MapPin, Trophy, Send, Edit3, AlertCircle, Filter, Loader2, Building,
  PlusCircle, RefreshCw, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StartupValidator from './StartupValidator';

interface TechOpportunity {
  id: string;
  title: string;
  type: 'Hackathon' | 'Startup Application' | 'Tech Event';
  description: string;
  deadline: string;
  link: string;
  location: string;
  benefits?: string;
}

interface UserSubmission {
  id: string;
  title: string;
  type: 'Hackathon' | 'Startup Application' | 'Tech Event';
  deadline: string;
  link: string;
  location: string;
  status: 'Intention' | 'In Progress' | 'Submitted' | 'Interviewing' | 'Accepted' | 'Rejected';
  notes: string;
  dateCreated: string;
}

const TechHubPanel: React.FC = () => {
  // Opportunities from API
  const [opportunities, setOpportunities] = useState<TechOpportunity[]>([]);
  const [feedLoading, setFeedLoading] = useState<boolean>(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  // Submissions tracked by user
  const [trackedSubmissions, setTrackedSubmissions] = useState<UserSubmission[]>([]);
  
  // Controls
  const [activeHubTab, setActiveHubTab] = useState<'opportunities' | 'validator'>('opportunities');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // New Submission Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Hackathon' | 'Startup Application' | 'Tech Event'>('Hackathon');
  const [newDeadline, setNewDeadline] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState<'Intention' | 'In Progress' | 'Submitted' | 'Interviewing' | 'Accepted' | 'Rejected'>('Intention');
  const [newNotes, setNewNotes] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<'Intention' | 'In Progress' | 'Submitted' | 'Interviewing' | 'Accepted' | 'Rejected'>('Intention');
  const [editingNotes, setEditingNotes] = useState('');

  // Load tracker from Local Storage
  useEffect(() => {
    const saved = localStorage.getItem('nova_tech_submissions');
    if (saved) {
      try {
        setTrackedSubmissions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved submissions", e);
      }
    } else {
      // Seed initial dummy submissions so the user has examples
      const initialSeed: UserSubmission[] = [
        {
          id: 'seed-yc',
          title: 'Y Combinator W2026 Batch',
          type: 'Startup Application',
          deadline: '2026-06-25',
          link: 'https://www.ycombinator.com/apply',
          location: 'San Francisco, CA / Remote',
          status: 'In Progress',
          notes: 'Working on product demo vide and financial projection table.',
          dateCreated: new Date().toISOString().split('T')[0]
        },
        {
          id: 'seed-hack',
          title: 'Global Generative AI Hackathon',
          type: 'Hackathon',
          deadline: '2026-07-10',
          link: 'https://devpost.com',
          location: 'Online',
          status: 'Intention',
          notes: 'Looking for a solid co-builder specialized in agentic workflows.',
          dateCreated: new Date().toISOString().split('T')[0]
        }
      ];
      setTrackedSubmissions(initialSeed);
      localStorage.setItem('nova_tech_submissions', JSON.stringify(initialSeed));
    }
    // Load cached opportunities or fallback to prevent automatic refreshing on mount
    const cachedOpps = localStorage.getItem('nova_tech_opportunities');
    if (cachedOpps) {
      try {
        setOpportunities(JSON.parse(cachedOpps));
      } catch (e) {
        console.error("Failed to parse cached opportunities", e);
        setOpportunities(getFallbackOpps());
      }
    } else {
      setOpportunities(getFallbackOpps());
    }
  }, []);

  // Save tracker helper
  const saveSubmissions = (updated: UserSubmission[]) => {
    setTrackedSubmissions(updated);
    localStorage.setItem('nova_tech_submissions', JSON.stringify(updated));
  };

  // Fetch from Gemini via googleSearch (Only through manual click)
  const fetchLiveFeed = async () => {
    setFeedLoading(true);
    setFeedError(null);
    try {
      const data = await getTechOpportunities();
      if (data && data.opportunities) {
        setOpportunities(data.opportunities);
        localStorage.setItem('nova_tech_opportunities', JSON.stringify(data.opportunities));
      } else {
        setFeedError("No active opportunities found. Retrying in fallback mode.");
        setOpportunities(getFallbackOpps());
      }
    } catch (e: any) {
      console.error(e);
      setFeedError("Fable 5 is compiling local network databases...");
      setOpportunities(getFallbackOpps());
    } finally {
      setFeedLoading(false);
    }
  };

  const getFallbackOpps = (): TechOpportunity[] => [
    {
      id: 'fall-yc',
      title: 'Y Combinator Fall Cohort',
      type: 'Startup Application',
      description: 'The platinum tier accelerator. Receive $500,000 upfront seed capital to prove your AI thesis on a global stage.',
      deadline: '2026-09-15',
      link: 'https://www.ycombinator.com',
      location: 'San Francisco, CA',
      benefits: '$500K Funding & Elite Partner support'
    },
    {
      id: 'fall-eth',
      title: 'ETHGlobal Hackathon 2026',
      type: 'Hackathon',
      description: 'Convene with elite blockchain and AI-agent programmers building autonomous interfaces and smart routing systems.',
      deadline: '2026-07-24',
      link: 'https://ethglobal.com',
      location: 'Singapore / Hybrid',
      benefits: '$100,000+ Prize Pools & Ecosystem Grants'
    },
    {
      id: 'fall-slush',
      title: 'Slush 100 Startup Pitching Competition',
      type: 'Startup Application',
      description: 'The world\'s most high-octane founder-to-investor matching conference. Winner secures a massive early-stage syndicate commitment.',
      deadline: '2026-10-01',
      link: 'https://slush.org',
      location: 'Helsinki, Finland',
      benefits: 'Elite exposure & €1M Equity prize'
    },
    {
      id: 'fall-dec',
      title: 'Decentralized Intelligence Summit',
      type: 'Tech Event',
      description: 'Immersive technology gathering discussing next-gen local language models, neuromorphic computing, and on-device logic blocks.',
      deadline: '2026-08-12',
      link: 'https://techsummits.com',
      location: 'Boston, MA / Online',
      benefits: 'VC Roundtable invite & Hardware grants'
    }
  ];

  // Quick action: Add Opportunity to Tracker
  const addOpportunityToTracker = (opp: TechOpportunity) => {
    // Check if duplicate
    if (trackedSubmissions.some(s => s.title.toLowerCase() === opp.title.toLowerCase())) {
      alert(`"${opp.title}" is already being tracked!`);
      return;
    }

    const newItem: UserSubmission = {
      id: `tracked-${Date.now()}`,
      title: opp.title,
      type: opp.type,
      deadline: opp.deadline,
      link: opp.link,
      location: opp.location,
      status: 'Intention',
      notes: opp.benefits ? `Core benefits: ${opp.benefits}. Added from Fable 5 feed.` : 'Added from Fable 5 feed.',
      dateCreated: new Date().toISOString().split('T')[0]
    };

    const updated = [newItem, ...trackedSubmissions];
    saveSubmissions(updated);
  };

  // Custom Submission Handlers
  const handleAddNewSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: UserSubmission = {
      id: `manual-${Date.now()}`,
      title: newTitle,
      type: newType,
      deadline: newDeadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days default
      link: newLink || 'https://',
      location: newLocation || 'Remote',
      status: newStatus,
      notes: newNotes,
      dateCreated: new Date().toISOString().split('T')[0]
    };

    const updated = [newItem, ...trackedSubmissions];
    saveSubmissions(updated);
    
    // reset form
    setNewTitle('');
    setNewDeadline('');
    setNewLink('');
    setNewLocation('');
    setNewStatus('Intention');
    setNewNotes('');
    setShowAddForm(false);
  };

  const handleDeleteSubmission = (id: string) => {
    if (window.confirm("Are you sure you want to remove this submission from your tracker?")) {
      const updated = trackedSubmissions.filter(s => s.id !== id);
      saveSubmissions(updated);
    }
  };

  const handleStartEditing = (sub: UserSubmission) => {
    setEditingId(sub.id);
    setEditingStatus(sub.status);
    setEditingNotes(sub.notes);
  };

  const handleSaveEdit = (id: string) => {
    const updated = trackedSubmissions.map(s => {
      if (s.id === id) {
        return { ...s, status: editingStatus, notes: editingNotes };
      }
      return s;
    });
    saveSubmissions(updated);
    setEditingId(null);
  };

  // Filtering logic
  const filteredTracked = trackedSubmissions.filter(sub => {
    const matchType = filterType === 'All' || sub.type === filterType;
    const matchStatus = filterStatus === 'All' || sub.status === filterStatus;
    return matchType && matchStatus;
  });

  // Calculate stats & metric blocks
  const totalTracked = trackedSubmissions.length;
  const submissionsSent = trackedSubmissions.filter(s => s.status === 'Submitted' || s.status === 'Interviewing' || s.status === 'Accepted').length;
  const acceptedFounders = trackedSubmissions.filter(s => s.status === 'Accepted').length;
  
  const daysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="p-4 space-y-6 bg-slate-950 pb-20 text-slate-100 min-h-screen">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 bg-indigo-500/10 blur-3xl rounded-full" />
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase text-indigo-400 tracking-wider">
              <Sparkles size={11} /> 
              <span>Powered by Fable 5 Intell</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-100 flex items-center gap-2">
              Opportunities Hub
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
              Apply to high-impact hackathons, prestigious accelerators, and premium conferences. Track goals, deadlines, and submission milestones.
            </p>
          </div>
          <button 
            onClick={fetchLiveFeed}
            disabled={feedLoading}
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500 hover:text-indigo-400 transition-all flex items-center gap-2"
            title="Scan Web for New Opportunities"
          >
            <RefreshCw size={18} className={feedLoading ? "animate-spin text-indigo-400" : "text-slate-400"} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Tracked Hub</p>
            <p className="text-xl font-black text-slate-200">{totalTracked}</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Submissions</p>
            <p className="text-xl font-black text-emerald-400">{submissionsSent}</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/60 p-3 rounded-2xl">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Success/Accepted</p>
            <p className="text-xl font-black text-indigo-400">{acceptedFounders}</p>
          </div>
        </div>
      </div>

      {/* Sub-tab Switcher: Opportunities vs Startup Validator */}
      <div className="flex border-b border-slate-800/60 gap-4 scrollbar-thin overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveHubTab('opportunities')}
          className={`pb-3 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeHubTab === 'opportunities' 
              ? 'border-indigo-500 text-indigo-400 font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Sparkles size={12} />
          <span>⚡ Opportunities Tracker</span>
        </button>
        <button
          onClick={() => setActiveHubTab('validator')}
          className={`pb-3 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeHubTab === 'validator' 
              ? 'border-indigo-500 text-indigo-400 font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Building size={12} />
          <span>🚀 Startup Validator</span>
        </button>
      </div>

      {activeHubTab === 'opportunities' ? (
        /* Main Split Layout: Left Feed / Right Tracker on large screen but stacked elegantly on mobile */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ACTIVE FEED OPPORTUNITIES (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-400 animate-pulse text-semibold" size={16} />
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Live Opportunites</h3>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-mono">Live Grounding</span>
          </div>

          {feedLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[300px]">
              <Loader2 size={36} className="text-indigo-500 animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Fable 5 Launching Search</p>
                <p className="text-[11px] text-slate-500 font-medium">Scouring Devpost, YC, and Slush networks for upcoming deadlines...</p>
              </div>
            </div>
          ) : feedError ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
              <AlertCircle size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-xs text-amber-300 font-bold">Fable 5 Sync Status</p>
                <p className="text-[11px] text-slate-400">{feedError}</p>
                <button 
                  onClick={fetchLiveFeed}
                  className="px-3 py-1 bg-amber-500/20 text-amber-300 text-[10px] rounded font-black uppercase tracking-wider hover:bg-amber-500/30 transition-all"
                >
                  Retry API Grounding
                </button>
              </div>
            </div>
          ) : null}

          {/* List Of Live Opportunities fetched via search */}
          {!feedLoading && opportunities.length > 0 && (
            <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
              {opportunities.map((opp) => {
                const daysLeft = daysRemaining(opp.deadline);
                return (
                  <div 
                    key={opp.id} 
                    className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl hover:border-slate-700 transition-all space-y-3 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        opp.type === 'Hackathon' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                        opp.type === 'Startup Application' ? 'bg-indigo-400/10 text-indigo-400 border border-indigo-400/20' :
                        'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                      }`}>
                        {opp.type}
                      </span>
                      {daysLeft > 0 ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                          <Clock size={12} className="text-amber-500" />
                          <span>{daysLeft} days left</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-rose-400 font-bold bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">Closing soon</span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-sm font-black text-slate-200 group-hover:text-slate-100 transition-colors">
                        {opp.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <MapPin size={10} /> {opp.location}
                      </p>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {opp.description}
                    </p>

                    {opp.benefits && (
                      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                        <Trophy size={12} className="text-amber-400 shrink-0" />
                        <span className="text-[10px] font-bold text-amber-400 truncate">{opp.benefits}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <a 
                        href={opp.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex-1 py-2 bg-slate-950 text-[10px] font-black uppercase tracking-wide border border-slate-800 hover:border-slate-700 hover:text-slate-200 rounded-xl flex items-center justify-center gap-1 transition-all"
                      >
                        <ExternalLink size={11} /> Visit Site
                      </a>
                      <button 
                        onClick={() => addOpportunityToTracker(opp)}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wide rounded-xl flex items-center justify-center gap-1 transition-all"
                      >
                        <PlusCircle size={11} /> Track This
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MY TRACKER PORTAL (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calendar className="text-indigo-400" size={16} /> Tracked Submissions
            </h3>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 self-start sm:self-auto transition-all"
            >
              {showAddForm ? <X size={12} /> : <Plus size={12} />}
              <span>{showAddForm ? "Close Form" : "Add Submission"}</span>
            </button>
          </div>

          {/* Form to manual add */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddNewSubmission}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Opportunity name</label>
                    <input 
                      type="text" 
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., Y Combinator, Halycon Hackathon"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="Hackathon">Hackathon</option>
                      <option value="Startup Application">Startup Application</option>
                      <option value="Tech Event">Tech Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Deadline</label>
                    <input 
                      type="date" 
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Link URL</label>
                    <input 
                      type="text" 
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Location</label>
                    <input 
                      type="text" 
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Online / City"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="Intention">Intention</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Submitted">Submitted / Sent</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Accepted">Accepted / Won</option>
                      <option value="Rejected">Rejected / Declined</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Target Application Notes</label>
                    <textarea 
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      rows={2}
                      placeholder="Enter team details, task milestones or requirements..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all"
                >
                  <Send size={12} />
                  <span>Register Submission In Tracker</span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Filtering Layout */}
          <div className="flex gap-2 flex-wrap items-center bg-slate-900/40 p-2.5 border border-slate-800/60 rounded-2xl">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1.5">Filters:</span>
            
            <div className="flex gap-1">
              {['All', 'Hackathon', 'Startup Application', 'Tech Event'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    filterType === type ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {type === 'All' ? 'All Types' : type}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block mx-1" />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-[10px] font-bold py-1 px-2.5 rounded-lg outline-none text-slate-300 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Intention">Intention</option>
              <option value="In Progress">In Progress</option>
              <option value="Submitted">Submitted</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Tracker Submissions Display */}
          {filteredTracked.length === 0 ? (
            <div className="bg-slate-900/20 border border-dashed border-slate-800/80 rounded-3xl p-8 text-center space-y-2">
              <Calendar className="text-slate-700 mx-auto" size={32} />
              <p className="text-xs font-black text-slate-400 capitalize">No submission match</p>
              <p className="text-[11px] text-slate-600 font-medium">Add submissions using the form above or check opportunities to instantly track them.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTracked.map((sub) => {
                const daysLeft = daysRemaining(sub.deadline);
                const isEditing = editingId === sub.id;

                return (
                  <div 
                    key={sub.id}
                    className="p-4 bg-slate-900 border border-slate-800/50 rounded-2xl hover:border-slate-800 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">
                            {sub.type}
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            sub.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            sub.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-400/20' :
                            sub.status === 'Submitted' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            sub.status === 'Interviewing' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                            sub.status === 'In Progress' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-200">{sub.title}</h4>
                      </div>

                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleStartEditing(sub)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                          title="Edit Status & Notes"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSubmission(sub.id)}
                          className="p-1.5 bg-slate-950 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
                          title="Delete submission"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata indicators */}
                    <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-slate-500 bg-slate-950/40 p-2 rounded-xl">
                      <div>
                        <span className="text-slate-600 font-bold block text-[8px] uppercase tracking-wider">End Deadline</span>
                        <span className="text-slate-300 font-bold">{sub.deadline}</span>
                        {daysLeft > 0 ? (
                          <span className="text-amber-500 font-bold text-[9px] block">({daysLeft}d left)</span>
                        ) : (
                          <span className="text-rose-500 font-bold text-[9px] block">(Closed)</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-600 block text-[8px] uppercase tracking-wider">Venue / Location</span>
                        <span className="text-slate-300 font-bold flex items-center gap-1">
                          <MapPin size={8} /> {sub.location}
                        </span>
                        {sub.link && sub.link !== 'https://' && (
                          <a href={sub.link} target="_blank" rel="noreferrer" className="text-indigo-400 font-black hover:underline flex items-center gap-0.5">
                            Apply Portal <ExternalLink size={8} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Editable / view notes block */}
                    {isEditing ? (
                      <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl space-y-2">
                        <div>
                          <label className="text-[8.5px] font-black uppercase text-slate-500 tracking-wider block mb-1">Update Status</label>
                          <select 
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value as any)}
                            className="bg-slate-900 border border-slate-800 text-xs rounded-lg p-1.5 text-white w-full font-bold focus:border-indigo-500"
                          >
                            <option value="Intention">Intention</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Submitted">Submitted / Sent</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Accepted">Accepted / Won</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[8.5px] font-black uppercase text-slate-500 tracking-wider block mb-1">Custom Notes</label>
                          <textarea 
                            value={editingNotes}
                            onChange={(e) => setEditingNotes(e.target.value)}
                            rows={2}
                            className="bg-slate-900 border border-slate-800 text-xs rounded-lg p-1.5 text-white w-full outline-none focus:border-indigo-500 font-medium"
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button 
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-[10px] font-black uppercase bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:text-white"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => handleSaveEdit(sub.id)}
                            className="px-3 py-1 text-[10px] font-black uppercase bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      sub.notes && (
                        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
                          <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest block mb-0.5">My Strategy Notes</span>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">{sub.notes}</p>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
      ) : (
        <StartupValidator />
      )}
    </div>
  );
};

export default TechHubPanel;

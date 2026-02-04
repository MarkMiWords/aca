
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { queryPartner, smartSoap, articulateText } from '../services/geminiService';
import { Message, Chapter, VaultStorage } from '../types';
import { readJson, writeJson } from '../utils/safeStorage';
import { useAcousticLink } from '../context/AcousticLinkContext';

const STYLES = ['Fiction', 'Memoir', 'Life Story', 'Truth Narrative', 'Legacy'];
const REGIONS = ['Asia', 'Australia', 'North America', 'South America', 'United Kingdom', 'Europe'];

const DEFAULT_CHAPTER: Chapter = { id: '1', title: "", content: '', order: 0, media: [], subChapters: [] };

const AuthorBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { isActive: isLiveActive, isOrientation, wrapTranscription, stopSession: stopLiveSession, endOrientation } = useAcousticLink();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const [navWidth, setNavWidth] = useState(320);
  const [partnerWidth, setPartnerWidth] = useState(400);
  const isResizingNav = useRef(false);
  const isResizingPartner = useRef(false);
  
  const [chapters, setChapters] = useState<Chapter[]>(() => readJson<Chapter[]>('wrap_sheets_v4', []));
  const [activeChapterId, setActiveChapterId] = useState(() => chapters[0]?.id || 'initial');
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerInput, setPartnerInput] = useState('');
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isProcessingWrite, setIsProcessingWrite] = useState(false);
  const [isProcessingRevise, setIsProcessingRevise] = useState(false);
  const [isProcessingArticulate, setIsProcessingArticulate] = useState(false);
  const [isProcessingPolish, setIsProcessingPolish] = useState(false);
  const [isVocalizing, setIsVocalizing] = useState(false);

  const profile = readJson<any>('aca_author_profile', { 
    motivation: STYLES[2], 
    region: REGIONS[1],
    personalityIndex: 3
  });

  const activeChapter = chapters.find(c => c.id === activeChapterId) || (chapters.length > 0 ? chapters[0] : DEFAULT_CHAPTER);
  const wordCount = (activeChapter.content || '').split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    if (chapters.length === 0) {
      const introChapter: Chapter = { id: 'intro-guide', title: "Active Wrap Sheet", content: "", order: 0, media: [], subChapters: [] };
      setChapters([introChapter]);
      setActiveChapterId('intro-guide');
    }
  }, []);

  useEffect(() => {
    if (isLiveActive && wrapTranscription) {
      setChapters(prev => prev.map(c => 
        c.id === activeChapterId 
          ? { ...c, content: wrapTranscription, title: wrapTranscription.length > 30 ? wrapTranscription.substring(0, 30) + '...' : c.title } 
          : c
      ));
    }
  }, [wrapTranscription, isLiveActive, activeChapterId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingNav.current) setNavWidth(Math.max(200, Math.min(500, e.clientX)));
      if (isResizingPartner.current) setPartnerWidth(Math.max(300, Math.min(800, window.innerWidth - e.clientX)));
    };
    const handleMouseUp = () => { isResizingNav.current = false; isResizingPartner.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaving(true);
      writeJson('wrap_sheets_v4', chapters);
      setTimeout(() => setIsSaving(false), 500);
    }, 1000);
    return () => clearTimeout(timer);
  }, [chapters]);

  const handleNewSheet = () => {
    if (isOrientation) {
      const vault = readJson<VaultStorage>('sovereign_vault', { sheets: [], books: [], ai: [], audits: [] });
      vault.sheets = [{ id: `archive-${Date.now()}`, timestamp: new Date().toISOString(), status: 'archived', data: activeChapter }, ...(vault.sheets || [])];
      writeJson('sovereign_vault', vault);
      endOrientation();
      stopLiveSession();
    }
    const newId = Date.now().toString(); 
    setChapters(prev => [{ ...DEFAULT_CHAPTER, id: newId, title: "Untitled Wrap Sheet" }, ...prev]); 
    setActiveChapterId(newId);
  };

  const handleRefine = async (level: string) => {
    if (!activeChapter.content?.trim()) return;
    const isPolish = level === 'sanitise';
    if (isPolish) setIsProcessingPolish(true); else setIsProcessingRevise(true);
    
    // Demo simulation
    setTimeout(async () => {
      const result = await smartSoap(activeChapter.content, level);
      setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: result.text } : c));
      setIsProcessingRevise(false); 
      setIsProcessingPolish(false); 
    }, 1000);
  };

  const handleArticulate = () => {
    if (isVocalizing) {
      window.speechSynthesis.cancel();
      setIsVocalizing(false);
      return;
    }
    if (!activeChapter.content?.trim()) return;
    
    setIsProcessingArticulate(true);
    const utterance = new SpeechSynthesisUtterance(activeChapter.content.substring(0, 500));
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.onstart = () => {
      setIsProcessingArticulate(false);
      setIsVocalizing(true);
    };
    utterance.onend = () => setIsVocalizing(false);
    window.speechSynthesis.speak(utterance);
  };

  const handlePartnerChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerInput.trim() || isPartnerLoading) return;
    const msg = partnerInput;
    setPartnerInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsPartnerLoading(true);
    
    // Demo response
    setTimeout(async () => {
      const response = await queryPartner(msg);
      setMessages(prev => [...prev, response]);
      setIsPartnerLoading(false);
      setTimeout(() => chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' }), 100);
    }, 1200);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-[#020202] text-white overflow-hidden relative">
      <aside style={{ width: `${navWidth}px` }} className="border-r border-white/10 bg-[#080808]/95 backdrop-blur-2xl flex flex-col shrink-0 relative pt-20 z-50">
        <div className="px-8 mb-6 space-y-4">
           <button onClick={handleNewSheet} className={`w-full py-3 text-[9px] font-black uppercase tracking-[0.4em] transition-all rounded-sm ${isLiveActive ? 'bg-[var(--accent)] text-white shadow-[0_0_20px_var(--accent-glow)]' : 'bg-black border border-white/5 text-gray-600 hover:text-white'}`}>
             {isOrientation ? 'FINISH DISCOVERY' : '+ NEW WRAP SHEET'}
           </button>
           <button onClick={() => isLiveActive ? stopLiveSession() : navigate('/live-protocol')} className={`w-full py-3 border border-[var(--accent)]/40 text-[var(--accent)] text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2 hover:bg-[var(--accent)] hover:text-white transition-all rounded-sm ${isLiveActive ? 'bg-[var(--accent)]/20 shadow-[0_0_15px_rgba(230,126,34,0.2)]' : ''}`}>
             {isLiveActive ? 'DISCONNECT LINK' : 'INITIALIZE FORGE LINK'}
           </button>
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar">
          {chapters.map(c => (
            <div key={c.id} onClick={() => setActiveChapterId(c.id)} className={`py-5 px-10 cursor-pointer border-l-4 transition-all ${activeChapterId === c.id ? 'border-[var(--accent)] bg-white/5 text-white' : 'border-transparent text-gray-700 hover:text-gray-400'}`}>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] truncate">{c.title || 'Untitled Sheet'}</p>
            </div>
          ))}
        </div>
      </aside>

      <div onMouseDown={() => isResizingNav.current = true} className="w-1 bg-white/5 hover:bg-orange-500 cursor-ew-resize z-[60] transition-colors"></div>

      <main className="flex-grow flex flex-col relative z-40 pt-16 bg-transparent">
        <div className="shrink-0 h-20 bg-black/60 backdrop-blur-xl flex items-stretch border-b border-white/10">
            <div className={`flex-1 group relative cursor-pointer border-r border-white/5 hover:bg-orange-500/5 transition-all ${isLiveActive ? 'bg-orange-500/10' : ''}`}>
               <div className="h-full flex flex-col items-center justify-center">
                  <span className={`text-[10px] font-black tracking-[0.4em] uppercase transition-all ${isProcessingWrite || isLiveActive ? 'text-orange-500 animate-pulse' : 'text-gray-700 group-hover:text-orange-500'}`}>Write</span>
               </div>
               <div className="absolute top-full left-0 w-64 bg-black border border-orange-500 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all rounded-sm overflow-hidden shadow-2xl">
                  <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-orange-500">Import Narrative</button>
                  <button onClick={() => navigate('/live-protocol')} className="w-full text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-orange-500">Live Ingestion</button>
               </div>
            </div>
            <div className="flex-1 group relative cursor-pointer border-r border-white/5 hover:bg-red-500/5">
               <div className="h-full flex flex-col items-center justify-center">
                  <span className={`text-[10px] font-black tracking-[0.4em] uppercase transition-all ${isProcessingRevise ? 'text-red-500 animate-pulse' : 'text-gray-700 group-hover:text-red-500'}`}>Revise</span>
               </div>
               <div className="absolute top-full left-0 w-64 bg-black border border-red-500 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all rounded-sm overflow-hidden shadow-2xl">
                  <button onClick={() => handleRefine('rinse')} className="w-full text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-green-500 hover:bg-green-500/10">Rinse (L1)</button>
                  <button onClick={() => handleRefine('wash')} className="w-full text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-amber-500 hover:bg-amber-500/10">Wash (L2)</button>
                  <button onClick={() => handleRefine('scrub')} className="w-full text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10">Scrub (L3)</button>
               </div>
            </div>
            <div className="flex-1 group relative cursor-pointer border-r border-white/5 hover:bg-blue-500/5">
               <div className="h-full flex flex-col items-center justify-center">
                  <span className={`text-[10px] font-black tracking-[0.4em] uppercase transition-all ${isProcessingArticulate || isVocalizing ? 'text-blue-500 animate-pulse' : 'text-gray-700 group-hover:text-blue-500'}`}>Articulate</span>
               </div>
               <div className="absolute top-full left-0 w-64 bg-black border border-blue-500 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all rounded-sm overflow-hidden shadow-2xl">
                  <button onClick={handleArticulate} className="w-full text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-blue-500 hover:bg-blue-500/10">{isVocalizing ? 'Halt Audio' : 'Vocalize Sheet'}</button>
               </div>
            </div>
            <div className="flex-1 group relative cursor-pointer hover:bg-green-500/5">
               <div className="h-full flex flex-col items-center justify-center">
                  <span className={`text-[10px] font-black tracking-[0.4em] uppercase transition-all ${isProcessingPolish ? 'text-green-500 animate-pulse' : 'text-gray-700 group-hover:text-green-500'}`}>Polish</span>
               </div>
               <div className="absolute top-full right-0 w-64 bg-black border border-green-500 z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all rounded-sm overflow-hidden shadow-2xl">
                  <button onClick={() => handleRefine('sanitise')} className="w-full text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10">Privacy Audit</button>
                  <button onClick={() => navigate('/wrap-it-up')} className="w-full text-left px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10">Final Mastering</button>
               </div>
            </div>
        </div>

        <div className="flex-grow flex flex-col overflow-y-auto custom-scrollbar bg-black/20">
          <div className="py-8 bg-black/40 border-b border-white/5 px-12">
               <input 
                 type="text" 
                 value={activeChapter.title} 
                 onChange={(e) => setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, title: e.target.value } : c))} 
                 className="w-full bg-transparent border-none outline-none focus:ring-0 text-white text-4xl md:text-6xl font-serif italic tracking-tighter placeholder:text-white/5" 
                 placeholder="Sheet Title..." 
               />
          </div>
          <div className="px-12 py-10 flex flex-grow relative">
               <textarea 
                 value={activeChapter.content} 
                 onChange={(e) => setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: e.target.value } : c))} 
                 className="w-full flex-grow bg-transparent border-none outline-none focus:ring-0 resize-none text-gray-300 text-2xl font-serif leading-[2] placeholder:text-white/5 z-10" 
                 placeholder="Begin your narrative..." 
               />
          </div>
        </div>

        <div className="h-12 px-12 bg-black border-t border-white/10 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-gray-700">
           <div className="flex gap-12 items-center">
              <span>Words: {wordCount}</span>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-500' : 'bg-cyan-500 shadow-[0_0_8px_cyan]'}`}></div>
                <span>{isSaving ? 'SYNCING...' : 'SECURED'}</span>
              </div>
           </div>
           <div className="flex gap-8">
              <span>Sovereignty: {profile.motivation}</span>
              <span>Region: {profile.region}</span>
           </div>
        </div>
      </main>

      <div onMouseDown={() => isResizingPartner.current = true} className="w-1 bg-white/5 hover:bg-orange-500 cursor-ew-resize z-[60] transition-colors"></div>

      <aside className="border-l border-white/10 bg-[#080808]/95 backdrop-blur-2xl flex flex-col shrink-0 relative z-50" style={{ width: `${partnerWidth}px` }}>
        <div className="p-10 border-b border-white/10 bg-black flex items-center justify-between">
             <Link to="/wrapper-info" className="flex items-center gap-4 group">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)]"></div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.6em] text-[var(--accent)] group-hover:underline">WRAP HUB PARTNER</h3>
             </Link>
        </div>
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar bg-black/10">
           {messages.length === 0 && <div className="h-full flex items-center justify-center opacity-10 italic font-serif text-2xl">Standing by.</div>}
           {messages.map((m, i) => (
             <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-8 rounded-sm text-[14px] font-serif italic leading-relaxed ${m.role === 'user' ? 'bg-white/5 text-gray-500 border border-white/5' : 'bg-accent/5 text-gray-300 border border-accent/20'}`}>
                  {m.content}
                </div>
             </div>
           ))}
           {isPartnerLoading && <div className="text-[9px] animate-pulse uppercase tracking-[0.6em] text-orange-500 px-2">Consulting Archives...</div>}
        </div>
        <form onSubmit={handlePartnerChat} className="p-10 bg-black border-t border-white/10 space-y-4">
            <textarea value={partnerInput} onChange={(e) => setPartnerInput(e.target.value)} placeholder="Consult Rap..." className="w-full bg-[#030303] border border-white/10 p-5 text-sm font-serif italic text-white focus:border-orange-500 outline-none h-32 rounded-sm resize-none transition-all" />
            <button type="submit" disabled={isPartnerLoading || !partnerInput.trim()} className="w-full py-4 bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-[0.5em] rounded-sm disabled:opacity-30 hover:brightness-110 transition-all">Send Query</button>
         </form>
      </aside>

      <input type="file" ref={fileInputRef} className="hidden" accept=".docx,.txt" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsProcessingWrite(true);
        try {
          const text = await file.text();
          setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: text } : c));
        } finally { setIsProcessingWrite(false); }
      }} />
    </div>
  );
};

export default AuthorBuilder;

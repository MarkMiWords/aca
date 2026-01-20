
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { queryPartner, smartSoap, performOCR } from '../services/geminiService';
import { Message, Chapter } from '../types';
import { devLog } from '../components/DevConsole';

const STYLES = ['Fiction', 'Non-Fiction', 'Prison Life', 'Crime Life', 'Love Story', 'Sad Story', 'Tragic Story', 'Life Story'];
const REGIONS = ['Asia', 'Australia', 'North America', 'South America', 'United Kingdom', 'Europe'];

const FONT_PAIRINGS = [
  { name: 'Classic', title: 'font-serif font-black italic', body: 'font-serif text-xl' },
  { name: 'Modern', title: 'font-serif font-bold', body: 'font-sans text-lg' },
  { name: 'Typewriter', title: 'font-mono uppercase tracking-tighter', body: 'font-mono text-base tracking-tight' },
  { name: 'Manuscript', title: 'font-serif italic font-light', body: 'font-serif italic text-2xl leading-relaxed' },
];

const MAX_WORDS = 1000;
const DEFAULT_CHAPTER: Chapter = { id: '1', title: "", content: '', order: 0, media: [], subChapters: [] };

// ROBUST PARSER: Guaranteed to return expected type or fallback
const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === "undefined" || item === "null") return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed || fallback;
  } catch (e) {
    console.error(`Vault Guard [${key}]: Data corrupted. Using recovery template.`);
    return fallback;
  }
};

const AuthorBuilder: React.FC = () => {
  const navigate = useNavigate();
  
  // Hydrate with safety
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const val = safeParse('wrap_sheets_v4', [DEFAULT_CHAPTER]);
    return val.length > 0 ? val : [DEFAULT_CHAPTER];
  });
  
  // Ensure activeChapterId always points to something that exists
  const [activeChapterId, setActiveChapterId] = useState(() => {
    const initialId = chapters[0]?.id;
    return initialId || '1';
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerInput, setPartnerInput] = useState('');
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [isPartnerOpen, setIsPartnerOpen] = useState(true);
  const [isSoaping, setIsSoaping] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'active' | 'unauthorized'>('checking');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // CRITICAL: Guaranteed Object Access
  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0] || DEFAULT_CHAPTER;
  const wordCount = (activeChapter.content || "").trim().split(/\s+/).filter(w => w.length > 0).length;
  const isLimitReached = wordCount >= MAX_WORDS;

  const profile = safeParse('aca_author_profile', { fontIndex: 0 });
  const currentFont = FONT_PAIRINGS[profile.fontIndex] || FONT_PAIRINGS[0];
  const [style] = useState(() => profile.motivation || STYLES[2]); 
  const [region] = useState(() => profile.region || REGIONS[1]);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      if (typeof (window as any).aistudio !== 'undefined') {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setApiStatus(hasKey ? 'active' : 'unauthorized');
      } else {
        setApiStatus('active'); 
      }
    } catch (e) { setApiStatus('unauthorized'); }
  };

  useEffect(() => {
    localStorage.setItem('wrap_sheets_v4', JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isPartnerLoading]);

  const handleNewSheet = () => {
    const newId = Date.now().toString(); 
    setChapters([{ ...DEFAULT_CHAPTER, id: newId }, ...chapters]); 
    setActiveChapterId(newId);
  };

  const handleSoap = async (level: 'rinse' | 'wash' | 'scrub' | 'sanitize') => {
    if (!activeChapter.content?.trim()) return;
    setIsSoaping(true); 
    try {
      const result = await smartSoap(activeChapter.content, level, style, region);
      setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: result.text } : c));
    } catch (err) {
      devLog('error', 'Soap Link Failed.');
    } finally { setIsSoaping(false); }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-[#020202] text-white overflow-hidden selection:bg-orange-500/30">
      <aside className="w-80 border-r border-white/5 bg-[#080808] flex flex-col shrink-0 overflow-hidden">
        <div className="flex-grow overflow-y-auto pt-40 pb-4 custom-scrollbar">
          {chapters.map(c => (
            <div key={c.id} onClick={() => setActiveChapterId(c.id)} className={`py-4 px-6 cursor-pointer border-l-2 transition-all ${activeChapterId === c.id ? 'bg-orange-500/15 border-orange-500 text-orange-500' : 'border-transparent text-gray-700 hover:bg-white/5'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] truncate">{c.title || 'Draft Sheet'}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-6 border-t border-white/5 bg-black/40 space-y-4">
          <button onClick={handleNewSheet} className="w-full p-4 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all rounded-sm shadow-xl">CREATE NEW SHEET</button>
          <button onClick={() => navigate('/sovereign-vault')} className="w-full p-4 border border-dashed border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-700 hover:text-orange-500 transition-all rounded-sm">Vault Access</button>
        </div>
      </aside>

      <main className="flex-grow flex flex-col relative bg-[#020202]">
        <div className="flex-grow flex flex-col px-12 pt-6 pb-12 overflow-y-auto custom-scrollbar">
           <div className="w-full h-full flex flex-col">
              <div className="grid grid-cols-2 gap-1 border-y border-white/[0.03] bg-white/[0.01] mb-12">
                   <button onClick={() => handleSoap('rinse')} className="p-6 text-left hover:bg-white/5 transition-all border-r border-white/5 group">
                      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-orange-500">Rinse</div>
                   </button>
                   <button onClick={() => handleSoap('scrub')} className="p-6 text-left hover:bg-white/5 transition-all group">
                      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 group-hover:text-orange-500">Scrub</div>
                   </button>
              </div>

              <textarea 
                rows={1} 
                value={activeChapter.title} 
                onChange={(e) => { const val = e.target.value; setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, title: val } : c)); }} 
                className={`w-full bg-transparent border-none outline-none focus:ring-0 text-5xl mb-8 font-serif italic text-white ${currentFont.title}`} 
                placeholder="Heading..." 
              />
              <textarea 
                value={activeChapter.content} 
                onChange={(e) => { if(!isLimitReached) setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: e.target.value } : c)); }} 
                className={`w-full flex-grow bg-transparent border-none outline-none focus:ring-0 resize-none text-gray-400 text-xl font-serif leading-[2.2] ${currentFont.body}`} 
                placeholder="Begin the narrative..." 
              />
           </div>
        </div>
      </main>

      <aside className={`border-l border-white/5 bg-[#080808] flex flex-col shrink-0 relative transition-all duration-500 ease-in-out ${isPartnerOpen ? 'w-[420px]' : 'w-0 opacity-0 overflow-hidden'}`}>
        <div className="shrink-0 p-10 border-b border-white/5 bg-[#0a0a0a] pt-40">
           <h3 className="text-orange-500 text-[12px] font-black uppercase tracking-[0.5em] glow-orange">WRAP PARTNER</h3>
        </div>
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-10 space-y-8 custom-scrollbar bg-black/10">
           {messages.map((m, i) => (
             <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start animate-fade-in'}`}>
                <div className={`max-w-[90%] p-6 rounded-sm text-sm font-serif italic leading-relaxed ${m.role === 'user' ? 'bg-white/5 text-gray-500 border border-white/10' : 'bg-orange-500/5 text-gray-300 border border-orange-500/20'}`}>{m.content}</div>
             </div>
           ))}
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AuthorBuilder;

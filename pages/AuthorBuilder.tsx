
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { queryPartner, smartSoap, jiveContent, generateSpeech, analyzeVoiceAndDialect, performOCR } from '../services/geminiService';
import { Message, Chapter, MediaAsset, VaultStorage, VaultSheet, EfficiencyLog } from '../types';

// Declare mammoth for Word import
declare const mammoth: any;

const PERSONAS = ['Standard', 'Bogan', 'Hillbilly', 'Homeboy', 'Lad', 'Eshay', 'Chav', 'Bogger', 'Gopnik', 'Scouse', 'Valley', 'Posh'];
const STYLES = ['Fiction', 'Non-Fiction', 'Prison Life', 'Crime Life', 'Love Story', 'Sad Story', 'Tragic Story', 'Life Story'];
const REGIONS = ['Asia', 'Australia', 'North America', 'South America', 'United Kingdom', 'Europe'];

const SPEEDS = [ { label: '0.8x', value: 0.8 }, { label: '1.0x', value: 1.0 }, { label: '1.2x', value: 1.2 }, { label: '1.5x', value: 1.5 } ];
const VOICES = [
  { id: 'Fenrir', label: 'Male 1 (Deep)', type: 'male' },
  { id: 'Charon', label: 'Male 2 (Soft)', type: 'male' },
  { id: 'Zephyr', label: 'Female 1 (Warm)', type: 'female' },
  { id: 'Kore', label: 'Female 2 (Clear)', type: 'female' },
  { id: 'Puck', label: 'Cartoon (Rando)', type: 'cartoon' },
];

const DEFAULT_TITLE = "In the beginning was the word...";
const MAX_WORDS = 1000;
const WARNING_WORDS = 900;

const FONT_PAIRINGS = [
  { name: 'Classic', title: 'font-serif font-black italic', body: 'font-serif text-xl' },
  { name: 'Modern', title: 'font-serif font-bold', body: 'font-sans text-lg' },
  { name: 'Typewriter', title: 'font-mono uppercase tracking-tighter', body: 'font-mono text-base tracking-tight' },
  { name: 'Manuscript', title: 'font-serif italic font-light', body: 'font-serif italic text-2xl leading-relaxed' },
];

function generateCourierCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'AT-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

function pcmToWavBlob(base64: string, sampleRate: number = 24000): Blob {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeString = (offset: number, string: string) => { for (let i = 0; i < string.length; i++) { view.setUint8(offset + i, string.charCodeAt(i)); } };
  writeString(0, 'RIFF'); view.setUint32(4, 36 + len, true); writeString(8, 'WAVE'); writeString(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, len, true);
  return new Blob([header, bytes], { type: 'audio/wav' });
}

const AuthorBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem('wrap_sheets_v4');
    return saved ? JSON.parse(saved) : [{ id: '1', title: DEFAULT_TITLE, content: '', order: 0, media: [], subChapters: [] }];
  });
  
  const [activeChapterId, setActiveChapterId] = useState('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerInput, setPartnerInput] = useState('');
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [fontIndex, setFontIndex] = useState(0);
  // currentFont defined to resolve JSX errors
  const currentFont = FONT_PAIRINGS[fontIndex];
  const [isListening, setIsListening] = useState(false);
  const [isPartnerListening, setIsPartnerListening] = useState(false);
  const [showSoapMenu, setShowSoapMenu] = useState(false);
  const [showSpeakMenu, setShowSpeakMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [isSoaping, setIsSoaping] = useState(false);
  const [isDogging, setIsDogging] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingLoading, setIsSpeakingLoading] = useState(false);
  const [isOCRLoading, setIsOCRLoading] = useState(false);
  const [wrapperWidth, setWrapperWidth] = useState(384); 
  const [isPrintView, setIsPrintView] = useState(false);
  const [currentPrintKey, setCurrentPrintKey] = useState("");
  
  const [style, setStyle] = useState(STYLES[2]); 
  const [region, setRegion] = useState(REGIONS[1]);

  const [showTooltips, setShowTooltips] = useState(() => {
    const profile = localStorage.getItem('aca_author_profile');
    return profile ? JSON.parse(profile).showTooltips !== false : true;
  });

  const [uiStrings, setUiStrings] = useState<Record<string, string>>({
    registry: "Registry", sheets: "My Sheets", actions: "Actions", speak: "Speak", dictate: "Dictate", soap: "Drop the Soap", mastering: "Mastering Suite", newSheet: "New Sheet"
  });
  const [customPersona, setCustomPersona] = useState<string>(() => localStorage.getItem('wrap_custom_persona') || "");
  const [detectedLocale, setDetectedLocale] = useState<string>("Standard");
  const [isVoiceLabOpen, setIsVoiceLabOpen] = useState(false);
  const [isRecordingLab, setIsRecordingLab] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [selectedPersona, setSelectedPersona] = useState(customPersona ? 'MyVoice' : PERSONAS[0]);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const partnerRecognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const isResizing = useRef(false);

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];
  const wordCount = activeChapter.content ? activeChapter.content.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const isLimitReached = wordCount >= MAX_WORDS;
  const isWarningReached = wordCount >= WARNING_WORDS;

  useEffect(() => {
    localStorage.setItem('wrap_sheets_v4', JSON.stringify(chapters));
    if (isLimitReached) handleEmergencyAutoVault();
  }, [chapters]);

  const logEfficiency = (action: string, metrics: any) => {
    const vault: VaultStorage = JSON.parse(localStorage.getItem('aca_sovereign_vault') || '{"sheets":[],"books":[],"ai":[],"audits":[],"efficiencyLogs":[]}');
    if (!vault.efficiencyLogs) vault.efficiencyLogs = [];
    const newLog: EfficiencyLog = { id: Date.now().toString(), timestamp: new Date().toISOString(), action, metrics };
    vault.efficiencyLogs.unshift(newLog);
    localStorage.setItem('aca_sovereign_vault', JSON.stringify(vault));
  };

  const handleEmergencyAutoVault = () => {
    const vault: VaultStorage = JSON.parse(localStorage.getItem('aca_sovereign_vault') || '{"sheets":[],"books":[],"ai":[],"audits":[]}');
    const newKey = generateCourierCode();
    const newSheet: VaultSheet = { id: `auto-${Date.now()}`, timestamp: new Date().toISOString(), dispatchKey: newKey, status: 'archived', data: { ...activeChapter } };
    vault.sheets.unshift(newSheet);
    localStorage.setItem('aca_sovereign_vault', JSON.stringify(vault));
    alert(`SOVEREIGN STANDARD REACHED: 1,000-word quality threshold hit. Installment archived to THE BIG HOUSE. Continuing session.`);
    const nextId = Date.now().toString();
    const nextTitle = activeChapter.title !== DEFAULT_TITLE ? `${activeChapter.title} (Cont.)` : DEFAULT_TITLE;
    setChapters(prev => prev.map(c => c.id === activeChapterId ? { id: nextId, title: nextTitle, content: '', order: c.order, media: [], subChapters: [] } : c));
    setActiveChapterId(nextId);
  };

  const handleSoap = async (level: 'rinse' | 'scrub' | 'sanitize') => {
    if (!activeChapter.content.trim()) return;
    setIsSoaping(true); setShowSoapMenu(false);
    try {
      const result = await smartSoap(activeChapter.content, level);
      setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: result.text } : c));
      logEfficiency(`Soap: ${level}`, result.metrics);
    } finally { setIsSoaping(false); }
  };

  const handlePartnerChat = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const finalMsg = customMsg || partnerInput;
    if (!finalMsg.trim()) return;
    const userMsg = finalMsg;
    setPartnerInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsPartnerLoading(true);
    try {
      const response = await queryPartner(userMsg, style, region, messages, activeChapter.content);
      setMessages(prev => [...prev, response]);
      if (response.metrics) logEfficiency('Partner Chat', response.metrics);
    } finally { setIsPartnerLoading(false); }
  };

  const handleOCRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsOCRLoading(true); setShowActionMenu(false);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      try {
        const result = await performOCR(base64);
        setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: (c.content ? c.content + '\n\n' : '') + result.text } : c));
        logEfficiency('Paper-to-Pixel OCR', result.metrics);
      } catch (err: any) { alert(err.message); } finally { setIsOCRLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { if (isResizing.current) { const newWidth = window.innerWidth - e.clientX; if (newWidth > 300 && newWidth < 800) setWrapperWidth(newWidth); } };
    const handleMouseUp = () => { isResizing.current = false; document.body.style.cursor = 'default'; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, []);

  if (isPrintView) return (
    <div className="bg-white text-black p-20 min-h-screen font-serif">
      <header className="border-b-4 border-black pb-8 mb-12 flex justify-between items-end">
        <div><h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">A Captive Audience</h1><p className="text-xs font-bold uppercase tracking-widest">Official Manuscript Submission Registry</p></div>
        <div className="text-right"><p className="text-[10px] font-bold uppercase">Date: {new Date().toLocaleDateString()}</p></div>
      </header>
      <section className="mb-20"><h2 className="text-3xl font-bold italic mb-10 underline decoration-2 underline-offset-8">{activeChapter.title}</h2><div className="text-xl leading-relaxed whitespace-pre-wrap">{activeChapter.content}</div></section>
      <footer className="mt-auto pt-12 border-t border-dashed border-gray-300"><div className="bg-black text-white p-8 rounded-sm"><p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">Digital Dispatch Key</p><p className="text-3xl font-mono tracking-[0.2em] mb-4">{currentPrintKey}</p></div></footer>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-[#020202] text-white overflow-hidden selection:bg-orange-500/30">
      <aside className="w-80 border-r border-white/5 bg-[#080808] flex flex-col shrink-0">
        <div className="flex-grow overflow-y-auto pt-32 pb-4 custom-scrollbar">
          {chapters.map(c => (
            <div key={c.id} onClick={() => setActiveChapterId(c.id)} className={`py-3 px-4 cursor-pointer border-l-2 transition-all ${activeChapterId === c.id ? 'bg-orange-500/15 border-orange-500 text-orange-500' : 'border-transparent text-gray-700'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] truncate">{c.title === DEFAULT_TITLE ? 'Untitled Sheet' : c.title}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 space-y-3">
          <Link to="/wrap-it-up" className="w-full p-4 bg-orange-500/10 border border-orange-500/30 text-[9px] font-black uppercase tracking-widest text-orange-500 hover:bg-orange-500 hover:text-white transition-all rounded-sm flex items-center justify-center gap-2">Mastering Suite</Link>
          <button disabled={isLimitReached} onClick={() => { const newId = Date.now().toString(); setChapters([...chapters, { id: newId, title: DEFAULT_TITLE, content: '', order: 0, media: [], subChapters: [] }]); setActiveChapterId(newId); }} className="w-full p-4 border border-dashed border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-700 hover:text-orange-500 transition-all rounded-sm disabled:opacity-30">+ {uiStrings.newSheet}</button>
        </div>
      </aside>

      <main className="flex-grow flex flex-col relative bg-[#020202]">
        <div className="absolute top-4 right-12 z-[40] flex gap-4">
           <div className="flex items-center gap-3 bg-black/40 border border-white/5 px-4 py-2 rounded-full backdrop-blur-md">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)] animate-pulse"></div>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">AU-Local Sync Active</span>
           </div>
        </div>

        <div className="px-12 py-8 border-b border-white/[0.03] bg-[#050505] flex items-center justify-between sticky top-0 z-[60] backdrop-blur-xl">
           <div className="flex items-center gap-10">
              <button onClick={() => setFontIndex((fontIndex + 1) % FONT_PAIRINGS.length)} className="text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-[0.3em] transition-colors">Font: {currentFont.name}</button>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 bg-black/40 border border-white/10 px-6 py-2 rounded-sm group relative">
                 <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${isLimitReached ? 'bg-red-500' : isWarningReached ? 'bg-orange-500' : 'bg-gray-700'}`} style={{ width: `${(wordCount / MAX_WORDS) * 100}%` }}></div>
                 </div>
                 <span className={`text-[9px] font-black uppercase tracking-widest ${isWarningReached ? 'text-orange-500 animate-pulse' : 'text-gray-600'}`}>{wordCount} / {MAX_WORDS}</span>
              </div>
              <button onClick={() => setShowSoapMenu(!showSoapMenu)} className={`flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 transition-all bg-white/5 font-black uppercase tracking-widest text-[9px] ${isSoaping ? 'text-orange-500 animate-pulse' : 'text-gray-500 hover:text-white'}`}>{uiStrings.soap}</button>
              {showSoapMenu && (
                <div className="absolute right-0 mt-32 w-48 bg-[#0d0d0d] border border-white/10 shadow-2xl z-[100] overflow-hidden">
                  <button onClick={() => handleSoap('rinse')} className="w-full p-4 text-left text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 border-b border-white/5">Rinse (Punctuation)</button>
                  <button onClick={() => handleSoap('scrub')} className="w-full p-4 text-left text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 border-b border-white/5">Scrub (Flow)</button>
                  <button onClick={() => handleSoap('sanitize')} className="w-full p-4 text-left text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-white/5">Sanitize (Legal)</button>
                </div>
              )}
              <button onClick={() => setShowActionMenu(!showActionMenu)} className="bg-orange-500 text-white px-10 py-3 text-[10px] font-black uppercase tracking-[0.4em] rounded-sm hover:bg-orange-600 transition-all">{uiStrings.actions}</button>
              {showActionMenu && (
                <div className="absolute right-0 mt-32 w-56 bg-[#0d0d0d] border border-white/10 shadow-2xl z-[100] overflow-hidden">
                  <button onClick={() => ocrInputRef.current?.click()} className="w-full p-4 text-left text-[9px] font-black uppercase tracking-widest text-orange-500 hover:text-white hover:bg-orange-500/10 border-b border-white/5">Paper to Pixel (OCR)</button>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 text-left text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5">Import Document</button>
                </div>
              )}
           </div>
        </div>

        <div className="flex-grow flex flex-col px-12 py-12 overflow-y-auto custom-scrollbar">
           <div className="w-full max-w-none space-y-12 h-full flex flex-col relative">
              <textarea rows={2} value={activeChapter.title} onChange={(e) => { const val = e.target.value; setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, title: val } : c)); }} className={`w-full bg-transparent border-none outline-none focus:ring-0 text-5xl md:text-7xl leading-tight tracking-tighter resize-none overflow-hidden ${currentFont.title}`} placeholder={DEFAULT_TITLE} />
              <textarea value={activeChapter.content} onChange={(e) => { if (isLimitReached) return; const val = e.target.value; setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: val } : c)); }} className={`w-full flex-grow bg-transparent border-none outline-none focus:ring-0 resize-none text-gray-400 text-xl font-serif leading-[2.2] transition-all ${currentFont.body} ${isLimitReached ? 'opacity-50 pointer-events-none' : ''}`} placeholder="The narrative begins here..." />
           </div>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept=".docx,.txt,.md" />
        <input type="file" ref={ocrInputRef} onChange={handleOCRUpload} className="hidden" accept="image/*" />
      </main>

      <div onMouseDown={() => { isResizing.current = true; document.body.style.cursor = 'ew-resize'; }} className="w-1.5 hover:bg-orange-500/40 cursor-ew-resize transition-colors z-[80] bg-white/5 no-print"></div>

      <aside className="border-l border-white/5 bg-[#080808] flex flex-col shrink-0 relative no-print h-full" style={{ width: `${wrapperWidth}px` }}>
        <div className="shrink-0 p-10 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]"><Link to="/wrapper-info"><h3 className="text-orange-500 text-[11px] font-black uppercase tracking-[0.5em] glow-orange">WRAP</h3></Link></div>
        <div className="flex-grow overflow-y-auto p-10 space-y-8 custom-scrollbar bg-black/10">
           {messages.map((m, i) => (
             <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start animate-fade-in'}`}>
                <div className={`max-w-[90%] p-6 rounded-sm text-sm font-serif leading-relaxed ${m.role === 'user' ? 'bg-white/5 border border-white/10 text-gray-500 italic' : 'bg-orange-500/5 border border-orange-500/20 text-gray-300'}`}>{m.content}</div>
             </div>
           ))}
           {isPartnerLoading && <div className="text-[9px] text-orange-500 animate-pulse uppercase tracking-widest ml-6">Consulting Archives...</div>}
           <div ref={chatEndRef} />
        </div>
        <form onSubmit={handlePartnerChat} className="shrink-0 p-10 bg-[#0a0a0a] border-t border-white/5 flex flex-col gap-4">
           <textarea value={partnerInput} onChange={(e) => setPartnerInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePartnerChat())} className="w-full bg-[#030303] border border-white/10 p-6 text-base font-serif italic text-white focus:border-orange-500/50 outline-none resize-none h-32 rounded-sm" placeholder="Talk or Type to WRAP..." />
           <button type="submit" className="w-full bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white py-3 text-[10px] font-black uppercase tracking-[0.4em] border border-white/10 rounded-sm transition-all">Send It</button>
        </form>
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

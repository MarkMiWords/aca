
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { queryPartner, smartSoap, performOCR } from '../services/geminiService';
import { Message, Chapter } from '../types';

const STYLES = ['Fiction', 'Non-Fiction', 'Prison Life', 'Crime Life', 'Love Story', 'Sad Story', 'Tragic Story', 'Life Story'];
const REGIONS = ['Asia', 'Australia', 'North America', 'South America', 'United Kingdom', 'Europe'];

const FONT_PAIRINGS = [
  { name: 'Classic', title: 'font-serif font-black italic', body: 'font-serif text-xl' },
  { name: 'Modern', title: 'font-serif font-bold', body: 'font-sans text-lg' },
  { name: 'Typewriter', title: 'font-mono uppercase tracking-tighter', body: 'font-mono text-base tracking-tight' },
  { name: 'Manuscript', title: 'font-serif italic font-light', body: 'font-serif italic text-2xl leading-relaxed' },
];

const MAX_WORDS = 1000;
const WARNING_WORDS = 900;

function generateCourierCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'AT-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

const AuthorBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem('wrap_sheets_v4');
    return saved ? JSON.parse(saved) : [{ id: '1', title: "", content: '', order: 0, media: [], subChapters: [] }];
  });
  
  const [activeChapterId, setActiveChapterId] = useState('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerInput, setPartnerInput] = useState('');
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [fontIndex, setFontIndex] = useState(0);
  const currentFont = FONT_PAIRINGS[fontIndex];
  
  // Menu Visibility
  const [showSoapMenu, setShowSoapMenu] = useState(false);
  const [showSpeakMenu, setShowSpeakMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showVoiceTraining, setShowVoiceTraining] = useState(false);
  
  // Protocol Activity
  const [isSoaping, setIsSoaping] = useState(false);
  const [isOCRLoading, setIsOCRLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProducing, setIsProducing] = useState(false);
  const [isCalibratingVoice, setIsCalibratingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  
  const [wrapperWidth, setWrapperWidth] = useState(420); 

  // Engine Variables
  const [style, setStyle] = useState(() => {
    const saved = localStorage.getItem('aca_author_profile');
    return saved ? JSON.parse(saved).motivation || STYLES[2] : STYLES[2];
  }); 
  const [region, setRegion] = useState(() => {
    const saved = localStorage.getItem('aca_author_profile');
    return saved ? JSON.parse(saved).region || REGIONS[1] : REGIONS[1];
  });

  const [speakGender, setSpeakGender] = useState<'male' | 'female'>('female');
  const [speakSpeed, setSpeakSpeed] = useState(1);
  const [speakLang, setSpeakLang] = useState('en-AU');
  const [useClonedVoice, setUseClonedVoice] = useState(false);

  const authorProfile = (() => {
    const saved = localStorage.getItem('aca_author_profile');
    return saved ? JSON.parse(saved) : null;
  })();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const isResizing = useRef(false);

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];
  const wordCount = activeChapter.content ? activeChapter.content.trim().split(/\s+/).filter(w => w.length > 0).length : 0;
  const isLimitReached = wordCount >= MAX_WORDS;
  const isWarningReached = wordCount >= WARNING_WORDS;

  useEffect(() => {
    localStorage.setItem('wrap_sheets_v4', JSON.stringify(chapters));
    if (isLimitReached) handleEmergencyAutoVault();
  }, [chapters]);

  useEffect(() => {
    if (messages.length === 0 && authorProfile) {
      setMessages([{ 
        role: 'assistant', 
        content: `Sovereign Link Restored. Calibration: ${style} / ${region}. The WRAP Protocol is online.` 
      }]);
    }
  }, [authorProfile, style, region]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerLoading]);

  // --- CORE PROTOCOLS ---

  const handleSoap = async (level: 'rinse' | 'scrub' | 'sanitize') => {
    if (!activeChapter.content.trim()) return;
    setIsSoaping(true); 
    setShowSoapMenu(false);
    try {
      const result = await smartSoap(activeChapter.content, level, style, region);
      setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: result.text } : c));
    } finally { setIsSoaping(false); }
  };

  const handleDoggMe = async () => {
    if (!activeChapter.content.trim() || isSoaping) return;
    setIsSoaping(true);
    try {
      const prompt = `TRANSFORM THE FOLLOWING TEXT INTO DOGGEREL. Doggerel is poetry that is irregular in rhythm and rhyme, often comical, burlesque, or satirical. Use the grit and slang of ${region}. Structure the output as clear, rhyming stanzas. TEXT:\n${activeChapter.content}`;
      const response = await queryPartner(prompt, style, region, [], activeChapter.content);
      if (response.content) {
        setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: response.content } : c));
      }
    } finally { setIsSoaping(false); }
  };

  const handleProduce = async () => {
    if (!activeChapter.content.trim() || isProducing) return;
    setIsProducing(true);
    try {
      const prompt = `EXPAND THE NARRATIVE BY 50%. ADD VIVID SENSORY DETAILS APPROPRIATE FOR ${style.toUpperCase()}. RETAIN THE RAW EMOTIONAL TEXTURE. OUTPUT ONLY THE EXPANDED STORY.\n\nTEXT:\n${activeChapter.content}`;
      const response = await queryPartner(prompt, style, region, [], activeChapter.content);
      if (response.content) {
        setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: response.content } : c));
      }
    } finally { setIsProducing(false); }
  };

  const handleArticulate = () => {
    if (isRecording) { setIsRecording(false); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Browser unavailable for dictation."); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = speakLang;
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) {
        setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: (c.content ? c.content + ' ' : '') + finalTranscript } : c));
      }
    };
    recognition.start();
  };

  const handleSpeak = () => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); return; }
    if (!activeChapter.content.trim()) return;
    const utterance = new SpeechSynthesisUtterance(activeChapter.content);
    utterance.lang = speakLang;
    utterance.rate = speakSpeed;
    const voices = window.speechSynthesis.getVoices();
    // Logic for Cloned Voice simulation or prebuilt choice
    const voice = voices.find(v => v.lang === speakLang && (speakGender === 'female' ? v.name.includes('Female') : v.name.includes('Male')));
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceCalibration = () => {
    setIsCalibratingVoice(true);
    setVoiceProgress(0);
    const interval = setInterval(() => {
      setVoiceProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalibratingVoice(false);
          setShowVoiceTraining(false);
          setUseClonedVoice(true);
          setMessages(prevMsgs => [...prevMsgs, { role: 'assistant', content: "Voice Profile Calibrated. 'My Voice' protocol active." }]);
          return 100;
        }
        return prev + 3.33; // Approx 30 seconds total
      });
    }, 1000);
  };

  const handleVoiceExport = () => {
    // In a real environment, we'd capture the stream from the TTS engine.
    // For this simulation, we'll generate a placeholder dispatch.
    const blob = new Blob(["Simulated Audio Stream Data for " + activeChapter.title], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeChapter.title || 'dispatch'}_vocal.wav`;
    link.click();
    alert("Audio Dispatch Exported for Substack Upload.");
  };

  const handleExport = (format: 'txt' | 'md' | 'docx') => {
    const blob = new Blob([activeChapter.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeChapter.title || 'sheet'}.${format}`;
    link.click();
    setShowActionMenu(false);
  };

  const handleEmergencyAutoVault = () => {
    const vault = JSON.parse(localStorage.getItem('aca_sovereign_vault') || '{"sheets":[],"books":[],"ai":[],"audits":[]}');
    const newKey = generateCourierCode();
    vault.sheets.unshift({ id: `auto-${Date.now()}`, timestamp: new Date().toISOString(), dispatchKey: newKey, status: 'archived', data: { ...activeChapter } });
    localStorage.setItem('aca_sovereign_vault', JSON.stringify(vault));
    alert(`LIMIT REACHED: Sheet archived.`);
    const nextId = Date.now().toString();
    setChapters(prev => prev.map(c => c.id === activeChapterId ? { id: nextId, title: `${c.title} (Cont.)`, content: '', order: c.order, media: [], subChapters: [] } : c));
    setActiveChapterId(nextId);
  };

  const handlePartnerChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!partnerInput.trim()) return;
    const userMsg = partnerInput;
    setPartnerInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsPartnerLoading(true);
    try {
      const response = await queryPartner(userMsg, style, region, messages, activeChapter.content);
      setMessages(prev => [...prev, response]);
    } finally { setIsPartnerLoading(false); }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { if (isResizing.current) { const newWidth = window.innerWidth - e.clientX; if (newWidth > 300 && newWidth < 800) setWrapperWidth(newWidth); } };
    const handleMouseUp = () => { isResizing.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, []);

  const isAnythingLoading = isPartnerLoading || isSoaping || isOCRLoading || isProducing;

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-[#020202] text-white overflow-hidden selection:bg-orange-500/30">
      {/* SIDEBAR */}
      <aside className="w-80 border-r border-white/5 bg-[#080808] flex flex-col shrink-0">
        <div className="flex-grow overflow-y-auto pt-32 pb-4 custom-scrollbar">
          {chapters.map(c => (
            <div key={c.id} onClick={() => setActiveChapterId(c.id)} className={`py-4 px-6 cursor-pointer border-l-2 transition-all ${activeChapterId === c.id ? 'bg-orange-500/15 border-orange-500 text-orange-500' : 'border-transparent text-gray-700 hover:bg-white/5'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] truncate">{c.title || 'Untitled Sheet'}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-6 border-t border-white/5 bg-black/40 space-y-4">
          <Link to="/wrap-it-up" className="w-full p-4 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all rounded-sm flex items-center justify-center">Mastering Suite</Link>
          <button onClick={() => { const newId = Date.now().toString(); setChapters([...chapters, { id: newId, title: "", content: '', order: 0, media: [], subChapters: [] }]); setActiveChapterId(newId); }} className="w-full p-4 border border-dashed border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-700 hover:text-orange-500 transition-all rounded-sm">+ New Sheet</button>
        </div>
      </aside>

      {/* ENGINE */}
      <main className="flex-grow flex flex-col relative bg-[#020202]">
        <div className="px-12 py-8 border-b border-white/[0.03] bg-[#050505] flex items-center justify-between sticky top-0 z-[60] backdrop-blur-xl">
           <div className="flex items-center gap-10">
              <button onClick={() => setFontIndex((fontIndex + 1) % FONT_PAIRINGS.length)} className="text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-[0.3em] transition-colors">Font: {currentFont.name}</button>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 h-10">
                <div className="relative">
                   <button onClick={() => { setShowSpeakMenu(!showSpeakMenu); setShowSoapMenu(false); setShowActionMenu(false); }} className={`text-[8px] font-black uppercase tracking-widest transition-all ${isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-gray-500 hover:text-white'}`}>Speak</button>
                   {showSpeakMenu && (
                     <div className="absolute right-0 mt-4 w-56 bg-[#0d0d0d] border border-white/10 shadow-2xl z-[100] p-6 space-y-4 rounded-sm">
                       <div className="space-y-1">
                         <label className="text-[7px] text-gray-600 uppercase font-bold">Protocol</label>
                         <button onClick={() => setShowVoiceTraining(true)} className={`w-full py-2 border border-white/10 text-[9px] font-bold tracking-widest uppercase transition-all ${useClonedVoice ? 'border-orange-500 text-orange-500' : 'text-gray-500 hover:text-white'}`}>
                           {useClonedVoice ? 'My Voice: Active' : 'Clone Voice Profile'}
                         </button>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                         <div className="space-y-1">
                           <label className="text-[7px] text-gray-600 uppercase font-bold">Gender</label>
                           <select value={speakGender} onChange={(e) => setSpeakGender(e.target.value as any)} className="w-full bg-black border border-white/10 text-[9px] text-gray-400 p-1">
                             <option value="female">Female</option>
                             <option value="male">Male</option>
                           </select>
                         </div>
                         <div className="space-y-1">
                           <label className="text-[7px] text-gray-600 uppercase font-bold">Speed</label>
                           <select value={speakSpeed} onChange={(e) => setSpeakSpeed(parseFloat(e.target.value))} className="w-full bg-black border border-white/10 text-[9px] text-gray-400 p-1">
                             <option value="0.8">0.8x</option>
                             <option value="1">1.0x</option>
                             <option value="1.2">1.2x</option>
                             <option value="1.5">1.5x</option>
                           </select>
                         </div>
                       </div>
                       <div className="space-y-1">
                         <label className="text-[7px] text-gray-600 uppercase font-bold">Accent</label>
                         <select value={speakLang} onChange={(e) => setSpeakLang(e.target.value)} className="w-full bg-black border border-white/10 text-[9px] text-gray-400 p-1">
                           <option value="en-AU">Aussie Grit</option>
                           <option value="en-GB">British Sharp</option>
                           <option value="en-US">US Standard</option>
                         </select>
                       </div>
                       <div className="pt-2 space-y-2">
                         <button onClick={handleSpeak} className="w-full py-3 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest hover:bg-orange-600">{isSpeaking ? 'Stop' : 'Start Narrative'}</button>
                         <button onClick={handleVoiceExport} className="w-full py-2 bg-white/5 border border-white/10 text-white text-[8px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Voice Export (.WAV)</button>
                       </div>
                     </div>
                   )}
                </div>
                <button onClick={() => { setShowSoapMenu(!showSoapMenu); setShowSpeakMenu(false); setShowActionMenu(false); }} className={`text-[8px] font-black uppercase tracking-widest transition-all ${isSoaping ? 'text-orange-500 animate-pulse' : 'text-gray-500 hover:text-white'}`}>Soap</button>
                {showSoapMenu && (
                  <div className="absolute right-0 mt-20 w-48 bg-[#0d0d0d] border border-white/10 shadow-2xl z-[100] overflow-hidden rounded-sm">
                    <button onClick={() => handleSoap('rinse')} className="w-full p-4 text-left text-[9px] font-black uppercase tracking-widest text-gray-500 hover:bg-white/5 border-b border-white/5">Rinse</button>
                    <button onClick={() => handleSoap('scrub')} className="w-full p-4 text-left text-[9px] font-black uppercase tracking-widest text-orange-500 hover:bg-white/5 border-b border-white/5">Scrub</button>
                    <button onClick={() => handleSoap('sanitize')} className="w-full p-4 text-left text-[9px] font-black uppercase tracking-widest text-red-500 hover:bg-white/5">Sanitize</button>
                  </div>
                )}
              </div>
              <div className="relative">
                <button onClick={() => { setShowActionMenu(!showActionMenu); setShowSoapMenu(false); setShowSpeakMenu(false); }} className="bg-white text-black px-10 py-3 text-[10px] font-black uppercase tracking-[0.4em] rounded-sm hover:bg-orange-500 hover:text-white transition-all">Actions</button>
                {showActionMenu && (
                  <div className="absolute right-0 mt-4 w-56 bg-[#0d0d0d] border border-white/10 shadow-2xl z-[100] overflow-hidden rounded-sm">
                    <button onClick={() => { ocrInputRef.current?.click(); setShowActionMenu(false); }} className="w-full p-4 text-left text-[9px] font-black uppercase tracking-widest text-orange-500 hover:bg-white/5 border-b border-white/5">OCR Scanner</button>
                    <button onClick={() => handleExport('docx')} className="w-full p-4 text-left text-[9px] font-black uppercase tracking-widest text-gray-500 hover:bg-white/5 border-b border-white/5">Export .DOCX</button>
                    <button onClick={() => { setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: '' } : c)); setShowActionMenu(false); }} className="w-full p-4 text-left text-[9px] font-black uppercase tracking-widest text-red-900 hover:text-red-500 border-t border-white/5">Clear Sheet</button>
                    <Link to="/sovereign-vault" className="w-full p-4 block text-left text-[9px] font-black uppercase tracking-widest text-orange-500/60 hover:text-orange-500 border-t border-white/5">The Big House</Link>
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* EDITOR */}
        <div className="flex-grow flex flex-col px-12 py-12 overflow-y-auto custom-scrollbar">
           <div className="w-full max-w-none h-full flex flex-col relative">
              <div className="space-y-4 mb-8">
                <textarea rows={1} value={activeChapter.title} onChange={(e) => { const val = e.target.value; setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, title: val } : c)); }} className={`w-full bg-transparent border-none outline-none focus:ring-0 text-2xl md:text-3xl leading-tight tracking-tighter resize-none overflow-hidden ${currentFont.title}`} placeholder="HEADING" />
                
                {/* THE WRAP PROTOCOL BELT - POLISHED TYPOGRAPHY */}
                <div className="grid grid-cols-4 gap-1 border-y border-white/[0.03] bg-white/[0.01]">
                   <button onClick={() => contentRef.current?.focus()} className="group p-6 text-left hover:bg-white/5 transition-all border-r border-white/5">
                      <div className="text-[12px] font-black text-gray-700 uppercase tracking-[0.4em] group-hover:text-white transition-colors mb-1"><span className="text-xl">W</span>rite</div>
                      <div className="text-[8px] text-gray-800 font-bold uppercase tracking-widest">Draft Story</div>
                   </button>
                   <button onClick={() => handleSoap('scrub')} disabled={isSoaping} className={`group p-6 text-left hover:bg-white/5 transition-all border-r border-white/5 ${isSoaping ? 'animate-pulse' : ''}`}>
                      <div className={`text-[12px] font-black uppercase tracking-[0.4em] transition-colors mb-1 ${isSoaping ? 'text-orange-500' : 'text-gray-700 group-hover:text-orange-500'}`}><span className="text-xl">R</span>efine</div>
                      <div className="text-[8px] text-gray-800 font-bold uppercase tracking-widest">Scrub Verse</div>
                   </button>
                   <button onClick={handleArticulate} disabled={isRecording} className={`group p-6 text-left hover:bg-white/5 transition-all border-r border-white/5 ${isRecording ? 'animate-pulse' : ''}`}>
                      <div className={`text-[12px] font-black uppercase tracking-[0.4em] transition-colors mb-1 ${isRecording ? 'text-red-500' : 'text-gray-700 group-hover:text-cyan-400'}`}><span className="text-xl">A</span>rticulate</div>
                      <div className="text-[8px] text-gray-800 font-bold uppercase tracking-widest">Diction</div>
                   </button>
                   <button onClick={handleProduce} disabled={isProducing} className={`group p-6 text-left hover:bg-white/5 transition-all ${isProducing ? 'animate-pulse' : ''}`}>
                      <div className={`text-[12px] font-black uppercase tracking-[0.4em] transition-colors mb-1 ${isProducing ? 'text-green-500' : 'text-gray-700 group-hover:text-green-500'}`}><span className="text-xl">P</span>roduce</div>
                      <div className="text-[8px] text-gray-800 font-bold uppercase tracking-widest">Mastering</div>
                   </button>
                </div>
                
                {/* UTILITY STRIP: DOGG ME & DICTATION */}
                <div className="flex items-center gap-6 px-6 py-4 bg-black/40 border-b border-white/5">
                   <button onClick={handleDoggMe} disabled={isSoaping} className={`text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${isSoaping ? 'text-orange-500 animate-pulse' : 'text-gray-600 hover:text-orange-500 transition-colors'}`}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                      Dogg Me
                   </button>
                   <div className="h-3 w-[1px] bg-white/10"></div>
                   <button onClick={handleArticulate} className={`text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-600 hover:text-white transition-colors'}`}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z"/><path d="M11 13a3 3 0 11-6 0V4a3 3 0 116 0v4z"/></svg>
                      {isRecording ? 'Recording...' : 'Dictate'}
                   </button>
                </div>
              </div>

              <div className="flex-grow flex flex-col relative group">
                <textarea ref={contentRef} value={activeChapter.content} onChange={(e) => { if (isLimitReached) return; setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: e.target.value } : c)); }} className={`w-full flex-grow bg-transparent border-none outline-none focus:ring-0 resize-none text-gray-400 text-xl font-serif leading-[2.2] transition-all ${currentFont.body} ${isLimitReached ? 'opacity-50 pointer-events-none' : ''}`} placeholder="Begin the narrative..." />
                
                {/* WORD COUNTER heart-beat */}
                <div className="sticky bottom-0 right-0 p-8 bg-gradient-to-t from-[#020202] to-transparent pointer-events-none flex justify-end">
                  <div className="flex items-center gap-4 bg-black/80 border border-white/10 px-6 py-3 rounded-sm pointer-events-auto shadow-2xl">
                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-700 ${isLimitReached ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${(wordCount / MAX_WORDS) * 100}%` }}></div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] animate-living-amber`}>{wordCount} / {MAX_WORDS}</span>
                  </div>
                </div>
              </div>
           </div>
        </div>
        <input type="file" ref={ocrInputRef} onChange={async (e) => {
          const file = e.target.files?.[0]; if (!file) return; setIsOCRLoading(true);
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64 = (event.target?.result as string).split(',')[1];
            const result = await performOCR(base64);
            setChapters(prev => prev.map(c => c.id === activeChapterId ? { ...c, content: (c.content ? c.content + '\n\n' : '') + result.text } : c));
            setIsOCRLoading(false);
          };
          reader.readAsDataURL(file);
        }} className="hidden" accept="image/*" />
      </main>

      {/* VOICE CALIBRATION MODAL */}
      {showVoiceTraining && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-md w-full bg-[#0d0d0d] border border-white/10 p-12 text-center shadow-2xl rounded-sm">
             <h3 className="text-3xl font-serif italic text-white mb-6">Voice <span className="text-orange-500">Calibration.</span></h3>
             <p className="text-gray-500 text-sm italic leading-relaxed mb-10">Read your text naturally for 30 seconds. The WRAP engine will analyze your frequency, accent, and cadence to build your unique Sovereign Voice Profile.</p>
             
             {isCalibratingVoice ? (
               <div className="space-y-8">
                 <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${voiceProgress}%` }}></div>
                 </div>
                 <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest animate-pulse">Analyzing Frequency: {Math.round(voiceProgress)}%</p>
               </div>
             ) : (
               <button onClick={startVoiceCalibration} className="w-full bg-orange-500 text-white py-5 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-orange-600 transition-all rounded-sm">Begin 30s Profile Session</button>
             )}
             <button onClick={() => setShowVoiceTraining(false)} className="mt-8 text-gray-700 hover:text-white text-[9px] font-bold uppercase tracking-widest transition-colors">Cancel Calibration</button>
          </div>
        </div>
      )}

      {/* PARTNER */}
      <aside className="border-l border-white/5 bg-[#080808] flex flex-col shrink-0 relative no-print h-full" style={{ width: `${wrapperWidth}px` }}>
        <div className="shrink-0 p-10 border-b border-white/5 flex flex-col gap-4 bg-[#0a0a0a] pt-48">
           <Link to="/wrapper-info" className="flex flex-col">
             <h3 className="text-orange-500 text-[12px] font-black uppercase tracking-[0.5em] glow-orange mb-1">WRAP PARTNER</h3>
             <span className="text-[8px] text-gray-700 font-bold uppercase tracking-widest">Protocol calibrated to {region} / {style}</span>
           </Link>
           <div className="grid grid-cols-2 gap-3 mt-4">
              <select value={style} onChange={(e) => setStyle(e.target.value)} className="bg-black border border-white/10 text-[9px] text-gray-400 p-2 focus:border-orange-500 outline-none">
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-black border border-white/10 text-[9px] text-gray-400 p-2 focus:border-orange-500 outline-none">
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
           </div>
        </div>
        <div className="flex-grow overflow-y-auto p-10 space-y-8 custom-scrollbar bg-black/10">
           {messages.map((m, i) => (
             <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start animate-fade-in'}`}>
                <div className={`max-w-[90%] p-6 rounded-sm text-sm font-serif leading-relaxed ${m.role === 'user' ? 'bg-white/5 border border-white/10 text-gray-500 italic' : 'bg-orange-500/5 border border-orange-500/20 text-gray-300'}`}>{m.content}</div>
             </div>
           ))}
           {isPartnerLoading && <div className="text-[9px] text-orange-500 animate-pulse uppercase tracking-widest">Consulting...</div>}
           <div ref={chatEndRef} />
        </div>
        <form onSubmit={handlePartnerChat} className="p-10 bg-[#0a0a0a] border-t border-white/5 flex flex-col gap-4">
           <textarea value={partnerInput} onChange={(e) => setPartnerInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePartnerChat())} className="w-full bg-[#030303] border border-white/10 p-4 text-base font-serif italic text-white outline-none h-24 rounded-sm shadow-inner" placeholder="Talk to WRAP..." />
           <button type="submit" className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.4em] rounded-sm hover:bg-orange-500 hover:text-white transition-all shadow-xl">Transcribe</button>
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

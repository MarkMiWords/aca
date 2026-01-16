
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { queryPartner, smartSoap, jiveContent, generateSpeech } from '../services/geminiService';
import { Message, Chapter } from '../types';

// Declare mammoth for Word import
declare const mammoth: any;

const STYLES = ['Fiction', 'Non-fiction', 'Prison life', 'Crime life', 'Love story', 'Sad story', 'Tragic story', 'Life story'];
const REGIONS = ['Asia', 'Australia', 'North America', 'South America', 'United Kingdom', 'Europe'];
const PERSONAS = ['Standard', 'Bogan', 'Hillbilly', 'Homeboy', 'Lad', 'Eshay', 'Chav', 'Bogger', 'Gopnik', 'Scouse', 'Valley', 'Posh'];
const SPEEDS = [
  { label: '0.8x', value: 0.8 },
  { label: '1.0x', value: 1.0 },
  { label: '1.2x', value: 1.2 },
  { label: '1.5x', value: 1.5 }
];
const VOICES = [
  { id: 'Fenrir', label: 'Male 1 (Deep)', type: 'male' },
  { id: 'Charon', label: 'Male 2 (Soft)', type: 'male' },
  { id: 'Zephyr', label: 'Female 1 (Warm)', type: 'female' },
  { id: 'Kore', label: 'Female 2 (Clear)', type: 'female' },
  { id: 'Puck', label: 'Cartoon (Rando)', type: 'cartoon' },
];

const DEFAULT_TITLE = "In the beginning was the word...";

const FONT_PAIRINGS = [
  { name: 'Classic', title: 'font-serif font-black italic', body: 'font-serif text-xl' },
  { name: 'Modern', title: 'font-serif font-bold', body: 'font-sans text-lg' },
  { name: 'Typewriter', title: 'font-mono uppercase tracking-tighter', body: 'font-mono text-base tracking-tight' },
  { name: 'Manuscript', title: 'font-serif italic font-light', body: 'font-serif italic text-2xl leading-relaxed' },
];

/**
 * Utility to convert raw PCM base64 from Gemini to a playable WAV Blob.
 * This allows us to use HTML5 Audio and preserve pitch when changing speed.
 */
function pcmToWavBlob(base64: string, sampleRate: number = 24000): Blob {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, len, true);

  return new Blob([header, bytes], { type: 'audio/wav' });
}

const AuthorBuilder: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    const saved = localStorage.getItem('wrap_sheets_v4');
    return saved ? JSON.parse(saved) : [{ id: '1', title: DEFAULT_TITLE, content: '', order: 0, media: [], subChapters: [] }];
  });
  
  const [activeChapterId, setActiveChapterId] = useState('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerInput, setPartnerInput] = useState('');
  const [isPartnerLoading, setIsPartnerLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [style, setStyle] = useState(STYLES[2]);
  const [region, setRegion] = useState(REGIONS[1]);
  const [fontIndex, setFontIndex] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isListening, setIsListening] = useState(false);
  const [isWrapperListening, setIsWrapperListening] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showSoapMenu, setShowSoapMenu] = useState(false);
  const [showSpeakMenu, setShowSpeakMenu] = useState(false);
  const [isSoaping, setIsSoaping] = useState(false);
  const [isJiving, setIsJiving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Speak Settings
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [selectedSpeed, setSelectedSpeed] = useState(SPEEDS[1].value);
  
  const isResizing = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const wrapperRecognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Chapter logic
  const findChapterById = (list: Chapter[], id: string): Chapter | undefined => {
    for (const c of list) {
      if (c.id === id) return c;
      if (c.subChapters && c.subChapters.length > 0) {
        const found = findChapterById(c.subChapters, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const updateChapterInList = (list: Chapter[], id: string, updates: Partial<Chapter>): Chapter[] => {
    return list.map(c => {
      if (c.id === id) return { ...c, ...updates };
      if (c.subChapters && c.subChapters.length > 0) {
        return { ...c, subChapters: updateChapterInList(c.subChapters, id, updates) };
      }
      return c;
    });
  };

  const activeChapter = findChapterById(chapters, activeChapterId) || chapters[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerLoading]);

  // Voice Dictation
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setChapters(prev => {
            const currentActive = findChapterById(prev, activeChapterId) || prev[0];
            return updateChapterInList(prev, activeChapterId, { 
              content: (currentActive.content ? currentActive.content + ' ' : '') + transcript 
            });
          });
        }
      };
      recognitionRef.current.onend = () => { if (isListening) recognitionRef.current.start(); };

      wrapperRecognitionRef.current = new SpeechRecognition();
      wrapperRecognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (event.results[0].isFinal) {
          setPartnerInput(transcript);
          setIsWrapperListening(false);
        }
      };
    }
  }, [activeChapterId, isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const toggleWrapperListening = () => {
    if (isWrapperListening) {
      wrapperRecognitionRef.current?.stop();
      setIsWrapperListening(false);
    } else {
      setIsWrapperListening(true);
      wrapperRecognitionRef.current?.start();
    }
  };

  const handleSoap = async (level: 'rinse' | 'scrub' | 'sanitize') => {
    setShowSoapMenu(false);
    if (!activeChapter.content.trim()) return;
    setIsSoaping(true);
    try {
      const clean = await smartSoap(activeChapter.content, level);
      setChapters(updateChapterInList(chapters, activeChapterId, { content: clean }));
    } finally {
      setIsSoaping(false);
    }
  };

  const handleJive = async () => {
    if (!activeChapter.content.trim()) return;
    setIsJiving(true);
    try {
      const jived = await jiveContent(activeChapter.content, region);
      setChapters(updateChapterInList(chapters, activeChapterId, { content: jived }));
    } finally {
      setIsJiving(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  };

  const handleSpeak = async () => {
    // Logic: If already speaking, the button stops audio.
    if (isSpeaking) {
      stopAudio();
      setShowSpeakMenu(false);
      return;
    }

    setShowSpeakMenu(false);
    if (!activeChapter.content.trim()) return;
    setIsSpeaking(true);
    
    try {
      const base64Audio = await generateSpeech(activeChapter.content, selectedVoice, selectedPersona);
      if (base64Audio) {
        const blob = pcmToWavBlob(base64Audio, 24000);
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        // Key Update: Use browser's pitch preservation
        audio.preservesPitch = true;
        audio.playbackRate = selectedSpeed;
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        
        audioRef.current = audio;
        audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error("Audio engine error:", err);
      setIsSpeaking(false);
    }
  };

  const handleDocxImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      try {
        const result = await mammoth.convertToMarkdown({ arrayBuffer });
        const newId = Date.now().toString();
        setChapters([...chapters, { id: newId, title: file.name.replace('.docx', ''), content: result.value, order: Date.now(), media: [], subChapters: [] }]);
        setActiveChapterId(newId);
      } catch (err) { alert("Import failed."); }
    };
    reader.readAsArrayBuffer(file);
    setShowActionMenu(false);
  };

  const exportMD = () => {
    const blob = new Blob([`# ${activeChapter.title}\n\n${activeChapter.content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChapter.title.replace(/\s+/g, '_')}.md`;
    a.click();
    setShowActionMenu(false);
  };

  const exportDocx = () => {
    const html = `<html><body><h1>${activeChapter.title}</h1><p>${activeChapter.content.replace(/\n/g, '<br>')}</p></body></html>`;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeChapter.title.replace(/\s+/g, '_')}.docx`;
    link.click();
    setShowActionMenu(false);
  };

  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem('wrap_sheets_v4', JSON.stringify(chapters));
      setSaveStatus('saved');
    }, 1200);
    return () => clearTimeout(timer);
  }, [chapters]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < 800) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => { isResizing.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleWrapperChat = async (msg: string) => {
    const input = msg.trim();
    if (!input) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setPartnerInput('');
    setIsPartnerLoading(true);
    try {
      const response = await queryPartner(input, style, region, messages, activeChapter.content, "");
      setMessages(prev => [...prev, response]);
    } finally {
      setIsPartnerLoading(false);
    }
  };

  const currentFont = FONT_PAIRINGS[fontIndex];

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-[#030303] text-white overflow-hidden selection:bg-orange-500/30">
      <input type="file" ref={fileInputRef} onChange={handleDocxImport} accept=".docx" className="hidden" />

      {/* Registry Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-[#080808] flex flex-col shrink-0">
        <div className="p-8 border-b border-white/5 shrink-0">
           <h2 className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-600">Registry</h2>
        </div>
        <div className="flex-grow overflow-y-auto pt-4 pb-4 custom-scrollbar">
          {chapters.map(c => (
            <div key={c.id} onClick={() => setActiveChapterId(c.id)} className={`py-3 px-4 cursor-pointer border-l-2 ${activeChapterId === c.id ? 'bg-orange-500/15 border-orange-500 text-orange-500 shadow-[inset_12px_0_30px_-15px_rgba(230,126,34,0.1)]' : 'border-transparent text-gray-700 hover:text-gray-400'}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] truncate">{c.title === DEFAULT_TITLE ? 'Untitled Sheet' : c.title}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-white/5 bg-black/40">
            <button onClick={() => {
              const newId = Date.now().toString();
              setChapters([...chapters, { id: newId, title: DEFAULT_TITLE, content: '', order: Date.now(), media: [], subChapters: [] }]);
              setActiveChapterId(newId);
            }} className="w-full p-4 border border-dashed border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-700 hover:text-orange-500 transition-all rounded-sm">
              + New Sheet
            </button>
        </div>
      </aside>

      {/* Main Sheet Workspace */}
      <main className="flex-grow flex flex-col relative bg-[#030303]">
        <div className="px-12 py-8 border-b border-white/[0.03] bg-[#050505] flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl">
           <div className="flex items-center gap-10">
              <button onClick={() => setFontIndex((fontIndex + 1) % FONT_PAIRINGS.length)} className="text-[9px] font-black text-gray-500 hover:text-white uppercase tracking-[0.3em] transition-colors">
                Font: {currentFont.name}
              </button>
           </div>

           <div className="flex items-center gap-6">
              {(isSoaping || isJiving) && <span className="text-[8px] font-black text-orange-500 animate-pulse uppercase tracking-widest">Processing...</span>}
              
              {/* Drop the Soap Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowSoapMenu(!showSoapMenu)}
                  className={`flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 text-gray-500 hover:text-white transition-all bg-white/5 font-black uppercase tracking-widest text-[9px]`}
                >
                  Drop the Soap
                  <svg className={`w-3 h-3 transition-transform ${showSoapMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                {showSoapMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0d0d0d] border border-white/10 shadow-2xl rounded-sm z-50 overflow-hidden">
                    <button onClick={() => handleSoap('rinse')} className="w-full text-left p-4 hover:bg-white/5 border-b border-white/5">
                      <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">Rinse</p>
                      <p className="text-[7px] text-gray-600 uppercase font-bold tracking-tighter">Light Polish</p>
                    </button>
                    <button onClick={() => handleSoap('scrub')} className="w-full text-left p-4 hover:bg-white/5 border-b border-white/5">
                      <p className="text-[9px] font-black text-white uppercase tracking-widest mb-1">Scrub</p>
                      <p className="text-[7px] text-gray-600 uppercase font-bold tracking-tighter">Deep Clean</p>
                    </button>
                    <button onClick={() => handleSoap('sanitize')} className="w-full text-left p-4 hover:bg-white/5">
                      <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Sanitize</p>
                      <p className="text-[7px] text-gray-600 uppercase font-bold tracking-tighter">High Security</p>
                    </button>
                  </div>
                )}
              </div>

              {/* Jive Button */}
              <button 
                onClick={handleJive}
                className="px-6 py-2 rounded-full border border-white/10 text-gray-500 hover:text-accent hover:border-accent transition-all bg-white/5 font-black uppercase tracking-widest text-[9px]"
              >
                Jive
              </button>

              {/* Speak Menu */}
              <div className="relative">
                <button 
                  onClick={() => isSpeaking ? handleSpeak() : setShowSpeakMenu(!showSpeakMenu)}
                  className={`flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 transition-all font-black uppercase tracking-widest text-[9px] ${isSpeaking ? 'text-orange-500 border-orange-500 animate-pulse bg-orange-500/5 shadow-[0_0_20px_rgba(230,126,34,0.3)]' : 'text-gray-500 hover:text-white bg-white/5'}`}
                >
                  {isSpeaking ? (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                      Stop
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      Speak
                    </>
                  )}
                </button>
                {showSpeakMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#0d0d0d] border border-white/10 shadow-2xl rounded-sm z-50 p-6 space-y-6">
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Voice Profile</label>
                       <select 
                         value={selectedVoice} 
                         onChange={(e) => setSelectedVoice(e.target.value)}
                         className="w-full bg-black border border-white/10 text-[10px] text-white p-2 outline-none uppercase font-bold tracking-widest"
                       >
                         {VOICES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Persona Filter</label>
                       <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                          {PERSONAS.map(p => (
                            <button 
                              key={p} 
                              onClick={() => setSelectedPersona(p)}
                              className={`text-[8px] p-2 text-left uppercase tracking-widest border transition-all ${selectedPersona === p ? 'bg-orange-500 border-orange-500 text-white' : 'bg-black border-white/10 text-gray-500 hover:text-white'}`}
                            >
                              {p}
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Speech Rate</label>
                       <div className="flex gap-2">
                          {SPEEDS.map(s => (
                            <button 
                              key={s.value} 
                              onClick={() => setSelectedSpeed(s.value)}
                              className={`flex-grow text-[8px] p-2 text-center uppercase tracking-widest border transition-all ${selectedSpeed === s.value ? 'bg-white text-black border-white' : 'bg-black border-white/10 text-gray-500 hover:text-white'}`}
                            >
                              {s.label}
                            </button>
                          ))}
                       </div>
                    </div>
                    <button 
                      onClick={handleSpeak}
                      className="w-full bg-orange-500 text-white py-3 text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all rounded-sm"
                    >
                      Listen Now
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={toggleListening}
                className={`flex items-center gap-3 px-6 py-2 rounded-full border transition-all ${isListening ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
              >
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)]' : 'bg-gray-700'}`}></div>
                <span className="text-[9px] font-black uppercase tracking-widest">Dictate</span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="bg-orange-500 text-white px-10 py-3 text-[10px] font-black uppercase tracking-[0.4em] rounded-sm flex items-center gap-3 hover:bg-orange-600 transition-all"
                >
                  Actions
                  <svg className={`w-3 h-3 transition-transform ${showActionMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                {showActionMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0d0d0d] border border-white/10 shadow-2xl rounded-sm z-50 overflow-hidden">
                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-left p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:bg-white/5 border-b border-white/5">Import Word (.docx)</button>
                    <button className="w-full text-left p-4 text-[9px] font-black text-gray-400 uppercase tracking-widest hover:bg-white/5 border-b border-white/5">Import Markdown / TXT</button>
                    <div className="bg-white/[0.02] border-y border-white/5">
                      <button onClick={exportMD} className="w-full text-left p-4 text-[9px] font-black text-accent uppercase tracking-widest hover:bg-white/5 border-b border-white/5">Export Markdown (.md)</button>
                      <button onClick={exportDocx} className="w-full text-left p-4 text-[9px] font-black text-accent uppercase tracking-widest hover:bg-white/5">Export Word (.docx)</button>
                    </div>
                    <Link to="/wrap-it-up" className="w-full block text-left p-4 text-[9px] font-black text-orange-500 uppercase tracking-widest hover:bg-orange-500/10">Mastering Suite</Link>
                  </div>
                )}
              </div>
           </div>
        </div>

        <div className="flex-grow flex flex-col px-4 sm:px-6 lg:px-12 py-12 overflow-y-auto custom-scrollbar">
           <div className="w-full max-w-none space-y-12 h-full flex flex-col">
              <textarea 
                rows={2}
                value={activeChapter.title}
                onFocus={(e) => e.target.value === DEFAULT_TITLE && setChapters(updateChapterInList(chapters, activeChapterId, { title: '' }))}
                onChange={(e) => setChapters(updateChapterInList(chapters, activeChapterId, { title: e.target.value }))}
                className={`w-full bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-900 transition-all glow-white text-5xl md:text-7xl leading-tight tracking-tighter resize-none overflow-hidden ${currentFont.title}`}
                placeholder={DEFAULT_TITLE}
              />
              <textarea 
                value={activeChapter.content}
                onChange={(e) => setChapters(updateChapterInList(chapters, activeChapterId, { content: e.target.value }))}
                className={`w-full flex-grow bg-transparent border-none outline-none focus:ring-0 resize-none text-gray-400 leading-[1.8] placeholder:text-gray-800 transition-all ${currentFont.body}`}
                placeholder="The narrative begins here..."
              />
           </div>
        </div>
      </main>

      {/* WRAPPER Sidebar */}
      <div onMouseDown={() => { isResizing.current = true; }} className="w-1 cursor-ew-resize bg-white/5 hover:bg-orange-500/40 z-40"></div>
      <aside className="border-l border-white/5 bg-[#080808] flex flex-col shrink-0 relative" style={{ width: `${sidebarWidth}px` }}>
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
           <Link to="/wrapper-info" className="group"><h3 className="text-orange-500 text-[11px] font-black uppercase tracking-[0.5em] glow-orange">WRAPPER</h3></Link>
           <div className={`w-2 h-2 rounded-full ${isPartnerLoading ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
        </div>

        <div className="p-8 border-b border-white/5 grid grid-cols-2 gap-4 bg-black/20">
          <div className="space-y-1">
            <label className="text-[7px] font-bold text-gray-700 uppercase">Style</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full bg-[#050505] border border-white/10 text-[9px] text-gray-500 p-2 outline-none appearance-none font-black tracking-widest">
              {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[7px] font-bold text-gray-700 uppercase">Region</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-[#050505] border border-white/10 text-[9px] text-gray-500 p-2 outline-none appearance-none font-black tracking-widest">
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-10 space-y-8 custom-scrollbar">
           {messages.map((m, i) => (
             <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start animate-fade-in'}`}>
                <div className={`max-w-[90%] p-6 rounded-sm text-sm font-serif leading-relaxed ${m.role === 'user' ? 'bg-white/5 border border-white/10 text-gray-500 italic' : 'bg-orange-500/5 border border-orange-500/20 text-gray-300'}`}>
                   {m.content}
                </div>
             </div>
           ))}
           {isPartnerLoading && <div className="text-[9px] text-orange-500 animate-pulse uppercase tracking-[0.4em] font-black text-center">Consulting archives...</div>}
           <div ref={chatEndRef} />
        </div>

        <div className="p-10 bg-[#0a0a0a] border-t border-white/5">
           <div className="relative">
             <textarea 
               value={partnerInput}
               onChange={(e) => setPartnerInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleWrapperChat(partnerInput))}
               className="w-full bg-[#030303] border border-white/10 p-6 pr-24 text-base font-serif italic text-white focus:border-orange-500/50 outline-none resize-none h-32 rounded-sm"
               placeholder="Whisper to WRAPPER..."
             />
             <div className="absolute bottom-6 right-6 flex items-center gap-4">
                <button onClick={toggleWrapperListening} className={`p-2 transition-all ${isWrapperListening ? 'text-red-500 animate-pulse' : 'text-gray-600 hover:text-white'}`}>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v10a3 3 0 006 0V7a3 3 0 00-3-3z"/></svg>
                </button>
                <button onClick={() => handleWrapperChat(partnerInput)} className="text-orange-500 hover:text-white transition-all transform hover:scale-110">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
             </div>
           </div>
        </div>
      </aside>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AuthorBuilder;

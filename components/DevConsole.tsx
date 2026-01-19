
import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'request' | 'response';
  message: string;
}

export const DevConsole: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDirectMode, setIsDirectMode] = useState(() => localStorage.getItem('aca_dev_direct') === 'true');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLog = (e: any) => {
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        ...e.detail
      }].slice(-50)); // Keep last 50 logs
    };
    window.addEventListener('aca-dev-log', handleLog);
    
    // Keyboard shortcut: Ctrl + Shift + D to toggle console
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    
    return () => {
      window.removeEventListener('aca-dev-log', handleLog);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const toggleDirectMode = () => {
    const newVal = !isDirectMode;
    setIsDirectMode(newVal);
    localStorage.setItem('aca_dev_direct', String(newVal));
    window.location.reload(); // Reload to re-init API services
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 left-6 z-[999] opacity-40 hover:opacity-100 transition-opacity bg-[#0d0d0d] border border-orange-500/30 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-sm text-orange-500 shadow-2xl"
    >
      <span className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
        Dev Console [CTRL+SHIFT+D]
      </span>
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 w-full h-80 bg-[#050505]/98 backdrop-blur-2xl border-t border-white/10 z-[1000] flex flex-col font-mono animate-slide-up shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Sovereign Dev Terminal</span>
            <span className="text-[7px] text-gray-600 font-bold uppercase tracking-widest">Diagnostic Bridge Active</span>
          </div>
          
          <div className="h-6 w-[1px] bg-white/10"></div>

          <label className="flex items-center gap-4 cursor-pointer group">
            <div 
              onClick={toggleDirectMode}
              className={`w-10 h-5 rounded-full relative transition-all border ${isDirectMode ? 'bg-green-500/20 border-green-500/50' : 'bg-white/5 border-white/10'}`}
            >
              <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-lg transition-all ${isDirectMode ? 'left-6 bg-green-500' : 'left-1 bg-gray-700'}`}></div>
            </div>
            <div className="flex flex-col">
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isDirectMode ? 'text-green-500' : 'text-gray-500 group-hover:text-white'}`}>
                {isDirectMode ? 'Direct Mode: ON' : 'Direct Mode: OFF'}
              </span>
              <span className="text-[7px] text-gray-700 font-bold uppercase">Bypass Server API</span>
            </div>
          </label>
        </div>
        
        <div className="flex items-center gap-6">
           <button 
            onClick={() => setLogs([])}
            className="text-[9px] text-gray-600 hover:text-white uppercase tracking-widest border-b border-gray-800 hover:border-white transition-all"
          >
            Clear Log
          </button>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white text-2xl transition-transform hover:scale-110">&times;</button>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-2 text-[11px] custom-scrollbar bg-black/20">
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-2">
            <p className="italic font-serif text-lg text-gray-400">"The silent registry is listening..."</p>
            <p className="text-[8px] uppercase tracking-widest">Awaiting interaction packet</p>
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-6 border-b border-white/[0.02] pb-1.5 group">
            <span className="text-gray-700 shrink-0 font-bold">[{log.timestamp}]</span>
            <span className={`uppercase font-black shrink-0 w-20 ${
              log.type === 'error' ? 'text-red-500' : 
              log.type === 'request' ? 'text-cyan-400' : 
              log.type === 'response' ? 'text-green-500' : 'text-gray-500'
            }`}>
              {log.type}
            </span>
            <span className={`leading-relaxed ${log.type === 'error' ? 'text-red-400 font-bold' : 'text-gray-400 group-hover:text-gray-200 transition-colors'}`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>

      <div className="px-8 py-3 bg-black/60 border-t border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-4 text-[8px] text-gray-700 uppercase tracking-widest">
          <span className="font-black text-gray-500">Build: 4.1.2-PROD</span>
          <span className="h-3 w-[1px] bg-white/5"></span>
          <span>Domain: {window.location.hostname}</span>
          <span className="h-3 w-[1px] bg-white/5"></span>
          <span className={isDirectMode ? "text-green-500" : "text-gray-700"}>Link: {isDirectMode ? "Sovereign-Direct" : "Server-Bridge"}</span>
        </div>
        <p className="text-[8px] text-gray-800 font-bold italic">© 2026 Mark Mi Words Studio</p>
      </div>
      
      <style>{`
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export function devLog(type: 'info' | 'error' | 'request' | 'response', message: string) {
  window.dispatchEvent(new CustomEvent('aca-dev-log', { detail: { type, message } }));
}

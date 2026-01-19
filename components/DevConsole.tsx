
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
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
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
      className="fixed bottom-4 left-4 z-[999] opacity-20 hover:opacity-100 transition-opacity bg-black border border-white/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full"
    >
      Dev Console [CTRL+SHIFT+D]
    </button>
  );

  return (
    <div className="fixed bottom-0 left-0 w-full h-80 bg-black/95 backdrop-blur-xl border-t border-white/10 z-[1000] flex flex-col font-mono animate-slide-up">
      <div className="flex items-center justify-between px-6 py-3 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Sovereign Dev Terminal</span>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div 
              onClick={toggleDirectMode}
              className={`w-8 h-4 rounded-full relative transition-all ${isDirectMode ? 'bg-green-500' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${isDirectMode ? 'left-5' : 'left-1'}`}></div>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white">Direct AI Mode (Bypass Server)</span>
          </label>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white text-xl">&times;</button>
      </div>
      
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-2 text-[10px] custom-scrollbar">
        {logs.length === 0 && <p className="text-gray-700 italic">No traffic recorded in current session...</p>}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-4 border-b border-white/[0.02] pb-1">
            <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
            <span className={`uppercase font-bold shrink-0 ${
              log.type === 'error' ? 'text-red-500' : 
              log.type === 'request' ? 'text-cyan-400' : 
              log.type === 'response' ? 'text-green-500' : 'text-gray-400'
            }`}>
              {log.type}
            </span>
            <span className={log.type === 'error' ? 'text-red-400' : 'text-gray-300'}>{log.message}</span>
          </div>
        ))}
      </div>

      <div className="p-3 bg-black border-t border-white/5 flex justify-between px-6">
        <p className="text-[8px] text-gray-700 uppercase tracking-widest">
          Build: 4.1.2-PROD | URL: {window.location.hostname}
        </p>
        <button 
          onClick={() => setLogs([])}
          className="text-[8px] text-gray-500 hover:text-white uppercase tracking-widest underline"
        >
          Clear Terminal
        </button>
      </div>
      
      <style>{`
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export function devLog(type: 'info' | 'error' | 'request' | 'response', message: string) {
  window.dispatchEvent(new CustomEvent('aca-dev-log', { detail: { type, message } }));
}

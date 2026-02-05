
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LiveSession: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#020202] min-h-screen text-white flex flex-col font-sans overflow-hidden">
      <header className="p-8 border-b border-white/5 flex justify-between items-center bg-black">
        <button onClick={() => navigate('/author-builder')} className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-colors">← Back to Forge</button>
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)]">Coming Soon</div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center max-w-5xl mx-auto w-full px-6 relative">
        <div className="text-center space-y-12 animate-fade-in">
          <div className="space-y-6">
            <h1 className="text-7xl md:text-[8rem] font-serif font-black italic text-white tracking-tighter leading-none uppercase">Acoustic <br/><span className="text-[var(--accent)]">Link.</span></h1>
            <p className="text-2xl text-gray-500 font-light italic max-w-xl mx-auto leading-relaxed">"Talk freely. Your story will be captured automatically."</p>
          </div>

          <div className="space-y-8">
            <div className="px-24 py-8 bg-white/5 border border-white/10 text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 rounded-sm">
              Voice Features Under Construction
            </div>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              The Acoustic Link voice interface is being rebuilt. In the meantime, explore the written tools in the Author Builder.
            </p>
            <button
              onClick={() => navigate('/author-builder')}
              className="px-16 py-6 text-white text-[10px] font-black uppercase tracking-[0.5em] shadow-xl transition-all rounded-sm animate-living-amber-bg"
            >
              Enter the Forge
            </button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default LiveSession;

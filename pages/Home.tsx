
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { Narrative } from '../types';
import { readArray } from '../utils/safeStorage';

const Home: React.FC = () => {
  const [latestNarratives, setLatestNarratives] = useState<Narrative[]>([]);

  useEffect(() => {
    const stories = readArray<Narrative>('external_registry', []);
    setLatestNarratives(stories.slice(0, 3));
  }, []);

  return (
    <div className="bg-black min-h-screen w-screen overflow-x-hidden flex flex-col selection:bg-[var(--accent)]/30">
      
      {/* Cinematic Main Entry */}
      <div className="h-screen flex flex-col md:flex-row">
        {/* THE FORGE: FORGE A STORY */}
        <Link 
          to="/live-protocol" 
          className="relative flex-1 flex flex-col items-center justify-center group overflow-hidden border-b md:border-b-0 md:border-r border-white/5 transition-all duration-700 ease-in-out hover:flex-[1.5]"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2500&auto=format&fit=crop" 
              className="w-full h-full object-cover grayscale brightness-[0.2] group-hover:brightness-[0.45] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[4000ms]" 
              alt="The Blacksmith Hammering Anvil" 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          </div>
          
          <div className="relative z-10 text-center space-y-8 px-10">
            <div className="space-y-2">
              <span className="text-orange-500 tracking-[1em] uppercase text-[10px] font-black block opacity-40 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">
                Sovereign Production
              </span>
              <h2 className="text-7xl md:text-[10rem] font-serif font-black italic text-white tracking-tighter leading-none group-hover:scale-105 group-hover:animate-forge-impact transition-all duration-700">
                FORGE <br />
                <span className="text-gray-800 group-hover:text-[var(--accent)] group-hover:animate-living-accent transition-colors duration-500">A Story.</span>
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-xl font-light italic max-w-xs mx-auto opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-200 transform translate-y-4 group-hover:translate-y-0">
              Pass through the gate and initialize your acoustic link.
            </p>
          </div>

          <div className="absolute bottom-20 opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-4 group-hover:translate-y-0">
             <div className="flex flex-col items-center gap-4">
                <span className="text-[9px] font-black uppercase tracking-[0.6em] text-orange-500">Access Protocol</span>
                <div className="w-1 h-16 bg-gradient-to-b from-orange-500 to-transparent animate-pulse"></div>
             </div>
          </div>
        </Link>

        {/* THE ARCHIVE: READ A STORY */}
        <Link 
          to="/published-books" 
          className="relative flex-1 flex flex-col items-center justify-center group overflow-hidden transition-all duration-700 ease-in-out hover:flex-[1.5]"
        >
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2500&auto=format&fit=crop" 
              className="w-full h-full object-cover grayscale brightness-[0.2] group-hover:brightness-[0.45] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[4000ms]" 
              alt="The Global Archive" 
            />
            <div className="absolute inset-0 bg-gradient-to-tl from-cyan-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          </div>

          <div className="relative z-10 text-center space-y-8 px-10">
            <div className="space-y-2">
              <span className="text-cyan-500 tracking-[1em] uppercase text-[10px] font-black block opacity-40 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">
                Verified Registry
              </span>
              <h2 className="text-7xl md:text-[10rem] font-serif font-black italic text-white tracking-tighter leading-none group-hover:scale-105 transition-transform duration-700">
                READ <br />
                <span className="text-gray-800 group-hover:text-cyan-400 transition-colors duration-500">A Story.</span>
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-xl font-light italic max-w-xs mx-auto opacity-0 group-hover:opacity-100 transition-all duration-1000 delay-200 transform translate-y-4 group-hover:translate-y-0">
              Browse authentic carceral narratives locked into the global registry.
            </p>
          </div>

          <div className="absolute bottom-20 opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-4 group-hover:translate-y-0">
             <div className="flex flex-col items-center gap-4">
                <span className="text-[9px] font-black uppercase tracking-[0.6em] text-cyan-500">Open Registry</span>
                <div className="w-1 h-16 bg-gradient-to-b from-cyan-500 to-transparent animate-pulse"></div>
             </div>
          </div>
        </Link>
      </div>

      {/* RECENT TRUTHS (Teaser Section) */}
      {latestNarratives.length > 0 && (
        <section className="bg-[#050505] py-32 px-6 border-t border-white/5 relative z-40">
           <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-16">
                 <div>
                    <span className="text-orange-500 tracking-[0.5em] uppercase text-[9px] font-black block mb-4">Latest Submissions</span>
                    <h2 className="text-5xl font-serif italic font-black text-white">Recent <span className="text-gray-700">Truths.</span></h2>
                 </div>
                 <Link to="/narratives" className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all underline underline-offset-8">Examine Full Archive →</Link>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                 {latestNarratives.map((n) => (
                    <div key={n.id} className="p-8 bg-white/[0.02] border border-white/5 rounded-sm hover:border-orange-500/20 transition-all">
                       <h3 className="text-xl font-serif italic text-white mb-4 line-clamp-1">{n.title}</h3>
                       <p className="text-sm text-gray-500 font-light italic mb-8 leading-relaxed line-clamp-3">"{n.excerpt}"</p>
                       <Link to="/narratives" className="text-[8px] font-black uppercase tracking-widest text-orange-500">Read in Archive</Link>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      )}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center pointer-events-auto">
         <Link to="/origin-story" className="relative p-2 group/logo transition-all duration-1000 hover:scale-110">
            <div className="absolute inset-0 bg-black/85 blur-2xl rounded-full scale-125 -z-10 transition-all duration-1000 group-hover/logo:bg-black group-hover/logo:blur-3xl group-hover/logo:scale-150"></div>
            <Logo variant="light" className="w-64 h-64 transition-transform duration-[4000ms] ease-in-out group-hover/logo:rotate-[360deg]" />
         </Link>
      </div>

      <style>{`
        @keyframes forge-impact { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02) translateX(2px); } 55% { transform: scale(1.02) translateX(-2px); } }
        .animate-forge-impact { animation: forge-impact 0.2s 2; }
      `}</style>
    </div>
  );
};

export default Home;


import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const Home: React.FC = () => {
  return (
    <div className="bg-black h-screen w-screen overflow-hidden flex flex-col md:flex-row selection:bg-[var(--accent)]/30">
      
      {/* THE FORGE: FORGE A STORY */}
      <Link 
        to="/author-builder" 
        className="relative flex-1 flex flex-col items-center justify-center group overflow-hidden border-b md:border-b-0 md:border-r border-white/5 transition-all duration-700 ease-in-out hover:flex-[1.5]"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=2500&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale brightness-[0.2] group-hover:brightness-[0.45] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[4000ms]" 
            alt="The Blacksmith Hammering Anvil" 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          {/* Kinetic Spark Overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-40 pointer-events-none mix-blend-screen overflow-hidden">
             <div className="absolute inset-0 animate-spark-drift" style={{backgroundImage: 'url(https://www.transparenttextures.com/patterns/stardust.png)'}}></div>
          </div>
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
            Hammer raw experience into industrial-grade manuscripts.
          </p>
        </div>

        {/* Action Indicator */}
        <div className="absolute bottom-20 opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-4 group-hover:translate-y-0">
           <div className="flex flex-col items-center gap-4">
              <span className="text-[9px] font-black uppercase tracking-[0.6em] text-orange-500">Initialize Anvil</span>
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

        {/* Action Indicator */}
        <div className="absolute bottom-20 opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-4 group-hover:translate-y-0">
           <div className="flex flex-col items-center gap-4">
              <span className="text-[9px] font-black uppercase tracking-[0.6em] text-cyan-500">Open Registry</span>
              <div className="w-1 h-16 bg-gradient-to-b from-cyan-500 to-transparent animate-pulse"></div>
           </div>
        </div>
      </Link>

      {/* FIXED CENTER ANCHOR: THE SOFT NEXUS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center pointer-events-auto">
         <Link 
           to="/origin-story" 
           className="relative p-2 group/logo transition-all duration-1000 hover:scale-110"
         >
            {/* Blurred Dark Halo - Edges are soft, strictly sized to logo */}
            <div className="absolute inset-0 bg-black/85 blur-2xl rounded-full scale-125 -z-10 transition-all duration-1000 group-hover/logo:bg-black group-hover/logo:blur-3xl group-hover/logo:scale-150"></div>
            
            {/* High Fidelity Central Logo */}
            <Logo 
              variant="light" 
              className="w-64 h-64 transition-transform duration-[4000ms] ease-in-out group-hover/logo:rotate-[360deg] drop-shadow-[0_0_20px_rgba(255,255,255,0.08)]" 
            />
         </Link>
         
         <div className="mt-8 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
            <span className="text-[8px] font-black uppercase tracking-[1.2em] text-white">Project Origin</span>
         </div>
      </div>

      <style>{`
        body { overflow: hidden !important; }
        @keyframes spark-drift {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.2); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes forge-impact {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02) translateX(2px); }
          55% { transform: scale(1.02) translateX(-2px); }
        }
        .animate-spark-drift { animation: spark-drift 8s infinite ease-in-out; }
        .animate-forge-impact { animation: forge-impact 0.2s 2; }
      `}</style>
    </div>
  );
};

export default Home;

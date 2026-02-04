
import React from 'react';
import { Link } from 'react-router-dom';

const Mission: React.FC = () => {
  return (
    <div className="bg-[#050505] min-h-screen text-white">
      {/* Manifest Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center border-b border-white/5">
        <span className="text-[var(--accent)] tracking-[0.6em] uppercase text-[10px] font-bold mb-6 block animate-fade-in">The Manifesto</span>
        <h1 className="text-6xl md:text-9xl font-serif font-bold mb-12 italic leading-none tracking-tighter">
          Reclaiming the <span className="text-[var(--accent)]">Narrative</span>,<br />
          Sovereign & Deep.
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed italic opacity-80">
          "Systemic friction leaves a mark. We provide the technical sanctuary and the professional stage to make those voices unignorable."
        </p>
      </section>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
        
        {/* WHAT & WHO SECTION */}
        <section className="grid md:grid-cols-2 gap-16 border-b border-white/5 pb-24">
          <div className="space-y-6">
            <h3 className="text-[var(--accent)] tracking-[0.4em] uppercase text-[10px] font-black">What is this?</h3>
            <h2 className="text-4xl font-serif font-bold italic">A Sovereign <span className="text-white/40">Workspace.</span></h2>
            <p className="text-gray-400 leading-relaxed font-light text-lg italic">
              A Captive Audience is a digital storytelling project built around first-hand systemic narratives. It is a secure infrastructure designed to bridge the gap between isolation and global publication.
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-white tracking-[0.4em] uppercase text-[10px] font-black">Who is it for?</h3>
            <h2 className="text-4xl font-serif font-bold italic">The <span className="text-[var(--accent)]">Impacted.</span></h2>
            <p className="text-gray-400 leading-relaxed font-light text-lg italic">
              Built for authors, litigants, and survivors navigatng the friction of the legal system who refuse to have their truth sanitized or silenced.
            </p>
          </div>
        </section>

        {/* ARCHITECTURE: THE FORGING PROCESS */}
        <section className="bg-[#0a0a0a] border border-white/5 p-12 md:p-20 relative overflow-hidden shadow-2xl rounded-sm">
           <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl font-serif italic text-white select-none pointer-events-none">ENGINE</div>
           
           <div className="mb-20">
              <span className="text-[var(--accent)] tracking-[0.5em] uppercase text-[10px] font-black mb-4 block">The Forging Protocol</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold italic text-white mb-6">Architecture of <span className="text-[var(--accent)]">Reclamation.</span></h2>
              <p className="text-gray-400 text-lg font-light leading-relaxed italic max-w-2xl">
                We have engineered a workspace that removes the "Grammar Barrier." Authorship should not require a degree or a keyboard. It requires a voice.
              </p>
           </div>

           <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Step 01 */}
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-serif italic text-[var(--accent)]">01</span>
                    <div className="h-[1px] flex-grow bg-white/10"></div>
                 </div>
                 <h4 className="text-white font-serif italic text-2xl">Vocal Ingestion</h4>
                 <p className="text-sm text-gray-500 font-light leading-relaxed">
                    <strong className="text-white block mb-2 font-black uppercase text-[10px] tracking-widest">Acoustic Ink.</strong>
                    Our "Live Link" and "Sovereign Dictation" tools turn raw spoken truth into digital text in real-time. Talk freely; your legacy is being captured.
                 </p>
              </div>

              {/* Step 02 */}
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-serif italic text-[var(--accent)]">02</span>
                    <div className="h-[1px] flex-grow bg-white/10"></div>
                 </div>
                 <h4 className="text-white font-serif italic text-2xl">Cadence Integrity</h4>
                 <p className="text-sm text-gray-500 font-light leading-relaxed">
                    <strong className="text-white block mb-2 font-black uppercase text-[10px] tracking-widest">Sovereign Rhythm.</strong>
                    Standard AI tries to "fix" you. Our engine is trained to recognize regional rhythm and authentic grit as a resource, not an error.
                 </p>
              </div>

              {/* Step 03 */}
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-serif italic text-[var(--accent)]">03</span>
                    <div className="h-[1px] flex-grow bg-white/10"></div>
                 </div>
                 <h4 className="text-white font-serif italic text-2xl">Professional Mastering</h4>
                 <p className="text-sm text-gray-500 font-light leading-relaxed">
                    <strong className="text-white block mb-2 font-black uppercase text-[10px] tracking-widest">Retail Readiness.</strong>
                    The WRAP Hub handles the structural heavy lifting, leaving you with a retail-ready manuscript formatted for global audiences.
                 </p>
              </div>
           </div>

           <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                 <div className="text-center">
                    <p className="text-[var(--accent)] text-xl font-serif italic font-bold">100%</p>
                    <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest">Voice Sovereignty</p>
                 </div>
                 <div className="text-center">
                    <p className="text-white text-xl font-serif italic font-bold">ZERO</p>
                    <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest">Typing Required</p>
                 </div>
              </div>
              <Link to="/author-builder" className="text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-all underline underline-offset-8">Launch the WRAP Hub →</Link>
           </div>
        </section>

        {/* MISSION STATEMENT SECTION */}
        <section className="text-center py-12">
           <span className="text-orange-500 tracking-[0.8em] uppercase text-[10px] font-black mb-8 block animate-living-amber">The Core Objective</span>
           <div className="relative inline-block">
             <div className="absolute -inset-4 bg-[var(--accent)]/5 blur-2xl rounded-full"></div>
             <h2 className="relative text-5xl md:text-7xl font-serif font-black italic tracking-tighter leading-tight">
               "To provide unfiltered access to the <br/>
               <span className="text-[var(--accent)]">global archive</span> for those who have been silenced."
             </h2>
           </div>
        </section>

        {/* Philanthropy Section */}
        <section className="bg-[#0d0d0d] border border-[var(--accent)]/20 p-12 lg:p-20 relative overflow-hidden rounded-sm shadow-2xl">
          <div className="absolute top-0 right-0 p-10 opacity-5 text-7xl font-serif italic text-[var(--accent)] select-none">Impact</div>
          <div className="relative z-10 max-w-3xl">
            <span className="text-[var(--accent)] tracking-[0.5em] uppercase text-[10px] font-black mb-6 block">Commitment 2026</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-8 italic text-white tracking-tight">Direct <span className="text-[var(--accent)]">Nominated Support.</span></h2>
            <p className="text-gray-400 text-lg leading-relaxed font-light mb-10">
              A Captive Audience is a mission-driven engine. We believe in supporting the infrastructure that rebuilds lives outside the system.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <a href="https://www.parentsbeyondbreakup.com/" target="_blank" rel="noopener noreferrer" className="p-8 bg-black border border-white/5 hover:border-[var(--accent)]/30 transition-all group">
                <h4 className="text-white font-serif italic text-xl mb-3 group-hover:text-[var(--accent)] transition-colors">Support Partners</h4>
                <p className="text-xs text-gray-500 italic leading-relaxed">Assisting families navigating the impact of separation and court friction.</p>
              </a>
              <a href="#" className="p-8 bg-black border border-white/5 hover:border-[var(--accent)]/30 transition-all group">
                <h4 className="text-white font-serif italic text-xl mb-3 group-hover:text-[var(--accent)] transition-colors">Systemic Advocacy</h4>
                <p className="text-xs text-gray-500 italic leading-relaxed">Supporting those impacted by systemic adversity and justice-affected populations.</p>
              </a>
            </div>
          </div>
        </section>

        {/* Closing Thought */}
        <section className="text-center pb-20">
          <h3 className="text-4xl font-serif font-bold text-white mb-8 italic">The Narrative is the Reclamation.</h3>
          <p className="text-gray-400 text-lg font-light leading-relaxed max-w-3xl mx-auto mb-12 italic">
            "Your truth is a resource. We provide the tech to bypass the gatekeepers and speak directly to the world."
          </p>
          <div className="flex justify-center gap-8">
             <Link to="/author-builder" className="bg-white text-black px-12 py-5 text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-[var(--accent)] hover:text-white transition-all">Start Your Wrap Sheet</Link>
             <Link to="/narratives" className="border border-white/10 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-white/5 transition-all">Examine Archive</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Mission;

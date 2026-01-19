
import React from 'react';
import { Link } from 'react-router-dom';

const Mission: React.FC = () => {
  return (
    <div className="bg-[#050505] min-h-screen text-white">
      {/* Manifest Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center border-b border-white/5">
        <span className="text-[var(--accent)] tracking-[0.6em] uppercase text-[10px] font-bold mb-6 block animate-fade-in">The Manifesto</span>
        <h1 className="text-6xl md:text-9xl font-serif font-bold mb-12 italic leading-none tracking-tighter">
          From the <span className="text-[var(--accent)]">System</span>,<br />
          to the World.
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed italic opacity-80">
          "The brush with the law leaves a mark. We provide the light, the tech, and the stage to make those narratives unignorable."
        </p>
      </section>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-32">
        
        {/* WHAT & WHO SECTION */}
        <section className="grid md:grid-cols-2 gap-16 border-b border-white/5 pb-24">
          <div className="space-y-6">
            <h3 className="text-[var(--accent)] tracking-[0.4em] uppercase text-[10px] font-black">What is this?</h3>
            <h2 className="text-4xl font-serif font-bold italic">A Sovereign <span className="text-white/40">Workspace.</span></h2>
            <p className="text-gray-400 leading-relaxed font-light text-lg italic">
              A Captive Audience is a digital storytelling and media project built around real, first-hand prison narratives. It is a secure infrastructure designed to bridge the gap between carceral isolation and global publication.
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-white tracking-[0.4em] uppercase text-[10px] font-black">Who is it for?</h3>
            <h2 className="text-4xl font-serif font-bold italic">The <span className="text-[var(--accent)]">Impacted.</span></h2>
            <p className="text-gray-400 leading-relaxed font-light text-lg italic">
              Specifically built for incarcerated and formerly incarcerated authors, family court litigants, and anyone navigating the friction of the legal system who refuses to have their truth sanitized or silenced.
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
                    <strong className="text-white block mb-2 font-black uppercase text-[10px] tracking-widest">Talk, Don't Type.</strong>
                    Our "Live Link" and "Sovereign Dictation" tools turn raw spoken truth into digital text in real-time. We remove the friction of the keyboard, allowing the author to focus on the emotional cadence of their story.
                 </p>
              </div>

              {/* Step 02 */}
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-serif italic text-[var(--accent)]">02</span>
                    <div className="h-[1px] flex-grow bg-white/10"></div>
                 </div>
                 <h4 className="text-white font-serif italic text-2xl">Dialect Integrity</h4>
                 <p className="text-sm text-gray-500 font-light leading-relaxed">
                    <strong className="text-white block mb-2 font-black uppercase text-[10px] tracking-widest">Grit Sovereignty.</strong>
                    Standard AI tries to "fix" your English. Our Sovereign Engine is trained to recognize carceral grit and regional slang as a resource, not an error. It preserves the raw dialect of the yard.
                 </p>
              </div>

              {/* Step 03 */}
              <div className="space-y-6 relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl font-serif italic text-[var(--accent)]">03</span>
                    <div className="h-[1px] flex-grow bg-white/10"></div>
                 </div>
                 <h4 className="text-white font-serif italic text-2xl">Structural Forging</h4>
                 <p className="text-sm text-gray-500 font-light leading-relaxed">
                    <strong className="text-white block mb-2 font-black uppercase text-[10px] tracking-widest">Automated Mastering.</strong>
                    The platform handles the structural heavy lifting—grammar, formatting, and legal auditing—leaving the author with a retail-ready manuscript without needing to understand the "rules" of the system.
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
              <Link to="/author-builder" className="text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-all underline underline-offset-8">Experience the Architecture →</Link>
           </div>
        </section>

        {/* MISSION STATEMENT SECTION */}
        <section className="text-center py-12">
           <span className="text-orange-500 tracking-[0.8em] uppercase text-[10px] font-black mb-8 block animate-living-amber">The Core Objective</span>
           <div className="relative inline-block">
             <div className="absolute -inset-4 bg-[var(--accent)]/5 blur-2xl rounded-full"></div>
             <h2 className="relative text-5xl md:text-7xl font-serif font-black italic tracking-tighter leading-tight">
               "To reclaim the narrative by providing <br/>
               <span className="text-[var(--accent)]">unfiltered access</span> to the global archive."
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
              A Captive Audience is a mission-driven engine. We believe in supporting the infrastructure that rebuilds lives outside the wire. A percentage of all platform profit is explicitly nominated to the following partners:
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <a href="https://www.parentsbeyondbreakup.com/" target="_blank" rel="noopener noreferrer" className="p-8 bg-black border border-white/5 hover:border-[var(--accent)]/30 transition-all group">
                <h4 className="text-white font-serif italic text-xl mb-3 group-hover:text-[var(--accent)] transition-colors">Parents Beyond Breakup</h4>
                <p className="text-xs text-gray-500 italic leading-relaxed">Providing suicide prevention and support for families navigating the impact of separation and family court.</p>
              </a>
              <a href="https://www.abouttime.org.au/" target="_blank" rel="noopener noreferrer" className="p-8 bg-black border border-white/5 hover:border-[var(--accent)]/30 transition-all group">
                <h4 className="text-white font-serif italic text-xl mb-3 group-hover:text-[var(--accent)] transition-colors">About Time</h4>
                <p className="text-xs text-gray-500 italic leading-relaxed">Systemic advocacy and community support for the Australian carceral and justice-affected population.</p>
              </a>
            </div>
          </div>
        </section>

        {/* The Philosophy */}
        <section className="grid lg:grid-cols-2 gap-20 items-start">
           <div>
              <h2 className="text-3xl font-bold text-white mb-8 font-serif italic">Humanizing the Impacted</h2>
              <p className="text-gray-400 text-lg leading-relaxed font-light mb-6">
                A Captive Audience sits at the intersection of literature, justice, and sovereignty. We are not just a carceral project; we are a digital sanctuary for anyone navigating the friction of the legal system.
              </p>
              <p className="text-gray-500 leading-relaxed font-light">
                Whether your story is born in a cell, a family court hearing, or a fight for ownership, we believe your truth is a resource. We provide the infrastructure to bypass traditional gatekeepers.
              </p>
           </div>
           <div className="bg-[#0d0d0d] border border-[var(--accent)]/20 p-12 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-3xl"></div>
              <h3 className="text-[var(--accent)] text-[10px] font-bold uppercase tracking-widest mb-6">Sovereign Stories</h3>
              <p className="text-white text-xl font-serif italic leading-relaxed">
                "We don't just amplify voices; we reclaim sovereignty. From family law skirmishes to the hero's journey back from the brink."
              </p>
           </div>
        </section>

        {/* Closing Thought */}
        <section className="text-center pb-20">
          <h3 className="text-4xl font-serif font-bold text-white mb-8 italic">The Narrative is the Reclamation.</h3>
          <p className="text-gray-400 text-lg font-light leading-relaxed max-w-3xl mx-auto mb-12 italic">
            "Justice isn't just a verdict; it's a story. We focus on the lived reality. From the hero's struggle to the victim's truth, the narrative is how we heal the world."
          </p>
          <div className="flex justify-center gap-8">
             <Link to="/why-publish" className="bg-white text-black px-12 py-5 text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-[var(--accent)] hover:text-white transition-all">Publish Your Story</Link>
             <Link to="/narratives" className="border border-white/10 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-white/5 transition-all">Browse Archives</Link>
          </div>
        </section>
      </div>
      
      {/* Stats */}
      <section className="bg-black/40 border-t border-white/5 py-24">
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
               <div className="text-4xl font-serif font-bold text-white tracking-tighter">IMPACTED</div>
               <div className="text-[9px] uppercase tracking-[0.4em] text-[var(--accent)] font-bold">Voice Standard</div>
            </div>
            <div className="space-y-2">
               <div className="text-4xl font-serif font-bold text-white tracking-tighter">UNFILTERED</div>
               <div className="text-[9px] uppercase tracking-[0.4em] text-[var(--accent)] font-bold">Grit Integrity</div>
            </div>
            <div className="space-y-2">
               <div className="text-4xl font-serif font-bold text-white tracking-tighter">SOVEREIGN</div>
               <div className="text-[9px] uppercase tracking-[0.4em] text-[var(--accent)] font-bold">Archive Tech</div>
            </div>
            <div className="space-y-2">
               <div className="text-4xl font-serif font-bold text-white tracking-tighter">DIVERSE</div>
               <div className="text-[9px] uppercase tracking-[0.4em] text-[var(--accent)] font-bold">Legal Narratives</div>
            </div>
         </div>
      </section>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Mission;

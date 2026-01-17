
import React from 'react';

const Security: React.FC = () => {
  return (
    <div className="bg-[#050505] min-h-screen text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center border-b border-white/5">
        <span className="text-orange-500 tracking-[0.6em] uppercase text-[10px] font-black mb-6 block animate-living-amber">Protective Infrastructure</span>
        <h1 className="text-6xl md:text-9xl font-serif font-black mb-12 italic leading-none tracking-tighter text-white">
          Privacy <span className="text-orange-500 animate-living-amber">Shield.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed italic opacity-80">
          "Handling high-risk truths requires institutional-grade digital shielding. We protect the story so you can tell it safely."
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-24 space-y-32">
         {/* Technical Sovereignty Section */}
         <section className="bg-[#0a0a0a] border border-orange-500/20 p-12 md:p-20 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-5 text-8xl font-serif italic text-orange-500 select-none">ROADMAP</div>
            <h3 className="text-3xl font-serif italic text-white mb-10">Technical <span className="text-orange-500">Sovereignty.</span></h3>
            <div className="space-y-8">
               <div className="p-8 bg-black/60 border border-white/10 rounded-sm">
                  <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Current Phase: Secure Pilot</h4>
                  <p className="text-sm text-gray-400 leading-relaxed font-light">
                    The beta pilot uses <span className="text-white italic">Secure Environment Injection</span>. Your API keys are managed by the platform's edge, ensuring they are never hard-coded in the project repository.
                  </p>
               </div>
               <div className="p-8 bg-orange-500/5 border border-orange-500/20 rounded-sm">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Production: Edge Proxying</h4>
                  <p className="text-sm text-gray-400 leading-relaxed font-light italic">
                    For the "Industrial" release, we are moving to a **Server-Side Proxy**. This means the frontend never talks to the AI directly. All calls are routed through a secure, encrypted bridge, ensuring zero exposure of administrative credentials.
                  </p>
               </div>
            </div>
         </section>

         <section className="grid lg:grid-cols-2 gap-20">
            <div className="space-y-8">
               <h2 className="text-3xl font-serif italic text-white underline decoration-orange-500/30 underline-offset-8">PII Audit & Pseudonyms</h2>
               <p className="text-gray-500 leading-relaxed font-light">
                  The primary risk for any carceral narrative is defamation litigation. Our **Sovereign Protocol 4.0** forces an AI-driven PII (Personally Identifiable Information) audit. 
               </p>
               <div className="p-8 border-l-2 border-red-500 bg-red-500/5 text-xs text-red-200/80 italic leading-loose">
                  "Authors MUST change the names of all characters, staff, and facilities unless they have express legal permission. WRAP Profile tools flag real names automatically."
               </div>
            </div>
            <div className="space-y-8">
               <h2 className="text-3xl font-serif italic text-white underline decoration-orange-500/30 underline-offset-8">Scale & Residency</h2>
               <p className="text-gray-500 leading-relaxed font-light">
                  For institutional use within Australia, we utilize **Emergent Architecture**. This ensures all manuscripts and metadata remain on Australian soil, complying with state and federal privacy acts.
               </p>
               <ul className="text-[10px] font-bold uppercase tracking-[0.3em] space-y-4 text-cyan-500">
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> AU-Sydney Residency Available</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Institutional Compliance Ready</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span> Scalable to 100k+ Authors</li>
               </ul>
            </div>
         </section>

         <section className="bg-[#0a0a0a] border border-white/5 p-12 md:p-20 relative overflow-hidden">
            <h3 className="text-2xl font-serif italic text-white mb-12">Protocol 4.0 Data Sovereignty</h3>
            <div className="space-y-12 prose prose-invert max-w-none">
               <div>
                  <h4 className="text-orange-500 uppercase text-[10px] tracking-widest font-bold mb-4">01. Ephemeral Processing</h4>
                  <p className="text-gray-400 font-light">Drafts processed via WRAP Profile are held in ephemeral memory. We do not use your narratives for model training. Your intellectual property remains your resource.</p>
               </div>
               <div>
                  <h4 className="text-orange-500 uppercase text-[10px] tracking-widest font-bold mb-4">02. End-to-End Vaulting</h4>
                  <p className="text-gray-400 font-light">Archives in 'The Big House' are encrypted. This ensures that even in institutional environments, the author's work-in-progress is protected from unauthorized surveillance.</p>
               </div>
               <div>
                  <h4 className="text-orange-500 uppercase text-[10px] tracking-widest font-bold mb-4">03. Metadata Scrubbing</h4>
                  <p className="text-gray-400 font-light">All visual assets are stripped of EXIF data upon ingestion. We remove device identifiers, GPS coordinates, and timestamp signatures to protect author anonymity.</p>
               </div>
            </div>
            <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl font-serif italic select-none -rotate-12">SHIELD</div>
         </section>

         <section className="text-center pb-20">
            <h3 className="text-3xl font-serif italic mb-10">Institutional Compliance.</h3>
            <p className="text-gray-500 font-light max-w-2xl mx-auto mb-12">"A Captive Audience is the world's first digital writing tool designed for incarcerated people with institutional compliance at the core."</p>
            <div className="flex justify-center gap-8">
               <a href="mailto:security@markmiwords.com" className="bg-white text-black px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-orange-500 hover:text-white transition-all rounded-sm">Consult Security Officer</a>
            </div>
         </section>
      </div>
    </div>
  );
};

export default Security;

import React from 'react';

const Security: React.FC = () => {
  return (
    <div className="bg-[#050505] min-h-screen text-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center border-b border-white/5">
        <span className="text-orange-500 tracking-[0.6em] uppercase text-[10px] font-bold mb-6 block animate-living-amber">Protective Infrastructure</span>
        <h1 className="text-6xl md:text-9xl font-serif font-bold mb-12 italic leading-none tracking-tighter text-white">
          Privacy <span className="text-orange-500 animate-living-amber">Shield.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed italic opacity-80">
          "Handling high-risk truths requires high-level digital shielding. We protect the story so you can tell it safely."
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-24 space-y-32">
         <section className="grid lg:grid-cols-2 gap-20">
            <div className="space-y-8">
               <h2 className="text-3xl font-serif italic text-white underline decoration-orange-500/30 underline-offset-8">PII Audit & Pseudonyms</h2>
               <p className="text-gray-500 leading-relaxed font-light">
                  The primary risk for any carceral narrative is defamation litigation. Our **Sovereign Protocol 4.0** forces an AI-driven PII (Personally Identifiable Information) audit. 
               </p>
               <div className="p-8 border-l-2 border-red-500 bg-red-500/5 text-xs text-red-200/80 italic leading-loose">
                  "Authors MUST change the names of all characters, staff, and facilities unless they have express legal permission. WRAPPER provides tools to flag real names automatically, but the final legal responsibility rests with the author."
               </div>
            </div>
            <div className="space-y-8">
               <h2 className="text-3xl font-serif italic text-white underline decoration-orange-500/30 underline-offset-8">Metadata Stripping</h2>
               <p className="text-gray-500 leading-relaxed font-light">
                  When you upload images, scans, or book covers, our backend processes strip all EXIF metadata. This prevents geolocation tracking or identification of the digital device used to create the archive.
               </p>
               <ul className="text-[10px] font-bold uppercase tracking-[0.3em] space-y-4 text-orange-500">
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Automatic Location Erasure</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Device Signature Masking</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Anonymized Submission Paths</li>
               </ul>
            </div>
         </section>

         <section className="bg-[#0a0a0a] border border-white/5 p-12 md:p-20 relative overflow-hidden">
            <h3 className="text-2xl font-serif italic text-white mb-12">Protocol 4.0 Data Sovereignty</h3>
            <div className="space-y-12 prose prose-invert max-w-none">
               <div>
                  <h4 className="text-orange-500 uppercase text-[10px] tracking-widest font-bold mb-4">01. Ephemeral Processing</h4>
                  <p className="text-gray-400 font-light">Drafts processed via WRAPPER's 'Drop the Soap' engine are held in ephemeral memory. We do not use your narratives for model training purposes. Your intellectual property remains yours.</p>
               </div>
               <div>
                  <h4 className="text-orange-500 uppercase text-[10px] tracking-widest font-bold mb-4">02. Local-First Archiving</h4>
                  <p className="text-gray-400 font-light">By using our 'Mastering Suite' export, you create standalone files that live on your own hardware. We only store enough metadata to link your project to your Substack Bridge if enabled.</p>
               </div>
               <div>
                  <h4 className="text-orange-500 uppercase text-[10px] tracking-widest font-bold mb-4">03. Content Sanctuary</h4>
                  <p className="text-gray-400 font-light">We do not sanitize raw language, prison slang, or graphic descriptions of systemic failure. Our 'Privacy Shield' is a protection against external tracking, not an internal censor.</p>
               </div>
            </div>
            <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl font-serif italic select-none -rotate-12">SHIELD</div>
         </section>

         <section className="border-t border-white/5 pt-24 space-y-12">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-serif italic text-white mb-4">Succession & Trustee Protocols</h2>
               <p className="text-gray-500 font-light italic">Maintaining the bridge when the architect is unavailable.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               <div className="p-8 border border-white/5 bg-white/[0.02] rounded-sm">
                  <h5 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Author Key Recovery</h5>
                  <p className="text-xs text-gray-500 leading-relaxed italic">Your Sovereign Pass provides a unique recovery key. Store this in a physical location. It is the only way to recover your vault without a trustee.</p>
               </div>
               <div className="p-8 border border-white/5 bg-white/[0.02] rounded-sm">
                  <h5 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">Vault Trust</h5>
                  <p className="text-xs text-gray-500 leading-relaxed italic">You can designate a 'Trustee' within your settings. They will receive access to your archive only after a 30-day inactivity trigger.</p>
               </div>
               <div className="p-8 border border-white/5 bg-white/[0.02] rounded-sm">
                  <h5 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4">DNS Masking</h5>
                  <p className="text-xs text-gray-500 leading-relaxed italic">All publishing through the Substack Bridge uses DNS masking to prevent identification of the author's physical location or ISP.</p>
               </div>
            </div>
         </section>

         <section className="text-center pb-20">
            <h3 className="text-3xl font-serif italic mb-10">Responsible Storytelling.</h3>
            <p className="text-gray-500 font-light max-w-2xl mx-auto mb-12">"Truth is a weapon. Use it wisely. Use it safely. Our shield is your permit to speak."</p>
            <div className="flex justify-center gap-8">
               <a href="mailto:security@markmiwords.com" className="bg-white text-black px-12 py-5 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-orange-500 hover:text-white transition-all rounded-sm">Contact Security Officer</a>
            </div>
         </section>
      </div>
    </div>
  );
};

export default Security;
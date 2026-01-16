import React from 'react';
import { Link } from 'react-router-dom';

const SubstackBridge: React.FC = () => {
  return (
    <div className="bg-[#050505] min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden px-6 border-b border-white/5">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/20 via-transparent to-black"></div>
          <img 
            src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale" 
            alt="Old Books and Tech" 
          />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl">
          <span className="text-orange-500 tracking-[0.8em] uppercase text-[10px] font-bold mb-6 block animate-living-amber">The Infrastructure</span>
          <h1 className="text-6xl md:text-9xl font-serif font-bold mb-8 italic tracking-tighter">The Substack <span className="text-orange-500 animate-living-amber">Bridge.</span></h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed italic">
            "Your pen. Our pixels. Their inbox. Zero friction."
          </p>
        </div>
      </section>

      {/* Origin Integration Section */}
      <section className="py-32 px-6 lg:px-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="relative group overflow-hidden rounded-sm border border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200&auto=format&fit=crop" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-60" 
              alt="Handwriting"
            />
            <div className="absolute inset-0 bg-black/40 p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-serif italic text-white mb-6">Born from Necessity.</h3>
              <p className="text-gray-300 text-base font-light italic leading-relaxed">
                "When I was typing my handwritten notes for Substack, I realized the grind was a barrier to truth. The Bridge was designed to automate the transition from paper to global audience."
              </p>
              <p className="mt-8 text-orange-500 text-[10px] font-bold uppercase tracking-widest italic">— The Architect</p>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl font-serif font-bold italic">The Evolution <br/><span className="text-orange-500 animate-living-amber">of the Sheet.</span></h2>
            <p className="text-gray-400 text-lg leading-relaxed font-light italic">
              A Captive Audience started as a Substack channel. It evolved into an industrial pipeline that treats your narratives with the respect they deserve. 
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              We help you split your story into manageable digital installments. By the time you've finished your Substack run, the 'Mastering Suite' has already formatted your book for retail distribution.
            </p>
            <div className="pt-6">
              <Link to="/origin-story" className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] hover:underline">Read the Full Origin Story →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Sovereignty Section */}
      <section className="py-32 px-6 lg:px-24 bg-[#0d0d0d] border-y border-white/5">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
               <span className="text-orange-500 tracking-[0.4em] uppercase text-[10px] font-bold animate-living-amber">Author-First Revenue</span>
               <h2 className="text-4xl font-serif font-bold italic text-white">Financial <br/><span className="text-orange-500 animate-living-amber">Sovereignty.</span></h2>
               <p className="text-gray-400 text-lg leading-relaxed font-light italic">
                  Traditional publishers take 85-90% of your earnings. Substack takes 10%. We take nothing from your sales. 
               </p>
               <p className="text-gray-500 text-sm leading-relaxed">
                  The ACA Sovereign Pass is a flat $10 monthly utility fee. This covers the token overhead for Gemini 3, high-volume OCR scanning, and the 'Privacy Shield' technical infrastructure.
               </p>
               <div className="flex gap-4">
                  <div className="px-6 py-4 bg-white/5 border border-white/10 text-center flex-grow rounded-sm">
                     <p className="text-orange-500 text-lg font-serif">100%</p>
                     <p className="text-[8px] font-bold uppercase tracking-widest text-gray-600">Author Direct Pay</p>
                  </div>
                  <div className="px-6 py-4 bg-white/5 border border-white/10 text-center flex-grow rounded-sm">
                     <p className="text-orange-500 text-lg font-serif">Pro 3.0</p>
                     <p className="text-[8px] font-bold uppercase tracking-widest text-gray-600">AI Intelligence</p>
                  </div>
               </div>
            </div>
            <div className="p-12 border border-white/5 bg-black/40 italic text-gray-400 leading-loose text-sm font-light relative rounded-sm">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
               </div>
               "We decided to strip away the 'Pro' markup. At $10, we cover the tech so you can build the legacy. You keep the subscriber revenue; we keep the bridge standing and the 'Privacy Shield' active."
            </div>
         </div>
      </section>

      {/* Comparison Registry */}
      <section className="py-32 px-6 lg:px-24 max-w-7xl mx-auto">
        <h2 className="text-center text-4xl font-serif font-bold italic mb-20">Comparison <span className="text-orange-500 animate-living-amber">Registry.</span></h2>
        
        <div className="overflow-x-auto rounded-sm border border-white/5 bg-[#080808]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th className="p-8 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/5">Capability</th>
                <th className="p-8 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-white/5">Generic AI ($30+)</th>
                <th className="p-8 text-left text-[10px] font-bold uppercase tracking-widest text-orange-500 border-b border-white/5">Sovereign Pass ($10)</th>
              </tr>
            </thead>
            <tbody className="text-sm font-light">
              <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                <td className="p-8 font-serif italic text-white">Dialect Engine</td>
                <td className="p-8 text-gray-500">Fixed/Formal English.</td>
                <td className="p-8 text-gray-300">Multi-Regional Prison Slang Support.</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                <td className="p-8 font-serif italic text-white">Industrial OCR</td>
                <td className="p-8 text-gray-500">Fragmented/Error-Prone.</td>
                <td className="p-8 text-gray-300">Optimized for Paper & Low-Light Scans.</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                <td className="p-8 font-serif italic text-white">Privacy Shield</td>
                <td className="p-8 text-gray-500">None (Uses data for training).</td>
                <td className="p-8 text-orange-500 font-bold">PII Audit & EXIF Scrubbing.</td>
              </tr>
              <tr className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                <td className="p-8 font-serif italic text-white">Mastering Suite</td>
                <td className="p-8 text-gray-500">Manual Markdown only.</td>
                <td className="p-8 text-gray-300">Direct DOCX/Substack Final Mastering.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center bg-orange-500 animate-living-amber-bg">
        <h3 className="text-4xl md:text-5xl font-serif font-bold italic text-white mb-8">Ready to cross?</h3>
        <div className="flex justify-center gap-8">
          <Link to="/author-builder" className="bg-black text-white px-12 py-5 text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all shadow-2xl rounded-sm">Launch Engine</Link>
        </div>
      </section>
    </div>
  );
};

export default SubstackBridge;
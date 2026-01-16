import React, { useState } from 'react';
import { Artwork } from '../types';

const MOCK_ART: Artwork[] = [
  { id: '1', title: 'The Quiet Hours', artist: 'Luca R.', imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop', tags: ['Abstract', 'Ink'] },
  { id: '2', title: 'Inner Skyline', artist: 'M. Chen', imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop', tags: ['Modern', 'Oil'] },
  { id: '3', title: 'Barred Resilience', artist: 'Anonymous', imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800&auto=format&fit=crop', tags: ['Portrait', 'Sketch'] },
  { id: '4', title: 'Fragmented Freedom', artist: 'E. Smith', imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop', tags: ['Surrealism'] },
  { id: '5', title: 'The Long Walk', artist: 'W. Jackson', imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=800&auto=format&fit=crop', tags: ['Minimalist'] },
  { id: '6', title: 'Echo of Home', artist: 'Sarah G.', imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=800&auto=format&fit=crop', tags: ['Expressionism'] },
];

const ArtGallery: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const filteredArt = MOCK_ART.filter(art => 
    art.title.toLowerCase().includes(filter.toLowerCase()) || 
    art.artist.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="bg-[#050505] min-h-screen text-white pt-20">
      <header className="max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center border-b border-white/5">
        <span className="text-orange-500 tracking-[0.6em] uppercase text-[10px] font-bold mb-6 block animate-living-amber">Visual Narratives</span>
        <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 italic leading-none">The Community <span className="text-orange-500 animate-living-amber">Wall.</span></h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed italic opacity-80">
          "A collaborative space where visual artists provide the skin for the stories written from within. Reclaim the visual narrative."
        </p>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {['All', 'Abstract', 'Sketch', 'Modern', 'Minimalist'].map(tag => (
              <button 
                key={tag} 
                onClick={() => setFilter(tag === 'All' ? '' : tag)}
                className={`px-8 py-3 text-[9px] font-bold uppercase tracking-widest border transition-all rounded-full ${filter === tag ? 'bg-orange-500 border-orange-500 text-white' : 'border-white/10 text-gray-500 hover:text-white'}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="SEARCH ARTISTS..." 
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-b border-white/10 px-4 py-2 text-[10px] font-bold tracking-widest focus:border-orange-500 outline-none flex-grow md:w-64 placeholder:text-gray-800 transition-all"
            />
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="bg-orange-500 text-white px-8 py-3 text-[9px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/10 rounded-sm"
            >
              Add Your Art
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredArt.map((art) => (
            <div key={art.id} className="group relative bg-[#0d0d0d] border border-white/5 overflow-hidden transition-all duration-700 hover:border-orange-500/40 shadow-xl flex flex-col rounded-sm">
              <div className="aspect-square overflow-hidden relative">
                <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{art.artist}</p>
                    <h3 className="text-xl font-serif italic text-white">{art.title}</h3>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-orange-500 transition-colors">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div onClick={() => setShowSubmitModal(true)} className="border border-white/5 border-dashed aspect-square flex flex-col items-center justify-center text-center bg-white/[0.02] p-12 group cursor-pointer hover:border-orange-500/20 transition-all rounded-sm">
             <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-orange-500 text-2xl font-serif italic">+</span>
             </div>
             <h4 className="text-white font-serif italic text-xl mb-4">Artist Submission</h4>
             <p className="text-xs text-gray-600 uppercase tracking-widest leading-loose">
               Log your latest visual work into the community wall.
             </p>
          </div>
        </div>
      </section>

      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-2xl w-full bg-[#0d0d0d] border border-white/10 p-12 text-center shadow-2xl relative rounded-sm">
            <button onClick={() => setShowSubmitModal(false)} className="absolute top-8 right-8 text-gray-700 hover:text-white text-2xl">×</button>
            <h2 className="text-4xl font-serif italic text-white mb-6">Gallery <span className="text-orange-500">Submission.</span></h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-10 italic">"Art is the evidence of life where life is denied. Register your work below."</p>
            
            <div className="space-y-8 text-left">
               <div className="space-y-2">
                 <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Artist Name / Alias</label>
                 <input className="w-full bg-black border border-white/10 p-4 text-sm font-serif focus:border-orange-500 outline-none text-white transition-all" placeholder="Anonymous Author" />
               </div>
               <div className="space-y-2">
                 <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Piece Title</label>
                 <input className="w-full bg-black border border-white/10 p-4 text-sm font-serif focus:border-orange-500 outline-none text-white transition-all" placeholder="e.g. Skyline from the yard" />
               </div>
               <div className="border-2 border-dashed border-white/5 p-12 text-center bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Drop Visual Asset (PNG/JPG)</span>
               </div>
               <button className="w-full bg-orange-500 text-white py-5 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-orange-600 transition-all rounded-sm">Upload to Community Wall</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ArtGallery;
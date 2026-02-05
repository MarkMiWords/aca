
import React from 'react';
import { Link } from 'react-router-dom';
import { BOOKS, getFeaturedBook } from '../data/books';

const Storefront: React.FC = () => {
  const featuredBook = getFeaturedBook();

  return (
    <div className="bg-[#020202] min-h-screen text-white overflow-hidden pb-32">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#020202] z-10"></div>
        <img
          src={featuredBook.coverUrl}
          className="w-full h-full object-cover opacity-20 grayscale scale-110 animate-subtle-drift blur-md"
          alt="Atmospheric Background"
        />
      </div>

      {/* Main Hero Showcase */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 pt-12 md:pt-32">
        <div className="flex flex-col lg:flex-row items-center gap-20 lg:gap-32">

          {/* Book Presentation */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center perspective-1000">
            <div className="relative group animate-float">
              {/* Pulsating Aura */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 via-purple-500 to-cyan-500 rounded-lg blur-3xl opacity-40 group-hover:opacity-100 transition-opacity duration-1000 animate-pulsate-aura"></div>

              {/* Book Shadow */}
              <div className="absolute inset-2 bg-black blur-xl opacity-80 translate-x-8 translate-y-8"></div>

              {/* The Book */}
              <div className="relative z-10 w-[320px] md:w-[420px] aspect-[16/27] bg-[#0a0a0a] border-l-[12px] border-black shadow-2xl rounded-r-sm overflow-hidden transform transition-all duration-700 group-hover:scale-[1.02]">
                <img
                  src={featuredBook.coverUrl}
                  className="w-full h-full object-contain block"
                  alt={`${featuredBook.title} Cover`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent"></div>
              </div>

              <div className="absolute -inset-[2px] rounded-r-sm border border-white/10 z-20 pointer-events-none"></div>
            </div>
          </div>

          {/* Promotional Copy */}
          <div className="w-full lg:w-1/2 space-y-12">
            <div className="space-y-6">
              <span className="text-[var(--accent)] tracking-[0.8em] uppercase text-[11px] font-black block animate-pulse">Now Available</span>
              <h1 className="text-6xl md:text-8xl font-serif font-black italic tracking-tighter leading-none text-white">
                The IVO <br/>
                <span className="text-[var(--accent)] animate-living-accent">Trap.</span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-400 font-light italic leading-relaxed border-l-2 pl-8 border-[var(--accent)]/30">
                {featuredBook.subtitle}
              </p>
            </div>

            <div className="space-y-8 text-gray-500 font-light italic leading-loose text-lg max-h-[300px] overflow-y-auto no-scrollbar">
              <p className="whitespace-pre-wrap">{featuredBook.description.split('\n\n').slice(0, 3).join('\n\n')}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 pt-8">
              <a
                href={featuredBook.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow bg-[#0096d6] text-white px-12 py-8 font-black tracking-[0.6em] uppercase text-[11px] text-center shadow-2xl hover:brightness-110 transition-all rounded-sm"
              >
                Acquire Physical Edition
              </a>
              <Link
                to={`/book/${featuredBook.slug}`}
                className="px-12 py-8 border border-white/10 text-white font-black tracking-[0.6em] uppercase text-[11px] text-center hover:bg-white hover:text-black transition-all rounded-sm"
              >
                Read More
              </Link>
            </div>

            <div className="pt-12 border-t border-white/5 flex items-center gap-8">
              <div className="text-center">
                <p className="text-white text-xl font-serif italic">{featuredBook.releaseYear}</p>
                <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest">Release Year</p>
              </div>
              <div className="h-8 w-[1px] bg-white/5"></div>
              <div className="text-center">
                <p className="text-[var(--accent)] text-xl font-serif italic">{featuredBook.author.toUpperCase()}</p>
                <p className="text-[8px] text-gray-700 font-black uppercase tracking-widest">The Author</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More Books Section */}
      {BOOKS.length > 1 && (
        <div className="relative z-20 max-w-7xl mx-auto px-6 mt-48">
          <div className="flex items-end justify-between border-b border-white/5 pb-12 mb-16">
            <div>
              <span className="text-[var(--accent)] tracking-[0.5em] uppercase text-[9px] font-black block mb-4">The Collection</span>
              <h2 className="text-4xl md:text-5xl font-serif italic font-black text-white">More <span className="text-gray-600">Books.</span></h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {BOOKS.slice(1).map((book) => (
              <Link key={book.id} to={`/book/${book.slug}`} className="group space-y-4">
                <div className="aspect-[16/27] bg-[#0a0a0a] border-l-4 border-black group-hover:border-[var(--accent)] transition-all overflow-hidden rounded-r-sm relative shadow-xl">
                  <img src={book.coverUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt={book.title} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white truncate">{book.title}</h3>
                  <p className="text-[8px] text-gray-600 uppercase font-black">{book.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes drift {
          0% { transform: scale(1.1) translate(0, 0); }
          50% { transform: scale(1.15) translate(-1%, -1%); }
          100% { transform: scale(1.1) translate(0, 0); }
        }
        .animate-subtle-drift { animation: drift 20s infinite ease-in-out; }

        @keyframes pulsate-aura {
          0%, 100% { transform: scale(1); opacity: 0.3; filter: blur(30px) hue-rotate(0deg); }
          50% { transform: scale(1.1); opacity: 0.6; filter: blur(50px) hue-rotate(180deg); }
        }
        .animate-pulsate-aura { animation: pulsate-aura 8s infinite ease-in-out; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 6s infinite ease-in-out; }

        .perspective-1000 { perspective: 1000px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Storefront;


import React from 'react';
import { Link } from 'react-router-dom';
import { BOOKS } from '../data/books';

const PublishedBooks: React.FC = () => {
  return (
    <div className="bg-[#050505] min-h-screen text-white pb-32">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 animate-fade-in">
          <div>
            <span className="text-[var(--accent)] tracking-[0.6em] uppercase text-[10px] font-bold mb-6 block">The Collection</span>
            <h1 className="text-6xl md:text-9xl font-serif font-black mb-12 italic leading-none tracking-tighter uppercase text-white">Books.</h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl leading-relaxed italic opacity-80">"Stories forged in the fires of lived experience."</p>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-16">
          {BOOKS.map((book) => (
            <div key={book.id} className="group flex flex-col relative animate-fade-in">
              <Link
                to={`/book/${book.slug}`}
                className="relative mb-8 block shadow-2xl border-l-[10px] border-black rounded-r-sm bg-[#0a0a0a] aspect-[16/27] overflow-hidden flex items-center justify-center p-3"
              >
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-contain grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent opacity-60"></div>
              </Link>

              <h3 className="text-3xl font-serif font-bold italic mb-1 text-white group-hover:text-[var(--accent)] transition-colors">{book.title}</h3>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">By {book.author} • {book.releaseYear}</p>

              <Link
                to={`/book/${book.slug}`}
                className="mt-8 border border-white/10 text-white text-center py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all rounded-sm"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>

        {BOOKS.length === 0 && (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-sm">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">No books published yet.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PublishedBooks;

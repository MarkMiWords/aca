
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBookBySlug } from '../data/books';

const BookDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const book = slug ? getBookBySlug(slug) : undefined;

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] p-6 text-center">
        <h2 className="text-4xl font-serif italic text-white mb-6 uppercase tracking-tighter">Book Not Found</h2>
        <p className="text-gray-500 text-sm mb-12">The requested book could not be found.</p>
        <Link to="/storefront" className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] underline underline-offset-8">Return to Storefront</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#050505] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-32">
        <div className="flex flex-col lg:flex-row gap-24 items-start">

          {/* Book Cover */}
          <div className="lg:w-[45%] w-full lg:sticky lg:top-32">
            <div className="group relative">
              <div className="shadow-[60px_60px_120px_rgba(0,0,0,0.9)] border-l-[15px] border-black overflow-hidden rounded-r-md bg-[#0a0a0a] relative transition-all duration-700">
                <div className="relative min-h-[500px] flex items-center justify-center p-4">
                  <img
                    src={book.coverUrl}
                    className="w-full max-h-[85vh] object-contain transition-all duration-1000"
                    alt={`${book.title} Cover`}
                  />
                </div>
              </div>

              <div className="mt-12 flex flex-col gap-4">
                <a
                  href={book.buyUrl || 'https://www.ingramspark.com/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#0096d6] text-white py-6 text-[10px] font-black uppercase tracking-[0.5em] text-center shadow-xl hover:bg-cyan-600 transition-all rounded-sm flex flex-col items-center justify-center gap-1"
                >
                  <span>Acquire Physical Edition</span>
                  <span className="text-[7px] opacity-70 tracking-[0.2em]">Via IngramSpark</span>
                </a>
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:w-[55%] w-full pt-10">
            <Link to="/storefront" className="text-[var(--accent)] text-[11px] font-bold uppercase tracking-[0.6em] mb-6 block hover:underline transition-all">← Back to Storefront</Link>

            <h1 className="text-6xl md:text-8xl font-serif font-black mb-4 italic text-white tracking-tighter leading-none">{book.title}</h1>

            {book.subtitle && (
              <p className="text-2xl text-gray-400 font-light italic mb-12 border-l-2 pl-6 border-[var(--accent)]/30">{book.subtitle}</p>
            )}

            <div className="grid grid-cols-2 gap-8 mb-16 border-y border-white/5 py-10">
              <div>
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 block">Author</span>
                <p className="text-xl font-serif italic text-white">{book.author}</p>
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 block">Release Year</span>
                <p className="text-xl font-serif italic text-white">{book.releaseYear}</p>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 text-lg leading-loose italic whitespace-pre-wrap">{book.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;

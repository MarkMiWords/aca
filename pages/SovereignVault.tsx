
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { VaultStorage, VaultSheet, Book } from '../types';

const VAULT_NAME = 'aca_sovereign_registry';
const VAULT_VERSION = 4;

const SovereignVault: React.FC = () => {
  const navigate = useNavigate();
  const [activeFolder, setActiveFolder] = useState<'sheets' | 'books' | 'technical'>('sheets');
  
  const [vault, setVault] = useState<VaultStorage>(() => {
    try {
      const saved = localStorage.getItem('aca_sovereign_vault');
      if (!saved || saved === "undefined" || saved === "null") return { sheets: [], books: [], ai: [], audits: [] };
      return JSON.parse(saved);
    } catch (e) {
      return { sheets: [], books: [], ai: [], audits: [] };
    }
  });

  useEffect(() => {
    loadVaultBooks();
  }, []);

  const loadVaultBooks = () => {
    try {
      const openVaultRequest = indexedDB.open(VAULT_NAME, VAULT_VERSION);
      openVaultRequest.onsuccess = () => {
        const db = openVaultRequest.result;
        if (db.objectStoreNames.contains('books')) {
          const tx = db.transaction('books', 'readonly');
          const store = tx.objectStore('books');
          const request = store.getAll();
          request.onsuccess = () => {
            setVault(prev => ({ ...prev, books: request.result }));
          };
        }
      };
    } catch (e) {}
  };

  const restoreSheet = (sheet: VaultSheet) => {
    try {
      let currentSheets = [];
      const saved = localStorage.getItem('aca:v5:wrap_sheets_v4');
      if (saved) currentSheets = JSON.parse(saved);
      const updatedRegistry = [{ ...sheet.data, id: `restored-${Date.now()}` }, ...currentSheets];
      localStorage.setItem('aca:v5:wrap_sheets_v4', JSON.stringify(updatedRegistry));
      alert("Restored to Studio.");
      navigate('/author-builder');
    } catch (e) {
      alert("Error: Data corrupted.");
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-32 pt-24 font-sans relative">
      <section className="max-w-7xl mx-auto px-6 py-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-end">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
             <span className="text-orange-500 tracking-[0.5em] uppercase text-[10px] font-black">Sovereign Vault</span>
          </div>
          <h1 className="text-7xl font-serif font-black italic text-white tracking-tighter uppercase">THE BIG <span className="text-orange-500">HOUSE.</span></h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 space-y-2 shrink-0">
          <button onClick={() => setActiveFolder('sheets')} className={`w-full text-left p-6 transition-all border-l-2 ${activeFolder === 'sheets' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-black border-white/5 border-l-transparent text-gray-700'}`}>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">The Sheets</span>
          </button>
          <button onClick={() => setActiveFolder('books')} className={`w-full text-left p-6 transition-all border-l-2 ${activeFolder === 'books' ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-black border-white/5 border-l-transparent text-gray-700'}`}>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">The Bookshelf</span>
          </button>
          <button onClick={() => setActiveFolder('technical')} className={`w-full text-left p-6 transition-all border-l-2 ${activeFolder === 'technical' ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-black border-white/5 border-l-transparent text-gray-700'}`}>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Technical Brief</span>
          </button>
        </aside>

        <main className="flex-grow">
          {activeFolder === 'sheets' && (
            <div className="grid gap-4">
              {vault.sheets.length === 0 && <div className="p-20 text-center border border-dashed border-white/5 italic text-gray-800 font-serif">Registry Empty.</div>}
              {vault.sheets.map((s) => (
                <div key={s.id} className="p-8 bg-[#0d0d0d] border border-white/5 flex items-center justify-between group rounded-sm">
                  <h3 className="text-2xl font-serif italic text-white tracking-tighter">{s.data.title || "Untitled Fragment"}</h3>
                  <button onClick={() => restoreSheet(s)} className="px-6 py-3 border border-orange-500 text-orange-500 text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">Restore</button>
                </div>
              ))}
            </div>
          )}

          {activeFolder === 'books' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(vault.books || []).length === 0 && <div className="col-span-full p-20 text-center border border-dashed border-white/5 italic text-gray-800 font-serif">No registered masters.</div>}
              {(vault.books || []).map((book) => (
                <div key={book.id} className="bg-[#0d0d0d] border border-white/5 p-6 rounded-sm">
                  <img src={book.coverUrl} className="w-full h-auto mb-4 grayscale" alt={book.title} />
                  <h3 className="text-xl font-serif italic text-white">{book.title}</h3>
                </div>
              ))}
            </div>
          )}

          {activeFolder === 'technical' && (
            <div className="space-y-8 animate-fade-in">
               <div className="bg-[#0a0a0a] border border-blue-500/20 p-10 rounded-sm shadow-2xl">
                  <h3 className="text-2xl font-serif italic text-white mb-4">Professional Email Migration Guide</h3>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 p-6 mb-8 rounded-sm">
                     <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-2">Decision: Move to Google Workspace</p>
                     <p className="text-gray-400 text-xs italic">To solve the 5.7.1 Hotmail bounce and build professional sovereignty, purchasing a dedicated mailbox is the industrial standard.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-12">
                     <div className="p-6 bg-black border border-white/5 rounded-sm">
                        <h4 className="text-white font-serif italic text-lg mb-2">A Captive Audience</h4>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Main Project Identity</p>
                        <ul className="text-xs text-gray-400 space-y-2">
                           <li>• <span className="text-white">mark@acaptiveaudience.net</span> (Owner)</li>
                           <li>• <span className="text-white">info@acaptiveaudience.net</span> (Public)</li>
                        </ul>
                     </div>
                     <div className="p-6 bg-black border border-white/5 rounded-sm">
                        <h4 className="text-white font-serif italic text-lg mb-2">Virty Online</h4>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Companion Brand</p>
                        <ul className="text-xs text-gray-400 space-y-2">
                           <li>• <span className="text-white">flirty@virty.online</span> (Persona)</li>
                        </ul>
                     </div>
                  </div>
                  
                  <div className="space-y-6 text-[11px] font-mono leading-relaxed text-gray-400">
                     <h4 className="text-white font-serif italic text-lg">Post-Purchase Activation Checklist</h4>
                     
                     <div className="p-4 bg-black border border-white/5 rounded-sm">
                        <p className="text-blue-500 font-black mb-1 tracking-widest uppercase">1. MX RECORDS (Routing)</p>
                        <p className="text-gray-500 italic mb-2">Once you buy Google Workspace, you MUST point your DNS to them. Delete current MX records and add:</p>
                        <p className="select-all text-white">ASPMX.L.GOOGLE.COM (Priority 1)</p>
                     </div>

                     <div className="p-4 bg-black border border-white/5 rounded-sm">
                        <p className="text-blue-500 font-black mb-1 tracking-widest uppercase">2. SPF (Authority)</p>
                        <p className="text-gray-500 italic mb-2">Update your TXT record to include Google's authority. This tells Hotmail that Google is sending on your behalf.</p>
                        <p className="select-all text-white">v=spf1 include:_spf.google.com ~all</p>
                     </div>

                     <div className="p-4 bg-black border border-white/5 rounded-sm">
                        <p className="text-blue-500 font-black mb-1 tracking-widest uppercase">3. DKIM (Signature)</p>
                        <p className="text-gray-500 italic mb-2">Go to Google Admin -> Apps -> Gmail -> Authenticate. Generate a 2048-bit key. Paste it as a TXT record named "google._domainkey".</p>
                     </div>
                  </div>

                  <div className="mt-10 pt-10 border-t border-white/5">
                     <h4 className="text-white font-serif italic text-lg mb-4 text-center">Why Workspace?</h4>
                     <p className="text-gray-500 text-xs italic leading-relaxed text-center max-w-lg mx-auto">
                        "Web hosts like Namecheap or GoDaddy often share IP addresses with bad actors. Google Workspace puts you on a premium, trusted IP range. This makes your narrative 'too big to block' for Microsoft's filters."
                     </p>
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SovereignVault;

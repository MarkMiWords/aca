
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { VaultStorage, VaultSheet, Book } from '../types';
import { readJson, writeJson, k } from '../utils/safeStorage';
import { checkSystemHeartbeat } from '../services/geminiService';

const VAULT_NAME = 'aca_sovereign_registry';
const VAULT_VERSION = 4;

const SovereignVault: React.FC = () => {
  const navigate = useNavigate();
  const [activeFolder, setActiveFolder] = useState<'sheets' | 'books' | 'technical' | 'heartbeat'>('sheets');
  const [heartbeat, setHeartbeat] = useState<{ status: 'loading' | 'online' | 'offline' | 'error', message: string }>({ status: 'loading', message: 'Checking Status...' });
  
  const [vault, setVault] = useState<VaultStorage>(() => {
    return readJson<VaultStorage>('sovereign_vault', { sheets: [], books: [], ai: [], audits: [] });
  });

  useEffect(() => {
    loadVaultBooks();
    refreshHeartbeat();
  }, []);

  const refreshHeartbeat = async () => {
    setHeartbeat({ status: 'loading', message: 'Checking Status...' });
    const result = await checkSystemHeartbeat();
    setHeartbeat(result);
  };

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
      const currentSheets = readJson<any[]>('wrap_sheets_v4', []);
      const updatedRegistry = [{ ...sheet.data, id: `restored-${Date.now()}` }, ...currentSheets];
      writeJson('wrap_sheets_v4', updatedRegistry);
      alert("Restored to Studio.");
      navigate('/author-builder');
    } catch (e) {
      alert("Error: Data corrupted.");
    }
  };

  const handleExportForChatty = () => {
    try {
      // Find all keys starting with our internal namespace
      const NS_PREFIX = "aca:v5:";
      const exportData: Record<string, any> = {
        _export_timestamp: new Date().toISOString(),
        _info: "Full ACA Storage Export",
        local_storage_dump: {}
      };

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(NS_PREFIX)) {
          const raw = localStorage.getItem(key);
          try {
            exportData.local_storage_dump[key] = raw ? JSON.parse(raw) : null;
          } catch (e) {
            exportData.local_storage_dump[key] = "PARSING_ERROR";
          }
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ACA-Handover-FULL-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("Handover File Generated. Check your downloads.");
    } catch (err) {
      alert("Export failed.");
      console.error(err);
    }
  };

  return (
    <div className="bg-[#050505] min-h-screen text-white pb-32 pt-24 font-sans relative">
      <section className="max-w-7xl mx-auto px-6 py-12 border-b border-white/5 flex flex-col md:flex-row justify-between items-end">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
             <span className="text-orange-500 tracking-[0.5em] uppercase text-[10px] font-black">Archive Center</span>
          </div>
          <h1 className="text-7xl font-serif font-black italic text-white tracking-tighter uppercase">THE BIG <span className="text-orange-500">HOUSE.</span></h1>
        </div>
        <div className="pb-4 flex items-center gap-4">
           <div className={`w-3 h-3 rounded-full ${heartbeat.status === 'online' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : heartbeat.status === 'loading' ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`}></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Status: {heartbeat.status.toUpperCase()}</span>
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
          <button onClick={() => setActiveFolder('heartbeat')} className={`w-full text-left p-6 transition-all border-l-2 ${activeFolder === 'heartbeat' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-black border-white/5 border-l-transparent text-gray-700'}`}>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">System Status</span>
          </button>
          
          <div className="pt-10">
            <button 
              onClick={handleExportForChatty} 
              className="w-full text-left p-6 bg-red-600/10 border border-red-600/30 text-red-500 hover:bg-red-600 hover:text-white transition-all rounded-sm group"
            >
              <p className="text-[10px] font-black uppercase tracking-widest mb-1">Fix Setup</p>
              <p className="text-[8px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100">Export Handover for Chatty</p>
            </button>
          </div>
        </aside>

        <main className="flex-grow">
          {activeFolder === 'sheets' && (
            <div className="grid gap-4 animate-fade-in">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              {(vault.books || []).length === 0 && <div className="col-span-full p-20 text-center border border-dashed border-white/5 italic text-gray-800 font-serif">No registered masters.</div>}
              {(vault.books || []).map((book) => (
                <div key={book.id} className="bg-[#0d0d0d] border border-white/5 p-6 rounded-sm">
                  <img src={book.coverUrl} className="w-full h-auto mb-4 grayscale" alt={book.title} />
                  <h3 className="text-xl font-serif italic text-white">{book.title}</h3>
                </div>
              ))}
            </div>
          )}

          {activeFolder === 'heartbeat' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-[#0a0a0a] border border-green-500/20 p-10 rounded-sm shadow-2xl">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-serif italic text-white">Status</h3>
                    <button onClick={refreshHeartbeat} className="text-[9px] font-black uppercase tracking-widest text-green-500 border border-green-500/30 px-6 py-2 hover:bg-green-500 hover:text-white transition-all">Refresh</button>
                 </div>
                 <div className="grid gap-6">
                    <div className="p-8 bg-black border border-white/5 rounded-sm flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Link</p>
                          <p className={`text-xl font-serif italic ${heartbeat.status === 'online' ? 'text-green-500' : heartbeat.status === 'loading' ? 'text-amber-500' : 'text-red-500'}`}>
                             {heartbeat.status === 'online' ? 'Active' : heartbeat.status === 'loading' ? 'Checking...' : 'Inactive'}
                          </p>
                       </div>
                    </div>
                    <div className="p-8 bg-black border border-white/10 rounded-sm">
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Diagnostics</p>
                       <p className="text-sm font-serif italic text-gray-400 leading-relaxed">"{heartbeat.message}"</p>
                    </div>
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

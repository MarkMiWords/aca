
import React from 'react';
import { Link } from 'react-router-dom';

const Blueprints: React.FC = () => {
  const sections = [
    {
      id: "forge-interface",
      title: "The Forge: WRAP BAR Functional Registry",
      items: [
        { name: "WRITE BLOCK", desc: "Ingestion & Genesis. Functions: [Import Docs] (Industrial OCR/Parsing), [Dictation] (Live Link scribe), [Dogg Me] (Alchemical transformation of raw prose into irregular Yard verse)." },
        { name: "REVISE BLOCK", desc: "Structural Correction. Functions: [Rinse and Wipe] (L1: Typos only), [Wash] (L2: Flow & Tense), [Scrub] (L3: Deep structural tightening), [Fact Check] (Grounding Metadata via Google Search)." },
        { name: "ARTICULATE BLOCK", desc: "Acoustic Matrix Transformation. Functions: [Acoustic Identity] (Gender profile), [Sound Matrix] (Soft/Normal/Loud weighting), [Temporal Matrix] (1x to 1.5x pacing), [Regional Accent] (Dialect injection). Re-rhythms text for oral storytelling." },
        { name: "POLISH BLOCK", desc: "Final Mastering. Functions: [Polish Story/Poetry] (High-fidelity resonance), [Sanitise] (PII/Legal Safety Shield), [Polish a Turd] (L5: Complete soul-out reconstruction of weak drafts)." }
      ]
    },
    {
      id: "sovereign-spine",
      title: "The Sovereign Spine (Logic v4.5)",
      items: [
        { name: "Grit Sovereignty", desc: "Dialect and slang are treated as high-value assets, not errors. The engine is hard-coded to ignore standard grammar conventions that threaten the author's authentic regional yard-voice." },
        { name: "PII Shielding", desc: "Automated redaction of Personally Identifiable Information. Real names of COs, staff, facilities, or victims are flagged and substituted with realistic fictional pseudonyms to prevent litigation." },
        { name: "Sequential Strobe", desc: "System Logic: If a raw draft is sent to 'Articulate' without a prior 'Rinse', the engine automatically performs an L1 Rinse/Wipe first to ensure acoustic clarity without losing grit." }
      ]
    },
    {
      id: "hierarchy-of-control",
      title: "Mastering Suite: Levels of Control",
      items: [
        { 
          name: "L1: RINSE (Surface)", 
          desc: "Surface-level only. Fixes blatant typos and punctuation. Zero changes to sentence structure, slang, or cadence. Voice remains identical to the raw draft." 
        },
        { 
          name: "L2: WASH (Basic Flow)", 
          desc: "Smooths awkward transitions and ensures consistent tense. Vocabulary and regional dialect are preserved 100% while improving basic readability." 
        },
        { 
          name: "L3: SCRUB (Structural Forging)", 
          desc: "Moves paragraphs for better narrative impact. Tightens prose by removing redundant fillers. Enforces specific Style constraints while maintaining 'Yard Grit'." 
        },
        { 
          name: "L4: POLISH (Literary Mastering)", 
          desc: "High-intensity refinement. Adjusts the 'sound' for specific mediums (Substack vs. Paperback). Injects high-resonance vocabulary." 
        },
        { 
          name: "L5: ALCHEMICAL (Deep Tissue)", 
          desc: "Total reconstruction from the 'soul out'. Finds the hidden emotional core and rebuilds the structure using professional literary techniques while preserving the author's truth." 
        }
      ]
    },
    {
      id: "acoustic-logic",
      title: "Acoustic Matrix Logic",
      items: [
        { name: "Breath Pacing", desc: "Speed > 1x aggressively shortens sentence lengths for rapid delivery. Speed 1x maintains longer, reflective breath pauses for dramatic storytelling." },
        { name: "Phonetic Weighting", desc: "Sound Level 'Loud' favors hard plosives (P, B, T, K) for block resonance. 'Soft' favors sibilants (S, SH) and reflective, internal monologue tones." },
        { name: "Dialect Integrity", desc: "Regional Accent selection (AU, UK, US) injects specific local carceral idioms into the output text during the articulation phase." }
      ]
    },
    {
      id: "economic-sovereignty",
      title: "Economic & Data Sovereignty",
      items: [
        { name: "Author Primacy", desc: "0% Commission path. Authors keep 100% of subscriber revenue. The platform operates on a flat $10 utility rate to cover high-volume token overhead." },
        { name: "Immutable Vault", desc: "10GB of secure storage. Once a sheet is saved to 'The Big House', it is encrypted and isolated from the active workspace for permanent legacy preservation." }
      ]
    }
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-orange-500/30 pb-32">
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-white/5">
        <div className="flex items-center gap-4 mb-6">
           <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></div>
           <span className="text-cyan-500 tracking-[0.8em] uppercase text-[10px] font-black block">Clearance Level: ARCHITECT</span>
        </div>
        <h1 className="text-6xl md:text-9xl font-serif font-black italic text-white tracking-tighter leading-none mb-6 uppercase">SOVEREIGN <br/><span className="text-cyan-500">BLUEPRINTS.</span></h1>
        <p className="text-xl text-gray-500 font-light italic leading-relaxed max-w-2xl">"The master record of process, description, and industrial intent. Build v4.5.0 Stable."</p>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16">
           {sections.map((sec) => (
             <div key={sec.id} className="space-y-10 bg-[#0a0a0a] border border-white/5 p-12 rounded-sm shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] text-6xl font-serif italic pointer-events-none select-none uppercase">{sec.id.replace(/-/g, ' ')}</div>
                <h2 className="text-3xl font-serif italic text-white border-b border-cyan-500/20 pb-6">{sec.title}</h2>
                <div className="space-y-8">
                  {sec.items.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                       <h4 className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">{item.name}</h4>
                       <p className="text-gray-400 text-sm font-light leading-relaxed italic">"{item.desc}"</p>
                    </div>
                  ))}
                </div>
             </div>
           ))}
        </div>

        <div className="mt-20 p-12 bg-white/5 border border-white/10 rounded-sm text-center">
           <h3 className="text-xl font-serif italic text-white mb-4">Continuous Evolution Protocol</h3>
           <p className="text-gray-500 text-sm font-light max-w-2xl mx-auto">This page is the immutable context for the platform's development. Every major shift in the Sovereign Forge logic is documented here to maintain architectural integrity across all builds.</p>
           <div className="mt-10">
              <Link to="/author-builder" className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-all underline underline-offset-8">Return to Active Forging</Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Blueprints;

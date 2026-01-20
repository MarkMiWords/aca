
import React, { useState, useEffect, useRef } from 'react';

const MicHandshake: React.FC = () => {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'calibrating' | 'ready' | 'denied'>('idle');
  const [level, setLevel] = useState(0);
  const [isNoiseCancelled, setIsNoiseCancelled] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for initial auto-show
    const hasCalibrated = sessionStorage.getItem('aca_handshake_complete') === 'true';
    if (!hasCalibrated) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }

    // Listener for manual trigger from Footer
    const handleManualTrigger = () => {
      setStatus('idle');
      setLevel(0);
      setShow(true);
    };

    window.addEventListener('aca:open_mic_check', handleManualTrigger);
    return () => window.removeEventListener('aca:open_mic_check', handleManualTrigger);
  }, []);

  const stopAudio = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    animationRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
  };

  const startCalibration = async () => {
    setStatus('calibrating');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          noiseSuppression: isNoiseCancelled,
          echoCancellation: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      
      // CRITICAL: Resume for browser policy
      if (ctx.state === 'suspended') await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, (average / 128) * 100);
        setLevel(normalized);
        
        // Use a persistent threshold check
        if (normalized > 25) { 
           setStatus('ready');
        }
        animationRef.current = requestAnimationFrame(checkLevel);
      };

      checkLevel();
    } catch (err) {
      console.error("Acoustic Handshake Failed:", err);
      setStatus('denied');
    }
  };

  const closeHandshake = () => {
    stopAudio();
    sessionStorage.setItem('aca_handshake_complete', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-xl w-full bg-[#0a0a0a] border border-white/10 p-12 rounded-sm shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Close Button for Manual Exits */}
        <button 
          onClick={closeHandshake}
          className="absolute top-6 right-6 text-gray-700 hover:text-white transition-colors text-2xl leading-none z-20"
        >
          &times;
        </button>

        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-50"></div>
        
        <div className="relative z-10 space-y-10">
          <div className="text-center space-y-4">
            <span className="text-[var(--accent)] tracking-[0.8em] uppercase text-[9px] font-black block animate-pulse">Hardware Protocol 4.2</span>
            <h2 className="text-5xl font-serif font-black italic text-white tracking-tighter leading-none">Acoustic <br/><span className="text-[var(--accent)]">Handshake.</span></h2>
            <p className="text-gray-500 text-sm italic font-light leading-relaxed">
              "Calibrate your acoustic link for high-fidelity archival. Ensure your signal strength is adequate for the Sovereignty Engine."
            </p>
          </div>

          <div className="space-y-8">
            {status === 'idle' && (
              <button 
                onClick={startCalibration}
                className="w-full py-6 animate-living-amber-bg text-white text-[11px] font-black uppercase tracking-[0.5em] shadow-2xl hover:brightness-110 transition-all rounded-sm"
              >
                Initialize Calibration
              </button>
            )}

            {(status === 'calibrating' || status === 'ready') && (
              <div className="space-y-6">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-600 mb-2">
                   <span>Real-time Input Gain</span>
                   <span className={level > 25 ? 'text-green-500' : 'text-orange-500 animate-pulse'}>
                     {level > 25 ? 'SIGNAL DETECTED' : 'Speak to calibrate...'}
                   </span>
                </div>
                <div className="h-6 bg-black border border-white/5 rounded-sm overflow-hidden flex gap-[2px] p-[2px]">
                   {[...Array(40)].map((_, i) => (
                     <div 
                       key={i} 
                       className={`flex-grow transition-all duration-75 ${i < (level / 2.5) ? 'bg-[var(--accent)]' : 'bg-white/5'}`}
                       style={{ opacity: i < (level / 2.5) ? 0.4 + (i / 40) : 1 }}
                     ></div>
                   ))}
                </div>
                
                <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-sm">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Hardware Noise Suppression</p>
                      <p className="text-[9px] text-gray-500 italic">Recommended for shared or carceral environments.</p>
                   </div>
                   <button 
                     onClick={() => setIsNoiseCancelled(!isNoiseCancelled)}
                     className={`w-14 h-7 rounded-full transition-all relative ${isNoiseCancelled ? 'bg-green-500' : 'bg-gray-800'}`}
                   >
                     <div className={`absolute top-1.5 w-4 h-4 rounded-full bg-white transition-all ${isNoiseCancelled ? 'left-8' : 'left-1.5'}`}></div>
                   </button>
                </div>
              </div>
            )}

            {status === 'ready' && (
              <button 
                onClick={closeHandshake}
                className="w-full py-6 bg-green-500 text-white text-[11px] font-black uppercase tracking-[0.5em] shadow-[0_0_40px_rgba(34,197,94,0.3)] animate-fade-in rounded-sm"
              >
                Protocol Complete: Proceed
              </button>
            )}

            {status === 'denied' && (
              <div className="p-8 bg-red-500/10 border border-red-500/30 text-center rounded-sm space-y-4">
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">Hardware Link Severed</p>
                <p className="text-gray-500 text-xs italic leading-relaxed">Browser permissions were blocked or hardware is unavailable. Verify microphone access in your browser settings.</p>
                <button onClick={() => window.location.reload()} className="text-[9px] font-black text-white uppercase tracking-widest underline underline-offset-4">Reset Handshake</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MicHandshake;

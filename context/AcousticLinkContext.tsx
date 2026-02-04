
import React, { createContext, useContext, useState, useRef } from 'react';
import { connectLive } from '../services/geminiService';
import { readJson } from '../utils/safeStorage';

interface AcousticLinkContextType {
  isActive: boolean;
  isConnecting: boolean;
  isThinking: boolean;
  isOrientation: boolean;
  status: string;
  wrapTranscription: string;
  startSession: (instruction?: string) => Promise<void>;
  stopSession: () => void;
  endOrientation: () => void;
}

const AcousticLinkContext = createContext<AcousticLinkContextType | null>(null);

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const AcousticLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isOrientation, setIsOrientation] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [wrapTranscription, setWrapTranscription] = useState('');
  
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input?: AudioContext; output?: AudioContext }>({});
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);

  const startSession = async (customInstruction?: string) => {
    if (isActive || isConnecting) return;
    setIsConnecting(true);
    setStatus('Initializing Link...');

    const profile = readJson<any>('aca_author_profile', {});
    const systemInstruction = customInstruction || `
      You are Rap, the Writing Partner. 
      Author: ${profile.name || 'Architect'}. 
      Personality: ${profile.personality || 'Natural'}.
      Tone: Carceral/Industrial.
      Preserve regional dialect.
    `;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };

      const sessionPromise = connectLive({
        onopen: () => {
          setIsActive(true);
          setIsConnecting(false);
          setStatus('Link Active');
          setIsOrientation(!profile.region || !profile.motivation);

          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({
              media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
            }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
          (window as any)._aca_input_stream = stream;
        },
        onmessage: async (msg: any) => {
          if (msg.serverContent?.inputTranscription) {
            setWrapTranscription(msg.serverContent.inputTranscription.text);
          }
          
          const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData && outputCtx) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
            const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }

          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onerror: () => stopSession(),
        onclose: () => stopSession()
      }, systemInstruction);

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Link Failure:", err);
      stopSession();
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextsRef.current.input) audioContextsRef.current.input.close();
    if (audioContextsRef.current.output) audioContextsRef.current.output.close();
    if ((window as any)._aca_input_stream) {
      (window as any)._aca_input_stream.getTracks().forEach((t: any) => t.stop());
    }
    setIsActive(false);
    setIsConnecting(false);
    setStatus('Standby');
    setWrapTranscription('');
    nextStartTimeRef.current = 0;
  };

  const endOrientation = () => setIsOrientation(false);

  return (
    <AcousticLinkContext.Provider value={{ 
      isActive, isConnecting, isThinking, isOrientation, status, 
      wrapTranscription, startSession, stopSession, endOrientation 
    }}>
      {children}
    </AcousticLinkContext.Provider>
  );
};

export const useAcousticLink = () => {
  const context = useContext(AcousticLinkContext);
  if (!context) throw new Error("useAcousticLink must be used within AcousticLinkProvider");
  return context;
};


import React, { createContext, useContext, useState, useRef } from 'react';
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

export const AcousticLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isOrientation, setIsOrientation] = useState(false);
  const [status, setStatus] = useState('Standby');
  const [wrapTranscription, setWrapTranscription] = useState('');
  
  const simulationInterval = useRef<number | null>(null);

  const startSession = async (customInstruction?: string) => {
    if (isActive || isConnecting) return;
    setIsConnecting(true);
    setStatus('Initializing Demo Link...');

    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsConnecting(false);
    setIsActive(true);
    setStatus('Acoustic Simulation Active');
    
    const profile = readJson<any>('aca_author_profile', {});
    setIsOrientation(!profile.region || !profile.motivation);

    // Provide some immediate feedback for the demo
    setWrapTranscription("Demo Mode: Talk freely. In the full version, your words appear here in real-time...");
    
    // Attempt real browser-native speech recognition if available (no API key needed)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setWrapTranscription(transcript);
      };
      recognition.start();
      (window as any)._demoRecognition = recognition;
    }
  };

  const stopSession = () => {
    if ((window as any)._demoRecognition) {
      (window as any)._demoRecognition.stop();
    }
    setIsActive(false);
    setStatus('Standby');
    setWrapTranscription('');
  };

  const endOrientation = () => {
    setIsOrientation(false);
  };

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

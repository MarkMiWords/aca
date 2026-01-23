
import { smartSoap, articulateText, generateSpeech } from './geminiService';

/**
 * THE SOVEREIGN AUTHOR ENGINE (v6.1.0)
 * Designed for transplantation into the VIRTY ecosystem.
 * Logic & State Controller by Kumbi.
 */

export interface EngineSettings {
  gender: 'Male' | 'Female' | 'Neutral';
  sound: 'Soft' | 'Normal' | 'Loud';
  accent: 'AU' | 'UK' | 'US';
  speed: '1x' | '1.25x' | '1.5x';
  isClone: boolean;
}

export class AuthorEngine {
  private currentAudioSource: AudioBufferSourceNode | null = null;
  private audioContext: AudioContext | null = null;

  /**
   * THE SMART-ARTICULATE PIPELINE
   * Logic: Automated sequence that triggers 'Rinse' (Green Strobe) 
   * followed by 'Articulate' (Blue Strobe) if the draft is raw.
   */
  async executeSmartArticulate(
    content: string,
    hasBeenRinsed: boolean,
    settings: EngineSettings,
    profile: { style: string; region: string; personality: string },
    callbacks: {
      onRinseStart: () => void;
      onRinseComplete: (newContent: string) => void;
      onArticulateStart: () => void;
      onArticulateComplete: () => void;
      onAcousticStart: () => void;
      onAcousticEnd: () => void;
      onError: (err: string) => void;
    }
  ) {
    let textToProcess = content;

    // 1. CONDITIONAL RINSE PHASE
    if (!hasBeenRinsed) {
      callbacks.onRinseStart();
      try {
        const result = await smartSoap(content, 'rinse', profile.style, profile.region, profile.personality);
        textToProcess = result.text;
        callbacks.onRinseComplete(textToProcess);
      } catch (e) {
        callbacks.onError("Rinse Sequence Failure.");
        return;
      }
    }

    // 2. ARTICULATE & SYNTHESIS PHASE
    callbacks.onArticulateStart();
    try {
      const result = await articulateText(textToProcess, settings, profile.style, profile.region, profile.personality);
      
      // Voice Mapping: Priority to Clone, then Gender selection
      const voice = settings.isClone ? 'Zephyr' : (settings.gender === 'Female' ? 'Puck' : 'Kore');
      
      const audioBase64 = await generateSpeech(result.text.substring(0, 1500), voice);
      
      // 3. ACOUSTIC FORGING (Playback)
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      if (this.audioContext.state === 'suspended') await this.audioContext.resume();
      
      const buffer = await this.decodeAudioData(audioBase64, this.audioContext);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioContext.destination);
      
      this.currentAudioSource = source;
      callbacks.onAcousticStart();

      source.onended = () => {
        this.currentAudioSource = null;
        callbacks.onAcousticEnd();
      };

      source.start();
      callbacks.onArticulateComplete();

    } catch (e) {
      callbacks.onError("Acoustic Link Error.");
      callbacks.onAcousticEnd();
    }
  }

  stopAcoustic() {
    if (this.currentAudioSource) {
      try { this.currentAudioSource.stop(); } catch (e) {}
      this.currentAudioSource = null;
    }
  }

  private async decodeAudioData(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  }
}

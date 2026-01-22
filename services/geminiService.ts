
import { Message, ManuscriptReport, MasteringGoal } from "../types";
import { GoogleGenAI, Modality, Type } from "@google/genai";

/**
 * SOVEREIGN AI BRIDGE v8.3 - DIAGNOSTIC REINFORCEMENT
 */

const FETCH_TIMEOUT = 30000; // 30 second watchdog

async function fetchWithTimeout(resource: string, options: any) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') throw new Error("Link Timeout: The Sovereign Forge did not respond in time.");
    throw error;
  }
}

async function handleResponse(res: Response, defaultError: string) {
  if (!res.ok) {
    let msg = defaultError;
    try {
      const errorData = await res.json();
      msg = errorData.error || msg;
    } catch (e) {
      msg = `${res.status} ${res.statusText}`;
    }
    throw new Error(msg);
  }
  return await res.json();
}

export const checkSystemHeartbeat = async (): Promise<{ status: 'online' | 'offline' | 'error', message: string }> => {
  try {
    const res = await fetchWithTimeout('/api/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'ping' })
    });
    if (res.ok) return { status: 'online', message: "Sovereign Link Established." };
    const data = await res.json();
    return { status: 'error', message: data.error || "Engine link failed." };
  } catch (err: any) {
    return { status: 'error', message: err.message || "Connectivity failure." };
  }
};

export const articulateText = async (text: string, settings: { gender: string, tone: string, accent: string, speed: string }, style: string, region: string) => {
  const res = await fetchWithTimeout('/api/articulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, settings, style, region })
  });
  return handleResponse(res, "Acoustic Link Interrupted.");
};

export const smartSoap = async (text: string, level: string, style: string, region: string) => {
  const res = await fetchWithTimeout('/api/soap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, level, style, region })
  });
  return handleResponse(res, "Sovereign Link Interrupted during polishing.");
};

export const queryPartner = async (message: string, style: string, region: string, history: any[], activeSheetContent: string): Promise<Message> => {
  const res = await fetchWithTimeout('/api/partner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, style, region, history, activeSheetContent })
  });
  return handleResponse(res, "Partner link failed.");
};

export const queryInsight = async (message: string): Promise<Message> => {
  const res = await fetchWithTimeout('/api/insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return handleResponse(res, "Insight Link Interrupted.");
};

export const interactWithAurora = async (message: string): Promise<string> => {
  try {
    const res = await fetchWithTimeout('/api/kindred', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await handleResponse(res, "Aurora Link Interrupted.");
    return data.text || "Aurora is reflecting. Try again shortly.";
  } catch (e) {
    return "Aurora node is currently offline.";
  }
};

export const generateImage = async (prompt: string) => {
  const res = await fetchWithTimeout('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  return handleResponse(res, "Visual Forge Interrupted.");
};

export const connectLive = (callbacks: any, systemInstruction: string) => {
  // Directly use SDK for WebSocket link
  const apiKey = process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction,
      inputAudioTranscription: {},
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
      }
    }
  });
};

export const analyzeFullManuscript = async (content: string, goal: MasteringGoal): Promise<ManuscriptReport> => {
  const res = await fetchWithTimeout('/api/manuscript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, goal })
  });
  return handleResponse(res, "Mastering Audit Interrupted.");
};

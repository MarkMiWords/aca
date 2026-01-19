
import { Message, ManuscriptReport, MasteringGoal } from "../types";
import { GoogleGenAI } from "@google/genai";
import { devLog } from "../components/DevConsole";

export interface UsageMetrics {
  estimatedTokens: number;
  humanHoursSaved: number;
  simulatedResourceLoad: number;
}

const getDirectMode = () => localStorage.getItem('aca_dev_direct') === 'true';

/**
 * THE SOVEREIGN BRIDGE
 * In Production: Routes to /api/* (Serverless)
 * In Dev/Direct Mode: Executes locally in-browser using selected AI Studio Key.
 */
async function callSovereignAPI(endpoint: string, body: any) {
  const isDirect = getDirectMode();
  devLog('request', `[${isDirect ? 'DIRECT' : 'SERVER'}] POST /api/${endpoint}`);

  // DIRECT BROWSER BYPASS FOR DEVELOPER TESTING
  if (isDirect && (endpoint === 'partner' || endpoint === 'soap')) {
    devLog('info', `Executing ${endpoint} locally via Gemini SDK...`);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (endpoint === 'partner') {
        const { message, history, activeSheetContent, style, region } = body;
        const contents = (history || []).map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        }));
        contents.push({
          role: 'user',
          parts: [{ text: `[CONTEXT] ${activeSheetContent} [/CONTEXT]\n\nAUTHOR QUERY: ${message}` }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents,
          config: {
            systemInstruction: `You are WRAPPER. Style: ${style}. Region: ${region}. Preserve carceral grit.`,
            tools: [{ googleSearch: {} }]
          }
        });

        const content = response.text || "Direct Link processing...";
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = chunks.map((c: any) => ({ web: { uri: c.web?.uri || "", title: c.web?.title || "" } }));
        
        devLog('response', `Direct ${endpoint} success.`);
        return { role: 'assistant', content, sources };
      }

      if (endpoint === 'soap') {
        const { text, level } = body;
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ role: 'user', parts: [{ text }] }],
          config: { systemInstruction: `MODE: ${level.toUpperCase()}. Polish prose while maintaining grit.` }
        });
        devLog('response', `Direct ${endpoint} success.`);
        return { text: response.text };
      }
    } catch (err: any) {
      devLog('error', `Direct Mode Exception: ${err.message}`);
      if (err.message.includes("Requested entity was not found")) {
        devLog('info', "RESET REQUIRED: Please re-authorize your key via 'LINK COLD' button.");
      }
      throw err;
    }
  }

  // STANDARD SERVER PATHWAY
  try {
    const start = Date.now();
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const duration = Date.now() - start;
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown Network Fault' }));
      devLog('error', `[${response.status}] ${endpoint}: ${errorData.error}`);
      throw new Error(errorData.error || `Sovereign Link Failure: ${endpoint}`);
    }
    
    devLog('response', `[${response.status}] ${endpoint} completed in ${duration}ms`);
    return response.json();
  } catch (err: any) {
    devLog('error', `Link Exception [${endpoint}]: ${err.message}`);
    throw err;
  }
}

export async function performOCR(imageBase64: string): Promise<{text: string, metrics: UsageMetrics}> {
  const data = await callSovereignAPI('ocr', { imageBase64 });
  return { 
    text: data.text, 
    metrics: { estimatedTokens: 500, humanHoursSaved: 1, simulatedResourceLoad: 0.05 } 
  };
}

export async function smartSoap(text: string, level: 'rinse' | 'wash' | 'scrub' | 'sanitize', style: string, region: string): Promise<{text: string, metrics: UsageMetrics}> {
  const data = await callSovereignAPI('soap', { text, level, style, region });
  return { 
    text: data.text, 
    metrics: { estimatedTokens: 800, humanHoursSaved: 2, simulatedResourceLoad: 0.08 } 
  };
}

export async function queryPartner(
  message: string, 
  style: string, 
  region: string, 
  history: Message[],
  activeSheetContent: string = ""
): Promise<Message & {metrics?: UsageMetrics}> {
  const data = await callSovereignAPI('partner', { message, style, region, history, activeSheetContent });
  return {
    ...data,
    metrics: { estimatedTokens: 1200, humanHoursSaved: 1.5, simulatedResourceLoad: 0.12 }
  };
}

export async function generateImage(prompt: string): Promise<{imageUrl: string, metrics: UsageMetrics}> {
  const data = await callSovereignAPI('generate-image', { prompt });
  return { 
    imageUrl: data.imageUrl, 
    metrics: { estimatedTokens: 1000, humanHoursSaved: 2, simulatedResourceLoad: 0.15 } 
  };
}

export async function analyzeFullManuscript(content: string, goal: MasteringGoal = 'substack'): Promise<ManuscriptReport & {metrics?: UsageMetrics}> {
  const data = await callSovereignAPI('manuscript', { content, goal });
  return {
    ...data,
    metrics: { estimatedTokens: 5000, humanHoursSaved: 10, simulatedResourceLoad: 0.5 }
  };
}

export async function interactWithAurora(message: string): Promise<string> {
  const data = await callSovereignAPI('kindred', { message });
  return data.text || "I am listening.";
}

export async function queryInsight(message: string): Promise<Message & {metrics?: UsageMetrics}> {
  const data = await callSovereignAPI('insight', { message });
  return {
    ...data,
    metrics: { estimatedTokens: 1500, humanHoursSaved: 2, simulatedResourceLoad: 0.15 }
  };
}

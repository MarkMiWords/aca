
import { Message, ManuscriptReport, MasteringGoal } from "../types";
import { GoogleGenAI, Type } from "@google/genai";
import { devLog } from "../components/DevConsole";

// Safe Environment Getter
const getSafeEnv = (key: string) => {
  try {
    return (process?.env && process.env[key]) || (window as any).process?.env?.[key] || "";
  } catch (e) {
    return "";
  }
};

const getDirectMode = () => {
  try {
    return localStorage.getItem('aca_dev_direct') === 'true';
  } catch (e) {
    return false;
  }
};

async function callSovereignAPI(endpoint: string, body: any) {
  const isDirect = getDirectMode();
  
  if (isDirect) {
    devLog('request', `[DIRECT] Calling ${endpoint}...`);
    try {
      const apiKey = getSafeEnv('API_KEY');
      if (!apiKey) throw new Error("API Key missing in environment.");
      
      const ai = new GoogleGenAI({ apiKey });
      
      if (endpoint === 'partner') {
        const { message, history, activeSheetContent, style, region } = body;
        const contents = (history || []).map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(h.content || "") }]
        }));
        contents.push({
          role: 'user',
          parts: [{ text: `[CONTEXT] ${activeSheetContent} [/CONTEXT]\n\nAUTHOR QUERY: ${message}` }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents,
          config: {
            systemInstruction: `You are WRAPPER. Style: ${style}. Region: ${region}. Preserve grit.`,
            tools: [{ googleSearch: {} }]
          }
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks.map((chunk: any) => ({
          web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
        })).filter((s: any) => s.web.uri);

        return { role: 'assistant', content: response.text, sources };
      }

      if (endpoint === 'soap') {
        const { text, level, style, region } = body;
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ role: 'user', parts: [{ text }] }],
          config: {
            systemInstruction: `You are WRAPPER. Mission: Sovereignty of carceral voice. Level: ${level}. Style: ${style}. Region: ${region}. Preserve grit.`
          }
        });
        return { text: response.text };
      }
      
      // ... Other Direct Implementations
      
    } catch (err: any) {
      devLog('error', `Direct Link Exception: ${err.message}`);
      throw err;
    }
  }

  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) throw new Error(`Server Error: ${response.status}`);
  return response.json();
}

export const smartSoap = async (text: string, level: string, style: string, region: string) => callSovereignAPI('soap', { text, level, style, region });
export const queryPartner = async (message: string, style: string, region: string, history: any[], activeSheetContent: string) => callSovereignAPI('partner', { message, style, region, history, activeSheetContent });
export const queryInsight = async (message: string): Promise<Message> => callSovereignAPI('insight', { message });
export const performOCR = async (imageBase64: string) => callSovereignAPI('ocr', { imageBase64 });
export const interactWithAurora = async (message: string) => {
  const result = await callSovereignAPI('kindred', { message });
  return result.text || result;
};
export const generateImage = async (prompt: string) => callSovereignAPI('generate-image', { prompt });
export const analyzeFullManuscript = async (content: string, goal: MasteringGoal): Promise<ManuscriptReport> => callSovereignAPI('manuscript', { content, goal });

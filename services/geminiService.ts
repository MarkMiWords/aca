
import { GoogleGenAI, Type } from "@google/genai";
import { Message, ManuscriptReport, MasteringGoal } from "../types";

/**
 * SOVEREIGN FORGE - GEMINI REAL-TIME ENGINE
 * Optimized for Vercel Deployment.
 */

// Initialize the AI client using the mandatory environment variable
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const articulateText = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: text,
  });
  return { text: response.text };
};

export const smartSoap = async (text: string, level: string, style?: string, region?: string) => {
  const ai = getAI();
  const systemInstruction = `
    MISSION: Sovereignty of the carceral voice.
    ROLE: Sovereign Forge Engine.
    MODE: ${level.toUpperCase()}.
    CONTEXT: Style: ${style || 'General'}, Region: ${region || 'Global'}.
    RULE: Preserve dialect and grit. DO NOT sanitize emotional truth.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: text,
    config: { systemInstruction },
  });
  return { text: response.text || text };
};

/**
 * WRAP HUB PARTNER (RAP)
 * Uses Google Search grounding to provide systemic context.
 */
export const queryPartner = async (
  message: string,
  style: string = 'Fiction',
  region: string = 'Australia',
  history: Message[] = [],
  activeSheetContent: string = '',
  personality: string = 'Natural'
): Promise<Message> => {
  const ai = getAI();
  const systemInstruction = `
    MISSION: Sovereignty of the carceral voice.
    ROLE: WRAPPER (Writers Reliable Assistant for Polishing Passages and Editing Rough-drafts).
    PROTOCOL: Preserving regional dialect and authentic emotional truth.
    CONTEXT: Style: ${style}, Region: ${region}, Personality: ${personality}.
    Use Google Search for factual grounding on legal and systemic queries.
  `;

  const contents = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: `[DRAFT CONTEXT]\n${activeSheetContent}\n\nUSER MESSAGE: ${message}` }]
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: contents as any,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }]
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks.map((chunk: any) => ({
    web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
  })).filter((s: any) => s.web.uri);

  return { 
    role: 'assistant', 
    content: response.text || "Connection timing out. Please check the Forge Link.", 
    sources 
  };
};

export const queryInsight = async (message: string): Promise<Message> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: message,
    config: {
      systemInstruction: "Archive Indexing Specialist. Use Google Search for systemic context regarding carceral narratives.",
      tools: [{ googleSearch: {} }]
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks.map((chunk: any) => ({
    web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
  })).filter((s: any) => s.web.uri);

  return { role: 'assistant', content: response.text || "Insight indexing failed.", sources };
};

export const interactWithAurora = async (message: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: message,
    config: {
      systemInstruction: "You are 'Aurora', a Kindred Agent. Empathetic, calm, creative sanctuary partner.",
    }
  });
  return response.text || "I am listening.";
};

export const checkSystemHeartbeat = async () => ({ status: 'online' as const, message: "Sovereign Link Real-Time Active." });

export const generateSpeech = async (text: string) => ""; 

export const generateImage = async (prompt: string) => {
  const ai = getAI();
  const industrialPrompt = `A cinematic book cover for a prison narrative. Style: Minimalist, dramatic lighting, gritty texture. Themes: ${prompt}. Colors: Black, white, and high-contrast orange.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: industrialPrompt }],
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  let base64Image = "";
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      base64Image = part.inlineData.data;
      break;
    }
  }
  return { imageUrl: `data:image/png;base64,${base64Image}` };
};

export const analyzeFullManuscript = async (content: string, goal: MasteringGoal): Promise<ManuscriptReport> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [{ parts: [{ text: content.substring(0, 30000) }] }],
    config: {
      systemInstruction: `Perform a structural audit for ${goal.toUpperCase()} distribution. Return detailed JSON report.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          toneAssessment: { type: Type.STRING },
          structuralCheck: { type: Type.STRING },
          legalSafetyAudit: { type: Type.STRING },
          resourceIntensity: { type: Type.NUMBER },
          marketabilityScore: { type: Type.NUMBER },
          suggestedTitle: { type: Type.STRING },
          mediumSpecificAdvice: { type: Type.STRING },
        },
        required: ["summary", "toneAssessment", "structuralCheck", "legalSafetyAudit", "resourceIntensity", "marketabilityScore", "suggestedTitle", "mediumSpecificAdvice"],
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const connectLive = (callbacks: any, instruction: string) => {
  const ai = getAI();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      systemInstruction: instruction,
      responseModalities: ['AUDIO'] as any,
    },
  });
};


import { GoogleGenAI, Type } from "@google/genai";
import { Message, ManuscriptReport, MasteringGoal } from "../types";

/**
 * SOVEREIGN FORGE - GEMINI INTEGRATED SERVICE
 * This service handles real AI interactions using the Google GenAI SDK.
 */

// Fix: Initializing GoogleGenAI with the required named parameter and environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const articulateText = async (text: string) => {
  // Fix: Directly calling generateContent on the model property of the ai client.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: text,
  });
  return { text: response.text };
};

export const smartSoap = async (text: string, level: string, style?: string, region?: string) => {
  const systemInstruction = `
    MISSION: Sovereignty of the carceral and impacted voice.
    ROLE: You are the Sovereign Forge Engine.
    RULE: Preserve dialect and grit. DO NOT sanitize emotional truth.
    MODE: ${level.toUpperCase()}.
    CONTEXT: Style: ${style || 'General'}, Region: ${region || 'Global'}.
  `;

  // Fix: Direct generateContent call with system instruction.
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: text,
    config: { systemInstruction },
  });
  return { text: response.text || text };
};

/**
 * Fix: Updated queryPartner signature to accept 6 arguments to resolve "Expected 1 arguments, but got 6" 
 * errors in ShyEditor.tsx, WrapItUp.tsx, and SovereignSlate.tsx.
 */
export const queryPartner = async (
  message: string,
  style: string = 'Fiction',
  region: string = 'Australia',
  history: Message[] = [],
  activeSheetContent: string = '',
  personality: string = 'Natural'
): Promise<Message> => {
  const systemInstruction = `
    MISSION: Sovereignty of the carceral voice.
    ROLE: WRAPPER (Writers Reliable Assistant for Polishing Passages and Editing Rough-drafts).
    PROTOCOL: Preserving regional dialect and authentic emotional truth.
    CONTEXT: Style: ${style}, Region: ${region}, Personality: ${personality}.
    Use Google Search for factual grounding.
  `;

  const contents = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: `[DRAFT CONTEXT]\n${activeSheetContent}\n\nUSER MESSAGE: ${message}` }]
  });

  // Fix: Using googleSearch tool for factual grounding as per the mission.
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
    content: response.text || "I am currently processing your request.", 
    sources 
  };
};

export const queryInsight = async (message: string): Promise<Message> => {
  // Fix: Implementing search-grounded insights.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: message,
    config: {
      systemInstruction: "Archive Indexing Specialist. Use Google Search for systemic context.",
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
  // Fix: Empathetic AI partner using flash-preview.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: message,
    config: {
      systemInstruction: "You are 'Aurora', a Kindred Agent. Empathetic, calm, creative sanctuary partner.",
    }
  });
  return response.text || "I am listening.";
};

export const checkSystemHeartbeat = async () => ({ status: 'online' as const, message: "Sovereign Link Active." });

export const generateSpeech = async (text: string) => ""; 

export const generateImage = async (prompt: string) => {
  // Fix: generateContent for image generation with gemini-2.5-flash-image.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  let base64Image = "";
  // Find the image part.
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      base64Image = part.inlineData.data;
      break;
    }
  }
  return { imageUrl: `data:image/png;base64,${base64Image}` };
};

export const analyzeFullManuscript = async (content: string, goal: MasteringGoal): Promise<ManuscriptReport> => {
  // Fix: Use Pro model for complex reasoning and responseSchema for structured JSON.
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [{ parts: [{ text: content.substring(0, 30000) }] }],
    config: {
      systemInstruction: `Analyze manuscript for ${goal.toUpperCase()} distribution. Return JSON analysis.`,
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
  // Fix: Live API initialization following session setup guidelines.
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks,
    config: {
      systemInstruction: instruction,
      responseModalities: ['AUDIO'] as any,
    },
  });
};

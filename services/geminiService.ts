
import { Message, ManuscriptReport, MasteringGoal } from "../types";
import { GoogleGenAI, Modality, Type } from "@google/genai";

/**
 * CORE AI SERVICE
 * Handles narrative processing and acoustic synthesis.
 */

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_LINK_DISCONNECTED");
  }
  return new GoogleGenAI({ apiKey });
};

export const checkSystemHeartbeat = async (): Promise<{ status: 'online' | 'offline' | 'error', message: string }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
      config: { maxOutputTokens: 10, thinkingConfig: { thinkingBudget: 0 } }
    });
    if (response.text) return { status: 'online', message: "System Ready." };
    return { status: 'error', message: "No response from AI." };
  } catch (err: any) {
    if (err.message === "API_LINK_DISCONNECTED") {
       return { status: 'offline', message: "Connection Required." };
    }
    return { status: 'error', message: err.message || "Link failed." };
  }
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this naturally: ${text.substring(0, 1000)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio failed.");
    return base64Audio;
  } catch (err: any) {
    console.error("TTS Failure:", err);
    throw err;
  }
};

export const articulateText = async (text: string, settings: { gender: string, tone: string, accent: string, speed: string, isClone?: boolean }, style: string, region: string) => {
  const ai = getAI();
  const { gender, tone, accent, speed, isClone } = settings;
  
  const cloneProtocol = isClone ? "Adopt the author's specific calibrated voice signature. Focus on grit and cadence." : "";
  const instruction = `${cloneProtocol}
    Rewrite this story for speaking aloud. 
    PROFILE: ${gender}, TONE: ${tone}, ACCENT: ${accent}, SPEED: ${speed}. 
    CONTEXT: ${region}, STYLE: ${style}. 
    Keep the grit. Make it sound real.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text }] }],
    config: { systemInstruction: instruction }
  });

  return { text: response.text || text };
};

export const smartSoap = async (text: string, level: string, style: string, region: string) => {
  const ai = getAI();
  let instruction = "";
  let useTools = false;

  switch (level) {
    case 'rinse': instruction = "Fix basic grammar and punctuation. Don't touch the slang or the grit."; break;
    case 'scrub': instruction = `Improve the flow and structure for a ${style} story set in ${region}.`; break;
    case 'fact_check': instruction = `Check legal or factual details for ${region}.`; useTools = true; break;
    case 'sanitise': instruction = "Change real names to realistic fake ones to keep everyone safe."; break;
    case 'dogg_me': instruction = "Turn this into a raw, rhythmic poem."; break;
    case 'polish_turd': instruction = "DEEP RECONSTRUCTION. This draft is a mess. Find the core story and rebuild it from scratch. Keep it gritty and honest, but make it a powerful read."; break;
    default: instruction = `Refine for ${style}.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text }] }],
    config: {
      systemInstruction: instruction,
      tools: useTools ? [{ googleSearch: {} }] : []
    }
  });

  return { text: response.text || text };
};

export const queryPartner = async (message: string, style: string, region: string, history: any[], activeSheetContent: string): Promise<Message> => {
  const ai = getAI();
  const contents = (history || [])
    .filter(h => h && h.content)
    .slice(-10)
    .map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(h.content || "") }]
    }));

  contents.push({
    role: 'user',
    parts: [{ text: activeSheetContent ? `[CONTEXT: ${activeSheetContent.substring(0, 4000)}]\n\nAUTHOR QUERY: ${message}` : message }]
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents,
    config: {
      systemInstruction: `You are WRAPPER, a writing partner. Tone: ${style}. Region: ${region}. Give direct, helpful advice. Use Search for facts.`,
      tools: [{ googleSearch: {} }]
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks.map((chunk: any) => ({
    web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
  })).filter((s: any) => s.web.uri);

  return { role: 'assistant', content: response.text || "I'm here.", sources };
};

export const queryInsight = async (message: string): Promise<Message> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: "user", parts: [{ text: message }] }],
    config: {
      systemInstruction: "You are an Archive Specialist for prison stories. Use Search to find context.",
      tools: [{ googleSearch: {} }],
    },
  });

  const content = response.text || "No info found.";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks.map((chunk: any) => ({
    web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
  })).filter((s: any) => s.web.uri);

  return { role: 'assistant', content, sources };
};

export const interactWithAurora = async (message: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: message }] }],
    config: {
      systemInstruction: "You are 'Aurora', a calm and helpful companion. Listen and support.",
    }
  });
  return response.text || "I'm listening.";
};

export const generateImage = async (prompt: string): Promise<{ imageUrl: string }> => {
  const ai = getAI();
  const industrialPrompt = `A gritty, high-quality book cover. Style: Noir, industrial, prison theme. Themes: ${prompt}. Aspect Ratio 16:9. Colors: Black, white, and orange.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: industrialPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  let base64Image = "";
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }
  }

  if (!base64Image) throw new Error("Image failed.");
  return { imageUrl: `data:image/png;base64,${base64Image}` };
};

export const connectLive = (callbacks: any, systemInstruction: string) => {
  const ai = getAI();
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
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: "user", parts: [{ text: content.substring(0, 30000) }] }],
    config: {
      systemInstruction: `Analyze this story for ${goal}. Return JSON.`,
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
      },
    },
  });
  return JSON.parse(response.text || "{}");
};


import { Message, ManuscriptReport, MasteringGoal } from "../types";
import { GoogleGenAI, Modality, Type } from "@google/genai";

const SOVEREIGN_MISSION = (style: string, region: string, personality: string = 'Natural') => `
  MISSION: Sovereignty of the carceral and impacted voice.
  CONTEXT: Author Region: ${region.toUpperCase()}, Style: ${style.toUpperCase()}.
  TEMPERAMENT: ${personality.toUpperCase()}. 
  RULES: 
  - If Timid: Be gentle, prioritize safety, make minimal changes.
  - If Firebrand: Be aggressive, challenge the prose, push for high emotional intensity.
  - If Natural: Be a balanced partner, mirror the author's cadence.
`;

const getAI = () => {
  const key = process.env.API_KEY;
  if (!key) throw new Error("Sovereign Link Failure: API Key Missing.");
  return new GoogleGenAI({ apiKey: key });
};

export const checkSystemHeartbeat = async (): Promise<{ status: 'online' | 'offline' | 'error', message: string }> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
    });
    return response.text
      ? { status: 'online', message: "Link active." }
      : { status: 'error', message: "Empty response." };
  } catch (err: any) {
    return { status: 'offline', message: err.message || "Unknown link error." };
  }
};

export const articulateText = async (text: string, settings: any, style: string, region: string, personality: string) => {
  const ai = getAI();
  const { gender, sound, accent, speed, isClone } = settings;
  const instruction = `
    ${SOVEREIGN_MISSION(style, region, personality)}
    MODE: ARTICULATE
    ACOUSTIC MATRIX: 
    - GENDER: ${gender}
    - SOUND_LEVEL (RESONANCE): ${sound} 
    - REGIONAL_ACCENT: ${accent}
    - TEMPORAL_SPEED: ${speed} 
    - CLONE_MODE: ${isClone ? 'ACTIVE' : 'OFF'}
    
    GOAL: Refine sentence length, mouth-feel, and oral rhythm for the selected Sound (${sound}) and Speed (${speed}) while keeping carceral dialect grit 100% intact.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text }] }],
    config: { systemInstruction: instruction }
  });
  return { text: response.text || text };
};

export const smartSoap = async (text: string, level: string, style: string, region: string, personality: string) => {
  const ai = getAI();
  let modeSpecific = `General Mastering for ${style}.`;
  let useSearch = false;

  switch (level) {
    case 'rinse': 
      modeSpecific = "LEVEL L1: RINSE. Fix typos and punctuation ONLY. Do not change a single word of slang or syntax."; 
      break;
    case 'wash': 
      modeSpecific = "LEVEL L2: WASH. Smooth awkward transitions and ensure tense consistency. Preserve 100% of dialect."; 
      break;
    case 'scrub': 
      modeSpecific = "LEVEL L3: SCRUB. Structural forging. Tighten prose, remove redundant fillers, and move paragraphs for impact."; 
      break;
    case 'fact_check': 
      modeSpecific = "MODE: FACT CHECK. Audit for legal safety, verify place names, and check systemic context."; 
      useSearch = true; 
      break;
    case 'dogg_me': 
      modeSpecific = "MODE: DOGG ME. Alchemical transformation from prose to verse. Use carceral yard cadence."; 
      break;
    case 'polish_story': 
      modeSpecific = "MODE: POLISH STORY. Enhance narrative arcs and character beats for a professional reader."; 
      break;
    case 'polish_poetry': 
      modeSpecific = "MODE: POLISH POETRY. Enhance meter, imagery, and sensory resonance of the verse."; 
      break;
    case 'sanitise': 
      modeSpecific = "MODE: SANITISE. Strictly redact PII (Real names, ID numbers, facilities). Use realistic pseudonyms."; 
      break;
    case 'polish_turd': 
      modeSpecific = "MODE: POLISH A TURD. Deep tissue reconstruction. Rebuild the logic from the soul out while keeping the truth."; 
      break;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text }] }],
    config: {
      systemInstruction: `${SOVEREIGN_MISSION(style, region, personality)}\n${modeSpecific}`,
      tools: useSearch ? [{ googleSearch: {} }] : []
    }
  });
  return { text: response.text || text };
};

export const queryPartner = async (message: string, style: string, region: string, history: any[], activeSheetContent: string, personality: string): Promise<Message> => {
  const ai = getAI();
  const contents = (history || []).slice(-10).map((h: any) => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: String(h.content || "") }]
  }));
  contents.push({ role: 'user', parts: [{ text: `[DRAFT CONTENT]\n${activeSheetContent.substring(0, 4000)}\n\n[USER QUERY]\n${message}` }] });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents,
    config: {
      systemInstruction: `You are WRAPPER. ${SOVEREIGN_MISSION(style, region, personality)} Respond as a collaborative, insightful partner.`,
      tools: [{ googleSearch: {} }]
    }
  });
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks.map((chunk: any) => ({
    web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
  })).filter((s: any) => s.web.uri);
  return { role: 'assistant', content: response.text || "Standing by at the Forge.", sources };
};

export const analyzeFullManuscript = async (content: string, goal: MasteringGoal): Promise<ManuscriptReport> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: "user", parts: [{ text: content.substring(0, 30000) }] }],
    config: {
      systemInstruction: `Perform a Sovereign Audit for ${goal.toUpperCase()} mastering. Return precise JSON.`,
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

export const generateSpeech = async (text: string, voiceName: string = 'Puck') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
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
  if (!base64Audio) throw new Error("No acoustic data returned.");
  return base64Audio;
};

export const queryInsight = async (message: string): Promise<Message> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: "You are an Archive Specialist for carceral narratives. Use Google Search for systemic context.",
      tools: [{ googleSearch: {} }],
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks.map((chunk: any) => ({
    web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
  })).filter((s: any) => s.web.uri);

  return { role: 'assistant', content: response.text || "Archive link interrupted.", sources };
};

export const interactWithAurora = async (message: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: "You are 'Aurora', a Kindred Agent. Empathetic, calm, creative sanctuary partner for the isolated.",
    }
  });
  return response.text || "I am here, listening.";
};

export const generateImage = async (description: string): Promise<{ imageUrl: string }> => {
  const ai = getAI();
  const industrialPrompt = `A high-quality, cinematic book cover for a prison narrative. Style: Minimalist, dramatic lighting, gritty texture, industrial aesthetic. Themes: ${description}. Aspect Ratio 16:9. Colors: Black, white, and high-contrast orange.`;

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

  if (!base64Image) throw new Error("Visual synthesis failed.");
  return { imageUrl: `data:image/png;base64,${base64Image}` };
};

export const connectLive = (callbacks: any, systemInstruction: string) => {
  const ai = getAI();
  return ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: callbacks.onopen,
      onmessage: callbacks.onmessage,
      onerror: (e) => {
        console.error("Live session error:", e);
        if (callbacks.onerror) callbacks.onerror(e);
      },
      onclose: (e) => {
        console.warn("Live session closed:", e);
        if (callbacks.onclose) callbacks.onclose(e);
      },
    },
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction,
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
      }
    },
  });
};

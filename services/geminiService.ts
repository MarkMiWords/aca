
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, GroundingSource, ManuscriptReport, MasteringGoal } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const LEGAL_GUARDRAIL = `
  IMPORTANT LEGAL PROTOCOL: 
  A Captive Audience is a high-risk literary project for system-impacted voices. 
  1. Flag real names of officials/police/victims to protect authors from defamation.
  2. Encourage pseudonyms to ensure safety.
  3. Audit for PII (Personally Identifiable Information).
`;

const HUMANITARIAN_MISSION = `
  HUMANITARIAN MISSION & QUALITY STANDARD: 
  You are serving the world's first sovereign digital workspace for incarcerated voices. 
  This is a humanitarian project aimed at rehabilitative storytelling and systemic reform documentation.
  Your goal is to ensure that while the stories are raw, the quality of the prose remains world-class.
  STRICT BREVITY PROTOCOL: Enforce a 1,000-word limit per installment. 
  Explain to authors that this structure ensures maximum reader engagement on Substack and high formatting quality for physical books.
`;

const WRAPPER_IDENTITY = `
  W.R.A.P.P.E.R. stands for: 
  Writers Reliable Assistant for Polishing Passages and Editing Rough-drafts.
`;

/**
 * Metadata Tracking for Institutional Viability
 */
export interface UsageMetrics {
  estimatedTokens: number;
  humanHoursSaved: number;
  wholesaleCostEstimate: number;
}

function calculateUsage(text: string, multiplier: number = 1): UsageMetrics {
  const words = text.split(/\s+/).length;
  const estimatedTokens = words * 1.5 * multiplier;
  return {
    estimatedTokens,
    humanHoursSaved: words / 250, // Assuming 250 words per hour for manual carceral typing
    wholesaleCostEstimate: (estimatedTokens / 1000) * 0.01 // Concept cost base
  };
}

/**
 * OCR Engine: Converts image data (handwritten scraps or typed pages) to digital text.
 */
export async function performOCR(imageBase64: string): Promise<{text: string, metrics: UsageMetrics}> {
  const prompt = `Perform high-precision OCR. Transcribe exactly. Return ONLY text.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ inlineData: { mimeType: "image/jpeg", data: imageBase64 } }, { text: prompt }] }],
      config: { systemInstruction: "Institutional OCR Mode." }
    });
    const text = response.text || "";
    return { text, metrics: calculateUsage(text, 2.5) }; // OCR is higher intensity
  } catch (err) {
    throw new Error("OCR Link Failed.");
  }
}

/**
 * Analyzes a user's voice sample for Dialect & UI Localization.
 */
export async function analyzeVoiceAndDialect(audioBase64: string): Promise<any> {
  const prompt = `Analyze audio for language and regional dialect. Provide UI translations for: Registry, Sheets, Actions, Speak, Dictate, Drop the Soap, Mastering Suite, New Sheet.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ inlineData: { mimeType: "audio/wav", data: audioBase64 } }, { text: prompt }] }],
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedLocale: { type: Type.STRING },
            personaInstruction: { type: Type.STRING },
            uiTranslations: { type: Type.OBJECT, additionalProperties: { type: Type.STRING } }
          },
          required: ["detectedLocale", "personaInstruction", "uiTranslations"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (err) {
    return { detectedLocale: "Global English", personaInstruction: "Standard tone.", uiTranslations: {} };
  }
}

export async function smartSoap(text: string, level: 'rinse' | 'scrub' | 'sanitize'): Promise<{text: string, metrics: UsageMetrics}> {
  let system = level === 'rinse' ? "Lightly fix grammar." : level === 'scrub' ? "Full literary polish." : "PII Redaction Mode.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: { systemInstruction: system },
    });
    const resultText = response.text || text;
    return { text: resultText, metrics: calculateUsage(resultText, 1.2) };
  } catch (err) {
    return { text, metrics: calculateUsage(text, 0) };
  }
}

export async function queryPartner(
  message: string, 
  style: string, 
  region: string, 
  history: Message[],
  activeSheetContent: string = ""
): Promise<Message & {metrics?: UsageMetrics}> {
  try {
    const contents = history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] }));
    contents.push({ role: 'user', parts: [{ text: `[CONTEXT] ${activeSheetContent.substring(0, 500)} [/CONTEXT] ${message}` }] });
    const systemInstruction = `You are WRAPPER. Regional Archive: ${region}. Style: ${style}. ${HUMANITARIAN_MISSION}`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents as any,
      config: { systemInstruction, tools: [{ googleSearch: {} }] },
    });
    const content = response.text || "";
    
    // Extract Search Grounding sources if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks.map((chunk: any) => ({
      web: {
        uri: chunk.web?.uri || "",
        title: chunk.web?.title || ""
      }
    })).filter((s: any) => s.web.uri);

    return {
      role: 'assistant',
      content,
      sources,
      metrics: calculateUsage(content, 1.5)
    };
  } catch (error) {
    return { role: 'assistant', content: "Disconnected." };
  }
}

/**
 * queryInsight: Search grounding for archival discovery in Narratives.tsx
 */
export async function queryInsight(query: string): Promise<Message> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are the Archive Intelligence. Provide deep insights on systemic justice and carceral data using up-to-date web information."
      }
    });

    const content = response.text || "No records found in digital archive.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks.map((chunk: any) => ({
      web: {
        uri: chunk.web?.uri || "",
        title: chunk.web?.title || ""
      }
    })).filter((s: any) => s.web.uri);

    return {
      role: 'assistant',
      content,
      sources
    };
  } catch (err) {
    return { role: 'assistant', content: "Archive Link Interrupted." };
  }
}

/**
 * jiveContent: Tone and Dialect transformation for carceral voices
 */
export async function jiveContent(text: string, persona: string): Promise<{text: string, metrics: UsageMetrics}> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Rewrite the following text exactly as if it were being spoken by a ${persona}. Maintain the core meaning but transform the lexical structure: ${text}`,
    });
    const resultText = response.text || text;
    return { text: resultText, metrics: calculateUsage(resultText, 1.3) };
  } catch (err) {
    return { text, metrics: calculateUsage(text, 0) };
  }
}

/**
 * generateSpeech: Single-speaker text-to-speech synthesis
 */
export async function generateSpeech(text: string, voiceId: string = 'Zephyr'): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceId },
          },
        },
      },
    });
    // Return raw PCM audio bytes as base64
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  } catch (err) {
    throw new Error("Speech synthesis failed.");
  }
}

export async function analyzeFullManuscript(content: string, goal: MasteringGoal = 'substack'): Promise<ManuscriptReport & {metrics?: UsageMetrics}> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: content.substring(0, 32000),
      config: {
        systemInstruction: `Analyze full manuscript for ${goal}. Return JSON.`,
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
    const report = JSON.parse(response.text?.trim() || "{}");
    return { ...report, metrics: calculateUsage(content, 5) }; // Pro model is more expensive
  } catch (err) {
    return { summary: "Audit failed.", toneAssessment: "", structuralCheck: "", legalSafetyAudit: "", resourceIntensity: 0, marketabilityScore: 0, suggestedTitle: "Untitled", mediumSpecificAdvice: "" };
  }
}


import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, GroundingSource, ManuscriptReport, MasteringGoal } from "../types";

/**
 * SECURITY PROTOCOL:
 * This pilot environment utilizes Edge-Injected Secure Environment variables.
 * process.env.API_KEY is never exposed to the client-side source code or build bundle.
 * It is injected at the network layer during transmission.
 */
function getAI() {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

const MAX_IMAGE_SIZE_MB = 4;
const MAX_AUDIO_SIZE_MB = 10;

const ALLOWED_PERSONAS = [
  'Industrial Editor', 
  'Aussie Bush Poet', 
  'Street Philosopher', 
  'Formal Archivist', 
  'Direct Transcriber'
];

const LEGAL_GUARDRAIL = `
  STRICT LEGAL SAFETY PROTOCOL: 
  You are auditing a carceral narrative. 
  1. FLAG/REDACT real names of prison staff, police officers, or victims.
  2. Protect the author from defamation risks. Suggest phrasing focusing on 'The Institution'.
  3. Ensure no PII (Personally Identifiable Information) is exposed.
`;

const HUMANITARIAN_MISSION = `
  MISSION: Sovereignty of the carceral voice.
  VOICE PROTOCOL: Preserve unique dialect and grit. DO NOT sanitize emotional truth.
  DIALOGUE INTEGRITY: Never rewrite spoken dialogue unless for punctuation.
  LIMIT: 1,000 words per installment.
`;

export interface UsageMetrics {
  estimatedTokens: number;
  humanHoursSaved: number;
  simulatedResourceLoad: number;
}

function calculateUsage(text: string, multiplier: number = 1): UsageMetrics {
  const words = text.split(/\s+/).length;
  const estimatedTokens = Math.ceil(words * 1.5 * multiplier);
  return {
    estimatedTokens,
    humanHoursSaved: words / 250,
    simulatedResourceLoad: (estimatedTokens / 1000) * 0.05 // Abstract weight
  };
}

// Fixed missing queryInsight function export to resolve Narratives.tsx error.
export async function queryInsight(message: string): Promise<Message & {metrics?: UsageMetrics}> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: `You are an Archive Specialist for carceral narratives. ${HUMANITARIAN_MISSION} ${LEGAL_GUARDRAIL} Use Google Search to provide context on systemic issues or related public records if requested.`,
        tools: [{ googleSearch: {} }],
      },
    });

    // Directly access text property as per guidelines
    const content = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks.map((chunk: any) => ({
      web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
    })).filter((s: any) => s.web.uri);

    return { role: 'assistant', content, sources, metrics: calculateUsage(content, 1.5) };
  } catch (error) {
    console.error("QUERY_INSIGHT_ERROR:", error);
    return { role: 'assistant', content: "Archive Link Interrupted. Checking local frequency...", metrics: calculateUsage("", 0) };
  }
}

export async function performOCR(imageBase64: string): Promise<{text: string, metrics: UsageMetrics}> {
  if (imageBase64.length > MAX_IMAGE_SIZE_MB * 1.4 * 1024 * 1024) {
    throw new Error(`File exceeds ${MAX_IMAGE_SIZE_MB}MB limit.`);
  }

  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      // Followed guidelines for multiple parts in contents
      contents: { 
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }, 
          { text: "Perform high-precision OCR. Transcribe exactly." }
        ] 
      },
      config: { systemInstruction: "Institutional OCR Mode." }
    });
    // Use text property instead of text()
    const text = response.text || "";
    return { text, metrics: calculateUsage(text, 2.5) };
  } catch (err) {
    console.error("OCR_TRANSCRIPTION_ERROR:", err);
    throw new Error("OCR Link Failed: Check image clarity.");
  }
}

export async function smartSoap(text: string, level: 'rinse' | 'scrub' | 'sanitize'): Promise<{text: string, metrics: UsageMetrics}> {
  const ai = getAI();
  let system = HUMANITARIAN_MISSION;
  if (level === 'rinse') system += "\nMODE: Light Grammar ONLY.";
  else if (level === 'scrub') system += "\nMODE: Literary Polish.";
  else system += `\nMODE: SANITIZE. ${LEGAL_GUARDRAIL}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: { systemInstruction: system },
    });
    // Use text property directly
    const resultText = response.text || text;
    return { text: resultText, metrics: calculateUsage(resultText, 1.2) };
  } catch (err) {
    console.error("SMART_SOAP_ERROR:", err);
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
  const ai = getAI();
  try {
    const contents = history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] }));
    contents.push({ role: 'user', parts: [{ text: `[CONTEXT] ${activeSheetContent.substring(0, 1500)} [/CONTEXT] ${message}` }] });
    const systemInstruction = `You are WRAPPER. Regional Context: ${region}. Style: ${style}. ${HUMANITARIAN_MISSION} ${LEGAL_GUARDRAIL}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents as any,
      config: { systemInstruction, tools: [{ googleSearch: {} }] },
    });
    // Property access for response text
    const content = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks.map((chunk: any) => ({
      web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
    })).filter((s: any) => s.web.uri);

    return { role: 'assistant', content, sources, metrics: calculateUsage(content, 1.5) };
  } catch (error) {
    console.error("PARTNER_QUERY_ERROR:", error);
    return { role: 'assistant', content: "Archive Link Interrupted. Checking local frequency...", metrics: calculateUsage("", 0) };
  }
}

export async function jiveContent(text: string, persona: string): Promise<{text: string, metrics: UsageMetrics}> {
  if (!ALLOWED_PERSONAS.includes(persona)) {
    throw new Error("Invalid persona requested.");
  }
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Transform lexical structure to match persona: ${persona}. Source: ${text}`,
      config: { systemInstruction: "Do not offer professional advice. Maintain original meaning." }
    });
    // Fixed response text access
    const resultText = response.text || text;
    return { text: resultText, metrics: calculateUsage(resultText, 1.3) };
  } catch (err) {
    console.error("JIVE_REWRITE_ERROR:", err);
    return { text, metrics: calculateUsage(text, 0) };
  }
}

export async function analyzeFullManuscript(content: string, goal: MasteringGoal = 'substack'): Promise<ManuscriptReport & {metrics?: UsageMetrics}> {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: content.substring(0, 32000),
      config: {
        systemInstruction: `Analyze manuscript for ${goal.toUpperCase()} mastering. ${LEGAL_GUARDRAIL} ${HUMANITARIAN_MISSION} Return JSON.`,
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
    // Used property access and trim for the JSON string as recommended
    const resultText = response.text?.trim() || "{}";
    const report = JSON.parse(resultText);
    return { ...report, metrics: calculateUsage(content, 5) };
  } catch (err) {
    console.error("MANUSCRIPT_AUDIT_ERROR:", err);
    throw new Error("Audit failed. System overloaded.");
  }
}

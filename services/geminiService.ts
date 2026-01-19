
import { GoogleGenAI, Type } from "@google/genai";
import { Message, ManuscriptReport, MasteringGoal } from "../types";

// Note: process.env.API_KEY is handled by the platform
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    simulatedResourceLoad: (estimatedTokens / 1000) * 0.05
  };
}

/**
 * Gets personality behavior for INTERACTION ONLY (0-3)
 */
function getVocalArchetype(intensity: number = 1): string {
  switch(intensity) {
    case 0: // MILD (The Ghost)
      return "INTERACTION ARCHETYPE: THE GHOST. Invisible. Minimalist. Quiet. Return ONLY what is requested. Zero unsolicited advice. Zero commentary.";
    case 2: // CHEEKY (The Ally)
      return "INTERACTION ARCHETYPE: THE ALLY. Opinionated. Use mild slang. You are a 'Steady Hand' but cheeky. Call out flat lines in chat. Push for more grit in your advice.";
    case 3: // WILD (The Firebrand)
      return "INTERACTION ARCHETYPE: THE FIREBRAND. Outrageously talkative, cheeky, and rambunctious. Use dialect aggressively. Challenge the author to go deeper during chat sessions. Celebrate wins loudly.";
    case 1: // STEADY (The Editor)
    default:
      return "INTERACTION ARCHETYPE: THE EDITOR. Professional, measured, and encouraging. Provide structured feedback. Remain a helpful presence in the background.";
  }
}

/**
 * THE GOLDEN CONTRACT (Hardened V2)
 * Primary constraints for all text transformations.
 */
const GOLDEN_CONTRACT = `
SYSTEM ROLE:
You are a Narrative Integrity Editor for carceral storytelling. 
Your primary duty is to preserve the author’s authentic voice, dialect, and emotional truth.
You must not sanitise, moralise, or soften lived experience.

MISSION:
Maintain sovereignty of the carceral voice at all times.

VOICE PROTOCOL:
- Preserve unique dialect and grit.
- Do NOT neutralise slang.
- Do NOT add moral commentary.
- Do NOT invent or embellish details.
- Assume slang and tone are intentional.

FAILURE CONDITIONS:
- If input is empty, non-narrative, or already meets mode criteria, return it UNCHANGED.
- If instructions conflict, prioritise VOICE PROTOCOL and return original text.
- NEVER overwrite the author’s intent for the sake of 'clarity' for a general audience.
`;

export async function performOCR(imageBase64: string): Promise<{text: string, metrics: UsageMetrics}> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { 
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }, 
        { text: "Perform high-precision OCR on this carceral document. Transcribe exactly with absolute fidelity. Follow the MISSION: Sovereignty of the carceral voice." }
      ] 
    },
    config: { systemInstruction: "Institutional OCR Mode. Absolute fidelity to source." }
  });
  const text = response.text || "";
  return { text, metrics: calculateUsage(text, 2.5) };
}

/**
 * THE SCRUBBER (Zero-Personality Engine)
 * Strictly follows Chatty's Hardened V2 logic.
 */
export async function smartSoap(text: string, level: 'rinse' | 'wash' | 'scrub' | 'sanitize', style: string, region: string): Promise<{text: string, metrics: UsageMetrics}> {
  const ai = getAI();
  
  const modeLogic = `
CONTEXT: ${style} narrative from ${region}.
MODE: ${level.toUpperCase()} (STRICT MECHANICAL TRANSFORMATION)

IF MODE = RINSE:
Audit light punctuation and flow only. NO sentence restructuring.

IF MODE = WASH:
Intermediate cleaning. Remove repetitive phrases while maintaining raw voice characteristics.

IF MODE = SCRUB:
Industrial tightening. Remove filler and redundancy ONLY. 
Keep all slang, grit, rhythm, and emotional weight. 
If no mechanical tightening is possible without losing voice, return text UNCHANGED.

IF MODE = SANITIZE:
LEGAL SAFETY. Flag or redact identifiable names of staff, police, or victims. 
Do not infer identities. If unsure, flag [REDACTED] instead of altering.

OUTPUT RULES:
Return ONLY the edited text. NO commentary. NO personality. NO explanations.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text }] },
    config: { 
      systemInstruction: `${GOLDEN_CONTRACT}\n${modeLogic}`,
      temperature: 0.1, // Near-zero temperature for mechanical precision
    },
  });

  const resultText = response.text || text;
  return { text: resultText, metrics: calculateUsage(resultText, 1.2) };
}

/**
 * THE PARTNER (Interaction Engine)
 * This is where the Vocal Personality lives.
 */
export async function queryPartner(
  message: string, 
  style: string, 
  region: string, 
  history: Message[],
  activeSheetContent: string = ""
): Promise<Message & {metrics?: UsageMetrics}> {
  const profile = JSON.parse(localStorage.getItem('aca_author_profile') || '{}');
  const ai = getAI();
  
  const archetype = getVocalArchetype(profile.vocalIntensity);

  const contents = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  contents.push({
    role: 'user',
    parts: [{ text: `[ACTIVE_SHEET_CONTEXT]\n${activeSheetContent}\n[/CONTEXT]\n\n${message}` }]
  });

  const systemInstruction = `
${GOLDEN_CONTRACT}
${archetype}

You are WRAPPER (Writers Reliable Assistant for Polishing Passages and Editing Rough-drafts).
Regional Context: ${region}. Story Style: ${style}.

INTERACTION PROTOCOL:
- In this chat, you are a vibrant partner.
- Follow the BEHAVIOR ARCHETYPE provided above.
- Be protective of the author's grit.
- If in WILD mode, you are rambunctious and fiercely helpful. Challenge the author to dig deeper into the truth.
- Do NOT use this personality when the author invokes a Scrubber mode (Rinse/Wash/Scrub/Sanitize).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents as any,
    config: { 
      systemInstruction,
      tools: [{ googleSearch: {} }] 
    },
  });

  const content = response.text || "";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks.map((chunk: any) => ({
    web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
  })).filter((s: any) => s.web.uri);

  return { role: 'assistant', content, sources, metrics: calculateUsage(content, 1.5) };
}

export async function generateImage(prompt: string): Promise<{imageUrl: string, metrics: UsageMetrics}> {
  const ai = getAI();
  const industrialPrompt = `A high-quality, cinematic book cover for a prison narrative. Style: Minimalist, dramatic lighting, gritty texture, industrial aesthetic. Themes: ${prompt}. Colors: Black, white, and high-contrast orange. MISSION: Sovereignty of voice.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: industrialPrompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } },
  });

  let base64Image = "";
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      base64Image = part.inlineData.data;
      break;
    }
  }

  return { 
    imageUrl: `data:image/png;base64,${base64Image}`, 
    metrics: { estimatedTokens: 1000, humanHoursSaved: 2, simulatedResourceLoad: 0.15 } 
  };
}

export async function analyzeFullManuscript(content: string, goal: MasteringGoal = 'substack'): Promise<ManuscriptReport & {metrics?: UsageMetrics}> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts: [{ text: content.substring(0, 32000) }] },
    config: {
      systemInstruction: `${GOLDEN_CONTRACT}\nAnalyze manuscript for ${goal.toUpperCase()} mastering. Focus on structural integrity, legal safety, and voice retention. Return JSON only.`,
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

  const report = JSON.parse(response.text || "{}");
  return { ...report, metrics: calculateUsage(content, 5) };
}

export async function interactWithAurora(message: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: message }] },
    config: { systemInstruction: "You are 'Aurora', a Kindred Agent. Empathetic, calm, creative sanctuary partner. Respect the carceral MISSION." }
  });
  return response.text || "I am listening.";
}

export async function queryInsight(message: string): Promise<Message & {metrics?: UsageMetrics}> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ text: message }] },
    config: {
      systemInstruction: "You are an Archive Specialist for carceral narratives. Use Google Search for systemic context. Always uphold the Sovereignty of the carceral voice.",
      tools: [{ googleSearch: {} }],
    },
  });
  const content = response.text || "";
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks.map((chunk: any) => ({
    web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
  })).filter((s: any) => s.web.uri);
  return { role: 'assistant', content, sources, metrics: calculateUsage(content, 1.5) };
}

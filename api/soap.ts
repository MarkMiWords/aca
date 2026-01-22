
import { GoogleGenAI } from "@google/genai";

const HUMANITARIAN_MISSION = `
  MISSION: Sovereignty of the carceral voice.
  VOICE PROTOCOL: Preserve unique dialect and grit. DO NOT sanitize emotional truth.
  DIALOGUE INTEGRITY: Never rewrite spoken dialogue unless for punctuation.
  LIMIT: 1,000 words per installment.
`;

const LEGAL_GUARDRAIL = `
  STRICT LEGAL SAFETY PROTOCOL: 
  You are auditing a carceral narrative. 
  1. FLAG/REDACT real names of prison staff, police officers, or victims.
  2. Protect the author from defamation risks. 
  3. Ensure no PII (Personally Identifiable Information) is exposed.
`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, level, style, region } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Sovereign Link Cold: API Key Missing" });
  }

  const safeText = text.slice(0, 10000);

  try {
    const ai = new GoogleGenAI({ apiKey });
    let system = HUMANITARIAN_MISSION;
    
    if (level === 'rinse') system += "\nMODE: Light Grammar and Punctuation ONLY. Maintain raw grit.";
    else if (level === 'scrub') system += `\nMODE: Literary Polish. Elevate structure for ${style} in ${region}.`;
    else if (level === 'fact_check') system += "\nMODE: Fact Check. Analyze for legal and factual claims.";
    else if (level === 'sanitise') system += `\nMODE: SANITIZE. ${LEGAL_GUARDRAIL}`;
    else system += `\nMODE: General Refinement for ${style}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: safeText }] }],
      config: { systemInstruction: system },
    });

    const resultText = response.text || safeText;
    return res.status(200).json({ text: resultText });
  } catch (error: any) {
    console.error("API_SOAP_ERROR:", error);
    return res.status(500).json({ error: `Polishing Failure: ${error.message || "Unknown error"}` });
  }
}

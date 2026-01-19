
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

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { text, level } = JSON.parse(event.body || "{}");
  if (!text) {
    return { statusCode: 400, body: JSON.stringify({ error: "Text is required" }) };
  }

  const safeText = text.slice(0, 10000);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let system = HUMANITARIAN_MISSION;
    if (level === 'rinse') system += "\nMODE: Light Grammar ONLY.";
    else if (level === 'scrub') system += "\nMODE: Literary Polish.";
    else system += `\nMODE: SANITIZE. ${LEGAL_GUARDRAIL}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: safeText }] }],
      config: { systemInstruction: system },
    });

    const resultText = response.text || safeText;
    return {
      statusCode: 200,
      body: JSON.stringify({ text: resultText }),
    };
  } catch (error: any) {
    console.error("API_SOAP_ERROR:", error?.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Sovereign Link Interrupted" }),
    };
  }
};

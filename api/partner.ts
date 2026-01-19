
import { GoogleGenAI } from "@google/genai";

const HUMANITARIAN_MISSION = `MISSION: Sovereignty of the carceral voice. W.R.A.P.P.E.R. (Writers Reliable Assistant for Polishing Passages and Editing Rough-drafts).`;

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { message, style, region, history, activeSheetContent } = JSON.parse(event.body || "{}");
  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: "Message is required" }) };
  }

  const safeMessage = message.slice(0, 6000);
  const safeContext = (activeSheetContent || "").slice(0, 2000);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contents = (Array.isArray(history) ? history : []).map((h: any) => ({ 
      role: h.role === 'user' ? 'user' : 'model', 
      parts: [{ text: String(h.content || "").slice(0, 2000) }] 
    }));

    contents.push({ 
      role: 'user', 
      parts: [{ text: `[CONTEXT] ${safeContext} [/CONTEXT] ${safeMessage}` }] 
    });

    const systemInstruction = `You are WRAPPER. Regional Context: ${region}. Style: ${style}. ${HUMANITARIAN_MISSION}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents as any,
      config: { systemInstruction, tools: [{ googleSearch: {} }] },
    });

    const content = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => ({
      web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
    })).filter((s: any) => s.web.uri);

    return {
      statusCode: 200,
      body: JSON.stringify({ role: 'assistant', content, sources }),
    };
  } catch (error: any) {
    console.error("API_PARTNER_ERROR:", error?.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Partner link failed" }),
    };
  }
};


import { GoogleGenAI } from "@google/genai";

const HUMANITARIAN_MISSION = `MISSION: Sovereignty of the carceral voice. W.R.A.P.P.E.R. (Writers Reliable Assistant for Polishing Passages and Editing Rough-drafts). Always provide helpful, empathetic, and industrial-focused advice.`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, style, region, history, activeSheetContent } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("SOVEREIGN_AUTH_ERROR: Missing API_KEY environment variable.");
    return res.status(500).json({ error: "Sovereign Link Cold: API Key Missing" });
  }

  const safeMessage = message.slice(0, 6000);
  const safeContext = (activeSheetContent || "").slice(0, 2000);

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const contents = (Array.isArray(history) ? history : []).map((h: any) => ({ 
      role: h.role === 'user' ? 'user' : 'model', 
      parts: [{ text: String(h.content || "").slice(0, 2000) }] 
    }));

    contents.push({ 
      role: 'user', 
      parts: [{ text: `[WORKSPACE CONTEXT] ${safeContext} [/WORKSPACE CONTEXT]\n\nAUTHOR QUERY: ${safeMessage}` }] 
    });

    const systemInstruction = `You are WRAPPER, the Sovereign Writing Partner. Regional Context: ${region}. Style: ${style}. ${HUMANITARIAN_MISSION}. Use Google Search to provide factual grounding if needed.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents as any,
      config: { 
        systemInstruction, 
        tools: [{ googleSearch: {} }] 
      },
    });

    const content = response.text || "I am processing your truth.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => ({
      web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
    })).filter((s: any) => s.web.uri);

    return res.status(200).json({ role: 'assistant', content, sources });
  } catch (error: any) {
    console.error("API_PARTNER_FAILURE:", {
      message: error?.message,
      stack: error?.stack,
      status: error?.status
    });
    return res.status(500).json({ error: "Partner Link Interrupted: " + (error?.message || "Unknown Failure") });
  }
}

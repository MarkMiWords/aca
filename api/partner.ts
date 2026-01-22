
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
    console.error("API_PARTNER_ERROR: API_KEY environment variable is not defined.");
    return res.status(500).json({ error: "The Sovereign Link is cold. The API Key is not reachable by the server." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const contents = (Array.isArray(history) ? history : [])
      .filter(h => h && h.content)
      .map((h: any) => ({ 
        role: h.role === 'user' ? 'user' : 'model', 
        parts: [{ text: String(h.content || "").slice(0, 2000) }] 
      }));

    const safeContext = (activeSheetContent || "").slice(0, 2000);
    contents.push({ 
      role: 'user', 
      parts: [{ text: `[WORKSPACE CONTEXT]\n${safeContext}\n[/WORKSPACE CONTEXT]\n\nAUTHOR QUERY: ${message.slice(0, 2000)}` }] 
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

    const responseText = response.text;
    if (!responseText) {
      console.warn("API_PARTNER_WARNING: Model returned empty text.");
      return res.status(200).json({ role: 'assistant', content: "The partner is reflecting but has no words for this specific query. Try rephrasing." });
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => ({
      web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
    })).filter((s: any) => s.web.uri);

    return res.status(200).json({ role: 'assistant', content: responseText, sources });
  } catch (error: any) {
    console.error("API_PARTNER_FAILURE:", error);
    return res.status(500).json({ error: `Partner Link Failure: ${error.message || "Unknown error"}` });
  }
}

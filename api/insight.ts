
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Query is required" });
  }

  const safeQuery = message.slice(0, 1000);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: "user", parts: [{ text: safeQuery }] }],
      config: {
        systemInstruction: "You are an Archive Specialist for carceral narratives. Use Google Search for systemic context.",
        tools: [{ googleSearch: {} }],
      },
    });

    const content = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => ({
      web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
    })).filter((s: any) => s.web.uri);

    return res.status(200).json({ role: 'assistant', content, sources });
  } catch (error: any) {
    console.error("API_INSIGHT_ERROR:", error?.message || error);
    return res.status(500).json({ error: "Insight link failed" });
  }
}


import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { message } = JSON.parse(event.body || "{}");
  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: "Query is required" }) };
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

    return {
      statusCode: 200,
      body: JSON.stringify({ role: 'assistant', content, sources }),
    };
  } catch (error: any) {
    console.error("API_INSIGHT_ERROR:", error?.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Insight link failed" }),
    };
  }
};

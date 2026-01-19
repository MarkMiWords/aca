
import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { message } = JSON.parse(event.body || "{}");
  if (!message) {
    return { statusCode: 400, body: JSON.stringify({ error: "Message is required" }) };
  }

  const safeMessage = message.slice(0, 4000);

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: safeMessage }] }],
      config: {
        systemInstruction: "You are 'Aurora', a Kindred Agent. Empathetic, calm, creative sanctuary partner.",
      }
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ text: response.text || "I am listening." }),
    };
  } catch (error: any) {
    console.error("API_KINDRED_ERROR:", error?.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Kindred link failed" }),
    };
  }
};


import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
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
    return res.status(200).json({ text: response.text || "I am listening." });
  } catch (error: any) {
    console.error("API_KINDRED_ERROR:", error?.message || error);
    return res.status(500).json({ error: "Kindred link failed" });
  }
}

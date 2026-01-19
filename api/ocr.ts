
import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { imageBase64 } = JSON.parse(event.body || "{}");
  if (!imageBase64) {
    return { statusCode: 400, body: JSON.stringify({ error: "Image data required" }) };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }, 
          { text: "Perform high-precision OCR on this carceral document. Transcribe exactly." }
        ] 
      }],
      config: { systemInstruction: "Institutional OCR Mode. Absolute fidelity to source." }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ text: response.text || "" }),
    };
  } catch (error: any) {
    console.error("API_OCR_ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OCR processing failed" }),
    };
  }
};

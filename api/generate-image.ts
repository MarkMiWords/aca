
import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { prompt } = JSON.parse(event.body || "{}");
  if (!prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: "Prompt is required" }) };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const industrialPrompt = `A high-quality, cinematic book cover for a prison narrative. Style: Minimalist, dramatic lighting, gritty texture, industrial aesthetic. Themes: ${prompt}. Aspect Ratio 16:9. Colors: Black, white, and high-contrast orange.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: industrialPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    let base64Image = "";
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      return { statusCode: 500, body: JSON.stringify({ error: "No image data returned from model." }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ imageUrl: `data:image/png;base64,${base64Image}` }),
    };
  } catch (error: any) {
    console.error("API_IMAGE_GEN_ERROR:", error?.message || error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Image generation failed." }),
    };
  }
};


import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { content, goal } = JSON.parse(event.body || "{}");

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: "user", parts: [{ text: content.substring(0, 32000) }] }],
      config: {
        systemInstruction: `Analyze manuscript for ${goal?.toUpperCase() || 'GENERAL'} mastering. Return JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            toneAssessment: { type: Type.STRING },
            structuralCheck: { type: Type.STRING },
            legalSafetyAudit: { type: Type.STRING },
            resourceIntensity: { type: Type.NUMBER },
            marketabilityScore: { type: Type.NUMBER },
            suggestedTitle: { type: Type.STRING },
            mediumSpecificAdvice: { type: Type.STRING },
          },
          required: ["summary", "toneAssessment", "structuralCheck", "legalSafetyAudit", "resourceIntensity", "marketabilityScore", "suggestedTitle", "mediumSpecificAdvice"],
        },
      },
    });

    const report = JSON.parse(response.text || "{}");
    return {
      statusCode: 200,
      body: JSON.stringify(report),
    };
  } catch (error: any) {
    console.error("API_MANUSCRIPT_ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Audit failed" }),
    };
  }
};

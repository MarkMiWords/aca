
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, GroundingSource, ManuscriptReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const LEGAL_GUARDRAIL = `
  IMPORTANT LEGAL PROTOCOL: 
  A Captive Audience is a high-risk literary project for system-impacted voices. 
  1. Flag real names of officials/police/victims. 
  2. Use pseudonyms for characters to avoid defamation heat.
  3. Audit for PII (Personally Identifiable Information).
`;

const WRAPPER_IDENTITY = `
  W.R.A.P.P.E.R. stands for: 
  Writers Reliable Assistant for Polishing Passages and Editing Rough-drafts.
`;

const DIALECT_MAP: Record<string, string> = {
  'Australia': 'Use natural Aussie slang (mate, cobber, fair dinkum, reckoning). Tone: Gritty, dry humor, focused on Australian justice system nuances.',
  'North America': 'Use natural US-style street vernacular (no cap, facts, state-pen, hustle). Tone: Bold, confident, focused on the American penal landscape.',
  'United Kingdom': 'Use natural UK roadman slang (innit, bruv, peak, ends, long). Tone: Sharp, rhythmic, focused on the British carceral experience.',
  'South America': 'Use a poetic but tough tone. Use metaphors about passion, survival, and the street. Tone: Intense, lyrical.',
  'Europe': 'Use a sophisticated yet underground tone. Focus on shared European justice themes. Tone: Philosophical, steady.',
  'Asia': 'Use a respectful but strictly "street-wise" tone. Focus on honor, truth, and resilience. Tone: Disciplined, rhythmic.'
};

export async function smartSoap(text: string, level: 'rinse' | 'scrub' | 'sanitize'): Promise<string> {
  let prompt = "";
  let system = "You are a specialized editor for incarcerated writers.";
  
  if (level === 'rinse') {
    prompt = `Lightly fix the punctuation and capitalization of the following text. Do not change words or flow: "${text}"`;
    system = "Only fix punctuation and basic grammar. Keep the voice raw.";
  } else if (level === 'scrub') {
    prompt = `Clean up the grammar, flow, and clarity of this text while preserving the raw emotional grit: "${text}"`;
    system = "Fix flow and advanced grammar. Ensure the narrative is clear but remains authentic to the author's street dialect.";
  } else {
    prompt = `Sanitize this text for legal safety. Remove real names of people, specific dates, or facility signatures that could cause defamation issues. Keep the story powerful but safe: "${text}"`;
    system = "Focus on legal safety and PII. Replace names with generic placeholders like [OFFICER] or [INMATE] if necessary.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { systemInstruction: system },
    });
    return response.text || text;
  } catch (err) {
    return text;
  }
}

export async function jiveContent(text: string, region: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Remix the following content into rhythmic street poetry or rhyming slang specific to the ${region} region. Keep it gritty, entertaining, and punchy: "${text}"`,
      config: {
        systemInstruction: "You are the Jive Master. You take prose and turn it into the language of the streets—rhythmic, rhyming, and full of cultural flavor. Don't lose the heart of the story, just change the beat.",
      },
    });
    return response.text || text;
  } catch (err) {
    return text;
  }
}

export async function generateSpeech(text: string, voiceName: string = 'Fenrir', persona: string = 'Standard'): Promise<string | undefined> {
  try {
    // Instruction mapping for personas
    const personaInstructions: Record<string, string> = {
      'Bogan': 'with a thick, gravelly Australian Bogan accent. Use drawled vowels and a casual, gritty Aussie tone.',
      'Hillbilly': 'with a deep, rural American Appalachian/Hillbilly accent. Slow, rhythmic, and soulful.',
      'Homeboy': 'with a confident, rhythmic urban American street flow. Genuine, warm, but street-smart.',
      'Lad': 'with a fast-paced, energetic British "Lad" accent. Sharp and rhythmic.',
      'Eshay': 'with a high-energy, aggressive Australian Eshay dialect. Very rhythmic and sharp.',
      'Chav': 'with a thick, urban UK Chav accent. Gritty and street-wise.',
      'Bogger': 'with a deep, rural Irish "Bogger" accent. Lyrical but tough.',
      'Gopnik': 'with a thick Slavic/Eastern European Gopnik accent. Short, sharp, and intense.',
      'Scouse': 'with a heavy Liverpool Scouse accent. Very melodic but distinctly gritty.',
      'Valley': 'with a high-pitched, exaggerated California Valley accent. Lots of inflection.',
      'Posh': 'with an extremely refined, aristocratic "Posh" English accent. Cold, clear, and superior.',
      'Standard': 'with deep emotion and a gritty, resonant storyteller voice.'
    };

    const instruction = personaInstructions[persona] || personaInstructions['Standard'];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this narrative ${instruction}: ${text.substring(0, 2500)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (err) {
    console.error("Speech Generation Error:", err);
    return undefined;
  }
}

export async function queryPartner(
  message: string, 
  style: string, 
  region: string, 
  history: Message[],
  activeSheetContent: string = "",
  authorMemory: string = ""
): Promise<Message> {
  try {
    const profileSaved = localStorage.getItem('aca_author_profile');
    const profile = profileSaved ? JSON.parse(profileSaved) : null;
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }]
    }));
    const authorContextBlock = profile ? `
      [AUTHOR_PROFILE]
      Name/Identity: ${profile.name || "Anonymous Author"}
      Dialect Preference: ${profile.dialectLevel}
      Feedback Style: ${profile.feedbackStyle}
      Core Narrative Goal: ${profile.customContext || "Documenting the truth."}
      [/AUTHOR_PROFILE]
    ` : "";
    const contextHeader = `
      [STUDIO_CONTEXT]
      ${authorContextBlock}
      CURRENT_SHEET_CONTENT: ${activeSheetContent.substring(0, 1500)}
      [/STUDIO_CONTEXT]
    `;
    contents.push({ role: 'user', parts: [{ text: contextHeader + "\n\nAUTHOR_INPUT: " + message }] });
    const systemInstruction = `
      You are WRAPPER. ${WRAPPER_IDENTITY}
      ADAPTATION PROTOCOL:
      - Region: ${region} -> ${DIALECT_MAP[region] || 'Use global street English.'}
      ${LEGAL_GUARDRAIL}
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents as any,
      config: { systemInstruction, temperature: 0.9, tools: [{ googleSearch: {} }] },
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] = groundingChunks?.map((chunk: any) => ({
      web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
    })).filter((s: any) => s.web?.uri) || [];
    return {
      role: 'assistant',
      content: response.text || "I lost the connection for a second. Let's try that again.",
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error) {
    return { role: 'assistant', content: "Disconnected from the studio." };
  }
}

export async function queryInsight(message: string): Promise<Message> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: { systemInstruction: "Archive Researcher", tools: [{ googleSearch: {} }] },
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: GroundingSource[] = groundingChunks?.map((chunk: any) => ({
      web: { uri: chunk.web?.uri || "", title: chunk.web?.title || "" }
    })).filter((s: any) => s.web?.uri) || [];
    return { role: 'assistant', content: response.text || "", sources };
  } catch (error) { return { role: 'assistant', content: "Archives unreachable." }; }
}

// Added the missing analyzeFullManuscript function to resolve compilation errors
export async function analyzeFullManuscript(content: string): Promise<ManuscriptReport> {
  const systemInstruction = `
    You are a professional literary auditor and manuscript master for system-impacted writers.
    Analyze the full manuscript provided and generate a detailed report in JSON format.
    Focus on:
    1. Summary: A high-level overview of the work.
    2. Tone Assessment: Evaluate the emotional grit, authenticity, and overall mood.
    3. Structural Check: Audit the flow, consistency, and pacing.
    4. Legal Safety Audit: Highlight potential PII (Personally Identifiable Information) or defamation risks.
    5. Resource Intensity: A numeric score (1-100) representing the complexity of the editing task.
    6. Marketability Score: A numeric score (1-100) based on narrative power.
    7. Suggested Title: Propose a compelling title based on themes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: content.substring(0, 32000), // Safety truncation for token limits
      config: {
        systemInstruction,
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
          },
          required: ["summary", "toneAssessment", "structuralCheck", "legalSafetyAudit", "resourceIntensity", "marketabilityScore", "suggestedTitle"],
        },
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Manuscript Audit Error:", err);
    // Provide a fallback report to prevent UI crashes
    return {
      summary: "Audit analysis was interrupted due to technical constraints.",
      toneAssessment: "Inconclusive.",
      structuralCheck: "Structural analysis incomplete.",
      legalSafetyAudit: "CRITICAL: Manual legal safety check mandatory. Automated audit failed.",
      resourceIntensity: 0,
      marketabilityScore: 0,
      suggestedTitle: "Untitled Archive"
    };
  }
}

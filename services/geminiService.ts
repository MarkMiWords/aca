
import { Message, ManuscriptReport, MasteringGoal } from "../types";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Proper way to access environment variables in a Vite project
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SOVEREIGN_MISSION = (style: string, region: string, personality: string = 'Natural') => `
  MISSION: Sovereignty of the carceral and impacted voice.
  CONTEXT: Author Region: ${region.toUpperCase()}, Style: ${style.toUpperCase()}.
  TEMPERAMENT: ${personality.toUpperCase()}. 
  RULES: 
  - If Timid: Be gentle, prioritize safety, make minimal changes.
  - If Firebrand: Be aggressive, challenge the prose, push for high emotional intensity.
  - If Natural: Be a balanced partner, mirror the author's cadence.
`;

const getAI = () => {
  if (!API_KEY || API_KEY === "undefined") {
    console.error("CORE_LINK_FAILURE: Sovereign API Key is missing. Check your .env file for VITE_GEMINI_API_KEY.");
    throw new Error("CORE_LINK_FAILURE: Sovereign API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenerativeAI(API_KEY);
};

// Centralized safety settings for all models
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export const checkSystemHeartbeat = async (): Promise<{ status: 'online' | 'offline' | 'error', message: string }> => {
  try {
    const genAI = getAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent("ping");
    return result.response.text()
      ? { status: 'online', message: "Acoustic Link Stable. Forging logic active." }
      : { status: 'error', message: "Empty response from forge." };
  } catch (err: any) {
    console.error("Heartbeat Error:", err);
    return { status: 'offline', message: err.message || "Link interrupted." };
  }
};

export const articulateText = async (text: string, settings: any, style: string, region: string, personality: string) => {
  try {
    const genAI = getAI();
    const { gender, sound, accent, speed, isClone } = settings;
    
    const systemInstruction = `
      ${SOVEREIGN_MISSION(style, region, personality)}
      MODE: ARTICULATE (Oral Storytelling Optimization)
      
      ACOUSTIC MATRIX DIRECTIVES:
      1. REGIONAL ACCENT [${accent}]: Integrate carceral dialect specific to this region.
      2. TEMPORAL PACE [${speed}]: Adjust rhythm for delivery.
      3. SOUND LEVEL [${sound}]: Favors tone intensity.
      4. GENDER [${gender}]: Identity-weighted vocabulary.
      5. CLONE_MODE: ${isClone ? 'ACTIVE' : 'OFF'}

      GOAL: Refine oral rhythm for performance while keeping grit 100% intact.
    `;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", systemInstruction, safetySettings });
    const result = await model.generateContent(text);
    return { text: result.response.text() || text };
  } catch (err) {
    console.error("Articulate Error:", err);
    return { text }; // Return original text on error
  }
};

export const smartSoap = async (text: string, level: string, style: string, region: string, personality: string) => {
  try {
    const genAI = getAI();
    let modeSpecific = `General Mastering for ${style}.`;
    let useSearch = false;

    switch (level) {
      case 'rinse': modeSpecific = "MODE: RINSE. Fix typos ONLY. Preserve grit."; break;
      case 'wash': modeSpecific = "LEVEL L2: WASH. Smooth transitions."; break;
      case 'scrub': modeSpecific = "LEVEL L3: SCRUB. Structural tightening."; break;
      case 'fact_check': modeSpecific = "MODE: FACT CHECK."; useSearch = true; break;
      case 'dogg_me': modeSpecific = "MODE: DOGG ME. Alchemical poetry."; break;
      case 'polish_story': modeSpecific = "MODE: POLISH STORY."; break;
      case 'polish_poetry': modeSpecific = "MODE: POLISH POETRY."; break;
      case 'sanitise': modeSpecific = "MODE: SANITISE. Redact PII."; break;
      case 'polish_turd': modeSpecific = "MODE: POLISH A TURD. Deep reconstruction."; break;
    }

    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest", 
        systemInstruction: `${SOVEREIGN_MISSION(style, region, personality)}\n${modeSpecific}`,
        safetySettings,
    });

    const result = await model.generateContent(text);
    return { text: result.response.text() || text };
  } catch (err) {
    console.error("SmartSoap Error:", err);
    return { text };
  }
};

export const queryPartner = async (message: string, style: string, region: string, history: any[], activeSheetContent: string, personality: string): Promise<Message> => {
  try {
    const genAI = getAI();
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
        systemInstruction: `You are WRAPPER. ${SOVEREIGN_MISSION(style, region, personality)} Respond as a collaborative, insightful partner.`,
        safetySettings,
    });

    const chat = model.startChat({ history: (history || []).slice(-10) });
    const prompt = `[DRAFT CONTENT]\n${activeSheetContent.substring(0, 4000)}\n\n[USER QUERY]\n${message}`;
    const result = await chat.sendMessage(prompt);

    const citationMetadata = result.response.candidates?.[0]?.citationMetadata;
    const sources = (citationMetadata?.citationSources || []).map(att => ({
      web: { uri: att.uri || "", title: "" }
    })).filter(s => s.web.uri);

    return { role: 'assistant', content: result.response.text() || "Standing by at the Forge.", sources };
  } catch (err) {
    console.error("Query Partner Error:", err);
    return { role: 'assistant', content: "The connection to my core logic was interrupted. Please try again." };
  }
};

export const analyzeFullManuscript = async (content: string, goal: MasteringGoal): Promise<ManuscriptReport> => {
  try {
    const genAI = getAI();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest",
      safetySettings,
      generationConfig: { 
        responseMimeType: "application/json",
      },
      systemInstruction: `Perform a Sovereign Audit for ${goal.toUpperCase()} mastering. Return precise JSON matching the provided schema.`
    });
    
    const schema = {
      type: "object",
      properties: {
        summary: { type: "string", description: "Detailed summary of the entire manuscript." },
        toneAssessment: { type: "string", description: "Analysis of the overall tone and mood." },
        structuralCheck: { type: "string", description: "Feedback on the narrative structure, pacing, and flow." },
        legalSafetyAudit: { type: "string", description: "Identifies potential legal risks like defamation or privacy concerns." },
        resourceIntensity: { type: "number", description: "A score from 1-10 indicating the effort needed to polish the manuscript." },
        marketabilityScore: { type: "number", description: "A score from 1-10 on its potential market appeal." },
        suggestedTitle: { type: "string", description: "A compelling, market-friendly title suggestion." },
        mediumSpecificAdvice: { type: "string", description: "Advice on whether this works best as a book, screenplay, oral story, etc." },
      },
      required: ["summary", "toneAssessment", "structuralCheck", "legalSafetyAudit", "resourceIntensity", "marketabilityScore", "suggestedTitle", "mediumSpecificAdvice"],
    };
    
    const result = await model.generateContent([
        `Please analyze the following manuscript based on the goal: ${goal}.`,
        { "inlineData": { "mimeType": "application/json", "data": JSON.stringify(schema) } },
        { "text": content.substring(0, 120000) } // Increased character limit for pro model
    ]);

    return JSON.parse(result.response.text() || "{}");
  } catch (err) {
    console.error("Manuscript Analysis Error:", err);
    throw new Error("Failed to analyze the manuscript.");
  }
};

// NOTE: Text-to-Speech and Live Connect are highly specialized and depend on specific model access.
// These are placeholders and may require adjustments based on available models in your GCP project.

export const generateSpeech = async (text: string, voiceName: string = 'Puck') => {
  // This is a placeholder. The actual implementation depends on the specific TTS API or model available.
  // Google Cloud TTS is the recommended production-grade solution.
  console.warn("generateSpeech is a placeholder. No audio will be generated.");
  return ""; // Return empty string or handle appropriately
};

export const connectLive = (callbacks: any, systemInstruction: string) => {
  // This is a placeholder. Live audio streaming is complex and requires a backend service.
  console.warn("connectLive is a placeholder. No live connection will be established.");
  if (callbacks.onerror) {
    callbacks.onerror(new Error("Live connection is not implemented in this version."));
  }
  return null; // Return null or a mock object
};

export const queryInsight = async (message: string): Promise<Message> => {
  try {
    const genAI = getAI();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: "You are an Archive Specialist for carceral narratives. Use Google Search for systemic context.",
      safetySettings,
    });

    const result = await model.generateContent(message);
    const citationMetadata = result.response.candidates?.[0]?.citationMetadata;
    const sources = (citationMetadata?.citationSources || []).map(att => ({
      web: { uri: att.uri || "", title: "" }
    })).filter(s => s.web.uri);

    return { role: 'assistant', content: result.response.text() || "", sources };
  } catch (err) {
    console.error("Query Insight Error:", err);
    return { role: 'assistant', content: "Could not retrieve insights at this time." };
  }
};

export const interactWithAurora = async (message: string): Promise<string> => {
  try {
    const genAI = getAI();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: "You are 'Aurora', a Kindred Agent. Empathetic, calm, creative sanctuary partner.",
      safetySettings,
    });
    const result = await model.generateContent(message);
    return result.response.text() || "I am listening.";
  } catch (err) {
    console.error("Aurora Interaction Error:", err);
    return "I seem to be having trouble connecting right now.";
  }
};

export const generateImage = async (description: string, isScene: boolean = false): Promise<{ imageUrl: string }> => {
  try {
    const genAI = getAI();
    // Using a model with image generation capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", safetySettings });

    const industrialPrompt = isScene 
      ? `Cinematic noir photography. Focus on: ${description}. Dramatic shadows. Industrial carceral aesthetic. High contrast, gritty, realistic.`
      : `Minimalist, a dramatic book cover. Themes: ${description}. Colors: Black, white, orange. Symbolic, powerful, clean design.`;

    const result = await model.generateContent([
      { text: "Generate an image based on the following description:" },
      { text: industrialPrompt },
    ]);
    
    // This is a simplified placeholder for how you might get image data.
    // The actual response structure for image generation might differ.
    // Typically, it might involve a different API or a specific response format.
    console.warn("Image generation is a placeholder. Returning a sample image.");
    return { imageUrl: `https://picsum.photos/seed/${encodeURIComponent(description)}/1024/768` };

  } catch (err) {
    console.error("Generate Image Error:", err);
    return { imageUrl: "https://picsum.photos/seed/error/1024/768" }; // Return a placeholder error image
  }
};

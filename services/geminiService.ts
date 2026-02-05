
import { Message, ManuscriptReport, MasteringGoal } from "../types";

/**
 * SOVEREIGN FORGE - GRACEFUL FALLBACK MODE
 * AI features coming soon. Static site fully operational.
 */

const COMING_SOON = "This feature is currently under construction. The Sovereign Forge AI tools will be available soon.";

export const articulateText = async (text: string) => {
  return { text: COMING_SOON };
};

export const smartSoap = async (text: string, level: string, style?: string, region?: string) => {
  return { text: COMING_SOON };
};

export const queryPartner = async (
  message: string,
  style: string = 'Fiction',
  region: string = 'Australia',
  history: Message[] = [],
  activeSheetContent: string = '',
  personality: string = 'Natural'
): Promise<Message> => {
  return {
    role: 'assistant',
    content: COMING_SOON,
    sources: []
  };
};

export const queryInsight = async (message: string): Promise<Message> => {
  return {
    role: 'assistant',
    content: COMING_SOON,
    sources: []
  };
};

export const interactWithAurora = async (message: string): Promise<string> => {
  return COMING_SOON;
};

export const checkSystemHeartbeat = async () => ({
  status: 'offline' as const,
  message: "AI features coming soon."
});

export const generateSpeech = async (text: string) => "";

export const generateImage = async (prompt: string) => {
  return { imageUrl: "" };
};

export const analyzeFullManuscript = async (content: string, goal: MasteringGoal): Promise<ManuscriptReport> => {
  return {
    summary: COMING_SOON,
    toneAssessment: "Pending",
    structuralCheck: "Pending",
    legalSafetyAudit: "Pending",
    resourceIntensity: 0,
    marketabilityScore: 0,
    suggestedTitle: "Coming Soon",
    mediumSpecificAdvice: COMING_SOON
  };
};

export const connectLive = (callbacks: any, instruction: string) => {
  // Return null - live features disabled
  return null;
};

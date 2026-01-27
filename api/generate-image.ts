
import { generateImage } from '../services/geminiService';

// API endpoint for generating images, such as book covers or cinematic scenes.
// This route uses the centralized `generateImage` service to create visuals based on user prompts.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    // The primary prompt for the image generation.
    const { prompt, isScene } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Request is missing required field: prompt.' });
    }

    // Defer to the centralized service for the core AI logic.
    const result = await generateImage(prompt, isScene || false);

    // Return the successful result from the service.
    res.status(200).json(result);

  } catch (error: any) {
    // Log the detailed error for debugging.
    console.error(`[Sovereign Forge API Error] in /api/generate-image: ${error.message}`, error);

    // Return a structured error to the frontend.
    res.status(500).json({ error: `An error occurred during image generation. ${error.message}` });
  }
}

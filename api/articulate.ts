
import { articulateText } from '../services/geminiService';

// API endpoint for the Articulate (Oral Storytelling Optimization) feature.
// This route takes text and a set of acoustic profile settings, then uses the
// centralized `articulateText` service to refine the text for performance.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    // Destructure all the necessary parameters from the request body.
    const { text, settings, style, region, personality } = req.body;

    // Validate that the essential parameters are present.
    if (!text || !settings || !style || !region) {
      return res.status(400).json({ error: 'Request is missing required fields: text, settings, style, or region.' });
    }

    // Defer to the centralized service to handle the complex AI logic.
    const result = await articulateText(text, settings, style, region, personality);

    // Return the successful result from the service.
    res.status(200).json(result);

  } catch (error: any) {
    // Log the detailed error for server-side debugging.
    console.error(`[Sovereign Forge API Error] in /api/articulate: ${error.message}`, error);

    // Return a structured and informative error message to the frontend.
    res.status(500).json({ error: `An error occurred during the acoustic transformation. ${error.message}` });
  }
}

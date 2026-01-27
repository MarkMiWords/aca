
import { smartSoap } from '../services/geminiService';

// API endpoint for the "Smart Soap" text mastering tools.
// This route handles various levels of text cleaning and polishing,
// from a simple "rinse" to a deep "polish a turd" reconstruction.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    // Destructure all the necessary parameters from the request body.
    const { text, level, style, region, personality } = req.body;

    // Validate that the essential parameters are present.
    if (!text || !level || !style || !region) {
      return res.status(400).json({ error: 'Request is missing required fields: text, level, style, or region.' });
    }

    // Defer to the centralized `smartSoap` service function to perform the AI-powered text manipulation.
    const result = await smartSoap(text, level, style, region, personality);

    // Return the successful result from the service.
    res.status(200).json(result);

  } catch (error: any) {
    // Log the detailed error for server-side debugging.
    console.error(`[Sovereign Forge API Error] in /api/soap: ${error.message}`, error);

    // Return a structured and informative error message to the frontend.
    res.status(500).json({ error: `An error occurred during the text mastering process. ${error.message}` });
  }
}

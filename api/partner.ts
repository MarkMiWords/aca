
import { queryPartner } from '../services/geminiService';
import { Message } from '../types';

// This function acts as the API endpoint for the WRAPPER partner.
// It receives requests from the frontend, validates them, and then
// calls the centralized `queryPartner` function in `geminiService.ts`.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    // Destructure all necessary fields from the request body.
    const { message, style, region, history, activeSheetContent, personality } = req.body;

    // Basic validation to ensure the core pieces of information are present.
    if (!message || !style || !region) {
      return res.status(400).json({ error: 'Request is missing required fields: message, style, or region.' });
    }

    // Defer to the centralized service to handle the complex logic of interacting with the Gemini API.
    const responseMessage: Message = await queryPartner(
      message,
      style,
      region,
      history,
      activeSheetContent,
      personality
    );

    // Send the successful response back to the frontend.
    res.status(200).json(responseMessage);

  } catch (error: any) {
    // Log the full error to the server console for debugging.
    console.error(`[Sovereign Forge API Error] in /api/partner: ${error.message}`, error);

    // Return a generic but helpful error message to the frontend.
    res.status(500).json({ error: `An error occurred while communicating with the AI partner. ${error.message}` });
  }
}

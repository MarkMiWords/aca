
import { queryInsight } from '../services/geminiService';
import { Message } from '../types';

// API endpoint for the Archive Specialist (Insight) feature.
// This route receives a user's query and uses the centralized `queryInsight`
// service to find systemic context related to carceral narratives.
export default async function handler(req: any, res: any) {
  // Ensure the request is a POST request.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { message } = req.body;

    // Validate that a message was provided.
    if (!message) {
      return res.status(400).json({ error: 'Request is missing required field: message.' });
    }

    // Defer to the centralized service for the core AI logic.
    const responseMessage: Message = await queryInsight(message);

    // Send the successful response back to the frontend.
    res.status(200).json(responseMessage);

  } catch (error: any) {
    // Log the detailed error for debugging purposes.
    console.error(`[Sovereign Forge API Error] in /api/insight: ${error.message}`, error);

    // Return a structured error to the frontend.
    res.status(500).json({ error: `An error occurred while communicating with the Archive Specialist. ${error.message}` });
  }
}

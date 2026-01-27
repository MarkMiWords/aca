
// import { performOcr } from '../services/geminiService';

// API endpoint for performing Optical Character Recognition (OCR) on images.
// This is crucial for digitizing text from scanned or photographed carceral documents.
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  // NOTE: This feature is currently disabled as the underlying service function (performOcr) is not implemented.
  return res.status(503).json({ error: 'This feature is temporarily unavailable.' });

  /*
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Request is missing required field: imageBase64.' });
    }

    // Defer to the centralized service to handle the OCR task.
    const extractedText = await performOcr(imageBase64);

    // The service returns the extracted text as a string.
    res.status(200).json({ text: extractedText });

  } catch (error: any) {
    // Log the detailed error for debugging.
    console.error(`[Sovereign Forge API Error] in /api/ocr: ${error.message}`, error);

    // Return a structured error to the frontend.
    res.status(500).json({ error: `An error occurred during OCR processing. ${error.message}` });
  }
  */
}

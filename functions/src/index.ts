
// Correcting the secret handling to resolve deployment error.
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {GoogleGenerativeAI} from "@google/generative-ai";
import * as cors from "cors";

const corsHandler = cors({origin: true});

// The "GEMINI_API_KEY" secret is accessed via process.env.
// This is configured in the onRequest options below.
export const api = onRequest({secrets: ["GEMINI_API_KEY"]}, async (request, response) => {
  corsHandler(request, response, async () => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const {prompt} = request.body;
      if (!prompt) {
        response.status(400).send("Bad Request: prompt is required");
        return;
      }

      logger.info(`Received prompt: ${prompt}`, {structuredData: true});

      // Access the API key from the environment variables populated by the secrets configuration.
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        logger.error("GEMINI_API_KEY secret not set in environment");
        response.status(500).send("Internal Server Error: API key is not configured.");
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({model: "gemini-pro"});

      const result = await model.generateContentStream(prompt);

      response.setHeader("Content-Type", "text/plain");

      for await (const chunk of result.stream) {
        response.write(chunk.text());
      }

      response.end();

    } catch (error) {
      logger.error("Error processing request:", error);
      if (!response.headersSent) {
        response.status(500).send("Internal Server Error");
      }
    }
  });
});

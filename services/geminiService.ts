
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, MODEL_NAME } from '../constants';
import { GenerateContentRequest, GroundingChunk } from '../types';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTeachingContent = async (request: GenerateContentRequest): Promise<{ text: string, groundingMetadata: GroundingChunk[] | null }> => {
  try {
    const { images, role, level, action, persona, language, userPrompt, feedbackContext } = request;

    let specificInstruction = "";
    if (action === 'flashcards') specificInstruction = "Generate 5 flashcards based on the key concepts. Follow format.";
    if (action === 'socratic') specificInstruction = "Don't explain directly. Ask a Socratic question.";
    if (action === 'real_world') specificInstruction = "Create a hands-on real-world project/experiment based on this.";
    if (action === 'debate') specificInstruction = "Play Devil's Advocate. Challenge the concepts.";
    if (action === 'cross_link') specificInstruction = "Connect this topic to 3 unrelated fields (Art, History, Math, etc).";
    if (action === 'diagram') specificInstruction = "Generate a clear, minimal SVG diagram code block (start with <svg> and end with </svg>) that visualizes the main concept. Do not include markdown code fences like ```xml.";

    const contextPrompt = `
      Context Configuration:
      role=${role}
      level=${level}
      action=${action}
      persona=${persona}
      output_language=${language}
      
      User Feedback History (Use this to refine your style):
      ${feedbackContext || "No previous feedback."}
      
      User Instruction:
      ${specificInstruction}
      ${userPrompt || "Analyze the images and perform the requested action."}

      IMPORTANT: 
      1. If the images contain handwritten text, notes, or whiteboard diagrams, pay special attention to accurate transcription and interpretation of the handwriting.
      2. If the handwriting is messy, infer the most logical meaning based on the educational context.
    `;

    // Map all images to content parts
    const imageParts = images.map(img => {
      const base64Data = img.split(',')[1] || img;
      const mimeType = img.match(/:(.*?);/)?.[1] || 'image/jpeg';
      return {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      };
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: action === 'quiz' || action === 'flashcards' ? 0.3 : 0.7,
        tools: [{ googleSearch: {} }] // Enable Grounding
      },
      contents: {
        parts: [
          ...imageParts,
          {
            text: contextPrompt
          }
        ]
      }
    });

    // Extract Grounding Metadata
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata?.groundingChunks || null;

    return {
      text: response.text || "No content generated.",
      groundingMetadata: groundingMetadata as GroundingChunk[] | null
    };

  } catch (error) {
    console.error("Error generating content:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while communicating with the AI.");
  }
};

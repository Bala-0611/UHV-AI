import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UHVAnalysisResult } from "../types";

const SYSTEM_INSTRUCTION = `
You are an AI model that processes handwritten Universal Human Values (UHV) assignments.

Your Tasks:
1. Read the provided student text or handwritten image carefully.
2. Identify and extract: Student Name and Roll Number.
3. Identify answers related to: Role in Self, Role in Family, Role in Society, and Role in Environment.
4. For each section, generate EXACTLY ONE single-sentence statement summarizing the core value.
5. Do NOT list multiple bullet points. The output array for each section must contain only one string.
6. Use simple English.
7. If any section is missing or unclear, infer a meaningful short statement.
8. If fully missing, output: "Not mentioned clearly."
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Student Name or 'Unknown'" },
    rollNo: { type: Type.STRING, description: "Roll Number or 'Unknown'" },
    self: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A single 1-line statement for Role in Self",
    },
    family: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A single 1-line statement for Role in Family",
    },
    society: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A single 1-line statement for Role in Society",
    },
    environment: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A single 1-line statement for Role in Environment",
    },
  },
  required: ["name", "rollNo", "self", "family", "society", "environment"],
};

export const analyzeAssignment = async (input: { text?: string, imageBase64?: string }): Promise<UHVAnalysisResult> => {
  // API Key must be set in your environment variables (e.g., .env file) as API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let contents;
  
  if (input.imageBase64) {
    // If image is provided, send image part + prompt
    contents = {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: input.imageBase64 } },
        { text: "Extract the text from this handwritten assignment and analyze the Universal Human Values as per the system instructions." }
      ]
    };
  } else if (input.text) {
    // If just text
    contents = { parts: [{ text: input.text }] };
  } else {
    throw new Error("No input provided (text or image).");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as UHVAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
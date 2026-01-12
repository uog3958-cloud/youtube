
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ScriptOutline } from "../types";

export const analyzeVideoContent = async (
  apiKey: string,
  videoTitle: string,
  comments: string[]
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the following YouTube video and its comments.
    Video Title: "${videoTitle}"
    Comments: ${comments.slice(0, 40).join(' | ')}
    
    1. Summarize audience sentiment.
    2. Identify top themes.
    3. List improvement points.
    4. Provide exactly 5 highly relevant and trending keywords/topics that would make for a great new video based on this audience's reaction.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
          audienceSentiment: { type: Type.STRING },
          improvementPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendedKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactly 5 keywords" }
        },
        required: ["topThemes", "audienceSentiment", "improvementPoints", "recommendedKeywords"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateScriptOutline = async (
  apiKey: string,
  keyword: string,
  originalContext: string
): Promise<ScriptOutline> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Based on the keyword "${keyword}" and the context of "${originalContext}", create a simple YouTube video script outline.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          concept: { type: Type.STRING },
          outline: {
            type: Type.OBJECT,
            properties: {
              intro: { type: Type.STRING },
              body: { type: Type.ARRAY, items: { type: Type.STRING } },
              outro: { type: Type.STRING }
            },
            required: ["intro", "body", "outro"]
          }
        },
        required: ["title", "concept", "outline"]
      }
    }
  });

  return JSON.parse(response.text);
};


import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeVideoContent = async (
  apiKey: string,
  videoTitle: string,
  comments: string[]
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the following YouTube video and its audience comments to extract insights for new content ideas.
    Video Title: "${videoTitle}"
    Comments: ${comments.slice(0, 30).join(' | ')}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topThemes: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Main topics discussed in comments"
          },
          audienceSentiment: {
            type: Type.STRING,
            description: "Overall sentiment of the audience"
          },
          improvementPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "What viewers felt was missing or could be better"
          },
          contentSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-5 high-potential new video ideas based on this analysis"
          }
        },
        required: ["topThemes", "audienceSentiment", "improvementPoints", "contentSuggestions"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Analysis failed");
  }
};


export interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  viewCount: number;
  subscriberCount: number;
  commentCount: number;
  performanceRatio: number;
  duration?: string; // ISO 8601
}

export interface AnalysisResult {
  topThemes: string[];
  audienceSentiment: string;
  improvementPoints: string[];
  recommendedKeywords: string[]; // 5 keywords for selection
}

export interface ScriptOutline {
  title: string;
  concept: string;
  outline: {
    intro: string;
    body: string[];
    outro: string;
  };
}

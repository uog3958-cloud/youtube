
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
  performanceRatio: number; // View count / Subscriber count
}

export interface AnalysisResult {
  topThemes: string[];
  audienceSentiment: string;
  improvementPoints: string[];
  contentSuggestions: string[];
}

export interface AppState {
  youtubeApiKey: string;
  geminiApiKey: string;
  searchQuery: string;
  isLoading: boolean;
  videos: VideoData[];
  selectedVideo: VideoData | null;
  analysis: AnalysisResult | null;
}


import { VideoData } from '../types';

export const fetchYouTubeVideos = async (
  query: string, 
  apiKey: string, 
  videoDuration: 'any' | 'short' | 'long' = 'any'
): Promise<VideoData[]> => {
  // 1. Search for videos with duration filter
  // short: < 4min, long: > 20min
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=15&order=relevance&videoDuration=${videoDuration}&key=${apiKey}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (searchData.error) throw new Error(searchData.error.message);

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

  // 2. Get video statistics
  const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}&key=${apiKey}`;
  const statsRes = await fetch(statsUrl);
  const statsData = await statsRes.json();

  const channelIds = statsData.items.map((item: any) => item.snippet.channelId).join(',');

  // 3. Get channel statistics
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=${apiKey}`;
  const channelRes = await fetch(channelUrl);
  const channelData = await channelRes.json();

  const channelMap = new Map();
  channelData.items.forEach((item: any) => {
    channelMap.set(item.id, parseInt(item.statistics.subscriberCount) || 1);
  });

  return statsData.items.map((item: any): VideoData => {
    const views = parseInt(item.statistics.viewCount) || 0;
    const subscribers = channelMap.get(item.snippet.channelId) || 1;
    return {
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      viewCount: views,
      subscriberCount: subscribers,
      commentCount: parseInt(item.statistics.commentCount) || 0,
      performanceRatio: views / subscribers,
      duration: item.contentDetails.duration
    };
  });
};

export const fetchComments = async (videoId: string, apiKey: string): Promise<string[]> => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=50&textFormat=plainText&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.items) return [];
    return data.items.map((item: any) => item.snippet.topLevelComment.snippet.textDisplay);
  } catch (e) {
    return [];
  }
};

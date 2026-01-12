
import React, { useState, useCallback } from 'react';
import { fetchYouTubeVideos, fetchComments } from './services/youtubeService';
import { analyzeVideoContent } from './services/geminiService';
import { VideoData, AnalysisResult } from './types';
import { 
  MagnifyingGlassIcon, 
  KeyIcon, 
  ChartBarIcon, 
  LightBulbIcon, 
  ChatBubbleLeftRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [youtubeKey, setYoutubeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  const handleSearch = async () => {
    if (!youtubeKey || !query) {
      alert('YouTube API 키와 검색어를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const results = await fetchYouTubeVideos(query, youtubeKey);
      // Sort by performance ratio descending
      setVideos(results.sort((a, b) => b.performanceRatio - a.performanceRatio));
    } catch (err: any) {
      alert(`에러 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (video: VideoData) => {
    if (!geminiKey) {
      alert('Gemini API 키를 입력해주세요.');
      return;
    }
    setSelectedVideo(video);
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const comments = await fetchComments(video.id, youtubeKey);
      const result = await analyzeVideoContent(geminiKey, video.title, comments);
      setAnalysis(result);
    } catch (err: any) {
      alert(`AI 분석 중 에러: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header & Settings */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-bold text-red-600 flex items-center gap-2">
            <ChartBarIcon className="w-8 h-8" />
            YouTube Strategy AI
          </h1>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <KeyIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="password"
                placeholder="YouTube API Key"
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                value={youtubeKey}
                onChange={(e) => setYoutubeKey(e.target.value)}
              />
            </div>
            <div className="relative flex-1 md:w-48">
              <KeyIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="password"
                placeholder="Gemini API Key"
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 mt-6">
        {/* Search Section */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2">어떤 소재를 찾아볼까요?</h2>
          <p className="text-slate-500 mb-6">구독자 대비 조회수가 높은 "터진 영상"을 분석하여 새로운 전략을 제안합니다.</p>
          <div className="flex gap-2 max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
            <input 
              type="text"
              className="flex-1 px-4 py-3 outline-none text-lg rounded-xl"
              placeholder="검색 키워드를 입력하세요 (예: 아이폰 16 리뷰, 요리 브이로그)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <MagnifyingGlassIcon className="w-5 h-5" />}
              검색
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Results List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <ChartBarIcon className="w-5 h-5 text-red-500" />
              성과 분석 결과 (성과 지수 높은 순)
            </h3>
            {videos.length === 0 && !loading && (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-20 text-center text-slate-400">
                키워드를 검색하여 영상을 찾아보세요.
              </div>
            )}
            {videos.map((video) => (
              <div 
                key={video.id} 
                className={`bg-white rounded-2xl p-4 shadow-sm border transition hover:border-red-300 group ${selectedVideo?.id === video.id ? 'ring-2 ring-red-500' : 'border-slate-100'}`}
              >
                <div className="flex gap-4">
                  <img src={video.thumbnail} className="w-32 h-20 rounded-lg object-cover flex-shrink-0" alt="" />
                  <div className="flex-1">
                    <h4 className="font-bold line-clamp-2 text-slate-800 mb-1">{video.title}</h4>
                    <p className="text-xs text-slate-500 mb-2">{video.channelTitle}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                        조회수: {video.viewCount.toLocaleString()}
                      </div>
                      <div className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">
                        구독자: {video.subscriberCount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between items-end">
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">성능 비율</span>
                      <span className={`text-xl font-black ${video.performanceRatio > 2 ? 'text-green-500' : 'text-slate-700'}`}>
                        x{video.performanceRatio.toFixed(1)}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleAnalyze(video)}
                      className="text-xs bg-slate-900 text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition flex items-center gap-1"
                    >
                      <LightBulbIcon className="w-4 h-4" />
                      AI 분석
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Analysis View */}
          <div className="lg:col-span-5 sticky top-24 self-start">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-6 h-6" />
                  Gemini 전략 분석
                </h3>
                <p className="text-blue-100 text-sm mt-1">시청자의 반응과 니즈를 분석합니다.</p>
              </div>

              <div className="p-6">
                {analyzing ? (
                  <div className="py-20 text-center">
                    <ArrowPathIcon className="w-10 h-10 animate-spin mx-auto text-blue-500 mb-4" />
                    <p className="font-medium text-slate-600">댓글과 반응을 정밀 분석 중...</p>
                    <p className="text-xs text-slate-400 mt-2">Gemini 2.5 Flash가 분석하고 있습니다.</p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase">전체 반응 요약</h4>
                      <p className="bg-slate-50 p-3 rounded-xl text-slate-700 border border-slate-100 italic">
                        "{analysis.audienceSentiment}"
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase">주요 논점</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.topThemes.map((theme, i) => (
                          <span key={i} className="bg-blue-50 text-blue-600 text-xs px-3 py-1.5 rounded-full font-bold border border-blue-100">
                            #{theme}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase">시청자가 아쉬워한 점</h4>
                      <ul className="space-y-2">
                        {analysis.improvementPoints.map((point, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="text-red-400 mt-1 flex-shrink-0">⚠️</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                      <h4 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
                        <LightBulbIcon className="w-5 h-5" />
                        추천하는 새로운 콘텐츠 소재
                      </h4>
                      <div className="space-y-3">
                        {analysis.contentSuggestions.map((suggestion, i) => (
                          <div key={i} className="bg-white p-3 rounded-xl shadow-sm text-slate-800 text-sm font-bold border border-indigo-100 flex items-center gap-3">
                            <span className="bg-indigo-500 text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center flex-shrink-0">
                              {i + 1}
                            </span>
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-400">
                    분석할 영상을 선택하고 <br/> 'AI 분석' 버튼을 눌러주세요.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

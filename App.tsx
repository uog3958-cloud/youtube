
import React, { useState, useMemo } from 'react';
import { fetchYouTubeVideos, fetchComments } from './services/youtubeService';
import { analyzeVideoContent, generateScriptOutline } from './services/geminiService';
import { VideoData, AnalysisResult, ScriptOutline } from './types';
import { 
  MagnifyingGlassIcon, 
  KeyIcon, 
  ChartBarIcon, 
  LightBulbIcon, 
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [youtubeKey, setYoutubeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState(process.env.API_KEY || '');
  const [query, setQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState<'any' | 'short' | 'long'>('any');
  const [minRatio, setMinRatio] = useState(0);
  
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [script, setScript] = useState<ScriptOutline | null>(null);

  const filteredVideos = useMemo(() => {
    return videos.filter(v => v.performanceRatio >= minRatio);
  }, [videos, minRatio]);

  const handleSearch = async () => {
    if (!youtubeKey || !query) {
      alert('YouTube API 키와 검색어를 입력해주세요.');
      return;
    }
    setLoading(true);
    setAnalysis(null);
    setScript(null);
    try {
      const results = await fetchYouTubeVideos(query, youtubeKey, durationFilter);
      setVideos(results.sort((a, b) => b.performanceRatio - a.performanceRatio));
    } catch (err: any) {
      alert(`에러 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (video: VideoData) => {
    if (!geminiKey) {
      alert('Gemini API 키가 필요합니다.');
      return;
    }
    setSelectedVideo(video);
    setAnalyzing(true);
    setAnalysis(null);
    setScript(null);
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

  const handleCreateScript = async (keyword: string) => {
    if (!selectedVideo || !geminiKey) return;
    setGenerating(true);
    try {
      const result = await generateScriptOutline(geminiKey, keyword, selectedVideo.title);
      setScript(result);
    } catch (err: any) {
      alert(`대본 생성 에러: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight">YT STRATEGIST <span className="text-red-600">PRO</span></h1>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <KeyIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input 
                type="password"
                placeholder="YouTube Data API Key"
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-xs focus:ring-2 focus:ring-red-500"
                value={youtubeKey}
                onChange={(e) => setYoutubeKey(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 mt-4">
        {/* Advanced Filters */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-4">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">검색 키워드</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 transition"
                  placeholder="예: 아이폰 16 초기설정"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">영상 길이</label>
              <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                {(['any', 'short', 'long'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDurationFilter(d)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${durationFilter === d ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {d === 'any' ? '전체' : d === 'short' ? '숏폼(<4분)' : '롱폼(>20분)'}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block flex justify-between">
                최소 바이럴 비율 <span>x{minRatio}</span>
              </label>
              <input 
                type="range" 
                min="0" max="10" step="0.5"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                value={minRatio}
                onChange={(e) => setMinRatio(parseFloat(e.target.value))}
              />
            </div>
            <div className="md:col-span-2">
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50 h-[46px]"
              >
                {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "영상 검색"}
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Video List */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-black text-slate-400 flex items-center gap-2 mb-2 uppercase tracking-widest">
              <FunnelIcon className="w-4 h-4" />
              검색된 영상 ({filteredVideos.length})
            </h3>
            <div className="max-h-[800px] overflow-y-auto pr-2 space-y-4 scrollbar-hide">
              {filteredVideos.map((video) => (
                <div 
                  key={video.id} 
                  onClick={() => handleAnalyze(video)}
                  className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${selectedVideo?.id === video.id ? 'ring-2 ring-red-500 border-transparent' : 'border-slate-200'}`}
                >
                  <div className="flex gap-4">
                    <div className="relative flex-shrink-0">
                      <img src={video.thumbnail} className="w-28 h-16 rounded-lg object-cover" alt="" />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-[10px] text-white px-1 rounded font-mono">
                        {video.duration?.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', '')}
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-sm line-clamp-1 text-slate-800">{video.title}</h4>
                      <p className="text-[11px] text-slate-500 mb-2">{video.channelTitle}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold border border-red-100">
                          비율 x{video.performanceRatio.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {video.viewCount >= 10000 ? `${(video.viewCount/10000).toFixed(1)}만회` : `${video.viewCount}회`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis & Script Generation */}
          <div className="lg:col-span-7">
            {!selectedVideo ? (
              <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <ChartBarIcon className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-400">분석할 영상을 선택하세요</h3>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Analysis Card */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                  <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-black">영상 피드백 분석</h3>
                      <p className="text-slate-400 text-xs mt-1">Gemini AI가 실시간 반응을 분석했습니다.</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-xl">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>

                  <div className="p-8">
                    {analyzing ? (
                      <div className="py-12 text-center animate-pulse">
                        <ArrowPathIcon className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
                        <p className="text-slate-500 font-bold">댓글에서 인사이트를 추출하는 중...</p>
                      </div>
                    ) : analysis && (
                      <div className="space-y-8">
                        <div>
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block">시청자 반응 키워드 (클릭하여 대본 생성)</label>
                          <div className="flex flex-wrap gap-2">
                            {analysis.recommendedKeywords.map((kw, i) => (
                              <button 
                                key={i}
                                onClick={() => handleCreateScript(kw)}
                                className="bg-white border-2 border-slate-100 px-4 py-2 rounded-2xl text-sm font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2 group shadow-sm"
                              >
                                <span className="w-5 h-5 bg-slate-100 rounded-full text-[10px] flex items-center justify-center group-hover:bg-blue-100">{i+1}</span>
                                {kw}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                              <ChartBarIcon className="w-4 h-4 text-blue-500" /> 종합 정서
                            </h4>
                            <p className="text-sm leading-relaxed font-medium text-slate-700">{analysis.audienceSentiment}</p>
                          </div>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <h4 className="text-xs font-black text-slate-400 uppercase mb-3 flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-orange-500" /> 시청자 불만/니즈
                            </h4>
                            <ul className="space-y-2">
                              {analysis.improvementPoints.map((p, i) => (
                                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                                  <span className="text-orange-400">•</span> {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Script Card */}
                {(generating || script) && (
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] shadow-2xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-white/20 p-2 rounded-xl">
                          <DocumentTextIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black italic">NEW VIDEO OUTLINE</h3>
                      </div>

                      {generating ? (
                        <div className="py-20 text-center">
                          <ArrowPathIcon className="w-10 h-10 mx-auto animate-spin mb-4 opacity-50" />
                          <p className="text-indigo-100 font-bold">인기 키워드를 기반으로 대본을 구성하고 있습니다...</p>
                        </div>
                      ) : script && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div>
                            <h4 className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Proposed Title</h4>
                            <p className="text-2xl font-black">{script.title}</p>
                          </div>
                          
                          <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                            <h4 className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-2">Strategy Concept</h4>
                            <p className="text-sm text-indigo-50 leading-relaxed">{script.concept}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-black text-indigo-200 uppercase">Intro</h5>
                              <p className="text-xs bg-black/20 p-3 rounded-xl min-h-[80px]">{script.outline.intro}</p>
                            </div>
                            <div className="space-y-2 col-span-1 md:col-span-1">
                              <h5 className="text-[10px] font-black text-indigo-200 uppercase">Key Points</h5>
                              <ul className="text-xs bg-black/20 p-3 rounded-xl min-h-[80px] space-y-2">
                                {script.outline.body.map((b, i) => (
                                  <li key={i} className="flex gap-2">
                                    <span className="text-indigo-300 font-bold">{i+1}.</span> {b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-black text-indigo-200 uppercase">Outro/CTA</h5>
                              <p className="text-xs bg-black/20 p-3 rounded-xl min-h-[80px]">{script.outline.outro}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

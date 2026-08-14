import { useState, useEffect } from 'react';
import { 
  Tv, 
  Search, 
  Key, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Youtube, 
  ExternalLink, 
  Copy, 
  Check, 
  Play, 
  Radio, 
  Code, 
  X,
  Sparkles,
  Video,
  Eye,
  ThumbsUp,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { youtubeApi } from '../services/youtubeApi';
import { VideoStream } from '../data/gospelData';

interface YouTubeApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideo?: (video: VideoStream) => void;
}

export default function YouTubeApiModal({ isOpen, onClose, onSelectVideo }: YouTubeApiModalProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'liveSearch' | 'docs' | 'setup'>('status');
  const [searchQuery, setSearchQuery] = useState('Gospel Live Worship');
  const [isLiveOnly, setIsLiveOnly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    videos: VideoStream[];
    isRealYoutubeData: boolean;
    error?: string;
  } | null>(null);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const hasApiKey = youtubeApi.hasApiKey();

  useEffect(() => {
    if (isOpen) {
      handleSearch();
    }
  }, [isOpen]);

  const handleSearch = async () => {
    setLoading(true);
    const res = await youtubeApi.searchGospelVideos(searchQuery, isLiveOnly);
    setSearchResults(res);
    setLoading(false);
  };

  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isOpen) return null;

  const YOUTUBE_API_ENDPOINTS = [
    {
      name: 'Search Live Gospel Streams',
      endpoint: 'GET https://www.googleapis.com/youtube/v3/search',
      params: '?part=snippet&type=video&eventType=live&q=Gospel+Worship',
      sampleJson: `{\n  "kind": "youtube#searchListResponse",\n  "items": [\n    {\n      "id": { "videoId": "live-stream-01" },\n      "snippet": {\n        "title": "Sunday Worship Live - Grace Cathedral",\n        "channelTitle": "Grace City Gospel",\n        "liveBroadcastContent": "live"\n      }\n    }\n  ]\n}`
    },
    {
      name: 'Fetch Video Statistics & Live Viewers',
      endpoint: 'GET https://www.googleapis.com/youtube/v3/videos',
      params: '?part=statistics,liveStreamingDetails&id=VIDEO_ID',
      sampleJson: `{\n  "items": [\n    {\n      "id": "live-stream-01",\n      "statistics": { "viewCount": "142800", "likeCount": "18400" },\n      "liveStreamingDetails": { "concurrentViewers": "14280" }\n    }\n  ]\n}`
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-[#121212] border border-red-500/30 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-auto"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-red-950/60 to-slate-900 p-5 sm:p-6 border-b border-red-500/20 flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
                <Youtube className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">YouTube Data API v3 Integration Hub</h2>
                  <span className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                    hasApiKey ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {hasApiKey ? <><CheckCircle2 className="w-3 h-3" /> API Active</> : <><AlertTriangle className="w-3 h-3" /> Mock Fallback</>}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fetch live gospel streams, sermons, praise specials & channel statistics via YouTube Data API v3.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto">
            {[
              { id: 'status', label: 'API Key & Status', icon: Key },
              { id: 'liveSearch', label: 'Live YouTube Search Test', icon: Search },
              { id: 'docs', label: 'API Endpoints & JSON', icon: Code },
              { id: 'setup', label: 'Google Cloud Setup Guide', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 shrink-0 border-b-2 ${
                    isActive
                      ? 'bg-slate-900 text-red-400 border-red-500 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">

            {/* TAB 1: STATUS & API KEY CHECK */}
            {activeTab === 'status' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div className="text-xs font-mono uppercase text-slate-400">Environment Variable Variable</div>
                      <div className="text-sm font-bold font-mono text-red-400 mt-0.5">VITE_YOUTUBE_API_KEY</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {hasApiKey ? (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Key Configured</span>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>Using Smart Fallback</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
                    <div className="font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-red-400" />
                      <span>Graceful API Quota & Security Architecture</span>
                    </div>
                    <p>
                      When <code className="text-amber-300 font-mono">VITE_YOUTUBE_API_KEY</code> is set in project secrets, Gospread queries real-time YouTube Data API v3 live streams and statistics. If key is unconfigured or quota limits are met, Gospread seamlessly serves high-quality curated gospel video streams without breaking the UI.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE YOUTUBE SEARCH DEMO */}
            {activeTab === 'liveSearch' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search live gospel, sermons, choir festivals..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setIsLiveOnly(!isLiveOnly)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                          isLiveOnly 
                            ? 'bg-red-500/20 text-red-300 border-red-500/50' 
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        <Radio className={`w-3.5 h-3.5 ${isLiveOnly ? 'text-red-400 animate-pulse' : ''}`} />
                        <span>{isLiveOnly ? 'Live Broadcasts Only' : 'All Videos'}</span>
                      </button>

                      <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-600/20 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>{loading ? 'Searching...' : 'Search'}</span>
                      </button>
                    </div>
                  </div>

                  {searchResults && (
                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2.5">
                      <span>
                        Source: {searchResults.isRealYoutubeData ? '🔴 YouTube Data API v3 (Live)' : '🛡️ Curated Gospel Feed (Fallback)'}
                      </span>
                      <span>{searchResults.videos.length} videos returned</span>
                    </div>
                  )}
                </div>

                {/* Video Results List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults?.videos.map((vid) => (
                    <div key={vid.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-3 hover:border-red-500/40 transition group">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                        <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        {vid.isLive && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                            <Radio className="w-3 h-3 animate-pulse" /> LIVE
                          </span>
                        )}
                        {vid.duration && !vid.isLive && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px]">
                            {vid.duration}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{vid.title}</h4>
                        <p className="text-[11px] text-slate-400">{vid.speakerOrArtist}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-red-400" /> {vid.viewsText}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-emerald-400" /> {vid.likesCount}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (onSelectVideo) {
                            onSelectVideo(vid);
                            onClose();
                          }
                        }}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 mt-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Video</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: API ENDPOINTS & CODE */}
            {activeTab === 'docs' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  YouTube Data API v3 REST request definitions used inside <code className="text-amber-300 font-mono">src/services/youtubeApi.ts</code>:
                </p>

                <div className="space-y-3">
                  {YOUTUBE_API_ENDPOINTS.map((ep, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-white">{ep.name}</div>
                        <button
                          onClick={() => handleCopyCode(ep.sampleJson, idx)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition flex items-center gap-1"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Sample Response</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-red-300 border border-slate-800">
                        {ep.endpoint}
                      </div>

                      <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-300 border border-slate-800/80 overflow-x-auto">
                        {ep.sampleJson}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: GOOGLE CLOUD SETUP */}
            {activeTab === 'setup' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-400" />
                    <span>How to generate a YouTube Data API v3 Key</span>
                  </h3>

                  <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
                    <li>Go to the <strong className="text-white">Google Cloud Console</strong> (console.cloud.google.com).</li>
                    <li>Create or select a Cloud Project for your Gospel Application.</li>
                    <li>Navigate to <strong className="text-white">APIs & Services &gt; Library</strong>.</li>
                    <li>Search for <strong className="text-red-400">YouTube Data API v3</strong> and click <strong className="text-white">Enable</strong>.</li>
                    <li>Go to <strong className="text-white">APIs & Services &gt; Credentials</strong> and click <strong className="text-white">Create Credentials &gt; API Key</strong>.</li>
                    <li>Add your key to the project secrets as <code className="text-amber-300 font-mono">VITE_YOUTUBE_API_KEY</code>.</li>
                  </ol>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="bg-slate-900/90 border-t border-slate-800 p-4 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span>YouTube Data API v3 Hub Active</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

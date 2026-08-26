import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Mic, 
  X, 
  History, 
  TrendingUp, 
  Video, 
  Headphones, 
  User, 
  BookOpen, 
  Filter, 
  SlidersHorizontal, 
  Trash2, 
  Clock, 
  Radio, 
  Play, 
  Check, 
  ArrowRight,
  Tv,
  Sparkles,
  Volume2,
  MicOff,
  Flame,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoStream, AudioTrack, LIVE_VIDEO_STREAMS, AUDIO_TRACKS, SUBSCRIPTION_CHANNELS } from '../data/gospelData';
import { youtubeApi } from '../services/youtubeApi';

interface SearchEngineOverlayProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectVideo: (video: VideoStream) => void;
  onSelectAudioTrack: (track: AudioTrack) => void;
  onSelectChannel: (channelName: string) => void;
  activeVideo: VideoStream | null;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  subscribedChannels: string[];
  onDownloadVideo?: (video: VideoStream) => void;
}

export type SearchFilterType = 'all' | 'videos' | 'audio' | 'channels' | 'scriptures';
export type SearchSortBy = 'relevance' | 'newest' | 'views';
export type SearchDuration = 'any' | 'short' | 'medium' | 'long';

export const SearchEngineOverlay: React.FC<SearchEngineOverlayProps> = ({
  searchQuery,
  setSearchQuery,
  onSelectVideo,
  onSelectAudioTrack,
  onSelectChannel,
  activeVideo,
  selectedCategory,
  setSelectedCategory,
  subscribedChannels,
  onDownloadVideo,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<SearchFilterType>('all');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [sortBy, setSortBy] = useState<SearchSortBy>('relevance');
  const [durationFilter, setDurationFilter] = useState<SearchDuration>('any');
  const [liveOnly, setLiveOnly] = useState(false);
  const [ytVideos, setYtVideos] = useState<VideoStream[]>(LIVE_VIDEO_STREAMS);
  const [ytAudio, setYtAudio] = useState<AudioTrack[]>(AUDIO_TRACKS);

  useEffect(() => {
    let active = true;
    const fetchYoutube = async () => {
      const queryTerm = searchQuery.trim() || 'Gospel Live Worship Sermon';
      const videoRes = await youtubeApi.searchGospelVideos(queryTerm, liveOnly);
      if (active && videoRes.videos && videoRes.videos.length > 0) {
        setYtVideos(videoRes.videos);
      }

      const audioRes = await youtubeApi.searchGospelAudio(searchQuery.trim() || 'Gospel Worship Podcast Audio Sermon');
      if (active && audioRes.tracks && audioRes.tracks.length > 0) {
        setYtAudio(audioRes.tracks);
      }
    };
    fetchYoutube();
    return () => { active = false; };
  }, [searchQuery, liveOnly, isOpen]);

  // Search History State from localStorage
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gospread_search_history');
      return saved ? JSON.parse(saved) : ['Worship & Word', 'Pastor Mark Anthony', '24/7 Gospel Radio', 'Healing Promises', 'Grace Choir'];
    } catch {
      return ['Worship & Word', 'Pastor Mark Anthony', '24/7 Gospel Radio', 'Healing Promises', 'Grace Choir'];
    }
  });

  // Voice Search Modal State
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard Shortcut: Cmd+K or Ctrl+K or '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' && document.activeElement !== searchInputRef.current) || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setShowFilterOptions(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save history to localStorage
  const addSearchToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 10);
      localStorage.setItem('gospread_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const removeHistoryItem = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory(prev => {
      const updated = prev.filter(item => item.toLowerCase() !== term.toLowerCase());
      localStorage.setItem('gospread_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('gospread_search_history');
  };

  const handleExecuteSearch = (queryToExecute?: string) => {
    const query = queryToExecute !== undefined ? queryToExecute : searchQuery;
    if (query.trim()) {
      addSearchToHistory(query);
    }
    setIsOpen(false);
    setShowFilterOptions(false);
  };

  // Trending searches list
  const trendingSearches = [
    'Sunday Live Worship',
    'Dr. Elizabeth Vance Sermons',
    '24/7 Worship Radio',
    'Hebrews 11 Faith',
    'Mass Gospel Choir Festival',
    'Night Prayer & Intercession'
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Voice Search Recognition setup
  const startVoiceSearch = () => {
    setIsVoiceSearchOpen(true);
    setIsListening(true);
    setVoiceTranscript('Listening... Speak a speaker, song, or sermon topic');

    // Check if SpeechRecognition is available in browser
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition || 
                              (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setVoiceTranscript(transcript);
          setSearchQuery(transcript);
        };

        recognition.onerror = () => {
          simulateVoiceSearchFallback();
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch {
        simulateVoiceSearchFallback();
      }
    } else {
      simulateVoiceSearchFallback();
    }
  };

  const simulateVoiceSearchFallback = () => {
    const sampleVoiceQueries = [
      'Worship & Word Pastor Mark Anthony',
      'The Power of Unshakeable Faith',
      '24/7 Gospel Praise Radio',
      'Victory Praise Symphony',
      'Divine Healing & Rest Sermons'
    ];
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      if (step === 1) setVoiceTranscript('Listening for gospel stream...');
      else if (step === 2) setVoiceTranscript('"Pastor Mark Anthony Live..."');
      else if (step >= 3) {
        const randomQuery = sampleVoiceQueries[Math.floor(Math.random() * sampleVoiceQueries.length)];
        setVoiceTranscript(`"${randomQuery}"`);
        setSearchQuery(randomQuery);
        setIsListening(false);
        clearInterval(interval);
      }
    }, 900);
  };

  // Filter video results
  const matchingVideos = ytVideos.filter(v => {
    if (liveOnly && !v.isLive) return false;

    // Duration filter calculation
    if (durationFilter === 'short' && v.duration && (v.duration.includes('1:') || parseInt(v.duration) > 15)) return false;
    if (durationFilter === 'long' && v.duration && parseInt(v.duration) < 40) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      v.title.toLowerCase().includes(q) ||
      v.speakerOrArtist.toLowerCase().includes(q) ||
      v.churchOrMinistry.toLowerCase().includes(q) ||
      (v.description && v.description.toLowerCase().includes(q)) ||
      (v.bibleVerse && v.bibleVerse.toLowerCase().includes(q))
    );
  });

  // Filter audio results
  const matchingAudio = ytAudio.filter(a => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      a.artistOrPreacher.toLowerCase().includes(q) ||
      a.albumOrSeries.toLowerCase().includes(q) ||
      (a.category && a.category.toLowerCase().includes(q)) ||
      (a.tags && a.tags.some(t => t.toLowerCase().includes(q)))
    );
  });

  // Filter channels results
  const matchingChannels = SUBSCRIPTION_CHANNELS.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q);
  });

  // Scripture matches
  const matchingScriptures = LIVE_VIDEO_STREAMS.filter(v => v.bibleVerse && searchQuery.trim() && v.bibleVerse.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    .concat(AUDIO_TRACKS.filter(a => a.scriptureVerses && searchQuery.trim() && a.scriptureVerses.some(s => s.reference.toLowerCase().includes(searchQuery.toLowerCase().trim()) || s.text.toLowerCase().includes(searchQuery.toLowerCase().trim()))) as any);

  const totalResultsCount = matchingVideos.length + matchingAudio.length + matchingChannels.length;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      {/* Redesigned Search Bar Container */}
      <div className={`relative flex items-center bg-[#111113] border transition-all duration-200 rounded-full p-1 pl-2.5 ${
        isOpen 
          ? 'border-amber-500/80 ring-2 ring-amber-500/20 shadow-xl shadow-amber-500/10' 
          : 'border-slate-800 hover:border-slate-700/90'
      }`}>
        {/* Left Search Icon Focal Point */}
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
          <Search className="w-3.5 h-3.5" />
        </div>

        {/* Text Input */}
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleExecuteSearch();
            }
          }}
          placeholder="Search sermons, ministers, songs, or scriptures..."
          className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 px-2.5 py-1.5 focus:outline-none font-medium"
        />

        {/* Shortcut Badge (⌘K) when input is empty */}
        {!searchQuery && !isOpen && (
          <div className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-500 font-mono shrink-0 mr-1 select-none">
            <span>⌘K</span>
          </div>
        )}

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition mr-0.5"
            title="Clear search text"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Voice Search Button - Integrated Inside Bar */}
        <button
          onClick={startVoiceSearch}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition mr-0.5 group relative"
          title="Voice Search Gospel Streams"
        >
          <Mic className="w-3.5 h-3.5 group-hover:scale-110 transition" />
        </button>

        {/* Filter Drawer Toggle Icon */}
        <button
          onClick={() => setShowFilterOptions(!showFilterOptions)}
          className={`p-1.5 rounded-full transition mr-1 relative ${
            showFilterOptions || liveOnly || durationFilter !== 'any' || sortBy !== 'relevance'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Advanced Search Filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {(liveOnly || durationFilter !== 'any' || sortBy !== 'relevance') && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        {/* Redesigned Execute Search Action Button */}
        <button
          onClick={() => handleExecuteSearch()}
          className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 px-3.5 py-1.5 rounded-full text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition shrink-0"
          title="Execute Search"
        >
          <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Advanced Filter Drawer Bar */}
      <AnimatePresence>
        {showFilterOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="fixed inset-x-3 top-16 sm:absolute sm:left-0 sm:right-0 sm:top-12 z-50 p-3.5 rounded-2xl bg-[#18181b]/98 backdrop-blur-xl border border-amber-500/40 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Gospel Results
              </span>
              <button
                onClick={() => {
                  setSortBy('relevance');
                  setDurationFilter('any');
                  setLiveOnly(false);
                }}
                className="text-[10px] text-slate-400 hover:text-white underline"
              >
                Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Sort By */}
              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SearchSortBy)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest First</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1">Duration</label>
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value as SearchDuration)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="any">Any Duration</option>
                  <option value="short">Short (&lt; 15m)</option>
                  <option value="medium">Medium (15 - 45m)</option>
                  <option value="long">Long (&gt; 45m)</option>
                </select>
              </div>

              {/* Live Toggle */}
              <div>
                <label className="text-[10px] text-slate-400 font-medium block mb-1">Status</label>
                <button
                  onClick={() => setLiveOnly(!liveOnly)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1 ${
                    liveOnly ? 'bg-red-600 text-white border-red-500' : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  <Tv className="w-3 h-3" />
                  <span>{liveOnly ? 'Live Only' : 'All Broadcasts'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instant Search Results / Suggestions Dropdown Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-3 top-16 sm:absolute sm:left-0 sm:right-0 sm:top-12 z-50 bg-[#121215]/98 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[75vh] sm:max-h-[520px] flex flex-col"
          >
            {/* Quick Filter Category Pills */}
            <div className="p-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-900/60">
              {(['all', 'videos', 'audio', 'channels', 'scriptures'] as SearchFilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition whitespace-nowrap shrink-0 ${
                    activeFilter === filter
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter === 'all' && 'All Results'}
                  {filter === 'videos' && `Videos (${matchingVideos.length})`}
                  {filter === 'audio' && `Audio (${matchingAudio.length})`}
                  {filter === 'channels' && `Channels (${matchingChannels.length})`}
                  {filter === 'scriptures' && 'Scriptures'}
                </button>
              ))}
            </div>

            {/* Scrollable Overlay Content */}
            <div className="overflow-y-auto p-3 space-y-4 custom-scrollbar">
              {/* If search query is empty: Show Recent Search History & Trending Terms */}
              {!searchQuery.trim() ? (
                <>
                  {/* Recent Searches */}
                  {searchHistory.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <History className="w-3.5 h-3.5 text-amber-400" /> Recent Searches
                        </span>
                        <button
                          onClick={clearAllHistory}
                          className="text-[10px] text-slate-500 hover:text-red-400 transition flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Clear
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {searchHistory.map((term) => (
                          <div
                            key={term}
                            onClick={() => {
                              setSearchQuery(term);
                              handleExecuteSearch(term);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 flex items-center gap-2 cursor-pointer transition group"
                          >
                            <Clock className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                            <span>{term}</span>
                            <button
                              onClick={(e) => removeHistoryItem(term, e)}
                              className="text-slate-600 hover:text-slate-300 p-0.5 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Searches */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Trending Gospel Topics
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {trendingSearches.map((trend) => (
                        <div
                          key={trend}
                          onClick={() => {
                            setSearchQuery(trend);
                            handleExecuteSearch(trend);
                          }}
                          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 text-xs text-slate-200 flex items-center justify-between cursor-pointer transition group"
                        >
                          <div className="flex items-center gap-2">
                            <Flame className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition" />
                            <span className="font-medium">{trend}</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                /* When search query is entered: Show Live Filtered Instant Search Results */
                <div className="space-y-4">
                  {/* Results Count Summary */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-800">
                    <span>
                      Found <strong className="text-amber-400">{totalResultsCount}</strong> matches for "{searchQuery}"
                    </span>
                    <button
                      onClick={() => handleExecuteSearch()}
                      className="text-amber-400 hover:underline font-bold text-[11px]"
                    >
                      View All Results &rarr;
                    </button>
                  </div>

                  {/* Matching Video Streams Section */}
                  {(activeFilter === 'all' || activeFilter === 'videos') && matchingVideos.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <Video className="w-3.5 h-3.5 text-red-500" /> Video Streams & Sermons ({matchingVideos.length})
                      </span>
                      <div className="space-y-2">
                        {matchingVideos.slice(0, 4).map((video) => (
                          <div
                            key={video.id}
                            className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 transition flex items-center gap-3 cursor-pointer group"
                          >
                            <div 
                              onClick={() => {
                                onSelectVideo(video);
                                addSearchToHistory(searchQuery);
                                setIsOpen(false);
                              }}
                              className="relative w-20 aspect-video rounded-lg overflow-hidden bg-slate-950 shrink-0"
                            >
                              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                              {video.isLive ? (
                                <span className="absolute bottom-1 right-1 px-1 bg-red-600 text-white font-extrabold text-[8px] rounded uppercase">
                                  LIVE
                                </span>
                              ) : (
                                <span className="absolute bottom-1 right-1 px-1 bg-black/80 text-white font-mono text-[8px] rounded">
                                  {video.duration}
                                </span>
                              )}
                            </div>
                            <div 
                              onClick={() => {
                                onSelectVideo(video);
                                addSearchToHistory(searchQuery);
                                setIsOpen(false);
                              }}
                              className="flex-1 min-w-0"
                            >
                              <h5 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition">
                                {video.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {video.speakerOrArtist} • {video.churchOrMinistry}
                              </p>
                              {video.bibleVerse && (
                                <p className="text-[9px] text-amber-300/80 truncate mt-0.5 italic">
                                  📖 {video.bibleVerse}
                                </p>
                              )}
                            </div>
                            {onDownloadVideo && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDownloadVideo(video);
                                  setIsOpen(false);
                                }}
                                className="p-2 rounded-lg bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition shrink-0"
                                title="Download video"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Audio Tracks Section */}
                  {(activeFilter === 'all' || activeFilter === 'audio') && matchingAudio.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <Headphones className="w-3.5 h-3.5 text-amber-400" /> Audio Sermons & Worship ({matchingAudio.length})
                      </span>
                      <div className="space-y-2">
                        {matchingAudio.slice(0, 3).map((track) => (
                          <div
                            key={track.id}
                            onClick={() => {
                              onSelectAudioTrack(track);
                              addSearchToHistory(searchQuery);
                              setIsOpen(false);
                            }}
                            className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 transition flex items-center gap-3 cursor-pointer group"
                          >
                            <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition">
                                {track.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 truncate">
                                {track.artistOrPreacher} • {track.category}
                              </p>
                            </div>
                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                              Listen
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Channels Section */}
                  {(activeFilter === 'all' || activeFilter === 'channels') && matchingChannels.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <User className="w-3.5 h-3.5 text-blue-400" /> Channels & Ministries ({matchingChannels.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchingChannels.map((channel) => (
                          <div
                            key={channel.name}
                            onClick={() => {
                              onSelectChannel(channel.name);
                              addSearchToHistory(searchQuery);
                              setIsOpen(false);
                            }}
                            className="p-2 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800/80 transition flex items-center justify-between gap-2 cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <img src={channel.avatar} alt={channel.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                              <div className="truncate">
                                <h5 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition">
                                  {channel.name}
                                </h5>
                                <p className="text-[9px] text-slate-400 truncate">
                                  {channel.liveNow ? '🔴 Live Broadcast' : 'Verified Gospel Ministry'}
                                </p>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded-full shrink-0">
                              View
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scripture Key Matches */}
                  {(activeFilter === 'all' || activeFilter === 'scriptures') && matchingScriptures.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Scripture Key Matches ({matchingScriptures.length})
                      </span>
                      <div className="space-y-1.5">
                        {matchingScriptures.slice(0, 3).map((item: any, idx: number) => (
                          <div
                            key={idx}
                            onClick={() => {
                              if (item.thumbnail) onSelectVideo(item);
                              else onSelectAudioTrack(item);
                              setIsOpen(false);
                            }}
                            className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition cursor-pointer"
                          >
                            <p className="text-xs font-serif italic text-amber-200">
                              "{item.bibleVerse || (item.scriptureVerses && item.scriptureVerses[0]?.text)}"
                            </p>
                            <span className="text-[10px] text-amber-400 font-bold block mt-1">
                              Related: {item.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results Found State */}
                  {totalResultsCount === 0 && (
                    <div className="py-8 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-xs text-slate-300 font-bold">No gospel streams found for "{searchQuery}"</p>
                      <p className="text-[11px] text-slate-500">
                        Try searching for "Worship", "Sermon", "Faith", or a minister's name.
                      </p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-3 py-1 bg-amber-500 text-slate-950 rounded-full text-xs font-bold hover:bg-amber-400 transition mt-2"
                      >
                        Reset Search Query
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Search Animated Modal Dialog */}
      <AnimatePresence>
        {isVoiceSearchOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#18181b] border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsVoiceSearchOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5">
                  <Mic className="w-4 h-4 animate-bounce text-amber-400" /> Voice Search Engine
                </span>
                <h3 className="text-lg font-bold text-white">Speak Your Gospel Query</h3>
              </div>

              {/* Pulsing Mic Circle Visualizer */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-amber-500/30 animate-pulse" />
                  </>
                )}
                <div className="relative z-10 w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Mic className="w-8 h-8" />
                </div>
              </div>

              {/* Audio Waves Simulation */}
              <div className="flex items-center justify-center gap-1 h-8">
                {[40, 70, 30, 90, 50, 80, 40].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={isListening ? { height: [10, h, 10] } : { height: 6 }}
                    transition={{ repeat: Infinity, duration: 0.6 + i * 0.1 }}
                    className="w-1.5 bg-amber-400 rounded-full"
                  />
                ))}
              </div>

              <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 min-h-[50px] flex items-center justify-center">
                <p className="text-xs font-mono text-amber-300 italic">{voiceTranscript}</p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsVoiceSearchOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-full hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsVoiceSearchOpen(false);
                    handleExecuteSearch();
                  }}
                  className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-full hover:bg-amber-400 transition shadow-lg shadow-amber-500/20"
                >
                  Done & Search
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

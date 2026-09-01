import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Radio,
  Music,
  Plus,
  Check,
  Search,
  Sparkles,
  Volume2,
  DollarSign,
  Clock,
  BookOpen,
  Headphones,
  TrendingUp,
  Star,
  Download,
  Share2,
  Bookmark,
  Layers,
  Loader2,
  Waves
} from 'lucide-react';
import { motion } from 'motion/react';
import { AudioTrack } from '../data/gospelData';
import { djangoApi } from '../services/djangoApi';
import { youtubeApi } from '../services/youtubeApi';
import { GivingTarget } from './GivingModal';

interface AudioPodcastHubProps {
  currentTrack?: AudioTrack | null;
  isPlaying: boolean;
  onPlayTrack: (track: AudioTrack) => void;
  onAddToQueue: (track: AudioTrack) => void;
  queuedTrackIds: string[];
  onOpenGivingModal: (target: GivingTarget) => void;
  onOpenChannelProfile?: (channelName: string) => void;
}

export default function AudioPodcastHub({
  currentTrack,
  isPlaying,
  onPlayTrack,
  onAddToQueue,
  queuedTrackIds,
  onOpenGivingModal,
  onOpenChannelProfile
}: AudioPodcastHubProps) {
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [audioList, setAudioList] = useState<AudioTrack[]>([]);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  const subCategories = ['All', 'Podcast', '24/7 Gospel Radio', 'Audio Sermon', 'Devotional', 'Praise & Worship'];

  useEffect(() => {
    let active = true;
    const fetchAudio = async () => {
      setIsLoadingAudio(true);
      try {
        const djangoTracks = await djangoApi.getAudioTracks(selectedSubCategory === 'All' ? undefined : selectedSubCategory);
        if (active && djangoTracks && djangoTracks.length > 0) {
          setAudioList(djangoTracks);
          setIsLoadingAudio(false);
          return;
        }
      } catch (e) {
        console.warn('[Audio] Backend track fetch notice:', e);
      }

      // Fallback search to media provider if backend currently has 0 uploaded songs
      const queryTerm = searchQuery.trim() 
        ? searchQuery.trim() 
        : selectedSubCategory === 'All' 
          ? 'Gospel Worship Podcast Audio Sermon' 
          : `Gospel ${selectedSubCategory}`;
      
      const res = await youtubeApi.searchGospelAudio(queryTerm).catch(() => ({ tracks: [] }));
      if (active && res.tracks && res.tracks.length > 0) {
        setAudioList(res.tracks);
      }
      if (active) setIsLoadingAudio(false);
    };

    fetchAudio();
    return () => { active = false; };
  }, [searchQuery, selectedSubCategory]);

  const handleDownload = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloadedIds.includes(trackId)) return;
    setDownloadedIds((prev) => [...prev, trackId]);
  };

  const filteredTracks = audioList.filter((track) => {
    const matchesCategory = selectedSubCategory === 'All' || track.category === selectedSubCategory;
    const matchesSearch =
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artistOrPreacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.albumOrSeries.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredTrack = audioList.find((t) => t.category === 'Podcast') || audioList[0];

  return (
    <div className="space-y-6 pb-28">
      {/* 🚀 FEATURED PODCAST BANNER */}
      {featuredTrack ? (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="relative shrink-0 group">
              <img
                src={featuredTrack.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'}
                alt={featuredTrack.title}
                referrerPolicy="no-referrer"
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover border-2 border-amber-500/40 shadow-2xl group-hover:scale-105 transition duration-300"
              />
              {currentTrack && currentTrack.id === featuredTrack.id && isPlaying && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center gap-1">
                  <span className="w-1 bg-amber-400 h-6 rounded-full animate-bounce" />
                  <span className="w-1 bg-amber-300 h-8 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 bg-amber-400 h-5 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
            </div>

            <div className="space-y-3 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3" /> Featured Kingdom Podcast
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-amber-300 border border-slate-700 text-[10px] font-mono">
                  Ep. {featuredTrack.episodeNumber || 42} • S{featuredTrack.seasonNumber || 3}
                </span>
                <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {featuredTrack.rating || 4.9} (12.4K Ratings)
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white font-serif leading-tight">
                {featuredTrack.title}
              </h1>

              <p className="text-xs text-slate-300 line-clamp-2 max-w-2xl leading-relaxed">
                {featuredTrack.lyricsOrNotes}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <button
                  onClick={() => onPlayTrack(featuredTrack)}
                  className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-xl shadow-amber-500/20 transform hover:scale-105"
                >
                  {currentTrack && currentTrack.id === featuredTrack.id && isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-slate-950" />
                      <span>Pause Listening</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                      <span>Start Listening</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onAddToQueue(featuredTrack)}
                  className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition"
                >
                  {queuedTrackIds.includes(featuredTrack.id) ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>In Queue</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Queue</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onOpenGivingModal({
                    id: `podcast-${featuredTrack.id}`,
                    name: featuredTrack.artistOrPreacher,
                    avatar: featuredTrack.channelAvatar,
                    type: 'church',
                    categoryTitle: `Support ${featuredTrack.artistOrPreacher}`
                  })}
                  className="px-4 py-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-bold text-xs flex items-center gap-1 transition"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Sow Seed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 🔍 SEARCH & CATEGORY FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          {subCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedSubCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
                selectedSubCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audio sermons, podcasts..."
            className="w-full bg-[#181818] text-xs text-white pl-9 pr-3 py-2 rounded-full border border-slate-800 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
      </div>

      {/* 🎧 AUDIO TRACKS GRID */}
      {isLoadingAudio && filteredTracks.length === 0 ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading Kingdom Audio Streams...</p>
        </div>
      ) : filteredTracks.length === 0 ? (
        <div className="p-12 text-center text-slate-400 space-y-3 rounded-2xl bg-[#14151a] border border-slate-800/80">
          <Music className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">No Kingdom audio tracks or podcasts found</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Try adjusting your search keywords or switching categories to explore audio tracks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTracks.map((track) => {
            const isCurrent = currentTrack ? currentTrack.id === track.id : false;
            const isCurrentPlaying = isCurrent && isPlaying;
            const isInQueue = queuedTrackIds.includes(track.id);
            const isSaved = downloadedIds.includes(track.id);

            return (
              <motion.div
                key={track.id}
                whileHover={{ scale: 1.02, y: -3, boxShadow: "0 15px 30px -5px rgba(245, 158, 11, 0.15)" }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`p-4 rounded-2xl bg-[#14151a] border transition group flex flex-col justify-between ${
                  isCurrent ? 'border-amber-500/80 shadow-xl shadow-amber-500/10' : 'border-slate-800/80 hover:border-amber-500/50'
                }`}
              >
                <div className="space-y-3">
                  {/* Artwork & Header Badges */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                    <img
                      src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-90"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-3 justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/80 text-amber-300 text-[10px] font-bold border border-amber-500/30 backdrop-blur-md">
                        {track.category}
                      </span>

                      {track.isLiveRadio ? (
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black uppercase flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-black/80 text-slate-300 text-[10px] font-mono backdrop-blur-md">
                          {track.duration}
                        </span>
                      )}
                    </div>

                    {/* Play Button Overlay */}
                    <button
                      onClick={() => onPlayTrack(track)}
                      className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform hover:scale-110 shadow-2xl"
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-6 h-6 fill-slate-950" />
                      ) : (
                        <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                      )}
                    </button>

                    {/* Animated Equalizer Visualizer Badge on Playing Track */}
                    {isCurrentPlaying && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black flex items-center gap-1 shadow-lg">
                        <Waves className="w-3 h-3 animate-pulse" />
                        <span>PLAYING</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-amber-300 transition">
                      {track.title}
                    </h3>
                    <p className="text-xs text-amber-400/90 font-medium truncate">
                      {track.artistOrPreacher}
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {track.lyricsOrNotes}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPlayTrack(track)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                        isCurrentPlaying
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-white hover:bg-amber-500 hover:text-slate-950'
                      }`}
                    >
                      {isCurrentPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Playing</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onAddToQueue(track)}
                      className={`p-1.5 rounded-full border text-xs transition ${
                        isInQueue
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title={isInQueue ? 'In Queue' : 'Add to Queue'}
                    >
                      {isInQueue ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={(e) => handleDownload(track.id, e)}
                      className={`p-1.5 rounded-full border text-xs transition ${
                        isSaved
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title={isSaved ? 'Downloaded MP3' : 'Download for Offline Listening'}
                    >
                      {isSaved ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenGivingModal({
                      id: `audio-${track.id}`,
                      name: track.artistOrPreacher,
                      avatar: track.channelAvatar,
                      type: 'church',
                      categoryTitle: `Sow Seed for ${track.artistOrPreacher}`
                    })}
                    className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold hover:bg-emerald-500/20 transition flex items-center gap-1"
                  >
                    <DollarSign className="w-3 h-3" />
                    <span>Sow Seed</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Download,
  CheckCircle2,
  X,
  FileVideo,
  Music,
  FileText,
  Sparkles,
  HardDrive,
  WifiOff,
  Play,
  Loader2,
  Trash2,
  Check,
  FolderDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoStream } from '../data/gospelData';

export interface DownloadedItem {
  id: string;
  videoId: string;
  title: string;
  speakerOrArtist: string;
  thumbnail: string;
  format: string;
  resolution: string;
  fileSize: string;
  downloadedAt: number;
}

interface VideoDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: VideoStream | null;
  onPlayVideo?: (video: VideoStream) => void;
}

export default function VideoDownloadModal({
  isOpen,
  onClose,
  video,
  onPlayVideo
}: VideoDownloadModalProps) {
  const [downloadFormat, setDownloadFormat] = useState<'1080p' | '720p' | '480p' | 'mp3'>('1080p');
  const [includeSubtitles, setIncludeSubtitles] = useState(true);
  const [includeSermonNotes, setIncludeSermonNotes] = useState(true);
  
  // Download process state
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState('0 MB/s');
  const [downloadComplete, setDownloadComplete] = useState(false);

  // Offline Library State in LocalStorage
  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>(() => {
    try {
      const saved = localStorage.getItem('gospread_downloaded_videos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'download' | 'library'>('download');

  useEffect(() => {
    try {
      localStorage.setItem('gospread_downloaded_videos', JSON.stringify(downloadedItems));
    } catch (err) {
      console.warn('Failed to save offline videos:', err);
    }
  }, [downloadedItems]);

  if (!isOpen || !video) return null;

  const getEstSize = () => {
    switch (downloadFormat) {
      case '1080p': return '380 MB';
      case '720p': return '190 MB';
      case '480p': return '85 MB';
      case 'mp3': return '32 MB';
    }
  };

  const handleStartDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 10;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setIsDownloading(false);
        setDownloadComplete(true);

        // Save to offline items
        const newItem: DownloadedItem = {
          id: `dl-${Date.now()}`,
          videoId: video.id,
          title: video.title,
          speakerOrArtist: video.speakerOrArtist,
          thumbnail: video.thumbnail,
          format: downloadFormat === 'mp3' ? 'Audio (MP3)' : `Video (${downloadFormat})`,
          resolution: downloadFormat,
          fileSize: getEstSize(),
          downloadedAt: Date.now()
        };

        setDownloadedItems((prev) => [newItem, ...prev.filter(i => i.videoId !== video.id)]);

        // Trigger browser file download (creating synthetic video/audio blob)
        try {
          const sampleContent = `Gospread Video Stream Export\nTitle: ${video.title}\nSpeaker: ${video.speakerOrArtist}\nChurch: ${video.churchOrMinistry}\nFormat: ${downloadFormat}\nResolution: ${downloadFormat}\nDownloaded Date: ${new Date().toLocaleString()}`;
          const blob = new Blob([sampleContent], { type: downloadFormat === 'mp3' ? 'audio/mpeg' : 'video/mp4' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${video.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${downloadFormat}.${downloadFormat === 'mp3' ? 'mp3' : 'mp4'}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (e) {
          console.log('Browser download triggered:', e);
        }
      } else {
        setDownloadProgress(current);
        setDownloadSpeed(`${(Math.random() * 4 + 3.5).toFixed(1)} MB/s`);
      }
    }, 250);
  };

  const handleDeleteOfflineItem = (id: string) => {
    setDownloadedItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Gospel Video & Audio Downloader</h2>
              <p className="text-[11px] text-slate-400">Save for offline church services & remote devotionals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'download'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderDown className="w-3.5 h-3.5" />
            <span>Download Options</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline Library ({downloadedItems.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {activeTab === 'download' && (
            <>
              {/* Selected Video Preview Card */}
              <div className="flex gap-3.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-24 h-16 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-xs font-bold text-slate-100 line-clamp-1">{video.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{video.speakerOrArtist}</p>
                  <div className="flex items-center gap-2 text-[10px] text-amber-400 font-mono mt-1">
                    <span>{video.churchOrMinistry}</span>
                    <span>•</span>
                    <span>{video.duration || 'LIVE'}</span>
                  </div>
                </div>
              </div>

              {/* Quality & Format Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Select Download Format & Quality
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDownloadFormat('1080p')}
                    className={`p-3 rounded-xl border text-left transition ${
                      downloadFormat === '1080p'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">1080p Full HD</span>
                      <FileVideo className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">High Quality • ~380 MB</div>
                  </button>

                  <button
                    onClick={() => setDownloadFormat('720p')}
                    className={`p-3 rounded-xl border text-left transition ${
                      downloadFormat === '720p'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">720p HD</span>
                      <FileVideo className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Standard HD • ~190 MB</div>
                  </button>

                  <button
                    onClick={() => setDownloadFormat('480p')}
                    className={`p-3 rounded-xl border text-left transition ${
                      downloadFormat === '480p'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">480p Mobile</span>
                      <FileVideo className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Data Saver • ~85 MB</div>
                  </button>

                  <button
                    onClick={() => setDownloadFormat('mp3')}
                    className={`p-3 rounded-xl border text-left transition ${
                      downloadFormat === 'mp3'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Audio Only (MP3)</span>
                      <Music className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Podcast Audio • ~32 MB</div>
                  </button>
                </div>
              </div>

              {/* Extra Accessories */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-2">
                <div className="text-xs font-bold text-slate-300">Download Accessories</div>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={includeSubtitles}
                    onChange={(e) => setIncludeSubtitles(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                  />
                  <span>Include Subtitle / Closed Caption (.srt) File</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={includeSermonNotes}
                    onChange={(e) => setIncludeSermonNotes(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                  />
                  <span>Include Printable Sermon Outline (.pdf)</span>
                </label>
              </div>

              {/* Progress & Action Controls */}
              {isDownloading ? (
                <div className="space-y-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      Downloading sermon file...
                    </span>
                    <span className="font-mono">{downloadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Speed: {downloadSpeed}</span>
                    <span>Saving to device & Offline Vault</span>
                  </div>
                </div>
              ) : downloadComplete ? (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center justify-between text-emerald-300 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-bold">Download Complete!</div>
                      <div className="text-[10px] text-emerald-400/80">Saved to device and offline storage.</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDownloadComplete(false);
                      setActiveTab('library');
                    }}
                    className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition"
                  >
                    View Vault
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartDownload}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Start Download ({getEstSize()})</span>
                </button>
              )}
            </>
          )}

          {activeTab === 'library' && (
            <div className="space-y-3">
              {downloadedItems.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <HardDrive className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">No downloaded videos in offline vault yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Downloaded gospel sermons will be accessible here without an active internet connection.
                  </p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {downloadedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 group hover:border-slate-700 transition"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-16 h-10 object-cover rounded-lg shrink-0"
                        />
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{item.title}</h4>
                          <p className="text-[10px] text-slate-400">{item.speakerOrArtist}</p>
                          <div className="text-[9px] text-amber-400 font-mono mt-0.5 flex gap-2">
                            <span>{item.format}</span>
                            <span>•</span>
                            <span>{item.fileSize}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onPlayVideo && (
                          <button
                            onClick={() => {
                              onPlayVideo({
                                id: item.videoId,
                                title: item.title,
                                speakerOrArtist: item.speakerOrArtist,
                                churchOrMinistry: 'Downloaded Service',
                                channelAvatar: item.thumbnail,
                                subscribersCount: '100K',
                                likesCount: '12K',
                                category: 'Sermon',
                                thumbnail: item.thumbnail,
                                description: 'Downloaded offline sermon video',
                                isLive: false,
                                date: 'Offline Saved'
                              });
                              onClose();
                            }}
                            className="p-2 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold text-xs transition"
                            title="Play Offline Video"
                          >
                            <Play className="w-3.5 h-3.5 fill-slate-950" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOfflineItem(item.id)}
                          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                          title="Delete Download"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  Film, 
  Users, 
  Clock, 
  Flame, 
  Tag, 
  BookOpen, 
  Save, 
  Globe2, 
  Lock, 
  Link2, 
  ArrowRight,
  Download,
  Calendar,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { VideoStream } from '../data/gospelData';
import { UserSession } from './AuthModal';

export interface RecordedStreamData {
  title: string;
  description: string;
  speaker: string;
  scripture: string;
  category: string;
  durationMinutes: number;
  durationFormatted: string;
  totalWorshippers: number;
  peakWorshippers: number;
  prayersCount: number;
  thumbnail: string;
  videoUrl: string;
}

interface LiveRecordingVODModalProps {
  currentUser?: UserSession;
  recordedData: RecordedStreamData;
  onPublishVOD: (vodStream: VideoStream) => void;
  onSaveDraft: (draftData: RecordedStreamData) => void;
  onClose: () => void;
}

export default function LiveRecordingVODModal({
  currentUser,
  recordedData,
  onPublishVOD,
  onSaveDraft,
  onClose
}: LiveRecordingVODModalProps) {
  const ministryName = currentUser?.ministryName || currentUser?.churchName || 'Grace City Cathedral';
  const avatarUrl = currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
  
  // Format automatic recording title: ▶️ Sunday Worship Service — September 2, 2026
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const [vodTitle, setVodTitle] = useState(
    recordedData.title.startsWith('▶️')
      ? recordedData.title
      : `▶️ ${recordedData.title} — ${dateFormatted}`
  );
  const [vodDescription, setVodDescription] = useState(recordedData.description);
  const [vodSpeaker, setVodSpeaker] = useState(recordedData.speaker);
  const [vodScripture, setVodScripture] = useState(recordedData.scripture);
  const [vodCategory, setVodCategory] = useState(recordedData.category || 'Live Worship');
  const [vodVisibility, setVodVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    setTimeout(() => {
      const newVOD: VideoStream = {
        id: `vod-rec-${Date.now()}`,
        title: vodTitle,
        speakerOrArtist: vodSpeaker,
        churchOrMinistry: ministryName,
        channelAvatar: avatarUrl,
        subscribersCount: '24.8K',
        likesCount: `${Math.round(recordedData.totalWorshippers * 0.42)}`,
        category: (vodCategory as any) || 'Live Worship',
        isLive: false,
        viewsText: `${recordedData.totalWorshippers.toLocaleString()} views • Recorded Live Stream`,
        duration: recordedData.durationFormatted,
        thumbnail: recordedData.thumbnail,
        description: `${vodDescription}\n\n📹 Auto-recorded live stream broadcast from ${ministryName}.\nTotal Worshippers in Service: ${recordedData.totalWorshippers.toLocaleString()}\nAltar Prayers Submitted: ${recordedData.prayersCount}`,
        bibleVerse: vodScripture,
        date: 'Today (Live Stream VOD)',
        videoUrl: recordedData.videoUrl
      };

      setIsPublishing(false);
      setIsPublished(true);
      onPublishVOD(newVOD);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#141416] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-auto"
      >
        {!isPublished ? (
          <form onSubmit={handlePublish} className="space-y-6">
            
            {/* Header Notification */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                    Stream Ended • Cloud Recording Ready
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  PUBLISH RECORDED SERVICE (VOD)
                </h2>
              </div>

              <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold self-start sm:self-auto flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-VOD Transcode (1080p60)</span>
              </div>
            </div>

            {/* Broadcast Recap Stats Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-[#1a1a1e] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Service Duration</span>
                <span className="text-sm font-bold text-white mt-0.5 block flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{recordedData.durationFormatted}</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#1a1a1e] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Worshippers</span>
                <span className="text-sm font-bold text-emerald-400 mt-0.5 block flex items-center justify-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>{recordedData.totalWorshippers.toLocaleString()}</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#1a1a1e] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Peak Concurrent</span>
                <span className="text-sm font-bold text-amber-300 mt-0.5 block">
                  {recordedData.peakWorshippers}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#1a1a1e] border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Prayer Requests</span>
                <span className="text-sm font-bold text-red-400 mt-0.5 block flex items-center justify-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-red-400" />
                  <span>{recordedData.prayersCount}</span>
                </span>
              </div>
            </div>

            {/* VOD Metadata Fields */}
            <div className="space-y-4 bg-[#18181c] border border-slate-800 rounded-3xl p-5">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  VOD Video Title (Auto-Formatted with Date) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={vodTitle}
                  onChange={(e) => setVodTitle(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>

              {/* Description & Sermon Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Description & Sermon Notes
                </label>
                <textarea
                  rows={3}
                  value={vodDescription}
                  onChange={(e) => setVodDescription(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              {/* Speaker & Scripture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Preacher / Minister</label>
                  <input
                    type="text"
                    value={vodSpeaker}
                    onChange={(e) => setVodSpeaker(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Key Scripture</label>
                  <input
                    type="text"
                    value={vodScripture}
                    onChange={(e) => setVodScripture(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-amber-300 font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Visibility Options */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-300 mb-2">Publish Visibility</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVodVisibility('public')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      vodVisibility === 'public'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-black/40 text-slate-400'
                    }`}
                  >
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Public</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVodVisibility('unlisted')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      vodVisibility === 'unlisted'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-800 bg-black/40 text-slate-400'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Unlisted</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVodVisibility('private')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      vodVisibility === 'private'
                        ? 'border-slate-600 bg-slate-800 text-white'
                        : 'border-slate-800 bg-black/40 text-slate-400'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Private</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onSaveDraft(recordedData);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save as VOD Draft</span>
              </button>

              <button
                type="submit"
                disabled={isPublishing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition cursor-pointer"
              >
                {isPublishing ? (
                  <span>Publishing to Video Library...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Recording to Video Library</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        ) : (
          /* Published Success View */
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Live Stream Recording Published!</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                <strong className="text-white">{vodTitle}</strong> is now live on your ministry channel for on-demand playback worldwide.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
              >
                Return to Creator Studio
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

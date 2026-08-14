import React, { useState } from 'react';
import { 
  UserCheck, 
  UserPlus, 
  Bell, 
  BellRing, 
  BellOff, 
  CheckCircle2, 
  X, 
  Play, 
  Tv, 
  Music, 
  Share2, 
  ShieldCheck, 
  MapPin, 
  Globe, 
  Heart,
  ChevronRight,
  Check,
  DollarSign,
  Calendar,
  Clock,
  Radio,
  Sparkles,
  Building2,
  Share
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoStream, AudioTrack, CHURCH_SCHEDULES, ServiceScheduleItem, CHURCH_LOCATIONS, CHURCH_SOCIALS } from '../data/gospelData';
import { GivingTarget } from './GivingModal';
import SocialMediaLinksBar from './SocialMediaLinksBar';
import ChurchLocationsCard from './ChurchLocationsCard';

interface ChannelProfileModalProps {
  channelName: string;
  channelAvatar: string;
  followerCount: number;
  isFollowed: boolean;
  bellSetting: 'all' | 'personalized' | 'none';
  isJoined?: boolean;
  memberCount?: number;
  onToggleJoinChurch?: (channelName: string) => void;
  onToggleFollow: (channelName: string) => void;
  onChangeBellSetting: (channelName: string, setting: 'all' | 'personalized' | 'none') => void;
  onOpenGivingModal?: (target: GivingTarget) => void;
  onClose: () => void;
  onSelectVideo: (video: VideoStream) => void;
  onPlayAudioTrack: (track: AudioTrack) => void;
  allVideos: VideoStream[];
  allAudio: AudioTrack[];
}

export default function ChannelProfileModal({
  channelName,
  channelAvatar,
  followerCount,
  isFollowed,
  bellSetting,
  isJoined = false,
  memberCount = 1248,
  onToggleJoinChurch,
  onToggleFollow,
  onChangeBellSetting,
  onOpenGivingModal,
  onClose,
  onSelectVideo,
  onPlayAudioTrack,
  allVideos,
  allAudio
}: ChannelProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'videos' | 'audio' | 'schedule' | 'campuses' | 'members' | 'socials' | 'about'>('videos');
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reminderSetId, setReminderSetId] = useState<string | null>(null);
  const [showCertModal, setShowCertModal] = useState(false);

  // Retrieve channel schedule, locations, and socials
  const churchSchedules: ServiceScheduleItem[] = CHURCH_SCHEDULES[channelName] || [];
  const churchLocations = CHURCH_LOCATIONS[channelName] || [];
  const churchSocials = CHURCH_SOCIALS[channelName] || [];

  // Filter channel content
  const channelVideos = allVideos.filter(
    v => v.churchOrMinistry.toLowerCase().includes(channelName.toLowerCase()) || 
         v.speakerOrArtist.toLowerCase().includes(channelName.toLowerCase())
  );

  const channelAudio = allAudio.filter(
    a => a.artistOrPreacher.toLowerCase().includes(channelName.toLowerCase()) ||
         a.albumOrSeries.toLowerCase().includes(channelName.toLowerCase())
  );

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://gracetube.tv/@${channelName.toLowerCase().replace(/\s+/g, '')}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#181818] border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white transition backdrop-blur-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Banner Header */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-red-950 via-slate-900 to-amber-950/60 relative p-6 flex items-end">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-2 right-4 flex items-center gap-2 text-[10px] text-slate-300 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-md border border-slate-700/50">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Verified Gospel Publisher</span>
            </div>
          </div>

          {/* Channel Info Profile Bar */}
          <div className="px-6 pb-4 pt-0 relative space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 relative z-10">
              <div className="flex items-end gap-4">
                <motion.img
                  src={channelAvatar}
                  alt={channelName}
                  whileHover={{ scale: 1.08, boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.3)" }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#181818] shadow-xl bg-slate-900 shrink-0 cursor-pointer"
                />
                <div className="pb-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">{channelName}</h2>
                    <CheckCircle2 className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                    <span><strong className="text-white">{formatFollowers(followerCount)}</strong> followers</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-amber-400" />
                      <span>{memberCount.toLocaleString()} Members</span>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1" title="Behavioral Recognition Badge (No Ordination Titles)">
                      <span>⚡</span>
                      <span>
                        {channelName.includes('Cathedral') || channelName.includes('Sanctuary') || channelName.includes('Ministries')
                          ? 'Pillar of Light'
                          : channelName.includes('Choir') || channelName.includes('Band') || channelName.includes('Ensemble')
                          ? 'Anointed Melody'
                          : 'Kingdom Catalyst'}
                      </span>
                    </span>
                  </p>
                </div>
              </div>

              {/* Join Church & Follow Actions */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
                {/* ✝️ Join Church Micro-Feature Action Button */}
                <button
                  onClick={() => onToggleJoinChurch && onToggleJoinChurch(channelName)}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-full text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xl ${
                    isJoined
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border border-emerald-400/40 shadow-emerald-900/30'
                      : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/30 animate-pulse'
                  }`}
                  title={isJoined ? "You are an official member of this church" : "Join this church family to receive pastoral notifications and member benefits"}
                >
                  {isJoined ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 fill-white text-emerald-700" />
                      <span>Official Member</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      <span>✝️ Join Church</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onToggleFollow(channelName)}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg ${
                    isFollowed
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                  }`}
                >
                  {isFollowed ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>

                {/* Bell Dropdown when Followed */}
                {isFollowed && (
                  <div className="relative">
                    <button
                      onClick={() => setShowBellDropdown(!showBellDropdown)}
                      className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      title="Notification preferences"
                    >
                      {bellSetting === 'all' && <BellRing className="w-4 h-4 text-amber-400" />}
                      {bellSetting === 'personalized' && <Bell className="w-4 h-4 text-slate-300" />}
                      {bellSetting === 'none' && <BellOff className="w-4 h-4 text-slate-500" />}
                    </button>

                    {showBellDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-30 text-xs">
                        {[
                          { id: 'all', label: 'All Notifications', icon: BellRing, sub: 'Live streams & uploads' },
                          { id: 'personalized', label: 'Personalized', icon: Bell, sub: 'Occasional highlights' },
                          { id: 'none', label: 'None', icon: BellOff, sub: 'Mute notifications' },
                        ].map(opt => {
                          const Icon = opt.icon;
                          const isSel = bellSetting === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => {
                                onChangeBellSetting(channelName, opt.id as any);
                                setShowBellDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                                isSel ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-300 hover:bg-slate-800/60'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="w-3.5 h-3.5" />
                                <div>
                                  <div>{opt.label}</div>
                                  <div className="text-[9px] text-slate-500">{opt.sub}</div>
                                </div>
                              </div>
                              {isSel && <Check className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Sow Seed / Support Button */}
                <button
                  onClick={() => {
                    if (onOpenGivingModal) {
                      onOpenGivingModal({
                        id: `channel-${channelName.toLowerCase().replace(/\s+/g, '-')}`,
                        name: channelName,
                        avatar: channelAvatar,
                        type: 'church',
                        categoryTitle: 'Ministry & Church Offering Portal'
                      });
                    }
                  }}
                  className="px-4 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 shrink-0"
                  title="Sow Seed or Give Tithe"
                >
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Sow Seed</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Share channel profile"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Compact Social Links Row */}
            {churchSocials.length > 0 && (
              <div className="pt-1 pb-1">
                <SocialMediaLinksBar
                  churchOrChannelName={channelName}
                  customSocials={churchSocials}
                  variant="compact"
                />
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 pt-2 gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { id: 'videos', label: 'Sermons', icon: Tv, count: channelVideos.length },
                { id: 'audio', label: 'Audio', icon: Music, count: channelAudio.length },
                { id: 'members', label: 'Church Members', icon: Building2, count: memberCount, highlight: true },
                { id: 'schedule', label: 'Schedule', icon: Calendar, count: churchSchedules.length, highlight: true },
                { id: 'campuses', label: 'Campuses & Maps', icon: Building2, count: churchLocations.length },
                { id: 'socials', label: 'Social Media', icon: Share2, count: churchSocials.length },
                { id: 'about', label: 'About', icon: Heart },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-2 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 border-b-2 whitespace-nowrap shrink-0 ${
                      isActive 
                        ? 'border-amber-400 text-amber-400 bg-slate-900/60' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${tab.highlight && !isActive ? 'text-amber-400' : ''}`} />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        tab.highlight ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="pt-2 max-h-80 overflow-y-auto space-y-3">
              {activeTab === 'videos' && (
                <div className="space-y-2">
                  {channelVideos.length > 0 ? (
                    channelVideos.map((v) => (
                      <motion.div
                        key={v.id}
                        whileHover={{ scale: 1.02, x: 2, boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.5)" }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={() => {
                          onSelectVideo(v);
                          onClose();
                        }}
                        className="p-2.5 rounded-2xl bg-[#0f0f0f] hover:bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer group transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0">
                            <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition flex items-center justify-center">
                              <Play className="w-4 h-4 fill-white text-white" />
                            </div>
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition">
                              {v.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-0.5">{v.speakerOrArtist} • {v.date}</p>
                          </div>
                        </div>

                        <span className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold shrink-0">
                          {v.isLive ? 'LIVE' : v.duration}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-8 text-center space-y-1">
                      <p className="text-xs text-slate-400">No public video streams listed yet for this channel.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="space-y-2">
                  {channelAudio.length > 0 ? (
                    channelAudio.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onPlayAudioTrack(a);
                          onClose();
                        }}
                        className="p-2.5 rounded-2xl bg-[#0f0f0f] hover:bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer group transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img src={a.coverUrl} alt={a.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition">
                              {a.title}
                            </h4>
                            <p className="text-[10px] text-slate-400">{a.artistOrPreacher} • {a.category}</p>
                          </div>
                        </div>

                        <button className="p-2 rounded-full bg-red-600 text-white shrink-0">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-xs text-slate-400">No audio tracks listed yet for this channel.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Official Church Broadcast & Service Schedule</h4>
                        <p className="text-[10px] text-slate-400">Weekly worship assemblies, prayer altars, and live feeds</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold shrink-0">
                      Weekly Times
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {churchSchedules.map((sch) => (
                      <div
                        key={sch.id}
                        className="p-3.5 rounded-2xl bg-[#0f0f0f] border border-slate-800 space-y-2 relative overflow-hidden group hover:border-amber-500/30 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                              {sch.day}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1 border border-slate-700">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {sch.time}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800/50 text-[10px] font-bold">
                              {sch.type}
                            </span>
                            {sch.isLiveNow && (
                              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-widest animate-pulse flex items-center gap-1">
                                <Radio className="w-3 h-3" /> Live Now
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setReminderSetId(sch.id);
                              setTimeout(() => setReminderSetId(null), 2500);
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1 shrink-0 ${
                              reminderSetId === sch.id
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {reminderSetId === sch.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Reminder Set!</span>
                              </>
                            ) : (
                              <>
                                <Bell className="w-3 h-3 text-amber-400" />
                                <span>Remind Me</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                            {sch.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {sch.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            {sch.locationOrStream}
                          </span>
                          <span className="text-amber-400/90 font-medium">
                            Led by {sch.speakerOrLeader}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-4">
                  {/* Church Membership Banner Status */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white">
                            {channelName} Registered Fellowship Members
                          </h4>
                          <p className="text-[10px] sm:text-xs text-amber-300 font-medium">
                            <strong className="text-white font-bold">{memberCount.toLocaleString()}</strong> official members registered on GraceTube
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleJoinChurch && onToggleJoinChurch(channelName)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-lg shrink-0 ${
                          isJoined
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        }`}
                      >
                        {isJoined ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Joined Member</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Join Church</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Dual Notification Status Indicator */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-amber-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Bell className="w-3 h-3 text-amber-400" /> Dual Dispatch System Active
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">Auto-Sync</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Joining automatically dispatches a welcome notification to your user feed and registers a new member entry in the {channelName} pastoral administrative log.
                      </p>
                    </div>
                  </div>

                  {/* Joined Certificate View (If Joined) */}
                  {isJoined ? (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-emerald-500/40 space-y-3 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Certificate of Fellowship Issued
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: #MEMBER-{channelName.substring(0, 3).toUpperCase()}-2026</span>
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-white">Official Church Member Record</h5>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          David Lawson • Registered Online Fellowship Member at {channelName}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-500 block">Pastoral Care Status</span>
                          <span className="text-emerald-400 font-bold">Active Fellowship Member</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-slate-500 block">Member Benefits</span>
                          <span className="text-amber-300 font-bold">Prayer Line & Devotionals</span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Recent Member Roster */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Recent Members Joined ({channelName})</span>
                      <span className="text-[10px] text-amber-400 font-mono">Live Roster</span>
                    </h5>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {[
                        { name: isJoined ? 'David Lawson (You)' : 'Brother Mark A.', time: 'Just now', role: 'Online Member', isUser: isJoined },
                        { name: 'Sister Sarah Jenkins', time: '12m ago', role: 'Worship Volunteer', isUser: false },
                        { name: 'Deacon John Mwangi', time: '45m ago', role: 'Fellowship Member', isUser: false },
                        { name: 'Pastor Michael R.', time: '2h ago', role: 'Associate Minister', isUser: false },
                        { name: 'Sister Grace O.', time: '5h ago', role: 'Choir Member', isUser: false },
                      ].map((mbr, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                            mbr.isUser
                              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${
                              mbr.isUser ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {mbr.name.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold flex items-center gap-1">
                                <span>{mbr.name}</span>
                                {mbr.isUser && <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[9px]">YOU</span>}
                              </div>
                              <div className="text-[10px] text-slate-500">{mbr.role}</div>
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-500 font-mono">{mbr.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'campuses' && (
                <div className="space-y-3">
                  <ChurchLocationsCard
                    churchName={channelName}
                    customLocations={churchLocations}
                  />
                </div>
              )}

              {activeTab === 'socials' && (
                <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-slate-800 space-y-4">
                  <SocialMediaLinksBar
                    churchOrChannelName={channelName}
                    customSocials={churchSocials}
                    variant="expanded"
                  />
                </div>
              )}

              {activeTab === 'about' && (
                <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-slate-800 space-y-4 text-xs text-slate-300">
                  <div>
                    <span className="font-bold text-white block mb-1">Ministry Mission</span>
                    <p className="text-slate-400 leading-relaxed">
                      Official verified Kingdom broadcaster spreading sound biblical teaching, live worship services, and anointed gospel music to global audiences.
                    </p>
                  </div>

                  {/* Ministry Direct Giving Banner */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-amber-300">Support This Ministry</h4>
                      <p className="text-[10px] text-slate-400">Direct Tithes, Love Offerings & Faith Seeds</p>
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenGivingModal) {
                          onOpenGivingModal({
                            id: `channel-${channelName.toLowerCase().replace(/\s+/g, '-')}`,
                            name: channelName,
                            avatar: channelAvatar,
                            type: 'church',
                            categoryTitle: 'Ministry & Church Offering Portal'
                          });
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Give Offering</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> Global Ministry
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-400" /> Verified Channel
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  RadioTower, 
  Users, 
  Clock, 
  Square, 
  Flame, 
  Heart, 
  MessageSquare, 
  Send, 
  Pin, 
  Sparkles, 
  Wifi, 
  Activity, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Sliders, 
  Share2, 
  ShieldCheck, 
  DollarSign, 
  Layers, 
  Eye, 
  RefreshCw,
  Award,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserSession } from './AuthModal';

export interface LiveChatEntry {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  isHost?: boolean;
  isModerator?: boolean;
  isPrayer?: boolean;
  isPinned?: boolean;
  reactions: {
    amen: number;
    fire: number;
    heart: number;
  };
}

export interface LivePrayerRequest {
  id: string;
  name: string;
  avatar: string;
  location: string;
  request: string;
  time: string;
  amensCount: number;
  isPrayedAlong: boolean;
  isPushedToScreen: boolean;
}

export interface LowerThirdBanner {
  id: string;
  label: string;
  headline: string;
  subtext: string;
  type: 'scripture' | 'giving' | 'altar_call' | 'announcement';
  isActive: boolean;
}

interface LiveControlRoomProps {
  currentUser?: UserSession;
  broadcastTitle: string;
  broadcastType: string;
  category: string;
  speaker: string;
  scripture: string;
  streamKey: string;
  rtmpUrl: string;
  onEndStream: (recordedData: {
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
  }) => void;
  onBackToStudio: () => void;
}

export default function LiveControlRoom({
  currentUser,
  broadcastTitle,
  broadcastType,
  category,
  speaker,
  scripture,
  streamKey,
  rtmpUrl,
  onEndStream,
  onBackToStudio
}: LiveControlRoomProps) {
  // Live Timer State (Counting up)
  const [elapsedSeconds, setElapsedSeconds] = useState(2540); // ~42 mins
  const [worshipperCount, setWorshipperCount] = useState(247);
  const [peakWorshippers, setPeakWorshippers] = useState(289);
  const [isMuted, setIsMuted] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Active Control Room Tabs: 'chat' | 'prayer' | 'announcements' | 'telemetry'
  const [activeControlTab, setActiveControlTab] = useState<'chat' | 'prayer' | 'announcements' | 'telemetry'>('chat');

  // Interactive Live Chat State
  const [chatMessages, setChatMessages] = useState<LiveChatEntry[]>([
    {
      id: 'c-1',
      user: 'Grace City Media Team',
      avatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      text: 'Welcome beloved! Type your prayer requests and shout Amen in the chat as we worship today!',
      time: '10:02 AM',
      isHost: true,
      isPinned: true,
      reactions: { amen: 42, fire: 18, heart: 25 }
    },
    {
      id: 'c-2',
      user: 'Sister Rachel (London, UK)',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      text: 'Hallelujah! Tuning in with the whole family from London. The presence of God is heavy here!',
      time: '10:14 AM',
      reactions: { amen: 19, fire: 8, heart: 14 }
    },
    {
      id: 'c-3',
      user: 'Elder Joseph Mwangi',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      text: 'Amen! The prophetic word today on Isaiah 40 is unlocking fresh strength!',
      time: '10:28 AM',
      reactions: { amen: 31, fire: 12, heart: 9 }
    },
    {
      id: 'c-4',
      user: 'Sarah Jenkins (Dallas, TX)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      text: 'Glory to Jesus! Hands lifted in adoration! 🔥🕊️',
      time: '10:35 AM',
      reactions: { amen: 14, fire: 17, heart: 22 }
    }
  ]);

  const [newChatText, setNewChatText] = useState('');
  const [chatFilter, setChatFilter] = useState<'all' | 'prayers' | 'pinned'>('all');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Prayer Altar State
  const [prayerRequests, setPrayerRequests] = useState<LivePrayerRequest[]>([
    {
      id: 'p-1',
      name: 'Hannah O\'Connor',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
      location: 'Sydney, Australia',
      request: 'Please pray for my mother hospitalized with severe pneumonia. Believing God for supernatural restoration today!',
      time: '10:18 AM',
      amensCount: 68,
      isPrayedAlong: true,
      isPushedToScreen: true
    },
    {
      id: 'p-2',
      name: 'Emmanuel Adebayo',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      location: 'Lagos, Nigeria',
      request: 'Interceding for salvation and deliverance for my younger brother. Lord break every chain!',
      time: '10:26 AM',
      amensCount: 45,
      isPrayedAlong: false,
      isPushedToScreen: false
    },
    {
      id: 'p-3',
      name: 'Pastor Thomas & Maria',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      location: 'Toronto, Canada',
      request: 'Praying for church planting breakthrough and financial favor for our community sanctuary.',
      time: '10:33 AM',
      amensCount: 39,
      isPrayedAlong: false,
      isPushedToScreen: false
    }
  ]);

  // Lower Third Live Banners
  const [lowerThirdBanners, setLowerThirdBanners] = useState<LowerThirdBanner[]>([
    {
      id: 'lt-1',
      label: 'Scripture Anchor',
      headline: scripture || 'Isaiah 40:29-31 (NKJV)',
      subtext: 'He gives power to the weak, and to those who have no might He increases strength.',
      type: 'scripture',
      isActive: true
    },
    {
      id: 'lt-2',
      label: 'Online Giving & Tithes',
      headline: 'Support the Kingdom Mission',
      subtext: 'Give securely via Gospread Giving or text GOSPEL to 77000',
      type: 'giving',
      isActive: false
    },
    {
      id: 'lt-3',
      label: 'Altar Call & Salvation',
      headline: 'Accept Jesus Christ Today',
      subtext: 'Type AMEN in the chat or text SALVATION to connect with our Prayer Team',
      type: 'altar_call',
      isActive: false
    },
    {
      id: 'lt-4',
      label: 'Welcome Visitors',
      headline: 'Welcome to Grace City Cathedral',
      subtext: 'Worshipping with 247 believers across 32 nations worldwide',
      type: 'announcement',
      isActive: false
    }
  ]);

  // Telemetry Metrics
  const [bitrate, setBitrate] = useState(4820);
  const [fps, setFps] = useState(60);
  const [audioKbps, setAudioKbps] = useState(192);

  // Live Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
      // Slight organic fluctuation in viewers & bitrate
      if (Math.random() > 0.6) {
        const delta = Math.floor(Math.random() * 5) - 2;
        setWorshipperCount(c => {
          const next = Math.max(180, c + delta);
          setPeakWorshippers(p => Math.max(p, next));
          return next;
        });
      }
      if (Math.random() > 0.7) {
        setBitrate(4800 + Math.floor(Math.random() * 120) - 60);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const newMsg: LiveChatEntry = {
      id: `c-${Date.now()}`,
      user: currentUser?.fullName || currentUser?.ministryName || 'Pastor Lawson (Host)',
      avatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      text: newChatText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isHost: true,
      reactions: { amen: 1, fire: 0, heart: 0 }
    };

    setChatMessages(prev => [...prev, newMsg]);
    setNewChatText('');
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReactChat = (msgId: string, type: 'amen' | 'fire' | 'heart') => {
    setChatMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      return {
        ...m,
        reactions: {
          ...m.reactions,
          [type]: m.reactions[type] + 1
        }
      };
    }));
  };

  const handleTogglePrayerAmen = (prayerId: string) => {
    setPrayerRequests(prev => prev.map(p => {
      if (p.id !== prayerId) return p;
      return {
        ...p,
        amensCount: p.isPrayedAlong ? p.amensCount - 1 : p.amensCount + 1,
        isPrayedAlong: !p.isPrayedAlong
      };
    }));
  };

  const handleToggleLowerThird = (id: string) => {
    setLowerThirdBanners(prev => prev.map(b => ({
      ...b,
      isActive: b.id === id ? !b.isActive : false // only one active banner at a time
    })));
  };

  const activeBanner = lowerThirdBanners.find(b => b.isActive);

  // Trigger End Stream Confirmation and Transition to Automatic VOD Flow
  const handleConfirmEndStream = () => {
    setShowEndModal(false);
    const durationMins = Math.round(elapsedSeconds / 60);
    const hours = Math.floor(elapsedSeconds / 3600);
    const mins = Math.floor((elapsedSeconds % 3600) / 60);
    const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    onEndStream({
      title: broadcastTitle || `${broadcastType} — Live Service Recording`,
      description: `Full live recorded broadcast from ${currentUser?.ministryName || 'Grace City Cathedral'}. Held on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.\n\nSpeaker: ${speaker}\nScripture: ${scripture}`,
      speaker: speaker || currentUser?.fullName || 'Senior Pastor',
      scripture: scripture || 'Isaiah 40:29-31',
      category: category || 'Live Worship',
      durationMinutes: durationMins,
      durationFormatted: durationFormatted,
      totalWorshippers: worshipperCount + 890,
      peakWorshippers: peakWorshippers,
      prayersCount: prayerRequests.length + 31,
      thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    });
  };

  return (
    <div className="space-y-5">
      {/* 🔴 CONTROL ROOM TOP BAR */}
      <div className="bg-[#141416] border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping absolute inset-0" />
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 relative block" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>LIVE CONTROL ROOM</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-black uppercase">
                ON AIR
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md mt-0.5">
              {broadcastTitle} • <span className="text-amber-400 font-bold">{broadcastType}</span>
            </p>
          </div>
        </div>

        {/* Live Counters & End Stream Action */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
          
          {/* Duration Clock */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#1c1c20] border border-slate-700/80 flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">
              {formatElapsed(elapsedSeconds)}
            </span>
          </div>

          {/* Active Worshippers */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#1c1c20] border border-slate-700/80 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold text-amber-300">
              {worshipperCount.toLocaleString()} <span className="text-slate-400 font-normal text-xs">Worshippers</span>
            </span>
          </div>

          {/* Stream Health Quick Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>1080p60 • {bitrate} kbps</span>
          </div>

          {/* End Stream Button */}
          <button
            type="button"
            onClick={() => setShowEndModal(true)}
            className="px-4 sm:px-5 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-red-600/30 transition cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-white" />
            <span>End Stream</span>
          </button>
        </div>
      </div>

      {/* 🔴 MAIN GRID: LIVE PREVIEW & INTERACTIVE PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: LIVE VIDEO MONITOR & LOWER THIRDS (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Live Video Monitor Frame */}
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl flex items-center justify-center group">
            
            {/* Background Simulated Live Video Feed */}
            <img
              src="https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1400&q=80"
              alt="Live Pulpit Sanctuary"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />

            {/* Top Live Video HUD Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/40">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>LIVE FEED</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-slate-700 text-white font-mono text-[11px]">
                  {formatElapsed(elapsedSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl bg-black/70 hover:bg-black/90 border border-slate-700 text-white transition"
                  title={isMuted ? 'Unmute preview' : 'Mute preview'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* LOWER THIRD ON-SCREEN OVERLAY (Real-time Broadcast Lower Third) */}
            <AnimatePresence>
              {activeBanner && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-6 left-6 right-6 pointer-events-none"
                >
                  <div className="max-w-xl bg-slate-950/95 backdrop-blur-md border-l-4 border-amber-400 rounded-r-2xl p-3 sm:p-4 shadow-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                        {activeBanner.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Gospread Live Ingest</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                      {activeBanner.headline}
                    </h4>
                    <p className="text-[11px] text-amber-200/90 mt-0.5 line-clamp-2">
                      {activeBanner.subtext}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Quick Lower-Third Trigger Buttons */}
          <div className="bg-[#141416] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Live Screen Lower-Third Overlays
              </h3>
              <span className="text-[11px] text-slate-500">Click to toggle on/off preview feed</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lowerThirdBanners.map(banner => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => handleToggleLowerThird(banner.id)}
                  className={`p-3 rounded-2xl border text-left transition flex items-start justify-between gap-2 cursor-pointer ${
                    banner.isActive
                      ? 'border-amber-400 bg-amber-400/10 text-white ring-1 ring-amber-400/30'
                      : 'border-slate-800 bg-[#19191d] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-amber-400 uppercase block">
                      {banner.label}
                    </span>
                    <p className="text-xs font-bold text-white truncate mt-0.5">
                      {banner.headline}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                    banner.isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {banner.isActive ? 'ON SCREEN' : 'OFF'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 📡 STREAM HEALTH & TELEMETRY CARD */}
          <div className="bg-[#141416] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Stream Health Telemetry
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>🟢 Excellent Connection</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-[#19191d] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Resolution</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5 block">1080p60</span>
                <span className="text-[10px] text-emerald-400">1920x1080 Native</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#19191d] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Bitrate</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 mt-0.5 block">{bitrate} kbps</span>
                <span className="text-[10px] text-slate-400">Target 4500 kbps</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#19191d] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Framerate</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5 block">{fps} FPS</span>
                <span className="text-[10px] text-emerald-400">0 dropped frames</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#19191d] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Audio Ingest</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-white mt-0.5 block">{audioKbps} kbps</span>
                <span className="text-[10px] text-slate-400">AAC 48kHz Stereo</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#101012] border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px] truncate">Ingest: {rtmpUrl}</span>
              <span className="text-[11px] text-emerald-400 font-bold shrink-0 ml-2">Cloudflare Stream Edge</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE TABS (CHAT, PRAYER ALTAR, ANNOUNCEMENTS) (5 COLS) */}
        <div className="lg:col-span-5 bg-[#141416] border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col h-[640px] lg:h-[720px] shadow-2xl">
          
          {/* Tabs Navigation Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-slate-800 w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveControlTab('chat')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeControlTab === 'chat'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Chat</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                  {chatMessages.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveControlTab('prayer')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeControlTab === 'prayer'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                <span>Prayer Altar</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px]">
                  {prayerRequests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveControlTab('announcements')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeControlTab === 'announcements'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Giving & Push</span>
              </button>
            </div>
          </div>

          {/* TAB 1: LIVE CHAT MODERATOR VIEW */}
          {activeControlTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 pt-3">
              {/* Filter pills */}
              <div className="flex items-center gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => setChatFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    chatFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  All ({chatMessages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setChatFilter('pinned')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    chatFilter === 'pinned' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  📌 Pinned (1)
                </button>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                      msg.isPinned
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : msg.isHost
                        ? 'bg-slate-900 border-red-500/20'
                        : 'bg-[#18181c] border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={msg.avatar}
                          alt={msg.user}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-bold text-white text-[11px]">
                          {msg.user}
                        </span>
                        {msg.isHost && (
                          <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-black uppercase">
                            HOST
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                    </div>

                    <p className="text-slate-200 text-xs leading-relaxed">
                      {msg.text}
                    </p>

                    {/* Quick Reactions Bar */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/50">
                      <button
                        type="button"
                        onClick={() => handleReactChat(msg.id, 'amen')}
                        className="px-2 py-0.5 rounded-lg bg-black/40 hover:bg-black/60 text-[10px] text-amber-300 font-bold flex items-center gap-1 transition"
                      >
                        <span>🙌 Amen</span>
                        <span>{msg.reactions.amen}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReactChat(msg.id, 'fire')}
                        className="px-2 py-0.5 rounded-lg bg-black/40 hover:bg-black/60 text-[10px] text-red-400 font-bold flex items-center gap-1 transition"
                      >
                        <span>🔥</span>
                        <span>{msg.reactions.fire}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReactChat(msg.id, 'heart')}
                        className="px-2 py-0.5 rounded-lg bg-black/40 hover:bg-black/60 text-[10px] text-pink-400 font-bold flex items-center gap-1 transition"
                      >
                        <span>❤️</span>
                        <span>{msg.reactions.heart}</span>
                      </button>
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Host Chat Post Form */}
              <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-800 mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newChatText}
                    onChange={(e) => setNewChatText(e.target.value)}
                    placeholder="Broadcast message as Host / Church..."
                    className="flex-1 bg-[#0e0e10] border border-slate-700 focus:border-red-500 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white transition cursor-pointer"
                    title="Send chat message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PRAYER ALTAR STREAM & INTERCESSION */}
          {activeControlTab === 'prayer' && (
            <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
                <span>🙏 <strong>{prayerRequests.length} active prayer requests</strong> during this live service</span>
                <span className="text-[10px] font-mono text-amber-400 font-bold">Live Intercession Active</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {prayerRequests.map(prayer => (
                  <div
                    key={prayer.id}
                    className="p-3.5 rounded-2xl bg-[#18181c] border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={prayer.avatar}
                          alt={prayer.name}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-400"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block leading-tight">{prayer.name}</span>
                          <span className="text-[10px] text-slate-400">{prayer.location}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{prayer.time}</span>
                    </div>

                    <p className="text-xs text-slate-200 italic bg-black/30 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed">
                      "{prayer.request}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleTogglePrayerAmen(prayer.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          prayer.isPrayedAlong
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                        <span>{prayer.isPrayedAlong ? 'Prayed With' : 'Pray Along'}</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
                          {prayer.amensCount}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          // Push this prayer request as a lower third banner
                          setLowerThirdBanners(prev => [
                            {
                              id: `lt-prayer-${prayer.id}`,
                              label: 'Prayer Altar Focus',
                              headline: `Interceding for ${prayer.name}`,
                              subtext: prayer.request,
                              type: 'altar_call',
                              isActive: true
                            },
                            ...prev.filter(b => b.type !== 'altar_call')
                          ]);
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>Push to Screen</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GIVING & ANNOUNCEMENTS CONTROLS */}
          {activeControlTab === 'announcements' && (
            <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-4">
              <div className="p-4 rounded-2xl bg-[#18181c] border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Live Kingdom Giving Call
                </h4>
                <p className="text-xs text-slate-400">
                  Trigger an interactive tithes and offering call-to-action on viewer screens with one click.
                </p>

                <button
                  type="button"
                  onClick={() => handleToggleLowerThird('lt-2')}
                  className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Push Tithes & Offering Overlay to Viewers</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#18181c] border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Altar Call & Confession of Faith
                </h4>
                <p className="text-xs text-slate-400">
                  Broadcast salvation invitation with live prayer hotline number to all 247 connected viewers.
                </p>

                <button
                  type="button"
                  onClick={() => handleToggleLowerThird('lt-3')}
                  className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-red-600 fill-red-600" />
                  <span>Push Salvation Altar Call Banner</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 🔴 END STREAM CONFIRMATION MODAL */}
      <AnimatePresence>
        {showEndModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18181a] border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <Square className="w-6 h-6 fill-red-500" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg font-black text-white">End Live Broadcast?</h3>
                <p className="text-xs text-slate-400">
                  Your live broadcast for <strong className="text-white">{currentUser?.ministryName || 'Grace City Cathedral'}</strong> will finish and automatically record into your Video on Demand (VOD) library.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#101012] border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Stream Duration:</span>
                  <span className="font-mono text-white font-bold">{formatElapsed(elapsedSeconds)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Peak Worshippers:</span>
                  <span className="text-amber-300 font-bold">{peakWorshippers}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Automatic Recording:</span>
                  <span className="text-emerald-400 font-bold">Cloudflare Stream VOD (1080p)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Keep Broadcasting
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEndStream}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  End Stream & Save VOD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

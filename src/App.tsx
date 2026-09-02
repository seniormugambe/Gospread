import { useState, useRef, useEffect, FormEvent } from 'react';
import { 
  Play, 
  Pause, 
  Maximize2, 
  Copy, 
  Check, 
  Tv, 
  Compass, 
  Bookmark, 
  Search, 
  Bell, 
  Sparkles,
  ChevronRight,
  Radio as RadioIcon,
  Music,
  Heart,
  Send,
  Volume2,
  VolumeX,
  Share2,
  MessageSquare,
  FileText,
  CheckCircle2,
  Menu,
  Mic,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Clock,
  Radio,
  Flame,
  Mic2,
  Headphones,
  Plus,
  UserCheck,
  UserPlus,
  BellRing,
  BellOff,
  Church,
  Rss,
  DollarSign,
  Gift,
  Award,
  Calendar,
  User,
  X,
  History,
  Trash2,
  Sun,
  Moon,
  Building2,
  Server,
  Youtube,
  ShieldCheck,
  Download,
  Settings,
  MessageSquareHeart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GospreadLogo from './components/GospreadLogo';
import youtubeGospelImg from './assets/images/youtube_gospel_ui_1785687242032.jpg';
import CreatePage from './components/CreatePage';
import DiscoverMinistriesHub from './components/DiscoverMinistriesHub';
import UserProfilePage from './components/UserProfilePage';
import FellowshipCommunityHub from './components/FellowshipCommunityHub';
import AccountSettingsModal from './components/AccountSettingsModal';
import UserAccountMenuDropdown from './components/UserAccountMenuDropdown';
import ChannelProfileModal from './components/ChannelProfileModal';
import GivingModal, { GivingTarget } from './components/GivingModal';
import DailyStreakModal from './components/DailyStreakModal';
import DailyPromiseModal from './components/DailyPromiseModal';
import GraceShortsModal from './components/GraceShortsModal';
import DjangoBackendModal from './components/DjangoBackendModal';
import YouTubeApiModal from './components/YouTubeApiModal';
import AuthModal, { UserSession } from './components/AuthModal';
import AuthPage from './components/AuthPage';
import { djangoApi } from './services/djangoApi';
import VideoDownloadModal from './components/VideoDownloadModal';
import VideoStreamFrame from './components/VideoStreamFrame';
import PictureInPictureWindow from './components/PictureInPictureWindow';
import LiveViewerTrendSparkline from './components/LiveViewerTrendSparkline';
import AudioPodcastPlayer from './components/AudioPodcastPlayer';
import AudioPodcastHub from './components/AudioPodcastHub';
import KingdomHomeFeed from './components/KingdomHomeFeed';
import { SearchEngineOverlay } from './components/SearchEngineOverlay';
import { WatchHistoryView, WatchHistoryItem } from './components/WatchHistoryView';
import { MobileBottomNav } from './components/MobileBottomNav';
import ChurchLocationsCard from './components/ChurchLocationsCard';
import SocialMediaLinksBar from './components/SocialMediaLinksBar';
import LiveChatPanel from './components/LiveChatPanel';
import { 
  SUBSCRIPTION_CHANNELS,
  CHURCH_SCHEDULES,
  VideoStream, 
  AudioTrack,
  ChatMessage,
  ReactionType,
  LIVE_VIDEO_STREAMS
} from './data/gospelData';
import { youtubeApi } from './services/youtubeApi';

export default function App() {
  // 🌤️ Sky Light Theme State (Defaulting to the requested Heavenly Sky Light Theme)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('gospread_theme');
      if (saved === 'dark') return 'dark';
    } catch (e) {
      console.error(e);
    }
    return 'light';
  });

  useEffect(() => {
    try {
      localStorage.setItem('gospread_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const [activeTab, setActiveTab] = useState<'platform' | 'generated' | 'create' | 'profile' | 'history' | 'discover' | 'community' | 'auth'>('platform');
  const [initialAuthMode, setInitialAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleOpenAuthPage = (mode: 'signin' | 'signup' = 'signin') => {
    setInitialAuthMode(mode);
    setActiveTab('auth');
    setIsPipDocked(false);
    setActiveVideo(null);
  };
  const [videoStreams, setVideoStreams] = useState<VideoStream[]>(LIVE_VIDEO_STREAMS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRealYoutubeData, setIsRealYoutubeData] = useState(false);
  const [isYoutubeLoading, setIsYoutubeLoading] = useState(false);

  // 📺 Fetch real YouTube Data API v3 live streams & audio tracks dynamically
  useEffect(() => {
    let isMounted = true;
    const loadYoutubeStreams = async () => {
      setIsYoutubeLoading(true);
      const queryTerm = searchQuery.trim() || (selectedCategory === 'All' ? 'Gospel Live Worship Sermon' : `Gospel ${selectedCategory}`);
      const isLiveOnly = selectedCategory === 'Live Worship';
      
      try {
        const backendStreams = await djangoApi.getLiveStreams();
        if (isMounted && backendStreams && backendStreams.length > 0) {
          setVideoStreams(backendStreams);
          if (!activeVideo && backendStreams[0]) {
            setActiveVideo(backendStreams[0]);
          }
        } else {
          const res = await youtubeApi.searchGospelVideos(queryTerm, isLiveOnly);
          if (isMounted && res.videos && res.videos.length > 0) {
            setVideoStreams(res.videos);
            setIsRealYoutubeData(res.isRealYoutubeData);
            if (res.isRealYoutubeData && res.videos[0]) {
              setActiveVideo(prev => prev ? prev : res.videos[0]);
            }
          }
        }
      } catch (e) {
        console.error('Error fetching live streams:', e);
        const res = await youtubeApi.searchGospelVideos(queryTerm, isLiveOnly);
        if (isMounted && res.videos && res.videos.length > 0) {
          setVideoStreams(res.videos);
          setIsRealYoutubeData(res.isRealYoutubeData);
          if (res.isRealYoutubeData && res.videos[0]) {
            setActiveVideo(prev => prev ? prev : res.videos[0]);
          }
        }
      }

      try {
        const backendTracks = await djangoApi.getAudioTracks();
        if (isMounted && backendTracks && backendTracks.length > 0) {
          setAudioQueue(backendTracks);
          if (!currentAudio && backendTracks[0]) {
            setCurrentAudio(backendTracks[0]);
          }
        } else {
          const audioRes = await youtubeApi.searchGospelAudio(searchQuery.trim() || 'Gospel Worship Podcast Audio Sermon');
          if (isMounted && audioRes.tracks && audioRes.tracks.length > 0) {
            setAudioQueue(audioRes.tracks);
            if (audioRes.isRealYoutubeData && audioRes.tracks[0]) {
              setCurrentAudio(prev => prev ? prev : audioRes.tracks[0]);
            }
          }
        }
      } catch (e) {
        console.error('Error fetching audio tracks:', e);
      }

      if (isMounted) setIsYoutubeLoading(false);
    };

    loadYoutubeStreams();
    return () => { isMounted = false; };
  }, [searchQuery, selectedCategory]);

  // 🕒 Watch History State & Local Persistence
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('gospread_watch_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load watch history:', e);
    }
    return [];
  });

  const addToWatchHistory = (video: VideoStream) => {
    setWatchHistory(prev => {
      const filtered = prev.filter(item => item.video.id !== video.id);
      const updated = [{ video, watchedAt: Date.now() }, ...filtered].slice(0, 30);
      try {
        localStorage.setItem('gospread_watch_history', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const removeFromWatchHistory = (videoId: string) => {
    setWatchHistory(prev => {
      const updated = prev.filter(item => item.video.id !== videoId);
      try {
        localStorage.setItem('gospread_watch_history', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const clearWatchHistory = () => {
    setWatchHistory([]);
    localStorage.removeItem('gospread_watch_history');
  };
  
  // Watch view state & Channel Following state
  const [activeVideo, setActiveVideo] = useState<VideoStream | null>(null);
  const [isPipDocked, setIsPipDocked] = useState(false);
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([]);
  const [followerCounts, setFollowerCounts] = useState<Record<string, number>>({});
  const [bellSettings, setBellSettings] = useState<Record<string, 'all' | 'personalized' | 'none'>>({});
  const [selectedChannelModal, setSelectedChannelModal] = useState<string | null>(null);
  const [followToast, setFollowToast] = useState<string | null>(null);

  // Church Membership & Member Count State
  const [joinedChurches, setJoinedChurches] = useState<string[]>(() => {
    const saved = localStorage.getItem('gospread_joined_churches');
    return saved ? JSON.parse(saved) : [];
  });

  const [churchMemberCounts, setChurchMemberCounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('gospread_church_member_counts');
    return saved ? JSON.parse(saved) : {};
  });

  const [dualJoinNotification, setDualJoinNotification] = useState<{
    churchName: string;
    userNotice: string;
    churchNotice: string;
  } | null>(null);

  const handleToggleJoinChurch = (churchName: string) => {
    setJoinedChurches(prev => {
      const isAlreadyJoined = prev.some(c => c.toLowerCase() === churchName.toLowerCase());
      const updated = isAlreadyJoined
        ? prev.filter(c => c.toLowerCase() !== churchName.toLowerCase())
        : [...prev, churchName];

      localStorage.setItem('gospread_joined_churches', JSON.stringify(updated));

      // Update church member count
      setChurchMemberCounts(mc => {
        const current = mc[churchName] || 0;
        const newCount = Math.max(0, current + (isAlreadyJoined ? -1 : 1));
        const updatedMc = { ...mc, [churchName]: newCount };
        localStorage.setItem('gospread_church_member_counts', JSON.stringify(updatedMc));
        return updatedMc;
      });

      // Auto-follow if joining
      if (!isAlreadyJoined && !subscribedChannels.some(s => s.toLowerCase() === churchName.toLowerCase())) {
        setSubscribedChannels(sub => [...sub, churchName]);
      }

      if (!isAlreadyJoined) {
        setDualJoinNotification({
          churchName,
          userNotice: `🎉 Welcome to ${churchName}! You are now an official registered member. Certificate of Fellowship issued!`,
          churchNotice: `⛪ Admin Log Alert: New member registration notification sent to ${churchName} pastoral team.`
        });
        setTimeout(() => setDualJoinNotification(null), 8000);
      } else {
        setFollowToast(`You left ${churchName} church membership.`);
        setTimeout(() => setFollowToast(null), 3000);
      }

      return updated;
    });
  };

  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  
  // Video player controls state
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Audio player state
  const [currentAudio, setCurrentAudio] = useState<AudioTrack | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [audioQueue, setAudioQueue] = useState<AudioTrack[]>([]);

  const handlePlayAudioTrack = (track: AudioTrack) => {
    if (currentAudio?.id === track.id) {
      setIsAudioPlaying(!isAudioPlaying);
    } else {
      setCurrentAudio(track);
      setIsAudioPlaying(true);
      setIsVideoPlaying(false);
    }
  };

  const handleAddToAudioQueue = (track: AudioTrack) => {
    if (!audioQueue.some((t) => t.id === track.id)) {
      setAudioQueue((prev) => [...prev, track]);
    }
  };

  // Saved / Prayer
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [prayerModalOpen, setPrayerModalOpen] = useState(false);
  const [prayerText, setPrayerText] = useState('');
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  // 💳 Giving & Payments State
  const [showGivingModal, setShowGivingModal] = useState(false);
  const [givingModalTarget, setGivingModalTarget] = useState<GivingTarget | null>(null);
  const [totalGivingAmount, setTotalGivingAmount] = useState(0);
  const [givingToast, setGivingToast] = useState<string | null>(null);

  // 🔥 Gamification & UI/UX Psychology Engagement State
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showPromiseModal, setShowPromiseModal] = useState(false);
  const [showShortsModal, setShowShortsModal] = useState(false);
  const [showDjangoModal, setShowDjangoModal] = useState(false);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserAccountDropdown, setShowUserAccountDropdown] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadingVideo, setDownloadingVideo] = useState<VideoStream | null>(null);

  const handleOpenDownloadModal = (videoToDownload?: VideoStream | null) => {
    setDownloadingVideo(videoToDownload || activeVideo);
    setShowDownloadModal(true);
  };
  const [userSession, setUserSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('gospread_user_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      id: '',
      username: '',
      email: '',
      fullName: '',
      churchName: '',
      avatarUrl: '',
      isLoggedIn: false,
      token: ''
    };
  });
  const [streakDays, setStreakDays] = useState(0);
  const [praiseXp, setPraiseXp] = useState(0);

  const handleClaimDailyReward = (xpGained: number) => {
    setPraiseXp(prev => prev + xpGained);
    setStreakDays(prev => Math.min(7, prev + 1));
  };

  const handleOpenGiving = (target?: GivingTarget) => {
    setGivingModalTarget(target || {
      id: 'platform-global',
      name: 'Gospread Global Mission Fund',
      avatar: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=120&q=80',
      type: 'platform',
      categoryTitle: 'Global Gospel Broadcasting & Satellite Network'
    });
    setShowGivingModal(true);
  };

  const handlePaymentSuccess = (amount: number, targetName: string, givingType: string) => {
    setTotalGivingAmount(prev => prev + amount);
    setGivingToast(`🙌 Seed of $${amount} received for ${targetName}! God bless your cheerful giving.`);
    
    // Add Super Amen highlight message to chat if watching active live stream
    if (givingType === 'super_amen' && activeVideo) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `super-amen-${Date.now()}`,
          user: 'Senior Member (Super Amen)',
          text: `🙌 Sowed $${amount} Super Amen Blessing for ${activeVideo.speakerOrArtist}!`,
          time: 'Just now',
          badge: 'VIP',
          reactionCount: 5,
          reactions: { amen: 3, fire: 2, heart: 0, pray: 0 },
          userReactions: ['amen']
        }
      ]);
    }

    setTimeout(() => setGivingToast(null), 4500);
  };
  
  // Showcase state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  const promptText = "A sleek dark-themed YouTube style Gospel streaming interface mockup, featuring a centered search bar, top category filter chips, main live worship video player with live chat panel, grid of video thumbnails, and 24/7 praise audio stream cards.";

  const categories = [
    { label: 'All', icon: Compass },
    { label: 'Discover Ministries', icon: Building2 },
    { label: 'Podcasts', icon: Music },
    { label: 'Church Schedules', icon: Calendar },
    { label: 'Following', icon: UserCheck, count: subscribedChannels.length },
    { label: 'Live Worship', icon: Tv },
    { label: '24/7 Gospel Radio', icon: Radio },
    { label: 'Sermons', icon: Mic2 },
    { label: 'Gospel Music', icon: Music },
    { label: 'Choir Special', icon: Headphones },
  ];

  // Category options

  const toggleSubscribe = (channelName: string) => {
    setSubscribedChannels(prev => {
      const isSubbed = prev.includes(channelName);
      const newSubbed = isSubbed 
        ? prev.filter(c => c.toLowerCase() !== channelName.toLowerCase()) 
        : [...prev, channelName];
      
      // Update follower count
      setFollowerCounts(fc => ({
        ...fc,
        [channelName]: Math.max(0, (fc[channelName] || 1000) + (isSubbed ? -1 : 1))
      }));

      // Trigger notification toast
      if (!isSubbed) {
        setFollowToast(`🔔 You are now following ${channelName}! Live worship notifications enabled.`);
        setBellSettings(bs => ({ ...bs, [channelName]: 'all' }));
      } else {
        setFollowToast(`Unfollowed ${channelName}`);
      }
      setTimeout(() => setFollowToast(null), 3500);

      return newSubbed;
    });
  };

  const handleBellChange = (channelName: string, setting: 'all' | 'personalized' | 'none') => {
    setBellSettings(prev => ({ ...prev, [channelName]: setting }));
    setFollowToast(`Notification preference for ${channelName} updated to: ${setting.toUpperCase()}`);
    setTimeout(() => setFollowToast(null), 3000);
  };

  const getChannelAvatar = (channelName: string) => {
    const match = videoStreams.find(v => 
      v.churchOrMinistry.toLowerCase().includes(channelName.toLowerCase()) || 
      v.speakerOrArtist.toLowerCase().includes(channelName.toLowerCase())
    );
    if (match) return match.channelAvatar;
    const subMatch = SUBSCRIPTION_CHANNELS.find(c => c.name.toLowerCase().includes(channelName.toLowerCase()));
    if (subMatch) return subMatch.avatar;
    return 'https://images.unsplash.com/photo-[#1534528741775-53994a69daeb]?auto=format&fit=crop&w=120&q=80';
  };

  const toggleLike = (videoId: string) => {
    setLikedVideos(prev =>
      prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
    );
  };

  const toggleSave = (id: string) => {
    setSavedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const msg: ChatMessage = {
      id: `c-${Date.now()}`,
      user: 'You',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPrayer: false,
      reactionCount: 0,
      reactions: { amen: 0, fire: 0, heart: 0, pray: 0 },
      userReactions: []
    };
    setChatMessages(prev => [...prev, msg]);
  };

  const handleToggleReaction = (messageId: string, reactionType: ReactionType) => {
    setChatMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        const userReactions = msg.userReactions || [];
        const reactions = msg.reactions || { amen: 0, fire: 0, heart: 0, pray: 0 };
        const hasAlreadyReacted = userReactions.includes(reactionType);

        const newUserReactions = hasAlreadyReacted
          ? userReactions.filter((r) => r !== reactionType)
          : [...userReactions, reactionType];

        const currentCount = reactions[reactionType] || 0;
        const newCountForType = hasAlreadyReacted
          ? Math.max(0, currentCount - 1)
          : currentCount + 1;

        const newReactions = {
          ...reactions,
          [reactionType]: newCountForType
        };

        const newTotalCount = Object.values(newReactions).reduce((sum: number, val: number) => sum + val, 0);

        return {
          ...msg,
          userReactions: newUserReactions,
          reactions: newReactions,
          reactionCount: newTotalCount
        };
      })
    );
  };

  const handleSelectVideo = (video: VideoStream) => {
    setActiveVideo(video);
    setIsVideoPlaying(true);
    setIsAudioPlaying(false);
    addToWatchHistory(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleSubmitPrayer = (e: FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;
    setPrayerSubmitted(true);
    setTimeout(() => {
      setPrayerSubmitted(false);
      setPrayerModalOpen(false);
      setPrayerText('');
    }, 1800);
  };

  const handlePublishSuccess = (newStream: VideoStream) => {
    setVideoStreams(prev => [newStream, ...prev]);
    setActiveVideo(newStream);
    setActiveTab('platform');
  };

  // Filter video streams based on search and category
  const filteredVideos = videoStreams.filter(v => {
    let matchesCategory = false;
    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else if (selectedCategory === 'Following') {
      matchesCategory = subscribedChannels.some(ch => 
        v.churchOrMinistry.toLowerCase().includes(ch.toLowerCase()) || 
        v.speakerOrArtist.toLowerCase().includes(ch.toLowerCase())
      );
    } else if (selectedCategory === '24/7 Gospel Radio') {
      matchesCategory = false;
    } else {
      matchesCategory = v.category === selectedCategory;
    }

    const matchesSearch = 
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.speakerOrArtist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.churchOrMinistry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`min-h-screen font-sans selection:bg-pink-500 selection:text-white flex flex-col pb-20 transition-all duration-500 relative overflow-x-hidden ${theme === 'light' ? 'light-theme text-[#0f172a]' : 'bg-[#0f0f0f] text-slate-100'}`}>
      
      {/* ☁️ FLOATING SUNSET PINK & BLUE CLOUD BACKDROP LAYERS */}
      {theme === 'light' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-75">
          {/* Magenta & Rose Sunset Clouds */}
          <div className="sky-cloud-1 absolute -top-16 -left-20 w-[650px] h-[350px] bg-pink-400/35 rounded-full blur-3xl" />
          <div className="sky-cloud-2 absolute top-1/4 -right-28 w-[750px] h-[400px] bg-purple-400/30 rounded-full blur-3xl" />
          <div className="sky-cloud-1 absolute bottom-12 left-1/3 w-[850px] h-[450px] bg-fuchsia-300/30 rounded-full blur-3xl" />
          <div className="sky-shimmer absolute top-16 right-1/3 w-[350px] h-[350px] bg-amber-300/25 rounded-full blur-2xl" />
          <div className="sky-cloud-2 absolute top-2/3 left-10 w-[550px] h-[300px] bg-sky-300/30 rounded-full blur-3xl" />
        </div>
      )}
      
      {/* 🔴 HEADER */}
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left Logo */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-300 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <GospreadLogo
            size="sm"
            badgeText="Live"
            badgeVariant="live"
            onClick={() => { setActiveVideo(null); setSelectedCategory('All'); }}
          />
        </div>

        {/* Center Search Bar */}
        <SearchEngineOverlay
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectVideo={handleSelectVideo}
          onSelectAudioTrack={handlePlayAudioTrack}
          onSelectChannel={(channelName) => setSelectedChannelModal(channelName)}
          activeVideo={activeVideo}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          subscribedChannels={subscribedChannels}
          onDownloadVideo={handleOpenDownloadModal}
        />

        {/* Right Header Actions & Engagement Psychology Triggers */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Group 1: Faith Progress & Daily Rhema */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 sm:p-1 rounded-full border border-slate-800">
            {/* Daily Streak & Praise XP Badge */}
            <button
              onClick={() => setShowStreakModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-500/40 text-xs font-black shadow-md transition shrink-0"
              title="Daily Faith Streak & Kingdom Level"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{streakDays}d</span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-normal">|</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span className="text-[10px] font-mono text-slate-200">{praiseXp} XP</span>
              </span>
            </button>

            {/* Daily Rhema Promise Card Button */}
            <button
              onClick={() => setShowPromiseModal(true)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition shrink-0"
              title="Draw Today's Rhema Promise Word"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Rhema</span>
            </button>
          </div>

          {/* Group 2: Media & Shorts */}
          <button
            onClick={() => setShowShortsModal(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition shrink-0"
            title="Watch Bite-sized Grace Shorts & Sermons"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Shorts</span>
          </button>

          {/* Group 3: Kingdom Support & Django Backend Integration */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => handleOpenGiving()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shrink-0 shadow-sm"
              title="Support Gospread Platform & Kingdom Ministries"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Support</span>
            </button>
          </div>

          {/* Group 4: Quick Activity & User Account */}
          <div className="flex items-center gap-1 sm:gap-1.5 pl-0.5 sm:pl-1">
            {/* 🌸 Sky Pink & Blue Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className={`p-1.5 rounded-full transition flex items-center justify-center sm:px-2.5 py-1 text-xs font-bold border shadow-md ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 text-white border-pink-300/80 shadow-pink-500/25'
                  : 'bg-slate-900 text-pink-400 border-slate-700 hover:bg-slate-800'
              }`}
              title={theme === 'light' ? "Sky Pink & Blue Sunset Theme Active" : "Switch to Sky Pink & Blue Sunset Theme"}
            >
              {theme === 'light' ? (
                <Sun className="w-3.5 h-3.5 text-pink-200 fill-pink-200" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-pink-400" />
              )}
              <span className="hidden xl:inline text-[11px] font-bold text-white ml-1">
                {theme === 'light' ? 'Sunset 🌸' : 'Night'}
              </span>
            </button>

            <button 
              className="hidden sm:flex p-1.5 sm:p-2 rounded-full hover:bg-slate-800 text-slate-300 relative transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            </button>

            {/* Quick Settings Icon Button (Desktop only, mobile in drawer) */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="hidden md:flex items-center justify-center p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700 transition"
              title="Account & Streaming Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile Avatar Header Button with Account Dropdown Popover */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUserAccountDropdown(prev => !prev)}
                className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-full border transition shrink-0 ${
                  activeTab === 'profile' || showUserAccountDropdown
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
                title="User Account & Kingdom Control Center"
              >
                {userSession.avatarUrl ? (
                  <img
                    src={userSession.avatarUrl}
                    alt={userSession.fullName || userSession.username || 'User'}
                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover ring-2 ring-amber-400"
                  />
                ) : (
                  <div className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    activeTab === 'profile' || showUserAccountDropdown
                      ? 'bg-slate-950 text-amber-400'
                      : 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                  }`}>
                    {userSession.fullName ? (
                      userSession.fullName.charAt(0).toUpperCase()
                    ) : userSession.username ? (
                      userSession.username.charAt(0).toUpperCase()
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-bold">
                  {userSession.isLoggedIn
                    ? (userSession.fullName ? userSession.fullName.split(' ')[0] : userSession.username || 'Believer')
                    : 'Account'}
                </span>
              </motion.button>

              <UserAccountMenuDropdown
                isOpen={showUserAccountDropdown}
                onClose={() => setShowUserAccountDropdown(false)}
                userSession={userSession}
                streakDays={streakDays}
                praiseXp={praiseXp}
                onOpenSettings={() => setShowSettingsModal(true)}
                onOpenProfile={() => setActiveTab('profile')}
                onOpenCommunity={() => setActiveTab('community')}
                onOpenHistory={() => setActiveTab('history')}
                onOpenGiving={() => handleOpenGiving()}
                onOpenDjango={() => setShowDjangoModal(true)}
                onOpenAuth={() => setShowAuthModal(true)}
                onOpenAuthPage={handleOpenAuthPage}
                onLogout={() => {
                  djangoApi.logout();
                  setUserSession({
                    id: 'guest',
                    username: 'guest',
                    email: '',
                    fullName: '',
                    churchName: '',
                    avatarUrl: '',
                    isLoggedIn: false,
                    token: ''
                  });
                  localStorage.removeItem('gospread_user_session');
                }}
                theme={theme}
                onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 🚀 Community Social Proof Live Ticker */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-1.5 text-[11px] text-slate-400 flex items-center justify-between gap-3 overflow-hidden select-none">
        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Global Kingdom Activity</span>
        </div>

        <div className="flex-1 overflow-hidden">
          <motion.div
            animate={{ x: ['100%', '-100%'] }}
            transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
            className="whitespace-nowrap flex items-center gap-8 text-slate-300 font-medium"
          >
            <span>🙌 <strong className="text-amber-300">Grace City Cathedral</strong> live stream reached 14,280 active worshipers!</span>
            <span>🌱 <strong className="text-emerald-400">Sister Hannah</strong> sowed $100 Super Amen Seed for Pastor Mark Anthony!</span>
            <span>🔥 <strong className="text-amber-400">Brother David</strong> reached 7-Day Grace Streak and unlocked 'Overcomer' badge!</span>
            <span>🎙️ <strong className="text-blue-300">Gospread Radio</strong> 24/7 Praise Feed active across 84 nations!</span>
          </motion.div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 🔴 DESKTOP SIDEBAR */}
        <aside className={`${isSidebarOpen ? 'w-56' : 'w-16'} bg-[#0d0d0f] border-r border-slate-800/80 flex-col justify-between py-3 transition-all duration-300 shrink-0 hidden md:flex select-none`}>
          <div className="space-y-4 px-2 overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-none">
            {[
              {
                section: 'Platform',
                items: [
                  { id: 'home', label: 'Home Feed', icon: Compass },
                  { id: 'community', label: 'Fellowship & Voices', icon: MessageSquareHeart, badge: 'COMMUNITY', badgeStyle: 'bg-amber-500 text-slate-950 font-black' },
                  { id: 'discover', label: 'Discover Ministries', icon: Building2, badge: 'EXPLORE', badgeStyle: 'bg-amber-500 text-slate-950 font-black' },
                  { id: 'history', label: 'Watch History', icon: History, badge: watchHistory.length > 0 ? `${watchHistory.length}` : undefined, badgeStyle: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
                  { id: 'profile', label: 'My Profile', icon: User, badge: 'YOU', badgeStyle: 'bg-amber-500 text-slate-950 font-black' },
                  { id: 'settings', label: 'Account Settings', icon: Settings, badge: 'PREFS', badgeStyle: 'bg-slate-800 text-amber-400 border border-slate-700' },
                ],
              },
              {
                section: 'Worship & Media',
                items: [
                  { id: 'live', label: 'Live Broadcasts', icon: Tv, badge: 'LIVE', badgeStyle: 'bg-red-600 text-white font-bold' },
                  { id: 'radio', label: '24/7 Gospel Radio', icon: RadioIcon, badge: '24/7', badgeStyle: 'bg-amber-400 text-slate-950 font-black' },
                  { id: 'podcasts', label: 'Audio Podcasts', icon: Music },
                  { id: 'schedule', label: 'Church Service Times', icon: Calendar, badge: 'TIMES', badgeStyle: 'bg-amber-400/90 text-slate-950 font-black' },
                ],
              },
              {
                section: 'Ministry & Support',
                items: [
                  { id: 'giving', label: 'Kingdom Giving', icon: DollarSign, badge: 'SUPPORT', badgeStyle: 'bg-emerald-500 text-slate-950 font-black' },
                  { id: 'create', label: 'Register Ministry', icon: UserCheck, badge: 'NEW', badgeStyle: 'bg-amber-500 text-slate-950 font-black' },
                ],
              },
            ].map((grp, idx) => (
              <div key={grp.section} className="space-y-1">
                {isSidebarOpen && (
                  <div className="px-2 pt-2 pb-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    {grp.section}
                  </div>
                )}
                {idx > 0 && !isSidebarOpen && <hr className="border-slate-800/80 my-2" />}

                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === 'create' 
                    ? activeTab === 'create' 
                    : item.id === 'profile'
                    ? activeTab === 'profile'
                    : item.id === 'auth'
                    ? activeTab === 'auth'
                    : item.id === 'community'
                    ? activeTab === 'community'
                    : item.id === 'history'
                    ? activeTab === 'history'
                    : item.id === 'discover'
                    ? activeTab === 'discover'
                    : (activeTab === 'platform' && (
                        (item.id === 'home' && selectedCategory === 'All') || 
                        (item.id === 'schedule' && selectedCategory === 'Church Schedules') ||
                        (item.id === 'podcasts' && selectedCategory === 'Podcasts') ||
                        (item.id === 'radio' && selectedCategory === '24/7 Gospel Radio')
                      ));
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'create') {
                          setActiveTab('create');
                        } else if (item.id === 'profile') {
                          setActiveTab('profile');
                        } else if (item.id === 'auth') {
                          handleOpenAuthPage('signin');
                        } else if (item.id === 'community') {
                          setActiveTab('community');
                          setIsPipDocked(false);
                          setActiveVideo(null);
                        } else if (item.id === 'settings') {
                          setShowSettingsModal(true);
                        } else if (item.id === 'history') {
                          setActiveTab('history');
                        } else if (item.id === 'discover') {
                          setActiveTab('discover');
                          setIsPipDocked(false);
                          setActiveVideo(null);
                        } else if (item.id === 'giving') {
                          handleOpenGiving();
                        } else {
                          setActiveTab('platform');
                          setIsPipDocked(false);
                          setSelectedCategory(
                            item.id === 'radio' ? '24/7 Gospel Radio' :
                            item.id === 'podcasts' ? 'Podcasts' :
                            item.id === 'schedule' ? 'Church Schedules' : 'All'
                          );
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive 
                          ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30' 
                          : 'text-slate-300 hover:bg-slate-800/70'
                      }`}
                      title={item.label}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${
                          isActive 
                            ? 'text-amber-400' 
                            : item.id === 'history' 
                            ? 'text-amber-400/80' 
                            : item.id === 'giving' 
                            ? 'text-emerald-400' 
                            : 'text-slate-400'
                        }`} />
                        {isSidebarOpen && <span className="truncate">{item.label}</span>}
                      </div>
                      {isSidebarOpen && item.badge && (
                        <span className={`px-1.5 py-0.2 rounded text-[8px] shrink-0 ${item.badgeStyle || 'bg-amber-500 text-slate-950 font-bold'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            <hr className="border-slate-800/80 my-2" />

            {/* Dedicated Watch History Quick Access Section */}
            {isSidebarOpen && (
              <div className="px-2 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <History className="w-3 h-3 text-amber-400" /> Watch History
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('history');
                    }}
                    className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                {watchHistory.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic px-1">No videos watched yet</p>
                ) : (
                  <div className="space-y-1">
                    {watchHistory.slice(0, 3).map((item) => (
                      <div
                        key={`${item.video.id}-${item.watchedAt}`}
                        onClick={() => handleSelectVideo(item.video)}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition group"
                        title={`Watch "${item.video.title}"`}
                      >
                        <div className="relative w-9 h-6 rounded overflow-hidden bg-slate-900 shrink-0">
                          <img
                            src={item.video.thumbnail}
                            alt={item.video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                          />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[11px] text-slate-300 font-medium truncate group-hover:text-amber-400 transition">
                            {item.video.title}
                          </p>
                          <p className="text-[9px] text-slate-500 truncate">
                            {item.video.speakerOrArtist}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <hr className="border-slate-800/80 my-2" />

            {/* Followed Channels */}
            {isSidebarOpen && (
              <div className="px-2 space-y-2 pb-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Followed Channels</span>
                  <span className="text-[10px] font-bold text-amber-400">{subscribedChannels.length}</span>
                </div>
                <div className="space-y-1">
                  {SUBSCRIPTION_CHANNELS.map((ch) => {
                    const isFollowed = subscribedChannels.includes(ch.name);
                    return (
                      <div
                        key={ch.name}
                        onClick={() => setSelectedChannelModal(ch.name)}
                        className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-800/80 cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img src={ch.avatar} alt={ch.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                          <span className="text-xs text-slate-300 truncate group-hover:text-amber-400 transition">{ch.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {ch.liveNow && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shrink-0" />}
                          {isFollowed && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* 📱 MOBILE SLIDE-OUT DRAWER SIDEBAR */}
        <AnimatePresence>
          {isSidebarOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex select-none">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-80 max-w-[85vw] bg-[#0c0c0e] border-r border-slate-800 h-full flex flex-col justify-between p-4 z-10 overflow-y-auto shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <GospreadLogo
                      size="sm"
                      badgeText="Menu"
                      badgeVariant="gold"
                      onClick={() => setIsSidebarOpen(false)}
                    />
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-5 py-4">
                    {[
                      {
                        section: 'Main Platform',
                        items: [
                          { id: 'home', label: 'Home Feed', icon: Compass },
                          { id: 'community', label: 'Fellowship & Testimonies', icon: MessageSquareHeart, badge: 'COMMUNITY', badgeStyle: 'bg-amber-500 text-slate-950 font-black' },
                          { id: 'discover', label: 'Discover Ministries', icon: Building2, badge: 'EXPLORE', badgeStyle: 'bg-amber-500 text-slate-950 font-black' },
                          { id: 'history', label: 'Watch History', icon: History, badge: watchHistory.length > 0 ? `${watchHistory.length}` : undefined, badgeStyle: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
                          { id: 'profile', label: 'My Kingdom Profile', icon: User, badge: 'YOU', badgeStyle: 'bg-amber-500 text-slate-950 font-black' },
                          { id: 'settings', label: 'Account Settings', icon: Settings, badge: 'PREFS', badgeStyle: 'bg-slate-800 text-amber-400 border border-slate-700' },
                        ],
                      },
                      {
                        section: 'Worship & Media',
                        items: [
                          { id: 'live', label: 'Live Broadcasts', icon: Tv, badge: 'LIVE', badgeStyle: 'bg-red-600 text-white font-bold' },
                          { id: 'radio', label: '24/7 Gospel Radio', icon: RadioIcon, badge: '24/7', badgeStyle: 'bg-amber-400 text-slate-950 font-black' },
                          { id: 'podcasts', label: 'Audio Podcasts', icon: Music },
                          { id: 'schedule', label: 'Church Service Times', icon: Calendar, badge: 'TIMES', badgeStyle: 'bg-amber-400/90 text-slate-950 font-black' },
                        ],
                      },
                      {
                        section: 'Ministry & Support',
                        items: [
                          { id: 'giving', label: 'Kingdom Giving & Offering', icon: DollarSign, badge: 'SUPPORT', badgeStyle: 'bg-emerald-500 text-slate-950 font-black' },
                          { id: 'create', label: 'Register Ministry Channel', icon: UserCheck, badge: 'NEW', badgeStyle: 'bg-amber-500 text-slate-950 font-black' },
                        ],
                      },
                    ].map((grp) => (
                      <div key={grp.section} className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                          {grp.section}
                        </span>
                        <div className="space-y-1">
                          {grp.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.id === 'create' 
                              ? activeTab === 'create' 
                              : item.id === 'profile'
                              ? activeTab === 'profile'
                              : item.id === 'auth'
                              ? activeTab === 'auth'
                              : item.id === 'community'
                              ? activeTab === 'community'
                              : item.id === 'history'
                              ? activeTab === 'history'
                              : item.id === 'discover'
                              ? activeTab === 'discover'
                              : (activeTab === 'platform' && (
                                  (item.id === 'home' && selectedCategory === 'All') || 
                                  (item.id === 'schedule' && selectedCategory === 'Church Schedules') ||
                                  (item.id === 'podcasts' && selectedCategory === 'Podcasts') ||
                                  (item.id === 'radio' && selectedCategory === '24/7 Gospel Radio')
                                ));

                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setIsSidebarOpen(false);
                                  if (item.id === 'create') {
                                    setActiveTab('create');
                                  } else if (item.id === 'profile') {
                                    setActiveTab('profile');
                                  } else if (item.id === 'auth') {
                                    handleOpenAuthPage('signin');
                                  } else if (item.id === 'community') {
                                    setActiveTab('community');
                                    setIsPipDocked(false);
                                    setActiveVideo(null);
                                  } else if (item.id === 'settings') {
                                    setShowSettingsModal(true);
                                  } else if (item.id === 'history') {
                                    setActiveTab('history');
                                  } else if (item.id === 'discover') {
                                    setActiveTab('discover');
                                    setIsPipDocked(false);
                                    setActiveVideo(null);
                                  } else if (item.id === 'giving') {
                                    handleOpenGiving();
                                  } else {
                                    setActiveTab('platform');
                                    setIsPipDocked(false);
                                    setSelectedCategory(
                                      item.id === 'radio' ? '24/7 Gospel Radio' :
                                      item.id === 'podcasts' ? 'Podcasts' :
                                      item.id === 'schedule' ? 'Church Schedules' : 'All'
                                    );
                                  }
                                }}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                                  isActive
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                                    : 'text-slate-200 hover:bg-slate-800/80'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-amber-400/80'}`} />
                                  <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span className={`px-2 py-0.5 rounded text-[9px] ${item.badgeStyle || 'bg-amber-500 text-slate-950 font-extrabold'}`}>
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <hr className="border-slate-800" />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Followed Ministries ({subscribedChannels.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {SUBSCRIPTION_CHANNELS.map((ch) => (
                          <div
                            key={ch.name}
                            onClick={() => {
                              setIsSidebarOpen(false);
                              setSelectedChannelModal(ch.name);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 cursor-pointer text-xs text-slate-300 transition"
                          >
                            <div className="flex items-center gap-2.5">
                              <img src={ch.avatar} alt={ch.name} className="w-6 h-6 rounded-full object-cover" />
                              <span className="font-medium">{ch.name}</span>
                            </div>
                            {ch.liveNow && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto flex flex-col pb-32 md:pb-16">
          
          {activeTab === 'auth' ? (
            <div className="p-2 sm:p-4 lg:p-6 max-w-7xl w-full mx-auto">
              <AuthPage
                initialMode={initialAuthMode}
                currentUser={userSession}
                onLoginSuccess={(newSession) => {
                  setUserSession(newSession);
                }}
                onLogout={() => {
                  djangoApi.logout();
                  setUserSession({
                    id: '',
                    username: '',
                    email: '',
                    fullName: 'Guest Believer',
                    churchName: 'Seeking Sanctuary',
                    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                    isLoggedIn: false
                  });
                }}
                onNavigateHome={() => {
                  setActiveTab('platform');
                  setSelectedCategory('All');
                }}
                onNavigateProfile={() => setActiveTab('profile')}
                onAwardXp={(amount, reason) => {
                  setPraiseXp(prev => {
                    const updated = prev + amount;
                    try {
                      localStorage.setItem('gospread_praise_xp', updated.toString());
                    } catch (e) {
                      console.error(e);
                    }
                    return updated;
                  });
                }}
              />
            </div>
          ) : activeTab === 'profile' ? (
            <div className="p-4 lg:p-6 max-w-7xl w-full mx-auto">
              <UserProfilePage
                streakDays={streakDays}
                praiseXp={praiseXp}
                totalGivingAmount={totalGivingAmount}
                savedIds={savedIds}
                onToggleSave={toggleSave}
                onPlayVideo={handleSelectVideo}
                onPlayAudio={handlePlayAudioTrack}
                subscribedChannels={subscribedChannels}
                joinedChurches={joinedChurches}
                churchMemberCounts={churchMemberCounts}
                onSelectChannelModal={(channel) => setSelectedChannelModal(channel)}
                onToggleJoinChurch={handleToggleJoinChurch}
                onToggleSubscribe={toggleSubscribe}
                onOpenGivingModal={handleOpenGiving}
                onOpenPrayerModal={() => setPrayerModalOpen(true)}
                onOpenSettingsModal={() => setShowSettingsModal(true)}
                onOpenCommunity={() => setActiveTab('community')}
                onOpenDiscover={() => setActiveTab('discover')}
                onOpenAuthPage={handleOpenAuthPage}
                currentUser={userSession}
              />
            </div>
          ) : activeTab === 'community' ? (
            <div className="p-2 sm:p-4 lg:p-6 max-w-7xl w-full mx-auto">
              <FellowshipCommunityHub
                userSession={userSession}
                streakDays={streakDays}
                praiseXp={praiseXp}
                onAwardXp={(amount, reason) => {
                  setPraiseXp(prev => {
                    const updated = prev + amount;
                    try {
                      localStorage.setItem('gospread_praise_xp', updated.toString());
                    } catch (e) {
                      console.error(e);
                    }
                    return updated;
                  });
                }}
                onOpenGiving={handleOpenGiving}
              />
            </div>
          ) : activeTab === 'history' ? (
            <div className="p-4 lg:p-6 max-w-7xl w-full mx-auto">
              <WatchHistoryView
                watchHistory={watchHistory}
                onSelectVideo={handleSelectVideo}
                onRemoveItem={removeFromWatchHistory}
                onClearHistory={clearWatchHistory}
                onToggleSave={toggleSave}
                savedIds={savedIds}
                onNavigateHome={() => {
                  setActiveTab('platform');
                  setSelectedCategory('All');
                }}
                onDownloadVideo={handleOpenDownloadModal}
              />
            </div>
          ) : activeTab === 'discover' ? (
            <DiscoverMinistriesHub
              subscribedChannels={subscribedChannels}
              joinedChurches={joinedChurches}
              churchMemberCounts={churchMemberCounts}
              onToggleJoinChurch={handleToggleJoinChurch}
              onToggleFollow={toggleSubscribe}
              bellSettings={bellSettings}
              onChangeBellSetting={handleBellChange}
              onSelectChannelModal={(channel) => setSelectedChannelModal(channel)}
              onOpenGivingModal={handleOpenGiving}
              onSelectVideo={handleSelectVideo}
              onPlayAudioTrack={handlePlayAudioTrack}
              allVideos={videoStreams}
              allAudio={audioQueue}
              streakDays={streakDays}
              praiseXp={praiseXp}
            />
          ) : activeTab === 'create' ? (
            <CreatePage 
              onPublishSuccess={handlePublishSuccess}
              onCancel={() => setActiveTab('platform')}
            />
          ) : activeTab === 'generated' ? (
            /* Visual Artwork Showcase */
            <div className="max-w-6xl w-full mx-auto px-4 py-6 flex flex-col items-center gap-6">
              <div className="relative group w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img
                    src={youtubeGospelImg}
                    alt="YouTube Gospel Streaming UI Mockup"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain object-center"
                  />
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="absolute bottom-4 right-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 p-2.5 rounded-xl border border-slate-700 backdrop-blur-md transition shadow-lg flex items-center gap-2 text-xs font-medium"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Expand Artwork</span>
                  </button>
                </div>
              </div>

              <div className="w-full flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold">
                    YouTube Gospel Layout
                  </span>
                  <span className="text-xs text-slate-400">Dark Mode UI Design Mockup</span>
                </div>

                <button
                  onClick={() => setActiveTab('platform')}
                  className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <span>Launch Live Stream</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (activeVideo && !isPipDocked) ? (
            /* Watch Theater Mode */
            <div className="max-w-7xl w-full mx-auto p-2.5 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Left Main Player */}
              <div className="lg:col-span-2 space-y-3">
                <VideoStreamFrame
                  video={activeVideo}
                  isPlaying={isVideoPlaying}
                  onTogglePlay={() => setIsVideoPlaying(!isVideoPlaying)}
                  isMuted={isVideoMuted}
                  onToggleMute={() => setIsVideoMuted(!isVideoMuted)}
                  onOpenGivingModal={handleOpenGiving}
                  onOpenFullscreen={() => setIsFullscreen(true)}
                  onOpenChannelProfile={(channel) => setSelectedChannelModal(channel)}
                  onTogglePip={() => setIsPipDocked(!isPipDocked)}
                  onDownloadVideo={handleOpenDownloadModal}
                />

                {/* D3 Real-Time Live Viewer Trend Sparkline */}
                <LiveViewerTrendSparkline video={activeVideo} isLive={activeVideo.isLive} />

                {/* Video Info */}
                <h1 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {activeVideo.title}
                </h1>

                {/* Channel Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={activeVideo.channelAvatar}
                      alt={activeVideo.speakerOrArtist}
                      onClick={() => setSelectedChannelModal(activeVideo.churchOrMinistry)}
                      className="w-9 h-9 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-amber-400 transition"
                      title="View channel profile"
                    />
                    <div>
                      <h3 
                        onClick={() => setSelectedChannelModal(activeVideo.churchOrMinistry)}
                        className="text-xs font-bold text-white flex items-center gap-1 cursor-pointer hover:text-amber-400 transition"
                      >
                        {activeVideo.churchOrMinistry}
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      </h3>
                      <p className="text-[10px] text-slate-400">
                        {((followerCounts[activeVideo.churchOrMinistry] || 482000) / 1000).toFixed(1)}K followers
                      </p>
                    </div>

                    {/* Follow / Following Button */}
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        onClick={() => toggleSubscribe(activeVideo.churchOrMinistry)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                          subscribedChannels.includes(activeVideo.churchOrMinistry)
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                        }`}
                      >
                        {subscribedChannels.includes(activeVideo.churchOrMinistry) ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>

                      {/* Notification Bell Icon when Following */}
                      {subscribedChannels.includes(activeVideo.churchOrMinistry) && (
                        <button
                          onClick={() => {
                            const current = bellSettings[activeVideo.churchOrMinistry] || 'all';
                            const next = current === 'all' ? 'personalized' : current === 'personalized' ? 'none' : 'all';
                            handleBellChange(activeVideo.churchOrMinistry, next);
                          }}
                          className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                          title="Notification preference (Click to toggle)"
                        >
                          {(bellSettings[activeVideo.churchOrMinistry] || 'all') === 'all' && <BellRing className="w-3.5 h-3.5 text-amber-400" />}
                          {(bellSettings[activeVideo.churchOrMinistry] || 'all') === 'personalized' && <Bell className="w-3.5 h-3.5 text-slate-300" />}
                          {(bellSettings[activeVideo.churchOrMinistry] || 'all') === 'none' && <BellOff className="w-3.5 h-3.5 text-slate-500" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Social Media Links Bar for Active Video Ministry */}
                  <div className="pt-2">
                    <SocialMediaLinksBar
                      churchOrChannelName={activeVideo.churchOrMinistry}
                      variant="compact"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-800/80 rounded-full border border-slate-700/50">
                      <button
                        onClick={() => toggleLike(activeVideo.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition border-r border-slate-700/80 ${
                          likedVideos.includes(activeVideo.id) ? 'text-red-500' : 'text-slate-300'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{activeVideo.likesCount}</span>
                      </button>
                      <button className="px-2.5 py-1.5 text-slate-300">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Sow Seed / Tithe Button for this video creator */}
                    <button
                      onClick={() => handleOpenGiving({
                        id: `video-${activeVideo.id}`,
                        name: activeVideo.churchOrMinistry,
                        avatar: activeVideo.channelAvatar,
                        type: 'church',
                        categoryTitle: `Support ${activeVideo.speakerOrArtist}`
                      })}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition"
                      title="Sow Seed or Give Tithe to this Ministry"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Sow Seed</span>
                    </button>

                    <button
                      onClick={() => toggleSave(activeVideo.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/80 text-xs text-slate-300 font-bold border border-slate-700/50 hover:bg-slate-700 transition"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{savedIds.includes(activeVideo.id) ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={async () => {
                        const shareData = {
                          title: activeVideo.title,
                          text: `Watch "${activeVideo.title}" by ${activeVideo.speakerOrArtist} on Gospread!`,
                          url: window.location.href,
                        };
                        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                          try {
                            await navigator.share(shareData);
                          } catch (err) {
                            if ((err as Error).name !== 'AbortError') {
                              navigator.clipboard.writeText(window.location.href);
                              alert('Video link copied to clipboard!');
                            }
                          }
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Video link copied to clipboard!');
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/80 text-xs text-slate-300 font-bold border border-slate-700/50 hover:bg-slate-700 transition"
                      title="Share Video"
                    >
                      <Share2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Share</span>
                    </button>

                    <button
                      onClick={() => handleOpenDownloadModal(activeVideo)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/80 text-xs text-slate-300 font-bold border border-slate-700/50 hover:bg-slate-700 transition"
                      title="Download Video & Audio for Offline Listening"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Description Box */}
                <div className="bg-[#181818] p-3 rounded-xl text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-white text-[11px]">
                    <span>{activeVideo.viewsText || `${activeVideo.viewersCount} watching`}</span>
                    <span>•</span>
                    <span>{activeVideo.date}</span>
                  </div>
                  <p className="line-clamp-2 leading-snug">{activeVideo.description}</p>
                </div>
              </div>

              {/* Right Sidebar: Chat & Up Next */}
              <div className="space-y-4">
                {/* Live Chat */}
                <LiveChatPanel
                  chatMessages={chatMessages}
                  onSendMessage={handleSendChatMessage}
                  onToggleReaction={handleToggleReaction}
                  onOpenGiving={handleOpenGiving}
                  activeVideo={activeVideo}
                />

                {/* Up Next List */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Up Next</h3>
                  <div className="space-y-2">
                    {videoStreams.filter(v => v.id !== activeVideo.id).map((v) => (
                      <motion.div
                        key={v.id}
                        whileHover={{ scale: 1.02, x: 2 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                        onClick={() => handleSelectVideo(v)}
                        className="flex gap-2.5 cursor-pointer group p-1 rounded-xl transition hover:bg-slate-900/60"
                      >
                        <div className="relative w-32 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0 shadow-md">
                          <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          <span className="absolute bottom-1 right-1 px-1 bg-black/80 text-[9px] text-white rounded font-mono">
                            {v.duration || 'LIVE'}
                          </span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-red-400 transition">
                            {v.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{v.speakerOrArtist}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Media Centric Grid Page */
            <div className="p-3 sm:p-4 lg:p-6 space-y-6 max-w-7xl w-full mx-auto">
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.label;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => {
                        if (cat.label === 'Discover Ministries') {
                          setActiveTab('discover');
                          setActiveVideo(null);
                        } else {
                          setSelectedCategory(cat.label);
                          if (activeTab !== 'platform') setActiveTab('platform');
                        }
                      }}
                      className={`px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shrink-0 min-h-[40px] sm:min-h-[34px] ${
                        isSelected
                          ? 'bg-white text-slate-950 shadow-md ring-2 ring-white/20'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 active:bg-slate-600'
                      }`}
                    >
                      <Icon className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span>{cat.label}</span>
                      {cat.count !== undefined && cat.count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[9px] font-black ${
                          isSelected ? 'bg-slate-950 text-white' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {cat.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 🎙️ PODCASTS & AUDIO HUB VIEW */}
              {(selectedCategory === 'Podcasts' || selectedCategory === '24/7 Gospel Radio') && (
                <AudioPodcastHub
                  currentTrack={currentAudio}
                  isPlaying={isAudioPlaying}
                  onPlayTrack={handlePlayAudioTrack}
                  onAddToQueue={handleAddToAudioQueue}
                  queuedTrackIds={audioQueue.map((t) => t.id)}
                  onOpenGivingModal={handleOpenGiving}
                  onOpenChannelProfile={(channel) => setSelectedChannelModal(channel)}
                />
              )}

              {/* 📅 CHURCH SCHEDULES SPECIAL SECTION */}
              {selectedCategory === 'Church Schedules' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-4 sm:p-5 rounded-3xl space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-amber-400" />
                      <div>
                        <h2 className="text-base font-bold text-white">Global Church Service Schedules & Broadcasting Times</h2>
                        <p className="text-xs text-slate-400">Weekly live service times, midweek prayer altars, and special fellowship gatherings</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(CHURCH_SCHEDULES).length === 0 ? (
                      <div className="p-12 rounded-3xl bg-[#0f0f0f] border border-dashed border-slate-800 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-white">No Church Schedules Found</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Church broadcasting schedules and weekly service times will be listed here once registered by verified ministries.
                        </p>
                      </div>
                    ) : (
                      Object.entries(CHURCH_SCHEDULES).map(([churchName, schedules]) => (
                      <div
                        key={churchName}
                        className="bg-[#0f0f0f] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-5 hover:border-amber-500/30 transition shadow-xl"
                      >
                        {/* Header & Channel Profile Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                churchName.includes('Grace City') 
                                  ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                                  : churchName.includes('Covenant')
                                  ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80'
                                  : churchName.includes('Global')
                                  ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
                                  : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'
                              }
                              alt={churchName}
                              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-500/30 shadow-md shrink-0"
                            />
                            <div>
                              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                                {churchName}
                                <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-400" />
                              </h3>
                              <p className="text-xs text-slate-400">{schedules.length} Weekly Broadcast Services</p>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedChannelModal(churchName)}
                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-amber-300 font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[36px]"
                          >
                            <span>View Church Profile</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Social Media Links Bar for Ministry */}
                        <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                          <SocialMediaLinksBar
                            churchOrChannelName={churchName}
                            variant="compact"
                          />
                        </div>

                        {/* Multi-Campus Locations Component */}
                        <ChurchLocationsCard
                          churchName={churchName}
                        />

                        {/* Weekly Service Schedule List */}
                        <div className="space-y-2.5 pt-2">
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" /> Weekly Service & Gathering Times
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {schedules.map((sch) => (
                              <div
                                key={sch.id}
                                className="p-4 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-2 hover:border-amber-500/40 transition"
                              >
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                                      {sch.day}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1 border border-slate-700">
                                      <Clock className="w-3 h-3 text-amber-400" />
                                      {sch.time}
                                    </span>
                                  </div>
                                  {sch.isLiveNow && (
                                    <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                                      <Radio className="w-3 h-3" /> Streaming Live
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-xs font-bold text-white mt-1">{sch.title}</h4>
                                <p className="text-xs sm:text-[10px] text-slate-400 leading-normal">{sch.description}</p>
                                
                                <div className="flex items-center justify-between text-xs sm:text-[10px] text-slate-500 pt-2 border-t border-slate-800/60 flex-wrap gap-1">
                                  <span className="text-slate-400">Location / Stream: {sch.locationOrStream}</span>
                                  <span className="text-amber-400 font-bold">{sch.speakerOrLeader}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )))}
                  </div>
                </div>
              )}
              {selectedCategory === 'Following' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/20 p-4 sm:p-5 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-amber-400" /> Your Followed Gospel Channels ({subscribedChannels.length})
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Direct updates from ministries and creators you follow</p>
                      </div>
                    </div>

                    {/* Single-column on mobile, multi-column on tablet and desktop */}
                    {SUBSCRIPTION_CHANNELS.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                        <UserCheck className="w-6 h-6 text-slate-600 mx-auto" />
                        <p className="text-xs font-semibold text-slate-300">No Channels Available</p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Verified gospel channels and ministries will appear here once connected.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-3">
                        {SUBSCRIPTION_CHANNELS.map((ch) => {
                          const isFollowed = subscribedChannels.includes(ch.name);
                          return (
                            <motion.div
                              key={ch.name}
                              whileHover={{ scale: 1.02, y: -2, boxShadow: "0 15px 30px -5px rgba(245, 158, 11, 0.2)" }}
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              className={`p-3.5 sm:p-3 rounded-2xl border transition flex flex-row sm:flex-col items-center justify-between sm:justify-start text-left sm:text-center gap-3 relative ${
                                isFollowed ? 'bg-slate-900/90 border-amber-500/30' : 'bg-slate-900/40 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-3 sm:flex-col sm:gap-2 flex-1 min-w-0">
                                <motion.img
                                  src={ch.avatar}
                                  alt={ch.name}
                                  whileHover={{ scale: 1.15 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                  onClick={() => setSelectedChannelModal(ch.name)}
                                  className="w-13 h-13 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer ring-2 ring-slate-700 hover:ring-amber-400 transition shrink-0"
                                />
                                <div className="overflow-hidden min-w-0">
                                  <h4
                                    onClick={() => setSelectedChannelModal(ch.name)}
                                    className="text-xs sm:text-xs font-bold text-white truncate cursor-pointer hover:text-amber-400"
                                  >
                                    {ch.name}
                                  </h4>
                                  <p className="text-[11px] sm:text-[10px] text-slate-400 mt-0.5">
                                    {((followerCounts[ch.name] || 482000) / 1000).toFixed(1)}K followers
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => toggleSubscribe(ch.name)}
                                className={`px-4 py-2 sm:w-full sm:py-1.5 rounded-xl text-xs sm:text-[10px] font-bold transition flex items-center justify-center gap-1.5 shrink-0 min-h-[40px] sm:min-h-[32px] ${
                                  isFollowed
                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 active:bg-slate-600'
                                    : 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700'
                                }`}
                              >
                                {isFollowed ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <UserPlus className="w-3.5 h-3.5" />}
                                <span>{isFollowed ? 'Following' : 'Follow'}</span>
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 🌟 KINGDOM EXPERIENCE HOME FEED (What's happening NOW -> What to watch -> Who to follow -> How to grow) */}
              {selectedCategory === 'All' && searchQuery.trim() === '' && (
                <KingdomHomeFeed
                  videoStreams={videoStreams}
                  audioQueue={audioQueue}
                  currentAudio={currentAudio}
                  isAudioPlaying={isAudioPlaying}
                  onSelectVideo={handleSelectVideo}
                  onPlayAudioTrack={handlePlayAudioTrack}
                  subscribedChannels={subscribedChannels}
                  onToggleFollow={toggleSubscribe}
                  onOpenChannelModal={(ch) => setSelectedChannelModal(ch)}
                  onOpenGivingModal={handleOpenGiving}
                  onOpenDailyPromise={() => setShowPromiseModal(true)}
                  onOpenDailyStreak={() => setShowStreakModal(true)}
                  onOpenPrayerModal={() => setPrayerModalOpen(true)}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    setActiveVideo(null);
                  }}
                  followerCounts={followerCounts}
                  streakDays={streakDays}
                  praiseXp={praiseXp}
                />
              )}

              {/* 24/7 Gospel Radio Visual Hero Card (When category is selected or searched) */}
              {currentAudio && (selectedCategory === '24/7 Gospel Radio') && (
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-950 border border-red-900/40 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-2xl">
                  <div className="flex items-center gap-3.5 sm:gap-5 w-full md:w-auto">
                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 ring-2 ring-red-500/40 shadow-xl group cursor-pointer" onClick={() => handlePlayAudioTrack(currentAudio)}>
                      <img src={currentAudio.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'} alt={currentAudio.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Radio className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-pulse" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-600 text-white font-extrabold text-[9px] rounded uppercase tracking-wider">
                          24/7 Gospel Radio
                        </span>
                        {isAudioPlaying && (
                          <div className="flex items-end gap-0.5 h-3">
                            <span className="w-0.5 bg-red-500 animate-bounce h-2" />
                            <span className="w-0.5 bg-red-500 animate-bounce h-3 delay-75" />
                            <span className="w-0.5 bg-red-500 animate-bounce h-1.5 delay-150" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white mt-1 truncate">{currentAudio.title}</h3>
                      <p className="text-xs text-slate-400 truncate">{currentAudio.artistOrPreacher}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlayAudioTrack(currentAudio)}
                    className="w-full md:w-auto px-6 py-3 sm:py-2.5 rounded-2xl sm:rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition min-h-[44px]"
                  >
                    {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    <span>{isAudioPlaying ? 'Pause Stream' : 'Listen Live'}</span>
                  </button>
                </div>
              )}

              {/* Dedicated Filtered Video & Audio Lists (Shown when user searches or picks specific categories other than All) */}
              {(selectedCategory !== 'All' || searchQuery.trim() !== '') && selectedCategory !== 'Podcasts' && selectedCategory !== 'Church Schedules' && selectedCategory !== 'Following' && (
                <>
                  {/* Audio Tracks Strip (Only for Music/Radio category or search) */}
                  {(selectedCategory === 'Worship Music' || selectedCategory === '24/7 Gospel Radio') && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <Music className="w-4 h-4 text-amber-400" /> Praise & Worship Audio Tracks
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-3">
                        {audioQueue.map((track) => (
                          <motion.div
                            key={track.id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            onClick={() => handlePlayAudioTrack(track)}
                            className={`p-3 sm:p-2.5 rounded-2xl border transition cursor-pointer group flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-3 sm:gap-0 ${
                              currentAudio?.id === track.id && isAudioPlaying
                                ? 'bg-red-950/40 border-red-600 shadow-md shadow-red-900/20'
                                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 active:bg-slate-850'
                            }`}
                          >
                            <div className="flex items-center gap-3 sm:flex-col sm:items-stretch sm:gap-0 flex-1 min-w-0">
                              <div className="relative w-14 h-14 sm:w-full sm:aspect-square rounded-xl overflow-hidden sm:mb-2 shrink-0 bg-slate-950">
                                <img src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                  <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                                    <Play className="w-4 h-4 fill-white ml-0.5" />
                                  </div>
                                </div>
                              </div>

                              <div className="overflow-hidden min-w-0">
                                <h4 className="text-xs sm:text-xs font-bold text-white truncate group-hover:text-amber-300 transition">{track.title}</h4>
                                <p className="text-[11px] sm:text-[10px] text-slate-400 truncate mt-0.5">{track.artistOrPreacher}</p>
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayAudioTrack(track);
                              }}
                              className={`sm:hidden w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
                                currentAudio?.id === track.id && isAudioPlaying
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-200 active:bg-red-600 active:text-white'
                              }`}
                              title="Play audio track"
                            >
                              {currentAudio?.id === track.id && isAudioPlaying ? (
                                <Pause className="w-4 h-4 fill-slate-950" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visual Main Stream Grid */}
                  <div className="space-y-4 sm:space-y-3">
                    {searchQuery.trim() !== '' && (
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                            <Search className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                              Search results for <span className="text-amber-400 font-mono font-bold">"{searchQuery}"</span>
                            </h3>
                            <p className="text-[10px] text-slate-400">
                              Showing {filteredVideos.length} matching video streams and sermons
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 shrink-0 min-h-[36px]"
                        >
                          <X className="w-3.5 h-3.5 text-amber-400" />
                          <span>Clear Search</span>
                        </button>
                      </div>
                    )}

                    <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Tv className="w-4 h-4 text-red-500" /> {selectedCategory === 'All' ? 'Video Streams & Sermons' : `${selectedCategory} Streams`}
                    </h2>

                    {filteredVideos.length === 0 ? (
                      <div className="py-12 px-4 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
                          <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-white">No video streams match "{searchQuery}"</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Try adjusting your query, checking spelling, or resetting your filter category to find divine worship broadcasts.
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                          <button
                            onClick={() => setSearchQuery('')}
                            className="px-4 py-2.5 sm:py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-full transition shadow-md min-h-[40px]"
                          >
                            Clear Search Query
                          </button>
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedCategory('All');
                            }}
                            className="px-4 py-2.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-full transition min-h-[40px]"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-5">
                        {filteredVideos.map((video) => (
                          <motion.div
                            key={video.id}
                            whileHover={{ y: -4 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            onClick={() => handleSelectVideo(video)}
                            className="flex flex-col space-y-2.5 cursor-pointer group bg-slate-900/30 sm:bg-transparent p-2.5 sm:p-0 rounded-3xl sm:rounded-none border border-slate-800/50 sm:border-none"
                          >
                            {/* Media Card Preview */}
                            <motion.div
                              whileHover={{ scale: 1.02, boxShadow: "0 20px 30px -5px rgba(0, 0, 0, 0.7), 0 10px 20px -5px rgba(239, 68, 68, 0.25)" }}
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                              className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-md"
                            >
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition">
                                  <Play className="w-6 h-6 fill-white ml-0.5" />
                                </div>
                              </div>

                              {video.isLive ? (
                                <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                                </span>
                              ) : (
                                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/85 text-white text-[11px] sm:text-[10px] font-mono shadow-lg">
                                  {video.duration}
                                </span>
                              )}
                            </motion.div>

                            {/* Info Row */}
                            <div className="flex items-start space-x-3 pt-0.5">
                              <motion.img
                                src={video.channelAvatar}
                                alt={video.speakerOrArtist}
                                whileHover={{ scale: 1.15, rotate: 3, boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)" }}
                                transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedChannelModal(video.churchOrMinistry);
                                }}
                                className="w-10 h-10 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-slate-700 hover:ring-2 hover:ring-amber-400 transition cursor-pointer"
                                title="View channel profile"
                              />
                              <div className="flex-1 overflow-hidden min-w-0">
                                <h3 className="text-sm sm:text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition">
                                  {video.title}
                                </h3>
                                <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                                  <p 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedChannelModal(video.churchOrMinistry);
                                    }}
                                    className="text-xs sm:text-[11px] text-slate-400 flex items-center gap-1 cursor-pointer hover:text-amber-400 transition truncate"
                                  >
                                    <span>{video.churchOrMinistry}</span>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                                  </p>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSubscribe(video.churchOrMinistry);
                                    }}
                                    className={`px-3 py-1 sm:px-2 sm:py-0.5 rounded-full text-xs sm:text-[9px] font-bold transition shrink-0 min-h-[32px] sm:min-h-[24px] flex items-center justify-center ${
                                      subscribedChannels.includes(video.churchOrMinistry)
                                        ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                                        : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                                    }`}
                                  >
                                    {subscribedChannels.includes(video.churchOrMinistry) ? 'Following' : '+ Follow'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>
          )}

        </div>
      </div>

      {/* 🔴 ADVANCED MEDIA AUDIO PLAYER */}
      {currentAudio && (
        <AudioPodcastPlayer
          currentTrack={currentAudio}
          isPlaying={isAudioPlaying}
          onTogglePlay={() => setIsAudioPlaying(!isAudioPlaying)}
          isMuted={isAudioMuted}
          onToggleMute={() => setIsAudioMuted(!isAudioMuted)}
          audioQueue={audioQueue}
          onSelectTrackFromQueue={handlePlayAudioTrack}
          onOpenGivingModal={handleOpenGiving}
        />
      )}

      {/* Prayer Request Modal */}
      <AnimatePresence>
        {prayerModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-[#181818] border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500" /> Prayer Request
                </span>
                <button onClick={() => setPrayerModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              {prayerSubmitted ? (
                <div className="py-4 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-white">Prayer Request Submitted</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitPrayer} className="space-y-3">
                  <textarea
                    rows={3}
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    placeholder="Enter your prayer request..."
                    className="w-full bg-[#0f0f0f] text-xs text-white p-2.5 rounded-xl border border-slate-700 focus:outline-none"
                    required
                  />
                  <button type="submit" className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl">
                    Submit Prayer
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Artwork Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 p-4 flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
            <img
              src={youtubeGospelImg}
              alt="Full view"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔔 Follow Notification Toast */}
      <AnimatePresence>
        {followToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-16 right-6 z-50 bg-slate-900 border border-amber-500/40 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold text-amber-300 flex items-center gap-2 backdrop-blur-md"
          >
            <BellRing className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{followToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💳 Giving & Blessing Toast Notification */}
      <AnimatePresence>
        {givingToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/50 px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold text-emerald-300 flex items-center gap-2.5 backdrop-blur-md"
          >
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{givingToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏛️ Channel Profile Modal */}
      {selectedChannelModal && (
        <ChannelProfileModal
          channelName={selectedChannelModal}
          channelAvatar={getChannelAvatar(selectedChannelModal)}
          followerCount={followerCounts[selectedChannelModal] || 482000}
          isFollowed={subscribedChannels.includes(selectedChannelModal)}
          isJoined={joinedChurches.some(c => c.toLowerCase() === selectedChannelModal.toLowerCase())}
          memberCount={churchMemberCounts[selectedChannelModal] || 1248}
          onToggleJoinChurch={handleToggleJoinChurch}
          bellSetting={bellSettings[selectedChannelModal] || 'all'}
          onToggleFollow={toggleSubscribe}
          onChangeBellSetting={handleBellChange}
          onOpenGivingModal={handleOpenGiving}
          onClose={() => setSelectedChannelModal(null)}
          onSelectVideo={handleSelectVideo}
          onPlayAudioTrack={handlePlayAudioTrack}
          allVideos={videoStreams}
          allAudio={audioQueue}
        />
      )}

      {/* 📢 Dual Dispatch Join Church Notification Toast */}
      <AnimatePresence>
        {dualJoinNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 max-w-md w-full bg-slate-950 border-2 border-amber-500/80 p-4 rounded-3xl shadow-2xl space-y-2.5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Church className="w-4 h-4" />
                </span>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Dual Dispatch Notification Sent!
                </h4>
              </div>
              <button
                onClick={() => setDualJoinNotification(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{dualJoinNotification.userNotice}</span>
              </div>

              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 font-mono text-[10px] flex items-start gap-2">
                <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{dualJoinNotification.churchNotice}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💳 Kingdom Giving & Payment Modal */}
      {showGivingModal && (
        <GivingModal
          target={givingModalTarget}
          onClose={() => setShowGivingModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* 🔥 Daily Streak & Gamification Modal */}
      {showStreakModal && (
        <DailyStreakModal
          streakDays={streakDays}
          praiseXp={praiseXp}
          onClose={() => setShowStreakModal(false)}
          onClaimDailyReward={handleClaimDailyReward}
        />
      )}

      {/* ✨ Daily Rhema Promise Card Modal */}
      {showPromiseModal && (
        <DailyPromiseModal
          onClose={() => setShowPromiseModal(false)}
        />
      )}

      {/* ⚡ Grace Shorts Video Modal */}
      {showShortsModal && (
        <GraceShortsModal
          onClose={() => setShowShortsModal(false)}
          onOpenGivingModal={handleOpenGiving}
        />
      )}

      {/* 🐍 Django REST API Integration & Debugger Modal */}
      <DjangoBackendModal
        isOpen={showDjangoModal}
        onClose={() => setShowDjangoModal(false)}
      />

      {/* ⚙️ User Account & Spiritual Preferences Modal */}
      <AccountSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        userSession={userSession}
        onUpdateUserSession={(newSession) => setUserSession(prev => ({ ...prev, ...newSession }))}
        streakDays={streakDays}
        praiseXp={praiseXp}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        onOpenDjangoModal={() => setShowDjangoModal(true)}
      />

      {/* 🔐 Auth & JWT Session Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={userSession}
        onLoginSuccess={(newSession) => setUserSession(newSession)}
        onLogout={() => {
          djangoApi.logout();
          setUserSession({
            id: 'guest',
            username: 'guest',
            email: '',
            fullName: 'Guest Believer',
            isLoggedIn: false
          });
        }}
        onOpenFullAuthPage={handleOpenAuthPage}
      />

      {/* 🔴 YouTube Data API v3 Live Stream Hub Modal */}
      <YouTubeApiModal
        isOpen={showYouTubeModal}
        onClose={() => setShowYouTubeModal(false)}
        onSelectVideo={(video) => handleSelectVideo(video)}
      />

      {/* 📥 Video & Audio Downloader Modal */}
      <VideoDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        video={downloadingVideo || activeVideo}
        onPlayVideo={(v) => {
          handleSelectVideo(v);
          setActiveTab('platform');
        }}
      />

      {/* 📺 Picture-in-Picture Floating Window when browsing Profile, History, or when docked */}
      {activeVideo && (activeTab !== 'platform' || isPipDocked) && (
        <PictureInPictureWindow
          video={activeVideo}
          isPlaying={isVideoPlaying}
          onTogglePlay={() => setIsVideoPlaying(!isVideoPlaying)}
          isMuted={isVideoMuted}
          onToggleMute={() => setIsVideoMuted(!isVideoMuted)}
          onExpand={() => {
            setActiveTab('platform');
            setIsPipDocked(false);
          }}
          onClose={() => {
            setActiveVideo(null);
            setIsPipDocked(false);
          }}
          activeTab={activeTab}
        />
      )}

      {/* 📱 Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setActiveVideo={setActiveVideo}
        watchHistoryCount={watchHistory.length}
        onOpenShorts={() => setShowShortsModal(true)}
        onOpenGiving={() => handleOpenGiving()}
      />

    </div>
  );
}


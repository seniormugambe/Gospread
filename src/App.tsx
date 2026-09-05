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
  MessageSquareHeart,
  RadioTower
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GospreadLogo from './components/GospreadLogo';
import youtubeGospelImg from './assets/images/youtube_gospel_ui_1785687242032.jpg';
import CreatePage, { StudioAction } from './components/CreatePage';
import CreateModalDropdown from './components/CreateModalDropdown';
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
import { ActiveAudioSpace } from './components/AudioSpaceStudio';
import KingdomHomeFeed from './components/KingdomHomeFeed';
import StreamingVideoCard from './components/StreamingVideoCard';
import { SearchEngineOverlay } from './components/SearchEngineOverlay';
import { WatchHistoryView, WatchHistoryItem } from './components/WatchHistoryView';
import { MobileBottomNav } from './components/MobileBottomNav';
import ChurchLocationsCard from './components/ChurchLocationsCard';
import SocialMediaLinksBar from './components/SocialMediaLinksBar';
import LiveChatPanel from './components/LiveChatPanel';
import ChurchScheduleTimetable from './components/ChurchScheduleTimetable';
import { 
  CHURCH_SCHEDULES,
  VideoStream, 
  AudioTrack,
  ChatMessage,
  ReactionType,
  GRACE_SHORTS,
  LIVE_VIDEO_STREAMS,
  AUDIO_TRACKS,
} from './data/gospelData';

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
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const [activeTab, setActiveTab] = useState<'platform' | 'generated' | 'create' | 'profile' | 'history' | 'discover' | 'community' | 'auth'>('platform');
  const [activeAudioSpace, setActiveAudioSpace] = useState<ActiveAudioSpace | null>(null);
  const [initialAuthMode, setInitialAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleOpenAuthPage = (mode: 'signin' | 'signup' = 'signin') => {
    setInitialAuthMode(mode);
    setActiveTab('auth');
    setIsPipDocked(false);
    setActiveVideo(null);
  };
  const [videoStreams, setVideoStreams] = useState<VideoStream[]>(LIVE_VIDEO_STREAMS);
  const [shorts, setShorts] = useState<VideoStream[]>(() =>
    GRACE_SHORTS.map(s => ({
      id: s.id,
      title: s.title,
      speakerOrArtist: s.speaker,
      churchOrMinistry: s.church,
      channelAvatar: s.avatar,
      subscribersCount: 'Verified',
      likesCount: s.likes,
      category: 'Sermon',
      isLive: false,
      viewersCount: s.amensCount * 12,
      viewsText: `${s.likes} likes`,
      duration: s.duration,
      thumbnail: s.thumbnail,
      description: s.tags.join(' '),
      date: 'Today',
      videoUrl: s.videoUrl,
    }))
  );
  const [churches, setChurches] = useState<Awaited<ReturnType<typeof djangoApi.getChurchLocations>>>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isYoutubeLoading, setIsYoutubeLoading] = useState(false);

  // Fetch published media from Django (with immediate fallback to offline sanctuary data).
  useEffect(() => {
    let isMounted = true;
    const loadMedia = async () => {
      setIsYoutubeLoading(true);
      try {
        const backendChurches = await djangoApi.getChurchLocations();
        if (isMounted) setChurches(backendChurches);
      } catch (e) {
        console.warn('Backend churches notice (using sanctuary directory):', e);
      }

      try {
        const backendVideos = await djangoApi.getVideos();
        if (isMounted && backendVideos && backendVideos.length > 0) {
          setVideoStreams(backendVideos);
          setActiveVideo(prev => prev && backendVideos.some(video => video.id === prev.id)
            ? prev
            : backendVideos[0] || null);
        } else if (isMounted) {
          setVideoStreams(LIVE_VIDEO_STREAMS);
          setActiveVideo(prev => prev || LIVE_VIDEO_STREAMS[0] || null);
        }
      } catch (e) {
        console.warn('Backend media notice (using local streams):', e);
        if (isMounted) {
          setVideoStreams(LIVE_VIDEO_STREAMS);
          setActiveVideo(prev => prev || LIVE_VIDEO_STREAMS[0] || null);
        }
      }

      try {
        const backendShorts = await djangoApi.getShorts();
        if (isMounted && backendShorts && backendShorts.length > 0) {
          setShorts(backendShorts);
        }
      } catch (e) {
        console.warn('Backend shorts notice (using local shorts):', e);
      }

      try {
        const backendTracks = await djangoApi.getAudioTracks();
        if (isMounted && backendTracks && backendTracks.length > 0) {
          setAudioQueue(backendTracks);
          if (!currentAudio && backendTracks[0]) {
            setCurrentAudio(backendTracks[0]);
          }
        } else if (isMounted) {
          setAudioQueue(AUDIO_TRACKS);
          if (!currentAudio && AUDIO_TRACKS[0]) {
            setCurrentAudio(AUDIO_TRACKS[0]);
          }
        }
      } catch (e) {
        console.warn('Backend audio tracks notice (using local playlist):', e);
        if (isMounted) {
          setAudioQueue(AUDIO_TRACKS);
          if (!currentAudio && AUDIO_TRACKS[0]) {
            setCurrentAudio(AUDIO_TRACKS[0]);
          }
        }
      }

      if (isMounted) setIsYoutubeLoading(false);
    };

    loadMedia();
    return () => { isMounted = false; };
  }, []);

  // 🕒 Watch History State & Local Persistence
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('gospread_watch_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item: any) => Boolean(item && (item.video?.title || item.title)))
            .map((item: any) => {
              if (!item.video && item.title) {
                return { video: item, watchedAt: item.watchedAt || Date.now() };
              }
              return item;
            });
        }
      }
    } catch (e) {
      console.error('Failed to load watch history:', e);
    }
    return [];
  });

  const addToWatchHistory = (video: VideoStream) => {
    if (!video || !video.id) return;
    setWatchHistory(prev => {
      const filtered = prev.filter(item => Boolean(item && item.video && item.video.id !== video.id));
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
      const updated = prev.filter(item => Boolean(item && item.video && item.video.id !== videoId));
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
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gospread_subscribed_channels');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['Grace City Cathedral', 'Elevation Worship'];
  });
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
    if (!userSession.isLoggedIn) {
      handleOpenAuthPage('signin');
      return;
    }
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
  const [selectedShortId, setSelectedShortId] = useState<string | null>(null);
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
      ministryName: '',
      avatarUrl: '',
      isLoggedIn: false,
      token: ''
    };
  });
  const [streakDays, setStreakDays] = useState(0);
  const [praiseXp, setPraiseXp] = useState(0);

  const openProtectedTab = (tab: 'profile' | 'history' | 'create') => {
    setActiveTab(tab);
  };

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

  const categories: { label: string; icon: any; count?: number }[] = [
    { label: 'All', icon: Compass },
    { label: 'Live', icon: Tv },
    { label: 'Sermons', icon: Mic2 },
    { label: 'Worship', icon: Music },
    { label: 'Podcasts', icon: Headphones },
    { label: 'Ministries', icon: Building2 },
  ];

  // Category options

  const toggleSubscribe = (channelName: string) => {
    setSubscribedChannels(prev => {
      const isSubbed = prev.some(c => c.toLowerCase() === channelName.toLowerCase());
      const newSubbed = isSubbed 
        ? prev.filter(c => c.toLowerCase() !== channelName.toLowerCase()) 
        : [...prev, channelName];

      try {
        localStorage.setItem('gospread_subscribed_channels', JSON.stringify(newSubbed));
      } catch (e) {
        console.error(e);
      }
      
      // Update follower count
      setFollowerCounts(fc => ({
        ...fc,
        [channelName]: Math.max(0, (fc[channelName] || 1000) + (isSubbed ? -1 : 1))
      }));

      // Trigger notification toast
      if (!isSubbed) {
        setFollowToast(`🔔 Following ${channelName}! Added to your Following feed. (Create an account anytime to sync)`);
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
    const subMatch = churches.find(c => c.name.toLowerCase().includes(channelName.toLowerCase()));
    if (subMatch) return subMatch.avatar;
    return '';
  };

  const subscriptionChannels = churches.map(church => ({
    name: church.name,
    avatar: church.avatar,
    liveNow: videoStreams.some(video => video.churchOrMinistry === church.name && video.isLive),
  }));

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

  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [initialStudioAction, setInitialStudioAction] = useState<StudioAction>('choose');
  const [initialUploadSource, setInitialUploadSource] = useState<'device' | 'url' | 'youtube'>('device');

  const handleCreateMenuSelect = (action: StudioAction, importSource: 'device' | 'url' | 'youtube' = 'device') => {
    setInitialStudioAction(action);
    setInitialUploadSource(importSource);
    setActiveTab('create');
    setIsCreateDropdownOpen(false);
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
    } else if (selectedCategory === 'Live' || selectedCategory === 'Live Worship') {
      matchesCategory = v.isLive;
    } else if (selectedCategory === 'Sermons') {
      matchesCategory = v.category === 'Sermon';
    } else if (selectedCategory === 'Worship' || selectedCategory === 'Gospel Music' || selectedCategory === 'Choir Special') {
      matchesCategory = v.category === 'Live Worship' || v.category === 'Choir Special' || v.category === 'Gospel Music';
    } else if (selectedCategory === 'Podcasts' || selectedCategory === '24/7 Gospel Radio') {
      matchesCategory = true;
    } else if (selectedCategory === 'Ministries' || selectedCategory === 'Discover Ministries') {
      matchesCategory = true;
    } else if (selectedCategory === 'Following') {
      matchesCategory = subscribedChannels.length === 0 || subscribedChannels.some(ch => 
        v.churchOrMinistry.toLowerCase().includes(ch.toLowerCase()) || 
        v.speakerOrArtist.toLowerCase().includes(ch.toLowerCase())
      );
    } else {
      matchesCategory = v.category === selectedCategory || v.category.toLowerCase().includes(selectedCategory.toLowerCase());
    }

    if (!searchQuery.trim()) return matchesCategory;

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
      
      {/* 🔴 CONTENT-FIRST STREAMING HEADER */}
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Brand Logo & Top Navigation Links */}
        <div className="flex items-center space-x-3 sm:space-x-6 shrink-0">
          {/* Platform Side Menu Toggle Hamburger */}
          <button 
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-2 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-white transition"
            title={isSidebarOpen ? "Collapse Platform Menu" : "Expand Platform Menu"}
          >
            <Menu className="w-5 h-5" />
          </button>

          <GospreadLogo
            size="sm"
            showBadge={false}
            onClick={() => {
              setActiveVideo(null);
              setSelectedCategory('All');
              setActiveTab('platform');
              setSearchQuery('');
            }}
          />

          {/* Desktop Top Navigation (Content-First: Home | Live | Sermons | Worship | Ministries) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            <button
              onClick={() => {
                setActiveTab('platform');
                setSelectedCategory('All');
                setActiveVideo(null);
                setSearchQuery('');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === 'platform' && selectedCategory === 'All' && !activeVideo && searchQuery === ''
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab('platform');
                setSelectedCategory('Live');
                setActiveVideo(null);
                setSearchQuery('');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'platform' && (selectedCategory === 'Live' || selectedCategory === 'Live Worship') && !activeVideo
                  ? 'bg-red-600 text-white font-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live
            </button>
            <button
              onClick={() => {
                setActiveTab('platform');
                setSelectedCategory('Sermons');
                setActiveVideo(null);
                setSearchQuery('');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === 'platform' && selectedCategory === 'Sermons' && !activeVideo
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Sermons
            </button>
            <button
              onClick={() => {
                setActiveTab('platform');
                setSelectedCategory('Worship');
                setActiveVideo(null);
                setSearchQuery('');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === 'platform' && (selectedCategory === 'Worship' || selectedCategory === 'Gospel Music') && !activeVideo
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Worship
            </button>
            <button
              onClick={() => {
                setActiveTab('discover');
                setActiveVideo(null);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                activeTab === 'discover'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Ministries
            </button>
          </nav>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-md mx-1 sm:mx-4">
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
        </div>

        {/* Right Header: Theme Toggle, Sign In / Avatar Menu */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className={`p-2 rounded-full transition flex items-center justify-center border shadow-sm ${
              theme === 'light'
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-sky-500 text-white border-pink-300/80 shadow-pink-500/25'
                : 'bg-slate-900 text-pink-400 border-slate-700 hover:bg-slate-800'
            }`}
            title={theme === 'light' ? "Sunset 🌸 Theme Active" : "Night Theme Active"}
          >
            {theme === 'light' ? (
              <Sun className="w-3.5 h-3.5 text-pink-200 fill-pink-200" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-pink-400" />
            )}
          </button>

          {/* Sign In Button (when not logged in) */}
          {!userSession.isLoggedIn && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleOpenAuthPage('signin')}
              className="px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-sm transition shrink-0"
              title="Sign in to your Gospread account"
            >
              Sign In
            </motion.button>
          )}

          {/* User Profile Avatar Header Button with Account Dropdown Popover */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserAccountDropdown(prev => !prev)}
              className={`flex items-center gap-1.5 p-1 rounded-full border transition shrink-0 ${
                activeTab === 'profile' || showUserAccountDropdown
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
              title="Account Menu"
            >
              {userSession.avatarUrl ? (
                <img
                  src={userSession.avatarUrl}
                  alt={userSession.fullName || userSession.username || 'User'}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-400"
                />
              ) : (
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
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
            </motion.button>

            {/* Dropdown containing Following, Saved, History, Prayer, Notifications, Profile, Settings */}
            <UserAccountMenuDropdown
              isOpen={showUserAccountDropdown}
              onClose={() => setShowUserAccountDropdown(false)}
              userSession={userSession}
              onOpenSettings={() => userSession.isLoggedIn ? setShowSettingsModal(true) : handleOpenAuthPage('signin')}
              onOpenProfile={() => openProtectedTab('profile')}
              onOpenCommunity={() => setActiveTab('community')}
              onOpenHistory={() => openProtectedTab('history')}
              onOpenGiving={() => handleOpenGiving()}
              onOpenFollowing={() => {
                setSelectedCategory('Following');
                setActiveTab('platform');
                setActiveVideo(null);
              }}
              onOpenSaved={() => openProtectedTab('profile')}
              onOpenPrayer={() => setPrayerModalOpen(true)}
              onOpenNotifications={() => {
                setFollowToast('🔔 Notifications are active for followed ministries');
                setTimeout(() => setFollowToast(null), 3000);
              }}
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
      </header>


      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 💻 DESKTOP PLATFORM SIDE MENU (Persistent & Collapsible) */}
        {isSidebarOpen && (
          <aside className={`hidden md:block shrink-0 w-64 lg:w-72 border-r select-none z-30 transition-all duration-300 ${
            theme === 'light' 
              ? 'bg-white/95 border-slate-200/90 text-slate-800 shadow-sm' 
              : 'bg-[#0c0c0e]/95 border-slate-800/80 text-slate-200 shadow-xl'
          } backdrop-blur-md overflow-y-auto p-3.5 h-[calc(100vh-61px)] sticky top-[61px]`}>
            <div className="space-y-5">
              {[
                {
                  section: 'PLATFORM',
                  items: [
                    { id: 'home', label: 'Home Feed', icon: Compass },
                    { id: 'community', label: 'Fellowship & Voices', icon: MessageSquareHeart, badge: 'COMMUNITY', badgeStyle: 'bg-fuchsia-600 text-white font-black' },
                    { id: 'discover', label: 'Discover Ministries', icon: Building2, badge: 'EXPLORE', badgeStyle: 'bg-pink-600 text-white font-black' },
                    { id: 'history', label: 'Watch History', icon: History, badge: watchHistory.length > 0 ? `${watchHistory.length}` : undefined, badgeStyle: 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30' },
                    ...(!userSession.isLoggedIn ? [
                      { id: 'auth', label: 'Kingdom Login', icon: ShieldCheck, badge: 'SECURE', badgeStyle: 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold' }
                    ] : []),
                    { id: 'profile', label: 'My Profile', icon: User, badge: 'YOU', badgeStyle: 'bg-pink-600 text-white font-bold' },
                  ],
                },
                {
                  section: 'WORSHIP & MEDIA',
                  items: [
                    { id: 'live', label: 'Live Broadcasts', icon: Tv, badge: 'LIVE', badgeStyle: 'bg-red-600 text-white font-bold' },
                    { id: 'radio', label: '24/7 Gospel Radio', icon: RadioIcon, badge: '24/7', badgeStyle: 'bg-pink-600 text-white font-bold' },
                    { id: 'podcasts', label: 'Audio Podcasts', icon: Music },
                    { id: 'schedule', label: 'Church Service Times', icon: Calendar, badge: 'TIMES', badgeStyle: 'bg-amber-400 text-slate-950 font-black' },
                  ],
                },
                {
                  section: 'MINISTRY & CREATOR',
                  items: [
                    { id: 'create', label: 'Creator Studio', icon: RadioTower, badge: 'STUDIO', badgeStyle: 'bg-gradient-to-r from-red-600 to-amber-500 text-white font-black' },
                    { id: 'giving', label: 'Kingdom Giving & Offering', icon: DollarSign, badge: 'SUPPORT', badgeStyle: 'bg-emerald-600 text-white font-black' },
                  ],
                },
              ].map((grp) => (
                <div key={grp.section} className="space-y-1.5">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 block">
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
                            (item.id === 'live' && (selectedCategory === 'Live' || selectedCategory === 'Live Worship')) ||
                            (item.id === 'schedule' && selectedCategory === 'Church Schedules') ||
                            (item.id === 'podcasts' && selectedCategory === 'Podcasts') ||
                            (item.id === 'radio' && selectedCategory === '24/7 Gospel Radio')
                          ));

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.id === 'create') {
                              openProtectedTab('create');
                              setIsPipDocked(false);
                              setActiveVideo(null);
                            } else if (item.id === 'profile') {
                              openProtectedTab('profile');
                            } else if (item.id === 'auth') {
                              handleOpenAuthPage('signin');
                            } else if (item.id === 'community') {
                              setActiveTab('community');
                              setIsPipDocked(false);
                              setActiveVideo(null);
                            } else if (item.id === 'settings') {
                              if (userSession.isLoggedIn) setShowSettingsModal(true);
                              else handleOpenAuthPage('signin');
                            } else if (item.id === 'history') {
                              openProtectedTab('history');
                            } else if (item.id === 'discover') {
                              setActiveTab('discover');
                              setIsPipDocked(false);
                              setActiveVideo(null);
                            } else if (item.id === 'giving') {
                              handleOpenGiving();
                            } else {
                              if (item.id === 'following' && !userSession.isLoggedIn) {
                                handleOpenAuthPage('signin');
                                return;
                              }
                              setActiveTab('platform');
                              setIsPipDocked(false);
                              setActiveVideo(null);
                              setSearchQuery('');
                              setSelectedCategory(
                                item.id === 'radio' ? '24/7 Gospel Radio' :
                                item.id === 'podcasts' ? 'Podcasts' :
                                item.id === 'schedule' ? 'Church Schedules' :
                                item.id === 'live' ? 'Live Worship' : 'All'
                              );
                            }
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                            isActive
                              ? 'bg-amber-100/90 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/40 font-bold shadow-xs'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`px-2 py-0.5 rounded text-[9px] shrink-0 ${item.badgeStyle || 'bg-amber-500 text-slate-950 font-extrabold'}`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <hr className="border-slate-200 dark:border-slate-800 my-2" />

              {/* Followed Ministries */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Followed Ministries ({subscribedChannels.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {subscriptionChannels.map((ch) => (
                    <div
                      key={ch.name}
                      onClick={() => setSelectedChannelModal(ch.name)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-xs text-slate-700 dark:text-slate-300 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={ch.avatar} alt={ch.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                        <span className="font-medium truncate">{ch.name}</span>
                      </div>
                      {ch.liveNow && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* 📱 MOBILE SLIDE-OUT DRAWER SIDEBAR (Accessible via hamburger on mobile) */}
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
                className={`relative w-80 max-w-[85vw] border-r h-full flex flex-col justify-between p-4 z-10 overflow-y-auto shadow-2xl ${
                  theme === 'light' ? 'bg-white text-slate-800 border-slate-200' : 'bg-[#0c0c0e] text-slate-200 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <GospreadLogo
                      size="sm"
                      badgeText="Platform"
                      badgeVariant="gold"
                      onClick={() => setIsSidebarOpen(false)}
                    />
                    <button
                      onClick={() => setIsSidebarOpen(false)}
                      className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-5 py-4">
                    {[
                      {
                        section: 'PLATFORM',
                        items: [
                          { id: 'home', label: 'Home Feed', icon: Compass },
                          { id: 'community', label: 'Fellowship & Voices', icon: MessageSquareHeart, badge: 'COMMUNITY', badgeStyle: 'bg-fuchsia-600 text-white font-black' },
                          { id: 'discover', label: 'Discover Ministries', icon: Building2, badge: 'EXPLORE', badgeStyle: 'bg-pink-600 text-white font-black' },
                          { id: 'history', label: 'Watch History', icon: History, badge: watchHistory.length > 0 ? `${watchHistory.length}` : undefined, badgeStyle: 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30' },
                          ...(!userSession.isLoggedIn ? [
                            { id: 'auth', label: 'Kingdom Login', icon: ShieldCheck, badge: 'SECURE', badgeStyle: 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold' }
                          ] : []),
                          { id: 'profile', label: 'My Profile', icon: User, badge: 'YOU', badgeStyle: 'bg-pink-600 text-white font-bold' },
                        ],
                      },
                      {
                        section: 'WORSHIP & MEDIA',
                        items: [
                          { id: 'live', label: 'Live Broadcasts', icon: Tv, badge: 'LIVE', badgeStyle: 'bg-red-600 text-white font-bold' },
                          { id: 'radio', label: '24/7 Gospel Radio', icon: RadioIcon, badge: '24/7', badgeStyle: 'bg-pink-600 text-white font-bold' },
                          { id: 'podcasts', label: 'Audio Podcasts', icon: Music },
                          { id: 'schedule', label: 'Church Service Times', icon: Calendar, badge: 'TIMES', badgeStyle: 'bg-amber-400 text-slate-950 font-black' },
                        ],
                      },
                      {
                        section: 'MINISTRY & CREATOR',
                        items: [
                          { id: 'create', label: 'Creator Studio', icon: RadioTower, badge: 'STUDIO', badgeStyle: 'bg-gradient-to-r from-red-600 to-amber-500 text-white font-black' },
                          { id: 'giving', label: 'Kingdom Giving & Offering', icon: DollarSign, badge: 'SUPPORT', badgeStyle: 'bg-emerald-600 text-white font-black' },
                        ],
                      },
                    ].map((grp) => (
                      <div key={grp.section} className="space-y-1.5">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 block">
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
                                  (item.id === 'live' && (selectedCategory === 'Live' || selectedCategory === 'Live Worship')) ||
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
                                    openProtectedTab('create');
                                    setIsPipDocked(false);
                                    setActiveVideo(null);
                                  } else if (item.id === 'profile') {
                                    openProtectedTab('profile');
                                  } else if (item.id === 'auth') {
                                    handleOpenAuthPage('signin');
                                  } else if (item.id === 'community') {
                                    setActiveTab('community');
                                    setIsPipDocked(false);
                                    setActiveVideo(null);
                                  } else if (item.id === 'settings') {
                                    if (userSession.isLoggedIn) setShowSettingsModal(true);
                                    else handleOpenAuthPage('signin');
                                  } else if (item.id === 'history') {
                                    openProtectedTab('history');
                                  } else if (item.id === 'discover') {
                                    setActiveTab('discover');
                                    setIsPipDocked(false);
                                    setActiveVideo(null);
                                  } else if (item.id === 'giving') {
                                    handleOpenGiving();
                                  } else {
                                    if (item.id === 'following' && !userSession.isLoggedIn) {
                                      handleOpenAuthPage('signin');
                                      return;
                                    }
                                    setActiveTab('platform');
                                    setIsPipDocked(false);
                                    setActiveVideo(null);
                                    setSearchQuery('');
                                    setSelectedCategory(
                                      item.id === 'radio' ? '24/7 Gospel Radio' :
                                      item.id === 'podcasts' ? 'Podcasts' :
                                      item.id === 'schedule' ? 'Church Schedules' :
                                      item.id === 'live' ? 'Live Worship' : 'All'
                                    );
                                  }
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                                  isActive
                                    ? 'bg-amber-100/90 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/40 font-bold shadow-xs'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white'
                                }`}
                              >
                                <span className="truncate">{item.label}</span>
                                {item.badge && (
                                  <span className={`px-2 py-0.5 rounded text-[9px] shrink-0 ${item.badgeStyle || 'bg-amber-500 text-slate-950 font-extrabold'}`}>
                                    {item.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <hr className="border-slate-200 dark:border-slate-800 my-2" />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          Followed Ministries ({subscribedChannels.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {subscriptionChannels.map((ch) => (
                          <div
                            key={ch.name}
                            onClick={() => {
                              setIsSidebarOpen(false);
                              setSelectedChannelModal(ch.name);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-xs text-slate-700 dark:text-slate-300 transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img src={ch.avatar} alt={ch.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                              <span className="font-medium truncate">{ch.name}</span>
                            </div>
                            {ch.liveNow && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" />}
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
        <main className="flex-1 overflow-y-auto flex flex-col pb-32 md:pb-16">
          
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
                    fullName: '',
                    churchName: '',
                    avatarUrl: '',
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
            <div className="w-full">
              {/* Distinct Creator World Portal Header */}
              <div className={`creator-studio-header border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-4 transition-colors ${
                theme === 'light'
                  ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-xs'
                  : 'bg-stone-950 border-stone-800/80'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border transition-colors ${
                    theme === 'light'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                      : 'bg-gradient-to-br from-red-600/30 to-amber-500/20 border-red-500/40 text-red-400'
                  }`}>
                    <RadioTower className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        theme === 'light'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-red-950/80 text-red-400 border-red-800/60'
                      }`}>
                        CREATOR WORLD
                      </span>
                      <span className={`text-[11px] hidden sm:inline ${
                        theme === 'light' ? 'text-slate-600 font-medium' : 'text-stone-400'
                      }`}>
                        Broadcast & Ministry Studio
                      </span>
                    </div>
                    <h2 className={`text-sm font-bold mt-0.5 ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>
                      Kingdom Broadcasting Studio
                    </h2>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('platform')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-700'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Return to Viewer Experience</span>
                </button>
              </div>

              <CreatePage 
                currentUser={userSession}
                initialAction={initialStudioAction}
                initialUploadSource={initialUploadSource}
                onPublishSuccess={handlePublishSuccess}
                onCancel={() => setActiveTab('platform')}
                activeAudioSpace={activeAudioSpace}
                onAudioSpaceChange={setActiveAudioSpace}
                theme={theme}
              />
            </div>
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
              
              {/* Category Filter Pills (shown when filtering by category or searching) */}
              {(selectedCategory !== 'All' || searchQuery.trim() !== '') && (
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
                          } else if (cat.label === 'Following' && !userSession.isLoggedIn) {
                            handleOpenAuthPage('signin');
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
              )}

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
                  activeAudioSpace={activeAudioSpace}
                  onJoinAudioSpace={() => setSelectedCategory('Podcasts')}
                />
              )}

              {/* 📅 CHURCH SCHEDULES SPECIAL SECTION (RESPONSIVE TABLE & CARD TIMETABLE) */}
              {selectedCategory === 'Church Schedules' && (
                <ChurchScheduleTimetable
                  onSelectChannelModal={(channel) => setSelectedChannelModal(channel)}
                  onWatchLiveService={(churchName) => {
                    const match = videoStreams.find(v => 
                      v.churchOrMinistry.toLowerCase().includes(churchName.toLowerCase()) || 
                      v.speakerOrArtist.toLowerCase().includes(churchName.toLowerCase()) ||
                      v.isLive
                    );
                    if (match) {
                      handleSelectVideo(match);
                    }
                  }}
                  theme={theme}
                />
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
                    {subscriptionChannels.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                        <UserCheck className="w-6 h-6 text-slate-600 mx-auto" />
                        <p className="text-xs font-semibold text-slate-300">No Channels Available</p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Verified gospel channels and ministries will appear here once connected.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-3">
                        {subscriptionChannels.map((ch) => {
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
                  userSession={userSession}
                  onOpenAuthPage={handleOpenAuthPage}
                  onOpenShorts={(shortId) => {
                    setSelectedShortId(shortId || null);
                    setShowShortsModal(true);
                  }}
                  shorts={shorts}
                  watchHistory={watchHistory}
                  onRemoveWatchHistory={removeFromWatchHistory}
                  activeAudioSpace={activeAudioSpace}
                  onJoinAudioSpace={() => setSelectedCategory('Podcasts')}
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
                        <h3 className="text-base font-bold text-white">
                          {searchQuery.trim() ? `No video streams match "${searchQuery}"` : `No broadcasts currently in "${selectedCategory}"`}
                        </h3>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                        {filteredVideos.map((video) => (
                          <StreamingVideoCard
                            key={video.id}
                            video={video}
                            onSelect={handleSelectVideo}
                            onOpenChannel={(churchOrMinistry) => setSelectedChannelModal(churchOrMinistry)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>
          )}

        </main>
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
          onClose={() => {
            setShowShortsModal(false);
            setSelectedShortId(null);
          }}
          onOpenGivingModal={handleOpenGiving}
          initialShortId={selectedShortId || undefined}
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
            id: '',
            username: '',
            email: '',
            fullName: '',
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
        setActiveTab={(tab) => tab === 'profile' ? openProtectedTab('profile') : setActiveTab(tab)}
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


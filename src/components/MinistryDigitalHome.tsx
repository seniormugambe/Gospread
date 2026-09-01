import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Tv, 
  Music, 
  Calendar, 
  MapPin, 
  Heart, 
  DollarSign, 
  Share2, 
  CheckCircle2, 
  UserCheck, 
  UserPlus, 
  Bell, 
  BellRing, 
  BellOff, 
  Play, 
  Headphones, 
  Clock, 
  Radio, 
  Sparkles, 
  Globe, 
  Phone, 
  Mail, 
  ExternalLink, 
  Check, 
  X, 
  Flame, 
  ShieldCheck, 
  ChevronRight, 
  CalendarPlus, 
  CreditCard, 
  Layers, 
  MessageSquare, 
  Send,
  Download,
  Award,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  VideoStream, 
  AudioTrack, 
  CHURCH_SCHEDULES, 
  ServiceScheduleItem, 
  CHURCH_LOCATIONS, 
  CHURCH_SOCIALS, 
  ChurchLocation, 
  SocialLink,
  GRACE_CITY_CATHEDRAL_PROFILE
} from '../data/gospelData';
import { GivingTarget } from './GivingModal';
import SocialMediaLinksBar from './SocialMediaLinksBar';
import ChurchLocationsCard from './ChurchLocationsCard';

interface MinistryDigitalHomeProps {
  ministryName: string;
  avatar?: string;
  coverImage?: string;
  followerCount?: number;
  isFollowed?: boolean;
  bellSetting?: 'all' | 'personalized' | 'none';
  isJoined?: boolean;
  memberCount?: number;
  onToggleJoinChurch?: (name: string) => void;
  onToggleFollow?: (name: string) => void;
  onChangeBellSetting?: (name: string, setting: 'all' | 'personalized' | 'none') => void;
  onOpenGivingModal?: (target: GivingTarget) => void;
  onClose?: () => void;
  onSelectVideo: (video: VideoStream) => void;
  onPlayAudioTrack: (track: AudioTrack) => void;
  allVideos: VideoStream[];
  allAudio: AudioTrack[];
}

export default function MinistryDigitalHome({
  ministryName,
  avatar,
  coverImage,
  followerCount = 1480000,
  isFollowed = false,
  bellSetting = 'all',
  isJoined = false,
  memberCount = 24650,
  onToggleJoinChurch,
  onToggleFollow,
  onChangeBellSetting,
  onOpenGivingModal,
  onClose,
  onSelectVideo,
  onPlayAudioTrack,
  allVideos,
  allAudio
}: MinistryDigitalHomeProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sermons' | 'worship' | 'schedule' | 'campuses' | 'give' | 'prayer' | 'about' | 'membership'>('overview');
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reminderAlertSet, setReminderAlertSet] = useState<string | null>(null);
  const [showMembershipPass, setShowMembershipPass] = useState(false);

  // In-profile Giving Kiosk State
  const [giveFund, setGiveFund] = useState<'tithe' | 'building' | 'missions' | 'media'>('tithe');
  const [giveAmount, setGiveAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [giveCurrency, setGiveCurrency] = useState<'USD' | 'GBP' | 'EUR' | 'NGN' | 'KES' | 'UGX'>('USD');
  const [giveFrequency, setGiveFrequency] = useState<'one-time' | 'weekly' | 'monthly'>('one-time');
  const [giveSuccessMsg, setGiveSuccessMsg] = useState<string | null>(null);

  // In-profile Prayer Altar State
  const [prayerRequestText, setPrayerRequestText] = useState('');
  const [prayerTag, setPrayerTag] = useState('Healing & Health');
  const [isAnonymousPrayer, setIsAnonymousPrayer] = useState(false);
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);
  const [churchPrayerList, setChurchPrayerList] = useState([
    {
      id: 'cp-1',
      name: 'Sister Rachel M.',
      tag: 'Family & Covenant Breakthrough',
      text: 'Praying for open heavenly doors over my family and breakthrough in my husband’s immigration paperwork.',
      time: '25 mins ago',
      amens: 38,
      hasAmened: false
    },
    {
      id: 'cp-2',
      name: 'Brother Emmanuel D.',
      tag: 'Divine Healing',
      text: 'Standing on Isaiah 53:5 for complete lung healing after doctor’s diagnosis. God is the ultimate healer!',
      time: '1 hour ago',
      amens: 54,
      hasAmened: true
    },
    {
      id: 'cp-3',
      name: 'Minister Joshua K.',
      tag: 'Sanctuary Worship & Revival',
      text: 'Interceding for our upcoming Night of Miracles. Let there be a mighty outpouring of the Holy Ghost across all campuses.',
      time: '3 hours ago',
      amens: 92,
      hasAmened: true
    }
  ]);

  // Dynamic countdown timer for upcoming Sunday Service
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isGraceCity = ministryName.toLowerCase().includes('grace city');
  const churchProfile = isGraceCity ? GRACE_CITY_CATHEDRAL_PROFILE : null;

  const currentAvatar = avatar || churchProfile?.avatar || 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80';
  const currentCover = coverImage || churchProfile?.coverImage || 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1600&q=80';
  const currentLeader = churchProfile?.leadPastor || 'Senior Pastor & Leadership Council';
  const currentBio = churchProfile?.pastorBio || `${ministryName} is a global Christ-centered ministry bringing the light of the Gospel to nations through dynamic worship, sound doctrine, and community empowerment.`;
  const currentSchedules: ServiceScheduleItem[] = CHURCH_SCHEDULES[ministryName] || (isGraceCity ? GRACE_CITY_CATHEDRAL_PROFILE.schedules : []);
  const currentCampuses: ChurchLocation[] = CHURCH_LOCATIONS[ministryName] || (isGraceCity ? (GRACE_CITY_CATHEDRAL_PROFILE.campuses || []) : []);
  const currentSocials: SocialLink[] = CHURCH_SOCIALS[ministryName] || (isGraceCity ? (GRACE_CITY_CATHEDRAL_PROFILE.socials || []) : []);

  // Filter ministry sermons and worship tracks
  const ministryVideos = allVideos.filter(
    v => v.churchOrMinistry.toLowerCase().includes(ministryName.toLowerCase()) || 
         v.speakerOrArtist.toLowerCase().includes(ministryName.toLowerCase()) ||
         (isGraceCity && (v.churchOrMinistry.includes('Grace City') || v.speakerOrArtist.includes('David Williams') || v.speakerOrArtist.includes('Sarah Williams')))
  );

  const ministryAudio = allAudio.filter(
    a => a.artistOrPreacher.toLowerCase().includes(ministryName.toLowerCase()) ||
         a.albumOrSeries.toLowerCase().includes(ministryName.toLowerCase()) ||
         (isGraceCity && (a.artistOrPreacher.includes('Grace City') || a.albumOrSeries.includes('Grace City')))
  );

  // Live stream item if currently live
  const liveVideo = ministryVideos.find(v => v.isLive) || (isGraceCity ? allVideos.find(v => v.id === 'stream-gcc-live') : null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://gospread.tv/@${ministryName.toLowerCase().replace(/\s+/g, '')}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadCalendar = () => {
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Gospread//Church Schedule//EN\nBEGIN:VEVENT\nSUMMARY:${ministryName} Sunday Worship Service\nDESCRIPTION:Join us live at ${ministryName} sanctuary or online at Gospread.tv\nLOCATION:Sanctuary & Online Live Stream\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${ministryName.replace(/\s+/g, '_')}_Service.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setReminderAlertSet('calendar-ics');
    setTimeout(() => setReminderAlertSet(null), 3000);
  };

  const handleProcessGiving = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : giveAmount;
    if (!finalAmount || isNaN(finalAmount)) return;

    setGiveSuccessMsg(`Praise the Lord! Your ${giveFrequency} kingdom seed of ${giveCurrency} ${finalAmount.toLocaleString()} has been received for the ${giveFund.toUpperCase()} fund.`);
    setTimeout(() => setGiveSuccessMsg(null), 6000);
    setCustomAmount('');
  };

  const handleAddPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerRequestText.trim()) return;

    const newReq = {
      id: `cp-${Date.now()}`,
      name: isAnonymousPrayer ? 'Anointed Saint (Private)' : 'Beloved Cathedral Member',
      tag: prayerTag,
      text: prayerRequestText.trim(),
      time: 'Just now',
      amens: 1,
      hasAmened: true
    };

    setChurchPrayerList([newReq, ...churchPrayerList]);
    setPrayerRequestText('');
    setPrayerSubmitted(true);
    setTimeout(() => setPrayerSubmitted(false), 3500);
  };

  const handleTogglePrayerAmen = (id: string) => {
    setChurchPrayerList(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          hasAmened: !item.hasAmened,
          amens: item.hasAmened ? item.amens - 1 : item.amens + 1
        };
      }
      return item;
    }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 select-none">
      
      {/* 🏛️ 1. CATHEDRAL HERO BANNER & IDENTITY HEADER (DIGITAL SANCTUARY HOME) */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-slate-950 shadow-2xl">
        
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-slate-900">
          <img 
            src={currentCover} 
            alt={ministryName} 
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          
          {/* Top Control Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Official Church Digital Sanctuary Home</span>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition shadow-xl"
                title="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Live Worshippers Pill Overlay on Cover */}
          {liveVideo && (
            <div className="absolute bottom-4 right-4 z-10 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/90 text-white border border-red-400/50 text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-2xl animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span>🔴 LIVE NOW • 12,480 WORSHIPPERS</span>
            </div>
          )}
        </div>

        {/* Cathedral Profile Info & Action Bar */}
        <div className="px-4 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-10">
            
            {/* Avatar & Title Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative group">
                <img
                  src={currentAvatar}
                  alt={ministryName}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-slate-950 shadow-2xl bg-slate-900 shrink-0"
                />
                {liveVideo && (
                  <span className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider ring-2 ring-slate-950 animate-bounce">
                    LIVE
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
                    {ministryName}
                  </h1>
                  <span className="p-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-400" title="Verified Global Ministry Sanctuary">
                    <CheckCircle2 className="w-4 h-4 fill-amber-400 text-slate-950" />
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-black uppercase tracking-wider">
                    Cathedral Sanctuary
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-amber-300 font-semibold flex items-center gap-1.5 flex-wrap">
                  <span>{currentLeader}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-normal">{churchProfile?.location || 'International Ministry'}</span>
                </p>

                {/* Key Metrics Chips */}
                <div className="flex items-center gap-3 pt-1 text-xs text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800">
                    <strong className="text-white font-bold">{formatNumber(followerCount)}</strong> Followers
                  </span>
                  <span className="flex items-center gap-1 bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-xl border border-amber-500/30">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <strong className="text-white font-bold">{memberCount.toLocaleString()}</strong> Official Members
                  </span>
                  <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentCampuses.length || 5} Global Campuses</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Cathedral Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
              
              {/* ✝️ Join Church Member Button */}
              <button
                onClick={() => onToggleJoinChurch && onToggleJoinChurch(ministryName)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-xl ${
                  isJoined
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border border-emerald-400/40 shadow-emerald-900/30'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/30 animate-pulse'
                }`}
                title={isJoined ? "You are an official member of this congregation" : "Join this church family"}
              >
                {isJoined ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 fill-white text-emerald-700" />
                    <span>Joined Member</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>✝️ Join Church</span>
                  </>
                )}
              </button>

              {/* Follow / Subscribe Button */}
              <button
                onClick={() => onToggleFollow && onToggleFollow(ministryName)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg ${
                  isFollowed
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
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

              {/* Notification Bell Dropdown */}
              {isFollowed && (
                <div className="relative">
                  <button
                    onClick={() => setShowBellDropdown(!showBellDropdown)}
                    className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                    title="Service Notifications"
                  >
                    {bellSetting === 'all' && <BellRing className="w-4 h-4 text-amber-400" />}
                    {bellSetting === 'personalized' && <Bell className="w-4 h-4 text-slate-300" />}
                    {bellSetting === 'none' && <BellOff className="w-4 h-4 text-slate-500" />}
                  </button>

                  {showBellDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-30 text-xs">
                      {[
                        { id: 'all', label: 'All Live Services', icon: BellRing, sub: 'Immediate broadcast alerts' },
                        { id: 'personalized', label: 'Highlights', icon: Bell, sub: 'Weekly sermon digests' },
                        { id: 'none', label: 'Muted', icon: BellOff, sub: 'Turn off notifications' },
                      ].map(opt => {
                        const Icon = opt.icon;
                        const isSel = bellSetting === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              onChangeBellSetting && onChangeBellSetting(ministryName, opt.id as any);
                              setShowBellDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition ${
                              isSel ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-300 hover:bg-slate-900'
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

              {/* Sow Kingdom Seed / Tithe Button */}
              <button
                onClick={() => setActiveTab('give')}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 shrink-0"
              >
                <DollarSign className="w-4 h-4" />
                <span>Give / Tithe</span>
              </button>

              {/* Share Digital Sanctuary */}
              <button
                onClick={handleShare}
                className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
                title="Share Church Home"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Social Links Bar */}
          {currentSocials.length > 0 && (
            <div className="pt-4 border-t border-slate-900 mt-5">
              <SocialMediaLinksBar
                churchOrChannelName={ministryName}
                customSocials={currentSocials}
                variant="compact"
              />
            </div>
          )}
        </div>
      </div>

      {/* 🧭 2. DIGITAL HOME NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg sticky top-2 z-30">
        {[
          { id: 'overview', label: 'Sanctuary Hub', icon: Building2, highlight: true },
          { id: 'sermons', label: 'Latest Sermons', icon: Tv, count: ministryVideos.length },
          { id: 'worship', label: 'Worship & Music', icon: Music, count: ministryAudio.length },
          { id: 'schedule', label: 'Church Schedules', icon: Calendar, count: currentSchedules.length },
          { id: 'campuses', label: 'Campuses & Maps', icon: MapPin, count: currentCampuses.length },
          { id: 'give', label: 'Give / Stewardship', icon: DollarSign, highlight: true },
          { id: 'prayer', label: 'Prayer Altar Wall', icon: Flame, count: churchPrayerList.length },
          { id: 'about', label: 'About & Vision', icon: Heart },
          { id: 'membership', label: 'Official Membership', icon: Award, highlight: isJoined },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${tab.highlight && !isActive ? 'text-amber-400' : ''}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 🌟 3. ACTIVE TAB CONTENT PANELS */}
      <div className="space-y-6">
        
        {/* ================= TAB 1: OVERVIEW / SANCTUARY HUB ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* 🔴 3A. SPOTLIGHT 1: LIVE BROADCAST CARD (WHEN LIVE NOW) */}
            {liveVideo ? (
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-950/80 via-slate-950 to-slate-950 border-2 border-red-500/50 shadow-2xl p-6 sm:p-8">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                  
                  {/* Left Info */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-600/40 animate-pulse">
                        <span className="w-2.5 h-2.5 rounded-full bg-white" />
                        <span>🔴 LIVE NOW</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>12,480 Worshippers Joined</span>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-3xl font-extrabold text-white font-serif leading-tight">
                      {liveVideo.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                      {liveVideo.description}
                    </p>

                    {liveVideo.bibleVerse && (
                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-xs text-amber-300 font-medium italic">
                        {liveVideo.bibleVerse}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => onSelectVideo(liveVideo)}
                        className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm transition flex items-center gap-2 shadow-xl shadow-red-600/30 hover:scale-105"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Enter Live Sanctuary & Pray</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('prayer')}
                        className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-2"
                      >
                        <Flame className="w-4 h-4 text-amber-400" />
                        <span>Submit Live Prayer Altar Request</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Video Thumbnail / Preview */}
                  <div className="lg:col-span-5">
                    <div 
                      onClick={() => onSelectVideo(liveVideo)}
                      className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border-2 border-red-500/40 shadow-2xl cursor-pointer group"
                    >
                      <img 
                        src={liveVideo.thumbnail} 
                        alt={liveVideo.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white bg-black/60 px-3 py-1.5 rounded-xl backdrop-blur-md">
                        <span className="font-bold">Main Cathedral Live Feed</span>
                        <span className="text-red-400 font-mono font-bold animate-pulse">● 4K BROADCAST</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ) : null}

            {/* 📅 3B. SPOTLIGHT 2: UPCOMING SERVICE SPOTLIGHT (SUNDAY SERVICE — 9:00 AM) */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 border border-amber-500/40 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-black uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upcoming Gathering</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-serif">
                    Sunday Service — 9:00 AM EST
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
                    Join us in the Main Sanctuary or tune into the worldwide live streaming broadcast for holy worship, communion, and dynamic prophetic teaching.
                  </p>

                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1 text-amber-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Main Sanctuary & Online Broadcast</span>
                    </span>
                    <span>•</span>
                    <span>Led by Senior Pastor David Williams</span>
                  </div>
                </div>

                {/* Countdown Timer Block */}
                <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Service Begins In</span>
                  
                  <div className="flex items-center gap-2">
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[52px]">
                      <div className="text-base sm:text-xl font-mono font-black text-white">{String(timeLeft.days).padStart(2, '0')}</div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Days</div>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[52px]">
                      <div className="text-base sm:text-xl font-mono font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Hours</div>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[52px]">
                      <div className="text-base sm:text-xl font-mono font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold">Mins</div>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center min-w-[52px]">
                      <div className="text-base sm:text-xl font-mono font-black text-amber-400">{String(timeLeft.seconds).padStart(2, '0')}</div>
                      <div className="text-[9px] text-amber-400 uppercase font-bold">Secs</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleDownloadCalendar}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-amber-400" />
                      <span>{reminderAlertSet === 'calendar-ics' ? 'Added to Calendar!' : 'Add to Calendar (.ics)'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setReminderAlertSet('alert-bell');
                        setTimeout(() => setReminderAlertSet(null), 3000);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>{reminderAlertSet === 'alert-bell' ? 'Alert Set!' : 'Set Alarm'}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* 📺 3C. LATEST SERMONS SHOWCASE (PREVIEW) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white font-serif">Latest Sermons & Preaching</h3>
                </div>
                <button
                  onClick={() => setActiveTab('sermons')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <span>View All ({ministryVideos.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ministryVideos.slice(0, 3).map(v => (
                  <motion.div
                    key={v.id}
                    whileHover={{ y: -3, scale: 1.01 }}
                    onClick={() => onSelectVideo(v)}
                    className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-3 space-y-3 cursor-pointer group transition shadow-lg flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                        <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-bold">
                          {v.isLive ? 'LIVE' : v.duration || '45:00'}
                        </span>
                        {v.seriesName && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                            {v.seriesName}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                          {v.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">{v.speakerOrArtist} • {v.date}</p>
                      </div>
                    </div>

                    {v.bibleVerse && (
                      <div className="text-[10px] text-amber-300/90 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 line-clamp-1 italic">
                        {v.bibleVerse}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 🎵 3D. WORSHIP & MUSIC SHOWCASE (PREVIEW) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base sm:text-lg font-bold text-white font-serif">Cathedral Worship & Choirs</h3>
                </div>
                <button
                  onClick={() => setActiveTab('worship')}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                >
                  <span>View All Audio ({ministryAudio.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ministryAudio.slice(0, 2).map(a => (
                  <div
                    key={a.id}
                    onClick={() => onPlayAudioTrack(a)}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 flex items-center justify-between gap-3 cursor-pointer group transition shadow-md"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={a.coverUrl} alt={a.title} className="w-12 h-12 rounded-xl object-cover shrink-0 group-hover:scale-105 transition" />
                      <div className="overflow-hidden">
                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider">{a.category}</span>
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-rose-300 transition">
                          {a.title}
                        </h4>
                        <p className="text-[10px] text-slate-400">{a.artistOrPreacher} • {a.duration}</p>
                      </div>
                    </div>

                    <button className="w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 💸 3E. QUICK SEED GIVING BANNER */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Sow Kingdom Seed into {ministryName}</h4>
                  <p className="text-xs text-slate-300">Support gospel broadcasting, global church planting, and humanitarian missions.</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('give')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20 shrink-0"
              >
                <span>Open Giving Kiosk</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* ================= TAB 2: LATEST SERMONS ================= */}
        {activeTab === 'sermons' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Expositional Sermon Archives & Series</h3>
                <p className="text-xs text-slate-400">Watch life-transforming messages from {ministryName} pastoral team</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                {ministryVideos.length} Sermons
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ministryVideos.map(v => (
                <motion.div
                  key={v.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  onClick={() => onSelectVideo(v)}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 p-3.5 space-y-3 cursor-pointer group transition shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition flex items-center justify-center">
                        <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-bold">
                        {v.isLive ? 'LIVE' : v.duration || '50:00'}
                      </span>
                      {v.seriesName && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                          {v.seriesName}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                        {v.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">{v.speakerOrArtist} • {v.date}</p>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {v.description}
                    </p>
                  </div>

                  {v.bibleVerse && (
                    <div className="text-[10px] text-amber-300 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800/80 line-clamp-1 italic">
                      📖 {v.bibleVerse}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: WORSHIP & ANNOINTED MUSIC ================= */}
        {activeTab === 'worship' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Anointed Praise, Choral Anthems & Live Radio</h3>
                <p className="text-xs text-slate-400">Atmospheric recordings and spontaneous altar praise from {ministryName}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold">
                {ministryAudio.length} Audio Tracks
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ministryAudio.map(a => (
                <div
                  key={a.id}
                  onClick={() => onPlayAudioTrack(a)}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 flex items-center justify-between gap-4 cursor-pointer group transition shadow-lg"
                >
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <img src={a.coverUrl} alt={a.title} className="w-14 h-14 rounded-2xl object-cover shrink-0 group-hover:scale-105 transition shadow-md" />
                    <div className="overflow-hidden space-y-0.5">
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">{a.category}</span>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-rose-300 transition">
                        {a.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">{a.artistOrPreacher} • {a.albumOrSeries}</p>
                      {a.downloadsCount && (
                        <p className="text-[10px] text-slate-500 font-mono">{a.downloadsCount}</p>
                      )}
                    </div>
                  </div>

                  <button className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xl group-hover:scale-110 transition">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: CHURCH SCHEDULES & BROADCASTS ================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Official Weekly Church & Broadcast Calendar</span>
                </h3>
                <p className="text-xs text-slate-400">Weekly worship assemblies, discipleship classes, and 24/7 prayer altars</p>
              </div>

              <button
                onClick={handleDownloadCalendar}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Full Calendar (.ics)</span>
              </button>
            </div>

            <div className="space-y-3">
              {currentSchedules.map(sch => (
                <div
                  key={sch.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 space-y-2.5 transition shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                        {sch.day}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-mono font-bold flex items-center gap-1 border border-slate-700">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {sch.time}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 text-xs font-bold">
                        {sch.type}
                      </span>
                      {sch.isLiveNow && (
                        <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-widest animate-pulse flex items-center gap-1">
                          <Radio className="w-3 h-3" /> Live Now
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setReminderAlertSet(sch.id);
                        setTimeout(() => setReminderAlertSet(null), 2500);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                        reminderAlertSet === sch.id
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {reminderAlertSet === sch.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Reminder Set!</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 text-amber-400" />
                          <span>Remind Me</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{sch.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sch.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 flex-wrap gap-2">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{sch.locationOrStream}</span>
                    </span>
                    <span className="text-amber-300 font-medium">Led by {sch.speakerOrLeader}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: CAMPUSES & LOCATIONS ================= */}
        {activeTab === 'campuses' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Global Sanctuary Campuses & Fellowship Centers</h3>
                <p className="text-xs text-slate-400">Visit any {ministryName} campus in person or connect with campus pastors</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                {currentCampuses.length} Campuses
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentCampuses.map(campus => (
                <div
                  key={campus.id}
                  className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-4 p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-950">
                      <img src={campus.image} alt={campus.campusName} className="w-full h-full object-cover" />
                      {campus.isMainCampus && (
                        <span className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg">
                          ★ Main International Headquarters
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">{campus.campusName}</h4>
                      <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{campus.address}, {campus.city}, {campus.country}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                      <div className="text-amber-400 font-bold">Pastoral Team:</div>
                      <div className="text-slate-300">{campus.leadPastor}</div>
                      <div className="text-[11px] text-slate-500">{campus.phone} • {campus.email}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Service Hours:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {campus.serviceTimes.map((t, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 font-mono">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {campus.features.map((f, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] text-slate-400 border border-slate-800">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={campus.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700 shadow-md"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Get Directions via Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 6: GIVE / KINGDOM SEED ================= */}
        {activeTab === 'give' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-amber-950/60 via-slate-950 to-slate-950 border border-amber-500/40 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
                <DollarSign className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-serif">
                {ministryName} Kingdom Stewardship Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                "Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the Lord of hosts." — Malachi 3:10
              </p>
            </div>

            {giveSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-300 font-bold flex items-center gap-3 shadow-xl"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{giveSuccessMsg}</span>
              </motion.div>
            )}

            {/* Giving Form Kiosk */}
            <form onSubmit={handleProcessGiving} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
              
              {/* 1. Fund Selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-bold">Select Giving Fund:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'tithe', label: 'Tithe & Firstfruits', icon: Heart },
                    { id: 'building', label: 'Building Fund', icon: Building2 },
                    { id: 'missions', label: 'Global Missions', icon: Globe },
                    { id: 'media', label: 'Media Satellite', icon: Tv },
                  ].map(f => {
                    const Icon = f.icon;
                    const isSel = giveFund === f.id;
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => setGiveFund(f.id as any)}
                        className={`p-3 rounded-2xl border text-center transition space-y-1 ${
                          isSel
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 mx-auto" />
                        <div className="text-xs">{f.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Frequency & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-bold">Giving Frequency:</label>
                  <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                    {[
                      { id: 'one-time', label: 'One-Time Seed' },
                      { id: 'weekly', label: 'Weekly' },
                      { id: 'monthly', label: 'Monthly Covenant' },
                    ].map(freq => (
                      <button
                        type="button"
                        key={freq.id}
                        onClick={() => setGiveFrequency(freq.id as any)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                          giveFrequency === freq.id ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-bold">Select Currency:</label>
                  <select
                    value={giveCurrency}
                    onChange={(e) => setGiveCurrency(e.target.value as any)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="USD">USD ($) — United States Dollar</option>
                    <option value="GBP">GBP (£) — British Pound</option>
                    <option value="EUR">EUR (€) — Euro</option>
                    <option value="NGN">NGN (₦) — Nigerian Naira</option>
                    <option value="KES">KES (KSh) — Kenyan Shilling</option>
                    <option value="UGX">UGX (USh) — Ugandan Shilling</option>
                  </select>
                </div>
              </div>

              {/* 3. Preset Amounts */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-bold">Select Amount ({giveCurrency}):</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[25, 50, 100, 250, 500, 1000].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => {
                        setGiveAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2.5 rounded-xl border text-xs font-mono font-black transition ${
                        giveAmount === amt && !customAmount
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {giveCurrency} {amt}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={`Or enter custom amount in ${giveCurrency}...`}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Submit Seed Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20"
              >
                <DollarSign className="w-5 h-5" />
                <span>
                  Sow {giveCurrency} {customAmount ? customAmount : giveAmount} Kingdom Seed
                </span>
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                🔒 256-bit encrypted giving portal. All gifts are 501(c)(3) tax deductible where applicable.
              </p>
            </form>
          </div>
        )}

        {/* ================= TAB 7: PRAYER ALTAR WALL ================= */}
        {activeTab === 'prayer' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-950 to-slate-950 border border-indigo-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{ministryName} 24/7 Prayer Altar</h3>
                  <p className="text-xs text-slate-300">Submit your prayer requests to our intercessory council and pray with the saints.</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold shrink-0">
                24/7 Intercessors Active
              </span>
            </div>

            {/* Prayer Input Box */}
            <form onSubmit={handleAddPrayer} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-bold">Write Your Prayer Altar Request:</label>
                <textarea
                  value={prayerRequestText}
                  onChange={(e) => setPrayerRequestText(e.target.value)}
                  placeholder="Share what you are believing God for (Healing, Family, Career, Deliverance, Salvation of loved ones)..."
                  rows={3}
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition leading-relaxed resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={prayerTag}
                    onChange={(e) => setPrayerTag(e.target.value)}
                    className="py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Healing & Health">🕊️ Healing & Health</option>
                    <option value="Family & Marriage">💍 Family & Marriage</option>
                    <option value="Financial Breakthrough">🌱 Financial Breakthrough</option>
                    <option value="Spiritual Growth & Fire">🔥 Spiritual Fire & Revival</option>
                    <option value="Salvation of Loved Ones">✝️ Salvation of Loved Ones</option>
                  </select>

                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymousPrayer}
                      onChange={(e) => setIsAnonymousPrayer(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-500 focus:ring-0"
                    />
                    <span>Post Anonymously</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!prayerRequestText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Altar</span>
                </button>
              </div>

              {prayerSubmitted && (
                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Your prayer request has been placed upon the altar. Intercessors are praying with you!</span>
                </div>
              )}
            </form>

            {/* Church Prayer Wall Requests */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Congregation Prayer Wall</h4>

              {churchPrayerList.map(req => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{req.name}</span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                        {req.tag}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{req.time}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{req.text}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => handleTogglePrayerAmen(req.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                        req.hasAmened
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${req.hasAmened ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span>{req.hasAmened ? 'Prayed Amen' : 'Stand in Agreement'}</span>
                      <span className="ml-1 text-[10px] font-mono">({req.amens})</span>
                    </button>
                    <span className="text-[11px] text-slate-500">Grace City Intercession Team Standing With You</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= TAB 8: ABOUT & STATEMENT OF FAITH ================= */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Senior Leadership Bio */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-4">
                <img src={currentAvatar} alt={ministryName} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500/40" />
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">{currentLeader}</h3>
                  <p className="text-xs text-amber-400 font-semibold">{churchProfile?.pastorTitle || 'Senior Pastors & Apostolic Overseers'}</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentBio}
              </p>
            </div>

            {/* Statement of Faith */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-base font-black text-white font-serif flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Our Statement of Faith & Core Doctrine</span>
              </h3>

              <div className="space-y-3">
                {(churchProfile?.statementOfFaith || [
                  'We believe the Bible is the inspired, infallible Word of God.',
                  'We believe in one God, eternally existent in Father, Son, and Holy Spirit.',
                  'We believe in the deity and bodily resurrection of our Lord Jesus Christ.',
                  'We believe in salvation by grace through faith in Christ alone.'
                ]).map((doctrine, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed">{doctrine}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission Statement */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Our Kingdom Mission & Vision 2030</h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                "{churchProfile?.missionStatement || 'To proclaim the uncompromised Gospel of Jesus Christ, making disciples in all nations.'}"
              </p>
            </div>

          </div>
        )}

        {/* ================= TAB 9: OFFICIAL MEMBERSHIP ================= */}
        {activeTab === 'membership' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-950/60 via-slate-950 to-slate-950 border-2 border-emerald-500/40 space-y-5 shadow-2xl text-center">
              
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                  Official Church Family Pass
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-serif mt-2">
                  {ministryName} Congregation Membership
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                  {isJoined 
                    ? 'You are an officially verified online and campus member of this congregation!'
                    : 'Join thousands of believers worldwide as an official member of this spiritual family.'}
                </p>
              </div>

              {/* Digital Member Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 text-left space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img src={currentAvatar} alt={ministryName} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <div className="text-xs font-black text-white">{ministryName}</div>
                      <div className="text-[10px] text-amber-400">Digital Congregation Member</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Member ID</span>
                    <span className="font-mono text-white font-bold">GCC-2026-M8492</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Affiliated Campus</span>
                    <span className="text-white font-bold">Main Sanctuary & Online</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Spiritual Standing</span>
                    <span className="text-emerald-400 font-bold">Pillar of Light (Full Fellowship)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Member Since</span>
                    <span className="text-white font-bold">September 2026</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Signatory: Senior Pastor David Williams</span>
                  <span className="text-amber-400 font-mono">Verified by GraceTube Altar</span>
                </div>
              </div>

              <button
                onClick={() => onToggleJoinChurch && onToggleJoinChurch(ministryName)}
                className={`w-full py-3 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-xl ${
                  isJoined
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-600/30 animate-pulse'
                }`}
              >
                {isJoined ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>You are a Member (Click to Leave)</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" />
                    <span>Join {ministryName} as an Official Member</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

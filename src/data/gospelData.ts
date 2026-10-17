export interface VideoStream {
  id: string;
  title: string;
  speakerOrArtist: string;
  churchOrMinistry: string;
  channelAvatar: string;
  subscribersCount: string;
  likesCount: string;
  category: 'Live Worship' | 'Sermon' | 'Choir Special' | 'Bible Study' | 'Gospel Music';
  isLive: boolean;
  /** True when this stream is a short-form clip (≤ 3 min), sourced from /shorts/ */
  isShort?: boolean;
  viewersCount?: number;
  viewsText?: string;
  duration?: string;
  thumbnail: string;
  description: string;
  bibleVerse?: string;
  date: string;
  videoUrl?: string;
  streamUrl?: string;
  /** CSS object-position used to crop non-9:16 Nuggets, e.g. "35% 50%". */
  cropPosition?: string;
  seriesName?: string;
}

export interface AudioChapter {
  time: string;
  seconds: number;
  title: string;
  scriptureRef?: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  artistOrPreacher: string;
  albumOrSeries: string;
  channelAvatar: string;
  category: 'Praise & Worship' | 'Audio Sermon' | '24/7 Gospel Radio' | 'Podcast' | 'Devotional';
  coverUrl: string;
  duration: string;
  isLiveRadio?: boolean;
  listenersCount?: number;
  lyricsOrNotes?: string;
  publishedDate?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  chapters?: AudioChapter[];
  sermonOutline?: string[];
  scriptureVerses?: { reference: string; text: string }[];
  tags?: string[];
  downloadsCount?: string;
  rating?: number;
  audioUrl?: string;
}

export type ReactionType = 'amen' | 'fire' | 'heart' | 'pray';

export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isPrayer?: boolean;
  badge?: string;
  reactionCount: number;
  reactions?: Record<ReactionType, number>;
  userReactions?: ReactionType[];
}

export interface ServiceScheduleItem {
  id: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Weekly';
  time: string;
  title: string;
  type: 'Worship Service' | 'Bible Study' | 'Midweek Prayer' | 'Youth Fellowship' | 'Choir Practice' | 'Special Event';
  locationOrStream: string;
  speakerOrLeader: string;
  description: string;
  isLiveNow?: boolean;
  campusId?: string;
}

export interface ChurchLocation {
  id: string;
  churchName: string;
  campusName: string;
  isMainCampus?: boolean;
  address: string;
  city: string;
  stateOrRegion: string;
  country: string;
  zipCode?: string;
  leadPastor: string;
  pastorAvatar?: string;
  phone: string;
  email: string;
  googleMapsUrl: string;
  serviceTimes: string[];
  features: string[];
  image: string;
}

export interface SocialLink {
  platform: 'youtube' | 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'spotify' | 'applepodcasts' | 'telegram' | 'whatsapp' | 'website';
  label: string;
  url: string;
  handle: string;
  followers?: string;
  isPrimary?: boolean;
}

export interface MinistryGivingFund {
  id: string;
  name: string;
  description: string;
  targetAmount?: number;
  raisedAmount?: number;
  icon: string;
  isTaxDeductible?: boolean;
}

export interface ChurchProfile {
  name: string;
  avatar: string;
  coverImage: string;
  location: string;
  leadPastor: string;
  pastorTitle?: string;
  pastorBio?: string;
  website: string;
  phone?: string;
  email?: string;
  statementOfFaith?: string[];
  missionStatement?: string;
  memberCount: number;
  followerCount: number;
  isLiveNow?: boolean;
  liveViewersCount?: number;
  liveStreamTitle?: string;
  upcomingServiceTitle?: string;
  upcomingServiceTime?: string;
  upcomingServiceCountdownIso?: string;
  schedules: ServiceScheduleItem[];
  campuses?: ChurchLocation[];
  socials?: SocialLink[];
  givingFunds?: MinistryGivingFund[];
}

export const LIVE_VIDEO_STREAMS: VideoStream[] = [
  {
    id: 'stream-gcc-live',
    title: 'Sunday Apostolic Communion & Prophetic Impartation — Live Sanctuary',
    speakerOrArtist: 'Senior Pastor David Williams',
    churchOrMinistry: 'Grace City Cathedral',
    channelAvatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '1.48M',
    likesCount: '34.2K',
    category: 'Live Worship',
    isLive: true,
    viewersCount: 12480,
    viewsText: '12,480 worshippers joined in the Spirit',
    thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
    description: 'Experience holy atmospheric praise, deep revelatory exposition on covenant grace, and prophetic prayer altar impartation live from Grace City Cathedral main sanctuary.',
    bibleVerse: 'Hebrews 4:16 — "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need."',
    date: 'LIVE NOW',
    seriesName: 'Covenant Glory Season',
    streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-church-windows-with-sunlight-streaming-through-41584-large.mp4',
  },
  {
    id: 'stream-gcc-sermon-1',
    title: 'Unshakable Faith in the Storm: Walking on Water When Waves Rise',
    speakerOrArtist: 'Senior Pastor David Williams',
    churchOrMinistry: 'Grace City Cathedral',
    channelAvatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '1.48M',
    likesCount: '19.8K',
    category: 'Sermon',
    isLive: false,
    duration: '52:14',
    viewsText: '142K views',
    thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80',
    description: 'When the winds contrary threaten your peace, fix your spiritual eyes upon the Christ of Glory. Discover how faith subdues natural laws.',
    bibleVerse: 'Romans 8:31 — "If God be for us, who can be against us?"',
    date: '3 days ago',
    seriesName: 'Kingdom Dominion Masterclass',
    streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-church-interior-with-pews-and-sunlight-41585-large.mp4',
  },
  {
    id: 'stream-gcc-sermon-2',
    title: 'Walking in the Supernatural Realm: Accessing Heavenly Dimensions',
    speakerOrArtist: 'Pastor Sarah Williams',
    churchOrMinistry: 'Grace City Cathedral',
    channelAvatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '1.48M',
    likesCount: '14.5K',
    category: 'Sermon',
    isLive: false,
    duration: '48:30',
    viewsText: '98K views',
    thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80',
    description: 'The spirit world is more real than the physical. Learn how consecrated believers operate in holy angelic assistance and divine revelation.',
    bibleVerse: 'Ephesians 1:17-19',
    date: '1 week ago',
    seriesName: 'The Spirit Realm',
    streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-church-windows-with-sunlight-streaming-through-41584-large.mp4',
  },
  {
    id: 'stream-gcc-worship-live',
    title: 'Holy is the Lord — Spontaneous 2-Hour Atmospheric Worship Altar',
    speakerOrArtist: 'Grace City Worship Choir & Ensembles',
    churchOrMinistry: 'Grace City Cathedral',
    channelAvatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '1.48M',
    likesCount: '45.1K',
    category: 'Choir Special',
    isLive: false,
    duration: '1:42:10',
    viewsText: '320K views',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    description: 'Anointed uninterrupted praise and deep adoration recorded live at Grace City Cathedral during the Global Night of Encounter.',
    bibleVerse: 'Revelation 4:8 — "Holy, holy, holy, Lord God Almighty, which was, and is, and is to come."',
    date: '2 weeks ago',
    seriesName: 'Ascend Live Series',
    streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-church-interior-with-pews-and-sunlight-41585-large.mp4',
  },
  {
    id: 'stream-elevation-live',
    title: 'Elevation Worship & Praise Celebration: The Valley of Miracles',
    speakerOrArtist: 'Pastor Steven Furtick',
    churchOrMinistry: 'Elevation Praise Center',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '2.8M',
    likesCount: '58.9K',
    category: 'Live Worship',
    isLive: false,
    duration: '1:15:20',
    viewsText: '410K views',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    description: 'Elevation Church live weekend worship service with Steven Furtick delivering a dynamic word on unlocking God’s promises.',
    bibleVerse: 'Philippians 4:13',
    date: 'Yesterday',
    streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-church-windows-with-sunlight-streaming-through-41584-large.mp4',
  },
  {
    id: 'stream-dunamis-live',
    title: 'Nights of Holy Fire & Deliverance Altar — Apostolic Wonders',
    speakerOrArtist: 'Dr. Paul Enenche',
    churchOrMinistry: 'Dunamis International Gospel Centre',
    channelAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '1.95M',
    likesCount: '41.2K',
    category: 'Live Worship',
    isLive: false,
    duration: '2:10:00',
    viewsText: '540K views',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    description: 'Apostolic breakthrough service at the Glory Dome. Miracles, healing testimonies, and mighty revival songs.',
    bibleVerse: 'Acts 10:38',
    date: '4 days ago',
    streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-church-interior-with-pews-and-sunlight-41585-large.mp4',
  },
  {
    id: 'stream-sinach-waymaker',
    title: 'Way Maker & I Know Who I Am — Global Miracle Concert',
    speakerOrArtist: 'Sinach Live International',
    churchOrMinistry: 'Sinach Global Ministry',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '2.1M',
    likesCount: '180K',
    category: 'Gospel Music',
    isLive: false,
    duration: '28:40',
    viewsText: '1.2M views',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    description: 'Sinach leads millions into the holy presence of God across nations in this triumphant global worship assembly.',
    date: '1 month ago',
    streamUrl: 'https://assets.mixkit.co/videos/preview/mixkit-church-windows-with-sunlight-streaming-through-41584-large.mp4',
  },
];

export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'aud-gcc-album-1',
    title: 'Ascend: The Glory Altar Live (Full Album)',
    artistOrPreacher: 'Grace City Cathedral Choir & Anointed Psalmist',
    albumOrSeries: 'Ascend Cathedral Praise Vol. 1',
    channelAvatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
    category: 'Praise & Worship',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    duration: '42:15',
    isLiveRadio: false,
    downloadsCount: '88K Streams',
    rating: 5.0,
    tags: ['#CathedralWorship', '#PropheticPraise', '#GraceCity'],
    lyricsOrNotes: 'Holy, Holy, Holy is the Lamb who sits upon the throne. Glory, honor, power, and blessing belong to our God forevermore.',
    publishedDate: 'Sep 2026',
  },
  {
    id: 'aud-gcc-sermon-podcast',
    title: 'The Mystery of Seed, Tithe & Heavenly Harvest (Audio Masterclass)',
    artistOrPreacher: 'Senior Pastor David Williams',
    albumOrSeries: 'Grace City Cathedral Kingdom Podcast',
    channelAvatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
    category: 'Podcast',
    coverUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80',
    duration: '38:50',
    episodeNumber: 104,
    seasonNumber: 4,
    downloadsCount: '64K Listens',
    rating: 4.9,
    publishedDate: 'Aug 2026',
    sermonOutline: [
      '1. Understanding the Law of Sowing and Reaping',
      '2. Why Giving Releases Supernatural Protection (Malachi 3:10)',
      '3. Moving from Scarcity Mindset to Kingdom Abundance',
    ],
  },
  {
    id: 'aud-radio-247',
    title: '24/7 Global Grace Cathedral Radio — Uninterrupted Praise & Prayers',
    artistOrPreacher: 'Grace City Broadcasting Network',
    albumOrSeries: '24/7 Live Stream Radio',
    channelAvatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
    category: '24/7 Gospel Radio',
    coverUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80',
    duration: 'LIVE',
    isLiveRadio: true,
    listenersCount: 8450,
    downloadsCount: '24/7 Active',
    rating: 5.0,
    tags: ['#247GospelRadio', '#LiveBroadcast'],
  },
  {
    id: 'aud-elevation-praise',
    title: 'Jireh & RATTLE! (Acoustic Sanctuary Edition)',
    artistOrPreacher: 'Elevation Worship',
    albumOrSeries: 'Old Church Basement Session',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    category: 'Praise & Worship',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
    duration: '7:45',
    downloadsCount: '310K Streams',
    rating: 4.9,
    publishedDate: 'Jul 2026',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

export const CHURCH_SCHEDULES: Record<string, ServiceScheduleItem[]> = {};

export const CHURCH_LOCATIONS: Record<string, ChurchLocation[]> = {};

export const CHURCH_SOCIALS: Record<string, SocialLink[]> = {};

export const GRACE_CITY_CATHEDRAL_PROFILE: ChurchProfile = {
  name: 'Grace City Cathedral',
  avatar: '',
  coverImage: '',
  location: '',
  leadPastor: '',
  website: '',
  statementOfFaith: [],
  missionStatement: '',
  memberCount: 0,
  followerCount: 0,
  schedules: [],
  campuses: [],
  socials: [],
  givingFunds: []
};

export const SUBSCRIPTION_CHANNELS: { name: string; avatar: string; liveNow: boolean }[] = [];

export interface RhemaPromise {
  id: string;
  theme: string;
  verse: string;
  scripture: string;
  declaration: string;
  reflection: string;
  badgeTag: string;
}

export const DAILY_RHEMA_PROMISES: RhemaPromise[] = [];

export interface GraceShort {
  id: string;
  title: string;
  speaker: string;
  church: string;
  avatar: string;
  likes: string;
  amensCount: number;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  tags: string[];
  cropPosition?: string;
}

export const GRACE_SHORTS: GraceShort[] = [
  {
    id: 'short-1',
    title: 'When God Closes A Door, He Prepares A Throne Room! 🔥',
    speaker: 'Pastor David Williams',
    church: 'Grace City Cathedral',
    avatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
    likes: '48.2K',
    amensCount: 1820,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-church-windows-with-sunlight-streaming-through-41584-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
    duration: '0:45',
    tags: ['#GraceShorts', '#PropheticWord', '#Faith'],
  },
  {
    id: 'short-2',
    title: 'Why Praise Confuses The Enemy Every Single Time! ⚡',
    speaker: 'Pastor Steven Furtick',
    church: 'Elevation Praise Center',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    likes: '34.9K',
    amensCount: 1420,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-church-interior-with-pews-and-sunlight-41585-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    duration: '0:52',
    tags: ['#PraiseWeapon', '#Elevation'],
  },
];

export interface FaithBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  xpRequired: number;
  unlocked: boolean;
}

export const FAITH_BADGES: FaithBadge[] = [];

export function registerChurchProfile(
  churchName: string, 
  locations?: ChurchLocation[], 
  socials?: SocialLink[]
) {
  if (churchName && locations && locations.length > 0) {
    CHURCH_LOCATIONS[churchName] = locations;
  }
  if (churchName && socials && socials.length > 0) {
    CHURCH_SOCIALS[churchName] = socials;
  }
}

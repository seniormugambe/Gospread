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
  viewersCount?: number;
  viewsText?: string;
  duration?: string;
  thumbnail: string;
  description: string;
  bibleVerse?: string;
  date: string;
  videoUrl?: string;
  streamUrl?: string;
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

export const LIVE_VIDEO_STREAMS: VideoStream[] = [];

export const AUDIO_TRACKS: AudioTrack[] = [];

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
}

export const GRACE_SHORTS: GraceShort[] = [];

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

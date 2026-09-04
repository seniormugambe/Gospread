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

export const LIVE_VIDEO_STREAMS: VideoStream[] = [
  // 🔴 Active Live Broadcasts (Grace City, New Life, Kingdom Chapel, Elevation Praise)
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
    viewersCount: 2420,
    viewsText: '2.4K watching',
    thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
    description: 'Experience holy atmospheric praise, deep revelatory exposition on covenant grace, and prophetic prayer altar impartation live from Grace City Cathedral main sanctuary.',
    bibleVerse: 'Hebrews 4:16 — "Let us therefore come boldly unto the throne of grace, that we may obtain mercy, and find grace to help in time of need."',
    date: 'LIVE NOW',
    seriesName: 'Covenant Glory Season'
  },
  {
    id: 'stream-newlife-live',
    title: 'Atmosphere of Miracles & Fresh Fire Revival Service — Live Sanctuary',
    speakerOrArtist: 'Pastor Michael Evans',
    churchOrMinistry: 'New Life Church',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '840K',
    likesCount: '18.4K',
    category: 'Live Worship',
    isLive: true,
    viewersCount: 831,
    viewsText: '831 watching',
    thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80',
    description: 'Join New Life Church live as we press into the supernatural presence of the Holy Spirit with testimonies of healing and breakthrough.',
    bibleVerse: 'Acts 3:19 — "Repent ye therefore, and be converted, that your sins may be blotted out, when the times of refreshing shall come from the presence of the Lord."',
    date: 'LIVE NOW',
    seriesName: 'Fresh Fire Revival'
  },
  {
    id: 'stream-kingdom-chapel-live',
    title: 'Divine Encounter & Prophetic Breakthrough Altar — Live Sunday Service',
    speakerOrArtist: 'Bishop Emmanuel K.',
    churchOrMinistry: 'Kingdom Chapel',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '620K',
    likesCount: '21.5K',
    category: 'Live Worship',
    isLive: true,
    viewersCount: 1210,
    viewsText: '1.2K watching',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    description: 'Consecrated worship, prophetic decreeing, and prayer warfare. Step into the fullness of God’s covenant promises for your family.',
    bibleVerse: 'Psalm 103:2-3',
    date: 'LIVE NOW',
    seriesName: 'Prophetic Altar'
  },
  {
    id: 'stream-elevation-live',
    title: 'Glorious Praise Celebration & Supernatural Worship Night',
    speakerOrArtist: 'Pastor Steven Furtick',
    churchOrMinistry: 'Elevation Praise',
    channelAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '2.8M',
    likesCount: '48.9K',
    category: 'Live Worship',
    isLive: true,
    viewersCount: 940,
    viewsText: '940 watching',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    description: 'Elevation Praise weekend live worship encounter. An unforgettable outpouring of unhindered praise and spiritual rejoicing.',
    bibleVerse: 'Philippians 4:4 — "Rejoice in the Lord alway: and again I say, Rejoice."',
    date: 'LIVE NOW',
    seriesName: 'Praise Without Walls'
  },

  // 📖 Sermons & Apostolic Teachings
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
    thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1200&q=80',
    description: 'When the winds contrary threaten your peace, fix your spiritual eyes upon the Christ of Glory. Discover how faith subdues natural laws.',
    bibleVerse: 'Romans 8:31 — "If God be for us, who can be against us?"',
    date: '3 days ago',
    seriesName: 'Kingdom Dominion Masterclass'
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
    thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    description: 'The spirit world is more real than the physical. Learn how consecrated believers operate in holy angelic assistance and divine revelation.',
    bibleVerse: 'Ephesians 1:17-19',
    date: '1 week ago',
    seriesName: 'The Spirit Realm'
  },
  {
    id: 'stream-newlife-sermon',
    title: 'The Power of the Spoken Word: Decreeing Kingdom Realities Over Your Life',
    speakerOrArtist: 'Pastor Michael Evans',
    churchOrMinistry: 'New Life Church',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '840K',
    likesCount: '16.2K',
    category: 'Sermon',
    isLive: false,
    duration: '44:15',
    viewsText: '67K views',
    thumbnail: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80',
    description: 'Death and life are in the power of the tongue. Learn the biblical keys of prophetic alignment and releasing God’s word in faith.',
    bibleVerse: 'Proverbs 18:21',
    date: '5 days ago',
    seriesName: 'Kingdom Decrees'
  },
  {
    id: 'stream-kingdom-sermon',
    title: 'Living by Covenant Grace: Transcending Earthly Limitations',
    speakerOrArtist: 'Bishop Emmanuel K.',
    churchOrMinistry: 'Kingdom Chapel',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '620K',
    likesCount: '25.3K',
    category: 'Sermon',
    isLive: false,
    duration: '56:20',
    viewsText: '115K views',
    thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
    description: 'Grace is not merely unmerited favor; it is divine enablement. Understand your covenant rights as a blood-bought son and daughter of God.',
    bibleVerse: '2 Corinthians 12:9',
    date: '2 weeks ago',
    seriesName: 'Covenant Foundations'
  },

  // 🎵 Anointed Worship & Praise
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
    seriesName: 'Ascend Live Series'
  },
  {
    id: 'stream-elevation-worship-rec',
    title: 'Elevation Worship & Praise Celebration: The Valley of Miracles',
    speakerOrArtist: 'Pastor Steven Furtick & Elevation Worship',
    churchOrMinistry: 'Elevation Praise',
    channelAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '2.8M',
    likesCount: '58.9K',
    category: 'Live Worship',
    isLive: false,
    duration: '1:15:20',
    viewsText: '410K views',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    description: 'Elevation Church weekend worship service with Steven Furtick delivering a dynamic word on unlocking God’s promises.',
    bibleVerse: 'Philippians 4:13',
    date: 'Yesterday'
  },
  {
    id: 'stream-dunamis-worship',
    title: 'Nights of Holy Fire & Deliverance Altar — Apostolic Wonders',
    speakerOrArtist: 'Dr. Paul Enenche & Dunamis Choir',
    churchOrMinistry: 'Dunamis International Gospel Centre',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    subscribersCount: '1.95M',
    likesCount: '41.2K',
    category: 'Live Worship',
    isLive: false,
    duration: '2:10:00',
    viewsText: '540K views',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    description: 'Apostolic breakthrough service at the Glory Dome. Miracles, healing testimonies, and mighty revival songs.',
    bibleVerse: 'Acts 10:38',
    date: '4 days ago'
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
    date: '1 month ago'
  }
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
    publishedDate: 'Sep 2026'
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
      '3. Moving from Scarcity Mindset to Kingdom Abundance'
    ]
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
    tags: ['#247GospelRadio', '#LiveBroadcast']
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
    publishedDate: 'Jul 2026'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    user: 'Minister Grace Adeyemi',
    text: 'Watching live from London! The glory in this sanctuary is tangible! Amen! 🙌🔥',
    time: '10:32 AM',
    badge: 'Intercessor Leader',
    reactionCount: 24,
    reactions: { amen: 18, fire: 6, heart: 12, pray: 9 }
  },
  {
    id: 'msg-2',
    user: 'Elder Matthew Johnson',
    text: 'Pastor David’s word on covenant faith just answered my 3-month prayer. Hallelujah!',
    time: '10:33 AM',
    badge: 'Cathedral Member',
    reactionCount: 15,
    reactions: { amen: 14, fire: 4, heart: 8, pray: 3 }
  },
  {
    id: 'msg-3',
    user: 'Sister Deborah Mwangi',
    text: 'Joining the prayer altar from Nairobi Kenya campus! Connecting my family into the blessing!',
    time: '10:34 AM',
    isPrayer: true,
    badge: 'Nairobi Campus Member',
    reactionCount: 31,
    reactions: { amen: 28, fire: 11, heart: 20, pray: 25 }
  },
  {
    id: 'msg-4',
    user: 'Brother Samuel Cole',
    text: 'Just planted my seed for the Cathedral Expansion Fund. God is faithful! ✝️❤️',
    time: '10:35 AM',
    badge: 'Kingdom Sower',
    reactionCount: 42,
    reactions: { amen: 39, fire: 15, heart: 30, pray: 8 }
  }
];

export const CHURCH_SCHEDULES: Record<string, ServiceScheduleItem[]> = {
  'Grace City Cathedral': [
    {
      id: 'gcc-sch-1',
      day: 'Sunday',
      time: '9:00 AM EST',
      title: 'Sunday Morning Glory & Early Sanctuary Service',
      type: 'Worship Service',
      locationOrStream: 'Main Sanctuary (Atlanta) & Worldwide Live Broadcast',
      speakerOrLeader: 'Senior Pastor David Williams',
      description: 'Dynamic early morning congregational worship, holy scripture declaration, and spirit-led preaching for the whole family.',
      isLiveNow: false
    },
    {
      id: 'gcc-sch-2',
      day: 'Sunday',
      time: '11:30 AM EST',
      title: 'Apostolic Communion & Prophetic Impartation (Flagship Live)',
      type: 'Worship Service',
      locationOrStream: 'Cathedral Grand Sanctuary & 4K Satellite Stream',
      speakerOrLeader: 'Senior Pastor David & Pastor Sarah Williams',
      description: 'The flagship cathedral assembly featuring the full 150-voice choir, ordinance of Holy Communion, and miracles prayer line.',
      isLiveNow: true
    },
    {
      id: 'gcc-sch-3',
      day: 'Wednesday',
      time: '7:00 PM EST',
      title: 'Rhema Midweek Bible Exposition & Spiritual Masterclass',
      type: 'Bible Study',
      locationOrStream: 'Fellowship Hall & Online Interactive Zoom Altar',
      speakerOrLeader: 'Pastor Sarah Williams & Teaching Pastors',
      description: 'In-depth verse-by-verse scriptural discipleship, interactive Q&A, and practical wisdom for marketplace leaders.',
      isLiveNow: false
    },
    {
      id: 'gcc-sch-4',
      day: 'Friday',
      time: '9:00 PM EST',
      title: 'Night of Miracles, Healing & 24/7 Prophetic Fire Altar',
      type: 'Midweek Prayer',
      locationOrStream: 'Cathedral Prayer Chamber & All Campus Live Link',
      speakerOrLeader: 'Apostolic Intercession Council',
      description: 'Deep midnight intercession, casting down every affliction, healing the sick, and releasing breakthrough over nations.',
      isLiveNow: false
    },
    {
      id: 'gcc-sch-5',
      day: 'Saturday',
      time: '6:00 PM EST',
      title: 'Youth Fire & Young Adults Creative Fellowship (Ignite)',
      type: 'Youth Fellowship',
      locationOrStream: 'The Foundry Youth Center (Atlanta Campus)',
      speakerOrLeader: 'Pastor Joshua Williams & Ignite Band',
      description: 'High-energy contemporary praise, relevant panel discussions, creative arts, and spirit-filled community for Gen-Z and Millennials.',
      isLiveNow: false
    }
  ],
  'Elevation Praise Center': [
    {
      id: 'elev-sch-1',
      day: 'Sunday',
      time: '9:30 AM & 11:45 AM EST',
      title: 'Elevation Weekend Worship Experience',
      type: 'Worship Service',
      locationOrStream: 'Ballantyne Campus & Online Broadcast',
      speakerOrLeader: 'Pastor Steven Furtick',
      description: 'Energetic worship led by Elevation Worship and transformative sermon from Steven Furtick.',
      isLiveNow: false
    },
    {
      id: 'elev-sch-2',
      day: 'Wednesday',
      time: '7:30 PM EST',
      title: 'Elevation Midweek Refuel',
      type: 'Bible Study',
      locationOrStream: 'Online Exclusive',
      speakerOrLeader: 'Teaching Team',
      description: 'Midweek spiritual refreshment and worship meditation.',
      isLiveNow: false
    }
  ],
  'Dunamis International Gospel Centre': [
    {
      id: 'dunamis-sch-1',
      day: 'Sunday',
      time: '6:30 AM, 8:00 AM, 9:30 AM, 11:00 AM, 12:30 PM, 2:00 PM',
      title: 'Six Miracle & Healing Sunday Services',
      type: 'Worship Service',
      locationOrStream: 'The Glory Dome (100,000 Capacity Sanctuary), Abuja',
      speakerOrLeader: 'Dr. Pastor Paul & Dr. Becky Enenche',
      description: 'Supernatural power, word exposition, and deliverance at the Glory Dome.',
      isLiveNow: false
    }
  ]
};

export const CHURCH_LOCATIONS: Record<string, ChurchLocation[]> = {
  'Grace City Cathedral': [
    {
      id: 'gcc-camp-atl',
      churchName: 'Grace City Cathedral',
      campusName: 'Main International Sanctuary (Headquarters)',
      isMainCampus: true,
      address: '1200 Cathedral Way NW',
      city: 'Atlanta',
      stateOrRegion: 'Georgia',
      country: 'United States',
      zipCode: '30303',
      leadPastor: 'Senior Pastor David & Pastor Sarah Williams',
      pastorAvatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
      phone: '+1 (404) 555-GRACE',
      email: 'sanctuary@gracecitycathedral.org',
      googleMapsUrl: 'https://maps.google.com/?q=Atlanta+Cathedral+Way',
      serviceTimes: ['Sundays 9:00 AM & 11:30 AM EST', 'Wednesdays 7:00 PM EST', 'Fridays 9:00 PM EST'],
      features: ['5,000 Seat Main Auditorium', 'Kids Kingdom Ministry', 'Café & Bookshop', '24/7 Prayer Room', 'Free Parking Garage', 'Translation Headsets'],
      image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'gcc-camp-lon',
      churchName: 'Grace City Cathedral',
      campusName: 'London City Campus & European Fellowship',
      isMainCampus: false,
      address: '45 Westminster Bridge Rd',
      city: 'London',
      stateOrRegion: 'Greater London',
      country: 'United Kingdom',
      zipCode: 'SE1 7HR',
      leadPastor: 'Pastor Marcus & Julia Sterling',
      pastorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      phone: '+44 20 7946 0192',
      email: 'london@gracecitycathedral.org',
      googleMapsUrl: 'https://maps.google.com/?q=Westminster+Bridge+London',
      serviceTimes: ['Sundays 10:30 AM & 5:00 PM GMT', 'Thursdays 7:00 PM GMT'],
      features: ['Central London Tube Access', 'Youth Hub', 'Fellowship Dinners', 'Communion Altar'],
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'gcc-camp-lag',
      churchName: 'Grace City Cathedral',
      campusName: 'Lagos Island Revival Center',
      isMainCampus: false,
      address: 'Plot 14 Victoria Island Expressway',
      city: 'Lagos',
      stateOrRegion: 'Lagos State',
      country: 'Nigeria',
      leadPastor: 'Pastor Emmanuel & Joy Okafor',
      pastorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      phone: '+234 1 890 2400',
      email: 'lagos@gracecitycathedral.org',
      googleMapsUrl: 'https://maps.google.com/?q=Victoria+Island+Lagos',
      serviceTimes: ['Sundays 7:30 AM, 9:30 AM & 11:30 AM WAT', 'Tuesdays 6:00 PM WAT'],
      features: ['3,500 Seat Auditorium', 'Medical Mission Clinic', 'Faith Youth Academy', '24/7 Power Backup'],
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'gcc-camp-nbo',
      churchName: 'Grace City Cathedral',
      campusName: 'Nairobi City & East Africa Sanctuary',
      isMainCampus: false,
      address: 'Upper Hill Cathedral Road',
      city: 'Nairobi',
      stateOrRegion: 'Nairobi County',
      country: 'Kenya',
      leadPastor: 'Pastor David & Rachel Kimani',
      pastorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      phone: '+254 20 765 4321',
      email: 'nairobi@gracecitycathedral.org',
      googleMapsUrl: 'https://maps.google.com/?q=Upper+Hill+Nairobi',
      serviceTimes: ['Sundays 8:30 AM & 11:00 AM EAT', 'Wednesdays 6:00 PM EAT'],
      features: ['East Africa Broadcast Hub', 'M-Pesa Giving Station', 'Children Sanctuary', 'Outdoor Fellowship Gardens'],
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'gcc-camp-online',
      churchName: 'Grace City Cathedral',
      campusName: 'Global Online Digital Sanctuary',
      isMainCampus: false,
      address: 'Available Worldwide in Every Nation & Timezone',
      city: 'Worldwide',
      stateOrRegion: 'Global',
      country: 'Online',
      leadPastor: 'Pastor Sarah Williams (Digital Pastorate)',
      pastorAvatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
      phone: '+1 (800) 444-PRAY',
      email: 'online@gracecitycathedral.org',
      googleMapsUrl: 'https://gracecitycathedral.org/live',
      serviceTimes: ['24/7 Live Stream Radio', 'Sundays 9:00 AM & 11:30 AM EST Live Interactive Sanctuary'],
      features: ['Live Intercession Chat', 'Virtual Small Groups', 'Digital Membership Certificate', 'Online Giving Portal'],
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80'
    }
  ]
};

export const CHURCH_SOCIALS: Record<string, SocialLink[]> = {
  'Grace City Cathedral': [
    {
      platform: 'youtube',
      label: 'YouTube Live Channel',
      url: 'https://youtube.com/@GraceCityCathedralLive',
      handle: '@GraceCityCathedralLive',
      followers: '1.48M Subscribers',
      isPrimary: true
    },
    {
      platform: 'instagram',
      label: 'Instagram Official',
      url: 'https://instagram.com/gracecitycathedral',
      handle: '@gracecitycathedral',
      followers: '620K Followers'
    },
    {
      platform: 'facebook',
      label: 'Facebook Ministry Page',
      url: 'https://facebook.com/gracecitycathedral',
      handle: 'Grace City Cathedral Global',
      followers: '940K Likes'
    },
    {
      platform: 'spotify',
      label: 'Spotify Worship Music',
      url: 'https://spotify.com/artist/gracecitycathedral',
      handle: 'Grace City Cathedral Choir',
      followers: '380K Monthly Listeners'
    },
    {
      platform: 'applepodcasts',
      label: 'Apple Sermons Podcast',
      url: 'https://podcasts.apple.com/us/podcast/grace-city-sermons',
      handle: 'Grace City Audio Pulpit',
      followers: 'Top 10 Christian Podcasts'
    },
    {
      platform: 'website',
      label: 'Official Ministry Website',
      url: 'https://gracecitycathedral.org',
      handle: 'gracecitycathedral.org',
      isPrimary: true
    }
  ]
};

export const GRACE_CITY_CATHEDRAL_PROFILE: ChurchProfile = {
  name: 'Grace City Cathedral',
  avatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
  coverImage: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1600&q=80',
  location: 'Atlanta, GA (Headquarters) • London • Lagos • Nairobi • Worldwide',
  leadPastor: 'Senior Pastor David & Pastor Sarah Williams',
  pastorTitle: 'Senior Pastors & Apostolic Overseers',
  pastorBio: 'Pastor David & Sarah Williams have spearheaded global apostolic ministry for over 28 years. Known for uncompromised biblical scholarship, profound revelations of the New Covenant, and a passion for raising kingdom disciples worldwide.',
  website: 'https://gracecitycathedral.org',
  phone: '+1 (404) 555-GRACE',
  email: 'connect@gracecitycathedral.org',
  statementOfFaith: [
    'We believe the Bible is the inspired, infallible, and authoritative Word of God.',
    'We believe in one God, eternally existent in three Persons: Father, Son, and Holy Spirit.',
    'We believe in the deity of Jesus Christ, His virgin birth, sinless life, atoning death on the Cross, bodily resurrection, and victorious second coming.',
    'We believe salvation is received by grace through faith in Jesus Christ alone, transforming the believer into a new creation.',
    'We believe in the active ministry and gifts of the Holy Spirit for power, holiness, signs, wonders, and kingdom dominion today.',
    'We believe the Church is the living Body of Christ called to demonstrate love, radical generosity, and gospel power in every nation.'
  ],
  missionStatement: 'To awaken nations to the majesty of Jesus Christ, empower families through the uncompromised Word of Grace, build global sanctuaries of unceasing worship, and extend Christ’s compassion to the least of these.',
  memberCount: 24650,
  followerCount: 1480000,
  isLiveNow: true,
  liveViewersCount: 12480,
  liveStreamTitle: 'Sunday Apostolic Communion & Prophetic Impartation — Live Sanctuary',
  upcomingServiceTitle: 'Sunday Morning Glory Service',
  upcomingServiceTime: 'Sunday — 9:00 AM EST',
  upcomingServiceCountdownIso: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 4 * 3600 * 1000).toISOString(),
  schedules: CHURCH_SCHEDULES['Grace City Cathedral'],
  campuses: CHURCH_LOCATIONS['Grace City Cathedral'],
  socials: CHURCH_SOCIALS['Grace City Cathedral'],
  givingFunds: [
    {
      id: 'fund-tithe',
      name: 'Tithe & Firstfruits Giving',
      description: 'Honoring God with the first ten percent of all our increase for kingdom stewardship and sustenance of the Lord’s house (Malachi 3:10).',
      icon: 'Heart',
      isTaxDeductible: true
    },
    {
      id: 'fund-building',
      name: 'Cathedral Expansion & Sanctuary Building Fund',
      description: 'Expanding our global worship sanctuaries, broadcasting technology infrastructure, and youth family centers.',
      targetAmount: 5000000,
      raisedAmount: 3420000,
      icon: 'Building2',
      isTaxDeductible: true
    },
    {
      id: 'fund-missions',
      name: 'World Missions & Global Benevolence Outreach',
      description: 'Supporting over 65 field missionaries, planting churches in unreached regions, and feeding 40,000+ vulnerable families annually.',
      targetAmount: 1200000,
      raisedAmount: 950000,
      icon: 'Globe',
      isTaxDeductible: true
    },
    {
      id: 'fund-media',
      name: 'Global Satellite & Digital Broadcast Fund',
      description: 'Powering 24/7 internet radio, 4K livestream servers, translation engines, and free distribution of Bibles to seekers.',
      targetAmount: 600000,
      raisedAmount: 480000,
      icon: 'Tv',
      isTaxDeductible: true
    }
  ]
};

export const SUBSCRIPTION_CHANNELS: { name: string; avatar: string; liveNow: boolean }[] = [
  {
    name: 'Grace City Cathedral',
    avatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
    liveNow: true
  },
  {
    name: 'Elevation Praise Center',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    liveNow: false
  },
  {
    name: 'Dunamis International Gospel Centre',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    liveNow: false
  },
  {
    name: 'Sinach Global Ministry',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    liveNow: false
  }
];

export interface RhemaPromise {
  id: string;
  theme: string;
  verse: string;
  scripture: string;
  declaration: string;
  reflection: string;
  badgeTag: string;
}

export const DAILY_RHEMA_PROMISES: RhemaPromise[] = [
  {
    id: 'promise-1',
    theme: 'Supernatural Favor & Protection',
    verse: 'Psalm 5:12',
    scripture: 'For thou, Lord, wilt bless the righteous; with favour wilt thou compass him as with a shield.',
    declaration: 'I declare that the unmerited favor of God surrounds me today like a heavy shield. Every door closed by men is opened by the hand of the Almighty.',
    reflection: 'Step out boldly into your workspace, family, and ministry. Favor is not what you earn, but whose you are.',
    badgeTag: 'Shield of Grace'
  },
  {
    id: 'promise-2',
    theme: 'Overflowing Abundance',
    verse: 'Philippians 4:19',
    scripture: 'But my God shall supply all your need according to his riches in glory by Christ Jesus.',
    declaration: 'My supply does not come from the world economy, but from the infinite storehouse of Heaven through Jesus Christ!',
    reflection: 'Rest in the divine sufficiency of God. No lack shall defeat your purpose.',
    badgeTag: 'Kingdom Provider'
  }
];

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
    tags: ['#GraceShorts', '#PropheticWord', '#Faith']
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
    tags: ['#PraiseWeapon', '#Elevation']
  },
  {
    id: 'short-3',
    title: 'Stand Still: The Battle Belongs To The Lord 🛡️',
    speaker: 'Pastor Sarah Williams',
    church: 'Grace City Cathedral',
    avatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
    likes: '29.4K',
    amensCount: 980,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-lifted-in-a-church-service-41586-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=600&q=80',
    duration: '0:38',
    tags: ['#SpiritualWarfare', '#Victory', '#Covenant']
  },
  {
    id: 'short-4',
    title: '60 Seconds of Anointed Morning Prayer & Declaration 🌅',
    speaker: 'Pastor Marcus Sterling',
    church: 'London City Campus',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    likes: '52.1K',
    amensCount: 2450,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-open-bible-on-a-table-with-sunlight-41587-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80',
    duration: '0:59',
    tags: ['#MorningPrayer', '#DailyRhema', '#Devotion']
  },
  {
    id: 'short-5',
    title: 'Worship Through The Trial: Breakthrough Is Here 🕊️',
    speaker: 'Grace Worship Collective',
    church: 'Grace City Cathedral',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    likes: '41.7K',
    amensCount: 1670,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-choir-singing-in-a-church-41588-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    duration: '0:48',
    tags: ['#WorshipAltar', '#Breakthrough', '#Glory']
  },
  {
    id: 'short-6',
    title: 'The Weapon of Thanksgiving: Break Generational Chains ⛓️',
    speaker: 'Bishop Emmanuel K.',
    church: 'Kingdom Chapel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    likes: '38.4K',
    amensCount: 1530,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-lifted-in-a-church-service-41586-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    duration: '0:50',
    tags: ['#Thanksgiving', '#Deliverance', '#KingdomPower']
  },
  {
    id: 'short-7',
    title: 'God Is Healing What You Thought Was Permanently Broken 🩸',
    speaker: 'Pastor Michael Evans',
    church: 'New Life Church',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    likes: '46.1K',
    amensCount: 2190,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-church-windows-with-sunlight-streaming-through-41584-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    duration: '0:42',
    tags: ['#SupernaturalHealing', '#Restoration', '#NewLife']
  },
  {
    id: 'short-8',
    title: 'Atmospheric Shift: Let Holy Fire Consume Every Fear 🔥',
    speaker: 'Dr. Paul Enenche',
    church: 'Dunamis International',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    likes: '63.8K',
    amensCount: 3100,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-church-interior-with-pews-and-sunlight-41585-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
    duration: '0:55',
    tags: ['#HolyGhostFire', '#ApostolicPower', '#Fearless']
  }
];

export interface FaithBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  xpRequired: number;
  unlocked: boolean;
}

export const FAITH_BADGES: FaithBadge[] = [
  {
    id: 'badge-seed-sower',
    name: 'Kingdom Seed Sower',
    icon: '🌱',
    description: 'Planted first seed in a ministry offering portal',
    xpRequired: 100,
    unlocked: true
  },
  {
    id: 'badge-worshipper',
    name: 'Sanctuary Worshipper',
    icon: '🕊️',
    description: 'Joined 5 live church broadcasts with the saints',
    xpRequired: 300,
    unlocked: true
  },
  {
    id: 'badge-altar-flame',
    name: 'Altar Intercessor',
    icon: '🔥',
    description: 'Prayed with 10 brothers and sisters in the Prayer Wall',
    xpRequired: 600,
    unlocked: true
  }
];

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

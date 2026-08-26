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
}

export const LIVE_VIDEO_STREAMS: VideoStream[] = [
  {
    id: 'v-live-1',
    title: 'Sunday Morning Worship & Word: Walking in Divine Purpose (Live)',
    speakerOrArtist: 'Pastor Mark Anthony & Grace Choir',
    churchOrMinistry: 'Grace City Cathedral',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    subscribersCount: '482K',
    likesCount: '12.4K',
    category: 'Live Worship',
    isLive: true,
    viewersCount: 14280,
    viewsText: '14.2K watching now',
    thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
    description: 'Join thousands live from around the globe for spirit-filled praise, congregational worship, and an empowering message on stepping into your divine calling.',
    bibleVerse: 'Ephesians 2:10 - "For we are God’s handiwork, created in Christ Jesus to do good works."',
    date: 'Started streaming 42 minutes ago'
  },
  {
    id: 'v-2',
    title: 'The Power of Unshakeable Faith in Uncertain Seasons',
    speakerOrArtist: 'Dr. Elizabeth Vance',
    churchOrMinistry: 'Covenant Life Ministries',
    channelAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    subscribersCount: '210K',
    likesCount: '8.9K',
    category: 'Sermon',
    isLive: false,
    viewsText: '184K views',
    duration: '52:14',
    thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80',
    description: 'An insightful exploration into Hebrews 11, discovering how anchor-tested faith overcomes life’s storms.',
    bibleVerse: 'Hebrews 11:1 - "Now faith is confidence in what we hope for and assurance about what we do not see."',
    date: '2 days ago'
  },
  {
    id: 'v-3',
    title: 'Mass Gospel Choir Festival: Victory Praise Symphony 2026',
    speakerOrArtist: 'Kingdom Celebration Vocal Ensemble',
    churchOrMinistry: 'Global Gospel Alliance',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    subscribersCount: '890K',
    likesCount: '34.1K',
    category: 'Choir Special',
    isLive: false,
    viewsText: '420K views',
    duration: '1:18:30',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    description: 'A 100-voice gospel choir performing traditional anthems and contemporary praise solos with live orchestra.',
    date: '1 week ago'
  },
  {
    id: 'v-4',
    title: 'Deep Dive: Understanding the Grace Covenant Verse-by-Verse',
    speakerOrArtist: 'Apostle James Coleman',
    churchOrMinistry: 'Grace & Truth Institute',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    subscribersCount: '150K',
    likesCount: '5.2K',
    category: 'Bible Study',
    isLive: false,
    viewsText: '98K views',
    duration: '44:05',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    description: 'Verse-by-verse study examining Galatians and the transformative freedom found in the New Covenant.',
    bibleVerse: 'Galatians 5:1 - "It is for freedom that Christ has set us free."',
    date: '3 days ago'
  },
  {
    id: 'v-5',
    title: 'Atmosphere of Healing & Miracles Worship Night',
    speakerOrArtist: 'David & Sarah Jenkins Worship Band',
    churchOrMinistry: 'Living Waters Sanctuary',
    channelAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    subscribersCount: '310K',
    likesCount: '19.5K',
    category: 'Gospel Music',
    isLive: false,
    viewsText: '250K views',
    duration: '1:02:15',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    description: 'A night of acoustic praise, prophetic worship, and prayer for families and nations.',
    bibleVerse: 'Psalm 103:2-3 - "Bless the LORD, O my soul, and forget not all His benefits."',
    date: '5 days ago'
  },
  {
    id: 'v-6',
    title: 'Overcoming Spiritual Weariness & Renewing Your Mind',
    speakerOrArtist: 'Bishop Thomas Miller',
    churchOrMinistry: 'Sermons of Hope Ministries',
    channelAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    subscribersCount: '640K',
    likesCount: '28.0K',
    category: 'Sermon',
    isLive: false,
    viewsText: '512K views',
    duration: '38:40',
    thumbnail: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=800&q=80',
    description: 'Biblical keys to finding joy, mental peace, and strength when facing burnout.',
    date: '1 week ago'
  }
];

export const AUDIO_TRACKS: AudioTrack[] = [
  {
    id: 'a-1',
    title: '24/7 Global Gospel Praise & Worship Live Radio Station',
    artistOrPreacher: 'GraceStream Radio Network',
    albumOrSeries: 'Continuous Gospel Broadcast',
    channelAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80',
    category: '24/7 Gospel Radio',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    duration: 'LIVE',
    isLiveRadio: true,
    listenersCount: 8920,
    lyricsOrNotes: 'Streaming continuous spirit-filled praise, contemporary worship, gospel classics, and instrumental prayer music uninterrupted across 84 nations.',
    tags: ['#24/7Gospel', '#LiveRadio', '#WorshipAtmosphere'],
    downloadsCount: '120K Live Tune-ins'
  },
  {
    id: 'a-2',
    title: 'Ep. 42: Faith in the Digital Age & Overcoming Anxiety',
    artistOrPreacher: 'Pastor Mark Anthony & David Lawson',
    albumOrSeries: 'Kingdom Mindset Podcast (Season 3)',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    category: 'Podcast',
    coverUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    duration: '38:15',
    publishedDate: 'Yesterday',
    episodeNumber: 42,
    seasonNumber: 3,
    rating: 4.9,
    downloadsCount: '48.5K Downloads',
    tags: ['#Podcast', '#MentalHealth', '#DigitalFaith'],
    lyricsOrNotes: 'In this powerful episode, Pastor Mark and David break down biblical strategies for safeguarding mental peace in an era of information overload and social media noise.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Opening & Welcome to Kingdom Mindset', scriptureRef: 'Psalm 23:1-3' },
      { time: '04:15', seconds: 255, title: 'Navigating Digital Noise with Godly Wisdom', scriptureRef: 'Romans 12:2' },
      { time: '14:30', seconds: 870, title: 'Scriptural Remedies for Anxiety & Panic', scriptureRef: 'Philippians 4:6-7' },
      { time: '26:00', seconds: 1560, title: 'Practical Daily Sabbath & Unplugging', scriptureRef: 'Exodus 20:8' },
      { time: '34:10', seconds: 2050, title: 'Closing Prophetic Prayer for Listeners', scriptureRef: 'Isaiah 26:3' }
    ],
    sermonOutline: [
      '1. Do not conform to the digital culture; renew your mind through daily scripture.',
      '2. Guard your eye-gate and ear-gate against chronic worry and fear-mongering news.',
      '3. Prayer is not a last resort—it is your first response and heavenly shield.',
      '4. Cultivate quiet sanctuary time without notifications to hear the quiet voice of the Holy Spirit.'
    ],
    scriptureVerses: [
      { reference: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
      { reference: 'Romans 12:2', text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.' }
    ]
  },
  {
    id: 'a-3',
    title: 'Way Maker & Great Are You Lord (Live Worship Medley)',
    artistOrPreacher: 'Grace Sanctuary Choir',
    albumOrSeries: 'Atmosphere of Praise Vol. 4',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    category: 'Praise & Worship',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    duration: '07:45',
    publishedDate: '3 days ago',
    downloadsCount: '89.2K Streams',
    tags: ['#WorshipMedley', '#WayMaker', '#AnointedSinging'],
    lyricsOrNotes: 'You are Way Maker, Miracle Worker, Promise Keeper, Light in the darkness, my God that is who You are. Great are You Lord, all the earth will shout Your praise!',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Soft Piano Prelude & Invocation' },
      { time: '01:30', seconds: 90, title: 'Way Maker Chorus Lead' },
      { time: '04:10', seconds: 250, title: 'Spontaneous Congregational Worship' },
      { time: '06:00', seconds: 360, title: 'Great Are You Lord Outro Crescendo' }
    ],
    sermonOutline: [
      'Focus: Exalting God as the supreme Way Maker in every impossible situation.',
      'Refrain: "Even when I don\'t see it, You\'re working!"'
    ]
  },
  {
    id: 'a-4',
    title: 'Morning Manna: Overcoming Weariness Through Prayer',
    artistOrPreacher: 'Pastor Sarah Jenkins',
    albumOrSeries: 'Daily Gospel Devotionals',
    channelAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    category: 'Devotional',
    coverUrl: 'https://images.unsplash.com/photo-1509021436468-d51039746b20?auto=format&fit=crop&w=800&q=80',
    duration: '14:20',
    publishedDate: 'Today',
    downloadsCount: '22.1K Listens',
    tags: ['#DailyDevotional', '#MorningPrayer', '#Strength'],
    lyricsOrNotes: 'Start your day with 14 minutes of focused scripture, meditation, and a powerful morning blessing for your family and career.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'Morning Scripture Reading', scriptureRef: 'Isaiah 40:29-31' },
      { time: '03:45', seconds: 225, title: 'Devotional Reflection on Waiting on God' },
      { time: '09:10', seconds: 550, title: 'Morning Declaration & Prayer over Day' }
    ],
    scriptureVerses: [
      { reference: 'Isaiah 40:31', text: 'Those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary.' }
    ]
  },
  {
    id: 'a-5',
    title: 'Unlocking Supernatural Breakthrough & Open Heavens',
    artistOrPreacher: 'Dr. Elizabeth Vance',
    albumOrSeries: 'Covenant Power Sermons',
    channelAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    category: 'Audio Sermon',
    coverUrl: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=800&q=80',
    duration: '32:10',
    publishedDate: '1 week ago',
    downloadsCount: '63.4K Streams',
    tags: ['#AudioSermon', '#Breakthrough', '#CovenantKey'],
    lyricsOrNotes: 'Dr. Elizabeth Vance delivers a transformative expository message on how persistent faith and covenant obedience activate open heavens.',
    chapters: [
      { time: '00:00', seconds: 0, title: 'The Principle of Open Heavens', scriptureRef: 'Malachi 3:10' },
      { time: '10:15', seconds: 615, title: 'Overcoming Spiritual Roadblocks & Resistance', scriptureRef: '2 Corinthians 10:4' },
      { time: '22:30', seconds: 1350, title: 'Anointing for Supernatural Prosperity & Favor', scriptureRef: 'Deuteronomy 8:18' }
    ],
    sermonOutline: [
      '1. Faith is not passive expectation; it is active obedience to God\'s revealed word.',
      '2. Align your spoken words with heaven\'s promises to silence demonic doubt.',
      '3. Giving and tithing position your household under perpetual divine protection.'
    ]
  }
];

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

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  { 
    id: 'c1', 
    user: 'Sister Hannah', 
    text: 'Amen! Watching from Lagos, Nigeria! God bless the choir! 🙏', 
    time: '10:42 AM', 
    isPrayer: false, 
    badge: 'Member',
    reactionCount: 14,
    reactions: { amen: 8, fire: 0, heart: 2, pray: 4 },
    userReactions: ['amen']
  },
  { 
    id: 'c2', 
    user: 'Deacon Robert', 
    text: 'Praying for healing and restoration for all families today.', 
    time: '10:43 AM', 
    isPrayer: true, 
    badge: 'Moderator',
    reactionCount: 22,
    reactions: { amen: 2, fire: 0, heart: 5, pray: 15 },
    userReactions: ['pray']
  },
  { 
    id: 'c3', 
    user: 'Grace_Worshipper', 
    text: 'The presence of God is so tangible right in my living room! ✨', 
    time: '10:43 AM', 
    isPrayer: false,
    reactionCount: 9,
    reactions: { amen: 0, fire: 5, heart: 4, pray: 0 },
    userReactions: []
  },
  { 
    id: 'c4', 
    user: 'Brother Caleb', 
    text: 'Hallelujah! What a powerful word from scripture!', 
    time: '10:44 AM', 
    isPrayer: false,
    reactionCount: 18,
    reactions: { amen: 10, fire: 8, heart: 0, pray: 0 },
    userReactions: ['fire']
  },
  { 
    id: 'c5', 
    user: 'Elder Samuel', 
    text: 'Greeting from London! May the Lord strengthen the pastor.', 
    time: '10:45 AM', 
    isPrayer: false, 
    badge: 'VIP',
    reactionCount: 7,
    reactions: { amen: 0, fire: 0, heart: 3, pray: 4 },
    userReactions: []
  }
];

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

export interface ChurchProfile {
  name: string;
  avatar: string;
  location: string;
  leadPastor: string;
  website: string;
  schedules: ServiceScheduleItem[];
  campuses?: ChurchLocation[];
  socials?: SocialLink[];
}

export const CHURCH_LOCATIONS: Record<string, ChurchLocation[]> = {
  'Grace City Cathedral': [
    {
      id: 'loc-gcc-1',
      churchName: 'Grace City Cathedral',
      campusName: 'Main Cathedral Campus',
      isMainCampus: true,
      address: '777 Glory Avenue',
      city: 'Atlanta',
      stateOrRegion: 'GA',
      country: 'United States',
      zipCode: '30303',
      leadPastor: 'Pastor Mark Anthony & Sarah Jenkins',
      pastorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      phone: '+1 (404) 555-7700',
      email: 'main@gracecitycathedral.org',
      googleMapsUrl: 'https://maps.google.com/?q=Atlanta+Cathedral+Praise',
      serviceTimes: ['Sundays: 8:00 AM & 10:30 AM EST', 'Wednesdays: 7:00 PM EST', 'Fridays: 9:00 PM Night Vigil'],
      features: ['2,500-Seat Sanctuary', 'Live HD Broadcast Studio', 'Youth & Children Chapel', 'Free Parking Garage', 'Wheelchair Accessible'],
      image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'loc-gcc-2',
      churchName: 'Grace City Cathedral',
      campusName: 'Downtown City Center Campus',
      address: '240 Peachtree St NW',
      city: 'Atlanta',
      stateOrRegion: 'GA',
      country: 'United States',
      zipCode: '30308',
      leadPastor: 'Pastor David Lawson',
      pastorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
      phone: '+1 (404) 555-7711',
      email: 'downtown@gracecitycathedral.org',
      googleMapsUrl: 'https://maps.google.com/?q=Peachtree+Street+Atlanta',
      serviceTimes: ['Sundays: 11:30 AM EST', 'Thursdays: 12:15 PM Midday Prayer'],
      features: ['Young Professionals Ministry', 'Acoustic Worship Lounge', 'MARTA Metro Accessible', 'Coffee & Fellowship Hub'],
      image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'loc-gcc-3',
      churchName: 'Grace City Cathedral',
      campusName: 'London UK International Campus',
      address: '42 Grace Church Street',
      city: 'London',
      stateOrRegion: 'Greater London',
      country: 'United Kingdom',
      zipCode: 'EC3V 0AT',
      leadPastor: 'Pastor Samuel & Grace Boateng',
      pastorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      phone: '+44 20 7946 0912',
      email: 'london@gracecitycathedral.org',
      googleMapsUrl: 'https://maps.google.com/?q=London+Grace+Church',
      serviceTimes: ['Sundays: 10:00 AM GMT', 'Fridays: 8:00 PM GMT Revival Night'],
      features: ['Multicultural Choir', 'Community Food Bank', 'Translation Headsets Available'],
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'loc-gcc-4',
      churchName: 'Grace City Cathedral',
      campusName: 'iChurch Online Global Campus',
      address: 'Worldwide Broadcast & Meta VR Center',
      city: 'Global Live Feed',
      stateOrRegion: 'Worldwide',
      country: 'International',
      leadPastor: 'Online Ministry Pastors',
      phone: '+1 (800) 555-ICHURCH',
      email: 'ichurch@gracecitycathedral.org',
      googleMapsUrl: 'https://gracetube.tv/live',
      serviceTimes: ['24/7 Continuous Worship & Interactive Prayer Chat', 'Live Sunday Stream: 8:00 AM EST'],
      features: ['Interactive Live Prayer Altar', 'Real-Time Translation in 12 Languages', 'Virtual Small Groups'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
    }
  ],
  'Covenant Life': [
    {
      id: 'loc-clm-1',
      churchName: 'Covenant Life',
      campusName: 'Covenant Global Worship Center',
      isMainCampus: true,
      address: '1200 Victory Way',
      city: 'Dallas',
      stateOrRegion: 'TX',
      country: 'United States',
      zipCode: '75201',
      leadPastor: 'Dr. Elizabeth Vance',
      pastorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      phone: '+1 (214) 555-8800',
      email: 'dallas@covenantlife.org',
      googleMapsUrl: 'https://maps.google.com/?q=Dallas+Covenant+Life',
      serviceTimes: ['Sundays: 9:30 AM EST', 'Tuesdays: 6:30 PM Discipleship'],
      features: ['Bible Training Institute', '3,000 Seats Auditorium', 'Childcare & Nursery', 'Prayer Tower'],
      image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'loc-clm-2',
      churchName: 'Covenant Life',
      campusName: 'Lagos Miracle Revival Center',
      address: '15 Kingdom Way, Victoria Island',
      city: 'Lagos',
      stateOrRegion: 'Lagos State',
      country: 'Nigeria',
      leadPastor: 'Pastor Caleb & Hannah Okafor',
      phone: '+234 1 555 9900',
      email: 'lagos@covenantlife.org',
      googleMapsUrl: 'https://maps.google.com/?q=Lagos+Victoria+Island',
      serviceTimes: ['Sundays: 8:00 AM & 10:30 AM WAT', 'Thursdays: 5:30 PM WAT'],
      features: ['Healing & Deliverance Ministry', 'Youth Empowerment Hub', 'Medical Outreach Clinic'],
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
    }
  ],
  'Global Gospel Alliance': [
    {
      id: 'loc-gga-1',
      churchName: 'Global Gospel Alliance',
      campusName: 'Alliance Kingdom Arena',
      isMainCampus: true,
      address: '500 International Parkway',
      city: 'Chicago',
      stateOrRegion: 'IL',
      country: 'United States',
      zipCode: '60601',
      leadPastor: 'Bishop Thomas Miller',
      pastorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      phone: '+1 (312) 555-9000',
      email: 'info@globalgospelalliance.org',
      googleMapsUrl: 'https://maps.google.com/?q=Chicago+Gospel+Alliance',
      serviceTimes: ['Sundays: 11:00 AM EST', 'Thursdays: 8:00 PM EST Global Prayer'],
      features: ['Mass Choir Rehearsal Hall', 'Apostolic Mission Headquarters', 'State-of-the-Art Sound Stage'],
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
    }
  ],
  'Living Waters Sanctuary': [
    {
      id: 'loc-lws-1',
      churchName: 'Living Waters Sanctuary',
      campusName: 'Living Waters Family Sanctuary',
      isMainCampus: true,
      address: '88 Ocean Boulevard',
      city: 'Miami',
      stateOrRegion: 'FL',
      country: 'United States',
      zipCode: '33101',
      leadPastor: 'Pastor Sarah Jenkins & Daniel Reed',
      pastorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      phone: '+1 (305) 555-3344',
      email: 'miami@livingwaters.org',
      googleMapsUrl: 'https://maps.google.com/?q=Miami+Living+Waters',
      serviceTimes: ['Sundays: 10:00 AM EST', 'Wednesdays: 6:00 PM Youth Fire'],
      features: ['Outdoor Beachside Baptismal', 'Youth Worship Arena', 'Spanish & English Services'],
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
    }
  ]
};

export const CHURCH_SOCIALS: Record<string, SocialLink[]> = {
  'Grace City Cathedral': [
    { platform: 'youtube', label: 'YouTube Live', url: 'https://youtube.com/@GraceCityCathedral', handle: '@GraceCityCathedral', followers: '482K Subscribers', isPrimary: true },
    { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/gracecitycathedral', handle: '@gracecitycathedral', followers: '195K Followers', isPrimary: true },
    { platform: 'facebook', label: 'Facebook Page', url: 'https://facebook.com/gracecitycathedral', handle: 'Grace City Cathedral', followers: '310K Likes', isPrimary: true },
    { platform: 'twitter', label: 'X (Twitter)', url: 'https://x.com/GraceCityChurch', handle: '@GraceCityChurch', followers: '84K Followers' },
    { platform: 'tiktok', label: 'TikTok Praise', url: 'https://tiktok.com/@gracecityworship', handle: '@gracecityworship', followers: '220K Followers' },
    { platform: 'spotify', label: 'Spotify Worship', url: 'https://open.spotify.com/artist/gracecity', handle: 'Grace City Worship', followers: '1.2M Monthly Listeners' },
    { platform: 'applepodcasts', label: 'Apple Podcasts', url: 'https://podcasts.apple.com/us/podcast/grace-city-sermons', handle: 'Grace City Sermons', followers: '4.9 ★ Rating' },
    { platform: 'telegram', label: 'Telegram Prayer Group', url: 'https://t.me/gracecityprayer', handle: 'GraceCityPrayer', followers: '45.2K Intercessors' },
    { platform: 'whatsapp', label: '24/7 WhatsApp Prayer', url: 'https://wa.me/18005557700', handle: '+1 (800) 555-7700', followers: 'Instant Intercession' },
    { platform: 'website', label: 'Official Portal', url: 'https://www.gracecitycathedral.org', handle: 'gracecitycathedral.org', isPrimary: true }
  ],
  'Covenant Life': [
    { platform: 'youtube', label: 'YouTube Channel', url: 'https://youtube.com/@CovenantLifeGlobal', handle: '@CovenantLifeGlobal', followers: '210K Subscribers', isPrimary: true },
    { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/covenantlifevance', handle: '@covenantlifevance', followers: '98K Followers', isPrimary: true },
    { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/covenantlifeglobal', handle: 'Covenant Life Global', followers: '145K Followers' },
    { platform: 'spotify', label: 'Spotify Sermons', url: 'https://open.spotify.com/artist/drelizabethvance', handle: 'Dr. Elizabeth Vance', followers: '450K Streams' },
    { platform: 'telegram', label: 'Telegram Faith Digest', url: 'https://t.me/covenantlifeprayer', handle: 'CovenantLifeDigest', followers: '28.1K Members' },
    { platform: 'whatsapp', label: 'WhatsApp Intercession', url: 'https://wa.me/18005558811', handle: '+1 (800) 555-8811', followers: 'Daily Promises' },
    { platform: 'website', label: 'Official Ministry Site', url: 'https://www.covenantlife.org', handle: 'covenantlife.org', isPrimary: true }
  ],
  'Global Gospel Alliance': [
    { platform: 'youtube', label: 'YouTube Broadcast', url: 'https://youtube.com/@GlobalGospelAlliance', handle: '@GlobalGospelAlliance', followers: '890K Subscribers', isPrimary: true },
    { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/globalgospelalliance', handle: '@globalgospelalliance', followers: '340K Followers', isPrimary: true },
    { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/globalgospelalliance', handle: 'Global Gospel Alliance', followers: '520K Likes' },
    { platform: 'tiktok', label: 'TikTok Gospel Choir', url: 'https://tiktok.com/@globalgospelchoir', handle: '@globalgospelchoir', followers: '410K Followers' },
    { platform: 'telegram', label: 'Global Telegram Network', url: 'https://t.me/globalgospelnetwork', handle: 'GlobalGospelAlliance', followers: '82K Members' },
    { platform: 'whatsapp', label: 'WhatsApp Prayer Hotline', url: 'https://wa.me/18005559922', handle: '+1 (800) 555-9922', followers: 'Global Prayer' },
    { platform: 'website', label: 'Global Alliance Hub', url: 'https://www.globalgospelalliance.org', handle: 'globalgospelalliance.org', isPrimary: true }
  ],
  'Living Waters Sanctuary': [
    { platform: 'youtube', label: 'YouTube Channel', url: 'https://youtube.com/@LivingWatersSanctuary', handle: '@LivingWatersSanctuary', followers: '310K Subscribers', isPrimary: true },
    { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/livingwatersmiami', handle: '@livingwatersmiami', followers: '120K Followers', isPrimary: true },
    { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/livingwatersmiami', handle: 'Living Waters Miami', followers: '180K Likes' },
    { platform: 'spotify', label: 'Spotify Live Worship', url: 'https://open.spotify.com/artist/livingwatersband', handle: 'Living Waters Band', followers: '380K Monthly Listeners' },
    { platform: 'whatsapp', label: 'WhatsApp Prayer Line', url: 'https://wa.me/18005553344', handle: '+1 (800) 555-3344', followers: 'Miami Prayer Hub' },
    { platform: 'website', label: 'Ministry Website', url: 'https://www.livingwaterssanctuary.org', handle: 'livingwaterssanctuary.org', isPrimary: true }
  ]
};

export const CHURCH_SCHEDULES: Record<string, ServiceScheduleItem[]> = {
  'Grace City Cathedral': [
    {
      id: 'sch-gcc-1',
      day: 'Sunday',
      time: '8:00 AM & 10:30 AM EST',
      title: 'Sunday Morning Victory & Celebration Worship Service',
      type: 'Worship Service',
      locationOrStream: 'Main Sanctuary & Gospread HD Live Stream',
      speakerOrLeader: 'Pastor Mark Anthony & Grace Choir',
      description: 'Dynamic praise and congregational worship, communion, and empowering divine truth preaching.',
      isLiveNow: true
    },
    {
      id: 'sch-gcc-2',
      day: 'Wednesday',
      time: '7:00 PM EST',
      title: 'Midweek Word, Healing & Deliverance Service',
      type: 'Midweek Prayer',
      locationOrStream: 'Gospread Interactive Live Stream',
      speakerOrLeader: 'Pastor Mark Anthony & Prayer Team',
      description: 'In-depth scripture study with dedicated intercessory prayer and warfare worship session.',
    },
    {
      id: 'sch-gcc-3',
      day: 'Friday',
      time: '9:00 PM EST',
      title: 'Night of Breakthrough & Prophetic Prayer Vigil',
      type: 'Special Event',
      locationOrStream: 'Cathedral Chapel & Gospread Radio Feed',
      speakerOrLeader: 'Evangelist Sarah Jenkins',
      description: 'Monthly midnight prayer vigil seeking revival, divine direction, and supernatural restoration.',
    }
  ],
  'Covenant Life': [
    {
      id: 'sch-clm-1',
      day: 'Sunday',
      time: '9:30 AM EST',
      title: 'Glorious Faith & Covenant Worship Assembly',
      type: 'Worship Service',
      locationOrStream: 'Covenant Center & Gospread Live',
      speakerOrLeader: 'Dr. Elizabeth Vance',
      description: 'Atmosphere of faith, anointed choir specials, and spirit-led biblical exposition.',
    },
    {
      id: 'sch-clm-2',
      day: 'Tuesday',
      time: '6:30 PM EST',
      title: 'Believers School of Discipleship & Bible Institute',
      type: 'Bible Study',
      locationOrStream: 'Gospread Channel Stream',
      speakerOrLeader: 'Dr. Elizabeth Vance',
      description: 'Verse-by-verse examination of biblical doctrines, kingdom principles, and practical Christian living.',
    }
  ],
  'Global Gospel Alliance': [
    {
      id: 'sch-gga-1',
      day: 'Sunday',
      time: '11:00 AM EST',
      title: 'International Kingdom Worship & Mass Choir Broadcast',
      type: 'Worship Service',
      locationOrStream: 'Global Arena & Worldwide Gospread Feed',
      speakerOrLeader: 'Bishop Thomas Miller & 100-Voice Ensemble',
      description: 'Global broadcast connecting believers worldwide through anthems, worship, and apostolic messages.',
    },
    {
      id: 'sch-gga-2',
      day: 'Thursday',
      time: '8:00 PM EST',
      title: 'Global Prayer Network & Missionary Encounter',
      type: 'Midweek Prayer',
      locationOrStream: 'Gospread Global Network',
      speakerOrLeader: 'Apostle James Coleman',
      description: 'Uniting global partners in prayer for missions, national revival, and church multiplication.',
    }
  ],
  'Living Waters Sanctuary': [
    {
      id: 'sch-lws-1',
      day: 'Sunday',
      time: '10:00 AM EST',
      title: 'Living Waters Family Celebration & Kids Praise',
      type: 'Worship Service',
      locationOrStream: 'Sanctuary Auditorium & Gospread Channel',
      speakerOrLeader: 'Pastor Sarah Jenkins',
      description: 'Family-centered worship experience with vibrant praise, youth ministry features, and sound teaching.',
    },
    {
      id: 'sch-lws-2',
      day: 'Wednesday',
      time: '6:00 PM EST',
      title: 'Youth & Young Adult Elevation Fire Worship',
      type: 'Youth Fellowship',
      locationOrStream: 'Gospread Live Stream',
      speakerOrLeader: 'Pastor Daniel Reed',
      description: 'Contemporary acoustic praise, Q&A on faith in modern culture, and fellowship.',
    }
  ]
};

export const SUBSCRIPTION_CHANNELS = [
  { name: 'Grace City Cathedral', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', liveNow: true },
  { name: 'Covenant Life', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', liveNow: false },
  { name: 'Global Gospel Alliance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', liveNow: false },
  { name: 'Living Waters Sanctuary', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80', liveNow: false },
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
    id: 'rh-1',
    theme: 'Unstoppable Victory',
    verse: 'Romans 8:31',
    scripture: 'What then shall we say to these things? If God is for us, who can be against us?',
    declaration: 'I walk today in supernatural confidence knowing no weapon formed against me shall prosper.',
    reflection: 'No divine promise fails when God steps into your situation. Stand firm and watch God turn your trial into a testimony.',
    badgeTag: 'OVERCOMER'
  },
  {
    id: 'rh-2',
    theme: 'Abundant Peace & Strength',
    verse: 'Isaiah 40:31',
    scripture: 'Those who hope in the LORD will renew their strength. They will soar on wings like eagles.',
    declaration: 'My strength is renewed daily. I fly above earthly anxiety and rest in divine peace.',
    reflection: 'When you feel weary, remember that waiting on God is not passive—it is plugging into infinite divine power.',
    badgeTag: 'RENEWAL'
  },
  {
    id: 'rh-3',
    theme: 'Open Heavens & Provision',
    verse: 'Philippians 4:19',
    scripture: 'And my God will meet all your needs according to the riches of his glory in Christ Jesus.',
    declaration: 'Lack has no authority in my life. The storehouses of heaven are opened over my house today.',
    reflection: 'Trust God as your primary source. His supply is never limited by economic conditions.',
    badgeTag: 'PROSPERITY'
  },
  {
    id: 'rh-4',
    theme: 'Divine Guidance & Light',
    verse: 'Psalm 119:105',
    scripture: 'Your word is a lamp for my feet, a light on my path.',
    declaration: 'I make wise, spirit-guided decisions today. My steps are ordered by the Lord.',
    reflection: 'God rarely gives a 10-year roadmap, but He always gives enough light for your next obedience step.',
    badgeTag: 'WISDOM'
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
    id: 'gs-1',
    title: '⚡ 45 Seconds of Pure Anointed High Praise!',
    speaker: 'Grace City Mass Choir',
    church: 'Grace City Cathedral',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    likes: '24.8K',
    amensCount: 5410,
    videoUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
    duration: '0:45',
    tags: ['#HighPraise', '#WorshipClip', '#SundayFire']
  },
  {
    id: 'gs-2',
    title: '🔥 Declare This Over Your Finances Before You Sleep!',
    speaker: 'Dr. Elizabeth Vance',
    church: 'Covenant Life',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    likes: '41.2K',
    amensCount: 12900,
    videoUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80',
    duration: '0:58',
    tags: ['#PropheticWord', '#FinancialBreakthrough', '#Faith']
  },
  {
    id: 'gs-3',
    title: '🙌 When The Presence Of God Fills The Room Unannounced',
    speaker: 'Bishop Thomas Miller',
    church: 'Global Gospel Alliance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    likes: '18.9K',
    amensCount: 3820,
    videoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    duration: '0:38',
    tags: ['#Revival', '#HolySpirit', '#Shorts']
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
  { id: 'b-1', name: '7-Day Faithful Watcher', icon: '🔥', description: 'Log in and praise for 7 consecutive days', xpRequired: 100, unlocked: true },
  { id: 'b-2', name: 'Amen Warrior', icon: '🙌', description: 'Send over 50 Amen reactions in live streams', xpRequired: 250, unlocked: true },
  { id: 'b-3', name: 'Kingdom Ambassador', icon: '👑', description: 'Reach 500 Praise XP milestone', xpRequired: 500, unlocked: true },
  { id: 'b-4', name: 'Seed Sower', icon: '🌱', description: 'Sow a seed or offer a Super Amen in chat', xpRequired: 1000, unlocked: false },
  { id: 'b-5', name: 'Global Intercessor', icon: '⚡', description: 'Submit 5 prayer requests to the live altar', xpRequired: 1500, unlocked: false },
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



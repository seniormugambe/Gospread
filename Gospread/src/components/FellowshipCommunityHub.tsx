import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Heart,
  Flame,
  Share2,
  Bookmark,
  Send,
  Plus,
  CheckCircle2,
  Church,
  BookOpen,
  Search,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Award,
  Globe,
  Radio,
  Eye,
  X,
  Smile,
  ShieldCheck,
  Check,
  TrendingUp,
  HandHeart,
  HelpCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  Filter,
  Users,
  Clock,
  ArrowUpRight,
  Quote,
  SlidersHorizontal,
  FlameKindling
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserSession } from './AuthModal';

export type PostCategory = 'all' | 'testimony' | 'prayer' | 'reflection' | 'discussion';

export interface CommunityComment {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorRole: string;
  content: string;
  createdAt: string;
  amensCount: number;
  hasAmened?: boolean;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  authorRole: string;
  authorChurch: string;
  category: 'testimony' | 'prayer' | 'reflection' | 'discussion';
  title?: string;
  content: string;
  scriptureReference?: string;
  scriptureText?: string;
  imageUrl?: string;
  audioSnippetDuration?: string;
  audioSnippetTitle?: string;
  createdAt: string;
  amensCount: number;
  prayersCount: number;
  gloryCount: number;
  sharesCount: number;
  comments: CommunityComment[];
  isAnonymous?: boolean;
  hasAmened?: boolean;
  hasPrayed?: boolean;
  hasGlory?: boolean;
  hasBookmarked?: boolean;
  tags: string[];
  recentIntercessors?: string[];
}

const FAITH_STORIES = [];
/*
  {
    id: 'story-1',
    name: 'Sarah J.',
    title: 'Healed of Cancer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    type: 'testimony',
    unread: true,
    tag: 'Miracle'
  },
  {
    id: 'story-2',
    name: 'Pastor David',
    title: 'Midnight Revival',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    type: 'live',
    unread: true,
    tag: 'Live Altar'
  },
  {
    id: 'story-3',
    name: 'Michael A.',
    title: 'Campus Harvest',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    type: 'prayer',
    unread: false,
    tag: '3 Campuses'
  },
  {
    id: 'story-4',
    name: 'Hannah V.',
    title: 'Worship Breakthrough',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    type: 'testimony',
    unread: false,
    tag: 'Praise'
  },
  {
    id: 'story-5',
    name: 'Dr. Elizabeth',
    title: 'Peace in Trial',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    type: 'reflection',
    unread: false,
    tag: 'Phil 4:6'
  },
  {
    id: 'story-6',
    name: 'Emmanuel O.',
    title: 'Romans 8 Challenge',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    type: 'discussion',
    unread: false,
    tag: 'Word Focus'
  }
];

*/
const INITIAL_POSTS: CommunityPost[] = [];
/*
  {
    id: 'post-1',
    authorName: 'Sarah Jenkins',
    authorHandle: 'sarah_j_faith',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    authorRole: 'Global Intercessor',
    authorChurch: 'Grace City Cathedral',
    category: 'testimony',
    title: 'Praise Report: Complete Remission & God’s Miraculous Healing!',
    content: 'After 8 months of intense medical treatment and global prayer from this altar, yesterday my oncologist confirmed: complete remission! No signs of cancer remain. I want to thank every brother and sister who stood in faith with our family during the midnight worship streams. God is still in the miracle-working business today!',
    scriptureReference: 'Psalm 103:2-3',
    scriptureText: '“Bless the Lord, O my soul, and forget not all His benefits: Who forgives all your iniquities, Who heals all your diseases...”',
    imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80',
    audioSnippetDuration: '1:18',
    audioSnippetTitle: 'Sarah’s Personal Audio Praise Testimony',
    createdAt: '25m ago',
    amensCount: 342,
    prayersCount: 189,
    gloryCount: 278,
    sharesCount: 45,
    tags: ['#HealingTestimony', '#MiraclesToday', '#PraiseGod', '#GraceCity'],
    recentIntercessors: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80',
    ],
    comments: [
      {
        id: 'c-1',
        authorName: 'Pastor David Wilson',
        authorHandle: 'pastor_david',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        authorRole: 'Senior Pastor',
        content: 'Glory to God in the highest! We rejoiced together on the live broadcast when your family first posted the request. May His name be forever praised!',
        createdAt: '18m ago',
        amensCount: 48,
      },
      {
        id: 'c-2',
        authorName: 'Hannah Vance',
        authorHandle: 'hannah_v',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        authorRole: 'Worship Leader',
        content: 'Tears of joy reading this! God is so faithful. What He started in you He has perfected! 🙌🔥',
        createdAt: '10m ago',
        amensCount: 22,
      }
    ]
  },
  {
    id: 'post-2',
    authorName: 'Michael Adewale',
    authorHandle: 'mike_adewale',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    authorRole: 'Youth & Campus Minister',
    authorChurch: 'Redeemed Christian Fellowship',
    category: 'prayer',
    title: 'Prayer Altar: Upcoming 3-Day University Campus Revival',
    content: 'Brothers and sisters, we are launching an outdoor gospel revival across 3 campuses this Friday. Please join us in prayer for bold preaching of the Cross, conviction of hearts, and freedom from addictions for hundreds of students seeking purpose. We are believing for a genuine harvest!',
    scriptureReference: 'Acts 4:29-30',
    scriptureText: '“Now, Lord, look on their threats, and grant to Your servants that with all boldness they may speak Your word, by stretching out Your hand to heal...”',
    createdAt: '1h ago',
    amensCount: 198,
    prayersCount: 412,
    gloryCount: 86,
    sharesCount: 32,
    tags: ['#CampusRevival', '#YouthMinistry', '#Intercession', '#Salvation'],
    recentIntercessors: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80',
    ],
    comments: [
      {
        id: 'c-3',
        authorName: 'Ruth Mwangi',
        authorHandle: 'ruth_mwangi',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
        authorRole: 'Intercessor',
        content: 'Standing in agreement from Nairobi! Praying for an outpouring of the Holy Spirit upon every student listener.',
        createdAt: '42m ago',
        amensCount: 16,
      }
    ]
  },
  {
    id: 'post-3',
    authorName: 'Dr. Elizabeth Taylor',
    authorHandle: 'dr_elizabeth_t',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    authorRole: 'Bible Teacher & Author',
    authorChurch: 'Elevation Worship Hub',
    category: 'reflection',
    title: 'The Peace That Transcends Understanding: A Midnight Meditation',
    content: 'When Paul wrote Philippians 4 from a prison cell, he didn’t say “don’t worry because your circumstances are comfortable.” He said “The Lord is near.” The antidote to anxiety is not control over tomorrow; it is intimate awareness of the Lord’s presence in this very moment. Whatever storms you face today, breathe in His sovereign peace.',
    scriptureReference: 'Philippians 4:6-7',
    scriptureText: '“Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God; and the peace of God... will guard your hearts.”',
    imageUrl: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
    createdAt: '3h ago',
    amensCount: 520,
    prayersCount: 140,
    gloryCount: 310,
    sharesCount: 89,
    tags: ['#SermonReflection', '#OvercomingAnxiety', '#PeaceOfGod', '#DailyWord'],
    comments: []
  },
  {
    id: 'post-4',
    authorName: 'Emmanuel Osei',
    authorHandle: 'emmanuel_osei',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    authorRole: 'Worship Psalmist',
    authorChurch: 'Bethel Gospel Sanctuary',
    category: 'discussion',
    title: 'Discussion: How has daily Scripture memorization transformed your thought life?',
    content: 'We’ve been doing the 30-day Romans 8 challenge in our young adult fellowship. I’m curious to hear from the global community: what spiritual disciplines or specific scriptures have helped you overcome negative self-talk and fear this year?',
    scriptureReference: 'Romans 12:2',
    scriptureText: '“And do not be conformed to this world, but be transformed by the renewing of your mind, that you may prove what is that good and acceptable and perfect will of God.”',
    createdAt: '5h ago',
    amensCount: 145,
    prayersCount: 38,
    gloryCount: 92,
    sharesCount: 14,
    tags: ['#BiblicalDiscipline', '#RenewingTheMind', '#FaithDiscussion', '#Fellowship'],
    comments: [
      {
        id: 'c-4',
        authorName: 'James Carter',
        authorHandle: 'james_carter',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        authorRole: 'Believer',
        content: 'Writing verses on 3x5 cards and reviewing them before touching my phone in the morning completely changed my anxiety levels!',
        createdAt: '4h ago',
        amensCount: 29,
      }
    ]
  }
];

*/
const POPULAR_SCRIPTURE_SUGGESTIONS = [
  { ref: 'Psalm 23:1', text: '“The Lord is my shepherd; I shall not want.”' },
  { ref: 'Psalm 91:1-2', text: '“He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty.”' },
  { ref: 'Psalm 103:2-3', text: '“Bless the Lord, O my soul, and forget not all His benefits: Who forgives all your iniquities, Who heals all your diseases...”' },
  { ref: 'Isaiah 40:31', text: '“Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles.”' },
  { ref: 'Jeremiah 29:11', text: '“For I know the thoughts that I think toward you, says the Lord, thoughts of peace and not of evil, to give you a future and a hope.”' },
  { ref: 'Philippians 4:6-7', text: '“Be anxious for nothing, but in everything by prayer and supplication, with thanksgiving, let your requests be made known to God...”' },
  { ref: 'Romans 8:28', text: '“And we know that all things work together for good to those who love God, to those who are the called according to His purpose.”' },
  { ref: 'Matthew 18:19', text: '“Again I say to you that if two of you agree on earth concerning anything that they ask, it will be done for them by My Father in heaven.”' }
];

const POPULAR_PRAYER_TOPICS = [
  { tag: '#HealingMiracles', count: '1.4k prayers', isHot: true },
  { tag: '#CampusRevival', count: '920 prayers', isHot: true },
  { tag: '#FamilyRestoration', count: '840 prayers', isHot: false },
  { tag: '#FinancialBreakthrough', count: '670 prayers', isHot: false },
  { tag: '#MissionsAndOutreach', count: '510 prayers', isHot: false },
];

const FAITH_HEROES = [
  { name: 'Sarah Jenkins', handle: '@sarah_j_faith', prayersSent: 142, streak: '24d', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80', badge: '🥇 1st' },
  { name: 'Michael Adewale', handle: '@mike_adewale', prayersSent: 118, streak: '19d', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80', badge: '🥈 2nd' },
  { name: 'Hannah Vance', handle: '@hannah_v', prayersSent: 96, streak: '15d', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', badge: '🥉 3rd' },
];

interface FellowshipCommunityHubProps {
  userSession: UserSession;
  streakDays: number;
  praiseXp: number;
  onAwardXp?: (amount: number, reason: string) => void;
  onOpenGiving?: () => void;
}

export const FellowshipCommunityHub: React.FC<FellowshipCommunityHubProps> = ({
  userSession,
  streakDays,
  praiseXp,
  onAwardXp,
  onOpenGiving,
}) => {
  // Posts state
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem('gospread_community_posts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [activeCategory, setActiveCategory] = useState<PostCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'prayers'>('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [prayerNotification, setPrayerNotification] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [activeStorySpotlight, setActiveStorySpotlight] = useState<string | null>(null);

  // New Post Form State
  const [postCategory, setPostCategory] = useState<'testimony' | 'prayer' | 'reflection' | 'discussion'>('testimony');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postScripture, setPostScripture] = useState('');
  const [postScriptureText, setPostScriptureText] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [postTags, setPostTags] = useState('');
  const [activeComposerTab, setActiveComposerTab] = useState<'write' | 'preview'>('write');

  // Persist posts
  useEffect(() => {
    try {
      localStorage.setItem('gospread_community_posts', JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts]);

  // Handle Amen Reaction
  const handleToggleAmen = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasAmened = !p.hasAmened;
        if (hasAmened && onAwardXp) onAwardXp(5, 'Amen encouragement given');
        return {
          ...p,
          hasAmened,
          amensCount: hasAmened ? p.amensCount + 1 : Math.max(0, p.amensCount - 1),
        };
      }
      return p;
    }));
  };

  // Handle "I Prayed for You" Reaction
  const handleTogglePrayed = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasPrayed = !p.hasPrayed;
        if (hasPrayed) {
          if (onAwardXp) onAwardXp(15, 'Intercessory prayer offered');
          setPrayerNotification(`You stood in faith for ${p.isAnonymous ? 'a brother/sister' : p.authorName}! 🙏 (+15 XP)`);
          setTimeout(() => setPrayerNotification(null), 3500);
        }
        return {
          ...p,
          hasPrayed,
          prayersCount: hasPrayed ? p.prayersCount + 1 : Math.max(0, p.prayersCount - 1),
        };
      }
      return p;
    }));
  };

  // Handle Glory to God Reaction
  const handleToggleGlory = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasGlory = !p.hasGlory;
        return {
          ...p,
          hasGlory,
          gloryCount: hasGlory ? p.gloryCount + 1 : Math.max(0, p.gloryCount - 1),
        };
      }
      return p;
    }));
  };

  // Handle Bookmark
  const handleToggleBookmark = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextState = !p.hasBookmarked;
        if (nextState) {
          setPrayerNotification("Saved to your Spiritual Journal 📖");
          setTimeout(() => setPrayerNotification(null), 2500);
        }
        return { ...p, hasBookmarked: nextState };
      }
      return p;
    }));
  };

  // Submit Comment
  const handleAddComment = (postId: string, quickText?: string) => {
    const text = quickText || replyText[postId];
    if (!text || !text.trim()) return;

    const newComment: CommunityComment = {
      id: `c-${Date.now()}`,
      authorName: userSession.fullName || 'Believer',
      authorHandle: userSession.username || 'believer',
      authorAvatar: userSession.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      authorRole: 'Verified Believer',
      content: text.trim(),
      createdAt: 'Just now',
      amensCount: 0,
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [newComment, ...p.comments],
        };
      }
      return p;
    }));

    setReplyText(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));
    if (onAwardXp) onAwardXp(10, 'Fellowship encouragement posted');
  };

  // Create Post Submit
  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: isAnonymous ? 'Kingdom Intercessor' : (userSession.fullName || 'David Lawson'),
      authorHandle: isAnonymous ? 'anonymous_believer' : (userSession.username || 'david_lawson'),
      authorAvatar: isAnonymous
        ? 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=120&q=80'
        : (userSession.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'),
      authorRole: isAnonymous ? 'Anonymous Altar Member' : 'Verified Believer',
      authorChurch: userSession.churchName || 'Grace City Cathedral',
      category: postCategory,
      title: postTitle.trim() || undefined,
      content: postContent.trim(),
      scriptureReference: postScripture.trim() || undefined,
      scriptureText: postScriptureText.trim() || undefined,
      imageUrl: postImageUrl.trim() || undefined,
      createdAt: 'Just now',
      amensCount: 1,
      prayersCount: postCategory === 'prayer' ? 1 : 0,
      gloryCount: 1,
      sharesCount: 0,
      isAnonymous,
      tags: postTags
        ? postTags.split(' ').map(t => t.startsWith('#') ? t : `#${t}`).filter(Boolean)
        : [`#${postCategory === 'testimony' ? 'PraiseReport' : postCategory === 'prayer' ? 'PrayerAltar' : 'KingdomLiving'}`],
      comments: [],
    };

    setPosts(prev => [newPost, ...prev]);
    setShowCreateModal(false);
    
    // Reset Form
    setPostTitle('');
    setPostContent('');
    setPostScripture('');
    setPostScriptureText('');
    setPostImageUrl('');
    setIsAnonymous(false);
    setPostTags('');
    setActiveComposerTab('write');

    if (onAwardXp) onAwardXp(30, 'New testimony / prayer published');
  };

  // Copy Post Link
  const handleCopyLink = (postId: string) => {
    try {
      navigator.clipboard?.writeText?.(window.location.href);
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered & Sorted Posts
  const filteredPosts = posts
    .filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = !searchQuery.trim() || 
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.scriptureReference && p.scriptureReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.amensCount + b.gloryCount) - (a.amensCount + a.gloryCount);
      if (sortBy === 'prayers') return b.prayersCount - a.prayersCount;
      return 0; // Default order
    });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-6 text-slate-100">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {prayerNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2.5 border border-amber-300 ring-4 ring-amber-500/20"
          >
            <Flame className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>{prayerNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🌟 1. STORIES & PRAISE CIRCLES SPOTLIGHT CAROUSEL */}
      <div className="rounded-3xl bg-slate-900/60 p-4 sm:p-5 border border-white/[0.08] backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Praise Circles & Daily Faith Spotlight
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Global voices standing in agreement
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none pt-1">
          {/* Add story action pill */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex flex-col items-center justify-center gap-1.5 shrink-0 group focus:outline-none"
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-800 border-2 border-dashed border-amber-500/50 group-hover:border-amber-400 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <Plus className="w-6 h-6 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <span className="text-[11px] font-bold text-amber-300 group-hover:text-amber-200">Share Story</span>
          </button>

          {/* Stories List */}
          {FAITH_STORIES.map(story => (
            <button
              key={story.id}
              onClick={() => {
                setActiveStorySpotlight(story.id);
                if (story.type === 'testimony') setActiveCategory('testimony');
                else if (story.type === 'prayer') setActiveCategory('prayer');
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            >
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-amber-300 shadow-md group-hover:scale-105 transition duration-300">
                <div className="p-0.5 rounded-full bg-[#121316]">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-13 h-13 sm:w-15 sm:h-15 rounded-full object-cover"
                  />
                </div>
                {story.type === 'live' && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-red-600 text-white text-[8px] font-black rounded-full uppercase tracking-tighter ring-2 ring-slate-900 animate-pulse">
                    Live
                  </span>
                )}
                {story.type === 'testimony' && (
                  <span className="absolute -bottom-1 -right-0.5 w-4.5 h-4.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-900">
                    🙌
                  </span>
                )}
              </div>
              <div className="text-center max-w-[72px]">
                <div className="text-[11px] font-bold text-slate-200 truncate group-hover:text-amber-300 transition">
                  {story.name}
                </div>
                <div className="text-[9px] text-slate-400 truncate">{story.tag}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 2. HERO COMMUNITY HEADER & LIVE METRICS STRIP */}
      <div className="relative rounded-3xl overflow-hidden border border-white/[0.09] bg-gradient-to-br from-[#14151b] via-[#1a1b24] to-[#121318] p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                <Globe className="w-3.5 h-3.5 text-amber-400" /> Global Fellowship & Altar
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 2,419 Intercessors Online
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Testimonies of Grace & Global Voices
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Proclaim what the Lord has done, post petitions on the 24/7 intercessory prayer wall, and stand in spiritual agreement with believers across 84 nations.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 transition active:scale-95 duration-200"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Share Testimony / Prayer</span>
            </button>
          </div>
        </div>

        {/* Global Altar Real-Time Metrics Strip */}
        <div className="mt-6 pt-5 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prayers Sown Today</div>
              <div className="text-base sm:text-lg font-black text-white font-mono">14,820+</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Answered Miracles</div>
              <div className="text-base sm:text-lg font-black text-white font-mono">3,124</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400 shrink-0">
              <Heart className="w-5 h-5 fill-pink-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Amens & Praises</div>
              <div className="text-base sm:text-lg font-black text-white font-mono">89.4k</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/[0.06] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-300 shrink-0">
              <Church className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Connected Churches</div>
              <div className="text-base sm:text-lg font-black text-white font-mono">120+ Sanctuaries</div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 3. NAVIGATION TABS, SORTING & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/70 p-2.5 rounded-2xl border border-white/[0.08] backdrop-blur-md">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Voices', icon: Globe },
            { id: 'testimony', label: '🙌 Testimonies', badge: 'MIRACLES' },
            { id: 'prayer', label: '🙏 Prayer Wall', badge: 'ALTAR' },
            { id: 'reflection', label: '📖 Sermon Word' },
            { id: 'discussion', label: '💬 Discussions' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as PostCategory)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${
                    isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search testimonies, scriptures, #tags..."
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950/90 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
          >
            <option value="recent">⏱️ Newest First</option>
            <option value="popular">🔥 Most Amens</option>
            <option value="prayers">🙏 Most Prayers</option>
          </select>
        </div>
      </div>

      {/* 🏛️ 4. MAIN 2-COLUMN COMMUNITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT / CENTER: POST FEED (2 Cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Quick Inline Composer Trigger */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-xl shadow-lg flex items-center gap-3">
            <img
              src={userSession.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"}
              alt={userSession.fullName}
              className="w-10 h-10 rounded-2xl object-cover ring-2 ring-amber-400 shrink-0"
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-left text-xs text-slate-400 flex items-center justify-between transition group"
            >
              <span>Share a testimony, prayer request, or scripture revelation...</span>
              <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
            </button>
          </div>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-900/40 rounded-3xl border border-white/[0.06] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No community posts found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Be the first to share a praise report or prayer request in this category!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Create New Post
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const isCommentsOpen = expandedComments[post.id];
              const isAudioPlaying = playingAudioId === post.id;

              return (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl bg-slate-900/70 border border-white/[0.08] hover:border-amber-500/30 transition-all duration-300 shadow-xl overflow-hidden backdrop-blur-xl"
                >
                  {/* Post Header */}
                  <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-11 h-11 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-md"
                        />
                        {post.category === 'testimony' && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">
                            🙌
                          </span>
                        )}
                        {post.category === 'prayer' && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-slate-900 flex items-center justify-center text-[10px]">
                            🙏
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white">{post.authorName}</h4>
                          <span className="text-[11px] text-amber-400 font-mono">@{post.authorHandle}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                            {post.authorRole}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1 text-slate-300">
                            <Church className="w-3 h-3 text-amber-400" /> {post.authorChurch}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" /> {post.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="shrink-0">
                      {post.category === 'testimony' && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider shadow-sm">
                          Praise Report 🙌
                        </span>
                      )}
                      {post.category === 'prayer' && (
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider shadow-sm">
                          Prayer Altar 🙏
                        </span>
                      )}
                      {post.category === 'reflection' && (
                        <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider shadow-sm">
                          Sermon Word 📖
                        </span>
                      )}
                      {post.category === 'discussion' && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider shadow-sm">
                          Discussion 💬
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Post Content Body */}
                  <div className="px-4 sm:px-5 space-y-3.5">
                    {post.title && (
                      <h3 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight">
                        {post.title}
                      </h3>
                    )}

                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* 📖 Illuminated Scripture Card */}
                    {post.scriptureReference && (
                      <div className="relative p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-2 overflow-hidden shadow-inner">
                        <Quote className="w-8 h-8 text-amber-500/15 absolute right-3 bottom-2 pointer-events-none" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                            <BookOpen className="w-4 h-4 text-amber-400" />
                            <span>{post.scriptureReference}</span>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText?.(`${post.scriptureReference}: ${post.scriptureText || ''}`);
                              setPrayerNotification(`Copied ${post.scriptureReference} to clipboard 📋`);
                              setTimeout(() => setPrayerNotification(null), 2500);
                            }}
                            className="text-[10px] text-amber-300/80 hover:text-amber-200 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20"
                            title="Copy scripture"
                          >
                            <Copy className="w-3 h-3" /> Copy Verse
                          </button>
                        </div>
                        {post.scriptureText && (
                          <p className="text-xs sm:text-sm text-amber-100 font-serif italic leading-relaxed">
                            {post.scriptureText}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 🎙️ Voice Testimony Audio Player Snippet */}
                    {post.audioSnippetTitle && (
                      <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setPlayingAudioId(isAudioPlaying ? null : post.id)}
                            className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold hover:bg-amber-400 transition shrink-0"
                          >
                            {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                          </button>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>{post.audioSnippetTitle}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">Audio Testimony • {post.audioSnippetDuration}</div>
                          </div>
                        </div>

                        {/* Animated waveform visualizer */}
                        <div className="flex items-center gap-1 h-5">
                          {[40, 70, 90, 60, 100, 50, 80, 60, 90, 40].map((h, i) => (
                            <span
                              key={i}
                              style={{ height: isAudioPlaying ? `${h}%` : '30%' }}
                              className={`w-1 rounded-full transition-all duration-200 ${
                                isAudioPlaying ? 'bg-amber-400' : 'bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Optional High-Resolution Image */}
                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-80 bg-slate-950 shadow-md">
                        <img
                          src={post.imageUrl}
                          alt="Post Media"
                          className="w-full h-full object-cover hover:scale-105 transition duration-500"
                        />
                      </div>
                    )}

                    {/* Recent Intercessors Avatar Stack */}
                    {post.category === 'prayer' && post.recentIntercessors && post.recentIntercessors.length > 0 && (
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {post.recentIntercessors.map((avatar, idx) => (
                              <img
                                key={idx}
                                src={avatar}
                                alt="Intercessor"
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover"
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-300 font-medium">
                            <strong className="text-amber-400">{post.prayersCount} believers</strong> standing in agreement
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {post.tags.map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSearchQuery(tag)}
                            className="text-[11px] font-medium text-amber-400/90 hover:text-amber-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 hover:border-amber-500/40 transition"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reaction Action Bar */}
                  <div className="mt-4 px-4 sm:px-5 py-3 border-t border-white/[0.08] bg-slate-950/50 flex items-center justify-between gap-2 flex-wrap text-xs">
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      
                      {/* Amen Button */}
                      <button
                        onClick={() => handleToggleAmen(post.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition active:scale-95 ${
                          post.hasAmened
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800'
                        }`}
                        title="Agree in faith (Amen)"
                      >
                        <span className="text-sm">🙌</span>
                        <span>Amen</span>
                        <span className="text-[11px] font-mono opacity-90">({post.amensCount})</span>
                      </button>

                      {/* "I Prayed for You" Intercessory Button */}
                      <button
                        onClick={() => handleTogglePrayed(post.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition active:scale-95 ${
                          post.hasPrayed
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-blue-400 border border-slate-800'
                        }`}
                        title="I prayed for this request right now"
                      >
                        <span className="text-sm">🙏</span>
                        <span>{post.hasPrayed ? 'Prayed' : 'I Prayed'}</span>
                        <span className="text-[11px] font-mono opacity-90">({post.prayersCount})</span>
                      </button>

                      {/* Glory to God Button */}
                      <button
                        onClick={() => handleToggleGlory(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition active:scale-95 ${
                          post.hasGlory
                            ? 'bg-pink-500 text-white shadow-md shadow-pink-500/25'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-pink-400 border border-slate-800'
                        }`}
                        title="Glory to God"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-mono">{post.gloryCount}</span>
                      </button>

                      {/* Comments Toggle Button */}
                      <button
                        onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>Replies</span>
                        <span className="text-[11px] font-mono opacity-90">({post.comments.length})</span>
                      </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleBookmark(post.id)}
                        className={`p-2 rounded-xl transition ${
                          post.hasBookmarked
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                        title="Save to Spiritual Journal"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleCopyLink(post.id)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
                        title="Share Testimony"
                      >
                        {copiedPostId === post.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Comments Section */}
                  <AnimatePresence>
                    {isCommentsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 sm:px-5 py-4 border-t border-white/[0.08] bg-slate-950/80 space-y-4"
                      >
                        {/* Quick Encouragement Chips */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Quick word:</span>
                          {[
                            'Amen! Standing with you 🙌',
                            'Glory to God! 🔥',
                            'Praying right now 🙏',
                            'God is faithful! ❤️',
                            'By His stripes! 🕊️'
                          ].map((chip, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleAddComment(post.id, chip)}
                              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 transition font-medium"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>

                        {/* Reply Input Form */}
                        <div className="flex items-center gap-2">
                          <img
                            src={userSession.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"}
                            alt={userSession.fullName}
                            className="w-8 h-8 rounded-xl object-cover ring-1 ring-amber-400 shrink-0"
                          />
                          <input
                            type="text"
                            value={replyText[post.id] || ''}
                            onChange={(e) => setReplyText({ ...replyText, [post.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(post.id);
                              }
                            }}
                            placeholder="Write an encouraging reply or prayer word..."
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 placeholder:text-slate-500 transition"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-sm"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Comments List */}
                        {post.comments.length > 0 && (
                          <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                            {post.comments.map((comment) => (
                              <div key={comment.id} className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={comment.authorAvatar}
                                      alt={comment.authorName}
                                      className="w-6 h-6 rounded-lg object-cover"
                                    />
                                    <span className="text-xs font-bold text-white">{comment.authorName}</span>
                                    <span className="text-[10px] text-amber-400/90 font-mono">@{comment.authorHandle}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500">{comment.createdAt}</span>
                                </div>
                                <p className="text-xs text-slate-300 pl-8 leading-relaxed">{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>

        {/* RIGHT SIDEBAR: COMMUNITY ALTAR WIDGETS */}
        <div className="space-y-5">
          
          {/* 1. MY DISCIPLESHIP WITNESS CARD */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/[0.08] shadow-xl space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> My Kingdom Witness
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={userSession.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"}
                alt={userSession.fullName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{userSession.fullName}</h4>
                <p className="text-xs text-amber-400 font-mono">@{userSession.username}</p>
                <p className="text-[11px] text-slate-400">{userSession.churchName || 'Grace City Cathedral'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-xs font-black text-amber-400 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400" /> {streakDays} Days
                </div>
                <div className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">Grace Streak</div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-xs font-black text-amber-300 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" /> {praiseXp} XP
                </div>
                <div className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">Praise Power</div>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Share My Testimony (+30 XP)</span>
            </button>
          </div>

          {/* 2. 24/7 SILENT PRAYER WATCH ROOM */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900/90 to-blue-950/40 border border-blue-500/20 shadow-xl space-y-3.5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-4 h-4 animate-pulse text-blue-400" /> Live Agreement Altar
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                24/7 STREAM
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Join 418 believers currently in silent prayer agreement for global missionaries, family healing, and campus outpourings.
            </p>

            <button
              onClick={() => {
                if (onAwardXp) onAwardXp(10, 'Joined 24/7 Silent Agreement Altar');
                setPrayerNotification('Connected to 24/7 Global Agreement Altar 🙏');
                setTimeout(() => setPrayerNotification(null), 3000);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <FlameKindling className="w-4 h-4" />
              <span>Enter Agreement Room (+10 XP)</span>
            </button>
          </div>

          {/* 3. TRENDING ALTAR TOPICS */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/[0.08] shadow-xl space-y-3 backdrop-blur-xl">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" /> Trending Altar Focuses
            </h4>
            
            <div className="space-y-2">
              {POPULAR_PRAYER_TOPICS.map((topic, i) => (
                <div
                  key={i}
                  onClick={() => setSearchQuery(topic.tag)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 group-hover:text-amber-300 transition">
                      {topic.tag}
                    </span>
                    {topic.isHot && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded-md font-bold">
                        HOT
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {topic.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. FAITHFUL ENCOURAGERS LEADERBOARD */}
          <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/[0.08] shadow-xl space-y-3.5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Faithful Intercessors
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">This Week</span>
            </div>

            <div className="space-y-2.5">
              {FAITH_HEROES.map((hero, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-amber-400">{hero.badge}</span>
                    <img src={hero.avatar} alt={hero.name} className="w-8 h-8 rounded-xl object-cover ring-1 ring-amber-400" />
                    <div>
                      <h5 className="text-xs font-bold text-white">{hero.name}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">{hero.handle}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <span>🙏 {hero.prayersSent}</span>
                    </div>
                    <span className="text-[9px] text-slate-400">{hero.streak} streak</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. KINGDOM GIVING MINI BANNER */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-[#141417] border border-amber-500/30 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <HandHeart className="w-4 h-4" />
              <span>Sow into Global Missions</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Support audio & video gospel transmission reaching unreached remote regions and hospital ministries.
            </p>
            {onOpenGiving && (
              <button
                onClick={onOpenGiving}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Tithe & Seed Offering
              </button>
            )}
          </div>

        </div>

      </div>

      {/* 📝 5. MODERN REDESIGNED CREATE POST MODAL WITH SCRIPTURE FINDER & LIVE PREVIEW */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-[#121318] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Create Kingdom Post</h3>
                    <p className="text-xs text-slate-400">Share your praise report, prayer burden, or scripture reflection</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveComposerTab('write')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        activeComposerTab === 'write' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Compose
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveComposerTab('preview')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        activeComposerTab === 'preview' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Preview
                    </button>
                  </div>

                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCreatePostSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                
                {activeComposerTab === 'write' ? (
                  <>
                    {/* Select Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2">
                        Classification
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'testimony', label: '🙌 Praise Report', desc: 'Answered prayer' },
                          { id: 'prayer', label: '🙏 Prayer Altar', desc: 'Seek agreement' },
                          { id: 'reflection', label: '📖 Sermon Word', desc: 'Bible insight' },
                          { id: 'discussion', label: '💬 Discussion', desc: 'Faith dialogue' },
                        ].map(type => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setPostCategory(type.id as any)}
                            className={`p-3 rounded-2xl border text-left transition ${
                              postCategory === type.id
                                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-2 ring-amber-400/20'
                                : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="text-xs font-black">{type.label}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{type.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Headline / Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="e.g. Healed from 5-Year Asthma, or Prayer for Campus Mission"
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>

                    {/* Main Content */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Testimony or Prayer Burden Details *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Write what God has done or share your petition for global believers to stand in faith with you..."
                        className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-amber-400 transition"
                      />
                    </div>

                    {/* Scripture Reference Helper Chips */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-300">
                          Scripture Quick-Picker
                        </label>
                        <span className="text-[10px] text-amber-400 font-bold">Tap to auto-insert</span>
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                        {POPULAR_SCRIPTURE_SUGGESTIONS.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setPostScripture(item.ref);
                              setPostScriptureText(item.text);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 border border-slate-800 text-[10px] text-amber-300 whitespace-nowrap font-medium transition"
                          >
                            {item.ref}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scripture Reference and Tags */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Scripture Citation
                        </label>
                        <input
                          type="text"
                          value={postScripture}
                          onChange={(e) => setPostScripture(e.target.value)}
                          placeholder="e.g. Psalm 103:2-3 or Isaiah 40:31"
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Tags (#miracles #healing)
                        </label>
                        <input
                          type="text"
                          value={postTags}
                          onChange={(e) => setPostTags(e.target.value)}
                          placeholder="#miracles #faith #praise"
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                    </div>

                    {/* Scripture Quote Body */}
                    {postScripture && (
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          Scripture Text Quote
                        </label>
                        <textarea
                          rows={2}
                          value={postScriptureText}
                          onChange={(e) => setPostScriptureText(e.target.value)}
                          placeholder="e.g. “Bless the Lord, O my soul, and forget not all His benefits...”"
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-amber-200/90 italic font-serif"
                        />
                      </div>
                    )}

                    {/* Anonymous Prayer Checkbox */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div>
                        <h5 className="text-xs font-bold text-white">Post Anonymously</h5>
                        <p className="text-[11px] text-slate-400">Hide your personal identity for sensitive prayer requests.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="accent-amber-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </>
                ) : (
                  /* 🔍 LIVE PREVIEW TAB */
                  <div className="space-y-4 py-2">
                    <div className="p-4 rounded-3xl bg-slate-900 border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={isAnonymous ? 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=120&q=80' : (userSession.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80')}
                            alt="Author"
                            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-amber-400"
                          />
                          <div>
                            <div className="text-xs font-bold text-white">
                              {isAnonymous ? 'Kingdom Intercessor' : (userSession.fullName || 'You')}
                            </div>
                            <div className="text-[10px] text-slate-400">Just now • Preview</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase">
                          {postCategory}
                        </span>
                      </div>

                      {postTitle && <h4 className="text-sm font-bold text-white">{postTitle}</h4>}
                      <p className="text-xs text-slate-300 leading-relaxed">{postContent || '(No content entered yet)'}</p>

                      {postScripture && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                          <div className="text-xs font-bold text-amber-400">{postScripture}</div>
                          {postScriptureText && <p className="text-xs text-amber-200 italic font-serif">{postScriptureText}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> +30 Praise XP on publish
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish to Global Feed</span>
                    </button>
                  </div>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FellowshipCommunityHub;

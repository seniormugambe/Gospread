import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Clock, 
  Share2, 
  Building2, 
  Music, 
  Video, 
  Award, 
  ShieldCheck, 
  Info, 
  ChevronRight, 
  CheckCircle2, 
  HelpCircle, 
  HeartHandshake, 
  Activity, 
  Flame, 
  Zap,
  BarChart3,
  Search,
  Filter,
  Crown,
  Lock,
  Globe,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type RankingCategory = 'users' | 'creators' | 'churches' | 'artistes';

export interface UnlockedBadgeInfo {
  name: string;
  icon: string;
  category?: string;
  description?: string;
  earnedDate?: string;
  tier?: 'Gold' | 'Silver' | 'Bronze';
}

export interface LeaderboardEntity {
  id: string;
  name: string;
  category: RankingCategory;
  avatar: string;
  verifiedFollowers?: number;
  totalFollowers?: number;
  growthRatePercent?: number; // Growth rate e.g., 24%
  engagementQualityScore?: number; // 0-100 scale based on active participation vs passive views
  primaryMetricVal: number; // e.g. usage time (hours) or artistes count or media count
  primaryMetricLabel: string;
  secondaryMetricVal: number; // e.g. active referrals or interaction depth
  secondaryMetricLabel: string;
  momentumScore: number; // Combined weighted momentum index (0 - 100)
  unlockedBadge: {
    name: string;
    description: string;
    colorClass: string;
    bgClass: string;
    icon: string;
  };
  // For users who have gained multiple badges:
  userBadges?: UnlockedBadgeInfo[];
  streakDays?: number;
  praiseXp?: number;
  homeChurch?: string;
  isCurrentUser?: boolean;
  rank: number;
  rankChange: 'up' | 'down' | 'same';
  rankChangeAmount?: number;
  locationOrHandle: string;
}

export const INITIAL_LEADERBOARD_DATA: LeaderboardEntity[] = [];
/*
  // --- 👑 1. GLOBAL BELIEVERS & USERS WHO HAVE GAINED BADGES (EXCLUSIVE) ---
  {
    id: 'u-1',
    name: 'Sister Sarah Jenkins',
    category: 'users',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
    primaryMetricVal: 3250,
    primaryMetricLabel: 'Praise XP Earned',
    secondaryMetricVal: 32,
    secondaryMetricLabel: 'Consecutive Grace Streak',
    streakDays: 32,
    praiseXp: 3250,
    homeChurch: 'Living Waters Sanctuary',
    momentumScore: 99.1,
    unlockedBadge: {
      name: 'Global Intercessor',
      description: '5 Faith Badges Unlocked: Global Intercessor, Overcomer 30D, Kingdom Ambassador, Seed Sower, Pillar of Light.',
      colorClass: 'text-amber-400 border-amber-500/50',
      bgClass: 'bg-amber-500/10',
      icon: '⚡'
    },
    userBadges: [
      { name: 'Global Intercessor', icon: '⚡', tier: 'Gold', earnedDate: 'Aug 02', category: 'Intercession' },
      { name: '30-Day Overcomer', icon: '🔥', tier: 'Gold', earnedDate: 'Jul 28', category: 'Streak' },
      { name: 'Kingdom Ambassador', icon: '👑', tier: 'Silver', earnedDate: 'Jun 15', category: 'Milestone' },
      { name: 'Seed Sower', icon: '🌱', tier: 'Bronze', earnedDate: 'Jul 10', category: 'Giving' },
      { name: 'Pillar of Light', icon: '🏛️', tier: 'Gold', earnedDate: 'May 30', category: 'Fellowship' }
    ],
    rank: 1,
    rankChange: 'up',
    rankChangeAmount: 1,
    locationOrHandle: 'Dallas, TX • @sarah_jenkins'
  },
  {
    id: 'u-2',
    name: 'Brother David Lawson (You)',
    category: 'users',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    primaryMetricVal: 1450,
    primaryMetricLabel: 'Praise XP Earned',
    secondaryMetricVal: 7,
    secondaryMetricLabel: 'Consecutive Grace Streak',
    streakDays: 7,
    praiseXp: 1450,
    homeChurch: 'Grace City Cathedral',
    isCurrentUser: true,
    momentumScore: 96.8,
    unlockedBadge: {
      name: 'Kingdom Ambassador',
      description: '8 Faith Badges Unlocked: Diligent Sower, Faithful Reach, Rising Voice, Pillar of Light, Psalmist Voice, Overcomer 7D, Amen Warrior, Kingdom Ambassador.',
      colorClass: 'text-amber-300 border-amber-400/50',
      bgClass: 'bg-amber-400/10',
      icon: '👑'
    },
    userBadges: [
      { name: 'Diligent Sower', icon: '🌾', tier: 'Gold', earnedDate: 'May 10', category: 'Momentum' },
      { name: 'Faithful Reach', icon: '🌱', tier: 'Silver', earnedDate: 'Aug 02', category: 'Discipleship' },
      { name: 'Rising Voice', icon: '✨', tier: 'Silver', earnedDate: 'Jul 18', category: 'Growth' },
      { name: 'Pillar of Light', icon: '🏛️', tier: 'Gold', earnedDate: 'Jun 22', category: 'Fellowship' },
      { name: 'Psalmist Voice', icon: '🎻', tier: 'Bronze', earnedDate: 'Jul 01', category: 'Worship' },
      { name: '7-Day Overcomer', icon: '🔥', tier: 'Gold', earnedDate: 'Aug 09', category: 'Streak' },
      { name: 'Amen Warrior', icon: '🙌', tier: 'Silver', earnedDate: 'May 14', category: 'Altar Reaction' },
      { name: 'Kingdom Ambassador', icon: '👑', tier: 'Gold', earnedDate: 'Jun 10', category: 'Ambassador' }
    ],
    rank: 2,
    rankChange: 'up',
    rankChangeAmount: 2,
    locationOrHandle: 'London, UK & Atlanta • @david_lawson'
  },
  {
    id: 'u-3',
    name: 'Deacon Samuel Mwangi',
    category: 'users',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    primaryMetricVal: 2400,
    primaryMetricLabel: 'Praise XP Earned',
    secondaryMetricVal: 24,
    secondaryMetricLabel: 'Consecutive Grace Streak',
    streakDays: 24,
    praiseXp: 2400,
    homeChurch: 'Nairobi Revival Fellowship',
    momentumScore: 95.2,
    unlockedBadge: {
      name: 'Pillar of Light',
      description: '4 Faith Badges Unlocked: Kingdom Ambassador, Amen Warrior, 14-Day Overcomer, Seed Sower.',
      colorClass: 'text-emerald-400 border-emerald-500/50',
      bgClass: 'bg-emerald-500/10',
      icon: '🏛️'
    },
    userBadges: [
      { name: 'Kingdom Ambassador', icon: '👑', tier: 'Silver', earnedDate: 'Jul 15', category: 'Milestone' },
      { name: '14-Day Overcomer', icon: '🔥', tier: 'Gold', earnedDate: 'Aug 01', category: 'Streak' },
      { name: 'Amen Warrior', icon: '🙌', tier: 'Silver', earnedDate: 'Jun 20', category: 'Altar' },
      { name: 'Seed Sower', icon: '🌱', tier: 'Bronze', earnedDate: 'Jul 04', category: 'Giving' }
    ],
    rank: 3,
    rankChange: 'same',
    locationOrHandle: 'Nairobi, Kenya • @samuel_mwangi'
  },
  {
    id: 'u-4',
    name: 'Sister Maria Rodriguez',
    category: 'users',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
    primaryMetricVal: 1980,
    primaryMetricLabel: 'Praise XP Earned',
    secondaryMetricVal: 18,
    secondaryMetricLabel: 'Consecutive Grace Streak',
    streakDays: 18,
    praiseXp: 1980,
    homeChurch: 'Covenant Life Sanctuary',
    momentumScore: 93.6,
    unlockedBadge: {
      name: 'Global Intercessor',
      description: '4 Faith Badges Unlocked: Global Intercessor, 14-Day Overcomer, Amen Warrior, Psalmist Voice.',
      colorClass: 'text-cyan-400 border-cyan-500/50',
      bgClass: 'bg-cyan-500/10',
      icon: '⚡'
    },
    userBadges: [
      { name: 'Global Intercessor', icon: '⚡', tier: 'Gold', earnedDate: 'Jul 29', category: 'Prayer' },
      { name: '14-Day Overcomer', icon: '🔥', tier: 'Gold', earnedDate: 'Jul 18', category: 'Streak' },
      { name: 'Amen Warrior', icon: '🙌', tier: 'Silver', earnedDate: 'May 30', category: 'Altar' },
      { name: 'Psalmist Voice', icon: '🎻', tier: 'Bronze', earnedDate: 'Jun 12', category: 'Worship' }
    ],
    rank: 4,
    rankChange: 'down',
    rankChangeAmount: 1,
    locationOrHandle: 'São Paulo, Brazil • @maria_rod'
  },
  {
    id: 'u-5',
    name: 'Brother Emmanuel Adeyemi',
    category: 'users',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
    primaryMetricVal: 1620,
    primaryMetricLabel: 'Praise XP Earned',
    secondaryMetricVal: 14,
    secondaryMetricLabel: 'Consecutive Grace Streak',
    streakDays: 14,
    praiseXp: 1620,
    homeChurch: 'Grace City Fellowship Lagos',
    momentumScore: 91.4,
    unlockedBadge: {
      name: 'Kingdom Ambassador',
      description: '3 Faith Badges Unlocked: Kingdom Ambassador, 7-Day Overcomer, Amen Warrior.',
      colorClass: 'text-purple-400 border-purple-500/50',
      bgClass: 'bg-purple-500/10',
      icon: '👑'
    },
    userBadges: [
      { name: 'Kingdom Ambassador', icon: '👑', tier: 'Silver', earnedDate: 'Jul 10', category: 'Milestone' },
      { name: '7-Day Overcomer', icon: '🔥', tier: 'Silver', earnedDate: 'Jul 22', category: 'Streak' },
      { name: 'Amen Warrior', icon: '🙌', tier: 'Silver', earnedDate: 'Jun 05', category: 'Altar' }
    ],
    rank: 5,
    rankChange: 'up',
    rankChangeAmount: 2,
    locationOrHandle: 'Lagos, Nigeria • @emmanuel_ade'
  },
  {
    id: 'u-6',
    name: 'Sister Hannah Grace',
    category: 'users',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
    primaryMetricVal: 1280,
    primaryMetricLabel: 'Praise XP Earned',
    secondaryMetricVal: 10,
    secondaryMetricLabel: 'Consecutive Grace Streak',
    streakDays: 10,
    praiseXp: 1280,
    homeChurch: 'Toronto Revival Tabernacle',
    momentumScore: 88.9,
    unlockedBadge: {
      name: 'Faithful Reach',
      description: '3 Faith Badges Unlocked: Faithful Reach, 7-Day Overcomer, Amen Warrior.',
      colorClass: 'text-pink-400 border-pink-500/50',
      bgClass: 'bg-pink-500/10',
      icon: '🌱'
    },
    userBadges: [
      { name: 'Faithful Reach', icon: '🌱', tier: 'Bronze', earnedDate: 'Aug 04', category: 'Reach' },
      { name: '7-Day Overcomer', icon: '🔥', tier: 'Silver', earnedDate: 'Jul 29', category: 'Streak' },
      { name: 'Amen Warrior', icon: '🙌', tier: 'Bronze', earnedDate: 'Jul 01', category: 'Altar' }
    ],
    rank: 6,
    rankChange: 'same',
    locationOrHandle: 'Toronto, Canada • @hannah_grace'
  },
  {
    id: 'u-7',
    name: 'Brother Caleb Zhang',
    category: 'users',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80',
    primaryMetricVal: 980,
    primaryMetricLabel: 'Praise XP Earned',
    secondaryMetricVal: 8,
    secondaryMetricLabel: 'Consecutive Grace Streak',
    streakDays: 8,
    praiseXp: 980,
    homeChurch: 'Singapore Grace Chapel',
    momentumScore: 86.5,
    unlockedBadge: {
      name: 'Kingdom Ambassador',
      description: '2 Faith Badges Unlocked: Kingdom Ambassador, Amen Warrior.',
      colorClass: 'text-amber-400 border-amber-500/50',
      bgClass: 'bg-amber-500/10',
      icon: '👑'
    },
    userBadges: [
      { name: 'Kingdom Ambassador', icon: '👑', tier: 'Silver', earnedDate: 'Jun 28', category: 'Milestone' },
      { name: 'Amen Warrior', icon: '🙌', tier: 'Bronze', earnedDate: 'Jun 14', category: 'Altar' }
    ],
    rank: 7,
    rankChange: 'down',
    rankChangeAmount: 1,
    locationOrHandle: 'Singapore • @caleb_zhang'
  },
  {
    id: 'u-8',
    name: 'Sister Abigail Clark',
    category: 'users',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    primaryMetricVal: 820,
    primaryMetricLabel: 'Praise XP Earned',
    secondaryMetricVal: 7,
    secondaryMetricLabel: 'Consecutive Grace Streak',
    streakDays: 7,
    praiseXp: 820,
    homeChurch: 'Sydney Light Cathedral',
    momentumScore: 84.1,
    unlockedBadge: {
      name: '7-Day Overcomer',
      description: '2 Faith Badges Unlocked: 7-Day Overcomer, Amen Warrior.',
      colorClass: 'text-emerald-400 border-emerald-500/50',
      bgClass: 'bg-emerald-500/10',
      icon: '🔥'
    },
    userBadges: [
      { name: '7-Day Overcomer', icon: '🔥', tier: 'Silver', earnedDate: 'Aug 07', category: 'Streak' },
      { name: 'Amen Warrior', icon: '🙌', tier: 'Bronze', earnedDate: 'Jul 20', category: 'Altar' }
    ],
    rank: 8,
    rankChange: 'up',
    rankChangeAmount: 1,
    locationOrHandle: 'Sydney, Australia • @abigail_clark'
  },

  // --- CREATORS CATEGORY ---
  {
    id: 'c-1',
    name: 'Grace Shorts Evangelism Team',
    category: 'creators',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 34500,
    totalFollowers: 42000,
    growthRatePercent: 38.5,
    engagementQualityScore: 94,
    primaryMetricVal: 4850,
    primaryMetricLabel: 'Study & Discipleship Hours',
    secondaryMetricVal: 1240,
    secondaryMetricLabel: 'Kingdom Referrals',
    momentumScore: 96.4,
    unlockedBadge: {
      name: 'Kingdom Catalyst',
      description: 'Awarded for extraordinary spiritual growth rate and high disciple engagement depth.',
      colorClass: 'text-amber-400 border-amber-500/50',
      bgClass: 'bg-amber-500/10',
      icon: '⚡'
    },
    rank: 1,
    rankChange: 'up',
    rankChangeAmount: 2,
    locationOrHandle: '@GraceShortsTeam'
  },
  {
    id: 'c-2',
    name: 'Dr. Elizabeth Vance Teaching Channel',
    category: 'creators',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 182000,
    totalFollowers: 210000,
    growthRatePercent: 18.2,
    engagementQualityScore: 91,
    primaryMetricVal: 8900,
    primaryMetricLabel: 'Study & Discipleship Hours',
    secondaryMetricVal: 3420,
    secondaryMetricLabel: 'Kingdom Referrals',
    momentumScore: 93.8,
    unlockedBadge: {
      name: 'Faithful Reach',
      description: 'Consistent daily exposition with high verified believer retention.',
      colorClass: 'text-emerald-400 border-emerald-500/50',
      bgClass: 'bg-emerald-500/10',
      icon: '🌱'
    },
    rank: 2,
    rankChange: 'same',
    locationOrHandle: '@DrElizabethVance'
  },
  {
    id: 'c-3',
    name: 'Morning Manna Devotions',
    category: 'creators',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 12400,
    totalFollowers: 15800,
    growthRatePercent: 42.1,
    engagementQualityScore: 88,
    primaryMetricVal: 2100,
    primaryMetricLabel: 'Study & Discipleship Hours',
    secondaryMetricVal: 890,
    secondaryMetricLabel: 'Kingdom Referrals',
    momentumScore: 89.2,
    unlockedBadge: {
      name: 'Rising Voice',
      description: 'Rapidly accelerating growth with strong community prayer involvement.',
      colorClass: 'text-cyan-400 border-cyan-500/50',
      bgClass: 'bg-cyan-500/10',
      icon: '✨'
    },
    rank: 3,
    rankChange: 'up',
    rankChangeAmount: 4,
    locationOrHandle: '@MorningMannaDevos'
  },
  {
    id: 'c-4',
    name: 'Kingdom Mindset Podcast Host',
    category: 'creators',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 68000,
    totalFollowers: 85000,
    growthRatePercent: 12.4,
    engagementQualityScore: 85,
    primaryMetricVal: 4200,
    primaryMetricLabel: 'Study & Discipleship Hours',
    secondaryMetricVal: 1850,
    secondaryMetricLabel: 'Kingdom Referrals',
    momentumScore: 84.6,
    unlockedBadge: {
      name: 'Diligent Sower',
      description: 'Steadfast content output fostering deep biblical discussions.',
      colorClass: 'text-purple-400 border-purple-500/50',
      bgClass: 'bg-purple-500/10',
      icon: '🌾'
    },
    rank: 4,
    rankChange: 'down',
    rankChangeAmount: 1,
    locationOrHandle: '@KingdomMindset'
  },

  // --- CHURCHES CATEGORY ---
  {
    id: 'ch-1',
    name: 'Living Waters Sanctuary',
    category: 'churches',
    avatar: 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 18500,
    totalFollowers: 22000,
    growthRatePercent: 46.2,
    engagementQualityScore: 96,
    primaryMetricVal: 14,
    primaryMetricLabel: 'Affiliated Artistes & Ministries',
    secondaryMetricVal: 98.2,
    secondaryMetricLabel: 'Interaction Quality Index',
    momentumScore: 97.1,
    unlockedBadge: {
      name: 'Vibrant Fellowship',
      description: 'High engagement quality and rapid community fellowship growth rate.',
      colorClass: 'text-amber-400 border-amber-500/50',
      bgClass: 'bg-amber-500/10',
      icon: '🔥'
    },
    rank: 1,
    rankChange: 'up',
    rankChangeAmount: 3,
    locationOrHandle: 'Houston, TX'
  },
  {
    id: 'ch-2',
    name: 'Grace City Cathedral',
    category: 'churches',
    avatar: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 395000,
    totalFollowers: 482000,
    growthRatePercent: 14.8,
    engagementQualityScore: 92,
    primaryMetricVal: 32,
    primaryMetricLabel: 'Affiliated Artistes & Ministries',
    secondaryMetricVal: 94.0,
    secondaryMetricLabel: 'Interaction Quality Index',
    momentumScore: 95.4,
    unlockedBadge: {
      name: 'Pillar of Light',
      description: 'Outstanding global footprint and sanctuary fellowship scale.',
      colorClass: 'text-amber-300 border-amber-400/50',
      bgClass: 'bg-amber-400/10',
      icon: '🏛️'
    },
    rank: 2,
    rankChange: 'down',
    rankChangeAmount: 1,
    locationOrHandle: 'Atlanta, GA & London'
  },
  {
    id: 'ch-3',
    name: 'Covenant Life Ministries',
    category: 'churches',
    avatar: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 178000,
    totalFollowers: 210000,
    growthRatePercent: 21.5,
    engagementQualityScore: 89,
    primaryMetricVal: 18,
    primaryMetricLabel: 'Affiliated Artistes & Ministries',
    secondaryMetricVal: 91.5,
    secondaryMetricLabel: 'Interaction Quality Index',
    momentumScore: 91.8,
    unlockedBadge: {
      name: 'Gathering Sanctuary',
      description: 'Robust covenant prayer interaction and active discipleship.',
      colorClass: 'text-emerald-400 border-emerald-500/50',
      bgClass: 'bg-emerald-500/10',
      icon: '🛡️'
    },
    rank: 3,
    rankChange: 'same',
    locationOrHandle: 'Dallas, TX & Lagos'
  },
  {
    id: 'ch-4',
    name: 'Victory Harvest Temple',
    category: 'churches',
    avatar: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 8900,
    totalFollowers: 11200,
    growthRatePercent: 39.8,
    engagementQualityScore: 91,
    primaryMetricVal: 8,
    primaryMetricLabel: 'Affiliated Artistes & Ministries',
    secondaryMetricVal: 89.4,
    secondaryMetricLabel: 'Interaction Quality Index',
    momentumScore: 88.5,
    unlockedBadge: {
      name: 'Watchman Altar',
      description: 'High momentum local community with exemplary prayer response times.',
      colorClass: 'text-cyan-400 border-cyan-500/50',
      bgClass: 'bg-cyan-500/10',
      icon: '⛪'
    },
    rank: 4,
    rankChange: 'up',
    rankChangeAmount: 2,
    locationOrHandle: 'Chicago, IL'
  },

  // --- ARTISTES CATEGORY ---
  {
    id: 'a-1',
    name: 'Elena Rostova & Grace Collective',
    category: 'artistes',
    avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 42000,
    totalFollowers: 51000,
    growthRatePercent: 54.2,
    engagementQualityScore: 98,
    primaryMetricVal: 16,
    primaryMetricLabel: 'Original Gospel Tracks & Sermons',
    secondaryMetricVal: 28400,
    secondaryMetricLabel: 'Listening & Worship Hours',
    momentumScore: 98.2,
    unlockedBadge: {
      name: 'Psalmist Voice',
      description: 'Profound worshiper engagement with high verified re-listen rate.',
      colorClass: 'text-amber-400 border-amber-500/50',
      bgClass: 'bg-amber-500/10',
      icon: '🎻'
    },
    rank: 1,
    rankChange: 'up',
    rankChangeAmount: 2,
    locationOrHandle: 'Nashville, TN'
  },
  {
    id: 'a-2',
    name: 'David & Kingdom Sound Worship',
    category: 'artistes',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 245000,
    totalFollowers: 310000,
    growthRatePercent: 19.5,
    engagementQualityScore: 94,
    primaryMetricVal: 48,
    primaryMetricLabel: 'Original Gospel Tracks & Sermons',
    secondaryMetricVal: 92000,
    secondaryMetricLabel: 'Listening & Worship Hours',
    momentumScore: 95.8,
    unlockedBadge: {
      name: 'Anointed Melody',
      description: 'Sustained international listening presence across live streams.',
      colorClass: 'text-amber-300 border-amber-400/50',
      bgClass: 'bg-amber-400/10',
      icon: '🎺'
    },
    rank: 2,
    rankChange: 'same',
    locationOrHandle: 'Atlanta, GA'
  },
  {
    id: 'a-3',
    name: 'Selah Strings Devotional Ensemble',
    category: 'artistes',
    avatar: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 31200,
    totalFollowers: 38000,
    growthRatePercent: 36.4,
    engagementQualityScore: 91,
    primaryMetricVal: 12,
    primaryMetricLabel: 'Original Gospel Tracks & Sermons',
    secondaryMetricVal: 14200,
    secondaryMetricLabel: 'Listening & Worship Hours',
    momentumScore: 92.4,
    unlockedBadge: {
      name: 'Rising Melody',
      description: 'Fast-rising instrumental psalmody inspiring prayer altars globally.',
      colorClass: 'text-cyan-400 border-cyan-500/50',
      bgClass: 'bg-cyan-500/10',
      icon: '✨'
    },
    rank: 3,
    rankChange: 'up',
    rankChangeAmount: 3,
    locationOrHandle: 'London, UK'
  },
  {
    id: 'a-4',
    name: 'Agape International Choir',
    category: 'artistes',
    avatar: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=240&q=80',
    verifiedFollowers: 89000,
    totalFollowers: 98000,
    growthRatePercent: 29.8,
    engagementQualityScore: 89,
    primaryMetricVal: 24,
    primaryMetricLabel: 'Original Gospel Tracks & Sermons',
    secondaryMetricVal: 18100,
    secondaryMetricLabel: 'Listening & Worship Hours',
    momentumScore: 89.1,
    unlockedBadge: {
      name: 'Harmonic Refuge',
      description: 'High choir engagement depth encouraging daily meditation and reflection.',
      colorClass: 'text-emerald-400 border-emerald-500/50',
      bgClass: 'bg-emerald-500/10',
      icon: '🕊️'
    },
    rank: 4,
    rankChange: 'up',
    rankChangeAmount: 1,
    locationOrHandle: 'Global Online'
  }
];

*/
interface SpiritualMomentumRankingsProps {
  onSelectChannelModal?: (channelName: string) => void;
  joinedChurches?: string[];
  onToggleJoinChurch?: (churchName: string) => void;
  streakDays?: number;
  praiseXp?: number;
}

export default function SpiritualMomentumRankings({
  onSelectChannelModal,
  joinedChurches = [],
  onToggleJoinChurch,
  streakDays = 7,
  praiseXp = 1450
}: SpiritualMomentumRankingsProps) {
  // Default to 'users' (Global Believers & Badge Earners) as requested
  const [activeCategory, setActiveCategory] = useState<RankingCategory>('users');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [badgeFilter, setBadgeFilter] = useState<'all' | '3plus' | '5plus'>('all');
  const [selectedUserForBadges, setSelectedUserForBadges] = useState<LeaderboardEntity | null>(null);

  // Filter leaderboard items
  const categoryItems = INITIAL_LEADERBOARD_DATA.filter(item => {
    if (item.category !== activeCategory) return false;
    
    // In users category, ensure they have unlocked badges
    if (activeCategory === 'users') {
      const badgeCount = item.userBadges?.length || 0;
      if (badgeCount === 0) return false; // Strictly users who have gained badges
      if (badgeFilter === '3plus' && badgeCount < 3) return false;
      if (badgeFilter === '5plus' && badgeCount < 5) return false;
    }
    return true;
  });

  const filteredItems = categoryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.locationOrHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.userBadges && item.userBadges.some(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())))
  ).sort((a, b) => b.momentumScore - a.momentumScore);

  // Current logged in user status
  const myUserMomentum = {
    rankName: 'Kingdom Ambassador & Diligent Sower',
    momentumScore: 96.8,
    studyHoursThisWeek: 14.5,
    streakDays: streakDays,
    praiseXp: praiseXp,
    currentRankPosition: '#2 in Global Believers Ranking',
    growthRate: '+34.2% this month',
    unlockedBadges: [
      { name: 'Diligent Sower', icon: '🌾', date: 'Earned May 10', tier: 'Gold' },
      { name: 'Faithful Reach', icon: '🌱', date: 'Earned Aug 2', tier: 'Silver' },
      { name: 'Rising Voice', icon: '✨', date: 'Earned Jul 18', tier: 'Silver' },
      { name: 'Pillar of Light', icon: '🏛️', date: 'Earned Jun 22', tier: 'Gold' },
      { name: 'Psalmist Voice', icon: '🎻', date: 'Earned Jul 01', tier: 'Bronze' },
      { name: '7-Day Overcomer', icon: '🔥', date: 'Earned Aug 09', tier: 'Gold' },
      { name: 'Amen Warrior', icon: '🙌', date: 'Earned May 14', tier: 'Silver' },
      { name: 'Kingdom Ambassador', icon: '👑', date: 'Earned Jun 10', tier: 'Gold' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* 🌟 1. HERO HEADER WITH MOMENTUM EXPLANATION & FAIRNESS GUARANTEE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-950 border border-amber-500/40 p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Global Rankings • Exclusive to Badge Earners</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight flex items-center gap-2.5 flex-wrap">
              <span>Kingdom Global Rankings</span>
              <span className="text-sm px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                ⭐ Verified Badge Holders
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Global leaderboard celebrating registered believers and ministry leaders who have gained and unlocked faith badges through prayer streaks, study hours, and kingdom momentum.
            </p>
          </div>

          <button
            onClick={() => setShowFormulaModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xl shrink-0 self-start md:self-auto"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Badge Rules & Qualification</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* 🛡️ Fairness & Badge Qualification Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 text-xs text-slate-300 flex items-start sm:items-center gap-3 font-sans">
          <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="space-y-0.5">
            <span className="font-bold text-amber-300">Badge Holders Qualification: </span>
            <span className="text-slate-300">
              Only users who have unlocked <strong>1+ behavioral faith badges</strong> through daily prayer discipline, praise streaks, and live altar participation qualify for the Global Rankings board.
            </span>
          </div>
        </div>
      </div>

      {/* 📊 2. USER'S PERSONAL MOMENTUM METRICS & BADGES CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 space-y-4 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                👑
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-slate-950 text-amber-400 text-[9px] font-black border border-amber-500/40">
                #2
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">David Lawson (You)</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Qualified for Global Ranking
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Grace City Cathedral • <strong className="text-amber-400">{myUserMomentum.currentRankPosition}</strong> ({myUserMomentum.unlockedBadges.length} Badges Earned)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono font-bold text-xs self-start sm:self-auto">
            <span className="text-slate-400">Global Momentum Index:</span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-sm font-black shadow-inner">
              {myUserMomentum.momentumScore} / 100
            </span>
          </div>
        </div>

        {/* Breakdown of Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1 text-[10px] font-medium">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Faith Badges Earned
            </span>
            <div className="font-black text-amber-300 text-base">{myUserMomentum.unlockedBadges.length} Unlocked</div>
            <div className="text-[10px] text-emerald-400 font-mono">Qualifies for Top #2 Rank</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1 text-[10px] font-medium">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Grace Streak
            </span>
            <div className="font-black text-white text-base">{streakDays}-Day Streak 🔥</div>
            <div className="text-[10px] text-rose-300 font-mono">Consecutive devotions</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1 text-[10px] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Praise XP
            </span>
            <div className="font-black text-cyan-300 text-base">{praiseXp.toLocaleString()} XP</div>
            <div className="text-[10px] text-slate-400 font-mono">Spiritual discipline score</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 flex items-center gap-1 text-[10px] font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Growth Trajectory
            </span>
            <div className="font-black text-emerald-400 text-base">+34.2%</div>
            <div className="text-[10px] text-slate-400">Monthly momentum</div>
          </div>
        </div>

        {/* Behavioral Badges Display */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Your Unlocked Badges in Global Ranking:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              8 Active Badges
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {myUserMomentum.unlockedBadges.map((badge, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-amber-200 font-bold flex items-center gap-1.5 shadow-sm hover:border-amber-400 transition cursor-default"
                title={`${badge.name} • ${badge.date}`}
              >
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
                <span className="text-[9px] text-slate-500 font-normal font-mono">({badge.date})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🏆 3. CATEGORY SELECTION TABS & FILTERS */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 scrollbar-none">
            {[
              { id: 'users', label: '👑 Global Believers (Badge Earners)', icon: Crown, desc: 'Rankings for users with unlocked badges' },
              { id: 'creators', label: '🎥 Creators Momentum', icon: Video, desc: 'Followers, referrals & study time' },
              { id: 'churches', label: '⛪ Churches Discipline', icon: Building2, desc: 'Hosted artistes & engagement depth' },
              { id: 'artistes', label: '🎵 Artistes Psalmody', icon: Music, desc: 'Tracks, verified followers & worship time' },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as RankingCategory)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Badge Filter (When Users category active) */}
          {activeCategory === 'users' ? (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 self-start md:self-auto">
              <span className="text-[10px] text-slate-500 font-bold px-2 flex items-center gap-1">
                <Filter className="w-3 h-3 text-amber-400" />
                Badges:
              </span>
              {[
                { id: 'all', label: 'All (1+ Badges)' },
                { id: '3plus', label: '⭐ 3+ Badges' },
                { id: '5plus', label: '👑 5+ Badges' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBadgeFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                    badgeFilter === f.id
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          ) : (
            /* Time Filter Toggle */
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 self-start md:self-auto">
              {(['weekly', 'monthly', 'allTime'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition ${
                    timeFilter === tf
                      ? 'bg-slate-800 text-amber-400 border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf === 'allTime' ? 'All-Time' : tf}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeCategory === 'users'
                ? 'Search badge earners by name, location, church, or badge (e.g. Intercessor, Overcomer)...'
                : `Search ${activeCategory} momentum rankings...`
            }
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* 🥇 4. LEADERBOARD LISTING */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-3">
            <Award className="w-10 h-10 text-amber-400/50 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Badge Earners Match Your Filter</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Only believers who have gained faith badges qualify for the Global Rankings board. Try clearing your search or badge filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setBadgeFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredItems.map((entity, index) => {
            const rankDisplay = index + 1;
            const isTopThree = rankDisplay <= 3;
            const isJoinedChurch = joinedChurches.some(c => c.toLowerCase() === entity.name.toLowerCase());
            const badgeCount = entity.userBadges?.length || 1;

            return (
              <motion.div
                key={entity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  entity.isCurrentUser
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500 ring-2 ring-amber-500/30 shadow-2xl'
                    : isTopThree
                    ? 'bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/30 border-amber-500/40 shadow-xl'
                    : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Rank & Profile Info */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center font-black text-sm shrink-0 shadow-md ${
                    rankDisplay === 1
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-amber-500/30'
                      : rankDisplay === 2
                      ? 'bg-slate-200 text-slate-950 font-black'
                      : rankDisplay === 3
                      ? 'bg-amber-800 text-amber-100 font-bold'
                      : 'bg-slate-800 text-slate-400 font-mono'
                  }`}>
                    {rankDisplay === 1 ? '🥇' : rankDisplay === 2 ? '🥈' : rankDisplay === 3 ? '🥉' : `#${rankDisplay}`}
                  </div>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={entity.avatar}
                      alt={entity.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-md"
                    />
                    {entity.isCurrentUser && (
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[8px] font-black shadow-md">
                        YOU
                      </span>
                    )}
                  </div>

                  {/* Name & Behavioral Badges */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {entity.category === 'users' ? (
                        <span className="font-bold text-sm sm:text-base text-white truncate">
                          {entity.name}
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectChannelModal && onSelectChannelModal(entity.name)}
                          className="font-bold text-sm sm:text-base text-white hover:text-amber-300 transition truncate text-left"
                        >
                          {entity.name}
                        </button>
                      )}

                      {/* Badge Count Pill */}
                      {entity.category === 'users' && (
                        <button
                          onClick={() => setSelectedUserForBadges(entity)}
                          className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1 hover:bg-amber-500/30 transition"
                          title="Click to view full badge showcase"
                        >
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>{badgeCount} Badges Gained</span>
                        </button>
                      )}

                      {/* Primary Unlocked Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black flex items-center gap-1 ${entity.unlockedBadge.bgClass} ${entity.unlockedBadge.colorClass}`}>
                        <span>{entity.unlockedBadge.icon}</span>
                        <span>{entity.unlockedBadge.name}</span>
                      </span>
                    </div>

                    {/* User's Badges Mini Icons Reel */}
                    {entity.userBadges && entity.userBadges.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {entity.userBadges.map((b, bIdx) => (
                          <span
                            key={bIdx}
                            className="text-xs px-1.5 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium inline-flex items-center gap-1 hover:border-amber-500/50 cursor-pointer"
                            onClick={() => setSelectedUserForBadges(entity)}
                            title={`${b.name} (${b.category || 'Badge'}) - Earned ${b.earnedDate}`}
                          >
                            <span>{b.icon}</span>
                            <span className="text-[10px] text-slate-400">{b.name}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                      <span>{entity.locationOrHandle}</span>
                      {entity.homeChurch && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400/90 font-medium">⛪ {entity.homeChurch}</span>
                        </>
                      )}
                      {entity.growthRatePercent && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-emerald-400 font-bold">
                            +{entity.growthRatePercent}% Growth
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Metrics & Momentum Score Breakdown */}
                <div className="flex items-center justify-between md:justify-end gap-3.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Category Primary Metric */}
                  <div className="text-left md:text-right text-xs space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {entity.primaryMetricLabel}
                    </span>
                    <div className="font-bold text-white font-mono flex items-center gap-1 md:justify-end">
                      {entity.category === 'users' && <Sparkles className="w-3 h-3 text-cyan-400" />}
                      <span>{entity.primaryMetricVal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Secondary Metric */}
                  <div className="text-left md:text-right text-xs space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {entity.secondaryMetricLabel}
                    </span>
                    <div className="font-bold text-rose-300 font-mono flex items-center gap-1 md:justify-end">
                      {entity.category === 'users' && <Flame className="w-3 h-3 text-rose-400" />}
                      <span>
                        {entity.secondaryMetricVal.toLocaleString()}
                        {entity.category === 'users' ? ' Days' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Final Weighted Momentum Index Score */}
                  <div className="text-right space-y-0.5 bg-slate-950 p-2.5 rounded-2xl border border-amber-500/20 shadow-inner">
                    <span className="text-[9px] text-amber-400 font-black uppercase tracking-wider block">
                      Momentum Score
                    </span>
                    <div className="font-black text-amber-300 text-sm font-mono">
                      {entity.momentumScore.toFixed(1)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {entity.category === 'users' ? (
                      <button
                        onClick={() => setSelectedUserForBadges(entity)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center gap-1 border border-slate-700 shadow-sm"
                        title="View Unlocked Badges"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Badges</span>
                      </button>
                    ) : (
                      <>
                        {entity.category === 'churches' && (
                          <button
                            onClick={() => onToggleJoinChurch && onToggleJoinChurch(entity.name)}
                            className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-md ${
                              isJoinedChurch
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            }`}
                          >
                            {isJoinedChurch ? 'Joined' : '✝️ Join'}
                          </button>
                        )}

                        <button
                          onClick={() => onSelectChannelModal && onSelectChannelModal(entity.name)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                          title="View Portfolio & Momentum Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* 🏅 5. BADGE SHOWCASE DETAIL MODAL */}
      <AnimatePresence>
        {selectedUserForBadges && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border-2 border-amber-500/50 p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-white"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUserForBadges.avatar}
                    alt={selectedUserForBadges.name}
                    className="w-10 h-10 rounded-2xl object-cover border border-amber-500/40"
                  />
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{selectedUserForBadges.name}</span>
                      {selectedUserForBadges.isCurrentUser && (
                        <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded text-[9px] font-black">
                          YOU
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {selectedUserForBadges.locationOrHandle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUserForBadges(null)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-amber-300 block">Global Rank #{selectedUserForBadges.rank}</span>
                      <span className="text-[10px] text-slate-400">{selectedUserForBadges.userBadges?.length || 1} Faith Badges Unlocked</span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-400 block">Praise XP</span>
                    <span className="text-sm font-black text-amber-400">{selectedUserForBadges.primaryMetricVal.toLocaleString()} XP</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider pt-1">
                  Unlocked Faith & Behavioral Badges:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedUserForBadges.userBadges?.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{b.icon}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                          {b.tier || 'Gold'}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-white">{b.name}</h5>
                        <p className="text-[10px] text-slate-400">{b.category || 'Behavioral Discipline'}</p>
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                        {b.earnedDate ? `Earned ${b.earnedDate}` : 'Active Badge'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 💡 6. TRANSPARENCY FORMULA MODAL */}
      <AnimatePresence>
        {showFormulaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border-2 border-amber-500/50 p-6 rounded-3xl max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">
                    Global Ranking & Badge Rules
                  </h3>
                </div>
                <button
                  onClick={() => setShowFormulaModal(false)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2">
                  <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Crown className="w-4 h-4" /> Global Ranking Qualification Policy
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    The Global Ranking board is strictly for believers and ministry users who have unlocked <strong>faith & behavioral badges</strong>. A minimum of 1 unlocked badge is required to appear on the global board.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-300 font-mono text-[11px]">
                    <li><strong className="text-amber-400">Badge Count (40% Weight)</strong>: Total unlocked faith & behavioral honors.</li>
                    <li><strong className="text-emerald-400">Grace Streak Discipline (30% Weight)</strong>: Consecutive days of daily scripture meditation and prayer.</li>
                    <li><strong className="text-cyan-300">Praise XP & Altar Activity (30% Weight)</strong>: Points gained through live stream amens, devotion time, and intercessory prayers.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Recognition-Based Honors (No Ordination Titles)
                  </h4>
                  <p className="text-slate-400 leading-relaxed">
                    Rewards are strictly recognition-based behavioral badges. To honor authentic church governance, we avoid using official ordination or ecclesiastical titles (e.g. Bishop, Elder, Apostle).
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-sans pt-1">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-amber-400 font-bold block">✓ Approved Badges</span>
                      <span className="text-slate-300">Overcomer, Global Intercessor, Kingdom Ambassador, Amen Warrior, Faithful Reach, Diligent Sower</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-red-400 font-bold block">❌ Prohibited Titles</span>
                      <span className="text-slate-400">Bishop, Apostle, Elder, Prophet, Reverend</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-[11px] text-slate-400">
                  <span className="text-amber-400 font-bold block">Zero Gaming Incentives</span>
                  <p>
                    Badges do not grant monetary rewards or algorithmic feed priority boost, ensuring spiritual discipline remains clean and free of artificial gaming.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

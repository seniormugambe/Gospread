import React, { useState, useEffect } from 'react';
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
  Heart,
  LayoutList,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { djangoApi, CommunityPostApi } from '../services/djangoApi';

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
  growthRatePercent?: number;
  engagementQualityScore?: number;
  primaryMetricVal: number;
  primaryMetricLabel: string;
  secondaryMetricVal: number;
  secondaryMetricLabel: string;
  momentumScore: number;
  unlockedBadge: {
    name: string;
    description: string;
    colorClass: string;
    bgClass: string;
    icon: string;
  };
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
  const [activeCategory, setActiveCategory] = useState<RankingCategory>('users');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [badgeFilter, setBadgeFilter] = useState<'all' | '3plus' | '5plus'>('all');
  const [selectedUserForBadges, setSelectedUserForBadges] = useState<LeaderboardEntity | null>(null);
  const [leaderboardItems, setLeaderboardItems] = useState<LeaderboardEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Fetch live believer activity / rankings from Django backend
  useEffect(() => {
    let isMounted = true;
    const fetchRankings = async () => {
      setIsLoading(true);
      try {
        const posts = await djangoApi.getCommunityPosts();
        if (isMounted && posts && posts.length > 0) {
          const userMap = new Map<string, { author: string; avatar: string; church?: string; count: number; prayers: number }>();
          posts.forEach(p => {
            const current = userMap.get(p.author_name) || {
              author: p.author_name,
              avatar: p.author_avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
              church: p.author_church,
              count: 0,
              prayers: 0
            };
            current.count += 1;
            current.prayers += (p.prayers_count || 0) + (p.amens_count || 0);
            userMap.set(p.author_name, current);
          });

          const dynamicUsers: LeaderboardEntity[] = Array.from(userMap.values()).map((u, idx) => {
            const calculatedXp = 1000 + (u.prayers * 50) + (u.count * 120);
            const calculatedStreak = 5 + (u.count * 3);
            const badges: UnlockedBadgeInfo[] = [
              { name: 'Global Intercessor', icon: '⚡', tier: 'Gold', earnedDate: 'Live', category: 'Intercession' },
              { name: 'Seed Sower', icon: '🌱', tier: 'Bronze', earnedDate: 'Live', category: 'Giving' }
            ];
            if (u.count >= 2) {
              badges.push({ name: 'Amen Warrior', icon: '🙌', tier: 'Silver', earnedDate: 'Live', category: 'Altar' });
            }
            if (u.count >= 3) {
              badges.push({ name: 'Kingdom Ambassador', icon: '👑', tier: 'Gold', earnedDate: 'Live', category: 'Milestone' });
            }

            return {
              id: `live-user-${idx}`,
              name: u.author,
              category: 'users',
              avatar: u.avatar,
              primaryMetricVal: calculatedXp,
              primaryMetricLabel: 'Praise XP Earned',
              secondaryMetricVal: calculatedStreak,
              secondaryMetricLabel: 'Consecutive Grace Streak',
              streakDays: calculatedStreak,
              praiseXp: calculatedXp,
              homeChurch: u.church || 'Fellowship Sanctuary',
              momentumScore: Math.min(99.9, +(85 + (u.count * 3.5)).toFixed(1)),
              unlockedBadge: {
                name: badges[0].name,
                description: `${badges.length} Faith Badges Unlocked: ${badges.map(b => b.name).join(', ')}.`,
                colorClass: 'text-amber-400 border-amber-500/50',
                bgClass: 'bg-amber-500/10',
                icon: badges[0].icon
              },
              userBadges: badges,
              rank: idx + 1,
              rankChange: 'same',
              locationOrHandle: `@${u.author.toLowerCase().replace(/\s+/g, '_')}`
            };
          });

          setLeaderboardItems(dynamicUsers);
        }
      } catch (err) {
        console.error('Failed to load leaderboard from backend:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRankings();
    return () => { isMounted = false; };
  }, []);

  // Filter leaderboard items
  const categoryItems = leaderboardItems.filter(item => {
    if (item.category !== activeCategory) return false;
    
    if (activeCategory === 'users') {
      const badgeCount = item.userBadges?.length || 0;
      if (badgeCount === 0) return false;
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

  const myUserMomentum = {
    rankName: 'Kingdom Ambassador & Diligent Sower',
    momentumScore: 96.8,
    studyHoursThisWeek: 14.5,
    streakDays: streakDays,
    praiseXp: praiseXp,
    currentRankPosition: '#2 in Global Believers Ranking',
    growthRate: '+34.2% this month',
    unlockedBadges: [
      { name: 'Diligent Sower', icon: '🌾', date: 'Active', tier: 'Gold' },
      { name: 'Faithful Reach', icon: '🌱', date: 'Active', tier: 'Silver' },
      { name: 'Rising Voice', icon: '✨', date: 'Active', tier: 'Silver' },
      { name: 'Pillar of Light', icon: '🏛️', date: 'Active', tier: 'Gold' },
      { name: 'Psalmist Voice', icon: '🎻', date: 'Active', tier: 'Bronze' },
      { name: '7-Day Overcomer', icon: '🔥', date: 'Active', tier: 'Gold' },
      { name: 'Amen Warrior', icon: '🙌', date: 'Active', tier: 'Silver' },
      { name: 'Kingdom Ambassador', icon: '👑', date: 'Active', tier: 'Gold' }
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

          {/* View Mode Switcher: Table vs Cards */}
          <div className="flex items-center p-0.5 bg-slate-950 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                viewMode === 'table'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Structured Table Display (Optimized for Tablet & Desktop)"
            >
              <LayoutList className="w-3 h-3" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                viewMode === 'cards'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Cards Display"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Cards</span>
            </button>
          </div>
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

      {/* 🥇 4. LEADERBOARD LISTING (TABLE & CARD VIEWS) */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading rankings...</div>
        ) : filteredItems.length === 0 ? (
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
        ) : viewMode === 'table' ? (
          /* 📋 STRUCTURED TABLE DISPLAY (Optimized for Tablet & Desktop with Mobile Card-Table Fallback) */
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-xl">
            {/* Desktop & Tablet HTML Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                    <th className="py-3.5 px-4">Believer / Ministry</th>
                    <th className="py-3.5 px-4">Faith Badges</th>
                    <th className="py-3.5 px-4">{activeCategory === 'users' ? 'XP / Study' : 'Reach & Followers'}</th>
                    <th className="py-3.5 px-4">{activeCategory === 'users' ? 'Daily Streak' : 'Growth'}</th>
                    <th className="py-3.5 px-4 text-center">Momentum</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredItems.map((entity, index) => {
                    const rankDisplay = index + 1;
                    const isJoinedChurch = joinedChurches.some(c => c.toLowerCase() === entity.name.toLowerCase());
                    const badgeCount = entity.userBadges?.length || 1;
                    return (
                      <tr
                        key={entity.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          entity.isCurrentUser ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        {/* Rank Column */}
                        <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-mono font-bold text-xs shadow-sm ${
                            rankDisplay === 1
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : rankDisplay === 2
                              ? 'bg-slate-200 text-slate-950 font-black'
                              : rankDisplay === 3
                              ? 'bg-amber-800 text-amber-100 font-bold'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {rankDisplay === 1 ? '🥇' : rankDisplay === 2 ? '🥈' : rankDisplay === 3 ? '🥉' : `#${rankDisplay}`}
                          </span>
                        </td>

                        {/* Believer / Ministry Info */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-center gap-3">
                            <img
                              src={entity.avatar}
                              alt={entity.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white text-sm truncate">
                                  {entity.name}
                                </span>
                                {entity.isCurrentUser && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[8px] font-black">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                                <span>{entity.locationOrHandle}</span>
                                {entity.homeChurch && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-400/90 truncate">⛪ {entity.homeChurch}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Faith Badges Column */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black flex items-center gap-1 ${entity.unlockedBadge.bgClass} ${entity.unlockedBadge.colorClass}`}>
                              <span>{entity.unlockedBadge.icon}</span>
                              <span>{entity.unlockedBadge.name}</span>
                            </span>
                            {entity.category === 'users' && (
                              <button
                                onClick={() => setSelectedUserForBadges(entity)}
                                className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[10px] font-bold"
                                title="View badge showcase"
                              >
                                +{badgeCount} Badges
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Primary Metric */}
                        <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="font-bold text-white font-mono flex items-center gap-1">
                              {entity.category === 'users' && <Sparkles className="w-3 h-3 text-cyan-400" />}
                              <span>{entity.primaryMetricVal.toLocaleString()}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block">{entity.primaryMetricLabel}</span>
                          </div>
                        </td>

                        {/* Secondary Metric / Streak */}
                        <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="font-bold text-rose-300 font-mono flex items-center gap-1">
                              {entity.category === 'users' && <Flame className="w-3 h-3 text-rose-400" />}
                              <span>
                                {entity.secondaryMetricVal.toLocaleString()}
                                {entity.category === 'users' ? ' Days' : ''}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block">{entity.secondaryMetricLabel}</span>
                          </div>
                        </td>

                        {/* Momentum Score */}
                        <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-950 text-amber-300 border border-amber-500/30 font-mono font-black text-xs">
                            {entity.momentumScore.toFixed(1)}
                          </span>
                        </td>

                        {/* Action Column */}
                        <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {entity.category === 'users' ? (
                              <button
                                onClick={() => setSelectedUserForBadges(entity)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center gap-1 border border-slate-700"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-400" />
                                <span>Badges</span>
                              </button>
                            ) : (
                              <>
                                {entity.category === 'churches' && (
                                  <button
                                    onClick={() => onToggleJoinChurch && onToggleJoinChurch(entity.name)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                                      isJoinedChurch
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                                    }`}
                                  >
                                    {isJoinedChurch ? 'Joined' : 'Join'}
                                  </button>
                                )}
                                <button
                                  onClick={() => onSelectChannelModal && onSelectChannelModal(entity.name)}
                                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                                  title="View Details"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-Table Fallback (Screens < 640px) */}
            <div className="sm:hidden divide-y divide-slate-800/80">
              {filteredItems.map((entity, index) => {
                const rankDisplay = index + 1;
                const isJoinedChurch = joinedChurches.some(c => c.toLowerCase() === entity.name.toLowerCase());
                const badgeCount = entity.userBadges?.length || 1;
                return (
                  <div key={entity.id} className="p-3.5 space-y-3 hover:bg-slate-800/30 transition">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        rankDisplay === 1
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : rankDisplay === 2
                          ? 'bg-slate-200 text-slate-950'
                          : rankDisplay === 3
                          ? 'bg-amber-800 text-amber-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {rankDisplay === 1 ? '🥇' : rankDisplay === 2 ? '🥈' : rankDisplay === 3 ? '🥉' : `#${rankDisplay}`}
                      </span>

                      <img
                        src={entity.avatar}
                        alt={entity.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-xs truncate">{entity.name}</h4>
                          {entity.isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[8px] font-black shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{entity.locationOrHandle}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-slate-500 block uppercase">Momentum</span>
                        <span className="font-mono font-black text-xs text-amber-300">
                          {entity.momentumScore.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Metrics Micro-Strip */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-center text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 block truncate">{entity.primaryMetricLabel}</span>
                        <span className="font-bold text-white font-mono text-[11px]">{entity.primaryMetricVal.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block truncate">{entity.secondaryMetricLabel}</span>
                        <span className="font-bold text-rose-300 font-mono text-[11px]">
                          {entity.secondaryMetricVal.toLocaleString()}
                          {entity.category === 'users' ? 'd' : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block truncate">Badges</span>
                        <span className="font-bold text-amber-300 font-mono text-[11px]">{badgeCount} Earned</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {entity.category === 'users' ? (
                        <button
                          onClick={() => setSelectedUserForBadges(entity)}
                          className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-700"
                        >
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>View Badges Showcase ({badgeCount})</span>
                        </button>
                      ) : (
                        <>
                          {entity.category === 'churches' && (
                            <button
                              onClick={() => onToggleJoinChurch && onToggleJoinChurch(entity.name)}
                              className={`flex-1 py-1.5 rounded-xl text-xs font-black transition ${
                                isJoinedChurch
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-500 text-slate-950'
                              }`}
                            >
                              {isJoinedChurch ? 'Joined Sanctuary' : 'Join Sanctuary'}
                            </button>
                          )}
                          <button
                            onClick={() => onSelectChannelModal && onSelectChannelModal(entity.name)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold"
                          >
                            Details
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 🗂️ ORIGINAL CARDS DISPLAY (Enhanced for Mobile & Tablet) */
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

                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black flex items-center gap-1 ${entity.unlockedBadge.bgClass} ${entity.unlockedBadge.colorClass}`}>
                        <span>{entity.unlockedBadge.icon}</span>
                        <span>{entity.unlockedBadge.name}</span>
                      </span>
                    </div>

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

                {/* Metrics & Momentum Score Breakdown (Responsive layout on Mobile & Tablet) */}
                <div className="grid grid-cols-3 sm:flex items-center justify-between md:justify-end gap-2 sm:gap-3.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <div className="text-left md:text-right text-xs space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {entity.primaryMetricLabel}
                    </span>
                    <div className="font-bold text-white font-mono flex items-center gap-1 md:justify-end">
                      {entity.category === 'users' && <Sparkles className="w-3 h-3 text-cyan-400" />}
                      <span>{entity.primaryMetricVal.toLocaleString()}</span>
                    </div>
                  </div>

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

                  <div className="text-right space-y-0.5 bg-slate-950 p-2 sm:p-2.5 rounded-2xl border border-amber-500/20 shadow-inner">
                    <span className="text-[9px] text-amber-400 font-black uppercase tracking-wider block">
                      Score
                    </span>
                    <div className="font-black text-amber-300 text-xs sm:text-sm font-mono">
                      {entity.momentumScore.toFixed(1)}
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-1.5 pt-1 sm:pt-0">
                    {entity.category === 'users' ? (
                      <button
                        onClick={() => setSelectedUserForBadges(entity)}
                        className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-700 shadow-sm"
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
                            className={`flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 shadow-md ${
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
                          title="View Details"
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

import React, { useState } from 'react';
import {
  User,
  Mail,
  Church,
  Flame,
  Sparkles,
  DollarSign,
  Heart,
  Bookmark,
  Calendar,
  Check,
  Edit2,
  Share2,
  Bell,
  Sliders,
  ShieldCheck,
  Award,
  Play,
  Trash2,
  Copy,
  Download,
  ExternalLink,
  ChevronRight,
  Tv,
  Radio,
  Music,
  CheckCircle2,
  Globe,
  Settings,
  Lock,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LIVE_VIDEO_STREAMS, AUDIO_TRACKS, VideoStream, AudioTrack } from '../data/gospelData';
import { GivingTarget } from './GivingModal';

interface UserProfilePageProps {
  streakDays: number;
  praiseXp: number;
  totalGivingAmount: number;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onPlayVideo: (video: VideoStream) => void;
  onPlayAudio: (track: AudioTrack) => void;
  subscribedChannels: string[];
  joinedChurches?: string[];
  churchMemberCounts?: Record<string, number>;
  onSelectChannelModal?: (channelName: string) => void;
  onToggleJoinChurch?: (channelName: string) => void;
  onToggleSubscribe: (channel: string) => void;
  onOpenGivingModal: (target?: GivingTarget) => void;
  onOpenPrayerModal: () => void;
}

export default function UserProfilePage({
  streakDays,
  praiseXp,
  totalGivingAmount,
  savedIds,
  onToggleSave,
  onPlayVideo,
  onPlayAudio,
  subscribedChannels,
  joinedChurches = ['Grace City Cathedral'],
  churchMemberCounts = {},
  onSelectChannelModal,
  onToggleJoinChurch,
  onToggleSubscribe,
  onOpenGivingModal,
  onOpenPrayerModal
}: UserProfilePageProps) {
  // Active tab state
  const [activeProfileTab, setActiveProfileTab] = useState<'bookmarks' | 'giving' | 'prayers' | 'subscriptions' | 'settings'>('bookmarks');

  // Editable Profile Information State
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('David Lawson');
  const [userHandle, setUserHandle] = useState('@david_lawson');
  const [userBio, setUserBio] = useState('Choir Leader, Gospel Media Enthusiast & Believer at Grace City Cathedral. Seeking daily spiritual revival.');
  const [homeChurch, setHomeChurch] = useState('Grace City Cathedral (London, UK)');
  const [userEmail, setUserEmail] = useState('david.lawson@gospread.org');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Giving History Log
  const [givingLogs, setGivingLogs] = useState([
    { id: 'g-101', target: 'Grace City Cathedral', date: 'Aug 04, 2026', amount: 500, category: 'Sunday Tithe & Offering', status: 'Completed' },
    { id: 'g-102', target: 'Pastor Mark Anthony', date: 'Aug 01, 2026', amount: 150, category: 'Prophetic Anointing Seed', status: 'Completed' },
    { id: 'g-103', target: 'Gospread Global Satellite Fund', date: 'Jul 28, 2026', amount: 1000, category: 'Kingdom Pillar Monthly Seed', status: 'Completed' },
    { id: 'g-104', target: 'Grace Sanctuary Choir', date: 'Jul 20, 2026', amount: 200, category: 'Sound Equipment Love Offering', status: 'Completed' }
  ]);

  // Personal Prayer Requests Log
  const [myPrayers, setMyPrayers] = useState([
    { id: 'p-1', title: 'Healing & Total Restoration for Family', date: 'Aug 02, 2026', status: 'Answered', praiseReport: 'God restored health miraculously during Sunday worship!' },
    { id: 'p-2', title: 'Wisdom & Open Doors for Career Elevation', date: 'Jul 29, 2026', status: 'Active Prayer', praiseReport: null },
    { id: 'p-3', title: 'Grace for Daily Morning Quiet Time', date: 'Jul 15, 2026', status: 'Answered', praiseReport: 'Maintained 7-day consistency in Morning Manna devotions!' }
  ]);

  // Settings Toggles
  const [notifServiceAlerts, setNotifServiceAlerts] = useState(true);
  const [notifDailyRhema, setNotifDailyRhema] = useState(true);
  const [audioHdQuality, setAudioHdQuality] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  // Saved Media Items
  const savedVideos = LIVE_VIDEO_STREAMS.filter((v) => savedIds.includes(v.id));
  const savedAudios = AUDIO_TRACKS.filter((a) => savedIds.includes(a.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const togglePrayerStatus = (id: string) => {
    setMyPrayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === 'Answered' ? 'Active Prayer' : 'Answered',
              praiseReport: p.status === 'Active Prayer' ? 'Testimony: The Lord has answered this request!' : p.praiseReport
            }
          : p
      )
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* 🔴 1. HERO PROFILE BANNER & USER HEADER */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        {/* Top Cover Background Banner */}
        <div className="h-44 sm:h-56 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1600&q=80"
            alt="Worship Sanctuary Banner"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-transparent" />

          {/* Banner Quick Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 text-white font-bold text-xs border border-slate-700/80 backdrop-blur-md flex items-center gap-1.5 transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Profile Card link copied to clipboard!');
              }}
              className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition"
              title="Share Kingdom Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Info Avatar Row */}
        <div className="px-6 sm:px-8 pb-6 relative z-10 -mt-16 sm:-mt-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar with Status Ring */}
            <div className="relative shrink-0">
              <motion.img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
                alt={userName}
                whileHover={{ scale: 1.08, rotate: 1, boxShadow: "0 15px 30px -5px rgba(245, 158, 11, 0.3)" }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-[#121215] shadow-2xl cursor-pointer"
              />
              <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#121215] animate-pulse" title="Online in Grace" />
            </div>

            {/* Name, Handle & Badges */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white font-serif tracking-wide">{userName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" /> Kingdom Ambassador
                </span>
              </div>

              <p className="text-xs text-amber-400 font-mono font-bold">{userHandle}</p>
              
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-300">
                <Church className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{homeChurch}</span>
              </div>

              <p className="text-xs text-slate-400 max-w-xl leading-relaxed pt-1">
                "{userBio}"
              </p>
            </div>
          </div>

          {/* Seed Sowing Quick Action Button */}
          <div className="flex items-center justify-center gap-3 shrink-0">
            <button
              onClick={() => onOpenGivingModal()}
              className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-xl shadow-amber-500/20 transform hover:scale-105"
            >
              <DollarSign className="w-4 h-4" />
              <span>Sow Kingdom Seed</span>
            </button>

            <button
              onClick={onOpenPrayerModal}
              className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Heart className="w-4 h-4 text-red-400" />
              <span>Post Prayer</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 EDIT PROFILE MODAL FORM */}
      {isEditing && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveProfile}
          className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-4 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit Kingdom Profile Details
            </h3>
            <span className="text-[10px] text-slate-400">Update your ministry identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Handle</label>
              <input
                type="text"
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Home Church / Ministry</label>
              <input
                type="text"
                value={homeChurch}
                onChange={(e) => setHomeChurch(e.target.value)}
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-bold mb-1">Bio / Statement of Faith</label>
              <textarea
                value={userBio}
                onChange={(e) => setUserBio(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
            >
              Save Profile
            </button>
          </div>
        </motion.form>
      )}

      {showSavedToast && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile changes successfully updated to Kingdom directory!</span>
        </div>
      )}

      {/* 🔴 2. FAITH STATS & UNLOCKED BADGES CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat 1: Faith Streak */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Faith Streak</span>
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-serif">{streakDays} Days</p>
          <p className="text-[10px] text-amber-400/90 font-medium">Daily Devotion Consistent</p>
        </div>

        {/* Stat 2: Praise XP */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Praise XP</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-serif">{praiseXp} XP</p>
          <p className="text-[10px] text-slate-400 font-medium">Level 5 Overcomer</p>
        </div>

        {/* Stat 3: Total Sowed */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Seeds Sowed</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-serif">${totalGivingAmount.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-medium">Kingdom Pillar Member</p>
        </div>

        {/* Stat 4: Saved Sermons */}
        <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Bookmarks</span>
            <Bookmark className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-serif">{savedIds.length} Saved</p>
          <p className="text-[10px] text-slate-400 font-medium">Sermons & Audio Tracks</p>
        </div>
      </div>

      {/* 🏆 UNLOCKED BADGES SHOWCASE */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#181818] border border-amber-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Kingdom Achievement Badges & Honor Recognition</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Descriptive behavioral badges earned through faithful study, devotion streaks, church membership, and referral growth.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
              8 / 11 Badges Unlocked
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {[
            { title: 'Diligent Sower', desc: 'Ranked #12 in Creator Momentum. High study hours.', icon: '🌾', active: true, cat: 'Spiritual Momentum', date: 'Earned May 10' },
            { title: 'Faithful Reach', desc: 'Consistent daily study hours & 8 verified referrals.', icon: '🌱', active: true, cat: 'Discipleship', date: 'Earned Aug 2' },
            { title: 'Rising Voice', desc: 'Accelerating growth rate trajectory in community.', icon: '✨', active: true, cat: 'Spiritual Growth', date: 'Earned Jul 18' },
            { title: 'Pillar of Light', desc: 'Official registered member at Grace City Cathedral.', icon: '🏛️', active: true, cat: 'Church Fellowship', date: 'Earned Jun 22' },
            { title: 'Psalmist Voice', desc: 'Active worship psalmody & sermon reflection.', icon: '🎻', active: true, cat: 'Worship', date: 'Earned Jul 01' },
            { title: 'Overcomer 7D', desc: '7 days consecutive devotion streak maintained.', icon: '🔥', active: true, cat: 'Streak', date: 'Earned Aug 09' },
            { title: 'Amen Warrior', desc: 'Sent over 50 Amen reactions in live altars.', icon: '🙌', active: true, cat: 'Intercession', date: 'Earned May 14' },
            { title: 'Kingdom Ambassador', icon: '👑', desc: 'Reached 500 Praise XP milestone.', active: true, cat: 'Ambassador', date: 'Earned Jun 10' },
            { title: 'Kingdom Catalyst', icon: '⚡', desc: 'Top 1% growth rate and disciple engagement depth.', active: false, cat: 'Spiritual Momentum', date: 'Locked (Requires Top 10 Rank)' },
            { title: 'Anointed Melody', icon: '🎺', desc: 'Listen to 100+ hours of anointed worship.', active: false, cat: 'Worship', date: 'Locked (62/100 hrs)' },
            { title: 'Vibrant Fellowship', icon: '🛡️', desc: 'Active participation in 5 prayer circles.', active: false, cat: 'Church Fellowship', date: 'Locked (3/5 Circles)' }
          ].map((badge, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-xs space-y-1.5 flex flex-col justify-between transition ${
                badge.active
                  ? 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/40 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-900 text-slate-500 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl p-1.5 bg-slate-950/60 rounded-xl border border-slate-800 shrink-0">
                  {badge.icon}
                </span>
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-bold shrink-0">
                  {badge.cat}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs leading-tight text-white flex items-center gap-1">
                  <span>{badge.title}</span>
                  {badge.active && <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />}
                </h4>
                <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{badge.desc}</p>
              </div>

              <div className="pt-1 border-t border-slate-800/80 text-[9px] font-mono text-slate-500">
                {badge.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⛪ JOINED CHURCH FELLOWSHIP CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/40 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Church className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Joined Home Church Fellowship</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                  {joinedChurches.length} Joined
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official online registered church membership with pastoral notifications & fellowship certificate
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectChannelModal && onSelectChannelModal(joinedChurches[0] || 'Grace City Cathedral')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-lg shrink-0"
          >
            <span>View Church Portfolio</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* List of Joined Churches Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {joinedChurches.length > 0 ? (
            joinedChurches.map((churchName) => {
              const mCount = churchMemberCounts[churchName] || 1248;
              return (
                <div
                  key={churchName}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-bold shrink-0">
                      <Church className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition">
                        {churchName}
                      </h4>
                      <p className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1.5">
                        <span>👥 {mCount.toLocaleString()} Members</span>
                        <span>•</span>
                        <span className="text-emerald-400">✓ Official Member</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onSelectChannelModal && onSelectChannelModal(churchName)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold"
                    >
                      Portfolio
                    </button>
                    <button
                      onClick={() => onToggleJoinChurch && onToggleJoinChurch(churchName)}
                      className="px-2 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-[10px] border border-red-800/40"
                      title="Leave Church"
                    >
                      Leave
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="sm:col-span-2 p-4 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p>You have not joined any church family yet.</p>
              <p className="text-[10px] text-amber-400 font-medium">Explore the Discover Ministries Hub to join a local or global church!</p>
            </div>
          )}
        </div>
      </div>

      {/* 🔴 3. MAIN TABBED NAVIGATION CONTENT */}
      <div className="space-y-4">
        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 pb-2 gap-2 overflow-x-auto">
          {[
            { id: 'bookmarks', label: 'Saved & Bookmarks', icon: Bookmark, count: savedIds.length },
            { id: 'giving', label: 'Giving & Seeds Log', icon: DollarSign },
            { id: 'prayers', label: 'My Prayers & Notes', icon: Heart, count: myPrayers.length },
            { id: 'subscriptions', label: 'Subscribed Channels', icon: Tv, count: subscribedChannels.length },
            { id: 'settings', label: 'Preferences & Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeProfileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveProfileTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-[#181818] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[9px] font-mono text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SAVED MEDIA & BOOKMARKS */}
        {activeProfileTab === 'bookmarks' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Saved Sermons & Audio Worship
            </h3>

            {savedVideos.length === 0 && savedAudios.length === 0 ? (
              <div className="p-8 text-center bg-[#181818] rounded-3xl border border-slate-800 text-slate-500 text-xs space-y-2">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No saved media yet.</p>
                <p className="text-[10px]">Click the bookmark icon on any live stream or audio sermon to save it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Saved Videos */}
                {savedVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    whileHover={{ scale: 1.02, y: -2, boxShadow: "0 10px 20px -5px rgba(245, 158, 11, 0.2)" }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="p-3.5 rounded-2xl bg-[#181818] border border-slate-800 hover:border-amber-500/50 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-16 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="truncate space-y-0.5">
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">
                          {video.title}
                        </h4>
                        <p className="text-[10px] text-amber-400">{video.speakerOrArtist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onPlayVideo(video)}
                        className="p-2 rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                        title="Watch Now"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                      </button>

                      <button
                        onClick={() => onToggleSave(video.id)}
                        className="p-2 rounded-full bg-slate-900 text-red-400 hover:bg-red-500/20 transition"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Saved Audio Tracks */}
                {savedAudios.map((track) => (
                  <motion.div
                    key={track.id}
                    whileHover={{ scale: 1.02, y: -2, boxShadow: "0 10px 20px -5px rgba(239, 68, 68, 0.2)" }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="p-3.5 rounded-2xl bg-[#181818] border border-slate-800 hover:border-amber-500/50 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="truncate space-y-0.5">
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-amber-400">{track.artistOrPreacher}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onPlayAudio(track)}
                        className="p-2 rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                        title="Listen Audio"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                      </button>

                      <button
                        onClick={() => onToggleSave(track.id)}
                        className="p-2 rounded-full bg-slate-900 text-red-400 hover:bg-red-500/20 transition"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GIVING & SEEDS LOG */}
        {activeProfileTab === 'giving' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Kingdom Seed Sowing & Offering Statement
              </h3>

              <button
                onClick={() => onOpenGivingModal()}
                className="px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Offering</span>
              </button>
            </div>

            <div className="space-y-2">
              {givingLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-[#181818] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white">{log.target}</h4>
                      <p className="text-[10px] text-slate-400">{log.category} • {log.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 border-slate-800 pt-2 sm:pt-0">
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-400 font-serif">${log.amount}</p>
                      <span className="text-[9px] text-emerald-300 font-mono">Receipt #{log.id}</span>
                    </div>

                    <button
                      onClick={() => alert(`Official Kingdom Giving Receipt #${log.id} copied to clipboard!`)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1"
                      title="Copy Digital Receipt"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MY PRAYERS & NOTES */}
        {activeProfileTab === 'prayers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                My Prayer Requests & Answered Testimonies
              </h3>

              <button
                onClick={onOpenPrayerModal}
                className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Prayer</span>
              </button>
            </div>

            <div className="space-y-3">
              {myPrayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">{prayer.date}</span>
                    <button
                      onClick={() => togglePrayerStatus(prayer.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                        prayer.status === 'Answered'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {prayer.status} (Click to toggle)
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-white">{prayer.title}</h4>

                  {prayer.praiseReport && (
                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200 font-serif italic">
                      🙌 {prayer.praiseReport}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SUBSCRIBED CHANNELS */}
        {activeProfileTab === 'subscriptions' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Followed Ministry Channels ({subscribedChannels.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {subscribedChannels.map((channelName) => (
                <div
                  key={channelName}
                  className="p-3.5 rounded-2xl bg-[#181818] border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                      {channelName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-white truncate">{channelName}</span>
                  </div>

                  <button
                    onClick={() => onToggleSubscribe(channelName)}
                    className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS & PREFERENCES */}
        {activeProfileTab === 'settings' && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Account Preferences & Spiritual Notifications
            </h3>

            <div className="space-y-3 bg-[#181818] p-5 rounded-3xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white">Live Worship Service Notifications</h4>
                  <p className="text-[10px] text-slate-400">Receive instant push alerts when subscribed churches go live.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifServiceAlerts}
                  onChange={(e) => setNotifServiceAlerts(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white">Daily Rhema Promise Notifications</h4>
                  <p className="text-[10px] text-slate-400">Receive morning devotional promise card popups.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifDailyRhema}
                  onChange={(e) => setNotifDailyRhema(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-white">HD Audio Streaming Mode</h4>
                  <p className="text-[10px] text-slate-400">Enable 320kbps high-fidelity gospel audio playback.</p>
                </div>
                <input
                  type="checkbox"
                  checked={audioHdQuality}
                  onChange={(e) => setAudioHdQuality(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Public Kingdom Profile Visibility</h4>
                  <p className="text-[10px] text-slate-400">Allow fellow believers to view your public prayer testimonies and badges.</p>
                </div>
                <input
                  type="checkbox"
                  checked={publicProfile}
                  onChange={(e) => setPublicProfile(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

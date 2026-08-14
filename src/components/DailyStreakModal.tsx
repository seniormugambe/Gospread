import React, { useState } from 'react';
import {
  X,
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Gift,
  Share2,
  TrendingUp,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FAITH_BADGES, FaithBadge } from '../data/gospelData';

interface DailyStreakModalProps {
  streakDays: number;
  praiseXp: number;
  onClose: () => void;
  onClaimDailyReward: (xpGained: number) => void;
}

export default function DailyStreakModal({
  streakDays,
  praiseXp,
  onClose,
  onClaimDailyReward
}: DailyStreakModalProps) {
  const [claimedToday, setClaimedToday] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIndex = 4; // Friday

  const level = Math.floor(praiseXp / 300) + 1;
  const xpInCurrentLevel = praiseXp % 300;
  const xpForNextLevel = 300;
  const levelProgress = Math.min(100, Math.round((xpInCurrentLevel / xpForNextLevel) * 100));

  const handleClaim = () => {
    if (claimedToday) return;
    setClaimedToday(true);
    const rewardXp = 100;
    onClaimDailyReward(rewardXp);
    setToastMsg(`🎉 Received +${rewardXp} Praise XP! 7-Day Grace Streak Maintained!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-lg bg-[#0d0d0e] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl relative text-white flex flex-col max-h-[90vh]"
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 p-5 text-slate-950 relative overflow-hidden shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950/20 rounded-2xl backdrop-blur-md flex items-center justify-center">
              <Flame className="w-8 h-8 text-slate-950 fill-amber-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-widest bg-slate-950/10 px-2 py-0.5 rounded">
                  Spiritual Discipline & Momentum
                </span>
              </div>
              <h2 className="text-2xl font-black font-serif tracking-tight mt-0.5">
                {streakDays}-Day Grace Streak 🔥
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Level & XP Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Level {level} Kingdom Ambassador</span>
              </div>
              <span className="font-mono text-slate-400">
                {xpInCurrentLevel} / {xpForNextLevel} Praise XP
              </span>
            </div>

            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full"
              />
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Gain XP by watching daily streams, sending Amens, & studying the Rhema word.
            </p>
          </div>

          {/* 7-Day Calendar Streak Check-in */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>7-Day Daily Check-in Streak</span>
              </h3>
              <span className="text-[10px] text-slate-400">Resets every Sunday midnight</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {daysOfWeek.map((day, idx) => {
                const isPassed = idx < currentDayIndex;
                const isToday = idx === currentDayIndex;
                const isUpcoming = idx > currentDayIndex;

                return (
                  <div
                    key={day}
                    className={`p-2 rounded-2xl text-center border flex flex-col items-center justify-between min-h-[72px] transition ${
                      isToday
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/30'
                        : isPassed
                        ? 'bg-slate-900 border-slate-800 text-slate-300'
                        : 'bg-slate-950 border-slate-900 text-slate-600'
                    }`}
                  >
                    <span className="text-[10px] font-bold">{day}</span>

                    <div className="my-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isToday ? (
                        <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <span className="text-[9px] font-mono font-bold">
                      +{ (idx + 1) * 20 } XP
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleClaim}
              disabled={claimedToday}
              className={`w-full py-3 rounded-full font-bold text-xs transition shadow-lg flex items-center justify-center gap-2 ${
                claimedToday
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              }`}
            >
              {claimedToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Today's Grace Reward Claimed (+100 XP)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Claim Today's 100 Praise XP Blessing</span>
                </>
              )}
            </button>
          </div>

          {/* Faith & Momentum Badges Gallery */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Kingdom Achievements & Momentum Badges</span>
              </h3>
              <span className="text-[10px] text-amber-400 font-mono font-bold">
                7 / 11 Unlocked
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {[
                { name: 'Diligent Sower', icon: '🌾', desc: 'Ranked #12 in Creator Momentum. High study time.', unlocked: true, cat: 'Momentum' },
                { name: 'Faithful Reach', icon: '🌱', desc: 'Consistent daily study hours & active referrals.', unlocked: true, cat: 'Momentum' },
                { name: 'Rising Voice', icon: '✨', desc: 'Accelerating spiritual growth rate trajectory.', unlocked: true, cat: 'Momentum' },
                { name: 'Pillar of Light', icon: '🏛️', desc: 'Official registered fellowship member at church.', unlocked: true, cat: 'Church' },
                { name: 'Psalmist Voice', icon: '🎻', desc: 'Psalms & worship song meditation unlocked.', unlocked: true, cat: 'Psalmody' },
                { name: '7-Day Grace Streak', icon: '🔥', desc: 'Log in and praise for 7 consecutive days', unlocked: true, cat: 'Streak' },
                { name: 'Amen Warrior', icon: '🙌', desc: 'Send over 50 Amen reactions in live streams', unlocked: true, cat: 'Streak' },
                { name: 'Kingdom Ambassador', icon: '👑', desc: 'Reach 500 Praise XP milestone', unlocked: true, cat: 'Streak' },
                { name: 'Kingdom Catalyst', icon: '⚡', desc: 'Top 1% growth rate and disciple engagement depth', unlocked: false, cat: 'Momentum' },
                { name: 'Anointed Melody', icon: '🎺', desc: 'Listen to 100+ hours of anointed gospel worship', unlocked: false, cat: 'Psalmody' },
                { name: 'Vibrant Fellowship', icon: '🛡️', desc: 'Active participation in 5 prayer circles', unlocked: false, cat: 'Church' }
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition ${
                    badge.unlocked
                      ? 'bg-slate-900/90 border-amber-500/40 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-900 text-slate-500 opacity-50'
                  }`}
                >
                  <div className="text-xl p-1.5 rounded-xl bg-slate-800/80 shrink-0">
                    {badge.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-[11px] font-bold text-white truncate flex items-center gap-1">
                        <span>{badge.name}</span>
                        {badge.unlocked && (
                          <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0 inline" />
                        )}
                      </h4>
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono shrink-0">
                        {badge.cat}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-3 bg-emerald-500 text-slate-950 font-bold text-xs text-center shrink-0"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

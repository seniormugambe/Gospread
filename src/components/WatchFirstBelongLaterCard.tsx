import React, { useState } from 'react';
import { 
  Compass, 
  Play, 
  Radio, 
  MessageSquareHeart, 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Tv, 
  Flame,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserSession } from './AuthModal';

interface WatchFirstBelongLaterCardProps {
  userSession: UserSession;
  watchCount: number;
  followCount: number;
  streakDays: number;
  onOpenAuthPage: (mode?: 'signin' | 'signup') => void;
  onNavigateTab?: (tab: 'platform' | 'discover' | 'community' | 'profile' | 'create') => void;
  onDismiss?: () => void;
}

export default function WatchFirstBelongLaterCard({
  userSession,
  watchCount,
  followCount,
  streakDays,
  onOpenAuthPage,
  onNavigateTab,
  onDismiss
}: WatchFirstBelongLaterCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const isLoggedIn = userSession.isLoggedIn;

  // Stages calculation for viewer progression
  const stages = [
    {
      id: 'discover',
      step: '01',
      title: 'Discover',
      desc: 'Explore live broadcasts, sermons & 24/7 radio freely',
      icon: Compass,
      done: true,
      active: !isLoggedIn
    },
    {
      id: 'watch',
      step: '02',
      title: 'Watch',
      desc: `${watchCount > 0 ? `${watchCount} services watched` : 'Zero friction video & audio streams'}`,
      icon: Play,
      done: watchCount > 0,
      active: !isLoggedIn && watchCount > 0
    },
    {
      id: 'enjoy',
      step: '03',
      title: 'Enjoy',
      desc: '24/7 Praise Radio, Rhema promise cards & devotionals',
      icon: Radio,
      done: true,
      active: !isLoggedIn
    },
    {
      id: 'engage',
      step: '04',
      title: 'Engage',
      desc: `${streakDays > 0 ? `${streakDays}-day grace streak active` : 'Live chat amens, prayer requests & praise XP'}`,
      icon: MessageSquareHeart,
      done: streakDays > 0,
      active: !isLoggedIn && streakDays > 0
    },
    {
      id: 'follow',
      step: '05',
      title: 'Follow',
      desc: `${followCount > 0 ? `Following ${followCount} sanctuaries` : '1-click follow any ministry with no sign-in required'}`,
      icon: UserCheck,
      done: followCount > 0,
      active: !isLoggedIn && followCount > 0
    },
    {
      id: 'belong',
      step: '06',
      title: 'Belong',
      desc: isLoggedIn ? 'Fellowship member • Cloud synced' : 'Create account when ready • Earned, never demanded',
      icon: ShieldCheck,
      done: isLoggedIn,
      active: isLoggedIn
    }
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-950 to-black border border-amber-500/25 p-4 sm:p-5 shadow-2xl transition-all duration-300">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -ml-20 -mb-20 w-60 h-60 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                Gospread Principle
              </span>
              <span className="w-1 h-1 rounded-full bg-stone-700" />
              <span className="text-[10px] text-stone-400 font-medium">
                Viewer Experience
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white font-serif tracking-tight flex items-center gap-2">
              <span>Watch first.</span>
              <span className="text-amber-300 italic font-serif">Belong later.</span>
            </h2>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {!isLoggedIn ? (
            <button
              onClick={() => onOpenAuthPage('signup')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <span>Join Fellowship</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Belonging Active</span>
            </span>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {onDismiss && (
            <button
              onClick={() => {
                setIsDismissed(true);
                onDismiss();
              }}
              className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 pt-3 space-y-4"
          >
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
              You are the core worshipping audience. We believe in earning your fellowship rather than demanding your registration. Enjoy every sermon, radio station, and live altar without walls—create an account only when you want to belong permanently.
            </p>

            {/* 6-Stage Visual Journey Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              {stages.map((stage) => {
                const IconComponent = stage.icon;
                return (
                  <div
                    key={stage.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      stage.done
                        ? 'bg-stone-900/90 border-amber-500/40 shadow-sm'
                        : 'bg-stone-950/60 border-stone-800/80 text-stone-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono font-bold text-stone-400 tracking-wider">
                        {stage.step}
                      </span>
                      {stage.done ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-stone-700" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mb-1">
                      <IconComponent className={`w-3.5 h-3.5 shrink-0 ${stage.done ? 'text-amber-300' : 'text-stone-400'}`} />
                      <h4 className="text-xs font-bold text-white tracking-tight truncate">
                        {stage.title}
                      </h4>
                    </div>

                    <p className="text-[10px] text-stone-400 leading-snug line-clamp-2">
                      {stage.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Guest Summary & Friendly Invitation */}
            {!isLoggedIn ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-xs">
                <div className="flex items-center gap-2.5 text-stone-300">
                  <div className="flex items-center gap-1.5 text-amber-400 font-mono font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Guest Worshipper</span>
                  </div>
                  <span className="text-stone-400">•</span>
                  <span>
                    Your watch history ({watchCount}) and followed sanctuaries ({followCount}) are stored safely on this device.
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenAuthPage('signin')}
                    className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onOpenAuthPage('signup')}
                    className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition flex items-center gap-1"
                  >
                    <span>Belong (Create Free Account)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Welcome back, <strong className="text-white">{userSession.fullName || userSession.username}</strong>! You belong to Gospread. All your ministries and prayer journals are safely synced in the cloud.
                  </span>
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('profile')}
                    className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition shrink-0"
                  >
                    View Sanctuary Profile
                  </button>
                )}
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

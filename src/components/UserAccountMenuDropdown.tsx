import React, { useRef, useEffect } from 'react';
import {
  User,
  Settings,
  Flame,
  Sparkles,
  History,
  DollarSign,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  ChevronRight,
  Database,
  Tv,
  Radio,
  BookOpen,
  MessageSquareHeart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserSession } from './AuthModal';

interface UserAccountMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  streakDays: number;
  praiseXp: number;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenCommunity?: () => void;
  onOpenHistory: () => void;
  onOpenGiving: () => void;
  onOpenDjango: () => void;
  onOpenAuth: () => void;
  onOpenAuthPage?: (mode?: 'signin' | 'signup') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const UserAccountMenuDropdown: React.FC<UserAccountMenuDropdownProps> = ({
  isOpen,
  onClose,
  userSession,
  streakDays,
  praiseXp,
  onOpenSettings,
  onOpenProfile,
  onOpenCommunity,
  onOpenHistory,
  onOpenGiving,
  onOpenDjango,
  onOpenAuth,
  onOpenAuthPage,
  theme,
  onToggleTheme,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: 10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 top-full mt-2 w-72 bg-[#121214] border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden text-slate-200"
      >
        {/* User Identity Header */}
        <div className="p-4 bg-gradient-to-b from-slate-900/90 to-[#121214] border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={userSession.avatarUrl || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"}
                alt={userSession.fullName}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[8px] text-white">
                ✓
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{userSession.fullName}</h4>
              <p className="text-[11px] text-amber-400 font-mono truncate">@{userSession.username}</p>
              <p className="text-[10px] text-slate-400 truncate">{userSession.churchName || 'Grace City Cathedral'}</p>
            </div>
          </div>

          {/* Gamification Stats Banner */}
          <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-950/70 p-2 rounded-2xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 px-1.5 py-0.5">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <div>
                <div className="text-[11px] font-black text-amber-400">{streakDays} Days</div>
                <div className="text-[9px] text-slate-500 font-medium uppercase">Grace Streak</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 border-l border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <div>
                <div className="text-[11px] font-black text-amber-300">{praiseXp} XP</div>
                <div className="text-[9px] text-slate-500 font-medium uppercase">Praise XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Actions */}
        <div className="p-2 space-y-0.5 text-xs">
          
          {/* 1. Account Settings Button */}
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-amber-500/15 hover:text-amber-300 text-slate-200 font-bold transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                <Settings className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">Account Settings</div>
                <div className="text-[10px] text-slate-400 font-normal">Streaming, audio & privacy</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
          </button>

          {/* 2. Fellowship & Testimonies Community */}
          {onOpenCommunity && (
            <button
              onClick={() => {
                onClose();
                onOpenCommunity();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <MessageSquareHeart className="w-4 h-4" />
                </div>
                <span className="font-medium text-xs">Fellowship & Testimonies</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">COMMUNITY</span>
            </button>
          )}

          {/* 3. My Kingdom Profile */}
          <button
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:text-amber-400 transition">
                <User className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">My Kingdom Profile</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">YOU</span>
          </button>

          {/* 3. Watch History */}
          <button
            onClick={() => {
              onClose();
              onOpenHistory();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:text-amber-400 transition">
                <History className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">Watch History</span>
            </div>
          </button>

          {/* 4. Support & Kingdom Giving */}
          <button
            onClick={() => {
              onClose();
              onOpenGiving();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">Giving & Tithe Ledger</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">501(c)3</span>
          </button>

          {/* 5. Theme Toggle */}
          <button
            onClick={() => {
              onToggleTheme();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-800 text-pink-400 flex items-center justify-center">
                {theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-pink-400" />}
              </div>
              <span className="font-medium text-xs">Theme: {theme === 'light' ? 'Sky Pink & Blue' : 'Midnight Dark'}</span>
            </div>
          </button>

          <hr className="border-slate-800/90 my-1" />

          {/* 6. Django REST Backend Inspector */}
          <button
            onClick={() => {
              onClose();
              onOpenDjango();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-2xl hover:bg-slate-800/80 text-slate-400 hover:text-emerald-300 transition group text-[11px]"
          >
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Django Backend Status</span>
            </div>
            <span className="text-[9px] text-emerald-400 font-mono">v5.0 REST</span>
          </button>

          {/* 7. Switch Account / Sign Out / Auth Page */}
          {onOpenAuthPage && (
            <button
              onClick={() => {
                onClose();
                onOpenAuthPage('signin');
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-amber-500/15 text-slate-200 hover:text-amber-300 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-400 flex items-center justify-center transition">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Login & Sign Up Page</div>
                  <div className="text-[10px] text-slate-400 font-normal">Dedicated Sanctuary Portal</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-red-600/15 text-slate-300 hover:text-red-400 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-red-500/20 text-slate-400 group-hover:text-red-400 flex items-center justify-center transition">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">Switch Account / Sign Out</span>
            </div>
          </button>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserAccountMenuDropdown;

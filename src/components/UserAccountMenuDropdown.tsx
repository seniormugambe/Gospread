import React, { useRef, useEffect } from 'react';
import {
  User,
  Settings,
  History,
  DollarSign,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  ChevronRight,
  Database,
  Bookmark,
  Users,
  Heart,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserSession } from './AuthModal';

interface UserAccountMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  streakDays?: number;
  praiseXp?: number;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenCommunity?: () => void;
  onOpenHistory: () => void;
  onOpenGiving: () => void;
  onOpenFollowing?: () => void;
  onOpenSaved?: () => void;
  onOpenPrayer?: () => void;
  onOpenNotifications?: () => void;
  onOpenDjango: () => void;
  onOpenAuth: () => void;
  onOpenAuthPage?: (mode?: 'signin' | 'signup') => void;
  onLogout?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const UserAccountMenuDropdown: React.FC<UserAccountMenuDropdownProps> = ({
  isOpen,
  onClose,
  userSession,
  onOpenSettings,
  onOpenProfile,
  onOpenCommunity,
  onOpenHistory,
  onOpenGiving,
  onOpenFollowing,
  onOpenSaved,
  onOpenPrayer,
  onOpenNotifications,
  onOpenDjango,
  onOpenAuth,
  onOpenAuthPage,
  onLogout,
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

  const isLoggedIn = Boolean(userSession?.isLoggedIn && (userSession?.username || userSession?.fullName));

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
        <div className="p-4 bg-gradient-to-b from-slate-900/90 to-[#121214] border-b border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              {userSession.avatarUrl ? (
                <img
                  src={userSession.avatarUrl}
                  alt={userSession.fullName || userSession.username || 'User'}
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md"
                />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-base shadow-md">
                  {userSession.fullName ? (
                    userSession.fullName.charAt(0).toUpperCase()
                  ) : userSession.username ? (
                    userSession.username.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-5 h-5 text-amber-400" />
                  )}
                </div>
              )}
              {isLoggedIn && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[8px] text-white">
                  ✓
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">
                {isLoggedIn ? (userSession.fullName || userSession.username) : 'Guest Worshipper'}
              </h4>
              {isLoggedIn && userSession.username && (
                <p className="text-[11px] text-amber-400 font-mono truncate">@{userSession.username}</p>
              )}
              <p className="text-[10px] text-slate-400 truncate">
                {isLoggedIn ? (userSession.churchName || 'Faith Member') : 'Not signed in'}
              </p>
            </div>
          </div>

          {!isLoggedIn && (
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  onClose();
                  if (onOpenAuthPage) onOpenAuthPage('signin');
                  else onOpenAuth();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-amber-500/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Menu Actions: Following, Saved, History, Prayer, Notifications, Profile, Settings */}
        <div className="p-2 space-y-0.5 text-xs">
          
          {/* 1. Following */}
          <button
            onClick={() => {
              onClose();
              if (onOpenFollowing) onOpenFollowing();
              else onOpenProfile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:text-amber-400 transition">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">Following</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
          </button>

          {/* 2. Saved */}
          <button
            onClick={() => {
              onClose();
              if (onOpenSaved) onOpenSaved();
              else onOpenProfile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:text-amber-400 transition">
                <Bookmark className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">Saved Videos</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
          </button>

          {/* 3. History */}
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
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
          </button>

          {/* 4. Prayer */}
          <button
            onClick={() => {
              onClose();
              if (onOpenPrayer) onOpenPrayer();
              else if (onOpenCommunity) onOpenCommunity();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-800 text-red-400 flex items-center justify-center group-hover:text-red-300 transition">
                <Heart className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">Prayer Altar</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
          </button>

          {/* 5. Notifications */}
          <button
            onClick={() => {
              onClose();
              if (onOpenNotifications) onOpenNotifications();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:text-amber-400 transition">
                <Bell className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">Notifications</span>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">Active</span>
          </button>

          {/* 6. Profile */}
          <button
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                <User className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">Profile</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
          </button>

          {/* 7. Settings */}
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-800/80 text-slate-200 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center group-hover:text-amber-400 transition">
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-medium text-xs">Settings</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
          </button>

          {/* 8. Give inside user account */}
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
              <span className="font-medium text-xs">Giving &amp; Tithes</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">LEDGER</span>
          </button>

          {/* 9. Theme Toggle */}
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
              <span className="font-medium text-xs">Theme: {theme === 'light' ? 'Sunset 🌸' : 'Night'}</span>
            </div>
          </button>

          <hr className="border-slate-800/90 my-1" />

          {/* Django Backend Inspector */}
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

          {isLoggedIn ? (
            <button
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
                else onOpenAuth();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-red-600/15 text-slate-300 hover:text-red-400 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-red-500/20 text-slate-400 group-hover:text-red-400 flex items-center justify-center transition">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="font-medium text-xs">Sign Out</span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                if (onOpenAuthPage) onOpenAuthPage('signin');
                else onOpenAuth();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-amber-500/15 text-slate-200 hover:text-amber-300 transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-400 flex items-center justify-center transition">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">Sign In</div>
                  <div className="text-[10px] text-slate-400 font-normal">Sanctuary Account</div>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition" />
            </button>
          )}

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserAccountMenuDropdown;

import React from 'react';
import { 
  Compass, 
  User, 
  Sparkles, 
  Building2,
  MessageSquareHeart,
} from 'lucide-react';
import { motion } from 'motion/react';

interface MobileBottomNavProps {
  activeTab: 'platform' | 'generated' | 'create' | 'profile' | 'history' | 'discover' | 'community' | 'auth';
  setActiveTab: (tab: 'platform' | 'generated' | 'create' | 'profile' | 'history' | 'discover' | 'community' | 'auth') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  setActiveVideo: (video: null) => void;
  watchHistoryCount?: number;
  onOpenShorts: () => void;
  onOpenGiving?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  setActiveVideo,
  onOpenShorts,
}) => {
  const isHomeActive = activeTab === 'platform' && selectedCategory !== '24/7 Gospel Radio' && selectedCategory !== 'Podcasts';
  const isDiscoverActive = activeTab === 'discover';
  const isCommunityActive = activeTab === 'community';
  const isProfileActive = activeTab === 'profile' || activeTab === 'auth';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090a0d]/95 backdrop-blur-2xl border-t border-slate-800/90 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),8px)] flex items-center justify-around shadow-2xl select-none">
      {/* 1. Home / Feed */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setActiveTab('platform');
          setSelectedCategory('All');
          setActiveVideo(null);
        }}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-2xl transition relative ${
          isHomeActive
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {isHomeActive && (
          <motion.div
            layoutId="mobileActivePill"
            className="absolute inset-0 bg-amber-500/15 rounded-2xl border border-amber-500/30 shadow-inner"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Compass className={`w-5 h-5 relative z-10 ${isHomeActive ? 'text-amber-400' : 'text-slate-400'}`} />
        <span className="text-[10px] mt-1 tracking-tight font-medium relative z-10">Home</span>
      </motion.button>

      {/* 2. Fellowship & Testimonies Community */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setActiveTab('community');
          setActiveVideo(null);
        }}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-2xl transition relative ${
          isCommunityActive
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {isCommunityActive && (
          <motion.div
            layoutId="mobileActivePill"
            className="absolute inset-0 bg-amber-500/15 rounded-2xl border border-amber-500/30 shadow-inner"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <MessageSquareHeart className={`w-5 h-5 relative z-10 ${isCommunityActive ? 'text-amber-400' : 'text-slate-400'}`} />
        <span className="text-[10px] mt-1 tracking-tight font-medium relative z-10">Fellowship</span>
      </motion.button>

      {/* 3. Center Floating Shorts Action Button */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onOpenShorts}
        className="flex flex-col items-center justify-center -mt-5 min-w-[56px]"
        title="Grace Shorts"
      >
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-amber-300 blur-sm opacity-70 animate-pulse" />
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 via-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-xl shadow-red-600/40 border-2 border-[#090a0d]">
            <Sparkles className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
        </div>
        <span className="text-[9px] font-black text-amber-300 tracking-wider uppercase mt-1 drop-shadow">Shorts</span>
      </motion.button>

      {/* 4. Discover Ministries */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setActiveTab('discover');
          setActiveVideo(null);
        }}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-2xl transition relative ${
          isDiscoverActive
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {isDiscoverActive && (
          <motion.div
            layoutId="mobileActivePill"
            className="absolute inset-0 bg-amber-500/15 rounded-2xl border border-amber-500/30 shadow-inner"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Building2 className={`w-5 h-5 relative z-10 ${isDiscoverActive ? 'text-amber-400' : 'text-slate-400'}`} />
        <span className="text-[10px] mt-1 tracking-tight font-medium relative z-10">Discover</span>
      </motion.button>

      {/* 5. My Profile */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setActiveTab('profile');
        }}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-2xl transition relative ${
          isProfileActive
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {isProfileActive && (
          <motion.div
            layoutId="mobileActivePill"
            className="absolute inset-0 bg-amber-500/15 rounded-2xl border border-amber-500/30 shadow-inner"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <User className={`w-5 h-5 relative z-10 ${isProfileActive ? 'text-amber-400' : 'text-slate-400'}`} />
        <span className="text-[10px] mt-1 tracking-tight font-medium relative z-10">Profile</span>
      </motion.button>
    </nav>
  );
};


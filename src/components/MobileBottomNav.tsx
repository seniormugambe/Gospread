import React from 'react';
import { 
  Compass, 
  User, 
  Tv, 
  Mic2,
  Building2,
} from 'lucide-react';
import { motion } from 'motion/react';

interface MobileBottomNavProps {
  activeTab: 'platform' | 'generated' | 'create' | 'profile' | 'history' | 'discover' | 'community' | 'auth';
  setActiveTab: (tab: 'platform' | 'generated' | 'create' | 'profile' | 'history' | 'discover' | 'community' | 'auth') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  setActiveVideo: (video: null) => void;
  watchHistoryCount?: number;
  onOpenShorts?: () => void;
  onOpenGiving?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  setActiveVideo,
}) => {
  const isHomeActive = activeTab === 'platform' && selectedCategory === 'All';
  const isLiveActive = activeTab === 'platform' && (selectedCategory === 'Live' || selectedCategory === 'Live Worship');
  const isSermonsActive = activeTab === 'platform' && selectedCategory === 'Sermons';
  const isMinistriesActive = activeTab === 'discover';
  const isProfileActive = activeTab === 'profile' || activeTab === 'auth';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090a0d]/95 backdrop-blur-2xl border-t border-slate-800/90 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),8px)] flex items-center justify-around shadow-2xl select-none">
      
      {/* 1. Home */}
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

      {/* 2. Live */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setActiveTab('platform');
          setSelectedCategory('Live');
          setActiveVideo(null);
        }}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-2xl transition relative ${
          isLiveActive
            ? 'text-red-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {isLiveActive && (
          <motion.div
            layoutId="mobileActivePill"
            className="absolute inset-0 bg-red-600/15 rounded-2xl border border-red-500/30 shadow-inner"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <div className="relative">
          <Tv className={`w-5 h-5 relative z-10 ${isLiveActive ? 'text-red-400' : 'text-slate-400'}`} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
        </div>
        <span className="text-[10px] mt-1 tracking-tight font-medium relative z-10">Live</span>
      </motion.button>

      {/* 3. Sermons */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setActiveTab('platform');
          setSelectedCategory('Sermons');
          setActiveVideo(null);
        }}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-2xl transition relative ${
          isSermonsActive
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {isSermonsActive && (
          <motion.div
            layoutId="mobileActivePill"
            className="absolute inset-0 bg-amber-500/15 rounded-2xl border border-amber-500/30 shadow-inner"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Mic2 className={`w-5 h-5 relative z-10 ${isSermonsActive ? 'text-amber-400' : 'text-slate-400'}`} />
        <span className="text-[10px] mt-1 tracking-tight font-medium relative z-10">Sermons</span>
      </motion.button>

      {/* 4. Ministries */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          setActiveTab('discover');
          setActiveVideo(null);
        }}
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-2xl transition relative ${
          isMinistriesActive
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {isMinistriesActive && (
          <motion.div
            layoutId="mobileActivePill"
            className="absolute inset-0 bg-amber-500/15 rounded-2xl border border-amber-500/30 shadow-inner"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Building2 className={`w-5 h-5 relative z-10 ${isMinistriesActive ? 'text-amber-400' : 'text-slate-400'}`} />
        <span className="text-[10px] mt-1 tracking-tight font-medium relative z-10">Ministries</span>
      </motion.button>

      {/* 5. Profile / Account */}
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
        <span className="text-[10px] mt-1 tracking-tight font-medium relative z-10">Account</span>
      </motion.button>
    </nav>
  );
};

export default MobileBottomNav;

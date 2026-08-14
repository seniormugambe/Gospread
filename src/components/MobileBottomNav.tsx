import React from 'react';
import { 
  Compass, 
  History, 
  User, 
  Radio, 
  Sparkles, 
  DollarSign, 
  PlusCircle, 
  Search,
  Music,
  Building2
} from 'lucide-react';
import { motion } from 'motion/react';

interface MobileBottomNavProps {
  activeTab: 'platform' | 'generated' | 'create' | 'profile' | 'history' | 'discover';
  setActiveTab: (tab: 'platform' | 'generated' | 'create' | 'profile' | 'history' | 'discover') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  setActiveVideo: (video: null) => void;
  watchHistoryCount: number;
  onOpenShorts: () => void;
  onOpenGiving: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  setActiveVideo,
  watchHistoryCount,
  onOpenShorts,
  onOpenGiving,
}) => {
  const isHomeActive = activeTab === 'platform' && selectedCategory !== '24/7 Gospel Radio' && selectedCategory !== 'Podcasts';
  const isDiscoverActive = activeTab === 'discover';
  const isAudioActive = activeTab === 'platform' && (selectedCategory === '24/7 Gospel Radio' || selectedCategory === 'Podcasts');
  const isHistoryActive = activeTab === 'history';
  const isProfileActive = activeTab === 'profile';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-slate-800/90 px-1 py-1.5 flex items-center justify-around shadow-2xl select-none">
      {/* 1. Home / Feed */}
      <button
        onClick={() => {
          setActiveTab('platform');
          setSelectedCategory('All');
          setActiveVideo(null);
        }}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
          isHomeActive
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Compass className={`w-5 h-5 ${isHomeActive ? 'text-amber-400' : 'text-slate-400'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
      </button>

      {/* 2. Discover Ministries */}
      <button
        onClick={() => {
          setActiveTab('discover');
          setActiveVideo(null);
        }}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
          isDiscoverActive
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Building2 className={`w-5 h-5 ${isDiscoverActive ? 'text-amber-400' : 'text-slate-400'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Discover</span>
      </button>

      {/* 3. Center Shorts Special Button */}
      <button
        onClick={onOpenShorts}
        className="flex flex-col items-center justify-center -mt-4"
        title="Grace Shorts"
      >
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 via-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-lg shadow-red-600/30 border-2 border-[#0c0c0e]"
        >
          <Sparkles className="w-5 h-5 fill-slate-950 text-slate-950" />
        </motion.div>
        <span className="text-[9px] font-black text-amber-400 tracking-wider uppercase mt-0.5">Shorts</span>
      </button>

      {/* 4. Radio/Audio */}
      <button
        onClick={() => {
          setActiveTab('platform');
          setSelectedCategory('24/7 Gospel Radio');
          setActiveVideo(null);
        }}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
          isAudioActive
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Radio className={`w-5 h-5 ${isAudioActive ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Radio</span>
      </button>

      {/* 5. My Profile */}
      <button
        onClick={() => {
          setActiveTab('profile');
        }}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
          isProfileActive
            ? 'text-amber-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <User className={`w-5 h-5 ${isProfileActive ? 'text-amber-400' : 'text-slate-400'}`} />
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Profile</span>
      </button>
    </nav>
  );
};

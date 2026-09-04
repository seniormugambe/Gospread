import React from 'react';
import { ArrowLeft, Sparkles, Church } from 'lucide-react';
import { motion } from 'motion/react';
import SimpleAuthCard from './SimpleAuthCard';
import { UserSession } from './AuthModal';
import GospreadLogo from './GospreadLogo';

export interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  currentUser: UserSession;
  onLoginSuccess: (user: UserSession) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateProfile?: () => void;
  onAwardXp?: (amount: number, reason: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  currentUser,
  onLoginSuccess,
  onLogout,
  onNavigateHome,
  onNavigateProfile,
  onAwardXp
}) => {
  const handleSuccess = (user: UserSession) => {
    if (onAwardXp) {
      onAwardXp(25, 'Sanctuary Login');
    }
    onLoginSuccess(user);
    if (onNavigateHome) {
      onNavigateHome();
    }
  };

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] w-full flex flex-col items-center justify-center p-4 sm:p-8 bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url('/ethereal_water_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Soft celestial water glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-sky-300/15 to-blue-950/40 backdrop-blur-[1px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between mb-6 sm:mb-8">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-slate-900/50 hover:bg-white/60 dark:hover:bg-slate-900/70 backdrop-blur-md border border-white/60 dark:border-white/20 text-slate-800 dark:text-white font-medium text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Sanctuary</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-white/40 dark:bg-slate-900/50 backdrop-blur-md border border-white/60 dark:border-white/20 shadow-md">
            <GospreadLogo size="xs" />
          </div>
        </div>
      </div>

      {/* Centered Simple Auth Card */}
      <div className="relative z-10 w-full flex justify-center items-center">
        <SimpleAuthCard
          initialMode={initialMode === 'signup' ? 'signup' : 'signin'}
          currentUser={currentUser}
          onLoginSuccess={handleSuccess}
          onLogout={onLogout}
          onNavigateHome={onNavigateHome}
          isModal={false}
        />
      </div>

      {/* Footer Scripture or Fellowship note */}
      <div className="relative z-10 mt-8 text-center max-w-md">
        <p className="text-xs sm:text-sm text-sky-950/80 dark:text-sky-100/90 font-medium tracking-wide drop-shadow-sm">
          “For where two or three gather in my name, there am I with them.” — Matthew 18:20
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

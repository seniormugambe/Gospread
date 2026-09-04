import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import SimpleAuthCard from './SimpleAuthCard';

export type CreatorProfileType = 'church' | 'artiste' | 'creator' | 'radio';

export interface UserSession {
  id: string | number;
  username: string;
  email: string;
  fullName: string;
  churchName?: string;
  ministryName?: string;
  creatorType?: CreatorProfileType;
  avatarUrl?: string;
  avatar?: string;
  bio?: string;
  role?: string;
  isLoggedIn: boolean;
  token?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onLoginSuccess: (user: UserSession) => void;
  onLogout: () => void;
  onOpenFullAuthPage?: (mode?: 'signin' | 'signup') => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  onOpenFullAuthPage
}: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Soft atmospheric backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Outer container with ethereal water backdrop */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-[430px] rounded-[44px] p-2 sm:p-3 overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `url('/ethereal_water_bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Subtle light water glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-sky-300/10 to-blue-900/30 backdrop-blur-[2px] pointer-events-none" />

          {/* Simple Auth Card */}
          <div className="relative z-10 flex justify-center w-full">
            <SimpleAuthCard
              initialMode="signin"
              currentUser={currentUser}
              onLoginSuccess={onLoginSuccess}
              onLogout={onLogout}
              onClose={onClose}
              isModal={true}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

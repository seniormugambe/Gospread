import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Church, Mic2, Tv } from 'lucide-react';
import SimpleAuthCard from './SimpleAuthCard';
import { UserSession } from './AuthModal';
import GospreadLogo from './GospreadLogo';
import OnboardingFlow from './OnboardingFlow';
import { djangoApi, OnboardingTrack } from '../services/djangoApi';

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
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [signupTrack, setSignupTrack] = useState<OnboardingTrack | undefined>();
  // The auth card navigates home itself after login; hold that back until the onboarding check finishes.
  const holdNavigation = useRef(false);
  const goHome = () => {
    holdNavigation.current = false;
    onNavigateHome?.();
  };

  const handleSuccess = async (user: UserSession) => {
    if (onAwardXp) {
      onAwardXp(25, 'Sanctuary Login');
    }
    holdNavigation.current = true;
    onLoginSuccess(user);
    try {
      const me = await djangoApi.getMe();
      if (me.onboarding_completed === false) {
        setSignupTrack(({ pastor: 'ministry', artiste: 'artiste', creator: 'creator' } as Record<string, OnboardingTrack>)[me.role || '']);
        setNeedsOnboarding(true);
        return;
      }
    } catch {
      // Fall through to home; onboarding is offered again on the next login.
    }
    goHome();
  };

  const benefits = [
    { icon: Tv, title: 'Sermons, worship and live broadcasts', text: 'One home for Gospel video and audio from ministries worldwide.' },
    { icon: Mic2, title: 'Built for artistes and creators', text: 'Share your music and teaching and grow a faithful audience.' },
    { icon: Church, title: 'Ministries that stay connected', text: 'Events, giving and community in one place.' },
  ];

  // Rendered in a portal: the app's global light theme recolors every h1-h6/p/span inside <main> and <aside>.
  return createPortal(
    <div className="auth-surface fixed inset-0 z-[60] overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
    <div className="grid min-h-full w-full dark:bg-zinc-950 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-zinc-950 via-[#14122b] to-[#2a1a05] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative"><GospreadLogo size="sm" /></div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Your Gospel <span className="text-amber-400">home</span>, wherever you are.
          </h2>
          <ul className="mt-10 space-y-6">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-400 ring-1 ring-white/15">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-white/60">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative max-w-md text-sm italic text-white/60">
          “For where two or three gather in my name, there am I with them.” — Matthew 18:20
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Sanctuary
          </button>
          <div className="lg:hidden"><GospreadLogo size="xs" /></div>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          {needsOnboarding ? (
            <OnboardingFlow
              initialTrack={signupTrack}
              onSkip={goHome}
              onComplete={(user) => {
                if (user?.role) onLoginSuccess({ ...currentUser, role: user.role });
                goHome();
              }}
            />
          ) : (
            <SimpleAuthCard
              initialMode={initialMode === 'signup' ? 'signup' : 'signin'}
              currentUser={currentUser}
              onLoginSuccess={handleSuccess}
              onLogout={onLogout}
              onNavigateHome={() => { if (!holdNavigation.current) onNavigateHome?.(); }}
              isModal={false}
            />
          )}
        </div>
      </div>
    </div>
    </div>,
    document.body
  );
};

export default AuthPage;

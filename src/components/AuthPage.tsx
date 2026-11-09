import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Church, Mic2, Tv } from 'lucide-react';
import SimpleAuthCard from './SimpleAuthCard';
import { UserSession } from './AuthModal';
import GospreadLogo from './GospreadLogo';
import OnboardingFlow from './OnboardingFlow';
import { djangoApi, OnboardingAnswers, OnboardingTrack } from '../services/djangoApi';

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
  // Sign-up runs questions first, then account creation; answers are saved once the account exists.
  const [stage, setStage] = useState<'questions' | 'account'>(initialMode === 'signup' ? 'questions' : 'account');
  const [signupIntent, setSignupIntent] = useState(initialMode === 'signup');
  const [collected, setCollected] = useState<{ track: OnboardingTrack; answers: OnboardingAnswers } | null>(null);
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
    if (collected) {
      try {
        await djangoApi.submitOnboarding(collected.track, collected.answers);
        setCollected(null);
      } catch {
        // Account exists; fall back to the in-page onboarding below so answers can be corrected.
        setSignupTrack(collected.track);
        setNeedsOnboarding(true);
        return;
      }
      goHome();
      return;
    }
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
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0b0a1a] via-[#1b1340] to-[#3a2208] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-amber-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-[26rem] w-[26rem] rounded-full bg-violet-600/30 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-3xl" />
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
      <div className="relative isolate flex flex-col overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50/60 to-violet-50 px-5 py-6 dark:from-zinc-950 dark:via-[#15112b] dark:to-[#1f1406] sm:px-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(180,120,20,0.16)_1px,transparent_1px)] [background-size:22px_22px] dark:bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-80 w-80 rounded-full bg-amber-300/40 blur-3xl dark:bg-amber-500/15" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 -z-10 h-80 w-80 rounded-full bg-violet-300/40 blur-3xl dark:bg-violet-600/15" />
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-4 py-2 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 ring-1 ring-amber-200/60 transition hover:from-amber-300 hover:to-orange-400 active:scale-[0.98] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Return to Gospread
          </button>
          <div className="rounded-full bg-zinc-900 px-3 py-1.5 shadow-md lg:hidden"><GospreadLogo size="xs" /></div>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          {!needsOnboarding && stage === 'questions' ? (
            <OnboardingFlow
              onSkip={() => { setSignupIntent(true); setStage('account'); }}
              onComplete={() => undefined}
              onCollect={(track, answers) => { setCollected({ track, answers }); setSignupIntent(true); setStage('account'); }}
            />
          ) : needsOnboarding ? (
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
              initialMode={signupIntent ? 'signup' : 'signin'}
              presetRole={collected ? ({ ministry: 'church', artiste: 'artiste', creator: 'creator' } as const)[collected.track] : undefined}
              presetChurchName={collected?.track === 'ministry' ? String(collected.answers.ministry_name ?? '') : undefined}
              onRequestSignup={() => { setCollected(null); setStage('questions'); }}
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

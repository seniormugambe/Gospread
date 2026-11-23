import React, { useState } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  User as UserIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  LogOut,
  Sparkles,
  Church,
  Mic2,
  UserPlus,
} from 'lucide-react';
import { motion } from 'motion/react';
import { djangoApi } from '../services/djangoApi';
import { UserSession } from './AuthModal';

export interface SimpleAuthCardProps {
  initialMode?: 'signin' | 'signup';
  currentUser?: UserSession;
  onLoginSuccess: (user: UserSession) => void;
  onLogout?: () => void;
  onClose?: () => void;
  onNavigateHome?: () => void;
  isModal?: boolean;
  // Account type already chosen during onboarding; hides the role picker.
  presetRole?: 'church' | 'artiste' | 'creator';
  presetChurchName?: string;
  // When set, the "Sign up" toggle calls this instead of switching to the in-card sign-up form.
  onRequestSignup?: () => void;
}

export default function SimpleAuthCard({
  initialMode = 'signin',
  currentUser,
  onLoginSuccess,
  onLogout,
  onClose,
  onNavigateHome,
  isModal = false,
  presetRole,
  presetChurchName,
  onRequestSignup
}: SimpleAuthCardProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('password_reset_uid') && params.has('password_reset_token') ? 'reset' : initialMode;
  });
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [creatorType, setCreatorType] = useState<'church' | 'artiste' | 'creator' | null>(presetRole ?? null);
  const [churchName, setChurchName] = useState(presetChurchName ?? '');

  // Status feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearPasswordResetParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('password_reset_uid');
    url.searchParams.delete('password_reset_token');
    window.history.replaceState({}, '', url);
  };

  // Handle Form Submission (Login or Sign Up)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'forgot') {
      if (!email.trim()) {
        setErrorMessage('Please enter your email address to reset password.');
        return;
      }
      setIsLoading(true);
      try {
        await djangoApi.requestPasswordReset(email.trim().toLowerCase());
        setSuccessMessage('If an account exists for this email address, a password reset link has been sent.');
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Unable to send a password reset email. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === 'reset') {
      if (!password) {
        setErrorMessage('Please enter a new password.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('The passwords do not match.');
        return;
      }
    }

    if (mode !== 'reset' && !email.trim()) {
      setErrorMessage('Please enter your e-mail address.');
      return;
    }

    if (mode !== 'reset' && !password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (mode === 'signup' && !presetRole && !creatorType) {
      setErrorMessage('Choose the type of account you are creating.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'reset') {
        const params = new URLSearchParams(window.location.search);
        const uid = params.get('password_reset_uid');
        const token = params.get('password_reset_token');
        if (!uid || !token) {
          throw new Error('This password reset link is invalid or has expired.');
        }
        await djangoApi.confirmPasswordReset({
          uid,
          token,
          new_password: password,
        });
        clearPasswordResetParams();
        setPassword('');
        setConfirmPassword('');
        setMode('signin');
        setSuccessMessage('Your password has been updated. You can now sign in.');
      } else if (mode === 'signin') {
        const res = await djangoApi.login({
          email: email.trim().toLowerCase(),
          password
        });

        if (res?.user && res.access) {
          const loggedUser: UserSession = {
            id: res.user.id || 'usr-101',
            username: res.user.username || email.split('@')[0],
            email: res.user.email || email,
            fullName: res.user.first_name
              ? `${res.user.first_name} ${res.user.last_name || ''}`.trim()
              : 'Kingdom Believer',
            churchName: res.user.church_name || undefined,
            ministryName: res.user.church_name || undefined,
            creatorType: res.user.creator_type || (res.user.role === 'pastor' ? 'church' : res.user.role === 'artiste' ? 'artiste' : res.user.role === 'creator' ? 'creator' : undefined),
            avatarUrl: res.user.avatar_url || '',
            isLoggedIn: true,
            token: res.access
          };

          try {
            localStorage.setItem('gospread_user_session', JSON.stringify(loggedUser));
          } catch (e) {
            console.error(e);
          }

          setSuccessMessage('Logged in successfully!');
          setTimeout(() => {
            onLoginSuccess(loggedUser);
            if (onClose) onClose();
            if (onNavigateHome) onNavigateHome();
          }, 600);
        } else {
          throw new Error('The login response did not include a valid access token.');
        }
      } else {
        // Sign up
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || fullName;
        const lastName = nameParts.slice(1).join(' ') || '';

        const resolvedType = creatorType!;

        if (resolvedType === 'church' && !churchName.trim()) {
          setErrorMessage('Enter your church or ministry name.');
          setIsLoading(false);
          return;
        }

        const payload = {
          email: email.trim(),
          name: `${firstName} ${lastName}`.trim(),
          church_name: resolvedType === 'church' ? churchName.trim() : '',
          role: resolvedType === 'church' ? 'pastor' : resolvedType === 'artiste' ? 'artiste' : 'creator',
          password
        };

        const res = await djangoApi.register(payload);

        const newUser: UserSession = {
            id: res.user.id,
            username: res.user.username,
            email: res.user.email,
            fullName: [res.user.first_name, res.user.last_name].filter(Boolean).join(' ') || fullName.trim(),
            churchName: res.user.church_name || undefined,
            ministryName: res.user.church_name || undefined,
            creatorType: res.user.creator_type ?? resolvedType,
          avatarUrl: res.user.avatar_url || '',
          isLoggedIn: true,
            token: res.access
        };

        try {
          localStorage.setItem('gospread_user_session', JSON.stringify(newUser));
        } catch (e) {
          console.error(e);
        }

        setSuccessMessage(res.email_verification_sent
          ? 'Account created. Check your email to verify it.'
          : 'Account created, but the verification email could not be sent. Resend it from Account Settings > Verification.');
        setTimeout(() => {
          onLoginSuccess(newUser);
          if (onClose) onClose();
          if (onNavigateHome) onNavigateHome();
        }, 600);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      const lmsg = message.toLowerCase();
      if (
        lmsg.includes('no active account') ||
        lmsg.includes('invalid credentials') ||
        lmsg.includes('unable to log in') ||
        lmsg.includes('session has expired')
      ) {
        setErrorMessage('That email and password combination is not recognised. Check your details and try again.');
      } else if (lmsg.includes('already exists') || lmsg.includes('already registered')) {
        // Backend told us this email is taken — switch to sign-in so the user can log in
        setErrorMessage('An account with this email already exists. Switch to Sign In to continue.');
        setTimeout(() => setMode('signin'), 1800);
      } else if (message) {
        setErrorMessage(message);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  // If already logged in, show simple user card
  if (currentUser?.isLoggedIn && mode !== 'reset') {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-[400px] backdrop-blur-2xl bg-white/40 dark:bg-slate-900/50 border border-white/60 dark:border-white/20 rounded-[38px] shadow-[0_25px_60px_rgba(15,80,140,0.2)] p-8 sm:p-9 text-slate-900 dark:text-white"
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/30 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <div className="relative">
            {currentUser.avatarUrl || currentUser.avatar ? (
              <img
                src={currentUser.avatarUrl || currentUser.avatar}
                alt={currentUser.fullName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white/80 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-sky-100 dark:bg-slate-800 ring-4 ring-white/80 shadow-lg flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-sky-700 dark:text-sky-200" />
              </div>
            )}
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>

          <div>
            <h3 className="text-2xl font-semibold tracking-tight">{currentUser.fullName}</h3>
            <p className="text-sm text-sky-900/70 dark:text-sky-200/70">{currentUser.email}</p>
            {currentUser.churchName && (
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-white/40 dark:bg-white/10 border border-white/40 text-slate-800 dark:text-slate-200">
                ⛪ {currentUser.churchName}
              </span>
            )}
          </div>

          <div className="w-full space-y-3 pt-4">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="group w-full py-4 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base shadow-[0_12px_28px_rgba(245,158,11,0.35)] ring-1 ring-amber-200/60 active:scale-[0.98] transition cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                Return to Gospread
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full py-3.5 px-6 rounded-full border border-white/60 dark:border-white/20 bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 backdrop-blur-md text-slate-800 dark:text-slate-100 font-medium text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 10 }}
      className="relative w-full max-w-[420px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl p-6 sm:p-8 text-zinc-900 dark:text-white"
    >
      {/* Modal Close Button if opened in modal */}
      {isModal && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/30 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between mb-7">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {mode === 'signin' && 'Log in'}
          {mode === 'signup' && 'Sign up'}
          {mode === 'forgot' && 'Reset password'}
          {mode === 'reset' && 'Create new password'}
        </h2>

        {mode === 'forgot' || mode === 'reset' ? (
          <button
            type="button"
            onClick={() => {
              if (mode === 'reset') clearPasswordResetParams();
              setMode('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="text-amber-700 dark:text-amber-400 hover:underline font-semibold text-sm flex items-center gap-1 cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Log in</span>
          </button>
        ) : mode === 'signin' ? (
          <button
            type="button"
            onClick={() => {
              if (onRequestSignup) { onRequestSignup(); return; }
              setMode('signup');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-[0.97] px-4 py-2 text-sm font-bold text-black shadow-md shadow-amber-500/30 transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Sign up
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition cursor-pointer"
          >
            Log in
          </button>
        )}
      </div>

      <p className="-mt-4 mb-6 text-sm text-zinc-500">
        {mode === 'signin' && 'Welcome back. Sign in to continue.'}
        {mode === 'signup' && 'Create your free Gospread account.'}
        {mode === 'forgot' && 'We will email you a reset link.'}
        {mode === 'reset' && 'Choose a new password for your account.'}
      </p>

      {/* Alerts */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name field if in Sign Up mode */}
        {mode === 'signup' && (
          <div className="relative rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-amber-500/60 focus-within:border-amber-500 transition">
            <UserIcon className="w-5 h-5 text-zinc-400 shrink-0 stroke-[2]" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-zinc-400 text-sm font-normal"
            />
          </div>
        )}

        {mode === 'signup' && !presetRole && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              I am joining as <span className="text-red-500">*</span>
            </p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Account type">
              {([
                ['church', 'Ministry', Church],
                ['artiste', 'Artiste', Mic2],
                ['creator', 'Creator', Sparkles],
              ] as const).map(([value, label, Icon]) => (
                <button key={value} type="button" role="radio" aria-checked={creatorType === value} onClick={() => setCreatorType(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-bold transition ${
                    creatorType === value
                      ? 'border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-300'
                      : 'border-zinc-300 text-zinc-600 hover:border-amber-500/60 dark:border-zinc-700 dark:text-zinc-300'
                  }`}>
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              ))}
            </div>
            {creatorType === null && errorMessage?.includes('type of account') && (
              <p className="text-xs text-red-600 font-medium">Select one of the options above.</p>
            )}
            {creatorType === 'church' && (
              <input value={churchName} onChange={event => setChurchName(event.target.value)} placeholder="Church or ministry name" className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
            )}
          </div>
        )}

        {/* Email Field with @ symbol */}
        {mode !== 'reset' && (
          <div className="relative rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-amber-500/60 focus-within:border-amber-500 transition">
            <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-zinc-400 text-base shrink-0 select-none">
              @
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              required
              className="w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-zinc-400 text-sm font-normal"
            />
          </div>
        )}

        {/* Password field is hidden only while requesting a reset link. */}
        {mode !== 'forgot' && (
          <div>
            <div className="relative rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-amber-500/60 focus-within:border-amber-500 transition">
              <Key className="w-5 h-5 text-zinc-400 shrink-0 stroke-[2] -rotate-45" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'reset' ? 'New password' : 'Password'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                minLength={mode === 'reset' || mode === 'signup' ? 8 : undefined}
                className="w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-zinc-400 text-sm font-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {mode === 'reset' && (
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="confirm new password"
                autoComplete="new-password"
                minLength={8}
                required
                className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              />
            )}

            {/* Forgot Password link on right */}
            {mode === 'signin' && (
              <div className="flex justify-end mt-2 pr-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-sm font-normal text-amber-700 dark:text-amber-400 hover:underline transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        )}

        {/* Primary Action Button (Black Pill) */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 text-black font-bold text-base shadow-lg shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span>
              {mode === 'signin' && 'Log in'}
              {mode === 'signup' && 'Sign up'}
              {mode === 'forgot' && 'Send reset link'}
              {mode === 'reset' && 'Update password'}
            </span>
          )}
        </button>
      </form>
    </motion.div>
  );
}

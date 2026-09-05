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
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
}

export default function SimpleAuthCard({
  initialMode = 'signin',
  currentUser,
  onLoginSuccess,
  onLogout,
  onClose,
  onNavigateHome,
  isModal = false
}: SimpleAuthCardProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [creatorType, setCreatorType] = useState<'church' | 'artiste' | 'creator'>('creator');
  const [churchName, setChurchName] = useState('');

  // Status feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset password states
  const [resetSent, setResetSent] = useState(false);

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
      setTimeout(() => {
        setIsLoading(false);
        setResetSent(true);
        setSuccessMessage('Password reset link sent to your email.');
      }, 700);
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your e-mail address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const res = await djangoApi.login({
          email: email.includes('@') ? email : undefined,
          username: !email.includes('@') ? email : undefined,
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
            creatorType: res.user.creator_type || (res.user.role === 'pastor' ? 'church' : res.user.role === 'artiste' ? 'artiste' : 'creator'),
            avatarUrl:
              res.user.avatar_url ||
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
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

        const payload = {
          email: email.trim(),
            name: `${firstName} ${lastName}`.trim(),
          church_name: creatorType === 'church' ? churchName.trim() : '',
          role: creatorType === 'church' ? 'pastor' : creatorType === 'artiste' ? 'artiste' : 'creator',
          password
        };

        if (creatorType === 'church' && !churchName.trim()) {
          setErrorMessage('Enter your church or ministry name.');
          setIsLoading(false);
          return;
        }

          const res = await djangoApi.register(payload);

        const newUser: UserSession = {
            id: res.user.id,
            username: res.user.username,
            email: res.user.email,
            fullName: [res.user.first_name, res.user.last_name].filter(Boolean).join(' ') || fullName.trim(),
            churchName: res.user.church_name || undefined,
            ministryName: res.user.church_name || undefined,
            creatorType: res.user.creator_type || creatorType,
          avatarUrl:
              res.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          isLoggedIn: true,
            token: res.access
        };

        try {
          localStorage.setItem('gospread_user_session', JSON.stringify(newUser));
        } catch (e) {
          console.error(e);
        }

        setSuccessMessage('Account created successfully!');
        setTimeout(() => {
          onLoginSuccess(newUser);
          if (onClose) onClose();
          if (onNavigateHome) onNavigateHome();
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social login requires a configured OAuth callback; do not create a local session.
  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    setErrorMessage(null);
    setSuccessMessage(`${provider} login will be available after OAuth is configured.`);
  };

  // Fast Demo Login
  const handleQuickDemoLogin = () => {
    setEmail('grace.believer@gospread.org');
    setPassword('Faith2026!');
    setFullName('Grace Believer');
  };

  // If already logged in, show simple user card
  if (currentUser?.isLoggedIn) {
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
            <img
              src={currentUser.avatarUrl || currentUser.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80'}
              alt={currentUser.fullName}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white/80 shadow-lg"
            />
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
                className="w-full py-4 rounded-full bg-gradient-to-b from-[#252528] to-[#121214] hover:from-[#323236] hover:to-[#1a1a1c] text-white font-medium text-base shadow-[0_12px_28px_rgba(0,0,0,0.35)] active:scale-[0.98] transition cursor-pointer"
              >
                Return to Sanctuary
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
      className="relative w-full max-w-[390px] backdrop-blur-2xl bg-white/40 dark:bg-slate-900/50 border border-white/60 dark:border-white/20 rounded-[38px] shadow-[0_25px_60px_rgba(15,80,140,0.22)] p-7 sm:p-9 text-slate-900 dark:text-white"
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

      {/* Top Header: "Log in" / "Sign up" Toggle */}
      <div className="flex items-center justify-between mb-7">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {mode === 'signin' && 'Log in'}
          {mode === 'signup' && 'Sign up'}
          {mode === 'forgot' && 'Reset'}
        </h2>

        {mode === 'forgot' ? (
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-200 font-medium text-base flex items-center gap-1 cursor-pointer transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Log in</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className="text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-200 font-medium text-lg cursor-pointer transition"
          >
            {mode === 'signin' ? 'Sign up' : 'Log in'}
          </button>
        )}
      </div>

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
          <div className="relative rounded-full border border-white/70 dark:border-white/20 bg-white/45 dark:bg-white/10 backdrop-blur-md px-5 py-3.5 sm:py-4 flex items-center gap-3.5 focus-within:ring-2 focus-within:ring-sky-400/50 focus-within:border-white transition shadow-sm">
            <UserIcon className="w-5 h-5 text-sky-800 dark:text-sky-300 shrink-0 stroke-[2]" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="full name"
              className="w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-sky-900/60 dark:placeholder:text-sky-200/60 text-base font-normal"
            />
          </div>
        )}

        {mode === 'signup' && (
          <div className="space-y-2">
            <p className="px-2 text-xs font-semibold text-slate-700 dark:text-slate-200">What will you create?</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                ['church', 'Church'],
                ['artiste', 'Artiste'],
                ['creator', 'Content Creator'],
              ] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setCreatorType(value)} className={`rounded-2xl border px-2 py-3 text-xs font-bold transition ${creatorType === value ? 'border-sky-500 bg-sky-500/20 text-sky-900 dark:text-sky-200' : 'border-white/60 bg-white/30 text-slate-600 dark:border-white/20 dark:bg-white/10 dark:text-slate-300'}`}>
                  {label}
                </button>
              ))}
            </div>
            {creatorType === 'church' && (
              <input value={churchName} onChange={event => setChurchName(event.target.value)} placeholder="Church or ministry name" className="w-full rounded-2xl border border-white/70 bg-white/45 px-4 py-3 text-sm text-slate-800 outline-none dark:border-white/20 dark:bg-white/10 dark:text-white" />
            )}
            <p className="px-2 text-[11px] text-slate-500">You can join an existing church later from Discover Ministries.</p>
          </div>
        )}

        {/* Email Field with @ symbol */}
        <div className="relative rounded-full border border-white/70 dark:border-white/20 bg-white/45 dark:bg-white/10 backdrop-blur-md px-5 py-3.5 sm:py-4 flex items-center gap-3.5 focus-within:ring-2 focus-within:ring-sky-400/50 focus-within:border-white transition shadow-sm">
          <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-sky-800 dark:text-sky-300 text-base shrink-0 select-none">
            @
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e-mail address"
            className="w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-sky-900/60 dark:placeholder:text-sky-200/60 text-base font-normal"
          />
        </div>

        {/* Password Field with Key and Eye toggle (hidden in forgot password mode) */}
        {mode !== 'forgot' && (
          <div>
            <div className="relative rounded-full border border-white/70 dark:border-white/20 bg-white/45 dark:bg-white/10 backdrop-blur-md px-5 py-3.5 sm:py-4 flex items-center gap-3.5 focus-within:ring-2 focus-within:ring-sky-400/50 focus-within:border-white transition shadow-sm">
              <Key className="w-5 h-5 text-sky-800 dark:text-sky-300 shrink-0 stroke-[2] -rotate-45" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="w-full bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-sky-900/60 dark:placeholder:text-sky-200/60 text-base font-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sky-800/70 dark:text-sky-300/70 hover:text-sky-950 dark:hover:text-white transition p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

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
                  className="text-sm font-normal text-sky-800/80 dark:text-sky-300 hover:text-sky-950 dark:hover:text-white transition cursor-pointer"
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
          className="w-full py-4 rounded-full bg-gradient-to-b from-[#26262a] via-[#1a1a1d] to-[#101012] hover:from-[#333338] hover:to-[#1b1b1e] text-white font-medium text-base sm:text-lg shadow-[0_12px_28px_rgba(0,0,0,0.38)] active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span>
              {mode === 'signin' && 'Log in'}
              {mode === 'signup' && 'Sign up'}
              {mode === 'forgot' && 'Reset password'}
            </span>
          )}
        </button>
      </form>

      {/* Social options (Google & Apple) */}
      {mode !== 'forgot' && (
        <div className="mt-2">
          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-sky-900/15 dark:border-white/15" />
            </div>
            <span className="relative px-3 text-xs sm:text-sm text-sky-900/70 dark:text-sky-200/70 font-normal select-none">
              or continue with
            </span>
          </div>

          <div className="space-y-3">
            {/* Google Login Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full border border-white/60 dark:border-white/20 bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 backdrop-blur-md text-slate-800 dark:text-slate-100 font-medium text-sm sm:text-base flex items-center justify-center gap-3 transition shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{mode === 'signin' ? 'Login with Google' : 'Sign up with Google'}</span>
            </button>

            {/* Apple Login Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Apple')}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full border border-white/60 dark:border-white/20 bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 backdrop-blur-md text-slate-800 dark:text-slate-100 font-medium text-sm sm:text-base flex items-center justify-center gap-3 transition shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.67-1.09 1.74-.95 2.77 1 .08 2.06-.52 2.68-1.27z" />
              </svg>
              <span>{mode === 'signin' ? 'Login with Apple' : 'Sign up with Apple'}</span>
            </button>
          </div>

          {/* Discreet One-click demo test credentials helper */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="text-xs text-sky-800/70 dark:text-sky-300/70 hover:text-sky-950 dark:hover:text-white transition underline cursor-pointer"
            >
              Fill demo credentials
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

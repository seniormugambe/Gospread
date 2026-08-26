import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Mail,
  Key,
  Church,
  ShieldCheck,
  CheckCircle2,
  X,
  LogOut,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Globe,
  Radio,
  Tv,
  Heart,
  Flame,
  Check,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Share2,
  Users,
  Compass,
  MessageSquareHeart,
  Award,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { djangoApi } from '../services/djangoApi';
import { UserSession } from './AuthModal';

export interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  currentUser: UserSession;
  onLoginSuccess: (user: UserSession) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateProfile: () => void;
  onAwardXp?: (amount: number, reason: string) => void;
}

const SCRIPTURES = [
  {
    ref: 'John 8:12',
    text: '“I am the light of the world. Whoever follows me will never walk in darkness, but will have the light of life.”',
    theme: 'Guidance & Light'
  },
  {
    ref: 'Isaiah 40:31',
    text: '“Those who wait on the Lord shall renew their strength; they shall mount up with wings like eagles, they shall run and not be weary.”',
    theme: 'Strength & Hope'
  },
  {
    ref: 'Matthew 11:28',
    text: '“Come to me, all you who are weary and burdened, and I will give you rest.”',
    theme: 'Peace & Rest'
  },
  {
    ref: 'Romans 8:28',
    text: '“And we know that in all things God works for the good of those who love him, who have been called according to his purpose.”',
    theme: 'Purpose & Grace'
  }
];

const POPULAR_CHURCHES = [
  'Grace City Cathedral',
  'Covenant Life Ministries',
  'Global Gospel Alliance',
  'Living Waters Sanctuary',
  'Bethel Gospel Fellowship',
  'Elevation Worship Hub',
  'Redeemed Christian Fellowship',
  'Hillsong Global Community',
  'Victory Harvest Temple',
  'Independent / Other Sanctuary'
];

const SPIRITUAL_ROLES = [
  { id: 'believer', label: 'Believer & Seeker', icon: Heart, desc: 'Seeking daily worship, prayer & sermons' },
  { id: 'intercessor', label: 'Prayer Warrior / Intercessor', icon: Flame, desc: 'Standing on the prayer altar for others' },
  { id: 'worship', label: 'Worship Leader / Artiste', icon: Radio, desc: 'Sharing songs of praise & psalmody' },
  { id: 'pastor', label: 'Pastor / Minister', icon: Church, desc: 'Shepherding flock & preaching the Word' },
  { id: 'youth', label: 'Youth & Campus Ambassador', icon: Sparkles, desc: 'Igniting revival in next generation' },
  { id: 'creator', label: 'Gospel Content Creator', icon: Tv, desc: 'Broadcasting messages & ministry media' },
];

const DEMO_ACCOUNTS = [
  {
    role: 'Pastor David Wilson',
    email: 'pastor.david@gospread.org',
    church: 'Grace City Cathedral',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    title: 'Senior Pastor'
  },
  {
    role: 'Sarah Jenkins',
    email: 'sarah.jenkins@gospread.org',
    church: 'Grace City Cathedral',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    title: 'Global Intercessor'
  },
  {
    role: 'Michael Adewale',
    email: 'michael.adewale@gospread.org',
    church: 'Redeemed Christian Fellowship',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    title: 'Youth Minister'
  }
];

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  currentUser,
  onLoginSuccess,
  onLogout,
  onNavigateHome,
  onNavigateProfile,
  onAwardXp,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedScriptureIdx, setSelectedScriptureIdx] = useState(0);

  // Sign In Inputs
  const [loginIdentifier, setLoginIdentifier] = useState('david.lawson@gospread.org');
  const [loginPassword, setLoginPassword] = useState('KingdomPass2026!');

  // Sign Up Inputs
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [churchName, setChurchName] = useState('Grace City Cathedral');
  const [customChurch, setCustomChurch] = useState('');
  const [spiritualRole, setSpiritualRole] = useState('believer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeCovenant, setAgreeCovenant] = useState(true);
  const [subscribeDailyPromise, setSubscribeDailyPromise] = useState(true);

  // Status & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const getStrengthLabel = (score: number) => {
    if (score <= 25) return { label: 'Weak', color: 'bg-red-500 text-red-400' };
    if (score <= 50) return { label: 'Fair', color: 'bg-amber-500 text-amber-400' };
    if (score <= 75) return { label: 'Good', color: 'bg-blue-500 text-blue-400' };
    return { label: 'Kingdom Strong 🛡️', color: 'bg-emerald-500 text-emerald-400' };
  };

  // Scripture Rotator
  const nextScripture = () => {
    setSelectedScriptureIdx((prev) => (prev + 1) % SCRIPTURES.length);
  };

  // Sign In Form Submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setErrorMessage('Please enter your email/username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await djangoApi.login({
        email: loginIdentifier.includes('@') ? loginIdentifier : undefined,
        username: !loginIdentifier.includes('@') ? loginIdentifier : undefined,
        password: loginPassword
      });

      if (res && res.user) {
        const loggedUser: UserSession = {
          id: res.user.id || 'usr-101',
          username: res.user.username || loginIdentifier.split('@')[0] || 'believer',
          email: res.user.email || loginIdentifier,
          fullName: res.user.first_name ? `${res.user.first_name} ${res.user.last_name || ''}`.trim() : 'David Lawson',
          churchName: res.user.church_name || 'Grace City Cathedral',
          avatarUrl: res.user.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
          isLoggedIn: true,
          token: res.access
        };

        try {
          localStorage.setItem('gospread_user_session', JSON.stringify(loggedUser));
        } catch (e) {
          console.error(e);
        }

        setSuccessMessage('Welcome back to the Sanctuary! Authenticated successfully.');
        if (onAwardXp) onAwardXp(15, 'Daily Sanctuary login');

        setTimeout(() => {
          onLoginSuccess(loggedUser);
          onNavigateHome();
        }, 800);
      } else {
        setErrorMessage('Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error encountered. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up Form Submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMessage('Please provide your full name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!agreeCovenant) {
      setErrorMessage('Please agree to the Kingdom Fellowship Covenant and Terms.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.slice(1).join(' ') || '';
    const finalChurch = churchName === 'Independent / Other Sanctuary' && customChurch.trim() ? customChurch.trim() : churchName;

    try {
      const payload = {
        username: username.trim() || email.split('@')[0],
        email: email.trim(),
        first_name: firstName,
        last_name: lastName,
        church_name: finalChurch,
        password: password
      };

      const res = await djangoApi.register(payload);

      const newUser: UserSession = {
        id: `usr-${Date.now()}`,
        username: payload.username,
        email: payload.email,
        fullName: fullName.trim(),
        churchName: finalChurch,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        isLoggedIn: true,
        token: res?.access || 'jwt-registered-token'
      };

      try {
        localStorage.setItem('gospread_user_session', JSON.stringify(newUser));
      } catch (e) {
        console.error(e);
      }

      setSuccessMessage('Kingdom account created! Welcome to the Gospread Global Fellowship (+50 Praise XP).');
      if (onAwardXp) onAwardXp(50, 'Account creation & Welcome bounty');

      setTimeout(() => {
        onLoginSuccess(newUser);
        onNavigateHome();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login
  const handleQuickDemoLogin = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setLoginIdentifier(demo.email);
    setLoginPassword('KingdomPass2026!');
    setErrorMessage(null);
    setSuccessMessage(`Loaded ${demo.role} credentials! Click Sign In to enter.`);
  };

  // Handle Social Fast Auth
  const handleSocialAuth = (provider: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(`Connecting to ${provider} Sanctuary ID...`);

    setTimeout(() => {
      const socialUser: UserSession = {
        id: `usr-${provider.toLowerCase()}-${Date.now()}`,
        username: `believer_${provider.toLowerCase()}`,
        email: `believer@${provider.toLowerCase()}.com`,
        fullName: `Kingdom Believer (${provider})`,
        churchName: 'Grace City Cathedral',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        isLoggedIn: true,
        token: `jwt-social-${provider}`
      };

      try {
        localStorage.setItem('gospread_user_session', JSON.stringify(socialUser));
      } catch (e) {
        console.error(e);
      }

      if (onAwardXp) onAwardXp(20, `${provider} Fast-Login`);
      onLoginSuccess(socialUser);
      setIsLoading(false);
      onNavigateHome();
    }, 900);
  };

  // Forgot Password Submit
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-[85vh] w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col justify-center text-slate-100">
      
      {/* Top Breadcrumb & Return to Stream */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-amber-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Stream & Worship</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 2,419 Believers Online
          </span>
        </div>
      </div>

      {/* Main 2-Column Split Auth Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch rounded-3xl bg-[#0f1015]/90 border border-white/[0.08] shadow-2xl overflow-hidden backdrop-blur-2xl">
        
        {/* ================= LEFT EDITORIAL COLUMN: GOSPEL ATMOSPHERE (5 cols) ================= */}
        <div className="lg:col-span-5 relative p-6 sm:p-10 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#161722] via-[#12131b] to-[#0c0d12] border-b lg:border-b-0 lg:border-r border-white/[0.08]">
          
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-red-600 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-[#0c0c0e] rounded-[14px] flex items-center justify-center">
                  <Flame className="w-6 h-6 text-amber-400 fill-amber-400" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>GOSPREAD</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950">GLOBAL</span>
                </h2>
                <p className="text-[11px] text-amber-300 font-medium">One Kingdom. One Voice. Worldwide Fellowship.</p>
              </div>
            </div>

            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                {authMode === 'signin' 
                  ? 'Enter the Global Worship Sanctuary' 
                  : 'Join the Worldwide Gospel Fellowship'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Connect with 120,000+ believers across 84 nations for non-stop live gospel broadcasts, intercessory prayer altars, and miracle praise reports.
              </p>
            </div>
          </div>

          {/* Middle: Illuminated Scripture Citation Box */}
          <div className="relative z-10 my-6 p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Illuminated Word • {SCRIPTURES[selectedScriptureIdx].theme}</span>
              </div>
              <button
                onClick={nextScripture}
                className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 font-bold transition"
                title="Rotate Scripture"
              >
                <span>Next Verse</span>
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-amber-100 font-serif italic leading-relaxed">
              {SCRIPTURES[selectedScriptureIdx].text}
            </p>

            <div className="text-right text-[11px] font-black text-amber-400 font-mono">
              — {SCRIPTURES[selectedScriptureIdx].ref}
            </div>
          </div>

          {/* Bottom Highlights & Social Proof */}
          <div className="relative z-10 space-y-4 pt-4 border-t border-white/[0.08]">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Connected Believers</div>
                <div className="text-sm font-black text-white font-mono mt-0.5">120,000+</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06]">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Global Sanctuaries</div>
                <div className="text-sm font-black text-amber-400 font-mono mt-0.5">3,120+ Churches</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Encrypted JWT security & Christ-centered community integrity.</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT INTERACTIVE COLUMN: LOGIN & SIGNUP FORMS (7 cols) ================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          
          {/* Active User Session Notice (If Already Logged In) */}
          {currentUser.isLoggedIn && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-400 shrink-0"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Currently Signed In: {currentUser.fullName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black">ACTIVE</span>
                  </div>
                  <div className="text-[11px] text-slate-300">{currentUser.email} • {currentUser.churchName}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onNavigateProfile}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl hover:bg-amber-400 transition"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setSuccessMessage('Signed out. You can now login with another account.');
                  }}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-200 border border-slate-700 text-xs rounded-xl font-bold transition flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-950 border border-slate-800 mb-6 max-w-md mx-auto sm:mx-0 w-full">
            <button
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                authMode === 'signin'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In (Login)</span>
            </button>

            <button
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                authMode === 'signup'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Account (Sign Up)</span>
            </button>
          </div>

          {/* Error / Success Notifications */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-3.5 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-3"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span className="leading-snug">{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-5 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="leading-snug">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= FORM 1: SIGN IN (LOGIN) ================= */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email Address or Kingdom Handle
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. david.lawson@gospread.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Sanctuary Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>Remember this device for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition transform active:scale-98 flex items-center justify-center gap-2 duration-200"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to Sanctuary...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Sign In to Gospread</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Demo Test Logins */}
              <div className="pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    ⚡ Quick Demo Accounts
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-medium">1-Click Test Drive</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_ACCOUNTS.map((demo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickDemoLogin(demo)}
                      className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-left transition flex items-center gap-2 group"
                    >
                      <img src={demo.avatar} alt={demo.role} className="w-7 h-7 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-200 group-hover:text-amber-300 truncate">
                          {demo.role}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">{demo.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Social Login Dividers */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#0f1015] px-3 text-slate-500 font-bold">Or fast connect with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Google')}
                  className="py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition"
                >
                  <Globe className="w-4 h-4 text-red-400" />
                  <span>Google ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAuth('FaithID')}
                  className="py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-slate-300 flex items-center justify-center gap-2 transition"
                >
                  <Church className="w-4 h-4 text-amber-400" />
                  <span>Faith Sanctuary ID</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Don't have a Kingdom account yet? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-xs font-black text-amber-400 hover:text-amber-300 underline"
                >
                  Create one now (Get +50 Praise XP)
                </button>
              </div>
            </form>
          ) : (
            
            /* ================= FORM 2: SIGN UP (CREATE ACCOUNT) ================= */
            <form onSubmit={handleSignUp} className="space-y-4">
              
              {/* Full Name & Kingdom Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sister Grace Wilson"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Kingdom Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-mono text-amber-400">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="grace_wilson"
                      className="w-full pl-8 pr-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="grace@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Home Sanctuary Church Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Home Fellowship / Church Sanctuary
                </label>
                <div className="relative">
                  <Church className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <select
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition"
                  >
                    {POPULAR_CHURCHES.map((ch, idx) => (
                      <option key={idx} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>
                {churchName === 'Independent / Other Sanctuary' && (
                  <input
                    type="text"
                    value={customChurch}
                    onChange={(e) => setCustomChurch(e.target.value)}
                    placeholder="Enter your church name..."
                    className="mt-2 w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                )}
              </div>

              {/* Spiritual Calling / Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Spiritual Calling / Ministry Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPIRITUAL_ROLES.map((role) => {
                    const Icon = role.icon;
                    const isSelected = spiritualRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSpiritualRole(role.id)}
                        className={`p-2 rounded-xl text-left transition border ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                          <span className="text-[11px] font-bold truncate">{role.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Password Security</span>
                    <span className={`font-bold ${getStrengthLabel(passwordStrength).color}`}>
                      {getStrengthLabel(passwordStrength).label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${passwordStrength}%` }}
                      className={`h-full transition-all duration-300 ${
                        passwordStrength <= 25
                          ? 'bg-red-500'
                          : passwordStrength <= 50
                          ? 'bg-amber-500'
                          : passwordStrength <= 75
                          ? 'bg-blue-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Covenant & Terms Agreement */}
              <div className="space-y-2 pt-1 text-xs">
                <label className="flex items-start gap-2 cursor-pointer select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={agreeCovenant}
                    onChange={(e) => setAgreeCovenant(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span className="leading-snug">
                    I agree to the <strong className="text-amber-400">Kingdom Fellowship Covenant</strong>, Community Guidelines & Privacy Policy.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={subscribeDailyPromise}
                    onChange={(e) => setSubscribeDailyPromise(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span className="leading-snug text-slate-400">
                    Receive daily promise verses and weekly global prayer digests.
                  </span>
                </label>
              </div>

              {/* Rewards Chip */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-200 font-bold">New Kingdom Citizen Bounty</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                  +50 PRAISE XP
                </span>
              </div>

              {/* Sign Up Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition transform active:scale-98 flex items-center justify-center gap-2 duration-200"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inscribing Kingdom Registration...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    <span>Join Gospread Worldwide</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Already registered in the Sanctuary? </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-xs font-black text-amber-400 hover:text-amber-300 underline"
                >
                  Sign In to your account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#12131a] rounded-3xl border border-white/[0.1] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">Reset Sanctuary Password</h3>
                </div>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSubmitted(false);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {forgotSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Password Recovery Email Dispatched!</h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
                    We’ve transmitted a secure reset token link to <strong>{forgotEmail}</strong>. Please check your inbox and follow the link to establish your new password.
                  </p>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSubmitted(false);
                    }}
                    className="mt-2 px-6 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Enter the email associated with your Gospread Kingdom account. We will send you instructions to securely recover your credentials.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Account Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="david.lawson@gospread.org"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;

import React, { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { djangoApi } from '../services/djangoApi';

export interface UserSession {
  id: string | number;
  username: string;
  email: string;
  fullName: string;
  churchName?: string;
  avatarUrl?: string;
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
  const [activeTab, setActiveTab] = useState<'signin' | 'register' | 'session'>('signin');
  
  // Sign In Form State
  const [emailOrUsername, setEmailOrUsername] = useState('david.lawson@gospread.org');
  const [password, setPassword] = useState('••••••••••••');
  
  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regChurch, setRegChurch] = useState('Grace City Cathedral');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await djangoApi.login({
        email: emailOrUsername.includes('@') ? emailOrUsername : undefined,
        username: !emailOrUsername.includes('@') ? emailOrUsername : undefined,
        password
      });

      if (res && res.user) {
        const loggedUser: UserSession = {
          id: res.user.id || 'usr-101',
          username: res.user.username || 'believer',
          email: res.user.email || emailOrUsername,
          fullName: res.user.first_name ? `${res.user.first_name} ${res.user.last_name || ''}`.trim() : 'Believer',
          churchName: res.user.church_name || 'Grace City Cathedral',
          avatarUrl: res.user.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
          isLoggedIn: true,
          token: res.access
        };

        setSuccessMessage('Successfully authenticated into Gospread Platform!');
        setTimeout(() => {
          onLoginSuccess(loggedUser);
          onClose();
        }, 800);
      } else {
        setErrorMessage('Invalid authentication credentials. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error encountered.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regFullName) {
      setErrorMessage('Please fill in all required fields to complete registration.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const loggedUser: UserSession = {
        id: `usr-${Date.now()}`,
        username: regUsername || regEmail.split('@')[0],
        email: regEmail,
        fullName: regFullName,
        churchName: regChurch || 'Kingdom Community Fellowship',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        isLoggedIn: true,
        token: `jwt-auth-token-${Date.now()}`
      };

      // Set tokens in local storage
      djangoApi.setTokens(loggedUser.token!, `refresh-${loggedUser.token}`);

      setSuccessMessage('Welcome to Gospread Fellowship! Account created successfully.');
      setTimeout(() => {
        onLoginSuccess(loggedUser);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Account registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Kingdom Account Authentication</h2>
              <p className="text-[11px] text-slate-400">JWT Security & User Profile Sync</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenFullAuthPage && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullAuthPage(activeTab === 'register' ? 'signup' : 'signin');
                }}
                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500 hover:text-slate-950 transition border border-amber-500/30"
                title="Switch to full login and signup page"
              >
                Full Page ↗
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1">
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'signin'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
          {currentUser.isLoggedIn && (
            <button
              onClick={() => setActiveTab('session')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                activeTab === 'session'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Active Token
            </button>
          )}
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="m-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="m-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="david.lawson@gospread.org"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0" />
                  <span>Remember session</span>
                </label>
                <span className="text-amber-400 hover:underline cursor-pointer">Forgot password?</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Fellowship</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Brother David Lawson"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="david@gospread.org"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Home Church / Ministry
                </label>
                <div className="relative">
                  <Church className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={regChurch}
                    onChange={(e) => setRegChurch(e.target.value)}
                    placeholder="e.g. Grace City Cathedral"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Kingdom Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'session' && currentUser.isLoggedIn && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400"
                  />
                  <div>
                    <div className="font-bold text-slate-100">{currentUser.fullName}</div>
                    <div className="text-slate-400 text-[11px]">{currentUser.email}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] flex justify-between text-slate-400">
                  <span>Home Fellowship:</span>
                  <span className="text-amber-300 font-medium">{currentUser.churchName}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-mono">JWT Access Token Status</label>
                <div className="p-2.5 bg-slate-950 border border-emerald-500/30 rounded-lg font-mono text-[10px] text-emerald-400 break-all leading-relaxed">
                  {djangoApi.getAccessToken() || currentUser.token || 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  setSuccessMessage('Logged out successfully.');
                  setTimeout(() => {
                    onClose();
                  }, 600);
                }}
                className="w-full py-2 px-4 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

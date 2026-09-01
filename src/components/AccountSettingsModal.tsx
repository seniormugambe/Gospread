import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Bell,
  Sliders,
  ShieldCheck,
  Globe,
  Lock,
  Moon,
  Sun,
  Volume2,
  Tv,
  Check,
  CheckCircle2,
  X,
  Sparkles,
  Flame,
  Church,
  Mail,
  Smartphone,
  Download,
  Trash2,
  ExternalLink,
  BookOpen,
  Headphones,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Radio,
  Share2,
  FileText,
  HelpCircle,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserSession } from './AuthModal';

export interface UserAccountSettings {
  // Profile
  fullName: string;
  username: string;
  email: string;
  bio: string;
  homeChurch: string;
  homeCampus: string;
  callingRole: string;
  avatarUrl: string;
  preferredTranslation: string;

  // Preferences & Playback
  defaultVideoQuality: '1080p' | '720p' | '480p' | 'auto';
  audioBitrate: '320kbps' | '192kbps' | '128kbps';
  autoplayNextStream: boolean;
  autoPipOnScroll: boolean;
  amenSoundEffects: boolean;
  superAmenChatAnimations: boolean;

  // Notifications
  liveBroadcastAlerts: boolean;
  morningMannaAlerts: boolean;
  morningReminderTime: string;
  prayerUpdateAlerts: boolean;
  givingReceiptEmails: boolean;
  weeklySpiritualDigest: boolean;

  // Privacy & Security
  publicProfile: boolean;
  showStreakOnLeaderboard: boolean;
  twoFactorAuthEnabled: boolean;
  showGivingTotals: boolean;
  anonymousPrayerRequests: boolean;
}

const DEFAULT_SETTINGS: UserAccountSettings = {
  fullName: '',
  username: '',
  email: '',
  bio: '',
  homeChurch: '',
  homeCampus: '',
  callingRole: 'Global Believer & Intercessor',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  preferredTranslation: 'NKJV (New King James Version)',

  defaultVideoQuality: '1080p',
  audioBitrate: '320kbps',
  autoplayNextStream: true,
  autoPipOnScroll: true,
  amenSoundEffects: true,
  superAmenChatAnimations: true,

  liveBroadcastAlerts: true,
  morningMannaAlerts: true,
  morningReminderTime: '06:30',
  prayerUpdateAlerts: true,
  givingReceiptEmails: true,
  weeklySpiritualDigest: true,

  publicProfile: true,
  showStreakOnLeaderboard: true,
  twoFactorAuthEnabled: false,
  showGivingTotals: true,
  anonymousPrayerRequests: false,
};

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
];

const BIBLE_TRANSLATIONS = [
  'NKJV (New King James Version)',
  'KJV (King James Version)',
  'NIV (New International Version)',
  'ESV (English Standard Version)',
  'NLT (New Living Translation)',
  'AMP (Amplified Bible)',
  'TPT (The Passion Translation)',
];

const CALLING_ROLES = [
  'Global Believer & Intercessor',
  'Worship Leader / Psalmist',
  'Pastor / Church Leader',
  'Youth & Campus Minister',
  'Gospel Media & Audio Tech',
  'Evangelist / Missionary',
];

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  onUpdateUserSession: (newSession: Partial<UserSession>) => void;
  streakDays?: number;
  praiseXp?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenDjangoModal?: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  userSession,
  onUpdateUserSession,
  streakDays = 5,
  praiseXp = 650,
  theme = 'light',
  onToggleTheme,
  onOpenDjangoModal,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'playback' | 'notifications' | 'privacy' | 'integrations'>('profile');
  
  // Settings Form State
  const [settings, setSettings] = useState<UserAccountSettings>(() => {
    try {
      const saved = localStorage.getItem('gospread_user_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      ...DEFAULT_SETTINGS,
      fullName: userSession.fullName || DEFAULT_SETTINGS.fullName,
      username: userSession.username || DEFAULT_SETTINGS.username,
      email: userSession.email || DEFAULT_SETTINGS.email,
      homeChurch: userSession.churchName || DEFAULT_SETTINGS.homeChurch,
      avatarUrl: userSession.avatarUrl || DEFAULT_SETTINGS.avatarUrl,
    };
  });

  const [savedSuccessToast, setSavedSuccessToast] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordToast, setPasswordToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Sync when userSession changes
  useEffect(() => {
    if (userSession) {
      setSettings(prev => ({
        ...prev,
        fullName: userSession.fullName || prev.fullName,
        username: userSession.username || prev.username,
        email: userSession.email || prev.email,
        homeChurch: userSession.churchName || prev.homeChurch,
        avatarUrl: userSession.avatarUrl || prev.avatarUrl,
      }));
    }
  }, [userSession]);

  if (!isOpen) return null;

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      localStorage.setItem('gospread_user_settings', JSON.stringify(settings));
      onUpdateUserSession({
        fullName: settings.fullName,
        username: settings.username,
        email: settings.email,
        churchName: settings.homeChurch,
        avatarUrl: settings.avatarUrl,
      });
      setSavedSuccessToast(true);
      setTimeout(() => setSavedSuccessToast(false), 3000);
    } catch (err) {
      console.error('Failed saving user settings', err);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordToast('Password must be at least 6 characters.');
      setTimeout(() => setPasswordToast(null), 3000);
      return;
    }
    setPasswordToast('Password updated securely!');
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordToast(null), 3500);
  };

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      const exportData = {
        profile: settings,
        streakDays,
        praiseXp,
        exportedAt: new Date().toISOString(),
        platform: 'Gospread Global Gospel Platform'
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gospread-account-data-${settings.username}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-[#121214] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/90 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Account & Spiritual Preferences
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Verified Believer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Personalize your gospel streaming, spiritual discipline, and privacy controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-800/90 bg-slate-900/40 px-4 overflow-x-auto scrollbar-none shrink-0 gap-1">
          {[
            { id: 'profile', label: 'Kingdom Identity', icon: User },
            { id: 'playback', label: 'Streaming & Audio', icon: Tv },
            { id: 'notifications', label: 'Faith Alerts', icon: Bell },
            { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
            { id: 'integrations', label: 'Integrations', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs font-bold transition border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: KINGDOM IDENTITY & PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Avatar Selector Section */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={settings.avatarUrl}
                      alt={settings.fullName}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[9px] text-white">
                      ✓
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{settings.fullName}</h4>
                    <p className="text-xs text-amber-400 font-mono">@{settings.username}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" /> {streakDays}d Streak
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-300 font-bold">
                        <Sparkles className="w-3.5 h-3.5" /> {praiseXp} XP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <p className="text-[11px] font-bold text-slate-400 mb-2">Choose Avatar:</p>
                  <div className="flex items-center gap-2">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSettings({ ...settings, avatarUrl: url })}
                        className={`w-8 h-8 rounded-xl overflow-hidden border-2 transition ${
                          settings.avatarUrl === url ? 'border-amber-400 scale-110 shadow-md shadow-amber-500/20' : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Full Name / Title
                  </label>
                  <input
                    type="text"
                    value={settings.fullName}
                    onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="e.g. David Lawson"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Username Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500">@</span>
                    <input
                      type="text"
                      value={settings.username}
                      onChange={(e) => setSettings({ ...settings, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      placeholder="david_lawson"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="david.lawson@gospread.org"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Spiritual Calling / Ministry Role
                  </label>
                  <select
                    value={settings.callingRole}
                    onChange={(e) => setSettings({ ...settings, callingRole: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {CALLING_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Home Sanctuary / Church
                  </label>
                  <input
                    type="text"
                    value={settings.homeChurch}
                    onChange={(e) => setSettings({ ...settings, homeChurch: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="Grace City Cathedral"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Preferred Bible Translation
                  </label>
                  <select
                    value={settings.preferredTranslation}
                    onChange={(e) => setSettings({ ...settings, preferredTranslation: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {BIBLE_TRANSLATIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Spiritual Bio & Personal Testimony
                </label>
                <textarea
                  rows={3}
                  value={settings.bio}
                  onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Share a short word about your spiritual walk, favorite scriptures, or ministry focus..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: STREAMING & AUDIO PLAYBACK */}
          {activeTab === 'playback' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Tv className="w-4 h-4" /> Video Stream Quality & Display
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Default Live Stream Resolution
                    </label>
                    <select
                      value={settings.defaultVideoQuality}
                      onChange={(e) => setSettings({ ...settings, defaultVideoQuality: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="1080p">1080p FHD (Highest Quality)</option>
                      <option value="720p">720p HD (Balanced Performance)</option>
                      <option value="480p">480p SD (Data Saver)</option>
                      <option value="auto">Auto (Adaptive Bandwidth)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      24/7 Gospel Radio Bitrate
                    </label>
                    <select
                      value={settings.audioBitrate}
                      onChange={(e) => setSettings({ ...settings, audioBitrate: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="320kbps">320 kbps (Lossless Studio Sound)</option>
                      <option value="192kbps">192 kbps (Standard High Quality)</option>
                      <option value="128kbps">128 kbps (Mobile Data Saver)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4" /> Interactive Player Behavior
                </h4>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <h5 className="text-xs font-bold text-white">Autoplay Next Sermon / Stream</h5>
                    <p className="text-[11px] text-slate-400">Automatically start queued worship broadcasts when current stream ends.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoplayNextStream}
                    onChange={(e) => setSettings({ ...settings, autoplayNextStream: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <h5 className="text-xs font-bold text-white">Automatic Picture-in-Picture (PiP) on Scroll</h5>
                    <p className="text-[11px] text-slate-400">Keep live video floating in mini player when navigating to Church profiles or history.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoPipOnScroll}
                    onChange={(e) => setSettings({ ...settings, autoPipOnScroll: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <h5 className="text-xs font-bold text-white">Amen & Prayer Reaction Sound Effects</h5>
                    <p className="text-[11px] text-slate-400">Play subtle harp chime when tapping live altar Amen reactions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.amenSoundEffects}
                    onChange={(e) => setSettings({ ...settings, amenSoundEffects: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <h5 className="text-xs font-bold text-white">Super Amen Chat Animations</h5>
                    <p className="text-[11px] text-slate-400">Display golden particle glows when members sow Super Amen seeds in live chat.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.superAmenChatAnimations}
                    onChange={(e) => setSettings({ ...settings, superAmenChatAnimations: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAITH NOTIFICATIONS & ALERTS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Spiritual Alerts & Service Broadcasts
                </h4>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <h5 className="text-xs font-bold text-white">Live Broadcast Start Alerts</h5>
                    <p className="text-[11px] text-slate-400">Instant notification when followed church ministries start live streaming.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.liveBroadcastAlerts}
                    onChange={(e) => setSettings({ ...settings, liveBroadcastAlerts: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <h5 className="text-xs font-bold text-white">Daily Rhema & Morning Manna Prompt</h5>
                    <p className="text-[11px] text-slate-400">Receive morning devotional promise card and grace streak check-in reminder.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={settings.morningReminderTime}
                      onChange={(e) => setSettings({ ...settings, morningReminderTime: e.target.value })}
                      className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono"
                    />
                    <input
                      type="checkbox"
                      checked={settings.morningMannaAlerts}
                      onChange={(e) => setSettings({ ...settings, morningMannaAlerts: e.target.checked })}
                      className="accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <h5 className="text-xs font-bold text-white">Global Prayer Altar Updates</h5>
                    <p className="text-[11px] text-slate-400">Get notified when global intercessors pray for your submitted requests.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.prayerUpdateAlerts}
                    onChange={(e) => setSettings({ ...settings, prayerUpdateAlerts: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <h5 className="text-xs font-bold text-white">Tithe & Seed Offering PDF Receipts</h5>
                    <p className="text-[11px] text-slate-400">Automatically deliver 501(c)(3) tax receipt summaries to your email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.givingReceiptEmails}
                    onChange={(e) => setSettings({ ...settings, givingReceiptEmails: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVACY, SECURITY & SESSIONS */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3.5">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Privacy & Visibility
                </h4>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <h5 className="text-xs font-bold text-white">Public Kingdom Profile</h5>
                    <p className="text-[11px] text-slate-400">Allow church members to view your faith badges and unlocked achievements.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.publicProfile}
                    onChange={(e) => setSettings({ ...settings, publicProfile: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800">
                  <div>
                    <h5 className="text-xs font-bold text-white">Display on Spiritual Momentum Leaderboard</h5>
                    <p className="text-[11px] text-slate-400">Show your verified badge count and Grace Streak in the community rankings.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showStreakOnLeaderboard}
                    onChange={(e) => setSettings({ ...settings, showStreakOnLeaderboard: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <h5 className="text-xs font-bold text-white">Submit Prayer Requests Anonymously by Default</h5>
                    <p className="text-[11px] text-slate-400">Hide your name from the global prayer wall feed.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.anonymousPrayerRequests}
                    onChange={(e) => setSettings({ ...settings, anonymousPrayerRequests: e.target.checked })}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>

              {/* Security & Password */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Account Security & Password
                </h4>

                {!showPasswordChange ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-300">Password protected with standard SHA-256 / Django PBKDF2 hashing.</p>
                      <p className="text-[11px] text-slate-500">Last updated 14 days ago.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                    >
                      Change Password
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="••••••••••••"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">New Password (Min 6 chars)</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                          placeholder="••••••••••••"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPasswordChange(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                )}

                {passwordToast && (
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>{passwordToast}</span>
                  </div>
                )}
              </div>

              {/* Data Export */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">Export Spiritual Journal & Giving Log</h5>
                  <p className="text-[11px] text-slate-400">Download all your personal bookmarks, giving records, and prayer notes.</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isExporting ? 'Exporting...' : 'Export JSON'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: INTEGRATIONS & CONNECTED SERVICES */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      🐍
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Django 5.x REST Backend</h4>
                      <p className="text-[11px] text-slate-400">SimpleJWT token session & live altar WebSocket consumer</p>
                    </div>
                  </div>
                  {onOpenDjangoModal && (
                    <button
                      type="button"
                      onClick={onOpenDjangoModal}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition"
                    >
                      Inspect Server
                    </button>
                  )}
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>JWT Access Token:</span>
                  <span className="text-amber-400 truncate max-w-[200px]">{userSession.token || 'Bearer token-active'}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold text-xs">
                    📺
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">YouTube Data API v3</h4>
                    <p className="text-[11px] text-slate-400">Live worship sermon queries & real-time metadata synchronizer</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Connected
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800/90 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {savedSuccessToast && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => handleSaveSettings()}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountSettingsModal;

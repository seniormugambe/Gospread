import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Flame,
  Sparkles,
  DollarSign,
  Heart,
  Bookmark,
  Check,
  Edit2,
  Share2,
  Bell,
  ShieldCheck,
  Play,
  Trash2,
  Copy,
  Video,
  Headphones,
  Tv,
  Settings,
  Plus,
  Compass,
  ImagePlus,
  UserPlus,
  X,
  Church,
  Star,
  Camera,
  ChevronRight,
  CheckCircle2,
  Music,
  LayoutGrid,
  List,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoStream, AudioTrack, PublicUserMedia } from '../services/djangoApi';
import { djangoApi } from '../services/djangoApi';
import { GivingTarget } from './GivingModal';
import { UserSession } from './AuthModal';
import { profilePath } from '../lib/routes';
import { shareWithInvite } from '../lib/invites';
import OnboardingProfileCard from './OnboardingProfileCard';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmtDuration = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

const toVideoCategory = (category: string): VideoStream['category'] => {
  const n = category.toLowerCase();
  if (n.includes('worship')) return 'Live Worship';
  if (n.includes('choir')) return 'Choir Special';
  if (n.includes('music')) return 'Gospel Music';
  if (n.includes('bible') || n.includes('study')) return 'Bible Study';
  return 'Sermon';
};

const toVideo = (m: PublicUserMedia): VideoStream => ({
  id: String(m.id),
  title: m.title,
  speakerOrArtist: m.speaker,
  churchOrMinistry: m.church_name,
  channelAvatar: m.channel_avatar,
  subscribersCount: '',
  likesCount: String(m.view_count),
  category: toVideoCategory(m.category),
  isLive: false,
  mediaKind: 'video',
  viewsText: `${m.view_count} views`,
  duration: m.duration_seconds ? fmtDuration(m.duration_seconds) : undefined,
  thumbnail: m.thumbnail_url,
  description: m.description,
  date: m.published_at ? new Date(m.published_at).toLocaleDateString() : 'Recent',
  videoUrl: m.media_url,
});

const toAudio = (m: PublicUserMedia): AudioTrack => ({
  id: String(m.id),
  title: m.title,
  artistOrPreacher: m.speaker,
  albumOrSeries: m.church_name,
  channelAvatar: m.channel_avatar,
  category: 'Audio Sermon',
  coverUrl: m.thumbnail_url,
  duration: m.duration_seconds ? fmtDuration(m.duration_seconds) : '',
  lyricsOrNotes: m.description,
  publishedDate: m.published_at ? new Date(m.published_at).toLocaleDateString() : 'Recent',
  audioUrl: m.media_url,
});

// ─── types ──────────────────────────────────────────────────────────────────

type TabId = 'bookmarks' | 'media' | 'giving' | 'prayers' | 'subscriptions';

interface UserProfilePageProps {
  streakDays: number;
  praiseXp: number;
  totalGivingAmount: number;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onPlayVideo: (video: VideoStream) => void;
  onPlayAudio: (track: AudioTrack) => void;
  subscribedChannels: string[];
  joinedChurches?: string[];
  churchMemberCounts?: Record<string, number>;
  onSelectChannelModal?: (channelName: string) => void;
  onToggleJoinChurch?: (channelName: string) => void;
  onToggleSubscribe: (channel: string) => void;
  onOpenGivingModal: (target?: GivingTarget) => void;
  onOpenPrayerModal: () => void;
  onOpenSettingsModal?: () => void;
  onOpenCommunity?: () => void;
  onOpenDiscover?: () => void;
  onOpenAuthPage?: (mode?: 'signin' | 'signup') => void;
  currentUser?: UserSession;
  onUpdateProfile?: (profile: Partial<UserSession> & { avatarFile?: File | null }) => void | Promise<void>;
}

// ─── small sub-components ───────────────────────────────────────────────────

function StatPill({ icon: Icon, label, value, accent = false }: {
  icon: React.ElementType; label: string; value: string | number; accent?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-0.5 px-4 py-3 rounded-2xl border ${accent ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900/80 border-slate-800'}`}>
      <Icon className={`w-4 h-4 mb-0.5 ${accent ? 'text-amber-400' : 'text-slate-400'}`} />
      <span className={`text-lg font-black font-serif ${accent ? 'text-amber-300' : 'text-white'}`}>{value}</span>
      <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{label}</span>
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${on ? 'bg-amber-500 border-amber-400' : 'bg-slate-700 border-slate-600'}`}
      aria-label={label}
    >
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-md transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function EmptyState({ icon: Icon, title, hint, action }: {
  icon: React.ElementType; title: string; hint?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-800 bg-slate-950/40 py-14 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800">
        <Icon className="w-6 h-6 text-slate-600" />
      </span>
      <p className="text-sm font-semibold text-slate-400">{title}</p>
      {hint && <p className="text-xs text-slate-600 max-w-xs">{hint}</p>}
      {action}
    </div>
  );
}

// ─── main component ─────────────────────────────────────────────────────────

export default function UserProfilePage({
  streakDays,
  praiseXp,
  totalGivingAmount,
  savedIds,
  onToggleSave,
  onPlayVideo,
  onPlayAudio,
  subscribedChannels,
  joinedChurches = [],
  onSelectChannelModal,
  onToggleJoinChurch,
  onToggleSubscribe,
  onOpenGivingModal,
  onOpenPrayerModal,
  onOpenSettingsModal,
  onOpenCommunity,
  onOpenDiscover,
  onOpenAuthPage,
  currentUser,
  onUpdateProfile,
}: UserProfilePageProps) {
  const [activeTab, setActiveTab] = useState<TabId>('bookmarks');

  // ── edit form state ────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(currentUser?.fullName || currentUser?.username || '');
  const [userBio, setUserBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || currentUser?.avatar || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── toasts / clipboard ────────────────────────────────────────────────────
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // ── preference toggles ────────────────────────────────────────────────────
  const readPref = (key: string, def = true) => {
    try { const v = localStorage.getItem(key); return v !== null ? v === 'true' : def; } catch { return def; }
  };
  const writePref = (key: string, val: boolean) => { try { localStorage.setItem(key, String(val)); } catch {} };

  const [notifService, setNotifService] = useState(() => readPref('gospread_pref_service_alerts'));
  const [notifRhema, setNotifRhema] = useState(() => readPref('gospread_pref_daily_rhema'));
  const [audioHd, setAudioHd] = useState(() => readPref('gospread_pref_audio_hd'));
  const [publicProfile, setPublicProfile] = useState(() => readPref('gospread_pref_public_profile'));

  // ── media ─────────────────────────────────────────────────────────────────
  const [savedVideos, setSavedVideos] = useState<VideoStream[]>([]);
  const [savedAudios, setSavedAudios] = useState<AudioTrack[]>([]);
  const [publicMedia, setPublicMedia] = useState<PublicUserMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [mediaView, setMediaView] = useState<'grid' | 'list'>('grid');

  // ── other data ─────────────────────────────────────────────────────────────
  const [givingLogs] = useState<Array<{ id: string; target: string; date: string; amount: number; category: string }>>(() => {
    try { return JSON.parse(localStorage.getItem('gospread_giving_logs') || '[]'); } catch { return []; }
  });

  const [myPrayers, setMyPrayers] = useState<Array<{ id: string; title: string; date: string; status: string; praiseReport: string | null }>>(() => {
    try { return JSON.parse(localStorage.getItem('gospread_user_prayers') || '[]'); } catch { return []; }
  });

  // ── sync currentUser → form fields ────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.isLoggedIn) return;
    setUserName(currentUser.fullName || currentUser.username || '');
    setUserBio(currentUser.bio || '');
    setAvatarUrl(currentUser.avatarUrl || currentUser.avatar || '');
    setAvatarFile(null);
  }, [currentUser]);

  // ── load public media ─────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    if (!currentUser?.isLoggedIn || !currentUser.username) {
      setPublicMedia([]); return;
    }
    setMediaLoading(true);
    setMediaError('');
    djangoApi.getPublicUserProfile(currentUser.username)
      .then(p => { if (alive) setPublicMedia(p.media || []); })
      .catch(() => { if (alive) setMediaError('Could not load your public media.'); })
      .finally(() => { if (alive) setMediaLoading(false); });
    return () => { alive = false; };
  }, [currentUser?.isLoggedIn, currentUser?.username]);

  // ── load saved sermons ────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    if (!currentUser?.isLoggedIn) { setSavedVideos([]); setSavedAudios([]); return; }
    djangoApi.getSavedSermons().then(saved => {
      if (!alive) return;
      const all = saved.map((s: any) => s.sermon_detail).filter(Boolean);
      setSavedVideos(all.filter((s: any) => s.kind !== 'audio').map((s: any) => ({
        id: String(s.id), title: s.title, speakerOrArtist: s.speaker,
        churchOrMinistry: s.church_name || '', channelAvatar: s.channel_avatar || '',
        subscribersCount: '', likesCount: String(s.view_count || 0),
        category: s.category || 'Sermon', isLive: false,
        viewsText: `${s.view_count || 0} views`,
        duration: s.duration_seconds ? fmtDuration(s.duration_seconds) : undefined,
        thumbnail: s.thumbnail_url || '', description: s.description || '',
        date: s.published_at ? new Date(s.published_at).toLocaleDateString() : '',
        videoUrl: s.media_url,
      })));
      setSavedAudios(all.filter((s: any) => s.kind === 'audio').map((s: any) => ({
        id: String(s.id), title: s.title, artistOrPreacher: s.speaker,
        albumOrSeries: s.church_name || '', channelAvatar: s.channel_avatar || '',
        category: 'Audio Sermon' as const,
        coverUrl: s.thumbnail_url || '',
        duration: s.duration_seconds ? fmtDuration(s.duration_seconds) : '',
        audioUrl: s.media_url,
      })));
    }).catch(() => { if (alive) { setSavedVideos([]); setSavedAudios([]); } });
    return () => { alive = false; };
  }, [currentUser?.isLoggedIn]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleAvatarFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setProfileSaveError('Choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setProfileSaveError('Image must be under 5 MB.'); return; }
    setProfileSaveError('');
    setAvatarFile(file);
    const reader = new FileReader();
    // Store the data: URL only for local preview — never sent to the API.
    reader.onload = () => setAvatarUrl(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => setProfileSaveError('Could not read the selected image.');
    reader.readAsDataURL(file);
  };

  // Resets local edit state to match the persisted user, used on cancel.
  const resetEditState = () => {
    setUserName(currentUser?.fullName || currentUser?.username || '');
    setUserBio(currentUser?.bio || '');
    setAvatarUrl(currentUser?.avatarUrl || currentUser?.avatar || '');
    setAvatarFile(null);
    setProfileSaveError('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProfile) return;
    setIsSavingProfile(true);
    setProfileSaveError('');
    try {
      await onUpdateProfile?.({
        fullName: userName.trim(),
        bio: userBio.trim(),
        // Only pass avatarUrl when it's a real remote URL (not a data: preview blob).
        // The File itself is always the authoritative upload source.
        avatarUrl: avatarFile ? undefined : (avatarUrl.startsWith('data:') ? undefined : avatarUrl),
        avatar: avatarUrl.startsWith('data:') ? undefined : (avatarUrl || undefined),
        avatarFile,
      });
      setAvatarFile(null); // clear the pending file after a successful save
      setIsEditing(false);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    } catch (err) {
      setProfileSaveError(err instanceof Error ? err.message : 'Unable to save changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleShare = async () => {
    const username = currentUser?.username;
    if (!username) { setShareError(true); setTimeout(() => setShareError(false), 3000); return; }
    const result = await shareWithInvite({
      title: `${currentUser?.fullName || username} on Gospread`,
      text: `Connect with ${currentUser?.fullName || `@${username}`} on Gospread.`,
      path: profilePath(username),
    });
    if (result === 'copied') { setShareCopied(true); setTimeout(() => setShareCopied(false), 2500); }
    else if (result === 'failed') { setShareError(true); setTimeout(() => setShareError(false), 3000); }
  };

  const togglePrayerStatus = (id: string) => {
    setMyPrayers(prev => {
      const updated = prev.map(p =>
        p.id === id ? { ...p, status: p.status === 'Answered' ? 'Active Prayer' : 'Answered', praiseReport: p.status === 'Active Prayer' ? 'Testimony: The Lord has answered this request!' : p.praiseReport } : p
      );
      try { localStorage.setItem('gospread_user_prayers', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  // ── derived display values ────────────────────────────────────────────────
  const initials = userName.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const handle = currentUser?.username ? `@${currentUser.username}` : '';
  const roleLabel: Record<string, string> = {
    believer: 'Believer', creator: 'Creator', pastor: 'Pastor / Church Leader', artiste: 'Gospel Artiste',
  };
  const roleName = roleLabel[currentUser?.role || ''] || 'Member';

  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'bookmarks', label: 'Saved', icon: Bookmark, count: savedIds.length },
    { id: 'media', label: 'Media', icon: Video, count: publicMedia.length },
    { id: 'giving', label: 'Giving', icon: DollarSign, count: givingLogs.length },
    { id: 'prayers', label: 'Prayers', icon: Heart, count: myPrayers.length },
    { id: 'subscriptions', label: 'Following', icon: Tv, count: subscribedChannels.length },
  ];

  // ============================================================
  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-28 font-sans">

      {/* ── HERO CARD ─────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">

        {/* Cover gradient */}
        <div className="h-36 sm:h-48 bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(ellipse 60% 60% at 70% 40%, #f59e0b55, transparent)' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent" />

          {/* Top-right action strip */}
          <div className="absolute top-3 right-3 flex gap-2 flex-wrap justify-end z-10">
            {onOpenSettingsModal && (
              <button onClick={onOpenSettingsModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-slate-200 text-xs font-semibold border border-white/10 hover:bg-black/70 transition">
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                Settings
              </button>
            )}
            <button onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-slate-200 text-xs font-semibold border border-white/10 hover:bg-black/70 transition"
              title="Share profile">
              {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : shareError ? <X className="w-3.5 h-3.5 text-red-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-400" />}
              {shareCopied ? 'Copied!' : shareError ? 'Failed' : 'Share'}
            </button>
            <button
              onClick={async () => {
                const name = currentUser?.fullName || currentUser?.username || 'a friend';
                const result = await shareWithInvite({ title: 'Join me on Gospread', text: `${name} is inviting you to Gospread.`, path: '/' });
                if (result === 'copied') { setInviteCopied(true); setTimeout(() => setInviteCopied(false), 2500); }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-sm text-amber-300 text-xs font-semibold border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 transition">
              {inviteCopied ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              {inviteCopied ? 'Copied!' : 'Invite'}
            </button>
          </div>
        </div>

        {/* Avatar + identity row */}
        <div className="px-5 sm:px-7 pb-6 -mt-14 sm:-mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">

            {/* Avatar */}
            <div className="relative shrink-0 self-start">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-slate-900 shadow-xl" />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-950 border-4 border-slate-900 shadow-xl flex items-center justify-center">
                  <span className="text-3xl font-black text-amber-100 font-serif select-none">{initials}</span>
                </div>
              )}
              {/* Edit avatar overlay */}
              {isEditing && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition group">
                  <Camera className="w-7 h-7 text-white" />
                </button>
              )}
              {currentUser?.isLoggedIn && !isEditing && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active" />
              )}
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only" onChange={e => handleAvatarFile(e.target.files?.[0])} />
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 space-y-1.5 sm:pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white font-serif leading-tight">
                  {userName || 'Guest Believer'}
                </h1>
                {currentUser?.isLoggedIn && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    <ShieldCheck className="w-3 h-3" /> {roleName}
                  </span>
                )}
              </div>
              {handle && <p className="text-xs font-mono text-amber-400">{handle}</p>}
              {currentUser?.churchName && (
                <p className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Church className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {currentUser.churchName}
                </p>
              )}
              {userBio ? (
                <p className="text-xs text-slate-400 leading-relaxed max-w-lg pt-0.5">
                  {userBio}
                </p>
              ) : !isEditing ? (
                <p className="text-xs text-slate-600 italic pt-0.5">No bio yet.</p>
              ) : null}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 shrink-0 sm:pb-1">
              <button onClick={() => { if (isEditing) { resetEditState(); } setIsEditing(e => !e); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${isEditing ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-800 text-white border-slate-700 hover:border-amber-500/60'}`}>
                {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5 text-amber-400" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
              <button onClick={() => onOpenGivingModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-lg shadow-amber-500/20">
                <DollarSign className="w-3.5 h-3.5" />
                Sow Seed
              </button>
              <button onClick={onOpenPrayerModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                Prayer
              </button>
              {onOpenCommunity && (
                <button onClick={onOpenCommunity}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 transition">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Fellowship
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── INLINE EDIT FORM ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isEditing && (
          <motion.form
            key="edit-form"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onSubmit={handleSaveProfile}
            className="rounded-3xl bg-slate-900 border border-amber-500/30 p-5 sm:p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit Profile
            </h3>

            {/* Avatar row */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-amber-600/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                {avatarUrl
                  ? <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  : <span className="text-xl font-black text-amber-300 font-serif">{initials}</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition">
                  <ImagePlus className="w-3.5 h-3.5 text-amber-400" /> Upload photo
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only" onChange={e => handleAvatarFile(e.target.files?.[0])} />
                </label>
                {avatarUrl && (
                  <button type="button" onClick={() => { setAvatarUrl(''); setAvatarFile(null); }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold border border-slate-700 transition">
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Full Name</label>
                <input type="text" value={userName} onChange={e => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 transition" />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Username</label>
                <input type="text" value={currentUser?.username || ''} disabled
                  className="w-full bg-slate-950/50 text-slate-500 p-2.5 rounded-xl border border-slate-800 font-mono cursor-not-allowed" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1.5">Bio</label>
                <textarea value={userBio} onChange={e => setUserBio(e.target.value)}
                  placeholder="A short statement about your faith or ministry…"
                  rows={3}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-500 transition resize-none" />
              </div>
            </div>

            {profileSaveError && (
              <p role="alert" className="text-xs text-red-400">{profileSaveError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { resetEditState(); setIsEditing(false); }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">
                Cancel
              </button>
              <button type="submit" disabled={isSavingProfile}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition disabled:opacity-60">
                {isSavingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* ── SAVED TOAST ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div key="toast" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            Profile updated successfully.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ONBOARDING CARD ───────────────────────────────────────────────── */}
      {currentUser?.isLoggedIn && <OnboardingProfileCard />}

      {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        <StatPill icon={Flame} label="Day streak" value={streakDays} accent />
        <StatPill icon={Star} label="Praise XP" value={praiseXp.toLocaleString()} accent />
        <StatPill icon={Bookmark} label="Saved" value={savedIds.length} />
        <StatPill icon={Tv} label="Following" value={subscribedChannels.length} />
      </div>

      {/* ── JOINED CHURCHES ───────────────────────────────────────────────── */}
      {joinedChurches.length > 0 && (
        <section className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Church className="w-4 h-4 text-amber-400" />
              Church Fellowships
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/25">
                {joinedChurches.length}
              </span>
            </h2>
            {onSelectChannelModal && (
              <button onClick={() => onSelectChannelModal(joinedChurches[0])}
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold transition">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {joinedChurches.map(name => (
              <div key={name} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 transition group">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                    <Church className="w-4 h-4" />
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition">{name}</p>
                    <p className="text-[10px] text-emerald-400">Member</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {onSelectChannelModal && (
                    <button onClick={() => onSelectChannelModal(name)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition">
                      Visit
                    </button>
                  )}
                  {onToggleJoinChurch && (
                    <button onClick={() => onToggleJoinChurch(name)}
                      className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400 text-[10px] border border-red-900/50 transition">
                      Leave
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MAIN TABS ─────────────────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Tab bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${active ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'}`}>
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-black ${active ? 'bg-slate-950/40 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── BOOKMARKS TAB ──────────────────────────────────────────── */}
        {activeTab === 'bookmarks' && (
          <AnimatePresence mode="wait">
            <motion.div key="bookmarks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {savedVideos.length === 0 && savedAudios.length === 0 ? (
                <EmptyState icon={Bookmark} title="No saved media yet"
                  hint="Bookmark any sermon or audio track to find it here." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedVideos.map(video => (
                    <div key={video.id} className="group flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition">
                      <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                        {video.thumbnail
                          ? <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          : <span className="flex h-full items-center justify-center text-slate-500"><Video className="w-5 h-5" /></span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition">{video.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{video.speakerOrArtist}</p>
                        {video.duration && <p className="text-[10px] text-slate-600 mt-0.5">{video.duration}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={() => onPlayVideo(video)}
                          className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center transition" title="Play">
                          <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                        </button>
                        <button onClick={() => onToggleSave(video.id)}
                          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-900/40 flex items-center justify-center text-slate-500 hover:text-red-400 transition" title="Remove">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {savedAudios.map(track => (
                    <div key={track.id} className="group flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-amber-500/10 flex items-center justify-center">
                        {track.coverUrl
                          ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                          : <Headphones className="w-5 h-5 text-amber-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition">{track.title}</p>
                        <p className="text-[10px] text-slate-500 truncate">{track.artistOrPreacher}</p>
                        {track.duration && <p className="text-[10px] text-slate-600 mt-0.5">{track.duration}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button onClick={() => onPlayAudio(track)}
                          className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center transition" title="Play">
                          <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                        </button>
                        <button onClick={() => onToggleSave(track.id)}
                          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-900/40 flex items-center justify-center text-slate-500 hover:text-red-400 transition" title="Remove">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── MEDIA TAB ───────────────────────────────────────────────── */}
        {activeTab === 'media' && (
          <AnimatePresence mode="wait">
            <motion.div key="media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Public Media</p>
                  <p className="text-[11px] text-slate-500">Your published videos and audio.</p>
                </div>
                {publicMedia.length > 0 && (
                  <div className="flex gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
                    <button onClick={() => setMediaView('grid')}
                      className={`p-1.5 rounded-lg transition ${mediaView === 'grid' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setMediaView('list')}
                      className={`p-1.5 rounded-lg transition ${mediaView === 'list' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {mediaLoading ? (
                <p role="status" className="text-center text-xs text-slate-500 py-10">Loading…</p>
              ) : mediaError ? (
                <p role="alert" className="text-center text-xs text-red-400 py-10">{mediaError}</p>
              ) : publicMedia.length === 0 ? (
                <EmptyState icon={Video} title="No public media yet"
                  hint="Publish a video or audio track from Creator Studio and it will appear here." />
              ) : mediaView === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {publicMedia.map(m => m.kind === 'video' ? (
                    <button key={`v${m.id}`} type="button" onClick={() => onPlayVideo(toVideo(m))}
                      className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 hover:border-amber-500/40 text-left transition">
                      <div className="relative aspect-video bg-slate-800">
                        {m.thumbnail_url
                          ? <img src={m.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          : <span className="flex h-full items-center justify-center text-slate-600"><Video className="w-8 h-8" /></span>}
                        <span className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition">
                          <span className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                          </span>
                        </span>
                        {m.duration_seconds > 0 && (
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                            {fmtDuration(m.duration_seconds)}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold text-white line-clamp-2">{m.title}</p>
                        <p className="mt-0.5 text-[10px] text-slate-500">{m.speaker} · {m.view_count} views</p>
                      </div>
                    </button>
                  ) : (
                    <button key={`a${m.id}`} type="button" onClick={() => onPlayAudio(toAudio(m))}
                      className="group flex items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-900 hover:border-amber-500/40 text-left transition">
                      <span className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-amber-500/10 flex items-center justify-center">
                        {m.thumbnail_url ? <img src={m.thumbnail_url} alt="" className="w-full h-full object-cover" /> : <Headphones className="w-6 h-6 text-amber-400" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-white line-clamp-2">{m.title}</span>
                        <span className="block text-[10px] text-slate-500 mt-0.5 truncate">{m.speaker}{m.duration_seconds ? ` · ${fmtDuration(m.duration_seconds)}` : ''}</span>
                      </span>
                      <Play className="w-4 h-4 text-amber-400 fill-current shrink-0 group-hover:scale-110 transition" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {publicMedia.map(m => (
                    <button key={m.id} type="button"
                      onClick={() => m.kind === 'video' ? onPlayVideo(toVideo(m)) : onPlayAudio(toAudio(m))}
                      className="group w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-900 hover:border-amber-500/40 text-left transition">
                      <span className={`w-10 h-10 shrink-0 rounded-xl overflow-hidden flex items-center justify-center ${m.thumbnail_url ? '' : m.kind === 'video' ? 'bg-slate-800 text-slate-500' : 'bg-amber-500/10 text-amber-400'}`}>
                        {m.thumbnail_url ? <img src={m.thumbnail_url} alt="" className="w-full h-full object-cover" /> : m.kind === 'video' ? <Video className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-xs font-semibold text-white truncate">{m.title}</span>
                        <span className="block text-[10px] text-slate-500 truncate">{m.speaker}{m.duration_seconds ? ` · ${fmtDuration(m.duration_seconds)}` : ''}</span>
                      </span>
                      <span className="text-[10px] text-slate-600 shrink-0 mr-1">{m.view_count} views</span>
                      <Play className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0 opacity-0 group-hover:opacity-100 transition" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── GIVING TAB ──────────────────────────────────────────────── */}
        {activeTab === 'giving' && (
          <AnimatePresence mode="wait">
            <motion.div key="giving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Giving History</p>
                  <p className="text-[11px] text-slate-500">Total sowed: <span className="text-emerald-400 font-bold">${totalGivingAmount.toLocaleString()}</span></p>
                </div>
                <button onClick={() => onOpenGivingModal()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition">
                  <Plus className="w-3.5 h-3.5" /> New Offering
                </button>
              </div>

              {givingLogs.length === 0 ? (
                <EmptyState icon={DollarSign} title="No giving records yet"
                  hint="Your receipts and history appear here after sowing a seed." />
              ) : (
                <div className="space-y-2">
                  {givingLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                      <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <DollarSign className="w-4.5 h-4.5 text-emerald-400" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{log.target}</p>
                        <p className="text-[10px] text-slate-500">{log.category} · {log.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-emerald-400">${log.amount}</p>
                        <p className="text-[9px] text-slate-600 font-mono">#{log.id}</p>
                      </div>
                      <button onClick={() => alert(`Receipt #${log.id}`)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition" title="Copy receipt">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── PRAYERS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'prayers' && (
          <AnimatePresence mode="wait">
            <motion.div key="prayers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">My Prayers</p>
                  <p className="text-[11px] text-slate-500">Personal petitions and testimonies.</p>
                </div>
                <button onClick={onOpenPrayerModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition">
                  <Plus className="w-3.5 h-3.5" /> Submit Prayer
                </button>
              </div>

              {myPrayers.length === 0 ? (
                <EmptyState icon={Heart} title="No prayer requests yet"
                  hint="Submit a prayer request and track it as the Lord answers." />
              ) : (
                <div className="space-y-2">
                  {myPrayers.map(p => (
                    <div key={p.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-bold text-white flex-1 min-w-0 truncate">{p.title}</p>
                        <button onClick={() => togglePrayerStatus(p.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition shrink-0 ${p.status === 'Answered' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/25' : 'bg-amber-500/15 text-amber-300 border-amber-500/25 hover:bg-amber-500/25'}`}>
                          {p.status}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-600 font-mono">{p.date}</p>
                      {p.praiseReport && (
                        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200 italic">
                          🙌 {p.praiseReport}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── FOLLOWING TAB ───────────────────────────────────────────── */}
        {activeTab === 'subscriptions' && (
          <AnimatePresence mode="wait">
            <motion.div key="subscriptions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Following</p>
                  <p className="text-[11px] text-slate-500">{subscribedChannels.length} ministry channels.</p>
                </div>
                {onOpenDiscover && (
                  <button onClick={onOpenDiscover}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 transition">
                    <Compass className="w-3.5 h-3.5" /> Discover
                  </button>
                )}
              </div>

              {subscribedChannels.length === 0 ? (
                <EmptyState icon={Tv} title="Not following any channels yet"
                  hint="Follow churches and ministries to receive updates and broadcasts."
                  action={onOpenDiscover ? (
                    <button onClick={onOpenDiscover}
                      className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold border border-amber-500/30 transition">
                      <Compass className="w-3.5 h-3.5" /> Explore Ministries
                    </button>
                  ) : undefined} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {subscribedChannels.map(name => (
                    <div key={name} className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-sm shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-white truncate">{name}</span>
                      </div>
                      <button onClick={() => onToggleSubscribe(name)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[10px] font-semibold transition shrink-0">
                        Unfollow
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

      </div>

      {/* ── SETTINGS FOOTER ───────────────────────────────────────────────── */}
      <section className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-400" /> Preferences
          </h2>
          {onOpenSettingsModal && (
            <button onClick={onOpenSettingsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition">
              <ExternalLink className="w-3.5 h-3.5" /> Full Settings
            </button>
          )}
        </div>

        <div className="space-y-3 text-xs">
          {[
            { label: 'Live service notifications', desc: 'Alerts for upcoming worship services', value: notifService, onChange: (v: boolean) => { setNotifService(v); writePref('gospread_pref_service_alerts', v); } },
            { label: 'Daily Rhema verse', desc: 'Morning scripture delivered daily', value: notifRhema, onChange: (v: boolean) => { setNotifRhema(v); writePref('gospread_pref_daily_rhema', v); } },
            { label: 'HD audio quality', desc: 'Higher quality audio streaming', value: audioHd, onChange: (v: boolean) => { setAudioHd(v); writePref('gospread_pref_audio_hd', v); } },
            { label: 'Public profile', desc: 'Allow others to find and view your profile', value: publicProfile, onChange: (v: boolean) => { setPublicProfile(v); writePref('gospread_pref_public_profile', v); } },
          ].map(pref => (
            <div key={pref.label} className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-800 last:border-0">
              <div>
                <p className="font-semibold text-white">{pref.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{pref.desc}</p>
              </div>
              <Toggle on={pref.value} onChange={pref.onChange} label={pref.label} />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

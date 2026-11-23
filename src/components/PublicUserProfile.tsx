import { useEffect, useState } from 'react';
import { ArrowLeft, Headphones, Play, ShieldCheck, User, Video, Music } from 'lucide-react';
import {
  AudioTrack,
  djangoApi,
  PublicUserMedia,
  PublicUserProfile as PublicUserProfileData,
  VideoStream,
} from '../services/djangoApi';
import { profilePath, updatePageMetadata } from '../lib/routes';

// ─── helpers ────────────────────────────────────────────────────────────────

const roleLabels: Record<PublicUserProfileData['role'], string> = {
  believer: 'Believer',
  creator: 'Creator',
  pastor: 'Pastor / Church Leader',
  artiste: 'Gospel Artiste',
};

const roleBadgeColor: Record<PublicUserProfileData['role'], string> = {
  believer: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
  creator: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  pastor: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  artiste: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
};

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

const toVideoStream = (m: PublicUserMedia): VideoStream => ({
  id: String(m.id),
  title: m.title,
  speakerOrArtist: m.speaker,
  churchOrMinistry: m.church_name,
  channelAvatar: m.channel_avatar,
  subscribersCount: '',
  likesCount: String(m.view_count),
  category: toVideoCategory(m.category),
  isLive: false,
  viewsText: `${m.view_count} views`,
  duration: m.duration_seconds ? fmtDuration(m.duration_seconds) : undefined,
  thumbnail: m.thumbnail_url,
  description: m.description,
  date: m.published_at ? new Date(m.published_at).toLocaleDateString() : 'Recent',
  videoUrl: m.media_url,
});

const toAudioTrack = (m: PublicUserMedia): AudioTrack => ({
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

// ─── props ───────────────────────────────────────────────────────────────────

interface PublicUserProfileProps {
  username: string;
  onBack: () => void;
  onPlayVideo: (video: VideoStream) => void;
  onPlayAudio: (track: AudioTrack) => void;
}

// ─── skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <span className={`block rounded-xl bg-slate-800 animate-pulse ${className}`} />;
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
        <Skeleton className="h-36 rounded-none" />
        <div className="px-6 pb-8 space-y-3">
          <Skeleton className="w-20 h-20 -mt-10 rounded-2xl" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-video rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function PublicUserProfile({ username, onBack, onPlayVideo, onPlayAudio }: PublicUserProfileProps) {
  const [profile, setProfile] = useState<PublicUserProfileData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [mediaTab, setMediaTab] = useState<'all' | 'video' | 'audio'>('all');

  useEffect(() => {
    let alive = true;
    setProfile(null);
    setError('');
    setLoading(true);
    updatePageMetadata({
      title: `${username} | Gospread`,
      description: `Visit ${username}'s profile on Gospread.`,
      path: profilePath(username),
    });
    djangoApi.getPublicUserProfile(username)
      .then(result => {
        if (!alive) return;
        setProfile(result);
        updatePageMetadata({
          title: `${result.name} | Gospread`,
          description: result.bio || `Visit ${result.name}'s profile on Gospread.`,
          path: profilePath(result.username),
          image: result.avatar_url || undefined,
        });
      })
      .catch((err: unknown) => {
        if (!alive) return;
        const status = err instanceof Error && 'status' in err ? (err as any).status : undefined;
        setError(status === 404 ? 'This profile does not exist.' : 'Could not load this profile. Please try again.');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [username]);

  const videos = profile?.media?.filter(m => m.kind === 'video') ?? [];
  const audios = profile?.media?.filter(m => m.kind === 'audio') ?? [];

  const visibleMedia = mediaTab === 'all'
    ? (profile?.media ?? [])
    : mediaTab === 'video' ? videos : audios;

  const initials = profile?.name
    ? profile.name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : username.slice(0, 2).toUpperCase();

  // ── render ───────────────────────────────────────────────────────────────

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-5 lg:px-6 space-y-5">

      {/* Back button */}
      <button type="button" onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>

      {loading ? (
        <ProfileSkeleton />
      ) : error ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center space-y-2">
          <User className="w-10 h-10 text-slate-700 mx-auto" />
          <p className="text-sm text-slate-400 font-semibold">{error}</p>
        </div>
      ) : profile ? (
        <>
          {/* ── PROFILE CARD ─────────────────────────────────────────── */}
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">

            {/* Cover */}
            <div className="h-32 sm:h-40 bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 relative overflow-hidden">
              <div className="absolute inset-0 opacity-25"
                style={{ backgroundImage: 'radial-gradient(ellipse 50% 70% at 80% 30%, #f59e0b66, transparent)' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent" />
            </div>

            <div className="px-5 sm:px-7 pb-7">

              {/* Avatar */}
              <div className="-mt-11 mb-4 flex items-end justify-between">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-slate-900 shadow-xl overflow-hidden bg-slate-800 flex items-center justify-center shrink-0">
                  {profile.avatar_url
                    ? <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                    : <span className="text-2xl font-black text-amber-300 font-serif select-none">{initials}</span>}
                </div>
              </div>

              {/* Name + badges */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white font-serif leading-tight">{profile.name}</h1>
                  {profile.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleBadgeColor[profile.role]}`}>
                    {roleLabels[profile.role]}
                  </span>
                </div>
                <p className="text-xs font-mono text-amber-400">@{profile.username}</p>
                {profile.bio && (
                  <p className="text-sm text-slate-300 leading-relaxed mt-2 max-w-xl whitespace-pre-wrap">{profile.bio}</p>
                )}
              </div>

              {/* Media counts */}
              {(videos.length > 0 || audios.length > 0) && (
                <div className="flex gap-4 mt-5 pt-4 border-t border-slate-800 text-xs text-slate-500">
                  {videos.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-amber-400" />
                      <strong className="text-white font-bold">{videos.length}</strong> {videos.length === 1 ? 'video' : 'videos'}
                    </span>
                  )}
                  {audios.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-amber-400" />
                      <strong className="text-white font-bold">{audios.length}</strong> {audios.length === 1 ? 'audio' : 'audios'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── MEDIA SECTION ────────────────────────────────────────── */}
          {(videos.length > 0 || audios.length > 0) && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">
              {/* Header */}
              <div className="px-5 pt-5 pb-4 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">From this creator</p>
                  <h2 className="text-base font-black text-white mt-0.5">Public Media</h2>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 p-1 rounded-xl bg-slate-950/60 border border-slate-800">
                  {[
                    { id: 'all' as const, label: 'All', count: (profile.media?.length ?? 0) },
                    { id: 'video' as const, label: 'Video', count: videos.length, icon: Video },
                    { id: 'audio' as const, label: 'Audio', count: audios.length, icon: Music },
                  ].filter(t => t.count > 0 || t.id === 'all').map(t => (
                    <button key={t.id} onClick={() => setMediaTab(t.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${mediaTab === t.id ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
                      {t.icon && <t.icon className="w-3 h-3" />}
                      {t.label}
                      {t.count > 0 && (
                        <span className={`text-[9px] px-1 rounded font-mono ${mediaTab === t.id ? 'bg-slate-950/40 text-amber-300' : 'bg-slate-800 text-slate-500'}`}>
                          {t.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media grid */}
              <div className="p-5 space-y-3">
                {visibleMedia.length === 0 ? (
                  <p className="text-center text-xs text-slate-600 py-8">
                    No {mediaTab === 'video' ? 'videos' : mediaTab === 'audio' ? 'audio' : 'media'} yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {visibleMedia.map(item => item.kind === 'video' ? (
                      <button key={`v${item.id}`} type="button"
                        onClick={() => onPlayVideo(toVideoStream(item))}
                        aria-label={`Play video: ${item.title}`}
                        className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-amber-400/50 text-left transition">
                        <div className="relative aspect-video bg-slate-800">
                          {item.thumbnail_url
                            ? <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                            : <span className="flex h-full items-center justify-center text-slate-600"><Video className="w-8 h-8" /></span>}
                          <span className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center">
                            <span className="w-11 h-11 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                              <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                            </span>
                          </span>
                          {item.duration_seconds > 0 && (
                            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                              {fmtDuration(item.duration_seconds)}
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-bold text-white line-clamp-2 leading-snug">{item.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.speaker}{item.view_count > 0 ? ` · ${item.view_count} views` : ''}
                          </p>
                        </div>
                      </button>
                    ) : (
                      <button key={`a${item.id}`} type="button"
                        onClick={() => onPlayAudio(toAudioTrack(item))}
                        aria-label={`Listen: ${item.title}`}
                        className="group flex items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-amber-400/50 text-left transition">
                        <span className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-amber-500/10 flex items-center justify-center">
                          {item.thumbnail_url
                            ? <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            : <Headphones className="w-6 h-6 text-amber-400" />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-bold text-white line-clamp-2 leading-snug">{item.title}</span>
                          <span className="block text-xs text-slate-500 mt-0.5 truncate">
                            {item.speaker}{item.duration_seconds ? ` · ${fmtDuration(item.duration_seconds)}` : ''}
                          </span>
                        </span>
                        <Play className="w-4 h-4 shrink-0 fill-current text-amber-400 group-hover:scale-110 transition" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Empty media state */}
          {videos.length === 0 && audios.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-800 p-10 text-center space-y-2">
              <Video className="w-8 h-8 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-600">{profile.name} hasn't published any media yet.</p>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}

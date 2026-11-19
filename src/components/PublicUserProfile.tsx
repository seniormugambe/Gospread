import { useEffect, useState } from 'react';
import { Headphones, Play, ShieldCheck, User, Video } from 'lucide-react';
import {
  AudioTrack,
  djangoApi,
  PublicUserMedia,
  PublicUserProfile as PublicUserProfileData,
  VideoStream,
} from '../services/djangoApi';
import { profilePath, updatePageMetadata } from '../lib/routes';

const roleLabels: Record<PublicUserProfileData['role'], string> = {
  believer: 'Believer',
  creator: 'Creator',
  pastor: 'Pastor / Church Leader',
  artiste: 'Gospel Artiste',
};

interface PublicUserProfileProps {
  username: string;
  onBack: () => void;
  onPlayVideo: (video: VideoStream) => void;
  onPlayAudio: (track: AudioTrack) => void;
}

const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const getVideoCategory = (category: string): VideoStream['category'] => {
  const normalized = category.toLowerCase();
  if (normalized.includes('worship')) return 'Live Worship';
  if (normalized.includes('choir')) return 'Choir Special';
  if (normalized.includes('music')) return 'Gospel Music';
  if (normalized.includes('bible') || normalized.includes('study')) return 'Bible Study';
  return 'Sermon';
};

const toVideoStream = (media: PublicUserMedia): VideoStream => ({
  id: String(media.id),
  title: media.title,
  speakerOrArtist: media.speaker,
  churchOrMinistry: media.church_name,
  channelAvatar: media.channel_avatar,
  subscribersCount: '',
  likesCount: String(media.view_count),
  category: getVideoCategory(media.category),
  isLive: false,
  viewsText: `${media.view_count} views`,
  duration: media.duration_seconds ? formatDuration(media.duration_seconds) : undefined,
  thumbnail: media.thumbnail_url,
  description: media.description,
  date: media.published_at ? new Date(media.published_at).toLocaleDateString() : 'Recent',
  videoUrl: media.media_url,
});

const toAudioTrack = (media: PublicUserMedia): AudioTrack => ({
  id: String(media.id),
  title: media.title,
  artistOrPreacher: media.speaker,
  albumOrSeries: media.church_name,
  channelAvatar: media.channel_avatar,
  category: 'Audio Sermon',
  coverUrl: media.thumbnail_url,
  duration: media.duration_seconds ? formatDuration(media.duration_seconds) : '',
  lyricsOrNotes: media.description,
  publishedDate: media.published_at ? new Date(media.published_at).toLocaleDateString() : 'Recent',
  audioUrl: media.media_url,
});

export default function PublicUserProfile({ username, onBack, onPlayVideo, onPlayAudio }: PublicUserProfileProps) {
  const [profile, setProfile] = useState<PublicUserProfileData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setProfile(null);
    setError('');
    setLoading(true);
    updatePageMetadata({
      title: `${username} | Gospread`,
      description: `Visit ${username}'s profile on Gospread.`,
      path: profilePath(username),
    });
    djangoApi.getPublicUserProfile(username).then((result) => {
      if (!active) return;
      setProfile(result);
      updatePageMetadata({
        title: `${result.name} | Gospread`,
        description: result.bio || `Visit ${result.name}'s profile on Gospread.`,
        path: profilePath(result.username),
        image: result.avatar_url || undefined,
      });
    }).catch((reason: unknown) => {
      if (!active) return;
      const status = reason instanceof Error && 'status' in reason ? reason.status : undefined;
      setError(status === 404 ? 'This profile is not available.' : 'Unable to load this profile. Please try again later.');
      console.error('Could not load public profile:', reason);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [username]);

  const videos = profile?.media?.filter((item) => item.kind === 'video') ?? [];
  const audios = profile?.media?.filter((item) => item.kind === 'audio') ?? [];

  return (
    <section className="mx-auto w-full max-w-3xl p-4 lg:p-6">
      <button type="button" onClick={onBack} className="mb-5 text-sm font-semibold text-amber-400 hover:text-amber-300">
        Back to home
      </button>
      {loading ? (
        <p role="status" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">Loading profile...</p>
      ) : error ? (
        <p role="alert" className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">{error}</p>
      ) : profile ? (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
            <div className="h-24 bg-gradient-to-r from-slate-800 via-slate-900 to-amber-950" />
            <div className="px-6 pb-8">
              <div className="-mt-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-900 bg-slate-800 text-amber-400">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-9 w-9" aria-hidden="true" />
                )}
              </div>
              <h1 className="mt-4 flex flex-wrap items-center gap-2 text-2xl font-bold text-white">
                {profile.name}
                {profile.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300" aria-label="Verified profile">
                    <ShieldCheck className="h-4 w-4" /> Verified
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-amber-400">@{profile.username}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{roleLabels[profile.role]}</p>
              {profile.bio && <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{profile.bio}</p>}
            </div>
          </div>

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6" aria-label="Public media">
            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">From this creator</p>
              <h2 className="mt-1 text-xl font-black text-white">Public Media</h2>
              <p className="mt-1 text-xs text-slate-400">Audio and videos published by {profile.name}.</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                  <Video className="h-4 w-4 text-amber-400" /> Videos
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                    {videos.length}
                  </span>
                </h3>
                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {videos.map((item) => {
                      const video = toVideoStream(item);
                      return (
                        <button
                          key={`video-${item.id}`}
                          type="button"
                          onClick={() => onPlayVideo(video)}
                          aria-label={`Play video: ${item.title}`}
                          className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 text-left transition hover:border-amber-400/50"
                        >
                          <div className="relative aspect-video bg-slate-800">
                            {item.thumbnail_url ? (
                              <img src={item.thumbnail_url} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-slate-500"><Video className="h-8 w-8" /></div>
                            )}
                            <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white transition group-hover:bg-black/40">
                              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-lg">
                                <Play className="ml-0.5 h-5 w-5 fill-current" />
                              </span>
                            </span>
                          </div>
                          <div className="p-3">
                            <p className="line-clamp-2 text-sm font-bold text-white">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-400">{item.speaker} · {item.duration_seconds ? formatDuration(item.duration_seconds) : 'Video'}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-700 px-4 py-5 text-center text-xs text-slate-500">No public videos yet.</p>
                )}
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                  <Headphones className="h-4 w-4 text-amber-400" /> Audio
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                    {audios.length}
                  </span>
                </h3>
                {audios.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {audios.map((item) => (
                      <button
                        key={`audio-${item.id}`}
                        type="button"
                        onClick={() => onPlayAudio(toAudioTrack(item))}
                        aria-label={`Listen to audio: ${item.title}`}
                        className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-left transition hover:border-amber-400/50"
                      >
                        {item.thumbnail_url ? (
                          <img src={item.thumbnail_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                        ) : (
                          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                            <Headphones className="h-6 w-6" />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block line-clamp-2 text-sm font-bold text-white">{item.title}</span>
                          <span className="mt-1 block truncate text-xs text-slate-400">{item.speaker} · {item.duration_seconds ? formatDuration(item.duration_seconds) : 'Audio'}</span>
                        </span>
                        <Play className="h-4 w-4 shrink-0 fill-current text-amber-400 transition group-hover:scale-110" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-700 px-4 py-5 text-center text-xs text-slate-500">No public audio yet.</p>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { djangoApi, PublicUserProfile as PublicUserProfileData } from '../services/djangoApi';
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
}

export default function PublicUserProfile({ username, onBack }: PublicUserProfileProps) {
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
            <h1 className="mt-4 text-2xl font-bold text-white">{profile.name}</h1>
            <p className="mt-1 text-sm text-amber-400">@{profile.username}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{roleLabels[profile.role]}</p>
            {profile.bio && <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">{profile.bio}</p>}
          </div>
        </div>
      ) : null}
    </section>
  );
}

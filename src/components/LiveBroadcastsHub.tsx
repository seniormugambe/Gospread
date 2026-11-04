import { Headphones, Mic2, Radio, Search, Tv, Users } from 'lucide-react';
import { ActiveAudioSpace } from './AudioSpaceStudio';
import { VideoStream } from '../data/gospelData';
import StreamingVideoCard from './StreamingVideoCard';

interface LiveBroadcastsHubProps {
  videoStreams: VideoStream[];
  audioSpaces: ActiveAudioSpace[];
  searchQuery: string;
  onSelectVideo: (video: VideoStream) => void;
  onJoinAudioSpace: (space: ActiveAudioSpace) => void;
}

export default function LiveBroadcastsHub({
  videoStreams,
  audioSpaces,
  searchQuery,
  onSelectVideo,
  onJoinAudioSpace,
}: LiveBroadcastsHubProps) {
  const query = searchQuery.trim().toLowerCase();
  const matchesSearch = (...values: string[]) =>
    !query || values.some(value => value.toLowerCase().includes(query));
  const liveVideos = videoStreams.filter(video =>
    video.isLive && matchesSearch(video.title, video.speakerOrArtist, video.churchOrMinistry)
  );
  const liveAudioSpaces = audioSpaces.filter(space =>
    matchesSearch(space.title, space.topic, space.hostName, space.ministryName)
  );
  const totalLive = liveVideos.length + liveAudioSpaces.length;

  return (
    <div className="space-y-8 pb-10">
      <header className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950 via-slate-950 to-fuchsia-950/60 p-6 sm:p-8">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
              Happening now
            </div>
            <h1 className="text-2xl font-black text-white sm:text-3xl">Live from the community</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Watch live video broadcasts or join an Audio Space that is on air right now.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold text-white">
            <Radio className="h-4 w-4 text-red-400" />
            {totalLive} live {totalLive === 1 ? 'broadcast' : 'broadcasts'}
          </div>
        </div>
        {query && (
          <div className="relative mt-5 flex items-center gap-2 text-xs text-slate-300">
            <Search className="h-3.5 w-3.5 text-amber-400" />
            <span>Filtered by “{searchQuery.trim()}”</span>
          </div>
        )}
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-white">
              <Tv className="h-5 w-5 text-red-400" /> Live video
            </h2>
            <p className="mt-1 text-xs text-slate-400">Watch broadcasts streaming now</p>
          </div>
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
            {liveVideos.length} {liveVideos.length === 1 ? 'stream' : 'streams'}
          </span>
        </div>
        {liveVideos.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {liveVideos.map(video => (
              <StreamingVideoCard
                key={video.id}
                video={video}
                onSelect={onSelectVideo}
                showCategoryBadge
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-5 py-8 text-center">
            <Tv className="mx-auto h-6 w-6 text-slate-500" />
            <p className="mt-2 text-sm font-bold text-slate-200">
              {query ? 'No live videos match your search' : 'No live video broadcasts right now'}
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black text-white">
              <Headphones className="h-5 w-5 text-fuchsia-300" /> Live Audio Spaces
            </h2>
            <p className="mt-1 text-xs text-slate-400">Join a live conversation and listen in</p>
          </div>
          <span className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs font-bold text-fuchsia-200">
            {liveAudioSpaces.length} {liveAudioSpaces.length === 1 ? 'space' : 'spaces'}
          </span>
        </div>
        {liveAudioSpaces.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {liveAudioSpaces.map(space => (
              <article
                key={space.roomName}
                className="flex flex-col justify-between gap-5 rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-950/40 to-slate-900 p-5 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 text-fuchsia-200">
                    <Mic2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-fuchsia-200">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-300" />
                      Live audio
                    </div>
                    <h3 className="truncate text-base font-black text-white">{space.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-300">
                      <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      {space.hostName} · {space.ministryName}
                    </p>
                    {space.topic && <p className="mt-2 line-clamp-2 text-xs text-slate-400">{space.topic}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onJoinAudioSpace(space)}
                  className="shrink-0 rounded-full bg-fuchsia-500 px-5 py-2.5 text-xs font-black text-white transition hover:bg-fuchsia-400"
                >
                  Join space
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-5 py-8 text-center">
            <Headphones className="mx-auto h-6 w-6 text-slate-500" />
            <p className="mt-2 text-sm font-bold text-slate-200">
              {query ? 'No Audio Spaces match your search' : 'No Audio Spaces are live right now'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

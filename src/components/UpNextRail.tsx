import { motion } from 'motion/react';
import { Flame, Play } from 'lucide-react';
import { VideoStream } from '../data/gospelData';

interface UpNextRailProps {
  videos: VideoStream[];
  onSelect: (video: VideoStream) => void;
  watchedProgress?: Record<string, number>;
}

export default function UpNextRail({ videos, onSelect, watchedProgress = {} }: UpNextRailProps) {
  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
        <Flame className="h-3.5 w-3.5 text-amber-400" /> Keep the fire going
      </h3>

      <div className="space-y-2">
        {videos.map((v) => {
          const pct = Math.min(100, Math.max(0, watchedProgress[v.id] || 0));
          return (
            <motion.button
              type="button"
              key={v.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(v)}
              className="group flex w-full gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2 text-left transition hover:border-amber-400/40 hover:bg-white/[0.07]"
            >
              <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                <img src={v.thumbnail} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400">
                    <Play className="ml-0.5 h-4 w-4 fill-slate-950 text-slate-950" />
                  </span>
                </span>
                {v.isLive ? (
                  <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
                  </span>
                ) : (
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1 font-mono text-[9px] text-white">
                    {v.duration}
                  </span>
                )}
                {pct > 0 && (
                  <span className="absolute bottom-0 left-0 h-1 bg-amber-400" style={{ width: `${pct}%` }} />
                )}
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <h4 className="line-clamp-2 text-xs font-bold leading-snug text-white transition group-hover:text-amber-300">
                  {v.title}
                </h4>
                <p className="mt-1 truncate text-[11px] text-slate-400">{v.speakerOrArtist}</p>
                {v.isLive && v.viewersCount ? (
                  <p className="mt-0.5 text-[10px] font-semibold text-rose-400">{v.viewersCount} watching</p>
                ) : null}
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

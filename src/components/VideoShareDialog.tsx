import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, Link2, Share2, X } from 'lucide-react';
import { VideoStream } from '../data/gospelData';
import { buildShareUrl, INVITE_CALL_TO_ACTION } from '../lib/invites';
import { videoPath } from '../lib/routes';

interface VideoShareDialogProps {
  video: VideoStream | null;
  onClose: () => void;
}

export default function VideoShareDialog({ video, onClose }: VideoShareDialogProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const shareUrl = useMemo(
    () => video ? buildShareUrl(videoPath(video.id, video.title)) : '',
    [video]
  );

  useEffect(() => {
    if (!video) return;
    setStatus('idle');
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [video, onClose]);

  if (!video || typeof document === 'undefined') return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  };

  const shareVideo = async () => {
    const data = {
      title: video.title,
      text: `Watch "${video.title}" by ${video.speakerOrArtist} on Gospread.\n${INVITE_CALL_TO_ACTION}`,
      url: shareUrl,
    };
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        await navigator.share(data);
        onClose();
      } else {
        await copyLink();
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setStatus('error');
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-share-title"
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50"
      >
        <header className="flex items-start justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Share video</p>
            <h2 id="video-share-title" className="mt-1 text-lg font-black text-white">Invite someone to watch</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
            {video.thumbnail ? (
              <img src={video.thumbnail} alt="" className="h-16 w-28 shrink-0 rounded-xl object-cover" />
            ) : (
              <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Link2 className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0 self-center">
              <p className="line-clamp-2 text-sm font-bold text-white">{video.title}</p>
              <p className="mt-1 truncate text-xs text-slate-400">{video.speakerOrArtist}</p>
            </div>
          </div>

          <div>
            <label htmlFor="video-share-url" className="mb-2 block text-xs font-bold text-slate-300">Video link</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 p-2">
              <input
                id="video-share-url"
                readOnly
                value={shareUrl}
                onFocus={(event) => event.currentTarget.select()}
                className="min-w-0 flex-1 bg-transparent px-1 text-xs text-slate-300 outline-none"
              />
              <button
                type="button"
                onClick={() => void copyLink()}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-2 text-xs font-black text-slate-950 transition hover:bg-amber-300"
              >
                {status === 'copied' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {status === 'copied' ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </div>

          {status === 'error' && (
            <p role="alert" className="text-xs font-medium text-rose-300">
              Could not share or copy the link. Check your browser permissions and try again.
            </p>
          )}

          <button
            type="button"
            onClick={() => void shareVideo()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            <Share2 className="h-4 w-4 text-amber-400" />
            Share with another app
          </button>
          <p className="text-center text-[11px] text-slate-500">The link opens this video on Gospread.</p>
        </div>
      </section>
    </div>,
    document.body
  );
}

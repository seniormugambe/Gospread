import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, UploadCloud, Zap } from 'lucide-react';
import { djangoApi } from '../services/djangoApi';
import { VideoStream } from '../data/gospelData';
import { isVideoFile } from '../utils/mediaFiles';

export const SHORT_MAX_SECONDS = 60;
const CAPTION_MAX = 280;
const MAX_FILE_BYTES = 500 * 1024 * 1024;

interface VideoInfo {
  duration: number;
  width: number;
  height: number;
  thumbnail: Blob | null;
}

// Mobile browsers often never fire `seeked`, so the thumbnail is best-effort and must never block the upload.
function readVideoInfo(url: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    let settled = false;
    let metadataTimer = 0;
    let thumbnailTimer = 0;
    const cleanup = () => {
      window.clearTimeout(metadataTimer);
      window.clearTimeout(thumbnailTimer);
      video.removeAttribute('src');
      video.load();
    };
    const finish = (info: VideoInfo) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(info);
    };
    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(message));
    };

    metadataTimer = window.setTimeout(
      () => fail('This video took too long to read. Try an MP4 file, or a shorter clip.'),
      15000,
    );
    video.onerror = () => fail('This video could not be read. Try an MP4 or MOV file.');
    video.onloadedmetadata = () => {
      window.clearTimeout(metadataTimer);
      const { duration, videoWidth: width, videoHeight: height } = video;
      if (!Number.isFinite(duration) || duration <= 0 || !width || !height) {
        return fail('This video could not be read. Try an MP4 or MOV file.');
      }
      const base = { duration, width, height };
      thumbnailTimer = window.setTimeout(() => finish({ ...base, thumbnail: null }), 4000);

      const capture = () => {
        if (settled) return;
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(width, 720);
          canvas.height = Math.round((canvas.width / width) * height);
          const ctx = canvas.getContext('2d');
          if (!ctx) return finish({ ...base, thumbnail: null });
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => finish({ ...base, thumbnail: blob }), 'image/jpeg', 0.85);
        } catch {
          finish({ ...base, thumbnail: null });
        }
      };
      const seekToFrame = () => {
        try { video.currentTime = Math.min(0.5, duration / 2); } catch { finish({ ...base, thumbnail: null }); }
      };
      video.onseeked = capture;
      video.onloadeddata = seekToFrame;
      if (video.readyState >= 2) seekToFrame();
    };
    video.src = url;
    video.load();
  });
}

interface CreateShortPanelProps {
  onBack: () => void;
  onPublished: (stream: VideoStream) => void;
  onRequireAuth?: () => void;
  isSignedIn: boolean;
}

export default function CreateShortPanel({ onBack, onPublished, onRequireAuth, isSignedIn }: CreateShortPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [orientationOverride, setOrientationOverride] = useState<{ file: File; info: VideoInfo } | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const reset = () => {
    setFile(null);
    setInfo(null);
    setOrientationOverride(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFile = async (picked: File | undefined) => {
    setError(null);
    reset();
    if (!picked) return;
    if (!isVideoFile(picked)) return setError('Please choose a video file.');
    if (picked.size > MAX_FILE_BYTES) return setError('Video is too large. The limit is 500 MB.');

    const url = URL.createObjectURL(picked);
    try {
      const meta = await readVideoInfo(url);
      if (meta.duration > SHORT_MAX_SECONDS) {
        URL.revokeObjectURL(url);
        return setError(`This video is ${Math.ceil(meta.duration)}s long. Gospel Nuggets can be at most ${SHORT_MAX_SECONDS} seconds.`);
      }
      if (meta.height <= meta.width) {
        URL.revokeObjectURL(url);
        setOrientationOverride({ file: picked, info: meta });
        return setError('Gospel Nuggets must be vertical (portrait) video, like 9:16.');
      }
      setFile(picked);
      setInfo(meta);
      setPreviewUrl(url);
    } catch (err: any) {
      URL.revokeObjectURL(url);
      setError(err?.message || 'This video could not be read.');
    }
  };

  const continueWithPortraitVideo = () => {
    if (!orientationOverride) return;
    setFile(orientationOverride.file);
    setInfo({
      ...orientationOverride.info,
      width: orientationOverride.info.height,
      height: orientationOverride.info.width,
      thumbnail: null,
    });
    setPreviewUrl(URL.createObjectURL(orientationOverride.file));
    setOrientationOverride(null);
    setError(null);
  };

  const handlePost = async () => {
    if (!file || !info) return;
    if (!isSignedIn) return onRequireAuth?.();
    setError(null);
    setProgress(0);
    try {
      const created = await djangoApi.createShort(
        { caption, duration_seconds: info.duration, video_file: file, thumbnail_file: info.thumbnail },
        setProgress,
      );
      const shorts = await djangoApi.getShorts().catch(() => [] as VideoStream[]);
      const mapped = shorts.find((s) => s.id === `short-${created.id}`);
      if (mapped) onPublished(mapped);
      setDone(true);
    } catch (err: any) {
      setError(err?.message || 'Could not post your Gospel Nugget. Please try again.');
    } finally {
      setProgress(null);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
        <h2 className="text-xl font-black text-white">Gospel Nugget posted!</h2>
        <button onClick={onBack} className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-sm cursor-pointer">
          Back to Studio
        </button>
      </div>
    );
  }

  const uploading = progress !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={onBack} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Creator Options</span>
      </button>

      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
        <h2 className="text-xl font-black text-white">Create Gospel Nugget</h2>
      </div>

      <div className="grid sm:grid-cols-[220px_1fr] gap-6">
        <div>
          {previewUrl ? (
            <video src={previewUrl} controls playsInline className="w-full aspect-[9/16] rounded-2xl bg-black object-cover" />
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full aspect-[9/16] rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-500 text-slate-400 hover:text-amber-400 flex flex-col items-center justify-center gap-2 px-4 text-center transition cursor-pointer"
            >
              <UploadCloud className="w-8 h-8" />
              <span className="text-xs font-bold">Choose a vertical video</span>
              <span className="text-[10px]">Up to {SHORT_MAX_SECONDS} seconds, 9:16</span>
            </button>
          )}
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          {file && !uploading && (
            <button onClick={() => inputRef.current?.click()} className="mt-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer">
              Change video
            </button>
          )}
        </div>

        <div className="space-y-4">
          {info && (
            <p className="text-xs text-slate-400">
              {Math.ceil(info.duration)}s / {SHORT_MAX_SECONDS}s · {info.width}×{info.height}
            </p>
          )}
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-300">Caption</span>
            <textarea
              value={caption}
              maxLength={CAPTION_MAX}
              onChange={(e) => setCaption(e.target.value)}
              disabled={uploading}
              rows={4}
              placeholder="Share the word in a sentence or two..."
              className="w-full rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 outline-none p-3 text-sm text-white"
            />
            <span className="block text-right text-[10px] text-slate-500">{caption.length}/{CAPTION_MAX}</span>
          </label>

          {error && (
            <div role="alert" className="text-xs font-bold text-red-400 space-y-2">
              <p>{error}</p>
              {orientationOverride && (
                <div className="space-y-1.5">
                  <p className="font-normal text-slate-400">
                    Some phones report portrait clips as landscape. If this video looks vertical, you can continue.
                  </p>
                  <button
                    type="button"
                    onClick={continueWithPortraitVideo}
                    className="font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    This video is portrait — continue
                  </button>
                </div>
              )}
            </div>
          )}

          {uploading && (
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}

          <button
            onClick={handlePost}
            disabled={!file || uploading}
            className="w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting {progress}%</> : 'Post Gospel Nugget'}
          </button>
        </div>
      </div>
    </div>
  );
}

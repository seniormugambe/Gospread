export interface VideoExtractedFrame {
  id: string;
  time: string;
  label: string;
  url: string;
}

function formatTimestamp(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function seekVideo(video: HTMLVideoElement, timeSeconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Timed out while seeking in video'));
    }, 15_000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      video.removeEventListener('stalled', onStalled);
    };

    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('Could not seek in video'));
    };
    const onStalled = () => {
      cleanup();
      reject(new Error('Video stopped loading while seeking'));
    };

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.addEventListener('stalled', onStalled);

    const target = Math.min(Math.max(timeSeconds, 0), Math.max(video.duration - 0.05, 0));
    if (Math.abs(video.currentTime - target) < 0.01 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      cleanup();
      resolve();
      return;
    }

    video.currentTime = target;
  });
}

/** Sample evenly spaced JPEG frames from a local video file for thumbnail pickers. */
export async function extractVideoFrames(file: File, count = 4): Promise<VideoExtractedFrame[]> {
  const frameCount = Math.floor(count);
  if (!Number.isFinite(frameCount) || frameCount <= 0) return [];

  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      const onMetadata = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error('Could not load video for frame extraction'));
      };
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', onMetadata);
        video.removeEventListener('error', onError);
      };
      video.addEventListener('loadedmetadata', onMetadata, { once: true });
      video.addEventListener('error', onError, { once: true });
    });

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0 || !video.videoWidth) {
      return [];
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    // Thumbnails do not need the source video's full resolution. Limiting the
    // canvas keeps data URLs small enough for the thumbnail picker and upload.
    const maxWidth = 1280;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

    const frames: VideoExtractedFrame[] = [];
    for (let i = 0; i < frameCount; i++) {
      const position = duration * ((i + 1) / (frameCount + 1));
      await seekVideo(video, position);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL('image/jpeg', 0.82);
      const timeLabel = formatTimestamp(position);
      frames.push({
        id: `frame-${i + 1}`,
        time: timeLabel,
        label: `Keyframe at ${timeLabel}`,
        url,
      });
    }
    return frames;
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

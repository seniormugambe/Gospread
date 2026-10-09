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
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      reject(new Error('Could not seek in video'));
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.currentTime = Math.min(Math.max(timeSeconds, 0), Math.max(video.duration - 0.1, 0));
  });
}

/** Sample evenly spaced JPEG frames from a local video file for thumbnail pickers. */
export async function extractVideoFrames(file: File, count = 4): Promise<VideoExtractedFrame[]> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Could not load video for frame extraction'));
    });

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0 || !video.videoWidth) {
      return [];
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const frames: VideoExtractedFrame[] = [];
    for (let i = 0; i < count; i++) {
      const position = duration * ((i + 1) / (count + 1));
      await seekVideo(video, position);
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
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

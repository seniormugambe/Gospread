const VIDEO_FILE_EXTENSION = /\.(3g2|3gp|avi|m4v|mkv|mov|mp4|mpeg|mpg|ogv|webm)$/i;
const AUDIO_FILE_EXTENSION = /\.(aac|flac|m4a|mp3|oga|ogg|opus|wav)$/i;

export function isVideoFile(file: Pick<File, 'name' | 'type'>): boolean {
  const mediaType = file.type.toLowerCase();
  if (mediaType.startsWith('video/')) return true;
  if (mediaType && mediaType !== 'application/octet-stream') return false;
  return VIDEO_FILE_EXTENSION.test(file.name);
}

export function isAudioFile(file: Pick<File, 'name' | 'type'>): boolean {
  const mediaType = file.type.toLowerCase();
  if (mediaType.startsWith('audio/')) return true;
  if (mediaType && mediaType !== 'application/octet-stream') return false;
  return AUDIO_FILE_EXTENSION.test(file.name);
}

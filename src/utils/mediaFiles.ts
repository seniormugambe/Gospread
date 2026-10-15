const VIDEO_FILE_EXTENSION = /\.(3g2|3gp|avi|m4v|mkv|mov|mp4|mpeg|mpg|ogv|webm)$/i;

export function isVideoFile(file: Pick<File, 'name' | 'type'>): boolean {
  const mediaType = file.type.toLowerCase();
  if (mediaType.startsWith('video/')) return true;
  if (mediaType && mediaType !== 'application/octet-stream') return false;
  return VIDEO_FILE_EXTENSION.test(file.name);
}

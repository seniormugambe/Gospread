# Gospread AI Guidance

## Media Provider Boundaries

- Use `src/services/youtubeApi.ts` only for YouTube video discovery and video metadata.
- Do not add YouTube-backed audio, podcast, radio, or audio-search behavior.
- Use `djangoApi.getAudioTracks()` for the audio and podcast catalog. `AUDIO_TRACKS` is its local curated fallback.
- Use LiveKit only for real-time Audio Spaces. Room tokens are obtained through the Django audio-space endpoints before connecting with `livekit-client`.
- Keep the Audio Podcast Hub and search overlay aligned with these boundaries: YouTube results belong in video UI; catalog and LiveKit room UI belong in audio UI.

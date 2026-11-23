import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Circle, Clock, Loader2, Mic, Mic2, Share2, Square, Users, AlertTriangle, Radio, Signal, Headphones, Waves } from 'lucide-react';
import { UserSession } from './AuthModal';
import { Room, RoomEvent, RemoteTrack } from 'livekit-client';
import { djangoApi } from '../services/djangoApi';
import { INVITE_CALL_TO_ACTION, buildShareUrl } from '../lib/invites';
import AudioSpaceRoomTools from './AudioSpaceRoomTools';

export interface ActiveAudioSpace {
  title: string;
  topic: string;
  hostName: string;
  hostId?: string | number;
  ministryName: string;
  startedAt: number;
  roomName: string;
}

interface AudioSpaceStudioProps {
  currentUser?: UserSession;
  ministryName: string;
  activeAudioSpace?: ActiveAudioSpace | null;
  onBack: () => void;
  onSpaceChange?: (space: ActiveAudioSpace | null, endedRoomName?: string) => void;
}

export default function AudioSpaceStudio({ currentUser, ministryName, activeAudioSpace, onBack, onSpaceChange }: AudioSpaceStudioProps) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [listenerCount, setListenerCount] = useState(0);
  const [speakingParticipants, setSpeakingParticipants] = useState<Set<string>>(new Set());
  const [remoteParticipants, setRemoteParticipants] = useState<{ identity: string; name: string }[]>([]);
  const [error, setError] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSavingRecording, setIsSavingRecording] = useState(false);
  const [recordingSaved, setRecordingSaved] = useState(false);
  const [pendingRecording, setPendingRecording] = useState<Blob | null>(null);
  const [recordingPreviewUrl, setRecordingPreviewUrl] = useState('');
  const [recordingTitle, setRecordingTitle] = useState('');
  const [recordingDescription, setRecordingDescription] = useState('');
  const [recordingSpeaker, setRecordingSpeaker] = useState('');
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const roomRef = useRef<Room | null>(null);
  const roomNameRef = useRef<string | null>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const attachedAudioTrackSidsRef = useRef(new Set<string>());

  useEffect(() => {
    if (!pendingRecording) {
      setRecordingPreviewUrl('');
      return;
    }
    const previewUrl = URL.createObjectURL(pendingRecording);
    setRecordingPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [pendingRecording]);

  const syncListenerCount = (room: Room) => {
    setListenerCount(room.remoteParticipants.size);
    setSpeakingParticipants(new Set(room.activeSpeakers.map(participant => participant.identity)));
    setRemoteParticipants(Array.from(room.remoteParticipants.values(), participant => ({
      identity: participant.identity,
      name: participant.name || participant.identity,
    })));
  };

  const playRemoteAudio = (track: RemoteTrack) => {
    if (attachedAudioTrackSidsRef.current.has(track.sid)) return;
    const element = document.createElement('audio');
    element.autoplay = true;
    track.attach(element);
    document.body.appendChild(element);
    audioElementsRef.current.push(element);
    attachedAudioTrackSidsRef.current.add(track.sid);
  };

  const handleSubscribedTrack = (track: RemoteTrack) => {
    playRemoteAudio(track);
    if (mediaRecorderRef.current?.state === 'recording') {
      const mediaTrack = track.mediaStreamTrack;
      if (mediaTrack && !recordingStreamRef.current?.getTracks().includes(mediaTrack)) {
        recordingStreamRef.current?.addTrack(mediaTrack);
      }
    }
  };

  const clearRemoteAudio = () => {
    audioElementsRef.current.forEach(element => {
      element.pause();
      element.remove();
    });
    audioElementsRef.current = [];
    attachedAudioTrackSidsRef.current.clear();
  };

  useEffect(() => () => {
    const room = roomRef.current;
    roomRef.current = null;
    room?.disconnect();
    clearRemoteAudio();
  }, []);

  useEffect(() => {
    if (!isLive) return;
    const timer = window.setInterval(() => setElapsedSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isLive]);

  useEffect(() => {
    if (!activeAudioSpace) return;
    setTitle(activeAudioSpace.title);
    setTopic(activeAudioSpace.topic);
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - activeAudioSpace.startedAt) / 1000)));
    setIsLive(true);
    roomNameRef.current = activeAudioSpace.roomName;
    if (roomRef.current?.state === 'connected' && roomRef.current.name === activeAudioSpace.roomName) return;
    if (roomRef.current && roomRef.current.name !== activeAudioSpace.roomName) {
      const previousRoom = roomRef.current;
      roomRef.current = null;
      previousRoom.disconnect();
      clearRemoteAudio();
    }

    let cancelled = false;
    void (async () => {
      try {
        const tokenData = await djangoApi.createAudioSpaceToken(activeAudioSpace.roomName, true);
        const room = new Room();
        roomRef.current = room;
        room.on(RoomEvent.Connected, () => {
          setIsConnected(true);
          syncListenerCount(room);
        });
        room.on(RoomEvent.ParticipantConnected, () => syncListenerCount(room));
        room.on(RoomEvent.ParticipantDisconnected, () => syncListenerCount(room));
        room.on(RoomEvent.ActiveSpeakersChanged, () => syncListenerCount(room));
        room.on(RoomEvent.TrackSubscribed, track => handleSubscribedTrack(track));
        room.on(RoomEvent.Disconnected, () => {
          if (roomRef.current !== room) return;
          roomRef.current = null;
          setIsConnected(false);
          setListenerCount(0);
          clearRemoteAudio();
        });
        await room.connect(tokenData.server_url, tokenData.participant_token);
        if (cancelled) {
          room.disconnect();
          return;
        }
        room.remoteParticipants.forEach(participant => {
          participant.trackPublications.forEach(publication => {
            if (publication.track) playRemoteAudio(publication.track);
          });
        });
        setIsConnected(true);
        syncListenerCount(room);
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch (reconnectError) {
        roomRef.current?.disconnect();
        roomRef.current = null;
        clearRemoteAudio();
        setIsConnected(false);
        setError(reconnectError instanceof Error ? reconnectError.message : 'Could not reconnect to the live Audio Space.');
      }
    })();

    return () => { cancelled = true; };
  }, [activeAudioSpace?.roomName, activeAudioSpace?.startedAt, activeAudioSpace?.title, activeAudioSpace?.topic]);

  const startSpace = async () => {
    setError('');
    if (!title.trim()) {
      setError('Add a title before starting the Space.');
      return;
    }
    try {
      const roomName = `audio-space-${crypto.randomUUID()}`;
      roomNameRef.current = roomName;
      setIsConnected(false);
      const spaceTitle = title.trim();
      const spaceTopic = topic.trim();

      const tokenData = await djangoApi.createAudioSpaceToken(roomName, true, {
        title: spaceTitle,
        topic: spaceTopic,
        ministry_name: ministryName,
      });
      const room = new Room();
      roomRef.current = room;
      room.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        syncListenerCount(room);
      });
      room.on(RoomEvent.ParticipantConnected, () => syncListenerCount(room));
      room.on(RoomEvent.ParticipantDisconnected, () => syncListenerCount(room));
      room.on(RoomEvent.ActiveSpeakersChanged, () => syncListenerCount(room));
      room.on(RoomEvent.TrackSubscribed, track => handleSubscribedTrack(track));
      room.on(RoomEvent.Disconnected, () => {
        if (roomRef.current !== room) return;
        roomRef.current = null;
        setIsConnected(false);
        setListenerCount(0);
        clearRemoteAudio();
      });
      await room.connect(tokenData.server_url, tokenData.participant_token);
      room.remoteParticipants.forEach(participant => {
        participant.trackPublications.forEach(publication => {
          if (publication.track) playRemoteAudio(publication.track);
        });
      });
      setIsConnected(true);
      syncListenerCount(room);
      await room.localParticipant.setMicrophoneEnabled(true);

      // Transition host to Live Audio Room
      setIsLive(true);
      onSpaceChange?.({
        title: spaceTitle,
        topic: spaceTopic,
        hostName: currentUser?.fullName || currentUser?.username || 'Host',
        hostId: currentUser?.id,
        ministryName,
        startedAt: Date.now(),
        roomName,
      });
    } catch (error) {
      roomRef.current?.disconnect();
      roomRef.current = null;
      roomNameRef.current = null;
      clearRemoteAudio();
      setIsConnected(false);
      setError(error instanceof Error ? error.message : 'Could not start the live Audio Space.');
    }
  };

  const endSpace = async () => {
    const roomName = roomNameRef.current || activeAudioSpace?.roomName;
    if (!roomName) {
      setError('Could not find the active Audio Space to end.');
      return;
    }

    setError('');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      stopRecording();
    }
    try {
      await djangoApi.endAudioSpace(roomName);
    } catch (endError) {
      setError(endError instanceof Error ? endError.message : 'Could not end the Audio Space.');
      return;
    }

    const room = roomRef.current;
    roomRef.current = null;
    room?.disconnect();
    clearRemoteAudio();
    roomNameRef.current = null;
    setIsLive(false);
    setIsConnected(false);
    setListenerCount(0);
    onSpaceChange?.(null, roomName);
  };

  const inviteListeners = async () => {
    const roomName = roomNameRef.current || activeAudioSpace?.roomName;
    if (!roomName) return;
    const inviteUrl = new URL(buildShareUrl(window.location.pathname));
    inviteUrl.searchParams.set('audio_space', roomName);
    const shareData = { title: title.trim() || 'Live Gospread Audio Space', text: `${topic.trim() || 'Join this live Audio Space on Gospread'}\n${INVITE_CALL_TO_ACTION}`, url: inviteUrl.toString() };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(inviteUrl.toString());
        setInviteCopied(true);
        window.setTimeout(() => setInviteCopied(false), 2000);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(inviteUrl.toString());
        setInviteCopied(true);
        window.setTimeout(() => setInviteCopied(false), 2000);
      } catch {
        setError('Could not create an invite link.');
      }
    }
  };

  const collectRoomAudioStream = () => {
    const room = roomRef.current;
    const stream = new MediaStream();
    if (!room) return stream;

    room.localParticipant.audioTrackPublications.forEach(publication => {
      const track = publication.track?.mediaStreamTrack;
      if (track) stream.addTrack(track);
    });
    room.remoteParticipants.forEach(participant => {
      participant.audioTrackPublications.forEach(publication => {
        const track = publication.track?.mediaStreamTrack;
        if (track) stream.addTrack(track);
      });
    });
    return stream;
  };

  const saveRecording = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const blob = pendingRecording;
    if (!currentUser?.isLoggedIn) {
      setError('Sign in again before saving this recording.');
      return;
    }
    if (!blob?.size) {
      setError('The recording was empty. Please try again.');
      return;
    }

    setIsSavingRecording(true);
    setError('');
    try {
      const extension = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'm4a' : 'webm';
      const file = new File([blob], `${recordingTitle.trim() || 'Audio Space recording'}.${extension}`, {
        type: blob.type || `audio/${extension}`,
      });
      await djangoApi.createSermon({
        title: recordingTitle.trim(),
        speaker: recordingSpeaker.trim() || currentUser.fullName || currentUser.username || 'Host',
        description: recordingDescription.trim(),
        category: '24/7 Gospel Radio',
        kind: 'audio',
        is_published: false,
        tags: ['live-audio-space'],
        key_takeaways: [],
        visibility: 'private',
        audience: 'all_ages',
        media_file: file,
      });
      setPendingRecording(null);
      setRecordingSaved(true);
      window.setTimeout(() => setRecordingSaved(false), 4000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the Audio Space recording.');
    } finally {
      setIsSavingRecording(false);
    }
  };

  const discardRecording = () => {
    setPendingRecording(null);
    setRecordingTitle('');
    setRecordingDescription('');
    setRecordingSpeaker('');
    setError('');
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    recorder.stop();
  };

  const startRecording = () => {
    setError('');
    setRecordingSaved(false);
    if (typeof MediaRecorder === 'undefined') {
      setError('Recording is not supported by this browser.');
      return;
    }
    const stream = collectRoomAudioStream();
    if (stream.getAudioTracks().length === 0) {
      setError('No active audio tracks were found to record.');
      return;
    }
    recordingStreamRef.current = stream;

    recordingChunksRef.current = [];
    const mimeType = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4']
      .find(type => MediaRecorder.isTypeSupported(type));
    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch (recorderError) {
      setError(recorderError instanceof Error ? recorderError.message : 'Could not start recording.');
      return;
    }

    recorder.ondataavailable = event => {
      if (event.data.size > 0) recordingChunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || mimeType || 'audio/webm';
      const blob = new Blob(recordingChunksRef.current, { type });
      recordingChunksRef.current = [];
      mediaRecorderRef.current = null;
      recordingStreamRef.current = null;
      setIsRecording(false);
      if (!blob.size) {
        setError('The recording was empty. Check that the Space had active audio and try again.');
        return;
      }
      setRecordingTitle(`${title.trim() || 'Live Audio Space'} - Recording`);
      setRecordingDescription(topic.trim() || `Live Audio Space recording hosted by ${ministryName}.`);
      setRecordingSpeaker(currentUser?.fullName || currentUser?.username || 'Host');
      setPendingRecording(blob);
    };
    recorder.onerror = () => setError('The Audio Space recording stopped unexpectedly. Try recording again.');
    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setIsRecording(true);
  };

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  const hostDisplayName = activeAudioSpace?.hostName || currentUser?.fullName || currentUser?.username || 'Host';
  const hostInitial = hostDisplayName.slice(0, 1).toUpperCase();
  const isSpeakingNow = Boolean(roomRef.current?.localParticipant.isSpeaking);

  return (
    <>
      {pendingRecording && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveRecording}
            role="dialog"
            aria-modal="true"
            aria-labelledby="audio-recording-review-title"
            className="my-auto w-full max-w-xl space-y-5 rounded-3xl border border-white/10 bg-[#111] p-6 shadow-2xl"
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-300">Audio Space recording</p>
              <h2 id="audio-recording-review-title" className="mt-1 text-xl font-black text-white">
                Review before saving
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Review and edit the details before saving. Until saved, the recording exists only on this page and will be lost if you leave or reload.
              </p>
            </div>
            {recordingPreviewUrl && (
              <audio className="w-full" controls preload="metadata" src={recordingPreviewUrl}>
                Your browser cannot play this recording.
              </audio>
            )}
            <label className="block space-y-1.5 text-xs font-bold text-slate-300">
              Recording title
              <input
                autoFocus
                required
                maxLength={220}
                value={recordingTitle}
                onChange={event => setRecordingTitle(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-fuchsia-400"
              />
            </label>
            <label className="block space-y-1.5 text-xs font-bold text-slate-300">
              Speaker
              <input
                required
                maxLength={150}
                value={recordingSpeaker}
                onChange={event => setRecordingSpeaker(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-fuchsia-400"
              />
            </label>
            <label className="block space-y-1.5 text-xs font-bold text-slate-300">
              Description
              <textarea
                rows={3}
                value={recordingDescription}
                onChange={event => setRecordingDescription(event.target.value)}
                className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-fuchsia-400"
              />
            </label>
            {error && (
              <p role="alert" className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
                {error}
              </p>
            )}
            <div className="flex flex-col-reverse justify-between gap-2 sm:flex-row">
              <button
                type="button"
                onClick={discardRecording}
                disabled={isSavingRecording}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Discard recording
              </button>
              <button
                type="submit"
                disabled={isSavingRecording}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingRecording ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {isSavingRecording ? 'Saving private draft...' : 'Save as private draft'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── End-space confirmation sheet ── */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#111] p-6 shadow-2xl space-y-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 border border-red-500/25">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </span>
              <div>
                <p className="text-base font-black text-white">End this Audio Space?</p>
                <p className="mt-1.5 text-sm text-slate-400">
                  {isRecording
                    ? 'The recording will stop before the Space closes. You can review it and save it as a private draft afterward.'
                    : 'All listeners will be disconnected and the room will close.'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10 active:scale-95 transition"
              >
                Stay live
              </button>
              <button
                type="button"
                onClick={() => { setShowQuitConfirm(false); void endSpace(); }}
                className="rounded-full bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-500 active:scale-95 transition"
              >
                End Space
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-3 gap-3">
          <button
            onClick={isLive ? () => setShowQuitConfirm(true) : onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white active:scale-95 transition min-h-9"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{isLive ? 'End Space' : 'Back to Studio'}</span>
          </button>
          {isLive && (
            <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
              isConnected
                ? 'border border-red-500/30 bg-red-500/10 text-red-300'
                : 'border border-amber-500/30 bg-amber-500/10 text-amber-300'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'animate-pulse bg-red-400' : 'bg-amber-400'}`} />
              {isConnected ? 'On Air' : 'Reconnecting'}
            </span>
          )}
        </div>

        {!isLive ? (
          /* ════════════════════════════════════════════
             SETUP SCREEN — creator configures the Space
             ════════════════════════════════════════════ */
          <div className="mx-auto max-w-xl space-y-6">
            {/* Hero */}
            <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-b from-[#1a1a1a] to-[#111] p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-rose-600 shadow-lg">
                  <Mic2 className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Audio Space</p>
                  <h1 className="text-lg font-black text-white leading-tight">Start a live voice room</h1>
                </div>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed">
                Host a live voice conversation for <span className="font-semibold text-slate-200">{ministryName}</span>. Listeners join from your home feed or Podcasts tab.
              </p>

              <div className="space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Space title</span>
                  <input
                    value={title}
                    onChange={event => setTitle(event.target.value)}
                    placeholder="What are you talking about today?"
                    className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-fuchsia-500/60 focus:bg-white/[0.06] transition"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Topic / scripture <span className="font-normal normal-case text-slate-600">(optional)</span>
                  </span>
                  <input
                    value={topic}
                    onChange={event => setTopic(event.target.value)}
                    placeholder="Give listeners context"
                    className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-fuchsia-500/60 focus:bg-white/[0.06] transition"
                  />
                </label>
              </div>

              {error && (
                <p className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs font-semibold text-red-300">{error}</p>
              )}

              <button
                onClick={startSpace}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-rose-600 px-5 py-3.5 text-sm font-black text-white hover:from-fuchsia-500 hover:to-rose-500 active:scale-[0.98] transition shadow-lg shadow-fuchsia-700/25"
              >
                <Signal className="w-4 h-4" />
                Go Live
              </button>
            </div>

            {/* How it works */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: <Mic2 className="h-5 w-5" />, label: 'You speak', sub: 'Mic auto-enables' },
                { icon: <Headphones className="h-5 w-5" />, label: 'They listen', sub: 'Join from feed' },
                { icon: <Waves className="h-5 w-5" />, label: 'Real-time', sub: 'Powered by LiveKit' },
              ].map(item => (
                <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5 space-y-1.5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-fuchsia-300">{item.icon}</span>
                  <p className="text-xs font-black text-white">{item.label}</p>
                  <p className="text-[10px] text-slate-500">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ════════════════════════════════════════════
             LIVE HOST STUDIO — creator controls the room
             ════════════════════════════════════════════ */
          <div className="mx-auto max-w-3xl space-y-4">

            {/* ── Main stage card ── */}
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#1c0a2e] via-[#130a1f] to-[#0d0d0d]">
              {/* Ambient glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(168,85,247,0.15),transparent)]" />

              <div className="relative p-5 sm:p-7">
                {/* Room meta row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-7">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center gap-2">
                      <Radio className="h-3.5 w-3.5 text-fuchsia-400 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Host Studio</span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-black text-white truncate leading-tight">{title}</h1>
                    {topic && <p className="mt-0.5 text-sm text-slate-400 truncate">{topic}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-mono text-slate-300">{formatTime(elapsedSeconds)}</span>
                  </div>
                </div>

                {/* Host avatar — centre stage */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {isSpeakingNow && (
                      <span className="absolute inset-0 rounded-full bg-fuchsia-500/20 animate-ping" />
                    )}
                    <div className={`relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-[3px] text-3xl font-black transition-all duration-300 ${
                      isSpeakingNow
                        ? 'border-fuchsia-400 bg-fuchsia-900/40 text-fuchsia-200 shadow-[0_0_40px_rgba(192,86,243,0.5)]'
                        : 'border-white/20 bg-white/[0.06] text-slate-200'
                    }`}>
                      {currentUser?.avatarUrl || currentUser?.avatar
                        ? <img src={currentUser.avatarUrl || currentUser.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                        : hostInitial}
                    </div>
                    {isSpeakingNow && (
                      <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1c0a2e] bg-fuchsia-500 text-white shadow">
                        <Mic2 className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm font-bold text-white">{hostDisplayName}</p>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-fuchsia-300">
                      <Mic2 className="h-2.5 w-2.5" /> Host
                    </span>
                  </div>
                </div>

                {/* Listeners grid */}
                {remoteParticipants.length > 0 && (
                  <div className="mt-7 border-t border-white/[0.06] pt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">In this space</span>
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                        <Users className="h-3 w-3" />{remoteParticipants.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                      {remoteParticipants.slice(0, 15).map(participant => {
                        const speaking = speakingParticipants.has(participant.identity);
                        return (
                          <div key={participant.identity} className="flex min-w-0 flex-col items-center gap-1.5 text-center">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-black transition-all duration-200 ${
                              speaking
                                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 shadow-[0_0_16px_rgba(52,211,153,0.4)]'
                                : 'border-white/10 bg-white/[0.05] text-slate-300'
                            }`}>
                              {speaking ? <Mic className="h-4 w-4" /> : participant.name.slice(0, 1).toUpperCase()}
                            </div>
                            <p className="w-full truncate text-[10px] font-semibold text-slate-300">{participant.name}</p>
                            <span className={`text-[9px] font-bold ${speaking ? 'text-emerald-400' : 'text-slate-600'}`}>
                              {speaking ? 'Talking' : 'Listening'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15">
                  <Headphones className="h-4.5 w-4.5 text-sky-400" />
                </span>
                <div>
                  <p className="text-xl font-black text-white leading-none">{listenerCount}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Listening now</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/15">
                  <Waves className="h-4.5 w-4.5 text-fuchsia-400" />
                </span>
                <div>
                  <p className="text-xl font-black text-white leading-none font-mono">{formatTime(elapsedSeconds)}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">Time on air</p>
                </div>
              </div>
            </div>

            {/* ── Status banners ── */}
            {recordingSaved && (
              <p className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center text-xs font-semibold text-emerald-300">
                Recording saved as a private draft. Review and publish it from Creator Studio.
              </p>
            )}
            {error && (
              <p className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">{error}</p>
            )}

            {/* ── Room tools (chat, speakers, moderation) ── */}
            {roomRef.current && (
              <AudioSpaceRoomTools room={roomRef.current} roomName={roomNameRef.current || ''} canManage isHost />
            )}

            {/* ── Host action bar ── */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                {/* Invite */}
                <button
                  onClick={inviteListeners}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/[0.09] active:scale-95 transition"
                >
                  {inviteCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  {inviteCopied ? 'Copied!' : 'Invite listeners'}
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Record toggle */}
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isSavingRecording || Boolean(pendingRecording)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${
                      isRecording
                        ? 'bg-red-600 text-white hover:bg-red-500'
                        : 'border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    {isSavingRecording ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                    ) : pendingRecording ? (
                      <>Review recording</>
                    ) : isRecording ? (
                      <><Square className="h-3.5 w-3.5 fill-current" /> Stop rec</>
                    ) : (
                      <><Circle className="h-3.5 w-3.5 fill-red-500 text-red-500" /> Record</>
                    )}
                  </button>

                  {/* End space */}
                  <button
                    type="button"
                    onClick={() => setShowQuitConfirm(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-red-600/90 px-4 py-2.5 text-xs font-black text-white hover:bg-red-600 active:scale-95 transition"
                  >
                    End Space
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Circle, Clock, Loader2, Mic, Radio, Share2, Square, Users, AlertTriangle } from 'lucide-react';
import { UserSession } from './AuthModal';
import { Room, RoomEvent, RemoteTrack } from 'livekit-client';
import { djangoApi } from '../services/djangoApi';
import { INVITE_CALL_TO_ACTION, buildShareUrl } from '../lib/invites';
import AudioSpaceRoomTools from './AudioSpaceRoomTools';

export interface ActiveAudioSpace {
  title: string;
  topic: string;
  hostName: string;
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
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const roomRef = useRef<Room | null>(null);
  const roomNameRef = useRef<string | null>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const attachedAudioTrackSidsRef = useRef(new Set<string>());

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

  const saveRecording = async (blob: Blob) => {
    if (!currentUser?.isLoggedIn) {
      setError('Sign in again before saving this recording.');
      return;
    }
    if (!blob.size) {
      setError('The recording was empty. Please try again.');
      return;
    }

    setIsSavingRecording(true);
    setError('');
    try {
      const extension = blob.type.includes('ogg') ? 'ogg' : blob.type.includes('mp4') ? 'm4a' : 'webm';
      const file = new File([blob], `${title.trim() || 'Audio Space'} - recording.${extension}`, {
        type: blob.type || `audio/${extension}`,
      });
      await djangoApi.createSermon({
        title: `${title.trim() || 'Live Audio Space'} — Recording`,
        speaker: currentUser.fullName || currentUser.username || 'Host',
        description: topic.trim() || `Live Audio Space recording hosted by ${ministryName}.`,
        category: '24/7 Gospel Radio',
        kind: 'audio',
        is_published: true,
        tags: ['live-audio-space', '24/7-gospel-radio'],
        scripture_reference: topic.trim(),
        key_takeaways: [],
        visibility: 'public',
        audience: 'all_ages',
        media_file: file,
      });
      setRecordingSaved(true);
      window.setTimeout(() => setRecordingSaved(false), 4000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save the Audio Space recording.');
    } finally {
      setIsSavingRecording(false);
    }
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
      void saveRecording(blob);
    };
    recorder.onerror = () => setError('The Audio Space recording stopped unexpectedly.');
    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setIsRecording(true);
  };

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <>
      {/* ── Quit confirmation sheet ── */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-200 flex items-end justify-center sm:items-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-rose-500/30 bg-[#161616] p-6 shadow-2xl shadow-black/60 space-y-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 border border-rose-500/30">
                <AlertTriangle className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <p className="text-base font-black text-white">End this Audio Space?</p>
                <p className="mt-1.5 text-sm text-slate-400">
                  {isRecording
                    ? 'The active recording will be stopped and saved before the Space ends.'
                    : 'All listeners will be disconnected and the room will close.'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="rounded-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-slate-800 active:scale-95 transition"
              >
                No, stay
              </button>
              <button
                type="button"
                onClick={() => { setShowQuitConfirm(false); void endSpace(); }}
                className="rounded-full bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-500 active:scale-95 transition shadow-lg shadow-rose-600/25"
              >
                Yes, end it
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <button
            onClick={isLive ? () => setShowQuitConfirm(true) : onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white active:scale-95 transition min-h-9"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{isLive ? 'End Space' : 'Back to Creator Studio'}</span>
          </button>
          {isLive && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-rose-300">
              <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'animate-pulse bg-rose-400' : 'bg-amber-400'}`} />
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          )}
        </div>

        {!isLive ? (
          /* ── Setup screen ── */
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-[#161616] p-5 sm:p-8 space-y-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <Radio className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-wider">Audio Space</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">Start a live audio conversation</h1>
              <p className="mt-2 text-sm text-slate-400">Host a voice-first room for {ministryName}. Your microphone stays off until you start.</p>
            </div>
            <label className="block space-y-1.5 text-xs font-bold text-slate-300">
              Space title
              <input
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder="What are you talking about?"
                className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
              />
            </label>
            <label className="block space-y-1.5 text-xs font-bold text-slate-300">
              Topic or scripture <span className="font-normal text-slate-500">(optional)</span>
              <input
                value={topic}
                onChange={event => setTopic(event.target.value)}
                placeholder="Add context for listeners"
                className="mt-1.5 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
              />
            </label>
            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-bold text-rose-300">{error}</p>
            )}
            <button
              onClick={startSpace}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3.5 text-sm font-black text-slate-950 hover:bg-amber-400 active:scale-[0.98] transition"
            >
              <Mic className="w-4 h-4" /> Start Audio Space
            </button>
            <p className="text-center text-[11px] text-slate-500">Your microphone is published through LiveKit. Listeners can join from Home or Audio Podcasts.</p>
          </div>
        ) : (
          /* ── Live screen ── */
          <div className="mx-auto max-w-3xl space-y-4">
            {/* Header card */}
            <div className="rounded-3xl border border-rose-500/30 bg-linear-to-br from-rose-950/40 via-[#161616] to-[#161616] p-5 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-300">Live Audio Space</p>
                  <h1 className="mt-1 text-xl sm:text-2xl font-black text-white truncate">{title}</h1>
                  <p className="mt-1 text-sm text-slate-400 truncate">{topic || 'Open conversation'} · {activeAudioSpace?.hostName || currentUser?.fullName || 'Host'}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-xs font-mono text-slate-300">
                  <Clock className="w-4 h-4" />{formatTime(elapsedSeconds)}
                </div>
              </div>

              {/* Host avatar */}
              <div className="mt-8 flex flex-col items-center gap-3">
                <div className={`flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full border-4 bg-slate-900 transition-all duration-200 ${
                  roomRef.current?.localParticipant.isSpeaking
                    ? 'border-emerald-400 text-emerald-300 shadow-[0_0_32px_rgba(52,211,153,0.45)] ring-4 ring-emerald-400/20'
                    : 'border-rose-400/60 text-rose-300 shadow-xl shadow-rose-500/20'
                }`}>
                  <Mic className="h-9 w-9 sm:h-10 sm:w-10" />
                </div>
                <p className="text-sm font-bold text-white">{activeAudioSpace?.hostName || currentUser?.fullName || 'Host'}</p>
                <span className="rounded-full bg-rose-500/15 px-3 py-1 text-[10px] font-black uppercase text-rose-300">Host</span>
              </div>

              {/* Participant grid */}
              {remoteParticipants.length > 0 && (
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-800/70 pt-5 sm:grid-cols-4">
                  {remoteParticipants.slice(0, 12).map(participant => {
                    const isSpeaking = speakingParticipants.has(participant.identity);
                    return (
                      <div key={participant.identity} className="flex min-w-0 flex-col items-center text-center">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-base font-black transition-all duration-200 sm:h-18 sm:w-18 ${
                          isSpeaking
                            ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.45)] ring-4 ring-emerald-400/20'
                            : 'border-slate-600 bg-slate-800 text-slate-200'
                        }`}>
                          {isSpeaking ? <Mic className="h-5 w-5" /> : participant.name.slice(0, 1).toUpperCase()}
                        </div>
                        <p className="mt-1.5 w-full truncate text-xs font-bold text-white">{participant.name}</p>
                        <p className={`mt-0.5 text-[10px] ${isSpeaking ? 'font-bold text-emerald-300' : 'text-slate-400'}`}>
                          {isSpeaking ? 'Talking' : 'Listener'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Listener count */}
            <div className="rounded-2xl border border-slate-800 bg-[#161616] p-4 flex items-center gap-4">
              <Users className="h-5 w-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-xl font-black text-white">{listenerCount}</p>
                <p className="text-xs text-slate-400">Participants connected</p>
              </div>
            </div>

            {recordingSaved && (
              <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-xs font-bold text-emerald-300">
                Recording saved to your profile media and 24/7 Gospel Radio.
              </p>
            )}

            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-300">{error}</p>
            )}

            {roomRef.current && (
              <AudioSpaceRoomTools room={roomRef.current} roomName={roomNameRef.current || ''} canManage isHost />
            )}

            {/* Action row — wraps gracefully on small screens */}
            <div className="flex flex-wrap justify-center gap-2.5 pb-2">
              <button
                onClick={inviteListeners}
                className="flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-4 py-2.5 text-xs font-bold text-fuchsia-200 hover:bg-fuchsia-500/25 active:scale-95 transition"
              >
                {inviteCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {inviteCopied ? 'Link copied' : 'Invite'}
              </button>

              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSavingRecording}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isRecording
                    ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/25'
                    : 'border border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
                }`}
              >
                {isSavingRecording ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                ) : isRecording ? (
                  <><Square className="h-4 w-4 fill-current" />Stop recording</>
                ) : (
                  <><Circle className="h-4 w-4 fill-rose-500 text-rose-500" />Record</>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowQuitConfirm(true)}
                className="rounded-full bg-rose-600 px-4 py-2.5 text-xs font-black text-white hover:bg-rose-500 active:scale-95 transition shadow-lg shadow-rose-600/20"
              >
                End Space
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
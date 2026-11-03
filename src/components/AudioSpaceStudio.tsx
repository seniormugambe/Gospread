import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Clock, Mic, Radio, Share2, Users } from 'lucide-react';
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
  const [error, setError] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);
  const roomRef = useRef<Room | null>(null);
  const roomNameRef = useRef<string | null>(null);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const attachedAudioTrackSidsRef = useRef(new Set<string>());

  const syncListenerCount = (room: Room) => {
    setListenerCount(room.remoteParticipants.size);
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
        room.on(RoomEvent.TrackSubscribed, track => playRemoteAudio(track));
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
      room.on(RoomEvent.TrackSubscribed, track => playRemoteAudio(track));
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

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button onClick={isLive ? endSpace : onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>{isLive ? 'End and leave Space' : 'Back to Creator Studio'}</span>
        </button>
        {isLive && <span className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-rose-300"><span className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'animate-pulse bg-rose-400' : 'bg-amber-400'}`} />{isConnected ? 'Live' : 'Space open · host disconnected'}</span>}
      </div>

      {!isLive ? (
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-[#161616] p-6 sm:p-8 space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2 text-amber-400"><Radio className="w-5 h-5" /><span className="text-xs font-black uppercase tracking-wider">Audio Space</span></div>
            <h1 className="text-2xl font-black text-white">Start a live audio conversation</h1>
            <p className="mt-2 text-sm text-slate-400">Host a voice-first room for {ministryName}. Your microphone stays off until you start.</p>
          </div>
          <label className="block space-y-2 text-xs font-bold text-slate-300">
            Space title
            <input value={title} onChange={event => setTitle(event.target.value)} placeholder="What are you talking about?" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400" />
          </label>
          <label className="block space-y-2 text-xs font-bold text-slate-300">
            Topic or scripture <span className="font-normal text-slate-500">(optional)</span>
            <input value={topic} onChange={event => setTopic(event.target.value)} placeholder="Add context for listeners" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400" />
          </label>
          {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-bold text-rose-300">{error}</p>}
          <button onClick={startSpace} className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-400"><Mic className="w-4 h-4" /> Start Audio Space</button>
          <p className="text-center text-[11px] text-slate-500">Your microphone is published through LiveKit. Listeners can join from Home or Audio Podcasts.</p>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-[#161616] to-[#161616] p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-wider text-rose-300">Live Audio Space</p><h1 className="mt-1 text-2xl font-black text-white">{title}</h1><p className="mt-1 text-sm text-slate-400">{topic || 'Open conversation'} · {activeAudioSpace?.hostName || currentUser?.fullName || 'Host'}</p></div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300"><Clock className="w-4 h-4" />{formatTime(elapsedSeconds)}</div>
            </div>
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-rose-400/60 bg-slate-900 text-rose-300 shadow-xl shadow-rose-500/20"><Mic className="h-10 w-10" /></div>
              <p className="text-sm font-bold text-white">{activeAudioSpace?.hostName || currentUser?.fullName || 'Host'}</p>
              <span className="rounded-full bg-rose-500/15 px-3 py-1 text-[10px] font-black uppercase text-rose-300">Host</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-[#161616] p-4"><Users className="mb-2 h-5 w-5 text-sky-400" /><p className="text-2xl font-black text-white">{listenerCount}</p><p className="text-xs text-slate-400">Participants connected</p></div>
          </div>
          {roomRef.current && <AudioSpaceRoomTools room={roomRef.current} roomName={roomNameRef.current || ''} canManage isHost />}
          <div className="flex justify-center gap-3">
            <button onClick={inviteListeners} className="flex items-center gap-2 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-5 py-3 text-xs font-bold text-fuchsia-200 hover:bg-fuchsia-500/25"><>{inviteCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}</>{inviteCopied ? 'Link copied' : 'Invite listeners'}</button>
            <button onClick={endSpace} className="rounded-full bg-rose-600 px-5 py-3 text-xs font-black text-white hover:bg-rose-500">End Space</button>
          </div>
        </div>
      )}
    </div>
  );
}
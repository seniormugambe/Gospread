import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Clock, Mic, MicOff, Radio, Users } from 'lucide-react';
import { UserSession } from './AuthModal';
import { Room } from 'livekit-client';
import { djangoApi } from '../services/djangoApi';

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
  onBack: () => void;
  onSpaceChange?: (space: ActiveAudioSpace | null) => void;
}

export default function AudioSpaceStudio({ currentUser, ministryName, onBack, onSpaceChange }: AudioSpaceStudioProps) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState('');
  const streamRef = useRef<MediaStream | null>(null);
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    if (!isLive) return;
    const timer = window.setInterval(() => setElapsedSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isLive]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (currentUser?.isLoggedIn && roomRef.current?.name) {
      void djangoApi.endAudioSpace(roomRef.current.name);
    }
    roomRef.current?.disconnect();
  }, [currentUser?.isLoggedIn]);

  const startSpace = async () => {
    setError('');
    if (!title.trim()) {
      setError('Add a title before starting the Space.');
      return;
    }
    try {
      if (!currentUser?.isLoggedIn) {
        setError('Sign in before starting a live Audio Space.');
        return;
      }
      const roomName = `audio-space-${crypto.randomUUID()}`;
      const spaceTitle = title.trim();
      const spaceTopic = topic.trim();
      const { server_url: serverUrl, participant_token: token } = await djangoApi.createAudioSpaceToken(roomName, true, {
        title: spaceTitle,
        topic: spaceTopic,
        ministry_name: ministryName,
      });
      const room = new Room();
      await room.connect(serverUrl, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      roomRef.current = room;
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
      setError(error instanceof Error ? error.message : 'Could not connect to the live Audio Space.');
    }
  };

  const endSpace = () => {
    const roomName = roomRef.current?.name;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    roomRef.current?.disconnect();
    roomRef.current = null;
    if (roomName) void djangoApi.endAudioSpace(roomName);
    setIsLive(false);
    setIsMuted(false);
    onSpaceChange?.(null);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    streamRef.current?.getAudioTracks().forEach(track => { track.enabled = !nextMuted; });
    setIsMuted(nextMuted);
  };

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button onClick={isLive ? endSpace : onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          <span>{isLive ? 'End and leave Space' : 'Back to Creator Studio'}</span>
        </button>
        {isLive && <span className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-rose-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" /> Live</span>}
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
              <div><p className="text-xs font-bold uppercase tracking-wider text-rose-300">Live Audio Space</p><h1 className="mt-1 text-2xl font-black text-white">{title}</h1><p className="mt-1 text-sm text-slate-400">{topic || 'Open conversation'} · {currentUser?.fullName || 'Host'}</p></div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300"><Clock className="w-4 h-4" />{formatTime(elapsedSeconds)}</div>
            </div>
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-rose-400/60 bg-slate-900 text-rose-300 shadow-xl shadow-rose-500/20"><Mic className="h-10 w-10" /></div>
              <p className="text-sm font-bold text-white">{currentUser?.fullName || 'Host'}</p>
              <span className="rounded-full bg-rose-500/15 px-3 py-1 text-[10px] font-black uppercase text-rose-300">Host</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-[#161616] p-4"><Users className="mb-2 h-5 w-5 text-sky-400" /><p className="text-2xl font-black text-white">0</p><p className="text-xs text-slate-400">Listeners connected</p></div>
            <div className="rounded-2xl border border-slate-800 bg-[#161616] p-4"><Radio className="mb-2 h-5 w-5 text-amber-400" /><p className="text-2xl font-black text-white">0</p><p className="text-xs text-slate-400">Co-hosts invited</p></div>
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={toggleMute} className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-800">{isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}{isMuted ? 'Unmute' : 'Mute microphone'}</button>
            <button onClick={endSpace} className="rounded-full bg-rose-600 px-5 py-3 text-xs font-black text-white hover:bg-rose-500">End Space</button>
          </div>
        </div>
      )}
    </div>
  );
}
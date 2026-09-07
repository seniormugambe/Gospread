import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Clock, Mic, MicOff, Radio, Square, Wifi, WifiOff } from 'lucide-react';
import { Room, RoomEvent } from 'livekit-client';
import { UserSession } from './AuthModal';
import { djangoApi } from '../services/djangoApi';

interface LiveBroadcastRoomProps {
  currentUser?: UserSession;
  title: string;
  description: string;
  speaker: string;
  category: string;
  scripture: string;
  mode: 'quick' | 'studio';
  onEnd: (data: {
    title: string;
    description: string;
    speaker: string;
    scripture: string;
    category: string;
    durationMinutes: number;
    durationFormatted: string;
    totalWorshippers: number;
    peakWorshippers: number;
    prayersCount: number;
    thumbnail: string;
    videoUrl: string;
  }) => void;
  onBack: () => void;
}

export default function LiveBroadcastRoom({ currentUser, title, description, speaker, category, scripture, mode, onEnd, onBack }: LiveBroadcastRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isConnected, setIsConnected] = useState(mode === 'studio');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(mode === 'studio');
  const [error, setError] = useState('');

  // Only start the timer once connected so elapsed time reflects actual broadcast time
  useEffect(() => {
    if (!isConnected) return;
    const timer = window.setInterval(() => setElapsedSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isConnected]);

  const attachLocalVideo = () => {
    const publication = Array.from(roomRef.current?.localParticipant.videoTrackPublications.values() || [])[0];
    const track = publication?.track;
    if (track && videoRef.current) track.attach(videoRef.current);
  };

  // Capture mutable props in a ref so the effect doesn't re-run when they change
  const propsRef = useRef({ currentUser, title, description, speaker, category, scripture, mode });
  useEffect(() => {
    propsRef.current = { currentUser, title, description, speaker, category, scripture, mode };
  });

  useEffect(() => {
    if (propsRef.current.mode !== 'quick') return;
    let active = true;
    const startRoom = async () => {
      const { currentUser: user, title: t, description: d, category: c, scripture: s, speaker: sp } = propsRef.current;
      try {
        if (!user?.isLoggedIn) throw new Error('Sign in before starting a Quick Live broadcast.');
        const roomName = `video-live-${crypto.randomUUID()}`;
        const tokenData = await djangoApi.createAudioSpaceToken(roomName, true, {
          title: t,
          topic: d,
          ministry_name: user.ministryName || user.churchName || 'Gospread Ministry',
        });
        if (!active) return;
        const room = new Room();
        roomRef.current = room;
        room.on(RoomEvent.TrackPublished, attachLocalVideo);
        room.on(RoomEvent.LocalTrackPublished, attachLocalVideo);
        room.on(RoomEvent.Disconnected, () => {
          if (active) setIsConnected(false);
        });
        await room.connect(tokenData.server_url, tokenData.participant_token);
        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);
        if (active) {
          setIsConnected(true);
          setIsCameraEnabled(true);
          window.setTimeout(attachLocalVideo, 100);
        }
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Could not connect to the live video service.');
      }
    };
    void startRoom();
    return () => {
      active = false;
      const roomName = roomRef.current?.name;
      if (roomName) void djangoApi.endAudioSpace(roomName);
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount — props are accessed via ref

  const endBroadcast = () => {
    const roomName = roomRef.current?.name;
    roomRef.current?.disconnect();
    roomRef.current = null;
    if (roomName) void djangoApi.endAudioSpace(roomName);
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    onEnd({
      title: title || 'Live Broadcast Recording',
      description,
      speaker,
      scripture,
      category: category || 'Live Worship',
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      durationFormatted: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      totalWorshippers: 0,
      peakWorshippers: 0,
      prayersCount: 0,
      thumbnail: '',
      videoUrl: '',
    });
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    void roomRef.current?.localParticipant.setMicrophoneEnabled(!nextMuted);
    setIsMuted(nextMuted);
  };

  const toggleCamera = () => {
    const nextEnabled = !isCameraEnabled;
    void roomRef.current?.localParticipant.setCameraEnabled(nextEnabled);
    setIsCameraEnabled(nextEnabled);
  };

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-3 py-5 text-white sm:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-[#141416] p-4 shadow-2xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3"><Radio className="h-6 w-6 text-red-400" /><div><h1 className="text-lg font-black">{mode === 'quick' ? 'QUICK LIVE' : 'STUDIO LIVE'}</h1><p className="text-xs text-slate-400">{title || 'Untitled broadcast'} · {speaker || 'Host'}</p></div></div>
          <div className="flex flex-wrap items-center gap-2"><span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${isConnected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>{isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}{mode === 'quick' ? (isConnected ? 'Connected' : 'Connecting') : 'Awaiting encoder signal'}</span><span className="flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-mono"><Clock className="h-3.5 w-3.5 text-red-400" />{formatTime(elapsedSeconds)}</span><button onClick={endBroadcast} className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-black hover:bg-red-500"><Square className="h-3.5 w-3.5 fill-white" />End Live</button></div>
        </header>

        {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-bold text-rose-200">{error}<button onClick={onBack} className="ml-3 underline">Return to setup</button></div>}

        <main className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-4">
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
              {mode === 'quick' ? <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${isCameraEnabled ? '' : 'hidden'}`} /> : <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"><Radio className="h-12 w-12 text-amber-400" /><h2 className="text-xl font-black">Waiting for Studio encoder</h2><p className="max-w-md text-sm text-slate-400">Start OBS, vMix, Streamlabs, or your hardware encoder with the Gospread RTMPS credentials. This page will become the broadcast monitor when the ingest service reports a signal.</p></div>}
              {mode === 'quick' && !isCameraEnabled && <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-400">Camera is off</div>}
              <div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase">{isConnected ? 'Live feed' : 'No signal'}</div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-3xl border border-slate-800 bg-[#141416] p-4">
              {mode === 'quick' && <><button onClick={toggleCamera} className="flex items-center gap-2 rounded-full border border-slate-700 px-5 py-3 text-xs font-bold hover:bg-slate-800">{isCameraEnabled ? <Camera className="h-4 w-4 text-emerald-400" /> : <CameraOff className="h-4 w-4 text-rose-400" />}{isCameraEnabled ? 'Turn camera off' : 'Turn camera on'}</button><button onClick={toggleMute} className="flex items-center gap-2 rounded-full border border-slate-700 px-5 py-3 text-xs font-bold hover:bg-slate-800">{isMuted ? <MicOff className="h-4 w-4 text-rose-400" /> : <Mic className="h-4 w-4 text-emerald-400" />}{isMuted ? 'Unmute microphone' : 'Mute microphone'}</button></>}
              <button onClick={onBack} className="rounded-full border border-slate-700 px-5 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800">Back to setup</button>
            </div>
          </section>

          <aside className="space-y-4 rounded-3xl border border-slate-800 bg-[#141416] p-5">
            <div><p className="text-[10px] font-black uppercase tracking-wider text-amber-300">Broadcast details</p><h2 className="mt-1 text-lg font-black">{title || 'Untitled broadcast'}</h2><p className="mt-1 text-xs text-slate-400">{category || 'Live Worship'} · {scripture || 'No scripture anchor'}</p></div>
            <div className="border-t border-slate-800 pt-4 text-xs text-slate-400"><p>{mode === 'quick' ? 'Your camera and microphone are published through Gospread Live.' : 'Your encoder publishes to Gospread RTMPS ingest.'}</p><p className="mt-3 font-bold text-emerald-300">No external live control room required.</p></div>
          </aside>
        </main>
      </div>
    </div>
  );
}

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Hand, MessageCircle, Mic, MicOff, Send, Shield, UserMinus, UserPlus } from 'lucide-react';
import { Room, RoomEvent, RemoteParticipant } from 'livekit-client';
import { djangoApi } from '../services/djangoApi';

interface RoomMessage {
  id: string;
  name: string;
  text: string;
  kind: 'chat' | 'reaction';
}

interface SpeakerRequest {
  identity: string;
  name: string;
}

type RoomRole = 'host' | 'cohost' | 'speaker' | 'listener';

interface AudioSpaceRoomToolsProps {
  room: Room | null;
  roomName: string;
  canManage: boolean;
  isHost: boolean;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export default function AudioSpaceRoomTools({ room, roomName, canManage, isHost }: AudioSpaceRoomToolsProps) {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [requests, setRequests] = useState<SpeakerRequest[]>([]);
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [roles, setRoles] = useState<Record<string, 'speaker' | 'cohost'>>({});
  const [assignedRole, setAssignedRole] = useState<RoomRole | null>(null);
  const [messageText, setMessageText] = useState('');
  const [canSpeak, setCanSpeak] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState('');

  const localParticipant = room?.localParticipant;
  const localName = localParticipant?.name || 'Listener';
  const currentUserRole: RoomRole = isHost
    ? 'host'
    : roles[localParticipant?.identity || ''] || assignedRole || (canSpeak ? 'speaker' : 'listener');
  const canModerate = canManage || isHost || currentUserRole === 'cohost';

  const syncParticipants = () => {
    if (!room) return;
    setParticipants(Array.from(room.remoteParticipants.values()));
  };

  useEffect(() => {
    setMessages([]);
    setRequests([]);
    setRoles({});
    setAssignedRole(null);
    setError('');
  }, [room, roomName]);

  useEffect(() => {
    if (!room) {
      setParticipants([]);
      setCanSpeak(false);
      setIsMicEnabled(false);
      setRequestSent(false);
      return;
    }

    const syncLocalPermissions = () => {
      const allowed = Boolean(room.localParticipant.permissions?.canPublish);
      setCanSpeak(allowed);
      setIsMicEnabled(room.localParticipant.isMicrophoneEnabled);
      if (!allowed) setIsMicEnabled(false);
      if (allowed) setRequestSent(false);
    };
    const handleData = (payload: Uint8Array, participant?: RemoteParticipant) => {
      if (!participant) return;
      try {
        const event = JSON.parse(decoder.decode(payload)) as {
          id?: string;
          type?: string;
          text?: string;
          identity?: string;
          role?: RoomRole | 'removed';
        };
        if (event.type === 'chat' && typeof event.text === 'string') {
          setMessages(previous => previous.some(message => message.id === event.id) ? previous : [...previous, {
            id: event.id || crypto.randomUUID(),
            name: participant.name || participant.identity,
            text: event.text.slice(0, 500),
            kind: 'chat',
          }].slice(-100));
        } else if (event.type === 'reaction' && typeof event.text === 'string') {
          setMessages(previous => previous.some(message => message.id === event.id) ? previous : [...previous, {
            id: event.id || crypto.randomUUID(),
            name: participant.name || participant.identity,
            text: event.text.slice(0, 8),
            kind: 'reaction',
          }].slice(-100));
        } else if (event.type === 'speaker_request' && canModerate) {
          setRequests(previous => previous.some(request => request.identity === participant.identity)
            ? previous
            : [...previous, { identity: participant.identity, name: participant.name || participant.identity }]);
        } else if (event.type === 'role_update' && event.identity === room.localParticipant.identity) {
          if (event.role === 'cohost' || event.role === 'speaker' || event.role === 'listener') {
            setAssignedRole(event.role);
          }
        }
      } catch {
        setError('Received an unreadable Audio Space message.');
      }
    };
    const handlePermissionsChanged = (_previous: unknown, participant: RemoteParticipant) => {
      syncParticipants();
      if (participant.identity === room.localParticipant.identity) syncLocalPermissions();
      if (canModerate) {
        void djangoApi.getAudioSpaceParticipants(roomName).then(spaceParticipants => {
          setRoles(Object.fromEntries(spaceParticipants.map(item => [item.identity, item.role])));
        }).catch(loadError => {
          setError(loadError instanceof Error ? loadError.message : 'Could not refresh participant roles.');
        });
      }
    };

    syncParticipants();
    syncLocalPermissions();
    room.on(RoomEvent.ParticipantConnected, syncParticipants);
    room.on(RoomEvent.ParticipantDisconnected, syncParticipants);
    room.on(RoomEvent.ParticipantPermissionsChanged, handlePermissionsChanged);
    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.ParticipantConnected, syncParticipants);
      room.off(RoomEvent.ParticipantDisconnected, syncParticipants);
      room.off(RoomEvent.ParticipantPermissionsChanged, handlePermissionsChanged);
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, canModerate, roomName]);

  useEffect(() => {
    if (!canModerate || !roomName) return;
    let active = true;
    void djangoApi.getAudioSpaceParticipants(roomName).then(spaceParticipants => {
      if (!active) return;
      setRoles(Object.fromEntries(spaceParticipants.map(participant => [participant.identity, participant.role])));
    }).catch(loadError => {
      if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load participant roles.');
    });
    return () => { active = false; };
  }, [canModerate, roomName]);

  const publish = async (event: { id?: string; type: string; text?: string; identity?: string; role?: RoomRole | 'removed' }) => {
    if (!room || room.state !== 'connected') {
      setError('Reconnect to the Audio Space before sending messages.');
      return false;
    }
    try {
      const payload = { ...event, id: event.id || crypto.randomUUID() };
      await room.localParticipant.publishData(encoder.encode(JSON.stringify(payload)), {
        reliable: true,
        topic: 'gospread-audio-space',
      });
      setError('');
      return true;
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Could not send this Audio Space message.');
      return false;
    }
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = messageText.trim().slice(0, 500);
    if (!text) return;
    const id = crypto.randomUUID();
    if (await publish({ id, type: 'chat', text })) {
      setMessages(previous => [...previous, { id, name: localName, text, kind: 'chat' }].slice(-100));
      setMessageText('');
    }
  };

  const sendReaction = async (reaction: string) => {
    const id = crypto.randomUUID();
    if (await publish({ id, type: 'reaction', text: reaction })) {
      setMessages(previous => [...previous, { id, name: localName, text: reaction, kind: 'reaction' }].slice(-100));
    }
  };

  const requestToSpeak = async () => {
    if (await publish({ type: 'speaker_request' })) setRequestSent(true);
  };

  const toggleMicrophone = async () => {
    if (!room || !canSpeak) return;
    try {
      await room.localParticipant.setMicrophoneEnabled(!isMicEnabled);
      setIsMicEnabled(!isMicEnabled);
      setError('');
    } catch (micError) {
      setError(micError instanceof Error ? micError.message : 'Could not change microphone access.');
    }
  };

  const manageParticipant = async (participant: RemoteParticipant, role: 'speaker' | 'cohost' | 'listener' | 'remove') => {
    try {
      await djangoApi.setAudioSpaceParticipantRole(roomName, participant.identity, role, participant.name || participant.identity);
      setRoles(previous => {
        const next = { ...previous };
        if (role === 'speaker' || role === 'cohost') next[participant.identity] = role;
        else delete next[participant.identity];
        return next;
      });
      setRequests(previous => previous.filter(request => request.identity !== participant.identity));
          if (role !== 'remove') {
            if (!await publish({ type: 'role_update', identity: participant.identity, role })) return;
          }
          setError('');
    } catch (manageError) {
      setError(manageError instanceof Error ? manageError.message : 'Could not update participant access.');
    }
  };

  const participantNames = useMemo(
    () => new Map(participants.map(participant => [participant.identity, participant.name || participant.identity])),
    [participants],
  );

  return (
    <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-black text-white"><MessageCircle className="h-4 w-4 text-fuchsia-300" /> Room chat</h2>
          <div className="flex items-center gap-2">
            {['🙏', '❤️', '👏'].map(reaction => (
              <button key={reaction} type="button" onClick={() => void sendReaction(reaction)} className="rounded-full border border-slate-700 px-2.5 py-1 text-sm hover:bg-slate-800" aria-label={`Send ${reaction} reaction`}>{reaction}</button>
            ))}
          </div>
        </div>
        <div className="h-40 space-y-2 overflow-y-auto rounded-xl bg-slate-900/70 p-3" aria-live="polite">
          {messages.length === 0 && <p className="text-xs text-slate-500">Say hello or send a reaction to the room.</p>}
          {messages.map(message => (
            <p key={message.id} className="break-words text-xs text-slate-200">
              <span className="font-bold text-fuchsia-200">{message.name}</span>
              {message.kind === 'reaction' ? <span className="ml-2 text-base">{message.text}</span> : <span className="ml-2">{message.text}</span>}
            </p>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input value={messageText} onChange={event => setMessageText(event.target.value)} maxLength={500} placeholder="Write a message..." className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400" />
          <button type="submit" disabled={!messageText.trim()} className="flex items-center gap-1 rounded-xl bg-fuchsia-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Send className="h-4 w-4" /> Send</button>
        </form>
        <div className="flex flex-wrap gap-2">
          {canSpeak ? (
            <button type="button" onClick={() => void toggleMicrophone()} className="flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800">
              {isMicEnabled ? <MicOff className="h-4 w-4 text-rose-400" /> : <Mic className="h-4 w-4 text-emerald-400" />}
              {isMicEnabled ? 'Turn mic off' : 'Start speaking'}
            </button>
          ) : (
            <button type="button" onClick={() => void requestToSpeak()} disabled={requestSent} className="flex items-center gap-2 rounded-full border border-amber-400/40 px-4 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/10 disabled:opacity-60">
              <Hand className="h-4 w-4" /> {requestSent ? 'Request sent' : 'Request to speak'}
            </button>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-2 text-[11px] text-slate-400">
            <Shield className="h-3.5 w-3.5" /> {currentUserRole === 'host' ? 'Host' : currentUserRole === 'cohost' ? 'Co-host' : currentUserRole === 'speaker' ? 'Speaker' : 'Listener'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-black text-white">People in this Space</h2>
        {canModerate && requests.length > 0 && (
          <div className="space-y-2 rounded-xl border border-amber-400/30 bg-amber-500/5 p-3">
            <p className="text-xs font-black text-amber-200">Requests to speak</p>
            {requests.map(request => (
              <div key={request.identity} className="flex items-center justify-between gap-2 text-xs text-slate-200">
                <span className="truncate">{request.name}</span>
                <button type="button" onClick={() => {
                  const participant = participants.find(item => item.identity === request.identity);
                  if (participant) void manageParticipant(participant, 'speaker');
                  else setRequests(previous => previous.filter(item => item.identity !== request.identity));
                }} className="rounded-lg bg-emerald-600 px-2.5 py-1 font-bold text-white">Allow</button>
                <button type="button" onClick={() => setRequests(previous => previous.filter(item => item.identity !== request.identity))} className="rounded-lg bg-slate-800 px-2.5 py-1 font-bold text-slate-300">Dismiss</button>
              </div>
            ))}
          </div>
        )}
        {participants.length === 0 && <p className="text-xs text-slate-500">No other participants yet.</p>}
        <div className="max-h-56 space-y-2 overflow-y-auto">
          {participants.map(participant => {
            const role = roles[participant.identity] || (participant.permissions?.canPublish ? 'speaker' : 'listener');
            const canAppointCohost = isHost && participant.identity.startsWith('user-') && role !== 'cohost';
            return (
              <div key={participant.identity} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/70 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-200">{participantNames.get(participant.identity)}</span>
                <span className="text-[10px] uppercase text-slate-400">{role}</span>
                {canModerate && (
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => void manageParticipant(participant, role === 'speaker' || role === 'cohost' ? 'listener' : 'speaker')} className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] font-bold text-slate-200 hover:bg-slate-800">
                      {role === 'speaker' || role === 'cohost' ? 'Mute' : 'Allow mic'}
                    </button>
                    {canAppointCohost && <button type="button" onClick={() => void manageParticipant(participant, 'cohost')} className="rounded-lg border border-fuchsia-500/40 px-2 py-1 text-[10px] font-bold text-fuchsia-200 hover:bg-fuchsia-500/10"><UserPlus className="inline h-3 w-3" /> Co-host</button>}
                    {canManage && role === 'cohost' && isHost && <button type="button" onClick={() => void manageParticipant(participant, 'speaker')} className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] font-bold text-slate-200">Remove co-host</button>}
                    <button type="button" onClick={() => void manageParticipant(participant, 'remove')} className="rounded-lg border border-rose-500/40 px-2 py-1 text-[10px] font-bold text-rose-200 hover:bg-rose-500/10" aria-label={`Remove ${participant.name || participant.identity}`}><UserMinus className="h-3 w-3" /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {error && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-200">{error}</p>}
      </div>
    </section>
  );
}

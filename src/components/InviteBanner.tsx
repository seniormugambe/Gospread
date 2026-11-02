import { UserPlus, X } from 'lucide-react';
import { Referrer } from '../lib/invites';

interface InviteBannerProps {
  referrer: Referrer;
  onJoin: () => void;
  onDismiss: () => void;
}

export default function InviteBanner({ referrer, onJoin, onDismiss }: InviteBannerProps) {
  const inviter = referrer.name || `@${referrer.id.replace(/^@/, '')}`;

  return (
    <div className="relative z-50 flex items-center justify-between gap-3 bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-2 text-slate-950 sm:px-5">
      <div className="flex min-w-0 items-center gap-2 text-xs font-bold sm:text-sm">
        <UserPlus className="h-4 w-4 shrink-0" />
        <span className="truncate">{inviter} invited you to join Gospread. Create a free account to worship, watch and pray together.</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onJoin}
          className="rounded-full bg-slate-950 px-3 py-1 text-xs font-black text-amber-300 hover:bg-slate-800"
        >
          Join free
        </button>
        <button onClick={onDismiss} aria-label="Dismiss invitation" className="rounded-full p-1 hover:bg-black/10">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardList, ExternalLink, MapPin, Pencil, X } from 'lucide-react';
import OnboardingFlow from './OnboardingFlow';
import { djangoApi, OnboardingField, OnboardingState, OnboardingTrack } from '../services/djangoApi';

const TRACK_LABEL: Record<OnboardingTrack, string> = {
  ministry: 'Ministry',
  artiste: 'Gospel Artiste',
  creator: 'Creator',
};

interface LocationAnswer {
  name?: string;
  address?: string;
  map_url?: string;
}

const isUrl = (value: string) => /^https?:\/\//i.test(value);

function Link({ href, children }: { href: string; children?: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-amber-400 hover:underline">
      {children ?? href}
      <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  );
}

function renderValue(field: OnboardingField, value: unknown): React.ReactNode {
  if (field.type === 'locations' && Array.isArray(value)) {
    return (
      <ul className="space-y-2">
        {(value as LocationAnswer[]).map((loc, index) => (
          <li key={index} className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span>
              <span className="font-semibold text-white">{loc.name}</span>
              {loc.address ? <span className="block text-slate-300">{loc.address}</span> : null}
              {loc.map_url ? <Link href={loc.map_url}>View on map</Link> : null}
            </span>
          </li>
        ))}
      </ul>
    );
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {value.map(item => {
          const text = String(item);
          return isUrl(text)
            ? <span key={text} className="rounded-full bg-slate-800 px-2.5 py-1 text-xs"><Link href={text} /></span>
            : <span key={text} className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-100">{text}</span>;
        })}
      </div>
    );
  }
  const text = String(value);
  if (field.type === 'url' && isUrl(text)) return <Link href={text} />;
  if (field.type === 'email') return <a href={`mailto:${text}`} className="break-all text-amber-400 hover:underline">{text}</a>;
  if (field.type === 'phone') return <a href={`tel:${text}`} className="text-amber-400 hover:underline">{text}</a>;
  return <span className="whitespace-pre-line text-slate-100">{text}</span>;
}

const hasValue = (value: unknown) =>
  Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== '';

export default function OnboardingProfileCard() {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [fields, setFields] = useState<OnboardingField[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([djangoApi.getOnboarding(), djangoApi.getOnboardingQuestions()])
      .then(([saved, questions]) => {
        if (cancelled || !saved.completed || !saved.track) return;
        setState(saved);
        setFields(questions[saved.track] ?? []);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  if (!state?.track) return null;
  const rows = fields.filter(field => hasValue(state.answers[field.key]));
  if (!rows.length) return null;

  return (
    <section aria-label="Onboarding details" className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
        <ClipboardList className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-bold text-amber-300">{TRACK_LABEL[state.track]} details</h3>
        <button type="button" onClick={() => setEditing(true)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:border-amber-400 hover:text-white">
          <Pencil className="h-3.5 w-3.5 text-amber-400" /> Edit details
        </button>
      </div>
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {rows.map(field => (
          <div key={field.key} className={field.type === 'textarea' || field.type === 'locations' ? 'sm:col-span-2' : ''}>
            <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{field.label}</dt>
            <dd className="mt-1 text-sm">{renderValue(field, state.answers[field.key])}</dd>
          </div>
        ))}
      </dl>
      {editing && createPortal(
        <div className="auth-surface fixed inset-0 z-[70] overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
          <button type="button" aria-label="Close" onClick={() => setEditing(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
          <div className="flex min-h-full items-center justify-center p-4 py-12">
            <OnboardingFlow
              initialTrack={state.track}
              initialAnswers={state.answers}
              skipLabel="Cancel"
              onSkip={() => setEditing(false)}
              onComplete={(user, track) => {
                setState(previous => (previous ? { ...previous, track } : previous));
                djangoApi.getOnboarding().then(setState).catch(() => undefined);
                setEditing(false);
              }}
            />
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

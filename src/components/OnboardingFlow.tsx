import React, { useEffect, useState } from 'react';
import { Church, Mic2, Plus, Sparkles, Trash2, X, Loader2 } from 'lucide-react';
import {
  djangoApi,
  OnboardingAnswers,
  OnboardingField,
  OnboardingTrack,
  OnboardingValidationError,
  UserProfileData,
} from '../services/djangoApi';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (user: UserProfileData | undefined, track: OnboardingTrack) => void;
}

interface LocationDraft {
  name: string;
  address: string;
  map_url: string;
}

type Draft = string | LocationDraft[];

const TRACKS: { id: OnboardingTrack; title: string; blurb: string; icon: React.ElementType }[] = [
  { id: 'ministry', title: 'Ministry', blurb: 'A church or ministry sharing sermons, events and giving.', icon: Church },
  { id: 'artiste', title: 'Gospel Artiste', blurb: 'Singers, worship leaders, bands, choirs and instrumentalists.', icon: Mic2 },
  { id: 'creator', title: 'Creator', blurb: 'Teachers, podcasters and video creators making Gospel content.', icon: Sparkles },
];

const EMPTY_LOCATION: LocationDraft = { name: '', address: '', map_url: '' };
const isMultiLine = (type: OnboardingField['type']) => type === 'list' || type === 'urls';

const initialDraft = (field: OnboardingField): Draft => (field.type === 'locations' ? [{ ...EMPTY_LOCATION }] : '');

const splitLines = (value: string) =>
  value.split(/[\n,]/).map(item => item.trim()).filter(Boolean);

// Splitting on commas would break URLs that contain them, so links only split on new lines.
const toAnswers = (fields: OnboardingField[], drafts: Record<string, Draft>): OnboardingAnswers => {
  const answers: OnboardingAnswers = {};
  fields.forEach(field => {
    const draft = drafts[field.key];
    if (field.type === 'locations') {
      const rows = (draft as LocationDraft[]).filter(row => row.name || row.address || row.map_url);
      if (rows.length) answers[field.key] = rows;
    } else if (field.type === 'urls') {
      const items = String(draft).split('\n').map(item => item.trim()).filter(Boolean);
      if (items.length) answers[field.key] = items;
    } else if (field.type === 'list') {
      const items = splitLines(String(draft));
      if (items.length) answers[field.key] = items;
    } else if (String(draft).trim()) {
      answers[field.key] = String(draft).trim();
    }
  });
  return answers;
};

const inputClass = (invalid: boolean) =>
  `w-full rounded-lg border bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-amber-500 ${
    invalid ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
  }`;

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [questions, setQuestions] = useState<Record<OnboardingTrack, OnboardingField[]> | null>(null);
  const [track, setTrack] = useState<OnboardingTrack | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || questions) return;
    let cancelled = false;
    setLoading(true);
    djangoApi.getOnboardingQuestions()
      .then(data => { if (!cancelled) setQuestions(data); })
      .catch(error => { if (!cancelled) setFormError(error instanceof Error ? error.message : 'Could not load onboarding.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isOpen, questions]);

  if (!isOpen) return null;

  const fields = track && questions ? questions[track] : [];

  const chooseTrack = (next: OnboardingTrack) => {
    if (!questions) return;
    const initial: Record<string, Draft> = {};
    questions[next].forEach(field => { initial[field.key] = initialDraft(field); });
    setDrafts(initial);
    setErrors({});
    setFormError('');
    setTrack(next);
  };

  const setDraft = (key: string, value: Draft) => {
    setDrafts(previous => ({ ...previous, [key]: value }));
    setErrors(previous => {
      if (!previous[key]) return previous;
      const { [key]: _removed, ...rest } = previous;
      return rest;
    });
  };

  const updateLocation = (key: string, index: number, patch: Partial<LocationDraft>) => {
    const rows = (drafts[key] as LocationDraft[]).map((row, i) => (i === index ? { ...row, ...patch } : row));
    setDraft(key, rows);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!track) return;
    setSaving(true);
    setFormError('');
    const answers = toAnswers(fields, drafts);
    const clientErrors: Record<string, string> = {};
    fields.forEach(field => {
      if (field.required && !(field.key in answers)) clientErrors[field.key] = 'This field is required.';
    });
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setFormError('Please fill in the required fields.');
      setSaving(false);
      return;
    }
    try {
      const result = await djangoApi.submitOnboarding(track, answers);
      onComplete(result.user, track);
    } catch (error) {
      if (error instanceof OnboardingValidationError) {
        setErrors(error.fieldErrors);
        setFormError(error.message);
      } else {
        setFormError(error instanceof Error ? error.message : 'Could not save your onboarding.');
      }
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: OnboardingField) => {
    const invalid = Boolean(errors[field.key]);
    const draft = drafts[field.key];
    const id = `onboarding-${field.key}`;

    let control: React.ReactNode;
    if (field.type === 'locations') {
      const rows = draft as LocationDraft[];
      control = (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3">
              <input className={inputClass(false)} placeholder="Branch name, e.g. Kira Main Campus" value={row.name}
                onChange={e => updateLocation(field.key, index, { name: e.target.value })} />
              <input className={inputClass(false)} placeholder="Address" value={row.address}
                onChange={e => updateLocation(field.key, index, { address: e.target.value })} />
              <input className={inputClass(false)} placeholder="Google Maps link" inputMode="url" value={row.map_url}
                onChange={e => updateLocation(field.key, index, { map_url: e.target.value })} />
              {rows.length > 1 && (
                <button type="button" className="inline-flex items-center gap-1 text-xs text-red-600"
                  onClick={() => setDraft(field.key, rows.filter((_, i) => i !== index))}>
                  <Trash2 className="h-3 w-3" /> Remove location
                </button>
              )}
            </div>
          ))}
          <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"
            onClick={() => setDraft(field.key, [...rows, { ...EMPTY_LOCATION }])}>
            <Plus className="h-3 w-3" /> Add another location
          </button>
        </div>
      );
    } else if (field.type === 'textarea' || isMultiLine(field.type)) {
      control = (
        <textarea id={id} rows={field.type === 'textarea' ? 4 : 3} className={inputClass(invalid)}
          placeholder={field.type === 'urls' ? 'One link per line' : field.type === 'list' ? 'Separate with commas or new lines' : ''}
          value={draft as string} onChange={e => setDraft(field.key, e.target.value)} />
      );
    } else if (field.type === 'single') {
      control = (
        <select id={id} className={inputClass(invalid)} value={draft as string} onChange={e => setDraft(field.key, e.target.value)}>
          <option value="">Select…</option>
          {field.options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      );
    } else {
      const inputType = { email: 'email', url: 'url', phone: 'tel' }[field.type as string] || 'text';
      control = (
        <input id={id} type={inputType} className={inputClass(invalid)} value={draft as string}
          onChange={e => setDraft(field.key, e.target.value)} />
      );
    }

    return (
      <div key={field.key} className="space-y-1">
        <label htmlFor={id} className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {field.label}{field.required && <span className="text-red-500"> *</span>}
        </label>
        {field.hint && <p className="text-xs text-zinc-500">{field.hint}</p>}
        {control}
        {invalid && <p className="text-xs text-red-600">{errors[field.key]}</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-label="Gospread onboarding"
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-zinc-950 p-5 sm:p-7 shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close onboarding"
          className="absolute right-4 top-4 rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Welcome to Gospread Kingdom</h2>
        <p className="mt-1 text-sm text-zinc-500">
          {track ? 'Tell us about your profile. Only the account owner or an authorized representative should submit this.' : 'How will you be using Gospread?'}
        </p>

        {loading && <div className="mt-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-amber-500" /></div>}
        {!loading && !questions && formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

        {questions && !track && (
          <div className="mt-5 grid gap-3">
            {TRACKS.map(({ id, title, blurb, icon: Icon }) => (
              <button key={id} type="button" onClick={() => chooseTrack(id)}
                className="flex items-start gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-left hover:border-amber-500">
                <Icon className="mt-0.5 h-5 w-5 text-amber-500" />
                <span>
                  <span className="block font-semibold text-zinc-900 dark:text-white">{title}</span>
                  <span className="block text-sm text-zinc-500">{blurb}</span>
                </span>
              </button>
            ))}
            <button type="button" onClick={onClose} className="mt-1 text-sm text-zinc-500 underline">Skip for now</button>
          </div>
        )}

        {questions && track && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            {fields.map(renderField)}
            {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setTrack(null)} className="text-sm text-zinc-500 underline">Back</button>
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-black disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Finish onboarding
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

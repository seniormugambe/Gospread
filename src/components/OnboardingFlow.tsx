import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Church, Loader2, Mic2, Plus, Sparkles, Trash2, X } from 'lucide-react';
import {
  djangoApi,
  OnboardingAnswers,
  OnboardingField,
  OnboardingTrack,
  OnboardingValidationError,
  UserProfileData,
} from '../services/djangoApi';

interface OnboardingFlowProps {
  initialTrack?: OnboardingTrack;
  onSkip: () => void;
  onComplete: (user: UserProfileData | undefined, track: OnboardingTrack) => void;
}

interface LocationDraft {
  name: string;
  address: string;
  map_url: string;
}

type Draft = string | string[] | LocationDraft[];

const TRACKS: { id: OnboardingTrack; title: string; blurb: string; icon: React.ElementType }[] = [
  { id: 'ministry', title: 'Ministry', blurb: 'A church or ministry sharing sermons, events and giving.', icon: Church },
  { id: 'artiste', title: 'Gospel Artiste', blurb: 'Singers, worship leaders, bands, choirs and instrumentalists.', icon: Mic2 },
  { id: 'creator', title: 'Creator', blurb: 'Teachers, podcasters and video creators making Gospel content.', icon: Sparkles },
];

// Steps group the backend's fields; any field not listed here lands in a final "More details" step.
const STEPS: Record<OnboardingTrack, { title: string; subtitle: string; keys: string[] }[]> = {
  ministry: [
    { title: 'Your ministry', subtitle: 'Who you are and what you do.', keys: ['ministry_name', 'description', 'senior_pastor'] },
    { title: 'Locations', subtitle: 'Where people can find you in person.', keys: ['locations'] },
    { title: 'Community', subtitle: 'Artistes and official pages connected to your ministry.', keys: ['affiliated_artistes', 'social_links'] },
    { title: 'Contact', subtitle: 'How people can reach your ministry.', keys: ['phone', 'whatsapp', 'email'] },
  ],
  artiste: [
    { title: 'Your artistry', subtitle: 'Tell us what you create.', keys: ['stage_name', 'artiste_type', 'genres', 'original_music', 'ministry_affiliation'] },
    { title: 'Find your music', subtitle: 'Link your official profiles.', keys: ['youtube_url', 'instagram_url', 'tiktok_url', 'spotify_url', 'other_music_urls'] },
    { title: 'Bookings', subtitle: 'Who handles invitations and bookings.', keys: ['booking_name', 'booking_phone', 'booking_whatsapp', 'booking_email'] },
  ],
  creator: [
    { title: 'Your channel', subtitle: 'What you create and why.', keys: ['creator_name', 'categories', 'topics', 'content_ownership'] },
    { title: 'Your links', subtitle: 'Official pages where your content lives.', keys: ['social_links'] },
    { title: 'Contact', subtitle: 'Who we should reach out to.', keys: ['full_name', 'email', 'phone', 'whatsapp'] },
  ],
};

const SUGGESTIONS: Record<string, string[]> = {
  artiste_type: ['Worship leader', 'Singer', 'Rapper', 'Choir', 'Band', 'Instrumentalist'],
  genres: ['Worship', 'Gospel hip-hop', 'Contemporary Gospel', 'Afro-gospel', 'Hymns', 'Choir'],
  categories: ['Bible teaching', 'Testimony', 'Youth ministry', 'Podcast', 'Devotional'],
  topics: ['Prayer', 'Marriage', 'Discipleship', 'Worship', 'Apologetics', 'Family'],
};

const PLACEHOLDERS: Record<string, string> = {
  ministry_name: 'Grace Community Church',
  description: 'A Christ-centered church focused on worship, discipleship and community outreach.',
  senior_pastor: 'Pastor John Mukasa',
  phone: '+256 700 000 000',
  whatsapp: '+256 700 000 000',
  booking_phone: '+256 700 000 000',
  booking_whatsapp: '+256 700 000 000',
  email: 'info@example.org',
  booking_email: 'bookings@example.com',
  youtube_url: 'https://youtube.com/@yourchannel',
  instagram_url: 'https://instagram.com/yourname',
  tiktok_url: 'https://tiktok.com/@yourname',
  spotify_url: 'https://open.spotify.com/artist/…',
};

const EMPTY_LOCATION: LocationDraft = { name: '', address: '', map_url: '' };

const initialDraft = (field: OnboardingField): Draft => {
  if (field.type === 'locations') return [{ ...EMPTY_LOCATION }];
  if (field.type === 'list' || field.type === 'urls') return [];
  return '';
};

const isEmpty = (field: OnboardingField, draft: Draft | undefined) => {
  if (field.type === 'locations') {
    return !(draft as LocationDraft[] | undefined)?.some(row => row.name.trim() || row.address.trim() || row.map_url.trim());
  }
  if (Array.isArray(draft)) return draft.length === 0;
  return !String(draft ?? '').trim();
};

const toAnswers = (fields: OnboardingField[], drafts: Record<string, Draft>): OnboardingAnswers => {
  const answers: OnboardingAnswers = {};
  fields.forEach(field => {
    const draft = drafts[field.key];
    if (isEmpty(field, draft)) return;
    if (field.type === 'locations') {
      answers[field.key] = (draft as LocationDraft[]).filter(row => row.name || row.address || row.map_url);
    } else if (Array.isArray(draft)) {
      answers[field.key] = draft;
    } else {
      answers[field.key] = String(draft).trim();
    }
  });
  return answers;
};

const controlClass = (invalid: boolean) =>
  `w-full rounded-xl border bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none transition focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500 ${
    invalid ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
  }`;

interface ChipInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  suggestions?: string[];
  commitOnComma: boolean;
  invalid: boolean;
  id: string;
}

function ChipInput({ values, onChange, placeholder, suggestions = [], commitOnComma, invalid, id }: ChipInputProps) {
  const [text, setText] = useState('');

  const add = (raw: string) => {
    const value = raw.trim();
    if (value && !values.some(existing => existing.toLowerCase() === value.toLowerCase())) onChange([...values, value]);
    setText('');
  };

  const available = suggestions.filter(item => !values.some(existing => existing.toLowerCase() === item.toLowerCase()));

  return (
    <div className="space-y-2">
      <div className={`flex flex-wrap items-center gap-2 rounded-xl border bg-white dark:bg-zinc-950 px-3 py-2 focus-within:ring-2 focus-within:ring-amber-500/60 focus-within:border-amber-500 ${invalid ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'}`}>
        {values.map(value => (
          <span key={value} className="inline-flex max-w-full items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span className="truncate">{value}</span>
            <button type="button" aria-label={`Remove ${value}`} onClick={() => onChange(values.filter(item => item !== value))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          placeholder={values.length ? 'Add another…' : placeholder}
          className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
          onChange={event => {
            const next = event.target.value;
            if (commitOnComma && next.includes(',')) {
              next.split(',').forEach(part => add(part));
            } else {
              setText(next);
            }
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add(text);
            } else if (event.key === 'Backspace' && !text && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={() => add(text)}
        />
      </div>
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {available.map(item => (
            <button key={item} type="button" onClick={() => add(item)}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-300 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 transition hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-300">
              <Plus className="h-3 w-3" />{item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OnboardingFlow({ initialTrack, onSkip, onComplete }: OnboardingFlowProps) {
  const [questions, setQuestions] = useState<Record<OnboardingTrack, OnboardingField[]> | null>(null);
  const [track, setTrack] = useState<OnboardingTrack | null>(initialTrack ?? null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const seedDrafts = (data: Record<OnboardingTrack, OnboardingField[]>, next: OnboardingTrack) => {
    const initial: Record<string, Draft> = {};
    data[next].forEach(field => { initial[field.key] = initialDraft(field); });
    setDrafts(initial);
    setErrors({});
    setFormError('');
    setStepIndex(0);
  };

  useEffect(() => {
    let cancelled = false;
    djangoApi.getOnboardingQuestions()
      .then(data => {
        if (cancelled) return;
        setQuestions(data);
        if (initialTrack && data[initialTrack]) seedDrafts(data, initialTrack);
      })
      .catch(error => { if (!cancelled) setFormError(error instanceof Error ? error.message : 'Could not load onboarding.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fields = track && questions ? questions[track] : [];

  const steps = useMemo(() => {
    if (!track) return [];
    const byKey = new Map(fields.map(field => [field.key, field]));
    const used = new Set<string>();
    const result = STEPS[track].map(step => {
      const stepFields = step.keys.map(key => byKey.get(key)).filter((f): f is OnboardingField => Boolean(f));
      stepFields.forEach(f => used.add(f.key));
      return { title: step.title, subtitle: step.subtitle, fields: stepFields };
    }).filter(step => step.fields.length);
    const rest = fields.filter(field => !used.has(field.key));
    if (rest.length) result.push({ title: 'More details', subtitle: 'A few more things we would like to know.', fields: rest });
    return result;
  }, [track, fields]);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const chooseTrack = (next: OnboardingTrack) => {
    if (!questions) return;
    seedDrafts(questions, next);
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

  const missingRequired = (stepFields: OnboardingField[]) => {
    const missing: Record<string, string> = {};
    stepFields.forEach(field => {
      if (field.required && isEmpty(field, drafts[field.key])) missing[field.key] = 'This field is required.';
    });
    return missing;
  };

  const goNext = async () => {
    if (!track || !step) return;
    const missing = missingRequired(step.fields);
    if (Object.keys(missing).length) {
      setErrors(previous => ({ ...previous, ...missing }));
      setFormError('Please fill in the required fields.');
      return;
    }
    setFormError('');
    if (!isLast) {
      setStepIndex(stepIndex + 1);
      return;
    }

    setSaving(true);
    try {
      const result = await djangoApi.submitOnboarding(track, toAnswers(fields, drafts));
      onComplete(result.user, track);
    } catch (error) {
      if (error instanceof OnboardingValidationError) {
        setErrors(error.fieldErrors);
        setFormError(error.message);
        const failing = steps.findIndex(s => s.fields.some(f => error.fieldErrors[f.key]));
        if (failing >= 0) setStepIndex(failing);
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
    const placeholder = PLACEHOLDERS[field.key] || '';

    let control: React.ReactNode;
    if (field.type === 'locations') {
      const rows = (draft as LocationDraft[]) || [];
      control = (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="space-y-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">Location {index + 1}</span>
                {rows.length > 1 && (
                  <button type="button" aria-label="Remove location" className="text-zinc-400 hover:text-red-600"
                    onClick={() => setDraft(field.key, rows.filter((_, i) => i !== index))}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <input className={controlClass(invalid && !row.name)} placeholder="Branch name, e.g. Kira Main Campus" value={row.name}
                onChange={e => updateLocation(field.key, index, { name: e.target.value })} />
              <input className={controlClass(false)} placeholder="Address" value={row.address}
                onChange={e => updateLocation(field.key, index, { address: e.target.value })} />
              <input className={controlClass(false)} placeholder="Google Maps link (https://maps.google.com/…)" inputMode="url" value={row.map_url}
                onChange={e => updateLocation(field.key, index, { map_url: e.target.value })} />
            </div>
          ))}
          <button type="button" className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400"
            onClick={() => setDraft(field.key, [...rows, { ...EMPTY_LOCATION }])}>
            <Plus className="h-4 w-4" /> Add another location
          </button>
        </div>
      );
    } else if (field.type === 'list' || field.type === 'urls') {
      control = (
        <ChipInput id={id} values={(draft as string[]) || []} invalid={invalid}
          onChange={values => setDraft(field.key, values)}
          commitOnComma={field.type === 'list'}
          suggestions={SUGGESTIONS[field.key]}
          placeholder={field.type === 'urls' ? 'Paste a link and press Enter' : 'Type and press Enter'} />
      );
    } else if (field.type === 'single') {
      control = (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={field.label}>
          {field.options.map(option => {
            const selected = draft === option;
            return (
              <button key={option} type="button" role="radio" aria-checked={selected} onClick={() => setDraft(field.key, option)}
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                  selected
                    ? 'border-amber-500 bg-amber-500/15 text-amber-800 dark:text-amber-300'
                    : `${invalid ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'} text-zinc-600 dark:text-zinc-300 hover:border-amber-500/70`
                }`}>
                {option}
              </button>
            );
          })}
        </div>
      );
    } else if (field.type === 'textarea') {
      control = (
        <textarea id={id} rows={4} className={controlClass(invalid)} placeholder={placeholder}
          value={draft as string} onChange={e => setDraft(field.key, e.target.value)} />
      );
    } else {
      const inputType = { email: 'email', url: 'url', phone: 'tel' }[field.type as string] || 'text';
      control = (
        <input id={id} type={inputType} className={controlClass(invalid)} placeholder={placeholder}
          value={draft as string} onChange={e => setDraft(field.key, e.target.value)} />
      );
    }

    return (
      <div key={field.key} className="space-y-1.5">
        <label htmlFor={id} className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          {field.label}{field.required ? <span className="text-red-500"> *</span> : <span className="font-normal text-zinc-400"> (optional)</span>}
        </label>
        {field.hint && <p className="text-xs text-zinc-500">{field.hint}</p>}
        {control}
        {invalid && <p role="alert" className="text-xs font-medium text-red-600">{errors[field.key]}</p>}
      </div>
    );
  };

  return (
    <section aria-label="Gospread onboarding" className="w-full max-w-xl">
      {loading && <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-amber-500" /></div>}
      {!loading && !questions && <p role="alert" className="text-sm text-red-600">{formError || 'Could not load onboarding.'}</p>}

      {questions && !track && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Welcome</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">How will you serve on Gospread?</h1>
          <p className="mt-2 text-sm text-zinc-500">Choose the profile that fits you best. It takes about two minutes.</p>
          <div className="mt-7 grid gap-3">
            {TRACKS.map(({ id, title, blurb, icon: Icon }) => (
              <button key={id} type="button" onClick={() => chooseTrack(id)}
                className="group flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 text-left transition hover:border-amber-500 hover:shadow-lg">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="flex-1">
                  <span className="block text-base font-bold text-zinc-900 dark:text-white">{title}</span>
                  <span className="block text-sm text-zinc-500">{blurb}</span>
                </span>
                <ArrowRight className="h-5 w-5 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-amber-500" />
              </button>
            ))}
          </div>
          <button type="button" onClick={onSkip} className="mt-6 text-sm font-medium text-zinc-500 underline-offset-4 hover:underline">
            Skip for now
          </button>
        </div>
      )}

      {questions && track && step && (
        <div>
          <ol className="flex items-center gap-2" aria-label="Progress">
            {steps.map((s, index) => (
              <li key={s.title} className="flex flex-1 items-center gap-2" aria-current={index === stepIndex ? 'step' : undefined}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  index < stepIndex ? 'bg-amber-500 text-black' : index === stepIndex ? 'border-2 border-amber-500 text-amber-700 dark:text-amber-400' : 'border border-zinc-300 dark:border-zinc-700 text-zinc-400'
                }`}>
                  {index < stepIndex ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                {index < steps.length - 1 && <span className={`h-0.5 flex-1 rounded ${index < stepIndex ? 'bg-amber-500' : 'bg-zinc-200 dark:bg-zinc-800'}`} />}
              </li>
            ))}
          </ol>

          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Step {stepIndex + 1} of {steps.length} · {TRACKS.find(t => t.id === track)?.title}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{step.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">{step.subtitle}</p>

          <form onSubmit={event => { event.preventDefault(); void goNext(); }} className="mt-6 space-y-5" noValidate>
            {step.fields.map(renderField)}
            {formError && <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">{formError}</p>}
            {isLast && (
              <p className="text-xs text-zinc-500">
                Submit only for a profile you own or are authorized to represent. Links should point to official, public pages.
              </p>
            )}
            <div className="flex items-center justify-between pt-2">
              <button type="button"
                onClick={() => { setFormError(''); if (stepIndex === 0) setTrack(initialTrack ? track : null); else setStepIndex(stepIndex - 1); }}
                className={`inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 ${stepIndex === 0 && initialTrack ? 'invisible' : ''}`}>
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex items-center gap-4">
                <button type="button" onClick={onSkip} className="text-sm font-medium text-zinc-500 underline-offset-4 hover:underline">Skip for now</button>
                <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 px-6 py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/20 transition hover:from-amber-300 active:scale-[0.98] disabled:opacity-60">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLast ? 'Finish' : 'Continue'}
                  {!isLast && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

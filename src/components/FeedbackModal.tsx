import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, MessageSquarePlus, X } from 'lucide-react';
import { djangoApi } from '../services/djangoApi';

type FeedbackCategory = 'bug' | 'suggestion' | 'other';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  theme?: 'light' | 'dark';
}

export default function FeedbackModal({ isOpen, onClose, defaultEmail = '', theme = 'dark' }: FeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    if (!isOpen) return;
    setCategory('suggestion');
    setMessage('');
    setContactEmail(defaultEmail);
    setError('');
    setSubmitted(false);
  }, [defaultEmail, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await djangoApi.submitFeedback({
        category,
        message: message.trim(),
        contact_email: contactEmail.trim(),
        page_path: window.location.pathname,
      });
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Feedback could not be sent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const panelClass = isLight
    ? 'border-slate-200 bg-white text-slate-900'
    : 'border-slate-700 bg-[#111113] text-slate-100';
  const fieldClass = isLight
    ? 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-amber-500'
    : 'border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:border-amber-500';

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className={`w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl ${panelClass}`}
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500">
              <MessageSquarePlus className="h-5 w-5" />
            </span>
            <div>
              <h2 id="feedback-title" className="text-base font-bold">Send feedback</h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Help us improve Gospread</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close feedback" className={`rounded-lg p-2 transition ${isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-500" />
            <h3 className="text-lg font-bold">Thank you for sharing</h3>
            <p className={`mt-1 text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Your feedback has been received.</p>
            <button type="button" onClick={onClose} className="mt-6 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <div>
              <label htmlFor="feedback-category" className="mb-1.5 block text-sm font-semibold">What would you like to share?</label>
              <select
                id="feedback-category"
                value={category}
                onChange={event => setCategory(event.target.value as FeedbackCategory)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${fieldClass}`}
              >
                <option value="suggestion">Suggestion</option>
                <option value="bug">Report a problem</option>
                <option value="other">Other feedback</option>
              </select>
            </div>

            <div>
              <label htmlFor="feedback-message" className="mb-1.5 block text-sm font-semibold">Your feedback</label>
              <textarea
                id="feedback-message"
                value={message}
                onChange={event => setMessage(event.target.value)}
                maxLength={3000}
                rows={5}
                required
                placeholder="Tell us what happened or what could be better..."
                className={`w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none ${fieldClass}`}
              />
              <p className={`mt-1 text-right text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{message.length}/3000</p>
            </div>

            <div>
              <label htmlFor="feedback-email" className="mb-1.5 block text-sm font-semibold">Email for a reply <span className="font-normal text-slate-500">(optional)</span></label>
              <input
                id="feedback-email"
                type="email"
                value={contactEmail}
                onChange={event => setContactEmail(event.target.value)}
                maxLength={254}
                placeholder="you@example.com"
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none ${fieldClass}`}
              />
            </div>

            {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} disabled={isSubmitting} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'}`}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting || !message.trim()} className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquarePlus className="h-4 w-4" />}
                Send feedback
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
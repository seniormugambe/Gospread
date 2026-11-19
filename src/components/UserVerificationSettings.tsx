import { FormEvent, useEffect, useState } from 'react';
import { BadgeCheck, Loader2, MailCheck, Send, ShieldCheck } from 'lucide-react';
import {
  djangoApi,
  OnboardingTrack,
  VerificationApplication,
  VerificationState,
  VerificationStatus,
} from '../services/djangoApi';

const STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: 'Pending review',
  under_review: 'Under review',
  verified: 'Verified',
  action_required: 'Action required',
  rejected: 'Not approved',
  suspended: 'Suspended',
};

const TRACK_LABELS: Record<OnboardingTrack, string> = {
  ministry: 'Ministry',
  artiste: 'Artiste',
  creator: 'Creator',
};

interface UserVerificationSettingsProps {
  email: string;
}

export default function UserVerificationSettings({ email }: UserVerificationSettingsProps) {
  const [state, setState] = useState<VerificationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [officialProfileUrl, setOfficialProfileUrl] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [appealReason, setAppealReason] = useState('');
  const [appealEvidenceUrls, setAppealEvidenceUrls] = useState('');
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  const loadState = async () => {
    const result = await djangoApi.getVerificationState();
    setState(result);
    if (result.application) {
      setOfficialProfileUrl(result.application.official_profile_url || '');
      setEvidenceUrls((result.application.evidence_urls || []).join('\n'));
      setEvidenceNotes(result.application.evidence_notes || '');
      setAppealReason(result.application.appeal_reason || '');
      setAppealEvidenceUrls((result.application.appeal_evidence_urls || []).join('\n'));
    }
  };

  useEffect(() => {
    let active = true;
    if (!djangoApi.getAccessToken()) {
      setError('Sign in to manage email and profile verification.');
      setLoading(false);
      return () => { active = false; };
    }
    djangoApi.getVerificationState().then(result => {
      if (!active) return;
      setState(result);
      if (result.application) {
        setOfficialProfileUrl(result.application.official_profile_url || '');
        setEvidenceUrls((result.application.evidence_urls || []).join('\n'));
        setEvidenceNotes(result.application.evidence_notes || '');
        setAppealReason(result.application.appeal_reason || '');
        setAppealEvidenceUrls((result.application.appeal_evidence_urls || []).join('\n'));
      }
    }).catch(reason => {
      if (active) setError(reason instanceof Error ? reason.message : 'Could not load verification status.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const sendEmailLink = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await djangoApi.requestEmailVerification();
      if (result.email_verified) {
        await loadState();
      }
      setNotice(result.detail);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not send a verification email.');
    } finally {
      setBusy(false);
    }
  };

  const submitApplication = async (event: FormEvent) => {
    event.preventDefault();
    if (!state?.track) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const application: VerificationApplication = await djangoApi.submitVerificationApplication({
        track: state.track,
        official_profile_url: officialProfileUrl.trim(),
        evidence_urls: evidenceUrls.split(/\r?\n/).map(url => url.trim()).filter(Boolean),
        evidence_notes: evidenceNotes.trim(),
        authorization_confirmed: authorizationConfirmed,
        privacy_notice_acknowledged: privacyAcknowledged,
      });
      setState({ ...state, application });
      setNotice('Your verification application has been submitted.');
      setAuthorizationConfirmed(false);
      setPrivacyAcknowledged(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not submit your application.');
    } finally {
      setBusy(false);
    }
  };

  const submitAppeal = async (event: FormEvent) => {
    event.preventDefault();
    if (!state?.application || state.application.status !== 'rejected') return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const application = await djangoApi.submitVerificationAppeal({
        reason: appealReason.trim(),
        evidence_urls: appealEvidenceUrls.split(/\r?\n/).map(url => url.trim()).filter(Boolean),
      });
      setState({ ...state, application });
      setNotice('Your appeal has been submitted for review.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not submit your appeal.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div role="status" className="flex items-center gap-2 p-4 text-sm text-slate-300"><Loader2 className="h-4 w-4 animate-spin" /> Loading verification status…</div>;
  }

  const application = state?.application;
  const canEdit = !application || application.status === 'action_required' || application.status === 'rejected';

  return (
    <section className="space-y-4" aria-label="Profile verification">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <MailCheck className="h-4 w-4 text-amber-300" /> Email verification
        </h3>
        <p className="mt-1 text-xs text-slate-400">{email}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${state?.email_verified ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'}`}>
            {state?.email_verified ? 'Email verified' : 'Email not verified'}
          </span>
          {!state?.email_verified && (
            <button type="button" onClick={sendEmailLink} disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 disabled:opacity-60">
              <Send className="h-3.5 w-3.5" /> Send verification link
            </button>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-400">Email confirmation is required to apply. Phone verification is not enabled in this release.</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <ShieldCheck className="h-4 w-4 text-amber-300" /> Profile verification
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Verification reviews whether you control or are authorized to represent this profile. It is not a guarantee or endorsement of every piece of content.
        </p>

        {!state?.track ? (
          <p className="mt-4 rounded-xl bg-slate-950 p-3 text-xs text-slate-300">
            Complete Ministry, Artiste, or Creator onboarding before applying.
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs font-semibold text-slate-300">Account category: {TRACK_LABELS[state.track]}</p>
            <p className="mt-1 text-xs text-slate-400">
              {state.track === 'ministry' && 'Share an official ministry page and evidence that you are authorized to represent the ministry.'}
              {state.track === 'artiste' && 'Share an official artist or music profile that connects you to the artiste identity.'}
              {state.track === 'creator' && 'Share a channel or creator profile you control. A small audience does not affect eligibility.'}
            </p>
          </>
        )}

        {application && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-200">Application status</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${application.status === 'verified' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-200'}`}>
                {STATUS_LABELS[application.status]}
              </span>
              <span className="text-xs text-slate-500">{TRACK_LABELS[application.track]}</span>
            </div>
            {application.decision_reason && (
              <p className="mt-2 text-xs text-slate-300">{application.decision_reason}</p>
            )}
            {application.status_history.length > 0 && (
              <ul className="mt-3 space-y-2 border-t border-slate-800 pt-3">
                {application.status_history.map((item, index) => (
                  <li key={`${item.created_at}-${index}`} className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">{STATUS_LABELS[item.status]}</span>
                    {' · '}{new Date(item.created_at).toLocaleString()}
                    {item.reason && <span className="block mt-0.5">{item.reason}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {application?.status === 'rejected' && state?.email_verified && (
          <form onSubmit={submitAppeal} className="mt-4 space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
            <div>
              <h4 className="text-xs font-bold text-amber-200">Appeal this decision</h4>
              <p className="mt-1 text-xs text-slate-400">
                There is no appeal deadline configured. If your evidence was already purged after five days, include new supporting links.
              </p>
            </div>
            <textarea required maxLength={2000} rows={3} value={appealReason} onChange={event => setAppealReason(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" placeholder="Explain why you believe the decision should be reconsidered." />
            <textarea rows={2} value={appealEvidenceUrls} onChange={event => setAppealEvidenceUrls(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" placeholder="Optional: new supporting links, one per line (up to 5)" />
            <button type="submit" disabled={busy || !appealReason.trim()}
              className="rounded-lg border border-amber-500/40 px-4 py-2 text-xs font-bold text-amber-200 disabled:opacity-50">
              {busy ? 'Submitting…' : 'Submit appeal'}
            </button>
          </form>
        )}

        {canEdit && state?.email_verified && state.track && (
          <form onSubmit={submitApplication} className="mt-4 space-y-3">
            <div>
              <label htmlFor="verification-official-url" className="mb-1 block text-xs font-semibold text-slate-300">Official profile or website</label>
              <input id="verification-official-url" type="url" value={officialProfileUrl} onChange={event => setOfficialProfileUrl(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" placeholder="https://…" />
            </div>
            <div>
              <label htmlFor="verification-evidence-urls" className="mb-1 block text-xs font-semibold text-slate-300">Supporting links (up to 5)</label>
              <textarea id="verification-evidence-urls" rows={3} value={evidenceUrls} onChange={event => setEvidenceUrls(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" placeholder="One https:// link per line" />
            </div>
            <div>
              <label htmlFor="verification-evidence-notes" className="mb-1 block text-xs font-semibold text-slate-300">Additional context</label>
              <textarea id="verification-evidence-notes" rows={3} maxLength={2000} value={evidenceNotes} onChange={event => setEvidenceNotes(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" placeholder="Explain how the evidence connects you to this profile." />
            </div>
            <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
              <input type="checkbox" checked={authorizationConfirmed} onChange={event => setAuthorizationConfirmed(event.target.checked)} className="mt-0.5 accent-amber-500" />
              I control this profile or am authorized to represent it, and I have permission to publish the content I submit.
            </label>
            <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-300">
              <input type="checkbox" checked={privacyAcknowledged} onChange={event => setPrivacyAcknowledged(event.target.checked)} className="mt-0.5 accent-amber-500" />
              I understand authorized Gospread staff review these links and notes, which are subject to five-day retention after a final decision. The deployment must run its daily cleanup command for deletion to occur. I will not submit identity documents here.
            </label>
            <p className="text-xs text-slate-500">Applications are reviewed by Gospread staff. Follower count and popularity are not eligibility criteria.</p>
            <button type="submit" disabled={busy || !authorizationConfirmed || !privacyAcknowledged}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
            <BadgeCheck className="h-4 w-4" /> {busy ? 'Submitting…' : application?.status === 'rejected' ? 'Reapply with updated evidence' : application ? 'Update and resubmit' : 'Submit for review'}
            </button>
          </form>
        )}
      </div>

      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">{notice}</p>}
    </section>
  );
}

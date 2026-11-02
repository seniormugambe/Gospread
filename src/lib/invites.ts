export interface Referrer {
  id: string;
  name?: string;
}

const REFERRER_KEY = 'gospread_referrer';
const SESSION_KEY = 'gospread_user_session';

export const INVITE_CALL_TO_ACTION = 'Join me on Gospread, free for worship, sermons and fellowship.';

/** The signed-in user, read from the persisted session so any share button can attribute its link. */
export function getCurrentReferrer(): Referrer | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as { isLoggedIn?: boolean; username?: string; id?: string | number; fullName?: string };
    if (!session.isLoggedIn) return null;
    const id = String(session.username || session.id || '').trim();
    if (!id) return null;
    return { id, name: session.fullName?.trim() || undefined };
  } catch {
    return null;
  }
}

/** Absolute URL for an app path, tagged with the current user as referrer when signed in. */
export function buildShareUrl(path: string, referrer: Referrer | null = getCurrentReferrer()): string {
  const url = new URL(path, window.location.origin);
  if (referrer?.id) {
    url.searchParams.set('ref', referrer.id);
    if (referrer.name) url.searchParams.set('rn', referrer.name);
  }
  return url.toString();
}

export function getSavedReferrer(): Referrer | null {
  try {
    const saved = localStorage.getItem(REFERRER_KEY);
    return saved ? (JSON.parse(saved) as Referrer) : null;
  } catch {
    return null;
  }
}

/** Reads ?ref/?rn from the opened link, remembers it for signup, and cleans the address bar. */
export function captureReferrerFromLocation(): Referrer | null {
  const url = new URL(window.location.href);
  const id = url.searchParams.get('ref')?.trim();
  if (!id) return getSavedReferrer();

  const referrer: Referrer = { id, name: url.searchParams.get('rn')?.trim() || undefined };
  url.searchParams.delete('ref');
  url.searchParams.delete('rn');
  window.history.replaceState({}, '', url);

  if (getCurrentReferrer()?.id === id) return null;
  try {
    localStorage.setItem(REFERRER_KEY, JSON.stringify(referrer));
  } catch {
    // Attribution is best-effort.
  }
  return referrer;
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export interface SharePayload {
  title: string;
  /** Describes the shared item; the invite call-to-action is appended. */
  text: string;
  /** App path such as /videos/abc, made absolute and referral-tagged here. */
  path: string;
}

export async function shareWithInvite({ title, text, path }: SharePayload): Promise<ShareResult> {
  const url = buildShareUrl(path);
  const message = `${text}\n${INVITE_CALL_TO_ACTION}`;
  const data = { title, text: message, url };
  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
      await navigator.share(data);
      return 'shared';
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
  }
  try {
    await navigator.clipboard.writeText(`${message}\n${url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}

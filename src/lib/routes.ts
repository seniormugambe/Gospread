export type AppRoute =
  | { kind: 'home' }
  | { kind: 'video'; id: string }
  | { kind: 'profile'; name: string }
  | { kind: 'communityPost'; id: string }
  | { kind: 'ministry'; id: string };

const decodeSegment = (segment: string) => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

export const parseAppRoute = (pathname: string): AppRoute => {
  const segments = pathname.split('/').filter(Boolean).map(decodeSegment);
  if (segments[0] === 'videos' && segments[1]) return { kind: 'video', id: segments[1] };
  if (segments[0] === 'profiles' && segments[1]) return { kind: 'profile', name: segments[1] };
  if (segments[0] === 'community' && segments[1] === 'posts' && segments[2]) {
    return { kind: 'communityPost', id: segments[2] };
  }
  if (segments[0] === 'ministries' && segments[1]) return { kind: 'ministry', id: segments[1] };
  return { kind: 'home' };
};

export const videoPath = (id: string) => `/videos/${encodeURIComponent(id)}`;
export const profilePath = (name: string) => `/profiles/${encodeURIComponent(name)}`;
export const communityPostPath = (id: string) => `/community/posts/${encodeURIComponent(id)}`;
export const ministryPath = (id: string) => `/ministries/${encodeURIComponent(id)}`;

const upsertMeta = (selector: string, attribute: 'name' | 'property', value: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.content = content;
};

export const updatePageMetadata = ({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}) => {
  const url = `${window.location.origin}${path}`;
  document.title = title;
  upsertMeta('meta[name="description"]', 'name', 'description', description);
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
  upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  if (image) {
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', image);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);
  }
};

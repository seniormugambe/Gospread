// Production-ready Django REST Framework / Django Ninja API Client Service
// Connected directly to Django 5.x / DRF endpoints with JWT Authentication (SimpleJWT)
import { CHURCH_LOCATIONS } from '../data/gospelData';

export interface ChurchCampusLocation {
  id?: string;
  campusName: string;
  address: string;
  cityState: string;
  country?: string;
  googleMapsUrl?: string;
  serviceTimes: string;
  pastorOrLeader?: string;
  phone?: string;
  email?: string;
  isMainCampus?: boolean;
}

export interface ChurchLocation {
  id: string;
  name: string;
  slug?: string;
  address: string;
  cityState: string;
  distance?: string;
  serviceTimes: string;
  leadPastor: string;
  phone: string;
  email?: string;
  website: string;
  googleMapsUrl?: string;
  verified: boolean;
  avatar: string;
  coverImage?: string;
  category: string;
  weeklyScheduleCount: number;
  campuses?: ChurchCampusLocation[];
  affiliatedArtistes?: string[];
  totalMembers?: number;
}

export interface FaithBadgeAward {
  id: string;
  name: string;
  icon: string;
  tier: 'Bronze' | 'Silver' | 'Gold';
  category: string;
  description: string;
  earnedDate: string;
}

export interface UserProfileData {
  id: number | string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  church_name?: string;
  ministry_name?: string;
  creator_type?: 'church' | 'artiste' | 'creator' | 'radio';
  praise_xp?: number;
  streak_days?: number;
  avatar_url?: string;
  role?: 'believer' | 'creator' | 'pastor' | 'artiste';
  badges?: FaithBadgeAward[];
}

export interface VideoStream {
  id: string;
  title: string;
  speakerOrArtist: string;
  churchOrMinistry: string;
  channelAvatar: string;
  subscribersCount: string;
  likesCount: string;
  category: 'Live Worship' | 'Sermon' | 'Choir Special' | 'Bible Study' | 'Gospel Music';
  isLive: boolean;
  viewersCount?: number;
  viewsText?: string;
  duration?: string;
  thumbnail: string;
  description: string;
  bibleVerse?: string;
  date: string;
  videoUrl?: string;
  streamUrl?: string;
}

export interface AudioChapter {
  time: string;
  seconds: number;
  title: string;
  scriptureRef?: string;
}

export interface AudioTrack {
  id: string;
  title: string;
  artistOrPreacher: string;
  albumOrSeries: string;
  channelAvatar: string;
  category: 'Praise & Worship' | 'Audio Sermon' | '24/7 Gospel Radio' | 'Podcast' | 'Devotional';
  coverUrl: string;
  duration: string;
  isLiveRadio?: boolean;
  listenersCount?: number;
  lyricsOrNotes?: string;
  publishedDate?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  chapters?: AudioChapter[];
  sermonOutline?: string[];
  scriptureVerses?: { reference: string; text: string }[];
  tags?: string[];
  downloadsCount?: string;
  rating?: number;
  audioUrl?: string;
}

// Base API URL configuration from environment or direct default
export const DJANGO_API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'https://gospread-api.onrender.com/api/v1';

// Token Storage Keys
const JWT_ACCESS_KEY = 'gospread_django_jwt_access';
const JWT_REFRESH_KEY = 'gospread_django_jwt_refresh';
const CSRF_TOKEN_KEY = 'gospread_django_csrftoken';

export interface DjangoApiError {
  detail?: string;
  non_field_errors?: string[];
  [field: string]: any;
}

export interface DjangoAuthResponse {
  access: string;
  refresh: string;
  user: UserProfileData;
}

export interface CommunityCommentApi {
  id: number;
  author_name: string;
  author_handle: string;
  author_avatar: string;
  author_role: string;
  content: string;
  created_at: string;
  amens_count: number;
  has_amened: boolean;
}

export interface CommunityPostApi {
  id: number;
  author_name: string;
  author_handle: string;
  author_avatar: string;
  author_role: string;
  author_church: string;
  category: 'testimony' | 'prayer' | 'reflection' | 'discussion';
  title: string;
  content: string;
  scripture_reference: string;
  scripture_text: string;
  image_url: string;
  audio_url: string;
  audio_snippet_title: string;
  audio_snippet_duration: string;
  created_at: string;
  amens_count: number;
  prayers_count: number;
  glory_count: number;
  shares_count: number;
  comments: CommunityCommentApi[];
  is_anonymous: boolean;
  has_amened: boolean;
  has_prayed: boolean;
  has_glory: boolean;
  has_bookmarked: boolean;
  tags: string[];
}

export interface ScriptureApi {
  id: number;
  reference: string;
  text: string;
  translation: string;
}

export interface PrayerRequestApi {
  id: number;
  author_name: string;
  church?: number;
  body: string;
  tag?: string;
  is_anonymous: boolean;
  is_public: boolean;
  prayed_count: number;
  comment_count: number;
  comments: Array<{
    id: number;
    author_name: string;
    body: string;
    created_at: string;
  }>;
  has_prayed: boolean;
  created_at: string;
}

export interface AudioSpaceTokenResponse {
  server_url: string;
  participant_token: string;
  room_name: string;
}

class DjangoApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = DJANGO_API_BASE_URL.replace(/\/$/, '');
  }

  public setBaseUrl(newUrl: string): void {
    this.baseUrl = newUrl.replace(/\/$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public async createAudioSpaceToken(roomName: string, canPublish = false): Promise<AudioSpaceTokenResponse> {
    return this.request<AudioSpaceTokenResponse>('/audio-spaces/token/', {
      method: 'POST',
      body: JSON.stringify({ room_name: roomName, can_publish: canPublish }),
    });
  }

  // Auth Token Management
  public getAccessToken(): string | null {
    return localStorage.getItem(JWT_ACCESS_KEY);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(JWT_REFRESH_KEY);
  }

  public setTokens(access: string, refresh?: string): void {
    localStorage.setItem(JWT_ACCESS_KEY, access);
    if (refresh) {
      localStorage.setItem(JWT_REFRESH_KEY, refresh);
    }
  }

  public clearTokens(): void {
    localStorage.removeItem(JWT_ACCESS_KEY);
    localStorage.removeItem(JWT_REFRESH_KEY);
    localStorage.removeItem(CSRF_TOKEN_KEY);
  }

  public getCsrfToken(): string | null {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    if (match) return match[1];
    return localStorage.getItem(CSRF_TOKEN_KEY);
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refresh = this.getRefreshToken();
    if (!refresh) return null;

    const response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) {
      this.clearTokens();
      return null;
    }

    const data = await response.json() as { access?: string; refresh?: string };
    if (!data.access) {
      this.clearTokens();
      return null;
    }
    this.setTokens(data.access, data.refresh || refresh);
    return data.access;
  }

  // Core HTTP Fetcher connecting directly to DRF backend endpoints
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const token = this.getAccessToken();
    const csrfToken = this.getCsrfToken();

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(options.method?.toUpperCase() || 'GET')) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      const method = options.method?.toUpperCase() || 'GET';
      const canRefresh = Boolean(token && this.getRefreshToken())
        && !cleanEndpoint.startsWith('/auth/token/refresh/')
        && !cleanEndpoint.startsWith('/auth/logout/');
      if (response.status === 401 && canRefresh) {
        const refreshedToken = await this.refreshAccessToken();
        if (refreshedToken) {
          response = await fetch(url, {
            ...options,
            headers: { ...headers, Authorization: `Bearer ${refreshedToken}` },
            signal: controller.signal,
          });
        }
      }

      // A stale JWT must not block public read endpoints. Retry once without
      // credentials; protected endpoints will still return their 401.
      if (response.status === 401 && ['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        this.clearTokens();
        const anonymousHeaders = { ...headers };
        delete anonymousHeaders.Authorization;
        response = await fetch(url, {
          ...options,
          headers: anonymousHeaders,
          signal: controller.signal,
        });
      }

      clearTimeout(timeoutId);

      if (response.status === 204) {
        return null as unknown as T;
      }

      if (!response.ok) {
        const errorData: DjangoApiError = await response.json().catch(() => ({ detail: response.statusText }));
        const errorMessage = errorData.detail || errorData.non_field_errors?.[0] || Object.values(errorData)[0] || `Django API Error: ${response.status}`;
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      }

      return await response.json();
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  // Health Check Endpoint
  public async checkDjangoHealth(overrideUrl?: string): Promise<{
    connected: boolean;
    baseUrl: string;
    latencyMs: number;
    message: string;
    version?: string;
  }> {
    const targetUrl = overrideUrl ? overrideUrl.replace(/\/$/, '') : this.baseUrl;
    const startTime = performance.now();
    try {
      // Try root router first (returns registered endpoints in DRF), then /health/
      let res = await fetch(`${targetUrl}/`, { method: 'GET', headers: { Accept: 'application/json' } }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${targetUrl}/health/`, { method: 'GET', headers: { Accept: 'application/json' } }).catch(() => null);
      }

      const latencyMs = Math.round(performance.now() - startTime);
      if (res && (res.ok || res.status === 200)) {
        const data = await res.json().catch(() => ({ status: 'ok' }));
        return {
          connected: true,
          baseUrl: targetUrl,
          latencyMs,
          message: 'Connected to Django Backend API successfully (DRF Router Active)',
          version: data.version || 'Django 5.x / DRF 3.15 (Render)'
        };
      }
      return {
        connected: false,
        baseUrl: targetUrl,
        latencyMs,
        message: res ? `Django server responded with status HTTP ${res.status}` : 'No response received'
      };
    } catch (e: any) {
      return {
        connected: false,
        baseUrl: targetUrl,
        latencyMs: 0,
        message: `Unable to reach Django backend at ${targetUrl} (${e.message}).`
      };
    }
  }

  // === 1. AUTHENTICATION & USER PROFILE ===
  public async login(credentials: { username?: string; email?: string; password?: string }): Promise<DjangoAuthResponse> {
    const payload = {
      email: (credentials.email || credentials.username || '').trim().toLowerCase(),
      password: credentials.password,
    };
    const res = await this.request<DjangoAuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res?.access) {
      this.setTokens(res.access, res.refresh);
    }
    return res;
  }

  public async register(payload: {
    email: string;
    password?: string;
    church_name?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
  }): Promise<DjangoAuthResponse> {
    const res = await this.request<DjangoAuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        name: payload.name || `${payload.first_name || ''} ${payload.last_name || ''}`.trim() || payload.email.split('@')[0],
      })
    });

    if (res?.access) {
      this.setTokens(res.access, res.refresh);
    }
    return res;
  }

  public async getMe(): Promise<UserProfileData> {
    return await this.request<UserProfileData>('/auth/me/');
  }

  public async createSermon(payload: {
    title: string;
    speaker: string;
    description?: string;
    category?: string;
    kind?: 'video' | 'audio' | 'article';
    is_published?: boolean;
    media_file: File;
    thumbnail_url?: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('speaker', payload.speaker);
    formData.append('description', payload.description || '');
    formData.append('category', payload.category || 'Sermon');
    formData.append('kind', payload.kind || 'video');
    formData.append('is_published', String(payload.is_published ?? true));
    formData.append('media_file', payload.media_file);
    if (payload.thumbnail_url && !payload.thumbnail_url.startsWith('data:')) {
      formData.append('thumbnail_url', payload.thumbnail_url);
    }
    return await this.request('/sermons/', { method: 'POST', body: formData });
  }

  public async logout(): Promise<void> {
    const refresh = this.getRefreshToken();
    if (refresh) {
      try {
        await this.request('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh })
        });
      } catch (e) {
        console.warn('[Django API] Logout notification error:', e);
      }
    }
    this.clearTokens();
    try {
      localStorage.removeItem('gospread_user_session');
    } catch (e) {
      console.error(e);
    }
  }

  // === 2. DAILY GRACE STREAK & PRAISE XP CHECKIN ===
  public async checkInDailyStreak(): Promise<{
    success: boolean;
    streak_days: number;
    praise_xp_earned: number;
    total_praise_xp: number;
    already_checked_in: boolean;
    message: string;
  }> {
    return await this.request<any>('/auth/streak/checkin/', {
      method: 'POST'
    });
  }

  // === 3. VIDEO STREAMS & SERMONS ===
  public async getVideos(category?: string, isLive?: boolean, search?: string): Promise<VideoStream[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search?.trim()) params.append('search', search.trim());

    const streamsPromise = this.request<any[] | { results: any[] }>(`/streams/${params.toString() ? `?${params.toString()}` : ''}`).catch(() => []);
    const sermonsPromise = this.request<any[] | { results: any[] }>(`/sermons/${params.toString() ? `?${params.toString()}` : ''}`).catch(() => []);

    const [streamsRes, sermonsRes] = await Promise.all([streamsPromise, sermonsPromise]);

    const streamsData = Array.isArray(streamsRes) ? streamsRes : (streamsRes?.results || []);
    const sermonsData = Array.isArray(sermonsRes) ? sermonsRes : (sermonsRes?.results || []);

    const videoList: VideoStream[] = [];

    // Map live streams
    for (const s of streamsData) {
      videoList.push({
        id: String(s.id),
        title: s.title,
        speakerOrArtist: s.church_name || 'Ministry Leader',
        churchOrMinistry: s.church_name || 'Gospread Church',
        channelAvatar: s.thumbnail_url || 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=120&q=80',
        subscribersCount: 'Live',
        likesCount: `${s.viewer_count || 0}`,
        category: 'Live Worship',
        isLive: s.status === 'live',
        viewersCount: s.viewer_count || 0,
        viewsText: s.status === 'live' ? `${s.viewer_count || 1} watching now` : 'Recorded Broadcast',
        thumbnail: s.thumbnail_url || 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
        description: s.description || 'Live congregational worship and preaching.',
        date: s.scheduled_for ? new Date(s.scheduled_for).toLocaleDateString() : 'Today',
        streamUrl: s.playback_url || s.recording_url,
      });
    }

    // Map sermons
    for (const s of sermonsData) {
      videoList.push({
        id: String(s.id),
        title: s.title,
        speakerOrArtist: s.speaker || s.church_name || 'Pastor',
        churchOrMinistry: s.church_name || 'Grace Ministry',
        channelAvatar: s.thumbnail_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        subscribersCount: 'Verified',
        likesCount: `${s.view_count || 0}`,
        category: s.category || 'Sermon',
        isLive: false,
        viewersCount: s.view_count || 0,
        viewsText: `${s.view_count || 0} views`,
        duration: s.duration_seconds ? `${Math.floor(s.duration_seconds / 60)}:${String(s.duration_seconds % 60).padStart(2, '0')}` : '45:00',
        thumbnail: s.thumbnail_url || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80',
        description: s.description || '',
        date: s.published_at ? new Date(s.published_at).toLocaleDateString() : 'Recent',
        videoUrl: s.media_url,
      });
    }

    let finalVideos = videoList;

    if (category && category.toLowerCase() !== 'all') {
      const cat = category.toLowerCase();
      if (cat === 'live') {
        finalVideos = finalVideos.filter(v => v.isLive);
      } else if (cat === 'sermons' || cat === 'sermon') {
        finalVideos = finalVideos.filter(v => v.category.toLowerCase().includes('sermon'));
      } else if (cat === 'worship') {
        finalVideos = finalVideos.filter(v => 
          v.category.toLowerCase().includes('worship') || 
          v.category.toLowerCase().includes('choir') || 
          v.category.toLowerCase().includes('music')
        );
      } else {
        finalVideos = finalVideos.filter(v => v.category.toLowerCase().includes(cat));
      }
    }

    if (isLive !== undefined) {
      finalVideos = finalVideos.filter(v => v.isLive === isLive);
    }

    if (search?.trim()) {
      const q = search.toLowerCase().trim();
      finalVideos = finalVideos.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.speakerOrArtist.toLowerCase().includes(q) || 
        v.churchOrMinistry.toLowerCase().includes(q)
      );
    }

    return finalVideos;
  }

  public async getLiveStreams(category?: string): Promise<VideoStream[]> {
    return this.getVideos(category, true);
  }

  public async getShorts(): Promise<VideoStream[]> {
    try {
      const res = await this.request<any[] | { results: any[] }>('/shorts/').catch(() => []);
      const items = Array.isArray(res) ? res : (res?.results || []);
      if (items.length > 0) {
        return items.map((short: any) => ({
          id: String(short.id),
          title: short.title,
          speakerOrArtist: short.speaker || short.church_name || 'Ministry Leader',
          churchOrMinistry: short.church_name || 'Gospread Ministry',
          channelAvatar: short.thumbnail_url || 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
          subscribersCount: 'Verified',
          likesCount: String(short.like_count || '15K'),
          category: 'Sermon',
          isLive: false,
          viewersCount: short.view_count || 1200,
          viewsText: `${short.view_count || 0} views`,
          duration: short.duration_seconds ? `${Math.floor(short.duration_seconds / 60)}:${String(short.duration_seconds % 60).padStart(2, '0')}` : '0:45',
          thumbnail: short.thumbnail_url || 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80',
          description: short.caption || '',
          date: short.created_at ? new Date(short.created_at).toLocaleDateString() : 'Today',
          videoUrl: short.video_url,
        }));
      }
    } catch {
      return [];
    }

    return [];
  }

  // === 4. AUDIO & PODCASTS ===
  public async getAudioTracks(category?: string): Promise<AudioTrack[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);

    const endpoint = `/worship-songs/${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await this.request<any[] | { results: any[] }>(endpoint).catch(() => []);
    const items = Array.isArray(res) ? res : (res?.results || []);

    if (items.length > 0) {
      return items.map((song: any) => ({
        id: String(song.id),
        title: song.title,
        artistOrPreacher: song.author || song.church_name || 'Worship Leader',
        albumOrSeries: song.church_name || 'Worship Collection',
        channelAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80',
        category: 'Praise & Worship',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
        duration: '4:30',
        lyricsOrNotes: song.slides?.map((s: any) => s.text).join('\n\n') || '',
        publishedDate: song.created_at ? new Date(song.created_at).toLocaleDateString() : 'Recent',
      }));
    }

    return [];
  }

  // === 5. CHURCH DIRECTORY & REGISTRATION ===
  public async getChurchLocations(query?: string): Promise<ChurchLocation[]> {
    const params = new URLSearchParams();
    if (query) params.append('search', query);

    const endpoint = `/churches/${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await this.request<any[] | { results: any[] }>(endpoint).catch(() => []);
    const list = Array.isArray(res) ? res : (res?.results || []);

    if (list.length > 0) {
      return list.map((c: any) => ({
        id: String(c.id),
        name: c.name,
        slug: c.slug,
        address: c.location || 'Sanctuary Campus',
        cityState: c.location || 'Global Fellowship',
        distance: 'Available Online',
        serviceTimes: c.schedule?.[0]?.starts_at ? new Date(c.schedule[0].starts_at).toLocaleString() : 'Sundays 9:00 AM & 11:30 AM',
        leadPastor: c.head_pastor?.name || c.owner_name || 'Pastor',
        phone: c.phone || '',
        email: c.email || '',
        website: c.website || '',
        googleMapsUrl: c.location ? `https://maps.google.com/?q=${encodeURIComponent(c.location)}` : undefined,
        verified: c.is_featured || true,
        avatar: c.logo_url || 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=120&q=80',
        coverImage: c.cover_image_url || 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
        category: c.denomination || c.ministry_focus || 'Sanctuary Worship Center',
        weeklyScheduleCount: c.schedule?.length || 2,
      }));
    }

    const allChurchLocations: ChurchLocation[] = [];
    for (const [name, locs] of Object.entries(CHURCH_LOCATIONS)) {
      for (const loc of locs) {
        allChurchLocations.push({
          id: loc.id,
          name: `${name} — ${loc.campusName}`,
          slug: loc.id,
          address: loc.address,
          cityState: `${loc.city}, ${loc.stateOrRegion}`,
          distance: loc.isMainCampus ? 'Main Sanctuary' : 'Campus Branch',
          serviceTimes: loc.serviceTimes.join(' | '),
          leadPastor: loc.leadPastor,
          phone: loc.phone,
          email: loc.email,
          website: 'https://gracecitycathedral.org',
          googleMapsUrl: loc.googleMapsUrl,
          verified: true,
          avatar: loc.pastorAvatar || 'https://images.unsplash.com/photo-1548625361-188f58b6fa24?auto=format&fit=crop&w=300&q=80',
          coverImage: loc.image,
          category: 'Cathedral Sanctuary',
          weeklyScheduleCount: loc.serviceTimes.length,
        });
      }
    }

    if (query?.trim()) {
      const q = query.toLowerCase().trim();
      return allChurchLocations.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.cityState.toLowerCase().includes(q) || 
        c.leadPastor.toLowerCase().includes(q)
      );
    }

    return allChurchLocations;
  }

  public async registerMinistry(ministryData: {
    name: string;
    description?: string;
    location?: string;
    denomination?: string;
    ministry_focus?: string;
    phone?: string;
    email?: string;
    website?: string;
  }): Promise<{ id: number; name: string; slug: string }> {
    return await this.request<any>('/churches/', {
      method: 'POST',
      body: JSON.stringify(ministryData)
    });
  }

  // === 6. SUBMIT DONATION / TITHE VIA DJANGO PAYMENT GATEWAY ===
  public async submitDonation(donation: {
    amount: number;
    currency?: string;
    ministryName?: string;
    churchId?: number;
    fundType?: string;
    fundId?: number;
    isRecurring?: boolean;
    paymentMethod?: string;
    donorName?: string;
    donorEmail?: string;
    prayerNote?: string;
  }): Promise<{ success: boolean; transactionId: string; receiptUrl: string; message: string }> {
    const res = await this.request<any>('/donations/checkout/', {
      method: 'POST',
      body: JSON.stringify({
        amount: donation.amount,
        currency: donation.currency || 'UGX',
        church: donation.churchId,
        fund: donation.fundId,
        fund_name: donation.fundType || 'General Kingdom Fund',
        donor_name: donation.donorName || 'Anonymous Giver',
        donor_email: donation.donorEmail || '',
        frequency: donation.isRecurring ? 'monthly' : 'one_time',
        provider: donation.paymentMethod === 'mtn_momo' ? 'mtn_momo' : donation.paymentMethod === 'airtel_money' ? 'airtel_money' : 'card',
        return_url: window.location.href,
      })
    });

    const gatewayReference = res?.gateway_reference || `REF-${Date.now()}`;
    return {
      success: true,
      transactionId: gatewayReference,
      receiptUrl: res?.checkout_url || '',
      message: 'Donation registered successfully in Django backend.'
    };
  }

  // === 7. PRAYER REQUESTS & ALTAR INTERCESSION ===
  public async getPrayerRequests(search?: string): Promise<PrayerRequestApi[]> {
    const params = new URLSearchParams();
    if (search?.trim()) params.append('search', search.trim());
    const endpoint = `/prayers/${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await this.request<PrayerRequestApi[] | { results: PrayerRequestApi[] }>(endpoint).catch(() => []);
    return Array.isArray(res) ? res : (res?.results || []);
  }

  public async submitPrayerRequest(prayerData: {
    body: string;
    tag?: string;
    is_anonymous?: boolean;
  }): Promise<PrayerRequestApi> {
    return await this.request<PrayerRequestApi>('/prayers/', {
      method: 'POST',
      body: JSON.stringify(prayerData)
    });
  }

  public async togglePrayer(prayerId: number | string): Promise<{ prayed: boolean; prayed_count: number }> {
    return await this.request<{ prayed: boolean; prayed_count: number }>(`/prayers/${prayerId}/pray/`, {
      method: 'POST'
    });
  }

  public async addPrayerComment(prayerId: number | string, body: string): Promise<any> {
    return await this.request(`/prayers/${prayerId}/comment/`, {
      method: 'POST',
      body: JSON.stringify({ body })
    });
  }

  // === 8. FELLOWSHIP & VOICES COMMUNITY ===
  public async getCommunityPosts(category?: string, search?: string): Promise<CommunityPostApi[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (search?.trim()) params.append('search', search.trim());
    const endpoint = `/community/posts/${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await this.request<CommunityPostApi[] | { results: CommunityPostApi[] }>(endpoint).catch(() => []);
    return Array.isArray(res) ? res : (res?.results || []);
  }

  public async createCommunityPost(payload: {
    category: CommunityPostApi['category'];
    title?: string;
    content: string;
    scripture_reference?: string;
    scripture_text?: string;
    image_url?: string;
    audio_url?: string;
    audio_snippet_title?: string;
    audio_snippet_duration?: string;
    tags?: string[];
    is_anonymous?: boolean;
  }): Promise<CommunityPostApi> {
    return await this.request<CommunityPostApi>('/community/posts/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async toggleCommunityPost(postId: string | number, action: 'amen' | 'pray' | 'glory' | 'bookmark'): Promise<any> {
    return await this.request(`/community/posts/${postId}/${action}/`, { method: 'POST' });
  }

  public async addCommunityComment(postId: string | number, content: string): Promise<CommunityCommentApi> {
    return await this.request<CommunityCommentApi>(`/community/posts/${postId}/comment/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // === 9. SCRIPTURES & SAVED SERMONS ===
  public async getRandomScripture(exclude?: string): Promise<ScriptureApi> {
    const params = new URLSearchParams();
    if (exclude) params.append('exclude', exclude);
    const endpoint = `/scriptures/random/${params.toString() ? `?${params.toString()}` : ''}`;
    return await this.request<ScriptureApi>(endpoint);
  }

  public async getSavedSermons(): Promise<any[]> {
    const res = await this.request<any[] | { results: any[] }>('/saved/').catch(() => []);
    return Array.isArray(res) ? res : (res?.results || []);
  }

  public async saveSermon(sermonId: number | string): Promise<{ saved: boolean }> {
    return await this.request<{ saved: boolean }>(`/sermons/${sermonId}/save/`, {
      method: 'POST'
    });
  }

  public async getWatchProgress(): Promise<any[]> {
    const res = await this.request<any[] | { results: any[] }>('/progress/').catch(() => []);
    return Array.isArray(res) ? res : (res?.results || []);
  }

  public async updateWatchProgress(sermonId: number | string, positionSeconds: number, completed: boolean = false): Promise<any> {
    return await this.request('/progress/', {
      method: 'POST',
      body: JSON.stringify({
        sermon: sermonId,
        position_seconds: positionSeconds,
        completed
      })
    });
  }
}

export const djangoApi = new DjangoApiClient();

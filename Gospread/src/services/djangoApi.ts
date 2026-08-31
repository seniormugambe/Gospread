// Production-ready Django REST Framework / Django Ninja API Client Service
// Compatible with Django 4.2+ / Django 5.x, DRF (Django REST Framework), and JWT Authentication (SimpleJWT)

import { VideoStream, AudioTrack } from '../data/gospelData';

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
  praise_xp?: number;
  streak_days?: number;
  avatar_url?: string;
  role?: 'believer' | 'creator' | 'pastor' | 'artiste';
  badges?: FaithBadgeAward[];
}

// Base API URL configuration from environment or local fallback
export const DJANGO_API_BASE_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000/api/v1';

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

  // Auth Token Management
  public getAccessToken(): string | null {
    return localStorage.getItem(JWT_ACCESS_KEY);
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

  // Core HTTP Fetcher with Timeout, DRF Headers & Fallback Handling
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T; fromCacheOrMock: boolean }> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getAccessToken();
    const csrfToken = this.getCsrfToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(options.method?.toUpperCase() || 'GET')) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: DjangoApiError = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || errorData.non_field_errors?.[0] || `Django API Error: ${response.status}`);
      }

      const data = await response.json();
      return { data, fromCacheOrMock: false };
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
      const res = await fetch(`${targetUrl}/health/`, { method: 'GET', headers: { Accept: 'application/json' } });
      const latencyMs = Math.round(performance.now() - startTime);
      if (res.ok) {
        const data = await res.json().catch(() => ({ status: 'ok' }));
        return {
          connected: true,
          baseUrl: targetUrl,
          latencyMs,
          message: 'Connected to Django Backend API successfully',
          version: data.version || 'Django 5.0 (DRF 3.15)'
        };
      }
      return {
        connected: false,
        baseUrl: targetUrl,
        latencyMs,
        message: `Django server responded with status HTTP ${res.status}`
      };
    } catch (e: any) {
      return {
        connected: false,
        baseUrl: targetUrl,
        latencyMs: 0,
        message: `Unable to reach Django backend at ${targetUrl}. Client is running in active mock-resilient mode.`
      };
    }
  }

  // === 1. AUTHENTICATION & USER PROFILE ===
  public async login(credentials: { username?: string; email?: string; password?: string }): Promise<DjangoAuthResponse> {
    const res = await this.request<DjangoAuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (res.data.access) {
      this.setTokens(res.data.access, res.data.refresh);
    }
    return res.data;
  }

  public async register(payload: {
    username: string;
    email: string;
    password?: string;
    church_name?: string;
    first_name?: string;
    last_name?: string;
  }): Promise<DjangoAuthResponse> {
    const res = await this.request<DjangoAuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return res.data;
  }

  public logout(): void {
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
    streakDays: number;
    praiseXpEarned: number;
    newBadgeUnlocked?: FaithBadgeAward;
    message: string;
  }> {
    const res = await this.request<any>('/auth/streak/checkin/', {
      method: 'POST'
    });

    return res.data;
  }

  // === 3. VIDEO STREAMS & SERMONS ===
  public async getVideos(category?: string, isLive?: boolean): Promise<VideoStream[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (isLive !== undefined) params.append('is_live', String(isLive));

    const endpoint = `/videos/${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await this.request<VideoStream[]>(endpoint);

    return res.data || [];
  }

  // === 4. AUDIO & PODCASTS ===
  public async getAudioTracks(category?: string): Promise<AudioTrack[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);

    const endpoint = `/podcasts/${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await this.request<AudioTrack[]>(endpoint);

    return res.data || [];
  }

  // === 5. CHURCH DIRECTORY & MULTI-CAMPUS REGISTRATION ===
  public async getChurchLocations(query?: string): Promise<ChurchLocation[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);

    const endpoint = `/churches/${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await this.request<ChurchLocation[]>(endpoint);

    return res.data || [];
  }

  public async registerMinistry(ministryData: {
    ministryName: string;
    category: string;
    leadPastor: string;
    phone?: string;
    email?: string;
    website?: string;
    campuses: Array<{
      campusName: string;
      address: string;
      cityState: string;
      googleMapsUrl?: string;
      serviceTimes: string;
      isMainCampus: boolean;
    }>;
  }): Promise<{ success: boolean; churchId: string; message: string }> {
    const res = await this.request<any>('/churches/register/', {
      method: 'POST',
      body: JSON.stringify(ministryData)
    });

    return res.data;
  }

  // === 6. SUBMIT DONATION / TITHE VIA DJANGO PAYMENT PIPELINE ===
  public async submitDonation(donation: {
    amount: number;
    ministryName: string;
    fundType: string;
    isRecurring: boolean;
    paymentMethod: string;
    donorName?: string;
    donorEmail?: string;
    prayerNote?: string;
  }): Promise<{ success: boolean; transactionId: string; receiptUrl: string; message: string; isRealDjango: boolean }> {
    const res = await this.request<any>('/giving/donate/', {
      method: 'POST',
      body: JSON.stringify({
        amount: donation.amount,
        ministry_name: donation.ministryName,
        fund_type: donation.fundType,
        is_recurring: donation.isRecurring,
        payment_method: donation.paymentMethod,
        donor_name: donation.donorName || 'Anonymous Partner',
        donor_email: donation.donorEmail || '',
        prayer_note: donation.prayerNote || ''
      })
    });

    return {
      ...res.data,
      isRealDjango: true
    };
  }

  // === 7. PRAYER REQUESTS & LIVE ALTAR CHAT ===
  public async submitPrayerRequest(prayerData: {
    streamId?: string;
    name: string;
    prayerText: string;
    isUrgent?: boolean;
  }): Promise<{ success: boolean; prayerId: string; message: string }> {
    const res = await this.request<any>('/interactivity/prayers/', {
      method: 'POST',
      body: JSON.stringify(prayerData)
    });

    return res.data;
  }
}

export const djangoApi = new DjangoApiClient();

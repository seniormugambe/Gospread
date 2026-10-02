// Production YouTube Data API v3 Service for Gospread Platform
// Integrates official YouTube Data API endpoints for live gospel streams, sermons, and channels.

import { VideoStream } from '../data/gospelData';
import { decodeHtml } from '../lib/utils';

// Access YouTube API Key from client environment variables or provided default
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY ;
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeSearchItem {
  id: { videoId?: string; channelId?: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
    liveBroadcastContent: 'live' | 'upcoming' | 'none';
  };
}

export interface YouTubeVideoDetails {
  id: string;
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    commentCount?: string;
  };
  liveStreamingDetails?: {
    concurrentViewers?: string;
    actualStartTime?: string;
  };
  contentDetails?: {
    duration?: string;
  };
}

interface YouTubeErrorResponse {
  error?: { message?: string };
}

class YouTubeApiService {
  private apiKey: string;

  constructor() {
    this.apiKey = YOUTUBE_API_KEY;
  }

  public hasApiKey(): boolean {
    return Boolean(this.apiKey && this.apiKey !== 'MY_YOUTUBE_API_KEY' && this.apiKey.trim().length > 0);
  }

  // Helper to parse ISO 8601 duration (e.g. PT45M12S -> 45:12)
  private formatIsoDuration(durationStr?: string): string {
    if (!durationStr) return '00:00';
    const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return durationStr;
    const hours = match[1] ? `${match[1]}:` : '';
    const minutes = match[2] ? match[2].padStart(2, '0') : '00';
    const seconds = match[3] ? match[3].padStart(2, '0') : '00';
    return `${hours}${minutes}:${seconds}`;
  }

  // Format large numbers (e.g. 14200 -> 14.2K)
  private formatCount(numStr?: string | number): string {
    if (!numStr) return '0';
    const num = typeof numStr === 'string' ? parseInt(numStr, 10) : numStr;
    if (isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }

  /**
   * Search Live Gospel Streams or Sermons on YouTube
   */
  public async searchGospelVideos(query: string = 'Gospel Live Worship Sermon', isLiveOnly: boolean = false): Promise<{
    videos: VideoStream[];
    isRealYoutubeData: boolean;
    error?: string;
  }> {
    if (!this.hasApiKey()) {
      return {
        videos: this.getFallbackVideos(query, isLiveOnly),
        isRealYoutubeData: false
      };
    }

    try {
      const params = new URLSearchParams({
        part: 'snippet',
        maxResults: '12',
        q: query,
        type: 'video',
        key: this.apiKey,
        ...(isLiveOnly ? { eventType: 'live' } : {})
      });

      const response = await fetch(`${YOUTUBE_BASE_URL}/search?${params.toString()}`);
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({})) as YouTubeErrorResponse;
        throw new Error(errorJson.error?.message || `YouTube API HTTP ${response.status}`);
      }

      const data = await response.json() as { items?: YouTubeSearchItem[] };
      const items: YouTubeSearchItem[] = data.items || [];

      if (items.length === 0) {
        return {
          videos: this.getFallbackVideos(query, isLiveOnly),
          isRealYoutubeData: false
        };
      }

      // Fetch statistics (view counts, live viewers) for returned video IDs
      const videoIds = items.map(item => item.id.videoId).filter(Boolean).join(',');
      const detailsMap = await this.getVideoStatistics(videoIds);

      const formattedVideos: VideoStream[] = items.map((item, idx) => {
        const videoId = item.id.videoId || `yt-${idx}`;
        const details = detailsMap.get(videoId);
        const snippet = item.snippet;
        const isLive = snippet.liveBroadcastContent === 'live';

        const viewers = details?.liveStreamingDetails?.concurrentViewers
          ? parseInt(details.liveStreamingDetails.concurrentViewers, 10)
          : undefined;

        return {
          id: videoId,
          title: decodeHtml(snippet.title),
          speakerOrArtist: decodeHtml(snippet.channelTitle),
          churchOrMinistry: `${decodeHtml(snippet.channelTitle)} Official`,
          channelAvatar: snippet.thumbnails.default?.url || snippet.thumbnails.medium?.url || '',
          subscribersCount: 'Verified YouTube Channel',
          likesCount: this.formatCount(details?.statistics?.likeCount),
          category: isLive ? 'Live Worship' : 'Sermon',
          isLive,
          viewersCount: isLive ? viewers : undefined,
          viewsText: isLive
            ? viewers === undefined ? 'Live now' : `${this.formatCount(viewers)} watching now`
            : details?.statistics?.viewCount ? `${this.formatCount(details.statistics.viewCount)} views` : 'Views unavailable',
          duration: details?.contentDetails?.duration ? this.formatIsoDuration(details.contentDetails.duration) : undefined,
          thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || '',
          description: decodeHtml(snippet.description) || 'Watch live gospel worship and biblical preaching.',
          date: new Date(snippet.publishedAt).toLocaleDateString(),
          videoUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
        };
      });

      return {
        videos: formattedVideos,
        isRealYoutubeData: true
      };

    } catch (err: any) {
      console.warn('[YouTube API Service] Failed to fetch live data:', err.message);
      return {
        videos: this.getFallbackVideos(query, isLiveOnly),
        isRealYoutubeData: false,
        error: err.message
      };
    }
  }

  /**
   * Fetch extra details (statistics, duration, live viewers) for list of video IDs
   */
  private async getVideoStatistics(videoIds: string): Promise<Map<string, YouTubeVideoDetails>> {
    const map = new Map<string, YouTubeVideoDetails>();
    if (!videoIds || !this.hasApiKey()) return map;

    try {
      const params = new URLSearchParams({
        part: 'statistics,liveStreamingDetails,contentDetails',
        id: videoIds,
        key: this.apiKey
      });

      const response = await fetch(`${YOUTUBE_BASE_URL}/videos?${params.toString()}`);
      if (response.ok) {
        const data = await response.json() as { items?: YouTubeVideoDetails[] };
        (data.items || []).forEach((item) => {
          map.set(item.id, {
            id: item.id,
            statistics: item.statistics,
            liveStreamingDetails: item.liveStreamingDetails,
            contentDetails: item.contentDetails
          });
        });
      }
    } catch (e) {
      // Ignore statistics error gracefully
    }
    return map;
  }

  /**
   * Fallback to curated gospel streams when API key is missing or quota limited
   */
  private getFallbackVideos(query: string, isLiveOnly: boolean): VideoStream[] {
    return [];
  }
}

export const youtubeApi = new YouTubeApiService();

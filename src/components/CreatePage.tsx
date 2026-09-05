import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { 
  Building2, 
  Music2, 
  Mic, 
  Video, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Info,
  Globe,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  UserCheck,
  Radio,
  FileText,
  DollarSign,
  Heart,
  Music,
  Share2,
  Copy,
  Plus,
  Play,
  BarChart3,
  MessageSquare,
  Key,
  ExternalLink,
  Settings,
  Check,
  Landmark,
  CreditCard,
  Wallet,
  Trash2,
  Clock,
  Compass,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Coffee,
  Navigation,
  X,
  Tv,
  Users,
  UploadCloud,
  RadioTower,
  Bell,
  ArrowLeft,
  CalendarDays,
  Send,
  HelpCircle,
  Film,
  Tag,
  BookOpen,
  ListOrdered,
  AlertCircle,
  Loader2,
  Wifi,
  CheckCheck,
  Image as ImageIcon,
  Wand2,
  Globe2,
  Lock,
  Link2,
  ShieldAlert,
  Save,
  FileCheck,
  Baby,
  Layers as LayersIcon,
  Eye,
  EyeOff,
  Cpu,
  MonitorPlay,
  Youtube,
  Sliders,
  TrendingUp,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoStream, ChurchLocation, SocialLink, registerChurchProfile } from '../data/gospelData';
import { UserSession } from './AuthModal';
import LiveControlRoom from './LiveControlRoom';
import LiveRecordingVODModal, { RecordedStreamData } from './LiveRecordingVODModal';
import KingdomStudioSections from './KingdomStudioSections';

export type CreatorCategory = 'Church' | 'Artiste' | 'Creator' | 'Radio';
export type StudioAction = 'choose' | 'upload' | 'live' | 'schedule' | 'live_control_room' | 'dashboard' | 'content' | 'analytics' | 'community' | 'giving' | 'settings';
export type UploadStep = 'select' | 'uploading' | 'processing' | 'details' | 'thumbnail' | 'visibility' | 'publish';
export type UploadMode = 'device' | 'url' | 'youtube';
export type LiveBroadcastType = 'Sunday Service' | 'Bible Study' | 'Prayer' | 'Worship' | 'Conference' | 'Other';

export interface VideoExtractedFrame {
  id: string;
  time: string;
  label: string;
  url: string;
}

export interface AiThumbnailPreset {
  id: string;
  name: string;
  description: string;
  bgImage: string;
  overlayGradient: string;
  accentColor: string;
  badgeBg: string;
}

export const VIDEO_EXTRACTED_FRAMES: VideoExtractedFrame[] = [
  {
    id: 'frame-1',
    time: '00:04:12',
    label: 'Pastor at the Pulpit',
    url: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'frame-2',
    time: '00:15:30',
    label: 'Worship Hands Raised',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'frame-3',
    time: '00:28:45',
    label: 'Open Bible & Altar Light',
    url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'frame-4',
    time: '00:41:10',
    label: 'Congregation in Prayer',
    url: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1200&q=80'
  }
];

export const AI_THUMBNAIL_PRESETS: AiThumbnailPreset[] = [
  {
    id: 'cathedral_gold',
    name: 'Cathedral Gold & Light',
    description: 'Warm sanctuary beams, gold typography, majestic atmosphere',
    bgImage: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'from-amber-950/90 via-black/60 to-black/90',
    accentColor: 'text-amber-300',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  },
  {
    id: 'prophetic_fire',
    name: 'Prophetic Fire & Power',
    description: 'Deep crimson revival glow, bold modern display title',
    bgImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'from-red-950/90 via-black/60 to-black/90',
    accentColor: 'text-red-400',
    badgeBg: 'bg-red-500/20 text-red-300 border-red-500/30'
  },
  {
    id: 'peaceful_sunrise',
    name: 'Peaceful Sunrise & Grace',
    description: 'Early morning mountain dawn, serene covenant aesthetic',
    bgImage: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'from-blue-950/90 via-black/60 to-black/90',
    accentColor: 'text-sky-300',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  {
    id: 'modern_bold',
    name: 'Modern Minimalist Gospel',
    description: 'High-contrast studio dark, bold serif typography card',
    bgImage: 'https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1200&q=80',
    overlayGradient: 'from-slate-950/95 via-slate-900/80 to-black/95',
    accentColor: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
  }
];

export interface CreatePageProps {
  currentUser?: UserSession;
  initialAction?: StudioAction;
  initialUploadSource?: UploadMode;
  onPublishSuccess: (newStream: VideoStream) => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
}

interface PrayerRequest {
  id: string;
  name: string;
  request: string;
  time: string;
  prayedCount: number;
  status: 'Pending' | 'Prayed';
}

// 💳 Payout Account Data Structure
export interface PayoutAccountItem {
  id: string;
  label: string;
  type: 'Direct Bank Wire' | 'Mobile Money (M-Pesa / MTN)' | 'Stripe Connect' | 'PayPal Business' | 'Cash App / Zelle' | 'Crypto Giving (USDC/USDT)';
  currency: 'USD ($)' | 'GBP (£)' | 'EUR (€)' | 'NGN (₦)' | 'KES (KSh)' | 'GHS (GH₵)' | 'ZAR (R)' | 'CAD ($)' | 'AUD ($)';
  accountHolder: string;
  bankOrProvider: string;
  accountNumber: string;
  routingOrSwift: string;
  isPrimary: boolean;
}

// ⛪ Church Campus / Location Structure
export interface ChurchCampusItem {
  id: string;
  campusName: string;
  campusType: 'Main Sanctuary' | 'Branch Campus' | 'Youth Center' | 'International Fellowship' | 'Online Streaming Campus';
  address: string;
  city: string;
  stateOrRegion: string;
  country: string;
  zipCode: string;
  serviceTimes: string;
  leadPastor: string;
  phone: string;
  email: string;
  googleMapsUrl: string;
  isMain: boolean;
}

// 🌐 Predefined Social Media Links Structure
export interface SocialPlatformRow {
  id: string;
  platform: 'tiktok' | 'substack' | 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'medium' | 'revue' | 'youtube' | 'buymeacoffee' | 'spotify' | 'telegram' | 'whatsapp' | 'website' | 'custom';
  name: string;
  prefix: string;
  suffix?: string;
  placeholder: string;
  username: string;
  customPrefix?: string;
  customLabel?: string;
}

const CREATOR_TYPE_CONFIG: Record<CreatorCategory, {
  label: string;
  badge: string;
  icon: any;
  color: string;
  badgeColor: string;
}> = {
  Church: {
    label: 'Church / Ministry',
    badge: 'Ministry Account',
    icon: Building2,
    color: 'text-amber-400',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  Artiste: {
    label: 'Gospel Artiste',
    badge: 'Artiste Account',
    icon: Music2,
    color: 'text-red-400',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  Creator: {
    label: 'Gospel Creator',
    badge: 'Creator Account',
    icon: Mic,
    color: 'text-blue-400',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  Radio: {
    label: 'Gospel Media / Radio',
    badge: 'Radio & Media Account',
    icon: Radio,
    color: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  }
};

export default function CreatePage({ 
  currentUser, 
  initialAction = 'choose',
  initialUploadSource = 'device',
  onPublishSuccess, 
  onCancel,
  theme = 'dark'
}: CreatePageProps) {
  const isLight = theme === 'light';
  // Current studio action mode: 'choose' | 'upload' | 'live' | 'schedule' | 'live_control_room' | 'dashboard' | 'content' | 'analytics' | 'community' | 'giving' | 'settings'
  const [studioAction, setStudioAction] = useState<StudioAction>(initialAction);
  const [uploadMode, setUploadMode] = useState<UploadMode>(initialUploadSource);

  // Studio Navigation Tab: 'overview' | 'dashboard' | 'content' | 'live_hub' | 'schedule_hub' | 'analytics' | 'community' | 'giving' | 'settings'
  const [studioNavTab, setStudioNavTab] = useState<'overview' | 'dashboard' | 'content' | 'live_hub' | 'schedule_hub' | 'analytics' | 'community' | 'giving' | 'settings'>('overview');

  // Sub-tabs
  const [contentSubTab, setContentSubTab] = useState<'videos' | 'shorts' | 'drafts' | 'scheduled'>('videos');
  const [liveSubTab, setLiveSubTab] = useState<'go_live' | 'streams' | 'recordings'>('go_live');
  const [communitySubTab, setCommunitySubTab] = useState<'comments' | 'prayers' | 'chat'>('comments');

  // Sync props if initialAction/initialUploadSource changes
  useEffect(() => {
    if (initialAction) {
      if (['dashboard', 'content', 'analytics', 'community', 'giving', 'settings'].includes(initialAction)) {
        setStudioNavTab(initialAction as any);
        setStudioAction('choose');
      } else if (initialAction === 'schedule') {
        setStudioAction('schedule');
        setStudioNavTab('schedule_hub');
      } else if (initialAction === 'live' || initialAction === 'live_control_room') {
        setStudioAction(initialAction);
        setStudioNavTab('live_hub');
      } else if (initialAction === 'upload') {
        setStudioAction('upload');
      } else {
        setStudioAction('choose');
        setStudioNavTab('overview');
      }
    }
  }, [initialAction]);

  useEffect(() => {
    if (initialUploadSource) setUploadMode(initialUploadSource);
  }, [initialUploadSource]);

  // VOD modal state for recording publish
  const [activeVODModalData, setActiveVODModalData] = useState<RecordedStreamData | null>(null);

  // External Import fields
  const [youtubeImportUrl, setYoutubeImportUrl] = useState('');
  const [videoDirectUrl, setVideoDirectUrl] = useState('');
  const [isImportingExternal, setIsImportingExternal] = useState(false);
  const [externalImportError, setExternalImportError] = useState<string | null>(null);

  // Derive profile directly from currentUser session
  const initialCategory: CreatorCategory = (currentUser?.creatorType === 'artiste' ? 'Artiste' :
    currentUser?.creatorType === 'creator' ? 'Creator' :
    currentUser?.creatorType === 'radio' ? 'Radio' : 'Church');

  const [selectedCategory, setSelectedCategory] = useState<CreatorCategory>(initialCategory);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdStream, setCreatedStream] = useState<VideoStream | null>(null);
  const [activePortalTab, setActivePortalTab] = useState<'overview' | 'broadcast' | 'campuses' | 'socials' | 'payouts' | 'prayers'>('overview');
  const [copiedKey, setCopiedKey] = useState(false);

  // Active Ministry / Account Details
  const ministryName = currentUser?.ministryName || currentUser?.churchName || 'Grace City Cathedral';
  const ownerName = currentUser?.fullName || 'Senior Pastor David Lawson';
  const avatarUrl = currentUser?.avatarUrl || currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';

  // Common Fields
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'broadcast@gracecity.org');
  const [phoneNumber, setPhoneNumber] = useState('+1 (800) 555-7700');

  // -------------------------------------------------------------
  // 📤 1. UPLOAD VIDEO MULTI-STEP WORKFLOW STATE
  // -------------------------------------------------------------
  const [uploadStep, setUploadStep] = useState<UploadStep>('select');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    sizeFormatted: string;
    sizeBytes: number;
    type: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload progress simulation state (Direct creator upload / Cloudflare Stream resumable session)
  const [uploadProgressPercent, setUploadProgressPercent] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(1.8 * 1024 * 1024 * 1024); // default ~1.8 GB
  const [uploadSpeed, setUploadSpeed] = useState('18.4 MB/s');
  const [isUploadPaused, setIsUploadPaused] = useState(false);

  // Video processing stages state
  const [processingPercent, setProcessingPercent] = useState(0);
  const [processingStepIndex, setProcessingStepIndex] = useState(0);

  // Video Details form state (Step 4)
  const [uploadTitle, setUploadTitle] = useState('Sunday Worship Service — Walking by Faith');
  const [uploadDescription, setUploadDescription] = useState('Join us for today\'s worship service uncovering biblical revelation, powerful intercession, and how faith anchors the believer in all seasons.');
  const [uploadSpeaker, setUploadSpeaker] = useState(ownerName);
  const [uploadMinistry, setUploadMinistry] = useState(ministryName);
  const [uploadCategory, setUploadCategory] = useState<'Sermons' | 'Worship & Praise' | 'Bible Study' | 'Gospel Music' | 'Youth & Family' | 'Healing & Miracles'>('Sermons');
  const [tagsInput, setTagsInput] = useState('faith, prayer, worship, sunday-service, grace');
  const [uploadScripture, setUploadScripture] = useState('Isaiah 40:31');
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([
    'Trust God during difficult seasons and rely on His sovereign timing.',
    'Renew your faith daily through intentional scripture prayer and fellowship.',
    'Wait upon the Lord and your strength will be miraculously renewed.'
  ]);
  const [newTakeawayInput, setNewTakeawayInput] = useState('');
  
  // 🖼️ Step 5: Thumbnail Studio State
  const [uploadThumbnail, setUploadThumbnail] = useState('https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80');
  const [thumbnailMode, setThumbnailMode] = useState<'ai' | 'frames' | 'upload'>('ai');
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [selectedAiPresetId, setSelectedAiPresetId] = useState('cathedral_gold');
  const [aiOverlayTitle, setAiOverlayTitle] = useState('WALKING BY FAITH');
  const [aiOverlaySpeaker, setAiOverlaySpeaker] = useState('Pastor John');
  const [aiOverlayMinistry, setAiOverlayMinistry] = useState('Grace City Cathedral');
  const [aiOverlayVerse, setAiOverlayVerse] = useState('ISAIAH 40:31');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiAppliedSuccess, setAiAppliedSuccess] = useState(false);
  const [customThumbnailInput, setCustomThumbnailInput] = useState('');
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  // 👥 Step 6: Audience & Visibility State
  const [videoVisibility, setVideoVisibility] = useState<'public' | 'private' | 'unlisted'>('public');
  const [audienceKidsOption, setAudienceKidsOption] = useState<'all_ages' | 'made_for_kids'>('all_ages');
  const [isFaithPolicyConfirmed, setIsFaithPolicyConfirmed] = useState(true);
  const [isCopyrightConfirmed, setIsCopyrightConfirmed] = useState(true);

  // 🚀 Step 7: Publish Options State
  const [publishActionOption, setPublishActionOption] = useState<'publish_now' | 'schedule' | 'save_draft'>('publish_now');
  const [publishScheduledDate, setPublishScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [publishScheduledTime, setPublishScheduledTime] = useState('10:00');
  const [publishScheduledTimezone, setPublishScheduledTimezone] = useState('Africa/Kampala (EAT - UTC+3)');
  const [publishNotifyFollowers, setPublishNotifyFollowers] = useState(true);

  // 🔴 2. GO LIVE STATE (Broadcast live service/event)
  // Step in Go Live flow: 'setup' | 'credentials'
  const [liveSetupStep, setLiveSetupStep] = useState<'setup' | 'credentials'>('setup');
  
  // What are you broadcasting? options: 'Sunday Service' | 'Bible Study' | 'Prayer' | 'Worship' | 'Conference' | 'Other'
  const [broadcastType, setBroadcastType] = useState<LiveBroadcastType>('Sunday Service');
  const [liveTitle, setLiveTitle] = useState('Sunday Morning Celebration Service & Prophetic Worship');
  const [liveDescription, setLiveDescription] = useState('Join our live church congregation now for an anointed atmosphere of worship, intercession, and the revelatory Word.');
  const [liveCategory, setLiveCategory] = useState<string>('Live Worship');
  const [liveSpeaker, setLiveSpeaker] = useState(ownerName);
  const [liveScripture, setLiveScripture] = useState('Isaiah 40:29-31');

  // Gospread Generated Live-Stream Credentials (RTMPS & Stream Key)
  const [rtmpServerUrl, setRtmpServerUrl] = useState('rtmps://live.gospread.com/live');
  const [liveStreamKey, setLiveStreamKey] = useState(() => {
    const slug = (currentUser?.ministryName || currentUser?.churchName || 'gracecity').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `live_${slug}_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString().slice(-4)}`;
  });
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copiedServer, setCopiedServer] = useState(false);
  const [copiedStreamKey, setCopiedStreamKey] = useState(false);
  const [isGeneratingCredentials, setIsGeneratingCredentials] = useState(false);

  // Encoder Guide Tab: 'obs' | 'streamlabs' | 'vmix' | 'wirecast' | 'hardware'
  const [activeEncoderTab, setActiveEncoderTab] = useState<'obs' | 'streamlabs' | 'vmix' | 'wirecast' | 'hardware'>('obs');
  
  // Live broadcast active stream simulation
  const [isLiveSignalDetected, setIsLiveSignalDetected] = useState(true);
  const [enableLiveChat, setEnableLiveChat] = useState(true);
  const [enablePrayerAltar, setEnablePrayerAltar] = useState(true);
  const [enableGivingOverlay, setEnableGivingOverlay] = useState(true);

  // 📅 3. SCHEDULE BROADCAST STATE (Future release)
  const [scheduleTitle, setScheduleTitle] = useState('Midweek Word & Power Encounter');
  const [scheduleSpeaker, setScheduleSpeaker] = useState(ownerName);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [scheduleTime, setScheduleTime] = useState('19:00');
  const [scheduleTimezone, setScheduleTimezone] = useState('EST (UTC-5)');
  const [scheduleType, setScheduleType] = useState<'Live Broadcast Premiere' | 'Prerecorded Video Premiere' | 'Prayer Summit'>('Live Broadcast Premiere');
  const [scheduleScripture, setScheduleScripture] = useState('Romans 8:28');
  const [scheduleDescription, setScheduleDescription] = useState('Set your reminder! Join believers worldwide for this scheduled Kingdom broadcast and communion.');
  const [notifySubscribers, setNotifySubscribers] = useState(true);

  // 🎛️ STUDIO COCKPIT & QUICK ACTION STATE
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [streamLatencyMode, setStreamLatencyMode] = useState<'ultra_low' | 'low' | 'normal'>('ultra_low');
  const [copiedOverviewRtmp, setCopiedOverviewRtmp] = useState(false);
  const [copiedOverviewKey, setCopiedOverviewKey] = useState(false);
  const [overviewShowKey, setOverviewShowKey] = useState(false);
  const [overviewSimulatedSignal, setOverviewSimulatedSignal] = useState(true);
  const [scheduledPremiereReminded, setScheduledPremiereReminded] = useState(false);

  // 💳 GIVING & PAYOUT ACCOUNTS STATE
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccountItem[]>([
    {
      id: 'payout-1',
      label: 'Main Tithes & Offerings',
      type: 'Direct Bank Wire',
      currency: 'USD ($)',
      accountHolder: ministryName,
      bankOrProvider: 'Kingdom Sanctuary Trust',
      accountNumber: '•••• 8829',
      routingOrSwift: 'WFBIUS6S',
      isPrimary: true
    },
    {
      id: 'payout-2',
      label: 'Global Missions & Media Outreach',
      type: 'Stripe Connect',
      currency: 'USD ($)',
      accountHolder: `${ministryName} Missions`,
      bankOrProvider: 'Stripe Connect',
      accountNumber: 'acct_1KingdomMissions',
      routingOrSwift: 'STRIPE_GLOBAL',
      isPrimary: false
    }
  ]);

  // 🌐 SOCIAL MEDIA CHANNELS STATE
  const [socialRows, setSocialRows] = useState<SocialPlatformRow[]>([
    {
      id: 'soc-youtube',
      platform: 'youtube',
      name: 'YouTube',
      prefix: 'youtube.com/@',
      placeholder: 'channel handle',
      username: ministryName.toLowerCase().replace(/[^a-z0-9]/g, '')
    },
    {
      id: 'soc-instagram',
      platform: 'instagram',
      name: 'Instagram',
      prefix: 'instagram.com/',
      placeholder: 'your username',
      username: ministryName.toLowerCase().replace(/[^a-z0-9]/g, '')
    },
    {
      id: 'soc-website',
      platform: 'website',
      name: 'Official Ministry Website',
      prefix: 'https://',
      placeholder: 'www.gracechurch.org',
      username: `www.${ministryName.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`
    }
  ]);

  // ⛪ CHURCH CAMPUSES / LOCATIONS
  const [enableCampuses, setEnableCampuses] = useState(true);
  const [churchCampuses, setChurchCampuses] = useState<ChurchCampusItem[]>([
    {
      id: 'camp-main',
      campusName: `${ministryName} Main Sanctuary`,
      campusType: 'Main Sanctuary',
      address: '777 Grace Boulevard, Suite 100',
      city: 'Atlanta',
      stateOrRegion: 'GA',
      country: 'United States',
      zipCode: '30303',
      serviceTimes: 'Sundays: 9:00 AM & 11:30 AM EST • Midweek: Weds 7:00 PM',
      leadPastor: ownerName,
      phone: phoneNumber,
      email: contactEmail,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(ministryName + ' Atlanta GA')}`,
      isMain: true
    }
  ]);

  // Prayer Wall Items
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([
    {
      id: 'p-1',
      name: 'Sister Mary (London)',
      request: 'Praying for complete healing for my mother during upcoming surgery.',
      time: '10 mins ago',
      prayedCount: 14,
      status: 'Prayed'
    },
    {
      id: 'p-2',
      name: 'Brother Emmanuel (Nairobi)',
      request: 'Seeking guidance and favor for gospel mission outreach this weekend.',
      time: '25 mins ago',
      prayedCount: 8,
      status: 'Pending'
    }
  ]);
  const [newPrayerInput, setNewPrayerInput] = useState('');

  // Keep state synchronized with logged in user session
  useEffect(() => {
    if (currentUser?.fullName) {
      setUploadSpeaker(currentUser.fullName);
      setLiveSpeaker(currentUser.fullName);
      setScheduleSpeaker(currentUser.fullName);
    }
    if (currentUser?.ministryName || currentUser?.churchName) {
      setUploadMinistry(currentUser.ministryName || currentUser.churchName || 'Grace City Cathedral');
    }
  }, [currentUser]);

  // Handle Direct Video Upload Simulation
  useEffect(() => {
    let timer: any;
    if (uploadStep === 'uploading' && !isUploadPaused) {
      timer = setInterval(() => {
        setUploadProgressPercent(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setUploadStep('processing');
            return 100;
          }
          const next = prev + Math.floor(Math.random() * 6) + 4;
          const capped = Math.min(next, 100);
          setUploadedBytes(Math.floor((capped / 100) * totalBytes));
          return capped;
        });
      }, 350);
    }
    return () => clearInterval(timer);
  }, [uploadStep, isUploadPaused, totalBytes]);

  // Handle Cloud Transcoding & Metadata Processing Simulation
  useEffect(() => {
    let procTimer: any;
    if (uploadStep === 'processing') {
      procTimer = setInterval(() => {
        setProcessingPercent(prev => {
          if (prev >= 100) {
            clearInterval(procTimer);
            setTimeout(() => {
              setUploadStep('details');
            }, 600);
            return 100;
          }
          const next = prev + 5;
          const capped = Math.min(next, 100);
          if (capped > 20 && capped <= 45) setProcessingStepIndex(1);
          else if (capped > 45 && capped <= 75) setProcessingStepIndex(2);
          else if (capped > 75) setProcessingStepIndex(3);
          return capped;
        });
      }, 200);
    }
    return () => clearInterval(procTimer);
  }, [uploadStep]);

  const handleCopyServerUrl = () => {
    navigator.clipboard?.writeText(rtmpServerUrl);
    setCopiedServer(true);
    setTimeout(() => setCopiedServer(false), 2000);
  };

  const handleCopyLiveStreamKey = () => {
    navigator.clipboard?.writeText(liveStreamKey);
    setCopiedStreamKey(true);
    setTimeout(() => setCopiedStreamKey(false), 2000);
  };

  const handleRegenerateStreamKey = () => {
    const slug = (currentUser?.ministryName || currentUser?.churchName || 'gracecity').toLowerCase().replace(/[^a-z0-9]/g, '');
    const newKey = `live_${slug}_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString().slice(-4)}`;
    setLiveStreamKey(newKey);
    setCopiedStreamKey(false);
  };

  // Handler to progress from Setup Form to Gospread Generated Live Credentials
  const handleStartLiveSetup = (e: FormEvent) => {
    e.preventDefault();
    setIsGeneratingCredentials(true);
    setTimeout(() => {
      setIsGeneratingCredentials(false);
      setLiveSetupStep('credentials');
    }, 600);
  };

  const handleCopyStreamKey = () => {
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handlePrayForRequest = (id: string) => {
    setPrayerRequests(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          prayedCount: p.prayedCount + 1,
          status: 'Prayed'
        };
      }
      return p;
    }));
  };

  const handleAddInternalPrayer = (e: FormEvent) => {
    e.preventDefault();
    if (!newPrayerInput.trim()) return;
    const newP: PrayerRequest = {
      id: `p-${Date.now()}`,
      name: `${ownerName} (Pastoral Altar)`,
      request: newPrayerInput,
      time: 'Just now',
      prayedCount: 1,
      status: 'Pending'
    };
    setPrayerRequests([newP, ...prayerRequests]);
    setNewPrayerInput('');
  };

  // Convert Socials & Locations for Global Store
  const prepareGlobalRegistration = () => {
    const convertedSocials: SocialLink[] = socialRows
      .filter(r => r.username.trim().length > 0)
      .map(r => ({
        platform: (r.platform === 'custom' || r.platform === 'revue' ? 'website' : r.platform) as any,
        label: r.name,
        url: r.username.startsWith('http') ? r.username : `https://${r.prefix}${r.username}`,
        handle: r.username.startsWith('@') ? r.username : `@${r.username}`,
        followers: 'Official Verified Link',
        isPrimary: true
      }));

    const convertedLocations: ChurchLocation[] = (enableCampuses ? churchCampuses : [])
      .filter(c => c.campusName.trim().length > 0 || c.googleMapsUrl.trim().length > 0)
      .map(c => ({
        id: c.id,
        churchName: ministryName,
        campusName: c.campusName || 'Main Sanctuary',
        isMainCampus: c.isMain,
        address: c.address || 'Sanctuary Campus',
        city: c.city || 'Atlanta',
        stateOrRegion: c.stateOrRegion || 'GA',
        country: c.country || 'USA',
        zipCode: c.zipCode || '',
        leadPastor: c.leadPastor || ownerName,
        phone: c.phone || phoneNumber,
        email: c.email || contactEmail,
        googleMapsUrl: c.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(c.campusName || ministryName)}`,
        serviceTimes: c.serviceTimes ? [c.serviceTimes] : ['Sundays: 9:00 AM & 11:30 AM EST'],
        features: ['Main Sanctuary', 'Google Maps Navigation', 'Prayer Altar', 'Giving Payouts Active'],
        image: avatarUrl
      }));

    registerChurchProfile(ministryName, convertedLocations, convertedSocials);
  };

  // File Selector Handler
  const handleFileChosen = (file: File) => {
    const sizeInGB = (file.size / (1024 * 1024 * 1024)).toFixed(1);
    const sizeFormatted = file.size > 1024 * 1024 * 1024 
      ? `${sizeInGB} GB` 
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    setSelectedFile({
      name: file.name,
      sizeFormatted,
      sizeBytes: file.size,
      type: file.type || 'video/mp4'
    });
    setTotalBytes(file.size || 1.8 * 1024 * 1024 * 1024);
    setUploadedBytes(0);
    setUploadProgressPercent(0);
    setProcessingPercent(0);
    setProcessingStepIndex(0);
    
    // Suggest Title from file name if generic
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    if (cleanName.length > 3) {
      setUploadTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    setUploadStep('uploading');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChosen(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChosen(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Quick Mock File Selection for testing/demonstration
  const handleMockFileSelect = (fileName: string, sizeGb: number) => {
    const bytes = sizeGb * 1024 * 1024 * 1024;
    setSelectedFile({
      name: fileName,
      sizeFormatted: `${sizeGb.toFixed(1)} GB`,
      sizeBytes: bytes,
      type: 'video/mp4'
    });
    setTotalBytes(bytes);
    setUploadedBytes(0);
    setUploadProgressPercent(0);
    setProcessingPercent(0);
    setProcessingStepIndex(0);
    setUploadStep('uploading');
  };

  // Add Key Takeaway
  const handleAddTakeaway = (e: FormEvent) => {
    e.preventDefault();
    if (!newTakeawayInput.trim()) return;
    setKeyTakeaways([...keyTakeaways, newTakeawayInput.trim()]);
    setNewTakeawayInput('');
  };

  const handleRemoveTakeaway = (idx: number) => {
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== idx));
  };

  // Trigger Custom Thumbnail File Upload
  const handleThumbnailFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadThumbnail(event.target.result as string);
          setThumbnailMode('upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate Thumbnail with AI
  const handleGenerateAiThumbnail = () => {
    setIsAiGenerating(true);
    setTimeout(() => {
      setIsAiGenerating(false);
      const activePreset = AI_THUMBNAIL_PRESETS.find(p => p.id === selectedAiPresetId) || AI_THUMBNAIL_PRESETS[0];
      setUploadThumbnail(activePreset.bgImage);
      setAiAppliedSuccess(true);
      setTimeout(() => setAiAppliedSuccess(false), 3000);
    }, 700);
  };

  // Final Publish Handler for Action 1: Upload Video
  const handleFinalUploadPublish = (e: FormEvent) => {
    e.preventDefault();
    prepareGlobalRegistration();

    // Map Category to VideoStream Category
    const mappedCategory = (uploadCategory === 'Sermons' ? 'Sermon' :
      uploadCategory === 'Worship & Praise' ? 'Live Worship' :
      uploadCategory === 'Gospel Music' ? 'Gospel Music' :
      uploadCategory === 'Bible Study' ? 'Bible Study' : 'Sermon') as any;

    const formattedTakeaways = keyTakeaways.length > 0 
      ? `\n\nKey Takeaways:\n${keyTakeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
      : '';

    const isScheduled = publishActionOption === 'schedule';
    const isDraft = publishActionOption === 'save_draft';
    const formattedScheduleText = `${publishScheduledDate} at ${publishScheduledTime} (${publishScheduledTimezone})`;
    const visibilityBadgeText = videoVisibility === 'public' ? 'Public' : videoVisibility === 'unlisted' ? 'Unlisted' : 'Private';

    const newVideo: VideoStream = {
      id: `vod-${Date.now()}`,
      title: isScheduled ? `[UPCOMING] ${uploadTitle || 'Sunday Worship Service'}` : isDraft ? `[DRAFT] ${uploadTitle || 'Sunday Worship Service'}` : uploadTitle || 'Sunday Worship Service',
      speakerOrArtist: uploadSpeaker || ownerName,
      churchOrMinistry: uploadMinistry || ministryName,
      channelAvatar: avatarUrl,
      subscribersCount: '24.8K Members',
      likesCount: isScheduled ? '840 Reminders Set' : isDraft ? 'Draft Saved' : '2.1K',
      category: mappedCategory,
      isLive: false,
      duration: isScheduled ? `Premiere at ${publishScheduledTime}` : '48:30',
      viewsText: isScheduled 
        ? `🔔 Upcoming: Sunday Worship — ${publishScheduledDate} at ${publishScheduledTime}` 
        : isDraft 
        ? `Saved Draft • ${visibilityBadgeText}` 
        : `Direct Creator Upload • HD 1080p • ${visibilityBadgeText}`,
      thumbnail: uploadThumbnail || 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
      description: `${uploadDescription}${formattedTakeaways}${isScheduled ? `\n\n📅 Scheduled Premiere: ${formattedScheduleText}` : ''}`,
      bibleVerse: uploadScripture || 'Isaiah 40:31',
      date: isScheduled ? formattedScheduleText : isDraft ? 'Saved in Creator Drafts' : 'Uploaded Just Now'
    };

    setCreatedStream(newVideo);
    setIsSubmitted(true);
  };

  // Submit Handler for Action 2: Go Live
  const handleGoLiveSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    prepareGlobalRegistration();

    const mappedCategory = (
      liveCategory === 'Sunday Service' ? 'Live Worship' :
      liveCategory === 'Bible Study' ? 'Bible Study' :
      liveCategory === 'Prayer' ? 'Prayer & Intercession' :
      liveCategory === 'Worship' || liveCategory === 'Live Worship' ? 'Live Worship' :
      liveCategory === 'Conference' ? 'Christian Living' : 'Live Worship'
    ) as any;

    const newVideo: VideoStream = {
      id: `live-${Date.now()}`,
      title: liveTitle || `${broadcastType} — Live Broadcast`,
      speakerOrArtist: liveSpeaker || ownerName,
      churchOrMinistry: ministryName,
      channelAvatar: avatarUrl,
      subscribersCount: '24.8K Members',
      likesCount: '4.2K',
      category: mappedCategory,
      isLive: true,
      viewersCount: 940,
      viewsText: '940 worshippers live now • 1080p60 OBS Feed',
      thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
      description: `${liveDescription}\n\n📡 Broadcast Source: Gospread RTMPS Live Ingest (${rtmpServerUrl})\nFormat: ${broadcastType}`,
      bibleVerse: liveScripture || 'Isaiah 40:29-31',
      date: 'Streaming Live Now'
    };

    // Transition directly to Live Control Room
    setStudioAction('live_control_room');
  };

  // Live Stream ended callback -> Triggers LiveRecordingVODModal
  const handleEndLiveStream = (data: RecordedStreamData) => {
    setActiveVODModalData(data);
    setStudioAction('choose');
  };

  // Post-VOD publish handler
  const handlePublishRecordedVOD = (vodStream: VideoStream) => {
    setCreatedStream(vodStream);
    setIsSubmitted(true);
    setActiveVODModalData(null);
    onPublishSuccess(vodStream);
  };

  const handleSaveVODDraft = (_draftData: RecordedStreamData) => {
    setActiveVODModalData(null);
    setStudioAction('choose');
  };

  // External Import Handler 1: YouTube
  const handleYoutubeImportSubmit = (e: FormEvent) => {
    e.preventDefault();
    setExternalImportError(null);
    if (!youtubeImportUrl.trim()) return;

    setIsImportingExternal(true);

    setTimeout(() => {
      setIsImportingExternal(false);
      // Auto populate title and metadata from video URL
      setUploadTitle(`Sunday Worship & Prophetic Word — ${ministryName}`);
      setUploadSpeaker(ownerName);
      setUploadThumbnail('https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80');
      setSelectedFile({
        name: `YouTube_Import_${Date.now()}.mp4`,
        sizeFormatted: '1.2 GB',
        sizeBytes: 1.2 * 1024 * 1024 * 1024,
        type: 'video/mp4'
      });
      setUploadStep('details');
    }, 1200);
  };

  // External Import Handler 2: Direct Video URL / Cloud Source
  const handleDirectUrlImportSubmit = (e: FormEvent) => {
    e.preventDefault();
    setExternalImportError(null);
    if (!videoDirectUrl.trim()) return;

    setIsImportingExternal(true);

    setTimeout(() => {
      setIsImportingExternal(false);
      const urlParts = videoDirectUrl.split('/');
      const fileName = urlParts[urlParts.length - 1] || 'Sermon_Master_1080p.mp4';
      setUploadTitle(fileName.replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
      setUploadThumbnail('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80');
      setSelectedFile({
        name: fileName,
        sizeFormatted: '2.4 GB',
        sizeBytes: 2.4 * 1024 * 1024 * 1024,
        type: 'video/mp4'
      });
      setUploadStep('details');
    }, 1200);
  };

  // Submit Handler for Action 3: Schedule Broadcast
  const handleScheduleSubmit = (e: FormEvent) => {
    e.preventDefault();
    prepareGlobalRegistration();

    const formattedDateStr = `${scheduleDate} at ${scheduleTime} ${scheduleTimezone}`;

    const newVideo: VideoStream = {
      id: `sched-${Date.now()}`,
      title: `[UPCOMING] ${scheduleTitle || 'Scheduled Broadcast'}`,
      speakerOrArtist: scheduleSpeaker || ownerName,
      churchOrMinistry: ministryName,
      channelAvatar: avatarUrl,
      subscribersCount: '24.8K Members',
      likesCount: '840 Reminders Set',
      category: 'Live Worship',
      isLive: false,
      duration: 'Upcoming Premiere',
      viewsText: `Premiering on ${scheduleDate}`,
      thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      description: `${scheduleDescription} • Scheduled for ${formattedDateStr}`,
      bibleVerse: scheduleScripture || 'Romans 8:28',
      date: formattedDateStr
    };

    setCreatedStream(newVideo);
    setIsSubmitted(true);
  };

  const handleFinishAndWatch = () => {
    if (createdStream) {
      onPublishSuccess(createdStream);
    }
  };

  const currentConfig = CREATOR_TYPE_CONFIG[selectedCategory];
  const CurrentIcon = currentConfig.icon;

  // Helpers for Upload UI formatting
  const formattedUploadedGB = (uploadedBytes / (1024 * 1024 * 1024)).toFixed(1);
  const formattedTotalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(1);

  // 🔴 LIVE CONTROL ROOM MODE (FULL-SCREEN PRODUCTION SUITE)
  if (studioAction === 'live_control_room') {
    return (
      <div className="w-full min-h-screen bg-[#0a0a0a]">
        <LiveControlRoom
          currentUser={currentUser}
          broadcastTitle={liveTitle || `Sunday Worship Celebration — ${ministryName}`}
          broadcastType={broadcastType}
          category={selectedCategory}
          speaker={liveSpeaker || ownerName}
          scripture={liveScripture || 'Isaiah 40:31'}
          streamKey={liveStreamKey}
          rtmpUrl={rtmpServerUrl}
          onEndStream={handleEndLiveStream}
          onBackToStudio={() => setStudioAction('choose')}
        />
        {activeVODModalData && (
          <LiveRecordingVODModal
            currentUser={currentUser}
            recordedData={activeVODModalData}
            onPublishVOD={handlePublishRecordedVOD}
            onSaveDraft={handleSaveVODDraft}
            onClose={() => setActiveVODModalData(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`creator-studio-portal max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-6 ${
      isLight ? 'creator-studio-light' : 'creator-studio-dark'
    }`}>
      
      {/* 👑 RECOGNIZED MINISTRY IDENTITY & STUDIO COMMAND BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          
          {/* Left: Ministry Brand Info */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img 
                src={avatarUrl} 
                alt={ministryName} 
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover ring-2 ring-amber-500/60 shadow-2xl" 
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full shadow-lg" title="Verified Kingdom Broadcaster">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  {ministryName}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${currentConfig.badgeColor}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentConfig.badge}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  RTMP Ingest: Online 1080p60
                </span>
              </div>

              <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-white">{ownerName}</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-400 font-mono text-[11px]">@{ministryName.toLowerCase().replace(/[^a-z0-9]/g, '')}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 text-[11px]">Direct HLS/RTMP Transcoder & Cloud Studio</span>
              </div>

              {/* Live Studio Quick Metric Badges */}
              <div className="flex items-center gap-3 pt-1 flex-wrap text-[11px]">
                <div className="flex items-center gap-1 text-slate-300 font-medium">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold text-white">18.4K</span> Saints
                </div>
                <span className="text-slate-700">•</span>
                <div className="flex items-center gap-1 text-slate-300 font-medium">
                  <Film className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-bold text-white">142</span> Sermons & VODs
                </div>
                <span className="text-slate-700">•</span>
                <div className="flex items-center gap-1 text-slate-300 font-medium">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span className="font-bold text-white">98.2K</span> Watch Hours
                </div>
                <span className="text-slate-700">•</span>
                <div className="flex items-center gap-1 text-slate-300 font-medium">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-emerald-400">$14,850</span> Seed Balance
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons & Exit */}
          <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-end flex-wrap">
            <button
              onClick={() => {
                setStudioAction('live');
                setLiveSetupStep('setup');
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/20 transition active:scale-95 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <RadioTower className="w-3.5 h-3.5" />
              <span>Go Live</span>
            </button>

            <button
              onClick={() => {
                setStudioAction('upload');
                setUploadStep('select');
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Video</span>
            </button>

            <button
              onClick={() => setStudioAction('live_control_room')}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Open Live Broadcast Control Room"
            >
              <MonitorPlay className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Control Room</span>
            </button>

            <button
              onClick={onCancel}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white transition border border-slate-800 cursor-pointer"
            >
              Exit Studio
            </button>
          </div>
        </div>
      </div>

      {/* 🏛️ KINGDOM CREATOR STUDIO NAVIGATION */}
      {!isSubmitted && studioAction === 'choose' && (
        <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: 'overview', label: 'Overview', icon: RadioTower },
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'content', label: 'Content', count: '142', icon: Film },
              { id: 'live_hub', label: 'Live Hub', badge: 'LIVE', icon: Video },
              { id: 'schedule_hub', label: 'Schedule', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: Compass },
              { id: 'community', label: 'Community', count: '348', icon: MessageSquare },
              { id: 'giving', label: 'Giving & Partners', icon: DollarSign },
              { id: 'settings', label: 'Ministry Settings', icon: Settings },
            ].map((item) => {
              const ItemIcon = item.icon;
              const isActive = studioNavTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStudioNavTab(item.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <ItemIcon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.count && (
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Create Button with Popover Action Menu */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Create</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCreateMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick Action Dropdown Menu */}
            <AnimatePresence>
              {isCreateMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 space-y-1"
                >
                  <button
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      setStudioAction('upload');
                      setUploadStep('select');
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-left text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold">Upload Video</p>
                      <p className="text-[10px] text-slate-400">Prerecorded sermon or podcast</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      setStudioAction('live');
                      setLiveSetupStep('setup');
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-left text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                      <RadioTower className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold">Go Live Broadcast</p>
                      <p className="text-[10px] text-slate-400">Stream live Sunday service</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsCreateMenuOpen(false);
                      setStudioAction('schedule');
                    }}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-left text-xs font-bold text-slate-200 hover:text-white flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold">Schedule Premiere</p>
                      <p className="text-[10px] text-slate-400">Set future countdown event</p>
                    </div>
                  </button>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setIsCreateMenuOpen(false);
                        setStudioAction('live_control_room');
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-left text-xs font-bold text-amber-300 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                        <MonitorPlay className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold">Live Control Room</p>
                        <p className="text-[10px] text-slate-400">Open production switcher suite</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* RENDER MODULAR STUDIO SECTIONS WHEN NOT IN OVERVIEW */}
      {!isSubmitted && studioAction === 'choose' && studioNavTab !== 'overview' && (
        <KingdomStudioSections
          currentUser={currentUser}
          ministryName={ministryName}
          ownerName={ownerName}
          avatarUrl={avatarUrl}
          studioNavTab={studioNavTab}
          contentSubTab={contentSubTab}
          setContentSubTab={setContentSubTab}
          liveSubTab={liveSubTab}
          setLiveSubTab={setLiveSubTab}
          communitySubTab={communitySubTab}
          setCommunitySubTab={setCommunitySubTab}
          payoutAccounts={payoutAccounts}
          churchCampuses={churchCampuses}
          socialRows={socialRows}
          prayerRequests={prayerRequests}
          onPrayForRequest={handlePrayForRequest}
          theme={theme}
          onAddPrayerRequest={(req) => {
            setPrayerRequests(prev => [
              { id: `pr-${Date.now()}`, name: ownerName, request: req, time: 'Just now', status: 'Pending', prayedCount: 0 },
              ...prev
            ]);
          }}
          onTriggerUpload={() => {
            setStudioAction('upload');
            setUploadStep('select');
          }}
          onTriggerGoLive={() => {
            setStudioAction('live');
            setLiveSetupStep('setup');
          }}
          onEnterLiveControlRoom={() => {
            setStudioAction('live_control_room');
          }}
          onTriggerSchedule={() => {
            setStudioAction('schedule');
          }}
          onInspectRecordingVOD={(rec) => {
            setActiveVODModalData(rec);
          }}
        />
      )}

      {/* 🚀 STEP 1: WHAT DO YOU WANT TO DO? (ADVANCED CREATOR STUDIO COCKPIT OVERVIEW) */}
      {!isSubmitted && studioAction === 'choose' && studioNavTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Cockpit Headline */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Creator Studio Cockpit</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                  Production Ready
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Broadcast God's word globally with real-time RTMP ingest, automated transcoding, and congregation altar tools.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStudioAction('live_control_room')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <MonitorPlay className="w-4 h-4" />
                <span>Open Control Room</span>
              </button>
            </div>
          </div>

          {/* Three Big Hero Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            
            {/* OPTION 1: 📤 UPLOAD VIDEO */}
            <motion.button
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setStudioAction('upload');
                setUploadStep('select');
              }}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#1c1c1c] via-[#161616] to-[#101010] border border-slate-800 hover:border-amber-500/60 transition-all text-left group shadow-xl flex flex-col justify-between h-full relative overflow-hidden cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shadow-lg">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                    Direct Transcode
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                    <span>📤 Upload Video</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload a prerecorded Sunday sermon, worship concert, testimony, or faith podcast directly from your device.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Multi-bitrate 4K & 1080p60 transcode</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>AI sermon summary, scriptures & thumbnail generator</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                <span>Start Video Upload</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* OPTION 2: 🔴 GO LIVE */}
            <motion.button
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setStudioAction('live');
                setLiveSetupStep('setup');
              }}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#1c1c1c] via-[#161616] to-[#101010] border border-slate-800 hover:border-red-500/60 transition-all text-left group shadow-xl flex flex-col justify-between h-full relative overflow-hidden cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors shadow-lg">
                    <RadioTower className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    Real-Time RTMP
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-white group-hover:text-red-300 transition-colors flex items-center gap-2">
                    <span>🔴 Go Live</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Broadcast a live Sunday service, healing crusade, prayer altar, or live church event in real time.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>OBS Studio, vMix & Hardware encoder support</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Live congregation intercession altar & real-time chat</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-red-400 group-hover:text-red-300">
                <span>Setup Live Broadcast</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* OPTION 3: 📅 SCHEDULE */}
            <motion.button
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStudioAction('schedule')}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#1c1c1c] via-[#161616] to-[#101010] border border-slate-800 hover:border-blue-500/60 transition-all text-left group shadow-xl flex flex-col justify-between h-full relative overflow-hidden cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-lg">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider">
                    Future Premiere
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                    <span>📅 Schedule</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Prepare a future video premiere or schedule an upcoming live broadcast for your congregation.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Countdown page & congregation reminders</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Pre-service prayer wall & partner commitments</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                <span>Schedule Broadcast</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

          </div>

          {/* 📡 LIVE BROADCAST INGEST & ENCODER HEALTH MONITOR */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#151515] border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <span>RTMP Stream Ingest & Broadcast Monitor</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                      READY TO BROADCAST
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect OBS Studio, vMix, or ATEM switcher to your private high-throughput cloud ingest.
                  </p>
                </div>
              </div>

              {/* Simulated Audio VU Meter & Bitrate Badge */}
              <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                <div className="flex items-end gap-0.5 h-4">
                  <span className="w-1 bg-emerald-500 rounded-sm h-2 animate-pulse" />
                  <span className="w-1 bg-emerald-500 rounded-sm h-3 animate-pulse" />
                  <span className="w-1 bg-emerald-400 rounded-sm h-4 animate-pulse" />
                  <span className="w-1 bg-amber-400 rounded-sm h-2.5 animate-pulse" />
                  <span className="w-1 bg-emerald-500 rounded-sm h-3.5 animate-pulse" />
                </div>
                <div className="text-[11px] font-mono font-bold text-slate-300">
                  <span>6,180 kbps • 1080p60</span>
                </div>
              </div>
            </div>

            {/* Ingest Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Server URL */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    Stream URL (RTMPS)
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">Encrypted TLS</span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                  <span className="text-xs font-mono text-slate-200 truncate">{rtmpServerUrl}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(rtmpServerUrl);
                      setCopiedOverviewRtmp(true);
                      setTimeout(() => setCopiedOverviewRtmp(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    {copiedOverviewRtmp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{copiedOverviewRtmp ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Stream Key */}
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Stream Key (Keep Private)
                  </span>
                  <button
                    onClick={() => setOverviewShowKey(!overviewShowKey)}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    {overviewShowKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{overviewShowKey ? 'Hide' : 'Reveal'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                  <span className="text-xs font-mono text-amber-400 truncate">
                    {overviewShowKey ? liveStreamKey : '••••••••••••••••••••••••'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(liveStreamKey);
                      setCopiedOverviewKey(true);
                      setTimeout(() => setCopiedOverviewKey(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    {copiedOverviewKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[10px]">{copiedOverviewKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Latency Mode Selector & Quick Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-slate-800/80 gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400">Stream Latency:</span>
                {[
                  { id: 'ultra_low', label: 'Ultra-Low (1.5s)', desc: 'Best for live prayer & altar call' },
                  { id: 'low', label: 'Low Latency (3s)', desc: 'Recommended for Sunday worship' },
                  { id: 'normal', label: 'Standard (15s)', desc: 'Maximum playback stability' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setStreamLatencyMode(mode.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      streamLatencyMode === mode.id
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                    title={mode.desc}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setStudioAction('live_control_room')}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 transition cursor-pointer"
                >
                  <MonitorPlay className="w-3.5 h-3.5" />
                  <span>Launch Live Control Room</span>
                </button>
              </div>
            </div>

          </div>

          {/* 📊 CHANNEL PERFORMANCE PULSE & KPI GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">Congregation Reach</span>
                <Eye className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">92,450</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14.2% this week</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">Broadcast Watch Hours</span>
                <Compass className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">14,820</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+22.5% vs last month</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">Kingdom Seed Balance</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">$14,850</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>1,420 Active Partners</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-[#161616] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">Intercession Altar</span>
                <Heart className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-rose-400">348</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>Prayers standing in agreement</span>
              </div>
            </div>
          </div>

          {/* DUAL SPOTLIGHT GRID: LATEST SERMON + LIVE PRAYER ALTAR STREAM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Spotlight 1: Latest Published Sermon Performance */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#151515] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm sm:text-base font-bold text-white">Latest Sermon Spotlight</h3>
                </div>
                <button
                  onClick={() => {
                    setStudioNavTab('content');
                    setContentSubTab('videos');
                  }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All in Library</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                <div className="relative shrink-0 w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=600&q=80"
                    alt="Walking in Supernatural Revelation"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                    1:12:45
                  </span>
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                    4K UHD
                  </span>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <h4 className="text-sm font-bold text-white line-clamp-2">
                    Walking in Supernatural Revelation & Divine Grace
                  </h4>
                  <p className="text-xs text-slate-400">
                    Ephesians 1:17 • Published Aug 30, 2026
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <span className="text-white font-bold">12,480 <span className="text-slate-500 font-normal">views</span></span>
                    <span className="text-emerald-400 font-bold">1,240 <span className="text-slate-500 font-normal">likes</span></span>
                    <span className="text-amber-400 font-bold">318 <span className="text-slate-500 font-normal">Amens</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Transcoded in 4K, 1080p60, 720p HLS</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Monetization Active
                </span>
              </div>
            </div>

            {/* Spotlight 2: Live Congregation Prayer Altar Stream */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#151515] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm sm:text-base font-bold text-white">Live Prayer Altar Stream</h3>
                </div>
                <button
                  onClick={() => {
                    setStudioNavTab('community');
                    setCommunitySubTab('prayers');
                  }}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Altar Wall</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {prayerRequests.slice(0, 3).map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{req.name}</span>
                        <span className="text-[10px] text-slate-500">{req.time}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        "{req.request}"
                      </p>
                    </div>

                    <button
                      onClick={() => handlePrayForRequest(req.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40" />
                      <span>Amen ({req.prayedCount})</span>
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Intercessory prayers synced across mobile app, web stream, and sanctuary display.
              </p>
            </div>

          </div>

          {/* UPCOMING SCHEDULED BROADCAST TIMELINE */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 border border-blue-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase">
                  Upcoming Service Premiere
                </span>
                <span className="text-xs text-slate-400 font-mono">In 2 days, 14 hours</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                First Sunday Anointing Service — Covenant of Preservation
              </h3>
              <p className="text-xs text-slate-400">
                Sunday, Sept 6, 2026 • 9:00 AM EAT • Ministering: Senior Pastor David Lawson
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
              <button
                onClick={() => setScheduledPremiereReminded(!scheduledPremiereReminded)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  scheduledPremiereReminded
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{scheduledPremiereReminded ? 'Notification Set' : 'Set Reminder'}</span>
              </button>

              <button
                onClick={() => setStudioAction('schedule')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Manage Schedule
              </button>
            </div>
          </div>

        </motion.div>
      )}

      {/* 📤 FLOW 1: REFINED UPLOAD VIDEO MULTI-STEP WORKFLOW */}
      {!isSubmitted && studioAction === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Sub-header Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
            <button
              onClick={() => {
                setStudioAction('choose');
                setUploadStep('select');
              }}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Creator Options</span>
            </button>

            {/* Stepper Indicator */}
            {['select', 'uploading', 'processing'].includes(uploadStep) ? (
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                  uploadStep === 'select' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  uploadStep === 'uploading' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}>
                  {uploadStep === 'select' && <span>Step 1: Select Video</span>}
                  {uploadStep === 'uploading' && <span>Step 2: Uploading Video ({uploadProgressPercent}%)</span>}
                  {uploadStep === 'processing' && <span>Step 3: Transcoding & Optimizing</span>}
                </span>
              </div>
            ) : (
              /* 4-Step Wizard Stepper */
              <div className="flex items-center gap-1.5 bg-[#121212] p-1 rounded-2xl border border-slate-800 text-[11px] font-bold overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => setUploadStep('details')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    uploadStep === 'details'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>1. Details</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadStep('thumbnail')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    uploadStep === 'thumbnail'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>2. Thumbnail</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadStep('visibility')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    uploadStep === 'visibility'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>3. Visibility</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadStep('publish')}
                  className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    uploadStep === 'publish'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>4. Publish</span>
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              STEP 1: SELECT VIDEO / IMPORT SOURCE
             ══════════════════════════════════════════════════════════ */}
          {uploadStep === 'select' && (
            <div className="space-y-6">
              
              {/* Source Tabs Header */}
              <div className="flex items-center justify-center sm:justify-start gap-2 bg-[#121212] p-1.5 rounded-2xl border border-slate-800 w-full sm:w-fit">
                <button
                  type="button"
                  onClick={() => setUploadMode('device')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    uploadMode === 'device'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload from device</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    uploadMode === 'url'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  <span>Import video URL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMode('youtube')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    uploadMode === 'youtube'
                      ? 'bg-red-600 text-white font-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Youtube className="w-4 h-4" />
                  <span>Import YouTube</span>
                </button>
              </div>

              {/* TAB 1: DEVICE UPLOAD */}
              {uploadMode === 'device' && (
                <>
                  {/* Drag and Drop Zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] ${
                      isDragging
                        ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                        : 'border-slate-700 bg-gradient-to-b from-[#181818] to-[#111111] hover:border-amber-500/60 hover:bg-[#1c1c1c]'
                    }`}
                  >
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/mov,video/quicktime,video/webm,video/mkv,video/avi"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 shadow-xl ring-8 ring-amber-500/5 group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      Upload your video
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md">
                      Drag & drop your video file here, or click to browse from your computer or phone
                    </p>

                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                      >
                        <Film className="w-4 h-4" />
                        <span>Select Video File</span>
                      </button>
                    </div>

                    <p className="text-[11px] font-medium text-slate-500 mt-5 flex items-center gap-2">
                      <span>MP4</span> • <span>MOV</span> • <span>WebM</span> • <span>MKV</span> • <span>Up to 10 GB per video</span>
                    </p>

                    {/* Direct Upload Secure Architecture Notice */}
                    <div className="mt-4 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Resumable Direct Upload — Secure session created via direct storage provider</span>
                    </div>
                  </div>

                  {/* Sample Files Quick Test Pill (For quick evaluation) */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Info className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Testing without a large video file on hand?</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleMockFileSelect('Gospel Service — Walking by Faith.mp4', 1.8)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Load 1.8 GB Demo Sermon</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMockFileSelect('Youth Praise Night 2026.mp4', 2.4)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <span>Load 2.4 GB Worship Video</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: DIRECT VIDEO URL / CLOUD STORAGE IMPORT */}
              {uploadMode === 'url' && (
                <div className="bg-[#181818] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        Import from Direct Video URL
                      </h3>
                      <p className="text-xs text-slate-400">
                        Paste a direct URL to an MP4, HLS/m3u8, Dropbox, Google Drive, or Cloudflare Stream video asset.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleDirectUrlImportSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Direct Video Source URL <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={videoDirectUrl}
                        onChange={(e) => setVideoDirectUrl(e.target.value)}
                        placeholder="https://storage.googleapis.com/ministry-media/sundayservice_1080p.mp4"
                        className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Gospread will stream and transcode the remote video asset directly to CDN edge nodes.</span>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setUploadMode('device')}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        Back to Device Upload
                      </button>

                      <button
                        type="submit"
                        disabled={isImportingExternal}
                        className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                      >
                        {isImportingExternal ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Fetching Video Stream...</span>
                          </>
                        ) : (
                          <>
                            <span>Import & Continue</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: YOUTUBE VIDEO IMPORT */}
              {uploadMode === 'youtube' && (
                <div className="bg-[#181818] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center">
                      <Youtube className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        Import YouTube Video
                      </h3>
                      <p className="text-xs text-slate-400">
                        Paste a YouTube video link to import your church sermon, praise session, or podcast into Gospread.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleYoutubeImportSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        YouTube Video URL <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={youtubeImportUrl}
                        onChange={(e) => setYoutubeImportUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=sermon_id or https://youtu.be/..."
                        className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-red-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/20 text-xs text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Automatic Metadata Extraction: Gospread will pull your high-res thumbnail, title, and timestamps.</span>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setUploadMode('device')}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                      >
                        Back to Device Upload
                      </button>

                      <button
                        type="submit"
                        disabled={isImportingExternal}
                        className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-600/20 transition cursor-pointer"
                      >
                        {isImportingExternal ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Extracting YouTube Metadata...</span>
                          </>
                        ) : (
                          <>
                            <Youtube className="w-4 h-4" />
                            <span>Import from YouTube</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 2: UPLOAD PROGRESS (RESUMABLE DIRECT UPLOAD)
             ══════════════════════════════════════════════════════════ */}
          {uploadStep === 'uploading' && selectedFile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#181818] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Film className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white truncate max-w-sm sm:max-w-md">
                      Uploading {selectedFile.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="text-amber-300 font-mono font-bold">{uploadProgressPercent}%</span>
                      <span>•</span>
                      <span>{formattedUploadedGB} GB / {formattedTotalGB} GB</span>
                      <span>•</span>
                      <span className="text-slate-500">{uploadSpeed}</span>
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
                  <Wifi className="w-3 h-3 animate-pulse" />
                  Resumable
                </span>
              </div>

              {/* Graphical Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <motion.div 
                    className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Uploading securely via direct session...</span>
                  <span className="font-bold text-white">{uploadProgressPercent}%</span>
                </div>
              </div>

              {/* Connection & Resumable Safeguards info */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Resilient Video Pipeline</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your video chunks are written directly to high-throughput cloud streaming storage. If your mobile or Wi-Fi network drops, uploading will automatically resume right where it left off without starting over.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadStep('select');
                    setSelectedFile(null);
                    setUploadProgressPercent(0);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel Upload
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadPaused(!isUploadPaused)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition"
                  >
                    {isUploadPaused ? 'Resume Upload' : 'Pause Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadProgressPercent(100);
                      setUploadedBytes(totalBytes);
                      setUploadStep('processing');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition"
                  >
                    Skip to Processing
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 3: POST-UPLOAD TRANSCODING & METADATA PROCESSING
             ══════════════════════════════════════════════════════════ */}
          {uploadStep === 'processing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#181818] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">✓ Upload Complete</h3>
                    <p className="text-xs text-slate-400">Processing and optimizing video for global playback...</p>
                  </div>
                </div>
                <span className="text-lg font-black font-mono text-purple-400">{processingPercent}%</span>
              </div>

              {/* Transcoding Checklist */}
              <div className="bg-[#111111] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                
                {/* Step A */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {processingPercent >= 25 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    )}
                    <span className={processingPercent >= 25 ? 'text-slate-200 font-semibold' : 'text-slate-400'}>
                      Generating high-resolution video thumbnails
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {processingPercent >= 25 ? 'Complete' : 'Processing'}
                  </span>
                </div>

                {/* Step B */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {processingPercent >= 50 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : processingPercent >= 25 ? (
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span className={processingPercent >= 50 ? 'text-slate-200 font-semibold' : 'text-slate-400'}>
                      Encoding video for smooth low-bandwidth mobile streaming
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {processingPercent >= 50 ? 'Complete' : processingPercent >= 25 ? 'Encoding' : 'Queued'}
                  </span>
                </div>

                {/* Step C */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {processingPercent >= 80 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : processingPercent >= 50 ? (
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span className={processingPercent >= 80 ? 'text-slate-200 font-semibold' : 'text-slate-400'}>
                      Preparing adaptive bitrate multi-qualities (1080p, 720p, 480p, 360p, 240p)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {processingPercent >= 80 ? 'Complete' : processingPercent >= 50 ? 'Transcoding' : 'Queued'}
                  </span>
                </div>

                {/* Step D */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {processingPercent >= 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : processingPercent >= 80 ? (
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                    )}
                    <span className={processingPercent >= 100 ? 'text-slate-200 font-semibold' : 'text-slate-400'}>
                      Generating audio waveform & gospel metadata headers
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {processingPercent >= 100 ? 'Ready' : processingPercent >= 80 ? 'Finalizing' : 'Queued'}
                  </span>
                </div>

              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <motion.div 
                  className="bg-gradient-to-r from-purple-500 to-amber-400 h-full rounded-full transition-all duration-200"
                  style={{ width: `${processingPercent}%` }}
                />
              </div>

              <p className="text-center text-xs text-slate-400">
                Transcoding happens automatically in the cloud so your members across Africa and worldwide experience zero buffering.
              </p>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 4: VIDEO DETAILS & GOSPEL-SPECIFIC METADATA
             ══════════════════════════════════════════════════════════ */}
          {uploadStep === 'details' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-6">
                
                {/* Section 1: Tell us about your video */}
                <div className="bg-[#181818] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      Tell us about your video
                    </h3>
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Step 1 of 4
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadTitle}
                      onChange={(e) => {
                        setUploadTitle(e.target.value);
                        setAiOverlayTitle(e.target.value.toUpperCase());
                      }}
                      placeholder="Sunday Worship Service — Walking by Faith"
                      className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Join us for today's worship service..."
                      className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Speaker & Ministry Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Speaker / Preacher</label>
                      <input
                        type="text"
                        required
                        value={uploadSpeaker}
                        onChange={(e) => {
                          setUploadSpeaker(e.target.value);
                          setAiOverlaySpeaker(e.target.value);
                        }}
                        placeholder="Pastor John"
                        className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Ministry</label>
                      <input
                        type="text"
                        required
                        value={uploadMinistry}
                        onChange={(e) => {
                          setUploadMinistry(e.target.value);
                          setAiOverlayMinistry(e.target.value);
                        }}
                        placeholder="Grace City Cathedral"
                        className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Category & Tags Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value as any)}
                        className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="Sermons">Sermons</option>
                        <option value="Worship & Praise">Worship & Praise</option>
                        <option value="Bible Study">Bible Study</option>
                        <option value="Gospel Music">Gospel Music</option>
                        <option value="Youth & Family">Youth & Family</option>
                        <option value="Healing & Miracles">Healing & Miracles</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="faith, prayer, worship, sunday-service"
                        className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Render Tags as Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {tagsInput.split(',').map((tag, idx) => {
                      const trimmed = tag.trim();
                      if (!trimmed) return null;
                      return (
                        <span key={idx} className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 text-[10px] font-mono font-bold flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          #{trimmed}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Gospel Advantage — Scripture & Key Takeaways */}
                <div className="bg-[#181818] border border-amber-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      Scripture Anchor & Biblical Revelation
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Help your global audience connect sermon takeaways directly to the Word of God.
                    </p>
                  </div>

                  {/* Scripture Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Scripture Anchor <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadScripture}
                      onChange={(e) => {
                        setUploadScripture(e.target.value);
                        setAiOverlayVerse(e.target.value.toUpperCase());
                      }}
                      placeholder="Isaiah 40:31"
                      className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs text-amber-300 font-bold placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  {/* Key Takeaways */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      Key Takeaways for Believers
                    </label>

                    {/* Existing Key Takeaways list */}
                    <div className="space-y-2">
                      {keyTakeaways.map((takeaway, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#0f0f0f] border border-slate-800 text-xs text-slate-200">
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{takeaway}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTakeaway(idx)}
                            className="text-slate-500 hover:text-red-400 p-1 transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Takeaway Input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newTakeawayInput}
                        onChange={(e) => setNewTakeawayInput(e.target.value)}
                        placeholder="Add another key takeaway point..."
                        className="flex-1 bg-[#0f0f0f] border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTakeawayInput.trim()) {
                              setKeyTakeaways([...keyTakeaways, newTakeawayInput.trim()]);
                              setNewTakeawayInput('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => handleAddTakeaway(e)}
                        className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1 transition shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Navigation Bar */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadStep('select');
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    Start Over
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadStep('thumbnail')}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                  >
                    <span>Next: Video Thumbnail</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 5: DEDICATED VIDEO THUMBNAIL STEP
             ══════════════════════════════════════════════════════════ */}
          {uploadStep === 'thumbnail' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#181818] border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-amber-400" />
                      Video Thumbnail
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select or generate an engaging high-contrast thumbnail for your gospel video.
                    </p>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto">
                    Step 2 of 4
                  </span>
                </div>

                {/* 1. Live Video Preview Box */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Video Preview & Active Thumbnail Card
                  </label>
                  <div className="relative aspect-video max-w-xl mx-auto rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black group">
                    <img
                      src={uploadThumbnail}
                      alt="Thumbnail Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Live Play Button Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>{aiOverlayVerse || uploadScripture}</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-black/80 text-white text-[10px] font-mono font-bold">
                          48:30 HD
                        </span>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-2xl ring-4 ring-white/20 group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current ml-1" />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-black text-sm sm:text-base leading-tight drop-shadow-md">
                          {uploadTitle || 'Sunday Worship Service'}
                        </h4>
                        <p className="text-xs text-slate-300 drop-shadow">
                          {uploadSpeaker || ownerName} • {uploadMinistry || ministryName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Thumbnail Selector Tabs */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0f0f0f] border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setThumbnailMode('ai')}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        thumbnailMode === 'ai'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>✨ Generate with AI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setThumbnailMode('frames')}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        thumbnailMode === 'frames'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Film className="w-4 h-4" />
                      <span>🎞️ Extract from Video</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setThumbnailMode('upload')}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        thumbnailMode === 'upload'
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>📁 Upload Custom</span>
                    </button>
                  </div>

                  {/* TAB 1: ✨ AI GOSPEL THUMBNAIL GENERATOR */}
                  {thumbnailMode === 'ai' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-5 rounded-2xl bg-[#0f0f0f] border border-amber-500/30 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Gospel AI Graphic Design Engine
                          </h4>
                        </div>
                        <span className="text-[10px] text-amber-300 font-mono">
                          Auto-formatted 1280x720 16:9
                        </span>
                      </div>

                      {/* AI Style Presets */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Choose Sermon Aesthetic Theme
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {AI_THUMBNAIL_PRESETS.map((preset) => {
                            const isSelected = selectedAiPresetId === preset.id;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAiPresetId(preset.id);
                                  setUploadThumbnail(preset.bgImage);
                                }}
                                className={`p-3 rounded-2xl border text-left transition relative overflow-hidden group cursor-pointer ${
                                  isSelected
                                    ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/30'
                                    : 'border-slate-800 bg-[#161616] hover:border-slate-700'
                                }`}
                              >
                                <div className="aspect-video w-full rounded-xl overflow-hidden mb-2 relative">
                                  <img
                                    src={preset.bgImage}
                                    alt={preset.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className={`absolute inset-0 bg-gradient-to-t ${preset.overlayGradient} flex items-center justify-center p-2`}>
                                    <span className="text-[10px] font-black text-white text-center leading-tight">
                                      {aiOverlayTitle || 'WALKING BY FAITH'}
                                    </span>
                                  </div>
                                </div>
                                <h5 className="text-xs font-bold text-white">{preset.name}</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{preset.description}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Interactive Typography Overlay Customization */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Headline Text</label>
                          <input
                            type="text"
                            value={aiOverlayTitle}
                            onChange={(e) => setAiOverlayTitle(e.target.value)}
                            placeholder="WALKING BY FAITH"
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Speaker Subtitle</label>
                          <input
                            type="text"
                            value={aiOverlaySpeaker}
                            onChange={(e) => setAiOverlaySpeaker(e.target.value)}
                            placeholder="Pastor John"
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Ministry Label</label>
                          <input
                            type="text"
                            value={aiOverlayMinistry}
                            onChange={(e) => setAiOverlayMinistry(e.target.value)}
                            placeholder="Grace City Cathedral"
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Scripture Badge</label>
                          <input
                            type="text"
                            value={aiOverlayVerse}
                            onChange={(e) => setAiOverlayVerse(e.target.value)}
                            placeholder="ISAIAH 40:31"
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Generate Action Button */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-400">
                          {aiAppliedSuccess ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              AI Gospel Thumbnail applied to video preview!
                            </span>
                          ) : (
                            'Custom typographic card rendered with gospel high contrast'
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={handleGenerateAiThumbnail}
                          disabled={isAiGenerating}
                          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                        >
                          {isAiGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Rendering Graphics...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4" />
                              <span>✨ Re-Generate Gospel Thumbnail</span>
                            </>
                          )}
                        </button>
                      </div>

                    </motion.div>
                  )}

                  {/* TAB 2: 🎞️ GENERATE THUMBNAIL FROM VIDEO (EXTRACTED FRAMES) */}
                  {thumbnailMode === 'frames' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-5 rounded-2xl bg-[#0f0f0f] border border-slate-800 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <Film className="w-4 h-4 text-amber-400" />
                          Extracted Video Keyframes
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          Click any high-resolution frame to set as thumbnail
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {VIDEO_EXTRACTED_FRAMES.map((frame, idx) => {
                          const isSelected = selectedFrameIndex === idx && uploadThumbnail === frame.url;
                          return (
                            <button
                              key={frame.id}
                              type="button"
                              onClick={() => {
                                setSelectedFrameIndex(idx);
                                setUploadThumbnail(frame.url);
                              }}
                              className={`group text-left rounded-2xl overflow-hidden border-2 transition relative cursor-pointer ${
                                isSelected
                                  ? 'border-amber-400 ring-4 ring-amber-400/20'
                                  : 'border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="aspect-video w-full bg-slate-900 relative">
                                <img
                                  src={frame.url}
                                  alt={frame.label}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[9px] font-mono font-bold text-white">
                                  {frame.time}
                                </span>
                                {isSelected && (
                                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                              <div className="p-2.5 bg-[#161616]">
                                <p className="text-[11px] font-bold text-white line-clamp-1">{frame.label}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: 📁 UPLOAD CUSTOM THUMBNAIL */}
                  {thumbnailMode === 'upload' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-5 rounded-2xl bg-[#0f0f0f] border border-slate-800 space-y-4"
                    >
                      <input
                        ref={thumbnailFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        onChange={handleThumbnailFileChosen}
                        className="hidden"
                      />

                      <div
                        onClick={() => thumbnailFileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-2xl p-6 text-center cursor-pointer bg-[#141414] hover:bg-[#181818] transition flex flex-col items-center justify-center"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <h5 className="text-xs font-bold text-white">Select image from computer or phone</h5>
                        <p className="text-[11px] text-slate-400 mt-1">Recommended: 1280x720 (16:9), PNG, JPG, or WebP</p>
                      </div>

                      {/* Direct URL Option */}
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Or paste custom image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={customThumbnailInput}
                            onChange={(e) => setCustomThumbnailInput(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="flex-1 bg-[#161616] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customThumbnailInput.trim()) {
                                setUploadThumbnail(customThumbnailInput.trim());
                                setCustomThumbnailInput('');
                              }
                            }}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Apply URL
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* Step 5 Navigation Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setUploadStep('details')}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadStep('visibility')}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                  >
                    <span>Next: Audience & Visibility</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 6: AUDIENCE & VISIBILITY SETTINGS
             ══════════════════════════════════════════════════════════ */}
          {uploadStep === 'visibility' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-[#181818] border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-400" />
                      Audience & Visibility
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure who can view your video and verify faith broadcasting compliance.
                    </p>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto">
                    Step 3 of 4
                  </span>
                </div>

                {/* 1. Visibility Selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    Visibility
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Public */}
                    <button
                      type="button"
                      onClick={() => setVideoVisibility('public')}
                      className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
                        videoVisibility === 'public'
                          ? 'border-emerald-400 bg-emerald-500/10 ring-2 ring-emerald-400/20'
                          : 'border-slate-800 bg-[#121212] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Globe2 className="w-4 h-4" />
                        </div>
                        {videoVisibility === 'public' && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>🌍 Public</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Anyone on Gospread worldwide can search for and watch this video.
                      </p>
                    </button>

                    {/* Private */}
                    <button
                      type="button"
                      onClick={() => setVideoVisibility('private')}
                      className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
                        videoVisibility === 'private'
                          ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/20'
                          : 'border-slate-800 bg-[#121212] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Lock className="w-4 h-4" />
                        </div>
                        {videoVisibility === 'private' && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>🔒 Private</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Only you and authorized pastoral staff can view this video.
                      </p>
                    </button>

                    {/* Unlisted */}
                    <button
                      type="button"
                      onClick={() => setVideoVisibility('unlisted')}
                      className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
                        videoVisibility === 'unlisted'
                          ? 'border-blue-400 bg-blue-500/10 ring-2 ring-blue-400/20'
                          : 'border-slate-800 bg-[#121212] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <Link2 className="w-4 h-4" />
                        </div>
                        {videoVisibility === 'unlisted' && (
                          <span className="w-5 h-5 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>🔗 Unlisted</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Anyone with the direct link can watch; omitted from search & explore feeds.
                      </p>
                    </button>

                  </div>
                </div>

                {/* 2. Audience & Kids Content */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">
                      Audience
                    </label>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Is this content intended for children?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAudienceKidsOption('all_ages')}
                      className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
                        audienceKidsOption === 'all_ages'
                          ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/20'
                          : 'border-slate-800 bg-[#121212] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                        {audienceKidsOption === 'all_ages' && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white">
                        No, it is for the General Congregation & All Ages
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Adult sermons, praise & worship concerts, youth service, family gatherings.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAudienceKidsOption('made_for_kids')}
                      className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
                        audienceKidsOption === 'made_for_kids'
                          ? 'border-purple-400 bg-purple-500/10 ring-2 ring-purple-400/20'
                          : 'border-slate-800 bg-[#121212] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <Baby className="w-4 h-4" />
                        </div>
                        {audienceKidsOption === 'made_for_kids' && (
                          <span className="w-5 h-5 rounded-full bg-purple-500 text-slate-950 flex items-center justify-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white">
                        Yes, it is Made for Children (Kids Ministry)
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Sunday school lessons, bible animation stories, kids worship songs.
                      </p>
                    </button>
                  </div>
                </div>

                {/* 3. Faith Standards & Copyright Compliance */}
                <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Content Moderation & Copyright Policy
                  </h4>

                  <label className="flex items-start gap-3 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFaithPolicyConfirmed}
                      onChange={(e) => setIsFaithPolicyConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                    />
                    <span>
                      I confirm this gospel media complies with Gospread faith community guidelines and Christian worship principles.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCopyrightConfirmed}
                      onChange={(e) => setIsCopyrightConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400"
                    />
                    <span>
                      I certify that our ministry owns or holds the necessary broadcasting licenses for this sermon, worship recording, or music.
                    </span>
                  </label>
                </div>

                {/* Step 6 Navigation Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setUploadStep('thumbnail')}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Thumbnail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadStep('publish')}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 transition cursor-pointer"
                  >
                    <span>Next: Publish Options</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              STEP 7: PUBLISH OPTIONS ([Publish Now] [Schedule] [Save Draft])
             ══════════════════════════════════════════════════════════ */}
          {uploadStep === 'publish' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <form onSubmit={handleFinalUploadPublish} className="bg-[#181818] border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-amber-400" />
                      Publish Options
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Choose whether to broadcast immediately, schedule a future premiere, or save a draft.
                    </p>
                  </div>
                  <span className="text-[11px] text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto">
                    Step 4 of 4
                  </span>
                </div>

                {/* 3 Main Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Option 1: 🚀 Publish Now */}
                  <button
                    type="button"
                    onClick={() => setPublishActionOption('publish_now')}
                    className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                      publishActionOption === 'publish_now'
                        ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-400/30'
                        : 'border-slate-800 bg-[#121212] hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-md">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        {publishActionOption === 'publish_now' && (
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-white">
                        🚀 Publish Now
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Broadcast immediately across Gospread worldwide and notify your congregation.
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-800/80 text-[11px] text-amber-300 font-bold">
                      Immediate Global Premiere
                    </div>
                  </button>

                  {/* Option 2: 📅 Schedule */}
                  <button
                    type="button"
                    onClick={() => setPublishActionOption('schedule')}
                    className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                      publishActionOption === 'schedule'
                        ? 'border-blue-400 bg-blue-500/10 ring-2 ring-blue-400/30'
                        : 'border-slate-800 bg-[#121212] hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-md">
                          <Calendar className="w-5 h-5" />
                        </div>
                        {publishActionOption === 'schedule' && (
                          <span className="w-5 h-5 rounded-full bg-blue-500 text-slate-950 flex items-center justify-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-white">
                        📅 Schedule
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Pick a date and time to premiere your sermon with automated member reminders.
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-800/80 text-[11px] text-blue-300 font-bold">
                      Set Date & Timezone
                    </div>
                  </button>

                  {/* Option 3: 💾 Save Draft */}
                  <button
                    type="button"
                    onClick={() => setPublishActionOption('save_draft')}
                    className={`p-5 rounded-2xl border text-left transition relative flex flex-col justify-between cursor-pointer ${
                      publishActionOption === 'save_draft'
                        ? 'border-slate-400 bg-slate-500/10 ring-2 ring-slate-400/30'
                        : 'border-slate-800 bg-[#121212] hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-700 text-slate-300 flex items-center justify-center shadow-md">
                          <Save className="w-5 h-5" />
                        </div>
                        {publishActionOption === 'save_draft' && (
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-950 flex items-center justify-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-white">
                        💾 Save Draft
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Store video assets, scripture tags, and notes securely in your Creator Studio.
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 font-bold">
                      Unpublished Studio Draft
                    </div>
                  </button>

                </div>

                {/* Conditional Schedule Fields when Schedule is selected */}
                {publishActionOption === 'schedule' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-5 rounded-2xl bg-[#0f0f0f] border border-blue-500/30 space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Set Premiere Schedule
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Publish Date <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={publishScheduledDate}
                          onChange={(e) => setPublishScheduledDate(e.target.value)}
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Publish Time <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="time"
                          required
                          value={publishScheduledTime}
                          onChange={(e) => setPublishScheduledTime(e.target.value)}
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">
                          Timezone
                        </label>
                        <select
                          value={publishScheduledTimezone}
                          onChange={(e) => setPublishScheduledTimezone(e.target.value)}
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                        >
                          <option value="Africa/Kampala (EAT - UTC+3)">Africa/Kampala (EAT - UTC+3)</option>
                          <option value="Africa/Lagos (WAT - UTC+1)">Africa/Lagos (WAT - UTC+1)</option>
                          <option value="Africa/Nairobi (EAT - UTC+3)">Africa/Nairobi (EAT - UTC+3)</option>
                          <option value="Africa/Johannesburg (SAST - UTC+2)">Africa/Johannesburg (SAST - UTC+2)</option>
                          <option value="Africa/Accra (GMT - UTC+0)">Africa/Accra (GMT - UTC+0)</option>
                          <option value="America/New_York (EST - UTC-5)">America/New_York (EST - UTC-5)</option>
                          <option value="Europe/London (BST - UTC+1)">Europe/London (BST - UTC+1)</option>
                        </select>
                      </div>
                    </div>

                    {/* Dynamic Scheduled Banner */}
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-2.5 text-xs text-blue-200">
                      <Bell className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>
                        <strong>Upcoming:</strong> Sunday Worship — {publishScheduledDate} at {publishScheduledTime} ({publishScheduledTimezone})
                      </span>
                    </div>

                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={publishNotifyFollowers}
                        onChange={(e) => setPublishNotifyFollowers(e.target.checked)}
                        className="rounded border-slate-700 text-blue-500 focus:ring-blue-400"
                      />
                      <span>Alert and notify {ministryName}'s followers 1 hour before premiere countdown starts</span>
                    </label>
                  </motion.div>
                )}

                {/* Final Summary Card */}
                <div className="p-4 rounded-2xl bg-[#0f0f0f] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={uploadThumbnail}
                      alt="Selected Thumbnail"
                      referrerPolicy="no-referrer"
                      className="w-16 h-11 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{uploadTitle}</h4>
                      <p className="text-[11px] text-slate-400">{uploadSpeaker} • {uploadMinistry}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-amber-300">{uploadScripture}</span>
                        <span className="text-[10px] text-slate-400">• {videoVisibility.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                    {publishActionOption === 'publish_now' ? 'Instant Global Live' : publishActionOption === 'schedule' ? 'Scheduled Premiere' : 'Studio Draft'}
                  </span>
                </div>

                {/* Final Navigation & Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setUploadStep('visibility')}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Visibility</span>
                  </button>

                  <button
                    type="submit"
                    className={`px-8 py-3 rounded-full font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl transition cursor-pointer ${
                      publishActionOption === 'publish_now'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                        : publishActionOption === 'schedule'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-600/20'
                        : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white shadow-slate-700/20'
                    }`}
                  >
                    {publishActionOption === 'publish_now' && (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Publish Video to {ministryName}</span>
                      </>
                    )}
                    {publishActionOption === 'schedule' && (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>Schedule Premiere for {ministryName}</span>
                      </>
                    )}
                    {publishActionOption === 'save_draft' && (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Draft to Creator Studio</span>
                      </>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            </motion.div>
          )}

        </motion.div>
      )}

      {/* 🔴 FLOW 2: GO LIVE BROADCAST FORM (PROFESSIONAL RTMP/RTMPS ARCHITECTURE) */}
      {!isSubmitted && studioAction === 'live' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Sub-header Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <button
              onClick={() => {
                if (liveSetupStep === 'credentials') {
                  setLiveSetupStep('setup');
                } else {
                  setStudioAction('choose');
                }
              }}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{liveSetupStep === 'credentials' ? 'Back to Broadcast Details' : 'Back to Creator Options'}</span>
            </button>
            <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              {liveSetupStep === 'setup' ? 'Live Broadcast Setup' : 'Live Stream Ingest Active'}
            </span>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              VIEW A: START A LIVE BROADCAST (METADATA & BROADCAST TYPE)
             ═══════════════════════════════════════════════════════════════ */}
          {liveSetupStep === 'setup' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <form onSubmit={handleStartLiveSetup} className="bg-[#181818] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-7">
                
                {/* Header Title */}
                <div className="border-b border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-pulse inline-block" />
                      START A LIVE BROADCAST
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Configure your gospel service broadcast. Gospread will generate dedicated RTMP/RTMPS stream credentials for OBS Studio, vMix, and hardware encoders.
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-amber-300 font-bold self-start sm:self-auto flex items-center gap-1.5">
                    <RadioTower className="w-3.5 h-3.5 text-red-400" />
                    <span>{ministryName}</span>
                  </div>
                </div>

                {/* 1. What are you broadcasting? (Radio Options) */}
                <div className="space-y-3">
                  <label className="block text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                    What are you broadcasting? <span className="text-red-400">*</span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {(['Sunday Service', 'Bible Study', 'Prayer', 'Worship', 'Conference', 'Other'] as LiveBroadcastType[]).map((type) => {
                      const isSelected = broadcastType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setBroadcastType(type);
                            // Auto-suggest category & title template
                            if (type === 'Sunday Service') {
                              setLiveCategory('Live Worship');
                              setLiveTitle('Sunday Morning Celebration & Prophetic Worship');
                            } else if (type === 'Bible Study') {
                              setLiveCategory('Bible Study');
                              setLiveTitle('Midweek Word & Discipleship Encounter');
                            } else if (type === 'Prayer') {
                              setLiveCategory('Prayer & Intercession');
                              setLiveTitle('Global Prayer Altar & Midnight Intercession');
                            } else if (type === 'Worship') {
                              setLiveCategory('Live Worship');
                              setLiveTitle('Evening Atmosphere of Anointed Worship');
                            } else if (type === 'Conference') {
                              setLiveCategory('Christian Living');
                              setLiveTitle('Kingdom Awakening Annual Conference');
                            }
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col items-start justify-between cursor-pointer ${
                            isSelected
                              ? 'border-red-500 bg-red-500/10 text-white ring-2 ring-red-500/30'
                              : 'border-slate-800 bg-[#121212] text-slate-300 hover:border-slate-700 hover:bg-[#161616]'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-red-500 bg-red-500' : 'border-slate-600'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {type === 'Sunday Service' ? '⛪' :
                               type === 'Bible Study' ? '📖' :
                               type === 'Prayer' ? '🔥' :
                               type === 'Worship' ? '🕊️' :
                               type === 'Conference' ? '🌍' : '🎙️'}
                            </span>
                          </div>
                          <span className="text-xs font-bold leading-tight">
                            {type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Title Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs sm:text-sm font-bold text-slate-200">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">{liveTitle.length}/100</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                    placeholder="e.g. Sunday Morning Celebration Service & Prophetic Worship"
                    maxLength={100}
                    className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
                  />
                </div>

                {/* 3. Description Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-slate-200">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={liveDescription}
                    onChange={(e) => setLiveDescription(e.target.value)}
                    placeholder="Tell your church members and worldwide audience what to expect from today's live service..."
                    className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition resize-none shadow-inner"
                  />
                </div>

                {/* 4. Category Dropdown & Preacher/Host */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={liveCategory}
                        onChange={(e) => setLiveCategory(e.target.value)}
                        className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-red-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none appearance-none cursor-pointer pr-10"
                      >
                        <option value="Live Worship">Live Worship</option>
                        <option value="Sunday Service">Sunday Service</option>
                        <option value="Bible Study">Bible Study</option>
                        <option value="Prayer & Intercession">Prayer & Intercession</option>
                        <option value="Christian Living">Christian Living & Conference</option>
                        <option value="Gospel Music">Gospel Music Concert</option>
                        <option value="Youth & Ministry">Youth & Young Adults</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
                      Preacher / Service Host
                    </label>
                    <input
                      type="text"
                      value={liveSpeaker}
                      onChange={(e) => setLiveSpeaker(e.target.value)}
                      placeholder="Senior Pastor John"
                      className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-red-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">
                      Scripture Anchor
                    </label>
                    <input
                      type="text"
                      value={liveScripture}
                      onChange={(e) => setLiveScripture(e.target.value)}
                      placeholder="Isaiah 40:29-31"
                      className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-red-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-amber-300 font-bold focus:outline-none shadow-inner"
                    />
                  </div>
                </div>

                {/* Interactive Live Add-ons */}
                <div className="p-4 rounded-2xl bg-[#121212] border border-slate-800/80 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Interactive Live Broadcast Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableLiveChat}
                        onChange={(e) => setEnableLiveChat(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span>💬 Live Chat & Amen Reactions</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enablePrayerAltar}
                        onChange={(e) => setEnablePrayerAltar(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span>🔥 Live Prayer Altar Wall</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableGivingOverlay}
                        onChange={(e) => setEnableGivingOverlay(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                      <span>💳 Tithes & Giving Banner</span>
                    </label>
                  </div>
                </div>

                {/* Primary Action Button: [ Start Live Setup ] */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setStudioAction('choose')}
                    className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isGeneratingCredentials}
                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-red-600/30 transition cursor-pointer"
                  >
                    {isGeneratingCredentials ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Live Stream Ingest...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Start Live Setup</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              VIEW B: YOUR LIVE STREAM (GOSPREAD GENERATES RTMP CREDENTIALS)
             ═══════════════════════════════════════════════════════════════ */}
          {liveSetupStep === 'credentials' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-[#181818] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-7">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                        YOUR LIVE STREAM
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Gospread has provisioned your dedicated live stream ingest. Copy these credentials into your broadcasting software (OBS, Streamlabs, vMix, Wirecast).
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                      <span>Ingest Ready</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setLiveSetupStep('setup')}
                      className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                    >
                      Edit Info
                    </button>
                  </div>
                </div>

                {/* Summary Info Banner */}
                <div className="p-4 rounded-2xl bg-[#121212] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">[{broadcastType}]</span>
                      <h3 className="text-sm font-black text-white">{liveTitle}</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      {liveSpeaker || ownerName} • {ministryName} • {liveCategory}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 text-slate-400 text-[11px] font-mono border border-slate-800">
                      1080p60 • RTMPS
                    </span>
                  </div>
                </div>

                {/* 🔑 THE CORE ARCHITECTURE: GOSPREAD PROVISIONED RTMP CREDENTIALS */}
                <div className="space-y-5 p-5 sm:p-6 rounded-3xl bg-[#0f0f0f] border-2 border-red-500/30 shadow-2xl">
                  
                  {/* 1. Server URL */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Radio className="w-4 h-4 text-red-400" />
                        Server (RTMPS URL)
                      </label>
                      <span className="text-[11px] text-slate-500">Cloudflare Stream / Gospread Edge</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 bg-[#161616] border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono text-amber-300 select-all overflow-x-auto shadow-inner">
                        {rtmpServerUrl}
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyServerUrl}
                        className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 ${
                          copiedServer
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        {copiedServer ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Server Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Server</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 2. Stream Key */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-400" />
                        Stream Key
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowStreamKey(!showStreamKey)}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          {showStreamKey ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Hide Key</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>👁 Show Key</span>
                            </>
                          )}
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={handleRegenerateStreamKey}
                          className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
                          title="Generate a new private stream key"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 bg-[#161616] border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono text-slate-200 select-all overflow-x-auto shadow-inner tracking-wider">
                        {showStreamKey ? liveStreamKey : '••••••••••••••••••••••••••••••••••••••••'}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyLiveStreamKey}
                          className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shrink-0 ${
                            copiedStreamKey
                              ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold'
                          }`}
                        >
                          {copiedStreamKey ? (
                            <>
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>Key Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Stream Key</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 📡 BROADCAST SOFTWARE INTEGRATION GUIDE (OBS, STREAMLABS, VMIX, WIRECAST) */}
                <div className="p-5 rounded-3xl bg-[#121212] border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-amber-400" />
                        Connect Your Streaming Software
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Put the Gospread server and stream key into your favorite broadcast software:
                      </p>
                    </div>

                    {/* Software Selector Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-black/50 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto">
                      {(['obs', 'streamlabs', 'vmix', 'wirecast', 'hardware'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveEncoderTab(tab)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition cursor-pointer ${
                            activeEncoderTab === tab
                              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab === 'obs' ? 'OBS Studio' :
                           tab === 'streamlabs' ? 'Streamlabs' :
                           tab === 'vmix' ? 'vMix' :
                           tab === 'wirecast' ? 'Wirecast' : 'Hardware (ATEM)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Explanations */}
                  <div className="text-xs text-slate-300 bg-[#161616] border border-slate-800 rounded-2xl p-4 space-y-2">
                    {activeEncoderTab === 'obs' && (
                      <div>
                        <p className="font-bold text-amber-300">How to configure OBS Studio:</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-400 mt-1">
                          <li>Open OBS Studio and click <strong className="text-white">Settings</strong> &gt; <strong className="text-white">Stream</strong>.</li>
                          <li>Set Service to <strong className="text-white">Custom...</strong></li>
                          <li>Paste the Server: <code className="text-amber-300 font-mono text-[11px] bg-black/50 px-1 py-0.5 rounded">{rtmpServerUrl}</code></li>
                          <li>Paste the Stream Key: <code className="text-amber-300 font-mono text-[11px] bg-black/50 px-1 py-0.5 rounded">••••••••••••••</code></li>
                          <li>Click <strong className="text-white">Apply</strong> and hit <strong className="text-red-400 font-bold">Start Streaming</strong>!</li>
                        </ol>
                      </div>
                    )}

                    {activeEncoderTab === 'streamlabs' && (
                      <div>
                        <p className="font-bold text-amber-300">How to configure Streamlabs Desktop:</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-400 mt-1">
                          <li>Open Streamlabs &gt; Settings gear &gt; <strong className="text-white">Stream</strong>.</li>
                          <li>Choose <strong className="text-white">Custom Streaming Server</strong>.</li>
                          <li>Paste URL and Stream Key, then start broadcasting.</li>
                        </ol>
                      </div>
                    )}

                    {activeEncoderTab === 'vmix' && (
                      <div>
                        <p className="font-bold text-amber-300">How to configure vMix Live Production:</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-400 mt-1">
                          <li>Click the gear icon next to <strong className="text-white">Stream</strong> at the bottom of vMix.</li>
                          <li>Select <strong className="text-white">Custom RTMP Server</strong> as the destination.</li>
                          <li>Paste the Gospread RTMPS URL into URL and your Key into Stream Key.</li>
                        </ol>
                      </div>
                    )}

                    {activeEncoderTab === 'wirecast' && (
                      <div>
                        <p className="font-bold text-amber-300">How to configure Telestream Wirecast:</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-400 mt-1">
                          <li>Go to <strong className="text-white">Output</strong> &gt; <strong className="text-white">Output Settings</strong>.</li>
                          <li>Select <strong className="text-white">RTMP Server</strong> and enter Gospread address & stream key.</li>
                        </ol>
                      </div>
                    )}

                    {activeEncoderTab === 'hardware' && (
                      <div>
                        <p className="font-bold text-amber-300">How to configure Hardware Encoders (Blackmagic ATEM Mini Pro, LiveU, Teradek, Kiloview):</p>
                        <ol className="list-decimal list-inside space-y-1 text-slate-400 mt-1">
                          <li>In your encoder web dashboard or ATEM software control, add a custom RTMP streaming profile.</li>
                          <li>Provide the Gospread RTMPS endpoint and stream key with 1080p (4500-6000 kbps) profile.</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Launch Broadcast Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Once your software encoder is streaming, Gospread will instantly distribute the live feed worldwide.</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setLiveSetupStep('setup')}
                      className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGoLiveSubmit()}
                      className="flex-1 sm:flex-none px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/30 transition cursor-pointer"
                    >
                      <RadioTower className="w-4 h-4" />
                      <span>Start Broadcasting to Gospread</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </motion.div>
      )}

      {/* 📅 FLOW 3: SCHEDULE BROADCAST / PREMIERE FORM */}
      {!isSubmitted && studioAction === 'schedule' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Sub-header Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <button
              onClick={() => setStudioAction('choose')}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Creator Options</span>
            </button>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Schedule Upcoming Broadcast
            </span>
          </div>

          <form onSubmit={handleScheduleSubmit} className="space-y-6">
            <div className="bg-[#181818] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                Scheduled Premiere Details
              </h3>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Upcoming Broadcast Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={scheduleTitle}
                  onChange={(e) => setScheduleTitle(e.target.value)}
                  placeholder="e.g. Midweek Word & Power Encounter"
                  className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-blue-400 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* Speaker & Premiere Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Preacher / Artiste</label>
                  <input
                    type="text"
                    required
                    value={scheduleSpeaker}
                    onChange={(e) => setScheduleSpeaker(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-blue-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Broadcast Type</label>
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value as any)}
                    className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-blue-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Live Broadcast Premiere">Live Broadcast Premiere</option>
                    <option value="Prerecorded Video Premiere">Prerecorded Video Premiere</option>
                    <option value="Prayer Summit">Global Online Prayer Summit</option>
                  </select>
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Broadcast Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-blue-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Service Time</label>
                  <input
                    type="time"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-blue-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Timezone</label>
                  <select
                    value={scheduleTimezone}
                    onChange={(e) => setScheduleTimezone(e.target.value)}
                    className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-blue-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="EST (UTC-5)">EST (UTC-5)</option>
                    <option value="EAT (UTC+3)">EAT - Nairobi / Kampala (UTC+3)</option>
                    <option value="WAT (UTC+1)">WAT - Lagos / Abuja (UTC+1)</option>
                    <option value="GMT (UTC+0)">GMT - London / Accra (UTC+0)</option>
                    <option value="PST (UTC-8)">PST (UTC-8)</option>
                  </select>
                </div>
              </div>

              {/* Scripture & Outline */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Foundational Scripture</label>
                <input
                  type="text"
                  value={scheduleScripture}
                  onChange={(e) => setScheduleScripture(e.target.value)}
                  placeholder="e.g. Romans 8:28"
                  className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-blue-400 rounded-2xl px-4 py-2.5 text-xs text-amber-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Service Outline / Description</label>
                <textarea
                  rows={2}
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-slate-700 focus:border-blue-400 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              {/* Subscriber Notification Checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySubscribers}
                  onChange={(e) => setNotifySubscribers(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  Automatically alert and notify {ministryName}'s followers 1 hour before start
                </span>
              </label>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStudioAction('choose')}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-blue-600/30 transition cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Premiere for {ministryName}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* 🎉 POST-PUBLISH PORTAL DASHBOARD (AFTER SUCCESSFUL PUBLICATION) */}
      {isSubmitted && createdStream && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Success Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center ring-4 ring-emerald-500/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Broadcast Published Successfully to {ministryName}!
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Your video is now live on the global feed with adaptive bitrate streaming, giving payouts, and prayer altar.
              </p>
            </div>
          </div>

          {/* Published Video Preview Card */}
          <div className="p-5 rounded-3xl bg-[#181818] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img 
                src={createdStream.thumbnail} 
                alt={createdStream.title}
                referrerPolicy="no-referrer"
                className="w-20 h-14 rounded-xl object-cover ring-1 ring-slate-700 shrink-0" 
              />
              <div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{createdStream.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{createdStream.speakerOrArtist} • {createdStream.churchOrMinistry}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {createdStream.bibleVerse || 'Ephesians 2:8'}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {createdStream.viewsText}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinishAndWatch}
              className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch on Feed</span>
            </button>
          </div>

          {/* Ministry Portal Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'Studio Overview', icon: BarChart3 },
              { id: 'socials', label: 'Social Channels', icon: Globe },
              { id: 'payouts', label: 'Giving Accounts', icon: DollarSign },
              { id: 'campuses', label: 'Campus Locations', icon: Building2 },
              { id: 'broadcast', label: 'RTMP Stream Keys', icon: Video },
              { id: 'prayers', label: 'Prayer Wall', icon: Heart }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePortalTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition whitespace-nowrap ${
                    activePortalTab === tab.id 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: STUDIO OVERVIEW */}
          {activePortalTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Total Viewers Reached</span>
                <p className="text-xl font-black text-white">24,850</p>
                <span className="text-[10px] text-emerald-400">+18% this month</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Prayer Requests Prayed</span>
                <p className="text-xl font-black text-white">412</p>
                <span className="text-[10px] text-amber-300">Active intercession altar</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Active Payout Channels</span>
                <p className="text-xl font-black text-white">{payoutAccounts.length} Accounts</p>
                <span className="text-[10px] text-emerald-400">Mobile Money & Bank Wires</span>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL CHANNELS */}
          {activePortalTab === 'socials' && (
            <div className="bg-[#181818] border border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                Verified Social Links for {ministryName}
              </h3>
              <div className="space-y-2">
                {socialRows.map(s => (
                  <div key={s.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{s.name}</span>
                    <span className="font-mono text-amber-400">@{s.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GIVING PAYOUTS */}
          {activePortalTab === 'payouts' && (
            <div className="bg-[#181818] border border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Active Giving & Seed Payout Destinations ({payoutAccounts.length})
              </h3>
              <div className="space-y-3">
                {payoutAccounts.map(acc => (
                  <div key={acc.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{acc.label}</span>
                        {acc.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">PRIMARY</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{acc.type} • {acc.currency} • {acc.bankOrProvider}</p>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono font-bold">Ready</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHURCH CAMPUSES */}
          {activePortalTab === 'campuses' && (
            <div className="bg-[#181818] border border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Church Campuses & Worship Sanctuaries ({churchCampuses.length})
              </h3>
              <div className="space-y-3">
                {churchCampuses.map(camp => (
                  <div key={camp.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{camp.campusName}</span>
                        {camp.isMain && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">MAIN SANCTUARY</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{camp.address}, {camp.city}, {camp.country}</p>
                    </div>
                    <a
                      href={camp.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Google Maps</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BROADCAST RTMP KEYS */}
          {activePortalTab === 'broadcast' && (
            <div className="p-6 rounded-3xl bg-[#181818] border border-slate-800 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-red-400" />
                  Live Broadcasting Credentials & OBS Setup for {ministryName}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">RTMP Server Ingest URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="rtmp://live.gospread.org/app/"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-amber-400 focus:outline-none"
                    />
                    <button 
                      onClick={handleCopyStreamKey}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl flex items-center gap-1.5 shrink-0"
                    >
                      {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Secret Stream Key</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`live_${ministryName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`}
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-300 focus:outline-none"
                    />
                    <button 
                      onClick={handleCopyStreamKey}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl flex items-center gap-1.5 shrink-0"
                    >
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRAYER WALL */}
          {activePortalTab === 'prayers' && (
            <div className="p-6 rounded-3xl bg-[#181818] border border-slate-800 space-y-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                {ministryName} Prayer Altar Wall
              </h3>

              {/* Add Prayer Input */}
              <form onSubmit={handleAddInternalPrayer} className="flex gap-2">
                <input
                  type="text"
                  value={newPrayerInput}
                  onChange={(e) => setNewPrayerInput(e.target.value)}
                  placeholder="Record an offline prayer request for the pastoral altar..."
                  className="flex-1 bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Altar Request</span>
                </button>
              </form>

              {/* Prayer Requests List */}
              <div className="space-y-3">
                {prayerRequests.map((prayer) => (
                  <div key={prayer.id} className="p-4 rounded-2xl bg-[#0f0f0f] border border-slate-800 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{prayer.name}</span>
                        <span className="text-[10px] text-slate-500">• {prayer.time}</span>
                        <span className={`px-2 py-0.2 text-[9px] font-bold rounded-full ${
                          prayer.status === 'Prayed' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {prayer.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{prayer.request}</p>
                    </div>

                    <button
                      onClick={() => handlePrayForRequest(prayer.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                        prayer.status === 'Prayed'
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{prayer.status === 'Prayed' ? 'Prayed' : 'Pray Now'} ({prayer.prayedCount})</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              onClick={() => { 
                setIsSubmitted(false); 
                setCreatedStream(null); 
                setStudioAction('choose'); 
                setUploadStep('select');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Back to Studio Actions
            </button>

            <button
              onClick={handleFinishAndWatch}
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition cursor-pointer"
            >
              <span>Watch on Video Player</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 🔴 VOD RECORDING PUBLISH MODAL */}
      {activeVODModalData && (
        <LiveRecordingVODModal
          currentUser={currentUser}
          recordedData={activeVODModalData}
          onPublishVOD={handlePublishRecordedVOD}
          onSaveDraft={handleSaveVODDraft}
          onClose={() => setActiveVODModalData(null)}
        />
      )}

    </div>
  );
}

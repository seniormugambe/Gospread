import React, { useState, FormEvent } from 'react';
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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoStream, ChurchLocation, SocialLink, registerChurchProfile } from '../data/gospelData';

type CreatorCategory = 'Church' | 'Artiste' | 'Creator';

interface CreatePageProps {
  onPublishSuccess: (newStream: VideoStream) => void;
  onCancel: () => void;
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

// 🌐 Predefined Social Media Links Structure (Matching exact user screenshot design)
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

export default function CreatePage({ onPublishSuccess, onCancel }: CreatePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<CreatorCategory>('Church');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdStream, setCreatedStream] = useState<VideoStream | null>(null);
  const [activePortalTab, setActivePortalTab] = useState<'overview' | 'broadcast' | 'campuses' | 'socials' | 'payouts' | 'prayers' | 'analytics'>('overview');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Common Registration Fields
  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // 💳 1. MULTIPLE GIVING & PAYOUT ACCOUNTS STATE
  const [payoutAccounts, setPayoutAccounts] = useState<PayoutAccountItem[]>([
    {
      id: 'payout-1',
      label: 'Main Sunday Tithes & Offerings',
      type: 'Direct Bank Wire',
      currency: 'USD ($)',
      accountHolder: 'Grace Fellowship Cathedral Ministries Inc.',
      bankOrProvider: 'Kingdom Global Trust Bank',
      accountNumber: '9810239104',
      routingOrSwift: '021000021 / SWIFT: KGTBUSA',
      isPrimary: true
    },
    {
      id: 'payout-2',
      label: 'Global Building & Sanctuary Expansion Fund',
      type: 'Stripe Connect',
      currency: 'USD ($)',
      accountHolder: 'Grace Fellowship Building Altar',
      bankOrProvider: 'Stripe Express Payouts',
      accountNumber: 'acct_1M3K92gX90Lzp8Q',
      routingOrSwift: 'Instant Card Processing',
      isPrimary: false
    },
    {
      id: 'payout-3',
      label: 'Missions, Charity & Outreach (Africa/Global)',
      type: 'Mobile Money (M-Pesa / MTN)',
      currency: 'KES (KSh)',
      accountHolder: 'Grace Missions Outreach Trust',
      bankOrProvider: 'Safaricom M-Pesa Till / Paybill',
      accountNumber: 'Till No: 892019 / +254 700 123456',
      routingOrSwift: 'Paybill 247247',
      isPrimary: false
    }
  ]);

  // 🌐 2. MULTIPLE SOCIAL MEDIA LINKS STATE (Pre-populated matching uploaded image design)
  const [socialRows, setSocialRows] = useState<SocialPlatformRow[]>([
    {
      id: 'soc-tiktok',
      platform: 'tiktok',
      name: 'TikTok',
      prefix: 'https://www.tiktok.com/@',
      placeholder: 'your username',
      username: 'gospelcathedral'
    },
    {
      id: 'soc-substack',
      platform: 'substack',
      name: 'Substack',
      prefix: 'https://',
      suffix: '.substack.com/',
      placeholder: 'publication-name',
      username: 'gracetube'
    },
    {
      id: 'soc-twitter',
      platform: 'twitter',
      name: 'Twitter / X',
      prefix: 'twitter.com/',
      placeholder: 'your username',
      username: 'GraceCathedral'
    },
    {
      id: 'soc-linkedin',
      platform: 'linkedin',
      name: 'LinkedIn',
      prefix: 'linkedin.com/in/',
      placeholder: 'your username or company',
      username: 'grace-fellowship-cathedral'
    },
    {
      id: 'soc-facebook',
      platform: 'facebook',
      name: 'Facebook',
      prefix: 'facebook.com/',
      placeholder: 'your username',
      username: 'GraceFellowshipLive'
    },
    {
      id: 'soc-instagram',
      platform: 'instagram',
      name: 'Instagram',
      prefix: 'instagram.com/',
      placeholder: 'your username',
      username: 'gracecathedral_live'
    },
    {
      id: 'soc-medium',
      platform: 'medium',
      name: 'Medium',
      prefix: 'medium.com/@',
      placeholder: 'your username',
      username: 'pastordavid'
    },
    {
      id: 'soc-revue',
      platform: 'revue',
      name: 'Threads / Newsletter',
      prefix: 'threads.net/@',
      placeholder: 'your username',
      username: 'gracecathedral'
    },
    {
      id: 'soc-youtube',
      platform: 'youtube',
      name: 'YouTube',
      prefix: 'youtube.com/@',
      placeholder: 'channel handle or UCZcY...',
      username: 'GraceCathedralGlobal'
    },
    {
      id: 'soc-buymeacoffee',
      platform: 'buymeacoffee',
      name: 'Seed Offering / Support',
      prefix: 'buymeacoffee.com/',
      placeholder: 'ministry_handle',
      username: 'grace_ministry'
    },
    {
      id: 'soc-spotify',
      platform: 'spotify',
      name: 'Spotify',
      prefix: 'open.spotify.com/artist/',
      placeholder: 'artist or playlist ID',
      username: 'grace-worship-collective'
    },
    {
      id: 'soc-telegram',
      platform: 'telegram',
      name: 'Telegram Prayer Line',
      prefix: 't.me/',
      placeholder: 'channel or prayer altar',
      username: 'GracePrayerAltar'
    },
    {
      id: 'soc-whatsapp',
      platform: 'whatsapp',
      name: 'WhatsApp Intercession',
      prefix: 'wa.me/',
      placeholder: 'country code + number',
      username: '18005557700'
    },
    {
      id: 'soc-website',
      platform: 'website',
      name: 'Official Ministry Website',
      prefix: 'https://',
      placeholder: 'www.gracechurch.org',
      username: 'www.gracefellowship.org'
    }
  ]);

  // ⛪ 3. MULTIPLE CHURCH LOCATIONS & CAMPUSES STATE (OPTIONAL)
  const [enableCampuses, setEnableCampuses] = useState(true);
  const [churchCampuses, setChurchCampuses] = useState<ChurchCampusItem[]>([
    {
      id: 'camp-1',
      campusName: 'Main Worship Cathedral & HQ Sanctuary',
      campusType: 'Main Sanctuary',
      address: '777 Grace Boulevard, Suite 100',
      city: 'Atlanta',
      stateOrRegion: 'GA',
      country: 'United States',
      zipCode: '30303',
      serviceTimes: 'Sundays: 8:00 AM & 10:30 AM EST • Wednesdays: 7:00 PM EST',
      leadPastor: 'Senior Pastors David & Sarah Lawson',
      phone: '+1 (404) 555-7700',
      email: 'atlanta@gracefellowship.org',
      googleMapsUrl: 'https://maps.google.com/?q=Atlanta+Grace+Cathedral',
      isMain: true
    },
    {
      id: 'camp-2',
      campusName: 'Downtown City Center Campus',
      campusType: 'Branch Sanctuary',
      address: '240 Peachtree Street NW',
      city: 'Atlanta',
      stateOrRegion: 'GA',
      country: 'United States',
      zipCode: '30308',
      serviceTimes: 'Sundays: 11:30 AM EST • Thursdays: 12:15 PM Midday Prayer',
      leadPastor: 'Pastor Mark Anthony & Grace Choir',
      phone: '+1 (404) 555-7711',
      email: 'downtown@gracefellowship.org',
      googleMapsUrl: 'https://maps.google.com/?q=Peachtree+Street+Atlanta',
      isMain: false
    },
    {
      id: 'camp-3',
      campusName: 'London UK International Campus',
      campusType: 'International Fellowship',
      address: '42 Grace Church Street',
      city: 'London',
      stateOrRegion: 'Greater London',
      country: 'United Kingdom',
      zipCode: 'EC3V 0AT',
      serviceTimes: 'Sundays: 10:00 AM GMT • Fridays: 8:00 PM GMT Revival Altar',
      leadPastor: 'Pastor Samuel & Grace Boateng',
      phone: '+44 20 7946 0912',
      email: 'london@gracefellowship.org',
      googleMapsUrl: 'https://maps.google.com/?q=London+Grace+Church',
      isMain: false
    }
  ]);

  // ⛪ Church Registration State
  const [churchName, setChurchName] = useState('Grace Fellowship Cathedral');
  const [pastorName, setPastorName] = useState('Senior Pastor David Lawson');
  const [denomination, setDenomination] = useState('Non-Denominational / Evangelical');
  const [churchServiceType, setChurchServiceType] = useState('Live Worship');
  const [sermonTitle, setSermonTitle] = useState('Walking in Divine Victory and Grace');
  const [churchStreamUrl, setChurchStreamUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [churchScripture, setChurchScripture] = useState('Ephesians 2:8-10');
  const [churchDescription, setChurchDescription] = useState('Official live broadcast feed of Grace Fellowship Cathedral. Join our worldwide family for spirit-filled worship and life-transforming Word.');
  const [enableLiveChat, setEnableLiveChat] = useState(true);
  const [enablePrayerBox, setEnablePrayerBox] = useState(true);

  // 🎵 Artiste Registration State
  const [artistName, setArtistName] = useState('Grace & Victory Collective');
  const [recordLabel, setRecordLabel] = useState('Kingdom Sound Records');
  const [musicGenre, setMusicGenre] = useState('Contemporary Worship');
  const [trackTitle, setTrackTitle] = useState('Oceans of Unfailing Mercy');
  const [musicCategory, setMusicCategory] = useState<'Live Worship' | 'Gospel Music' | 'Choir Special'>('Gospel Music');
  const [musicMediaUrl, setMusicMediaUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [musicThumbnail, setMusicThumbnail] = useState('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80');
  const [musicInspiration, setMusicInspiration] = useState('Written during an all-night prayer vigil reflecting on the boundless grace of God.');
  const [musicLyrics, setMusicLyrics] = useState('Your mercy falls like morning rain / Washing away every guilt and pain / Forever You reign, Hallelujah!');

  // 🎙️ Creator Registration State
  const [creatorName, setCreatorName] = useState('Kingdom Today Faith Pod');
  const [creatorNiche, setCreatorNiche] = useState('Gospel Podcast');
  const [creatorBio, setCreatorBio] = useState('Weekly discipleship discussions, sound biblical truth, and interviews with Christian leaders.');
  const [episodeTitle, setEpisodeTitle] = useState('Overcoming Anxiety Through Scripture');
  const [episodeNumber, setEpisodeNumber] = useState('Season 1, Ep 4');
  const [creatorMediaUrl, setCreatorMediaUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [featuredGuests, setFeaturedGuests] = useState('Dr. Jane Doe & Pastor Samuel');
  const [episodeKeyTakeaways, setEpisodeKeyTakeaways] = useState('Philippians 4:6-7 peace of God that surpasses understanding.');
  const [studyGuideUrl, setStudyGuideUrl] = useState('https://gracetube.tv/study-guides/ep4');

  // Interactive Post-Registration Prayer Requests State
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([
    {
      id: 'p1',
      name: 'Sister Mary K.',
      request: 'Praying for complete healing for my mother in hospital and peace over our family.',
      time: '10 mins ago',
      prayedCount: 24,
      status: 'Pending'
    },
    {
      id: 'p2',
      name: 'Brother Joseph',
      request: 'Asking for prayer for breakthrough in my job interview and financial provision.',
      time: '25 mins ago',
      prayedCount: 18,
      status: 'Pending'
    },
    {
      id: 'p3',
      name: 'Grace Youth Ministry',
      request: 'Praying for an outpouring of the Holy Spirit at our upcoming youth conference.',
      time: '1 hour ago',
      prayedCount: 42,
      status: 'Prayed'
    }
  ]);

  const [newPrayerInput, setNewPrayerInput] = useState('');

  // Payout Account Actions
  const addPayoutAccount = () => {
    setPayoutAccounts(prev => [
      ...prev,
      {
        id: `payout-${Date.now()}`,
        label: `Giving Account #${prev.length + 1}`,
        type: 'Direct Bank Wire',
        currency: 'USD ($)',
        accountHolder: churchName || 'Ministry Payout Account',
        bankOrProvider: '',
        accountNumber: '',
        routingOrSwift: '',
        isPrimary: false
      }
    ]);
  };

  const removePayoutAccount = (id: string) => {
    setPayoutAccounts(prev => prev.filter(p => p.id !== id));
  };

  const updatePayoutAccount = (id: string, field: keyof PayoutAccountItem, value: any) => {
    setPayoutAccounts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const setPrimaryPayoutAccount = (id: string) => {
    setPayoutAccounts(prev => prev.map(p => ({ ...p, isPrimary: p.id === id })));
  };

  // Social Links Actions
  const updateSocialUsername = (id: string, username: string) => {
    setSocialRows(prev => prev.map(s => s.id === id ? { ...s, username } : s));
  };

  const addCustomSocialLink = () => {
    setSocialRows(prev => [
      ...prev,
      {
        id: `soc-custom-${Date.now()}`,
        platform: 'custom',
        name: 'Custom Web Link',
        prefix: 'https://',
        placeholder: 'your-custom-link.org',
        username: '',
        customLabel: 'Custom Channel'
      }
    ]);
  };

  const removeSocialLink = (id: string) => {
    setSocialRows(prev => prev.filter(s => s.id !== id));
  };

  // Church Campus Actions
  const addChurchCampus = () => {
    setChurchCampuses(prev => [
      ...prev,
      {
        id: `camp-${Date.now()}`,
        campusName: `New Campus Location #${prev.length + 1}`,
        campusType: 'Branch Sanctuary',
        address: '',
        city: '',
        stateOrRegion: '',
        country: 'United States',
        zipCode: '',
        serviceTimes: 'Sundays: 10:00 AM',
        leadPastor: '',
        phone: '',
        email: '',
        googleMapsUrl: '',
        isMain: false
      }
    ]);
  };

  const removeChurchCampus = (id: string) => {
    setChurchCampuses(prev => prev.filter(c => c.id !== id));
  };

  const updateChurchCampus = (id: string, field: keyof ChurchCampusItem, value: any) => {
    setChurchCampuses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const setMainCampus = (id: string) => {
    setChurchCampuses(prev => prev.map(c => ({ ...c, isMain: c.id === id })));
  };

  // Intercession prayers handler
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
      name: 'Congregation Intercession',
      request: newPrayerInput,
      time: 'Just now',
      prayedCount: 1,
      status: 'Pending'
    };
    setPrayerRequests([newP, ...prayerRequests]);
    setNewPrayerInput('');
  };

  // Form Submit Handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    let newVideo: VideoStream;
    const mainCampus = churchCampuses.find(c => c.isMain) || churchCampuses[0];

    // Format Social Links for data model
    const convertedSocials: SocialLink[] = socialRows
      .filter(r => r.username.trim().length > 0)
      .map(r => {
        let fullUrl = '';
        if (r.platform === 'substack') {
          fullUrl = `https://${r.username}.substack.com`;
        } else if (r.platform === 'tiktok') {
          fullUrl = r.username.startsWith('http') ? r.username : `https://www.tiktok.com/@${r.username.replace('@', '')}`;
        } else if (r.platform === 'website') {
          fullUrl = r.username.startsWith('http') ? r.username : `https://${r.username}`;
        } else {
          fullUrl = r.username.startsWith('http') ? r.username : `https://${r.prefix}${r.username}`;
        }

        return {
          platform: (r.platform === 'custom' || r.platform === 'revue' ? 'website' : r.platform) as any,
          label: r.name,
          url: fullUrl,
          handle: r.username.startsWith('@') ? r.username : `@${r.username}`,
          followers: 'Official Verified Link',
          isPrimary: true
        };
      });

    // Format Church Locations for data model (Optional & Google Maps Focused)
    const convertedLocations: ChurchLocation[] = (enableCampuses ? churchCampuses : [])
      .filter(c => c.campusName.trim().length > 0 || c.googleMapsUrl.trim().length > 0)
      .map(c => ({
        id: c.id,
        churchName: churchName,
        campusName: c.campusName || 'Worship Campus',
        isMainCampus: c.isMain,
        address: c.address || (c.googleMapsUrl ? 'Google Maps Location' : 'Main Church Sanctuary'),
        city: c.city || 'Global',
        stateOrRegion: c.stateOrRegion || '',
        country: c.country || 'Global',
        zipCode: c.zipCode || '',
        leadPastor: c.leadPastor || pastorName || 'Senior Pastors & Leadership',
        phone: c.phone || phoneNumber || '+1 (800) 555-7700',
        email: c.email || contactEmail || 'contact@church.org',
        googleMapsUrl: c.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(c.campusName || churchName)}`,
        serviceTimes: c.serviceTimes ? [c.serviceTimes] : ['Sundays: 9:00 AM & 11:30 AM EST'],
        features: ['Main Worship Sanctuary', 'Google Maps Live Navigation', 'Prayer Altar'],
        image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80'
      }));

    if (selectedCategory === 'Church') {
      newVideo = {
        id: `church-${Date.now()}`,
        title: sermonTitle || 'Live Sunday Worship & Word',
        speakerOrArtist: pastorName || 'Senior Pastor David Lawson',
        churchOrMinistry: churchName || 'Grace Fellowship Cathedral',
        channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        subscribersCount: '18.4K Members',
        likesCount: '3.2K',
        category: churchServiceType === 'Bible Study' ? 'Bible Study' : 'Live Worship',
        isLive: true,
        viewersCount: 780,
        viewsText: '780 online members worshipping now',
        thumbnail: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80',
        description: churchDescription || `Official service stream from ${churchName} (${mainCampus?.city || 'Atlanta'}, ${mainCampus?.country || 'USA'}).`,
        bibleVerse: churchScripture || 'Ephesians 2:8-10',
        date: 'Streaming Live Now'
      };

      // Register into global store
      registerChurchProfile(churchName, convertedLocations, convertedSocials);

    } else if (selectedCategory === 'Artiste') {
      newVideo = {
        id: `artiste-${Date.now()}`,
        title: trackTitle || 'Anointed Praise & Worship Single',
        speakerOrArtist: artistName || 'Gospel Vocalist',
        churchOrMinistry: recordLabel ? `${artistName} • ${recordLabel}` : artistName || 'Gospel Artiste',
        channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        subscribersCount: '32K Listeners',
        likesCount: '4.8K',
        category: musicCategory,
        isLive: false,
        duration: '05:42',
        viewsText: 'Verified Single Release',
        thumbnail: musicThumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        description: musicInspiration || `New Kingdom music release from ${artistName}. Genre: ${musicGenre}.`,
        bibleVerse: 'Psalm 150:6 - Let everything that has breath praise the LORD.',
        date: 'Newly Registered Release'
      };

      registerChurchProfile(artistName, undefined, convertedSocials);

    } else {
      newVideo = {
        id: `creator-${Date.now()}`,
        title: `${episodeTitle || 'Kingdom Growth Discussion'} (${episodeNumber})`,
        speakerOrArtist: creatorName || 'Faith Podcaster',
        churchOrMinistry: `${creatorName} Official Channel`,
        channelAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
        subscribersCount: '10.2K Subscribers',
        likesCount: '1.5K',
        category: creatorNiche === 'Bible Commentary' ? 'Bible Study' : 'Sermon',
        isLive: false,
        duration: '32:10',
        viewsText: 'Just posted',
        thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
        description: episodeKeyTakeaways || `${creatorBio || 'Faith-filled content for spiritual growth.'}`,
        date: 'Just published'
      };

      registerChurchProfile(creatorName, undefined, convertedSocials);
    }

    setCreatedStream(newVideo);
    setIsSubmitted(true);
  };

  const handleFinishAndWatch = () => {
    if (createdStream) {
      onPublishSuccess(createdStream);
    }
  };

  const handleCopyStreamKey = () => {
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Helper to render platform icon matching the uploaded image
  const renderSocialIcon = (platform: SocialPlatformRow['platform']) => {
    switch (platform) {
      case 'tiktok':
        return (
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white border border-slate-700 shadow-sm shrink-0">
            <LinkIcon className="w-4 h-4 text-cyan-400" />
          </div>
        );
      case 'substack':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#FF6719] flex items-center justify-center text-white shadow-sm shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        );
      case 'twitter':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#1DA1F2] flex items-center justify-center text-white shadow-sm shrink-0">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
            </svg>
          </div>
        );
      case 'linkedin':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#0A66C2] flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
            <span>in</span>
          </div>
        );
      case 'facebook':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
            <span>f</span>
          </div>
        );
      case 'instagram':
        return (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-sm shrink-0">
            <div className="w-4 h-4 rounded-md border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        );
      case 'medium':
        return (
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-xs border border-slate-700 shadow-sm shrink-0">
            <span className="tracking-tighter">●●</span>
          </div>
        );
      case 'revue':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#E64C3C] flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
            <span>R</span>
          </div>
        );
      case 'youtube':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#FF0000] flex items-center justify-center text-white shadow-sm shrink-0">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
        );
      case 'buymeacoffee':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#FFDD00] flex items-center justify-center text-slate-950 font-bold shadow-sm shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
        );
      case 'spotify':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center text-slate-950 font-bold shadow-sm shrink-0">
            <Music2 className="w-4 h-4" />
          </div>
        );
      case 'telegram':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#229ED9] flex items-center justify-center text-white shadow-sm shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
        );
      case 'whatsapp':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center text-white shadow-sm shrink-0">
            <Phone className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 border border-slate-700 shadow-sm shrink-0">
            <Globe className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 my-4">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isSubmitted ? `${selectedCategory} Publisher Studio` : 'Register Ministry & Channel Setup'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isSubmitted 
              ? `Manage your official ${selectedCategory} channel, broadcasting keys, multi-campus locations, multiple payouts & socials.` 
              : `Register your official profile as a Church, Artiste, or Creator to stream globally on GraceTube.`
            }
          </p>
        </div>

        <button
          onClick={onCancel}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
        >
          {isSubmitted ? 'Exit Studio' : 'Cancel'}
        </button>
      </div>

      {isSubmitted && createdStream ? (
        /* POST-REGISTRATION PUBLISHER DASHBOARD & STUDIO PORTAL */
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Official Channel Verified Banner */}
          <div className="bg-[#181818] border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              {selectedCategory === 'Church' && <Building2 className="w-48 h-48 text-amber-400" />}
              {selectedCategory === 'Artiste' && <Music2 className="w-48 h-48 text-red-400" />}
              {selectedCategory === 'Creator' && <Mic className="w-48 h-48 text-blue-400" />}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={createdStream.channelAvatar} 
                    alt={createdStream.churchOrMinistry} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg" 
                  />
                  <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-slate-950 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{createdStream.churchOrMinistry}</h2>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      {selectedCategory} Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Contact: {contactEmail || 'Channel Owner'} • {phoneNumber || 'Active'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Channel Handle: <span className="text-amber-400 font-mono">gracetube.tv/@{createdStream.churchOrMinistry.toLowerCase().replace(/\s+/g, '')}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleFinishAndWatch}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Public Live Stream</span>
              </button>
            </div>
          </div>

          {/* Studio Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-1.5 overflow-x-auto pb-0.5">
            {[
              { id: 'overview', label: 'Studio Overview', icon: UserCheck },
              { id: 'socials', label: 'Social Links', icon: Share2, count: socialRows.filter(s => s.username).length },
              { id: 'payouts', label: 'Payout Accounts', icon: Landmark, count: payoutAccounts.length },
              ...(selectedCategory === 'Church' ? [{ id: 'campuses', label: 'Church Campuses', icon: Building2, count: churchCampuses.length }] : []),
              { id: 'broadcast', label: 'Live RTMP Keys', icon: Video },
              { id: 'prayers', label: 'Prayer Wall', icon: Heart, count: prayerRequests.length },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activePortalTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePortalTab(tab.id as any)}
                  className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
                    isActive 
                      ? 'border-amber-400 text-amber-400 bg-slate-900' 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* TAB 1: STUDIO OVERVIEW */}
          {activePortalTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Live Viewers</span>
                  <div className="text-xl font-bold text-white flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>780</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">+24% this service</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Channel Members</span>
                  <div className="text-xl font-bold text-white">
                    {createdStream.subscribersCount}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Active Followers</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Payout Accounts</span>
                  <div className="text-xl font-bold text-amber-400">
                    {payoutAccounts.length} Configured
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Multiple Destinations</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#181818] border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    {selectedCategory === 'Church' ? 'Campuses' : 'Social Links'}
                  </span>
                  <div className="text-xl font-bold text-blue-400">
                    {selectedCategory === 'Church' ? `${churchCampuses.length} Campuses` : `${socialRows.filter(s => s.username).length} Links`}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Multi-Location Setup</span>
                </div>
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Social Channels Preview in Studio */}
                <div className="p-5 rounded-3xl bg-[#181818] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-amber-400" />
                      Connected Social Media Links
                    </h4>
                    <button 
                      onClick={() => setActivePortalTab('socials')}
                      className="text-[11px] font-bold text-amber-400 hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {socialRows.filter(s => s.username.trim()).map(s => (
                      <div key={s.id} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {renderSocialIcon(s.platform)}
                          <div>
                            <span className="font-bold text-white block">{s.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {s.prefix}{s.username}{s.suffix || ''}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`${s.prefix}${s.username}${s.suffix || ''}`, s.id)}
                          className="p-1 text-slate-400 hover:text-white transition"
                          title="Copy Link"
                        >
                          {copiedLink === s.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Multiple Payout Accounts Preview */}
                <div className="p-5 rounded-3xl bg-[#181818] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-amber-400" />
                      Multiple Payout Accounts
                    </h4>
                    <button 
                      onClick={() => setActivePortalTab('payouts')}
                      className="text-[11px] font-bold text-amber-400 hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {payoutAccounts.map(acc => (
                      <div key={acc.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white">{acc.label}</span>
                            {acc.isPrimary && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {acc.type} • {acc.accountNumber || acc.routingOrSwift}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          {acc.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOCIAL LINKS (Exact UI from user screenshot) */}
          {activePortalTab === 'socials' && (
            <div className="bg-[#181818] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-amber-400" />
                    Social Links
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect your official channel across social media, publication platforms, and devotional feeds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCustomSocialLink}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Link</span>
                </button>
              </div>

              {/* Social Links List matching the screenshot structure */}
              <div className="space-y-3">
                {socialRows.map((row) => (
                  <div 
                    key={row.id} 
                    className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#0f0f0f] border border-slate-700/80 rounded-2xl p-1.5 sm:p-2 gap-2 shadow-sm hover:border-slate-600 transition"
                  >
                    {/* Left Icon and Prefix Container */}
                    <div className="flex items-center gap-2.5 px-2 py-1 shrink-0">
                      {renderSocialIcon(row.platform)}
                      <span className="text-xs font-medium text-slate-300 font-mono select-none">
                        {row.prefix}
                      </span>
                    </div>

                    {/* Right Text Input */}
                    <div className="flex-1 flex items-center min-w-0 pr-1">
                      <input
                        type="text"
                        value={row.username}
                        onChange={(e) => updateSocialUsername(row.id, e.target.value)}
                        placeholder={row.placeholder}
                        className="w-full bg-transparent px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none font-medium"
                      />
                      {row.suffix && (
                        <span className="text-xs text-slate-400 font-mono pr-2 select-none">
                          {row.suffix}
                        </span>
                      )}
                    </div>

                    {/* Remove or Copy Action */}
                    <div className="flex items-center gap-1 px-1 shrink-0 self-end sm:self-center">
                      {row.username && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`${row.prefix}${row.username}${row.suffix || ''}`, row.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 transition"
                          title="Copy Full URL"
                        >
                          {copiedLink === row.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      {socialRows.length > 5 && (
                        <button
                          type="button"
                          onClick={() => removeSocialLink(row.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition"
                          title="Remove Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MULTIPLE PAYOUT ACCOUNTS */}
          {activePortalTab === 'payouts' && (
            <div className="bg-[#181818] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-amber-400" />
                    Multiple Payout Accounts & Giving Destinations
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure multiple financial accounts for receiving direct tithes, building pledges, and mission funds.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPayoutAccount}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Payout Method</span>
                </button>
              </div>

              <div className="space-y-4">
                {payoutAccounts.map((acc, idx) => (
                  <div 
                    key={acc.id} 
                    className={`p-4 rounded-2xl border space-y-3 relative ${
                      acc.isPrimary 
                        ? 'bg-amber-950/20 border-amber-500/50' 
                        : 'bg-[#0f0f0f] border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Account #{idx + 1}: {acc.label || 'Untitled Account'}
                        </span>
                        {acc.isPrimary ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                            PRIMARY DESTINATION
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPrimaryPayoutAccount(acc.id)}
                            className="text-[10px] text-slate-400 hover:text-amber-400 underline font-semibold"
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>

                      {payoutAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePayoutAccount(acc.id)}
                          className="text-slate-500 hover:text-red-400 p-1 text-xs flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Account Purpose / Label</label>
                        <input
                          type="text"
                          value={acc.label}
                          onChange={(e) => updatePayoutAccount(acc.id, 'label', e.target.value)}
                          placeholder="e.g. Building Fund Pledges"
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Payout Method Type</label>
                        <select
                          value={acc.type}
                          onChange={(e) => updatePayoutAccount(acc.id, 'type', e.target.value as any)}
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="Direct Bank Wire">Direct Bank Wire / ACH / IBAN</option>
                          <option value="Mobile Money (M-Pesa / MTN)">Mobile Money (M-Pesa / MTN / Airtel)</option>
                          <option value="Stripe Connect">Stripe Connect Account</option>
                          <option value="PayPal Business">PayPal Business Email</option>
                          <option value="Cash App / Zelle">Cash App / Zelle Tag</option>
                          <option value="Crypto Giving (USDC/USDT)">Crypto Giving (USDC / USDT)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Currency</label>
                        <select
                          value={acc.currency}
                          onChange={(e) => updatePayoutAccount(acc.id, 'currency', e.target.value as any)}
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                        >
                          <option value="USD ($)">USD ($) - US Dollar</option>
                          <option value="GBP (£)">GBP (£) - British Pound</option>
                          <option value="EUR (€)">EUR (€) - Euro</option>
                          <option value="NGN (₦)">NGN (₦) - Nigerian Naira</option>
                          <option value="KES (KSh)">KES (KSh) - Kenyan Shilling</option>
                          <option value="GHS (GH₵)">GHS (GH₵) - Ghanaian Cedi</option>
                          <option value="ZAR (R)">ZAR (R) - South African Rand</option>
                          <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                          <option value="AUD ($)">AUD ($) - Australian Dollar</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Account Holder / Entity</label>
                        <input
                          type="text"
                          value={acc.accountHolder}
                          onChange={(e) => updatePayoutAccount(acc.id, 'accountHolder', e.target.value)}
                          placeholder="e.g. Grace Fellowship Cathedral"
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Bank / Network Provider</label>
                        <input
                          type="text"
                          value={acc.bankOrProvider}
                          onChange={(e) => updatePayoutAccount(acc.id, 'bankOrProvider', e.target.value)}
                          placeholder="e.g. Chase Bank / Safaricom M-Pesa"
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Account No / IBAN / Phone / Tag</label>
                        <input
                          type="text"
                          value={acc.accountNumber}
                          onChange={(e) => updatePayoutAccount(acc.id, 'accountNumber', e.target.value)}
                          placeholder="e.g. 0123456789 or $GraceTithe"
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHURCH CAMPUSES & MULTI-LOCATIONS */}
          {activePortalTab === 'campuses' && selectedCategory === 'Church' && (
            <div className="bg-[#181818] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">
                      Church Campuses & Google Maps Locations
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
                      Optional
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Provide Google Maps links and worship location details for 1-tap member navigation and driving directions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addChurchCampus}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Location</span>
                </button>
              </div>

              {churchCampuses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#0f0f0f] border border-dashed border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">No Physical Locations Added Yet</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Locations are optional. You can add a Google Maps link to your worship cathedral, branch campus, or youth sanctuary anytime.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addChurchCampus}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Location / Google Maps Link</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {churchCampuses.map((camp, idx) => (
                    <div 
                      key={camp.id} 
                      className={`p-4 rounded-2xl border space-y-3 relative ${
                        camp.isMain 
                          ? 'bg-amber-950/20 border-amber-500/50' 
                          : 'bg-[#0f0f0f] border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-white">
                            Campus #{idx + 1}: {camp.campusName || 'New Campus'}
                          </span>
                          {camp.isMain ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                              MAIN HEADQUARTERS
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setMainCampus(camp.id)}
                              className="text-[10px] text-slate-400 hover:text-amber-400 underline font-semibold"
                            >
                              Set as Main Campus
                            </button>
                          )}
                        </div>

                        {churchCampuses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChurchCampus(camp.id)}
                            className="text-slate-500 hover:text-red-400 p-1 text-xs flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Campus</span>
                          </button>
                        )}
                      </div>

                      {/* 📍 PREFERRED: GOOGLE MAPS LINK INPUT */}
                      <div className="p-3 rounded-xl bg-[#141414] border border-amber-500/30 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-rose-400" />
                            Google Maps Link / URL (Preferred)
                          </label>
                          {camp.googleMapsUrl && (
                            <a
                              href={camp.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 underline"
                            >
                              <span>Open in Google Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={camp.googleMapsUrl}
                            onChange={(e) => updateChurchCampus(camp.id, 'googleMapsUrl', e.target.value)}
                            placeholder="e.g. https://maps.app.goo.gl/... or https://maps.google.com/?q=..."
                            className="w-full bg-[#0a0a0a] border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Compass className="w-3 h-3 text-amber-400 shrink-0" />
                          Paste share link from Google Maps for 1-tap mobile navigation and live GPS directions.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Campus Name</label>
                          <input
                            type="text"
                            value={camp.campusName}
                            onChange={(e) => updateChurchCampus(camp.id, 'campusName', e.target.value)}
                            placeholder="e.g. Downtown Grace Sanctuary"
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Campus Type</label>
                          <select
                            value={camp.campusType}
                            onChange={(e) => updateChurchCampus(camp.id, 'campusType', e.target.value as any)}
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value="Main Sanctuary">Main Sanctuary / Cathedral</option>
                            <option value="Branch Sanctuary">Branch Sanctuary</option>
                            <option value="Youth Center">Youth & Student Center</option>
                            <option value="International Fellowship">International Fellowship</option>
                            <option value="Online Streaming Campus">Online Streaming Campus</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Resident Pastor / Leader</label>
                          <input
                            type="text"
                            value={camp.leadPastor}
                            onChange={(e) => updateChurchCampus(camp.id, 'leadPastor', e.target.value)}
                            placeholder="e.g. Pastor Mark Anthony"
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Street Address (Optional)</label>
                          <input
                            type="text"
                            value={camp.address}
                            onChange={(e) => updateChurchCampus(camp.id, 'address', e.target.value)}
                            placeholder="e.g. 777 Grace Boulevard, Suite 100"
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">City, State / Region</label>
                          <input
                            type="text"
                            value={`${camp.city}${camp.stateOrRegion ? `, ${camp.stateOrRegion}` : ''}`}
                            onChange={(e) => {
                              const parts = e.target.value.split(',');
                              updateChurchCampus(camp.id, 'city', parts[0]?.trim() || '');
                              if (parts[1]) updateChurchCampus(camp.id, 'stateOrRegion', parts[1]?.trim() || '');
                            }}
                            placeholder="e.g. Atlanta, GA"
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Country</label>
                          <input
                            type="text"
                            value={camp.country}
                            onChange={(e) => updateChurchCampus(camp.id, 'country', e.target.value)}
                            placeholder="e.g. United States"
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Worship Service Times</label>
                          <input
                            type="text"
                            value={camp.serviceTimes}
                            onChange={(e) => updateChurchCampus(camp.id, 'serviceTimes', e.target.value)}
                            placeholder="e.g. Sundays 9:00 AM & 11:30 AM EST"
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1">Contact Phone & Email</label>
                          <input
                            type="text"
                            value={camp.phone}
                            onChange={(e) => updateChurchCampus(camp.id, 'phone', e.target.value)}
                            placeholder="e.g. +1 (404) 555-7700"
                            className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BROADCAST RTMP KEYS */}
          {activePortalTab === 'broadcast' && (
            <div className="p-6 rounded-3xl bg-[#181818] border border-slate-800 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-red-400" />
                  Live Broadcasting Credentials & OBS Setup
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Connect OBS Studio, vMix, or YouTube Live stream encoder using your dedicated channel credentials.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">RTMP Server Ingest URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value="rtmp://live.gracetube.org/app/"
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
                      type="password"
                      readOnly
                      value={`gt_live_key_${selectedCategory.toLowerCase()}_${Date.now()}`}
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-300 focus:outline-none"
                    />
                    <button 
                      onClick={handleCopyStreamKey}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl flex items-center gap-1.5 shrink-0"
                    >
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Show Key</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRAYER WALL */}
          {activePortalTab === 'prayers' && (
            <div className="p-6 rounded-3xl bg-[#181818] border border-slate-800 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Heart className="w-4 h-4 text-blue-400" />
                    Congregational Prayer Wall & Intercession Hub
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Incoming prayer requests submitted by viewers during live services.
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold">
                  {prayerRequests.filter(p => p.status === 'Pending').length} Unprayed
                </span>
              </div>

              {/* Add Prayer Request Form */}
              <form onSubmit={handleAddInternalPrayer} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPrayerInput}
                  onChange={(e) => setNewPrayerInput(e.target.value)}
                  placeholder="Record an offline prayer request from church members..."
                  className="flex-1 bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Request</span>
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
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
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
              onClick={() => { setIsSubmitted(false); setCreatedStream(null); }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Register Another Channel Profile
            </button>

            <button
              onClick={handleFinishAndWatch}
              className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition"
            >
              <span>View Public Stream Player</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : (
        /* REGISTRATION FORM */
        <div className="space-y-6">
          {/* Step 1: Select Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Step 1: Select Your Registration Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'Church',
                  title: 'Church / Ministry',
                  subtitle: 'Live Services, Sermons & Campuses',
                  icon: Building2,
                  color: 'text-amber-400',
                  border: 'border-amber-500/40',
                  bg: 'bg-amber-950/20'
                },
                {
                  id: 'Artiste',
                  title: 'Gospel Artiste',
                  subtitle: 'Singles, Albums & Choir Releases',
                  icon: Music2,
                  color: 'text-red-400',
                  border: 'border-red-500/40',
                  bg: 'bg-red-950/20'
                },
                {
                  id: 'Creator',
                  title: 'Content Creator',
                  subtitle: 'Podcasts, Devotionals & Vlogs',
                  icon: Mic,
                  color: 'text-blue-400',
                  border: 'border-blue-500/40',
                  bg: 'bg-blue-950/20'
                },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as CreatorCategory)}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 relative ${
                      isSelected 
                        ? `${cat.border} ${cat.bg} ring-2 ring-amber-500/50 shadow-xl` 
                        : 'border-slate-800 bg-[#181818] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl bg-slate-900 ${cat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">Selected</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{cat.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cat.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Registration Form with Targeted Questions */}
          <form onSubmit={handleSubmit} className="bg-[#181818] border border-slate-800 rounded-3xl p-6 space-y-7 shadow-xl">
            
            {/* 1. Common Account Contact Information */}
            <div className="space-y-4 border-b border-slate-800 pb-5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">1. Account Contact & Verification</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Official Contact Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="pastor@church.org or manager@artist.com"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone / WhatsApp Contact *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (800) 123-4567"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 💳 MULTIPLE GIVING & PAYOUT ACCOUNTS */}
            <div className="space-y-4 border-b border-slate-800 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-amber-400" />
                    2. Giving & Payout Accounts (Multiple Payouts Support) *
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Add multiple accounts for isolated destinations: General Tithes, Building Fund, Missions, and Ministry Seed Offerings.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addPayoutAccount}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Payout Method</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {payoutAccounts.map((acc, idx) => (
                  <div 
                    key={acc.id} 
                    className={`p-4 rounded-2xl border space-y-3 relative transition ${
                      acc.isPrimary 
                        ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30' 
                        : 'bg-[#0f0f0f] border-slate-700/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          Account #{idx + 1}: {acc.label || 'Tithe/Giving Account'}
                        </span>
                        {acc.isPrimary ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                            PRIMARY DESTINATION
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPrimaryPayoutAccount(acc.id)}
                            className="text-[10px] text-slate-400 hover:text-amber-400 underline font-semibold"
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>

                      {payoutAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePayoutAccount(acc.id)}
                          className="text-slate-500 hover:text-red-400 p-1 text-xs flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Account Purpose / Label *</label>
                        <input
                          type="text"
                          required
                          value={acc.label}
                          onChange={(e) => updatePayoutAccount(acc.id, 'label', e.target.value)}
                          placeholder="e.g. Sunday Tithes or Building Fund"
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Payout Method Type *</label>
                        <select
                          value={acc.type}
                          onChange={(e) => updatePayoutAccount(acc.id, 'type', e.target.value as any)}
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                        >
                          <option value="Direct Bank Wire">Direct Bank Wire / ACH / IBAN</option>
                          <option value="Mobile Money (M-Pesa / MTN)">Mobile Money (M-Pesa / MTN / Airtel)</option>
                          <option value="Stripe Connect">Stripe Connect Account</option>
                          <option value="PayPal Business">PayPal Business Email</option>
                          <option value="Cash App / Zelle">Cash App / Zelle Tag</option>
                          <option value="Crypto Giving (USDC/USDT)">Crypto Giving (USDC / USDT)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Currency *</label>
                        <select
                          value={acc.currency}
                          onChange={(e) => updatePayoutAccount(acc.id, 'currency', e.target.value as any)}
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                        >
                          <option value="USD ($)">USD ($) - US Dollar</option>
                          <option value="GBP (£)">GBP (£) - British Pound</option>
                          <option value="EUR (€)">EUR (€) - Euro</option>
                          <option value="NGN (₦)">NGN (₦) - Nigerian Naira</option>
                          <option value="KES (KSh)">KES (KSh) - Kenyan Shilling</option>
                          <option value="GHS (GH₵)">GHS (GH₵) - Ghanaian Cedi</option>
                          <option value="ZAR (R)">ZAR (R) - South African Rand</option>
                          <option value="CAD ($)">CAD ($) - Canadian Dollar</option>
                          <option value="AUD ($)">AUD ($) - Australian Dollar</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Account Holder / Entity *</label>
                        <input
                          type="text"
                          required
                          value={acc.accountHolder}
                          onChange={(e) => updatePayoutAccount(acc.id, 'accountHolder', e.target.value)}
                          placeholder="e.g. Grace Fellowship Cathedral"
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Bank / Network Provider *</label>
                        <input
                          type="text"
                          required
                          value={acc.bankOrProvider}
                          onChange={(e) => updatePayoutAccount(acc.id, 'bankOrProvider', e.target.value)}
                          placeholder="e.g. Chase Bank / Safaricom M-Pesa"
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-300 mb-1">Account No / IBAN / Phone / Tag *</label>
                        <input
                          type="text"
                          required
                          value={acc.accountNumber}
                          onChange={(e) => updatePayoutAccount(acc.id, 'accountNumber', e.target.value)}
                          placeholder="e.g. 0123456789 or $GraceTithe"
                          className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 🌐 MULTIPLE SOCIAL MEDIA LINKS (Matching user image structure) */}
            <div className="space-y-4 border-b border-slate-800 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-amber-400" />
                    3. Social Links (Multiple Social Media Channels)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Connect your official handles across TikTok, Substack, Twitter/X, LinkedIn, Facebook, Instagram, Medium, YouTube, and Giving links.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addCustomSocialLink}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>
              </div>

              {/* Social Links List matching the screenshot structure */}
              <div className="space-y-2.5">
                {socialRows.map((row) => (
                  <div 
                    key={row.id} 
                    className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#0f0f0f] border border-slate-700/80 rounded-2xl p-1.5 sm:p-2 gap-2 shadow-sm hover:border-slate-600 transition"
                  >
                    {/* Left Icon & Domain Prefix Container */}
                    <div className="flex items-center gap-2.5 px-2 py-1 shrink-0">
                      {renderSocialIcon(row.platform)}
                      <span className="text-xs font-medium text-slate-300 font-mono select-none">
                        {row.prefix}
                      </span>
                    </div>

                    {/* Right Text Input for Username / Handle */}
                    <div className="flex-1 flex items-center min-w-0 pr-1">
                      <input
                        type="text"
                        value={row.username}
                        onChange={(e) => updateSocialUsername(row.id, e.target.value)}
                        placeholder={row.placeholder}
                        className="w-full bg-transparent px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none font-medium"
                      />
                      {row.suffix && (
                        <span className="text-xs text-slate-400 font-mono pr-2 select-none">
                          {row.suffix}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 px-1 shrink-0 self-end sm:self-center">
                      {row.username && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`${row.prefix}${row.username}${row.suffix || ''}`, row.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 transition"
                          title="Copy Full URL"
                        >
                          {copiedLink === row.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      {socialRows.length > 4 && (
                        <button
                          type="button"
                          onClick={() => removeSocialLink(row.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition"
                          title="Remove Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. ⛪ MULTIPLE CHURCH LOCATIONS & CAMPUSES (OPTIONAL & GOOGLE MAPS FOCUSED) */}
            {selectedCategory === 'Church' && (
              <div className="space-y-4 border-b border-slate-800 pb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-amber-400" />
                          4. Church Locations & Google Maps Links
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          Optional
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Physical locations are optional. Prefer Google Maps links so worshippers can get 1-tap live GPS directions, satellite view, and parking instructions.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enableCampuses}
                          onChange={(e) => setEnableCampuses(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                        <span className="ml-2 text-xs font-bold text-slate-300 select-none">
                          {enableCampuses ? 'Locations Enabled' : 'Disabled (Online Only)'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {!enableCampuses && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>
                        Locations disabled. Your channel will be registered as a global online broadcast ministry without physical branch requirements.
                      </span>
                    </div>
                  )}
                </div>

                {enableCampuses && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">
                        {churchCampuses.length} Campus Location(s) Configured
                      </span>

                      <button
                        type="button"
                        onClick={addChurchCampus}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Another Location / Google Maps Link</span>
                      </button>
                    </div>

                    {churchCampuses.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-[#0f0f0f] border border-dashed border-slate-800 text-center space-y-2">
                        <MapPin className="w-8 h-8 text-amber-400/60 mx-auto" />
                        <p className="text-xs text-slate-400">No locations added yet.</p>
                        <button
                          type="button"
                          onClick={addChurchCampus}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Campus Location</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {churchCampuses.map((camp, idx) => (
                          <div 
                            key={camp.id} 
                            className={`p-4 rounded-2xl border space-y-3.5 relative transition ${
                              camp.isMain 
                                ? 'bg-amber-950/20 border-amber-500/50 ring-1 ring-amber-500/30' 
                                : 'bg-[#0f0f0f] border-slate-700/80'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold text-white">
                                  Campus #{idx + 1}: {camp.campusName || 'Worship Campus'}
                                </span>
                                {camp.isMain ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                    MAIN HEADQUARTERS
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setMainCampus(camp.id)}
                                    className="text-[10px] text-slate-400 hover:text-amber-400 underline font-semibold"
                                  >
                                    Set as Main Campus
                                  </button>
                                )}
                              </div>

                              {churchCampuses.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeChurchCampus(camp.id)}
                                  className="text-slate-500 hover:text-red-400 p-1 text-xs flex items-center gap-1 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove Campus</span>
                                </button>
                              )}
                            </div>

                            {/* 📍 PREFERRED: GOOGLE MAPS LINK INPUT */}
                            <div className="p-3.5 rounded-2xl bg-[#141414] border border-amber-500/40 space-y-1.5 shadow-inner">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                                  <Navigation className="w-3.5 h-3.5 text-rose-400" />
                                  Google Maps Link / URL (Preferred)
                                </label>
                                {camp.googleMapsUrl && (
                                  <a
                                    href={camp.googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 underline"
                                  >
                                    <span>Open in Google Maps</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                              <input
                                type="url"
                                value={camp.googleMapsUrl}
                                onChange={(e) => updateChurchCampus(camp.id, 'googleMapsUrl', e.target.value)}
                                placeholder="Paste Google Maps share link (e.g. https://maps.app.goo.gl/... or https://maps.google.com/?q=...)"
                                className="w-full bg-[#0a0a0a] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 font-mono shadow-inner"
                              />
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Compass className="w-3 h-3 text-amber-400 shrink-0" />
                                Preferred: pasting your Google Maps link automatically powers 1-tap navigation and directions for visitors.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-300 mb-1">Campus Name</label>
                                <input
                                  type="text"
                                  value={camp.campusName}
                                  onChange={(e) => updateChurchCampus(camp.id, 'campusName', e.target.value)}
                                  placeholder="e.g. Downtown Grace Sanctuary"
                                  className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-300 mb-1">Campus Type</label>
                                <select
                                  value={camp.campusType}
                                  onChange={(e) => updateChurchCampus(camp.id, 'campusType', e.target.value as any)}
                                  className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                                >
                                  <option value="Main Sanctuary">Main Sanctuary / Cathedral</option>
                                  <option value="Branch Sanctuary">Branch Sanctuary</option>
                                  <option value="Youth Center">Youth & Student Center</option>
                                  <option value="International Fellowship">International Fellowship</option>
                                  <option value="Online Streaming Campus">Online Streaming Campus</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-300 mb-1">Resident Pastor / Leader (Optional)</label>
                                <input
                                  type="text"
                                  value={camp.leadPastor}
                                  onChange={(e) => updateChurchCampus(camp.id, 'leadPastor', e.target.value)}
                                  placeholder="e.g. Pastor Mark Anthony"
                                  className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-300 mb-1">Street Address (Optional)</label>
                                <input
                                  type="text"
                                  value={camp.address}
                                  onChange={(e) => updateChurchCampus(camp.id, 'address', e.target.value)}
                                  placeholder="e.g. 777 Grace Boulevard, Suite 100"
                                  className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-300 mb-1">City & State (Optional)</label>
                                <input
                                  type="text"
                                  value={camp.city}
                                  onChange={(e) => updateChurchCampus(camp.id, 'city', e.target.value)}
                                  placeholder="e.g. Atlanta, GA"
                                  className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-300 mb-1">Country (Optional)</label>
                                <input
                                  type="text"
                                  value={camp.country}
                                  onChange={(e) => updateChurchCampus(camp.id, 'country', e.target.value)}
                                  placeholder="e.g. United States"
                                  className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-300 mb-1">Worship Service Times (Optional)</label>
                                <input
                                  type="text"
                                  value={camp.serviceTimes}
                                  onChange={(e) => updateChurchCampus(camp.id, 'serviceTimes', e.target.value)}
                                  placeholder="e.g. Sundays 9:00 AM & 11:30 AM EST"
                                  className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-300 mb-1">Campus Phone & Email (Optional)</label>
                                <input
                                  type="text"
                                  value={camp.phone}
                                  onChange={(e) => updateChurchCampus(camp.id, 'phone', e.target.value)}
                                  placeholder="e.g. +1 (404) 555-7700"
                                  className="w-full bg-[#181818] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 5. Category-Specific Initial Service / Content Setup */}
            {selectedCategory === 'Church' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    5. Church Service Details & Stream Setup
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Church / Ministry Name *</label>
                    <input
                      type="text"
                      required
                      value={churchName}
                      onChange={(e) => setChurchName(e.target.value)}
                      placeholder="e.g. Grace Fellowship Cathedral"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Senior Pastor / Lead Preacher *</label>
                    <input
                      type="text"
                      required
                      value={pastorName}
                      onChange={(e) => setPastorName(e.target.value)}
                      placeholder="e.g. Rev. Dr. David Lawson"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Service / Sermon Title *</label>
                    <input
                      type="text"
                      required
                      value={sermonTitle}
                      onChange={(e) => setSermonTitle(e.target.value)}
                      placeholder="e.g. Walking in Divine Victory and Grace"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">RTMP / Stream URL / YouTube Live *</label>
                    <input
                      type="url"
                      required
                      value={churchStreamUrl}
                      onChange={(e) => setChurchStreamUrl(e.target.value)}
                      placeholder="https://youtube.com/live/... or RTMP stream"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono text-amber-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Anchor Scripture & Notes</label>
                  <input
                    type="text"
                    value={churchScripture}
                    onChange={(e) => setChurchScripture(e.target.value)}
                    placeholder="e.g. Ephesians 2:8-10"
                    className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {selectedCategory === 'Artiste' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Music2 className="w-4 h-4 text-red-400" />
                    5. Gospel Artiste & Track Release Setup
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Artiste or Group Name *</label>
                    <input
                      type="text"
                      required
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      placeholder="e.g. Grace & Victory Collective"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Record Label / Ministry</label>
                    <input
                      type="text"
                      value={recordLabel}
                      onChange={(e) => setRecordLabel(e.target.value)}
                      placeholder="e.g. Independent or Kingdom Sound"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Single / Track Title *</label>
                    <input
                      type="text"
                      required
                      value={trackTitle}
                      onChange={(e) => setTrackTitle(e.target.value)}
                      placeholder="e.g. Oceans of Unfailing Mercy"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Audio / Video Stream URL *</label>
                    <input
                      type="url"
                      required
                      value={musicMediaUrl}
                      onChange={(e) => setMusicMediaUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono text-amber-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedCategory === 'Creator' && (
              <div className="space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Mic className="w-4 h-4 text-blue-400" />
                    5. Creator & Podcast Episode Setup
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Channel / Host Name *</label>
                    <input
                      type="text"
                      required
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      placeholder="e.g. Kingdom Today Faith Pod"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Episode Title *</label>
                    <input
                      type="text"
                      required
                      value={episodeTitle}
                      onChange={(e) => setEpisodeTitle(e.target.value)}
                      placeholder="e.g. Overcoming Anxiety Through Scripture"
                      className="w-full bg-[#0f0f0f] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Submit Bar */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>I confirm this ministry registration aligns with GraceTube Community Guidelines and faith-centered broadcast standards.</span>
              </label>

              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-slate-400">
                  Configuring {payoutAccounts.length} payout account(s), {socialRows.filter(s => s.username).length} social link(s){selectedCategory === 'Church' ? ` & ${churchCampuses.length} campus location(s)` : ''}.
                </span>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Register & Activate {selectedCategory} Studio</span>
                </button>
              </div>
            </div>

          </form>

        </div>
      )}
    </div>
  );
}

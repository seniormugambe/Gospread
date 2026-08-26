import React, { useState } from 'react';
import { 
  Globe, 
  Youtube, 
  Instagram, 
  Facebook, 
  Twitter, 
  Send, 
  PhoneCall, 
  Music2, 
  Radio, 
  Podcast, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles,
  Share2,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { SocialLink, CHURCH_SOCIALS } from '../data/gospelData';

interface SocialMediaLinksBarProps {
  churchOrChannelName: string;
  customSocials?: SocialLink[];
  variant?: 'compact' | 'expanded' | 'grid' | 'pills';
  className?: string;
}

export default function SocialMediaLinksBar({
  churchOrChannelName,
  customSocials,
  variant = 'expanded',
  className = ''
}: SocialMediaLinksBarProps) {
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);

  // Retrieve socials for the given church or fallback to default array
  const links: SocialLink[] = customSocials || CHURCH_SOCIALS[churchOrChannelName] || [
    { platform: 'youtube', label: 'YouTube Broadcast', url: 'https://youtube.com', handle: `@${churchOrChannelName.replace(/\s+/g, '')}`, followers: '450K Subs', isPrimary: true },
    { platform: 'instagram', label: 'Instagram Feed', url: 'https://instagram.com', handle: `@${churchOrChannelName.toLowerCase().replace(/\s+/g, '')}`, followers: '180K Followers', isPrimary: true },
    { platform: 'facebook', label: 'Facebook Page', url: 'https://facebook.com', handle: churchOrChannelName, followers: '290K Likes', isPrimary: true },
    { platform: 'telegram', label: 'Telegram Prayer Line', url: 'https://t.me', handle: 'GlobalPrayerAltar', followers: '35K Intercessors' },
    { platform: 'whatsapp', label: 'WhatsApp Intercession', url: 'https://wa.me/18005557700', handle: '+1 (800) 555-7700', followers: '24/7 Response' },
    { platform: 'website', label: 'Official Portal', url: 'https://www.gospread.tv', handle: 'gospread.tv', isPrimary: true }
  ];

  const copyHandle = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(handle);
    setCopiedHandle(handle);
    setTimeout(() => setCopiedHandle(null), 2000);
  };

  const getPlatformMeta = (platform: SocialLink['platform']) => {
    switch (platform) {
      case 'youtube':
        return {
          icon: Youtube,
          bgClass: 'bg-red-600/15 border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white',
          pillBg: 'bg-red-600 text-white',
          brandColor: '#FF0000',
          name: 'YouTube'
        };
      case 'instagram':
        return {
          icon: Instagram,
          bgClass: 'bg-pink-600/15 border-pink-500/30 text-pink-400 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white',
          pillBg: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white',
          brandColor: '#E1306C',
          name: 'Instagram'
        };
      case 'facebook':
        return {
          icon: Facebook,
          bgClass: 'bg-blue-600/15 border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white',
          pillBg: 'bg-blue-600 text-white',
          brandColor: '#1877F2',
          name: 'Facebook'
        };
      case 'twitter':
        return {
          icon: Twitter,
          bgClass: 'bg-sky-500/15 border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-white',
          pillBg: 'bg-sky-500 text-white',
          brandColor: '#1DA1F2',
          name: 'X (Twitter)'
        };
      case 'tiktok':
        return {
          icon: Music2,
          bgClass: 'bg-fuchsia-600/15 border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-600 hover:text-white',
          pillBg: 'bg-fuchsia-600 text-white',
          brandColor: '#EE1D52',
          name: 'TikTok'
        };
      case 'spotify':
        return {
          icon: Radio,
          bgClass: 'bg-emerald-600/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white',
          pillBg: 'bg-emerald-600 text-white',
          brandColor: '#1DB954',
          name: 'Spotify'
        };
      case 'applepodcasts':
        return {
          icon: Podcast,
          bgClass: 'bg-purple-600/15 border-purple-500/30 text-purple-400 hover:bg-purple-600 hover:text-white',
          pillBg: 'bg-purple-600 text-white',
          brandColor: '#872EC4',
          name: 'Apple Podcasts'
        };
      case 'telegram':
        return {
          icon: Send,
          bgClass: 'bg-sky-600/15 border-sky-500/30 text-sky-300 hover:bg-sky-500 hover:text-white',
          pillBg: 'bg-sky-500 text-white',
          brandColor: '#229ED9',
          name: 'Telegram'
        };
      case 'whatsapp':
        return {
          icon: PhoneCall,
          bgClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500 hover:text-white',
          pillBg: 'bg-emerald-500 text-white',
          brandColor: '#25D366',
          name: 'WhatsApp'
        };
      case 'website':
      default:
        return {
          icon: Globe,
          bgClass: 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-slate-950',
          pillBg: 'bg-amber-500 text-slate-950 font-bold',
          brandColor: '#F59E0B',
          name: 'Website'
        };
    }
  };

  // Compact Pill Row (for headers and top profile bars)
  if (variant === 'compact' || variant === 'pills') {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {links.map((link) => {
          const meta = getPlatformMeta(link.platform);
          const Icon = meta.icon;

          return (
            <motion.a
              key={`${link.platform}-${link.url}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md transition shadow-sm ${meta.bgClass}`}
              title={`${meta.name}: ${link.handle} ${link.followers ? `(${link.followers})` : ''}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[110px]">{link.label || meta.name}</span>
            </motion.a>
          );
        })}
      </div>
    );
  }

  // Expanded Grid Layout (for Profile Modal & Dedicated Social Connect Drawer)
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-pink-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Official Social Media & Ministry Channels
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-medium bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
          {links.length} Connected Accounts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {links.map((link) => {
          const meta = getPlatformMeta(link.platform);
          const Icon = meta.icon;
          const isCopied = copiedHandle === link.handle;

          return (
            <motion.div
              key={`${link.platform}-${link.url}`}
              whileHover={{ y: -2, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group relative flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/40 transition shadow-md backdrop-blur-md overflow-hidden"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2.5 rounded-xl ${meta.pillBg} shadow-sm shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-pink-300 transition truncate">
                      {link.label}
                    </span>
                    {link.isPrimary && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        OFFICIAL
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="font-mono text-slate-300 truncate">{link.handle}</span>
                    {link.followers && (
                      <span className="flex items-center gap-0.5 text-pink-400 font-bold shrink-0">
                        <Users className="w-2.5 h-2.5" />
                        {link.followers}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons: Copy Handle & Direct Launch */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <button
                  onClick={(e) => copyHandle(link.handle, e)}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="Copy channel handle"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-1.5 rounded-lg border transition ${meta.bgClass}`}
                  title={`Open ${meta.name}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import gospreadLogoImg from '../assets/images/gospread_logo_1788335418034.jpg';

export interface GospreadLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  badgeVariant?: 'live' | 'global' | 'gold' | 'tv';
  className?: string;
  onClick?: () => void;
}

export const GospreadLogo: React.FC<GospreadLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = true,
  badgeText = 'Live',
  badgeVariant = 'live',
  className = '',
  onClick,
}) => {
  const sizeMap = {
    xs: { icon: 'w-6 h-6 rounded-lg', text: 'text-sm', badge: 'text-[8px] px-1 py-0.2' },
    sm: { icon: 'w-7 h-7 rounded-xl', text: 'text-base', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { icon: 'w-8 h-8 rounded-xl', text: 'text-lg', badge: 'text-[9px] px-1.5 py-0.5' },
    lg: { icon: 'w-11 h-11 rounded-2xl', text: 'text-xl', badge: 'text-[10px] px-2 py-0.5' },
    xl: { icon: 'w-14 h-14 rounded-2xl', text: 'text-2xl', badge: 'text-[11px] px-2 py-0.5' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const badgeStyles = {
    live: 'bg-red-600 text-white font-black animate-pulse shadow-sm shadow-red-600/30',
    global: 'bg-amber-500 text-slate-950 font-black tracking-wider uppercase',
    gold: 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black uppercase',
    tv: 'bg-sky-500 text-slate-950 font-black tracking-wider uppercase',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center space-x-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Brand Icon Mark */}
      <div className="relative shrink-0">
        <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-500 via-red-500 to-amber-300 rounded-2xl opacity-75 blur-xs group-hover:opacity-100 transition duration-300" />
        <div className={`relative ${currentSize.icon} overflow-hidden bg-slate-950 border border-amber-500/40 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300`}>
          <img
            src={gospreadLogoImg}
            alt="Gospread Logo"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover scale-105"
          />
        </div>
      </div>

      {/* Typography Brand Name */}
      {showText && (
        <div className="flex items-center gap-1.5 font-serif">
          <span className={`font-black ${currentSize.text} tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent group-hover:from-amber-200 group-hover:to-white transition-all`}>
            Gospread
          </span>
          {showBadge && (
            <span
              className={`font-sans font-extrabold ${currentSize.badge} rounded tracking-wider uppercase ${badgeStyles[badgeVariant]}`}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default GospreadLogo;

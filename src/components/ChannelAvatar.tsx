import React, { useEffect, useState } from 'react';

interface ChannelAvatarProps {
  src?: string;
  name: string;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export default function ChannelAvatar({ src, name, className = '', onClick, title }: ChannelAvatarProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || '?';
    return (
      <div
        onClick={onClick}
        title={title}
        className={`${className} bg-amber-500/20 text-amber-300 font-black text-sm flex items-center justify-center`}
      >
        {initials}
      </div>
    );
  }
  return <img src={src} alt={name} onClick={onClick} title={title} onError={() => setFailed(true)} className={className} />;
}

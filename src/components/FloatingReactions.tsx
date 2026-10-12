import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

const REACTIONS = ['🙌', '🔥', '❤️', '🙏'];

interface Burst {
  id: number;
  emoji: string;
  x: number;
}

export default function FloatingReactions() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  const fire = (emoji: string) => {
    const id = Date.now() + Math.random();
    const x = Math.round((Math.random() - 0.5) * 50);
    setBursts((b) => [...b.slice(-14), { id, emoji, x }]);
    window.setTimeout(() => setBursts((b) => b.filter((item) => item.id !== id)), 1800);
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur">
      <span className="pl-2 pr-1 text-[10px] font-black uppercase tracking-widest text-slate-400">React</span>
      {REACTIONS.map((emoji) => (
        <div key={emoji} className="relative">
          <motion.button
            type="button"
            whileHover={{ scale: 1.25, rotate: -6 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => fire(emoji)}
            aria-label={`React with ${emoji}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg transition hover:bg-amber-400/30"
          >
            {emoji}
          </motion.button>
          <AnimatePresence>
            {bursts
              .filter((b) => b.emoji === emoji)
              .map((b) => (
                <motion.span
                  key={b.id}
                  initial={{ opacity: 1, y: 0, x: 0, scale: 0.6 }}
                  animate={{ opacity: 0, y: -90, x: b.x, scale: 1.6 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.6, ease: 'easeOut' }}
                  className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 text-2xl"
                >
                  {b.emoji}
                </motion.span>
              ))}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

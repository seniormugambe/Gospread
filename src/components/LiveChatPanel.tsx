import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  Heart, 
  Flame, 
  Smile, 
  Crown, 
  ShieldCheck, 
  User, 
  Filter,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, ReactionType, VideoStream } from '../data/gospelData';
import { GivingTarget } from './GivingModal';

interface LiveChatPanelProps {
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onToggleReaction: (messageId: string, reactionType: ReactionType) => void;
  onOpenGiving: (target?: GivingTarget) => void;
  activeVideo: VideoStream;
  className?: string;
}

export const REACTION_CONFIG: Record<ReactionType, { emoji: string; label: string; activeColor: string; activeBg: string; activeBorder: string }> = {
  amen: {
    emoji: '🙌',
    label: 'Amen',
    activeColor: 'text-amber-300',
    activeBg: 'bg-amber-500/20',
    activeBorder: 'border-amber-500/50'
  },
  fire: {
    emoji: '🔥',
    label: 'Fire',
    activeColor: 'text-orange-400',
    activeBg: 'bg-orange-500/20',
    activeBorder: 'border-orange-500/50'
  },
  heart: {
    emoji: '❤️',
    label: 'Heart',
    activeColor: 'text-rose-400',
    activeBg: 'bg-rose-500/20',
    activeBorder: 'border-rose-500/50'
  },
  pray: {
    emoji: '🙏',
    label: 'Praying Hands',
    activeColor: 'text-sky-300',
    activeBg: 'bg-sky-500/20',
    activeBorder: 'border-sky-500/50'
  }
};

export default function LiveChatPanel({
  chatMessages,
  onSendMessage,
  onToggleReaction,
  onOpenGiving,
  activeVideo,
  className = ''
}: LiveChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'prayers' | 'top'>('all');
  const [showEmojiQuickBar, setShowEmojiQuickBar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleQuickAppendEmoji = (emoji: string) => {
    setInputText((prev) => prev + ' ' + emoji);
  };

  // Filter messages based on tab
  const filteredMessages = chatMessages.filter((msg) => {
    if (filterMode === 'prayers') return msg.isPrayer || msg.text.toLowerCase().includes('pray');
    if (filterMode === 'top') return msg.reactionCount > 10;
    return true;
  });

  return (
    <div className={`bg-[#181818] rounded-2xl border border-slate-800 flex flex-col h-[420px] overflow-hidden shadow-2xl ${className}`}>
      {/* Header Bar */}
      <div className="p-2.5 border-b border-slate-800 flex items-center justify-between bg-[#0f0f0f] shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Live Stream Chat
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
            {chatMessages.length}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-1.5 py-0.5 rounded ${filterMode === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('prayers')}
              className={`px-1.5 py-0.5 rounded ${filterMode === 'prayers' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Prayers
            </button>
            <button
              onClick={() => setFilterMode('top')}
              className={`px-1.5 py-0.5 rounded ${filterMode === 'top' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Top 🔥
            </button>
          </div>

          <button
            onClick={() => onOpenGiving({
              id: `super-amen-${activeVideo.id}`,
              name: activeVideo.churchOrMinistry,
              avatar: activeVideo.channelAvatar,
              type: 'church',
              categoryTitle: 'Super Amen Live Chat Praise Token'
            })}
            className="px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:brightness-110 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition shadow-md shrink-0"
            title="Send Super Amen Paid Highlight Chat"
          >
            <Sparkles className="w-3 h-3 text-slate-950" />
            <span>Super Amen</span>
          </button>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs">
            <MessageSquare className="w-8 h-8 text-slate-600 mb-1" />
            <p>No messages match this filter.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const hasUserReactedAny = msg.userReactions && msg.userReactions.length > 0;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2.5 rounded-2xl border transition ${
                  msg.isPrayer 
                    ? 'bg-purple-950/20 border-purple-800/40' 
                    : msg.user.includes('Super Amen')
                    ? 'bg-amber-950/30 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* User Info Bar */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-white flex items-center gap-1">
                      {msg.user}
                    </span>

                    {msg.badge === 'VIP' && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5 text-amber-400" /> VIP
                      </span>
                    )}

                    {msg.badge === 'Moderator' && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> MOD
                      </span>
                    )}

                    {msg.badge === 'Member' && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        MEMBER
                      </span>
                    )}

                    {msg.isPrayer && (
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Prayer Request
                      </span>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-500 font-mono shrink-0">{msg.time}</span>
                </div>

                {/* Message Text */}
                <p className="text-xs text-slate-200 leading-snug break-words">
                  {msg.text}
                </p>

                {/* Reactions Toggle Bar */}
                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 flex-wrap">
                  {/* Reaction Count Badge */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <span className="font-bold text-slate-300">{msg.reactionCount}</span>
                    <span className="text-[10px]">{msg.reactionCount === 1 ? 'reaction' : 'reactions'}</span>
                  </div>

                  {/* Interactive Emoji Reaction Toggles */}
                  <div className="flex items-center gap-1">
                    {(['amen', 'fire', 'heart', 'pray'] as ReactionType[]).map((rType) => {
                      const cfg = REACTION_CONFIG[rType];
                      const isToggled = msg.userReactions?.includes(rType);
                      const countForType = msg.reactions?.[rType] || 0;

                      return (
                        <motion.button
                          key={rType}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onToggleReaction(msg.id, rType)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition flex items-center gap-1 ${
                            isToggled
                              ? `${cfg.activeBg} ${cfg.activeColor} ${cfg.activeBorder} shadow-sm`
                              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 border-slate-700/60'
                          }`}
                          title={`Toggle ${cfg.label} reaction (${countForType})`}
                        >
                          <span>{cfg.emoji}</span>
                          {countForType > 0 && (
                            <span className={`text-[9px] font-mono ${isToggled ? cfg.activeColor : 'text-slate-400'}`}>
                              {countForType}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Toolbar */}
      {showEmojiQuickBar && (
        <div className="p-2 bg-[#0f0f0f] border-t border-slate-800/80 flex items-center justify-around gap-1 shrink-0 animate-in fade-in duration-200">
          {(['🙌', '🔥', '❤️', '🙏', '🕊️', '✨', '✝️', '👑'] as string[]).map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleQuickAppendEmoji(emoji)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-sm transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-slate-800 bg-[#0f0f0f] flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => setShowEmojiQuickBar(!showEmojiQuickBar)}
          className={`p-1.5 rounded-xl border transition ${
            showEmojiQuickBar ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Toggle quick emoji picker"
        >
          <Smile className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a praise or prayer message..."
          className="flex-1 bg-[#181818] text-xs text-white placeholder-slate-500 px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500/60"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 text-white font-bold transition shadow-md"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

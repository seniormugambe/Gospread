import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoStream, AudioTrack } from '../data/gospelData';
import { GivingTarget } from './GivingModal';
import MinistryDigitalHome from './MinistryDigitalHome';

interface ChannelProfileModalProps {
  channelName: string;
  channelAvatar: string;
  followerCount: number;
  isFollowed: boolean;
  bellSetting: 'all' | 'personalized' | 'none';
  isJoined?: boolean;
  memberCount?: number;
  onToggleJoinChurch?: (channelName: string) => void;
  onToggleFollow: (channelName: string) => void;
  onChangeBellSetting: (channelName: string, setting: 'all' | 'personalized' | 'none') => void;
  onOpenGivingModal?: (target: GivingTarget) => void;
  onClose: () => void;
  onSelectVideo: (video: VideoStream) => void;
  onPlayAudioTrack: (track: AudioTrack) => void;
  allVideos: VideoStream[];
  allAudio: AudioTrack[];
}

export default function ChannelProfileModal({
  channelName,
  channelAvatar,
  followerCount,
  isFollowed,
  bellSetting,
  isJoined = false,
  memberCount = 0,
  onToggleJoinChurch,
  onToggleFollow,
  onChangeBellSetting,
  onOpenGivingModal,
  onClose,
  onSelectVideo,
  onPlayAudioTrack,
  allVideos,
  allAudio
}: ChannelProfileModalProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-slate-950 border border-slate-800 rounded-3xl max-w-6xl w-full max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 shadow-2xl relative my-auto p-3 sm:p-5"
        >
          <MinistryDigitalHome
            ministryName={channelName}
            avatar={channelAvatar}
            followerCount={followerCount}
            isFollowed={isFollowed}
            bellSetting={bellSetting}
            isJoined={isJoined}
            memberCount={memberCount}
            onToggleJoinChurch={onToggleJoinChurch}
            onToggleFollow={onToggleFollow}
            onChangeBellSetting={onChangeBellSetting}
            onOpenGivingModal={onOpenGivingModal}
            onClose={onClose}
            onSelectVideo={onSelectVideo}
            onPlayAudioTrack={onPlayAudioTrack}
            allVideos={allVideos}
            allAudio={allAudio}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

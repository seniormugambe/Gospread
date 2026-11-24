import { createContext, useContext } from 'react';
import type { Dispatch } from 'react';
import type { LiveBroadcastType, UploadStep } from './CreatePage';
import type { IvsBroadcastCredentials } from '../services/ivsBroadcast';
import type { VideoExtractedFrame } from '../utils/extractVideoFrames';

export type StudioNavigation = {
  studioNavTab: 'overview' | 'dashboard' | 'content' | 'live_hub' | 'schedule_hub' | 'analytics' | 'community' | 'giving' | 'settings';
  contentSubTab: 'videos' | 'shorts' | 'drafts' | 'scheduled';
  liveSubTab: 'go_live' | 'streams' | 'recordings';
  communitySubTab: 'comments' | 'prayers' | 'chat';
};

export type StudioNavigationAction =
  | { type: 'set-tab'; value: StudioNavigation['studioNavTab'] }
  | { type: 'set-content-subtab'; value: StudioNavigation['contentSubTab'] }
  | { type: 'set-live-subtab'; value: StudioNavigation['liveSubTab'] }
  | { type: 'set-community-subtab'; value: StudioNavigation['communitySubTab'] };

export const initialStudioNavigation: StudioNavigation = {
  studioNavTab: 'overview',
  contentSubTab: 'videos',
  liveSubTab: 'go_live',
  communitySubTab: 'comments',
};

export function studioNavigationReducer(
  state: StudioNavigation,
  action: StudioNavigationAction,
): StudioNavigation {
  switch (action.type) {
    case 'set-tab':
      return { ...state, studioNavTab: action.value };
    case 'set-content-subtab':
      return { ...state, contentSubTab: action.value };
    case 'set-live-subtab':
      return { ...state, liveSubTab: action.value };
    case 'set-community-subtab':
      return { ...state, communitySubTab: action.value };
  }
}

export const StudioNavigationContext = createContext<{
  state: StudioNavigation;
  dispatch: Dispatch<StudioNavigationAction>;
} | null>(null);

export function useStudioNavigation() {
  const context = useContext(StudioNavigationContext);
  if (!context) throw new Error('Studio navigation must be used within its provider.');
  return context;
}

export interface UploadWorkflowState {
  uploadStep: UploadStep;
  selectedFile: { name: string; sizeFormatted: string; sizeBytes: number; type: string } | null;
  selectedMediaFile: File | null;
  isDragging: boolean;
  uploadProgressPercent: number;
  uploadedBytes: number;
  totalBytes: number;
  uploadSpeed: string;
  isRealUploadInProgress: boolean;
  extractedFrames: VideoExtractedFrame[];
  isExtractingFrames: boolean;
  frameExtractError: string | null;
  uploadTitle: string;
  uploadDescription: string;
  uploadSpeaker: string;
  uploadMinistry: string;
  uploadCategory: 'Sermons' | 'Worship & Praise' | 'Bible Study' | 'Gospel Music' | 'Youth & Family' | 'Healing & Miracles';
  tagsInput: string;
  uploadScripture: string;
  keyTakeaways: string[];
  newTakeawayInput: string;
  uploadThumbnail: string;
  thumbnailMode: 'ai' | 'frames' | 'upload';
  selectedFrameIndex: number;
  selectedAiPresetId: string;
  aiOverlayTitle: string;
  aiOverlaySpeaker: string;
  aiOverlayMinistry: string;
  aiOverlayVerse: string;
  isAiGenerating: boolean;
  aiAppliedSuccess: boolean;
  customThumbnailInput: string;
  videoVisibility: 'public' | 'private' | 'unlisted';
  audienceKidsOption: 'all_ages' | 'made_for_kids';
  isFaithPolicyConfirmed: boolean;
  isCopyrightConfirmed: boolean;
  publishActionOption: 'publish_now' | 'schedule' | 'save_draft';
  publishScheduledDate: string;
  publishScheduledTime: string;
  publishScheduledTimezone: string;
  publishNotifyFollowers: boolean;
}

export function createInitialUploadWorkflowState(
  ownerName: string,
  ministryName: string,
): UploadWorkflowState {
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 4);
  return {
    uploadStep: 'select',
    selectedFile: null,
    selectedMediaFile: null,
    isDragging: false,
    uploadProgressPercent: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    uploadSpeed: '',
    isRealUploadInProgress: false,
    extractedFrames: [],
    isExtractingFrames: false,
    frameExtractError: null,
    uploadTitle: '',
    uploadDescription: '',
    uploadSpeaker: ownerName,
    uploadMinistry: ministryName,
    uploadCategory: 'Sermons',
    tagsInput: '',
    uploadScripture: '',
    keyTakeaways: [],
    newTakeawayInput: '',
    uploadThumbnail: '',
    thumbnailMode: 'ai',
    selectedFrameIndex: 0,
    selectedAiPresetId: 'cathedral_gold',
    aiOverlayTitle: '',
    aiOverlaySpeaker: ownerName,
    aiOverlayMinistry: ministryName,
    aiOverlayVerse: '',
    isAiGenerating: false,
    aiAppliedSuccess: false,
    customThumbnailInput: '',
    videoVisibility: 'public',
    audienceKidsOption: 'all_ages',
    isFaithPolicyConfirmed: false,
    isCopyrightConfirmed: false,
    publishActionOption: 'publish_now',
    publishScheduledDate: scheduledDate.toISOString().split('T')[0],
    publishScheduledTime: '10:00',
    publishScheduledTimezone: 'Africa/Kampala (EAT - UTC+3)',
    publishNotifyFollowers: true,
  };
}

export interface StateUpdateAction<State extends object> {
  type: 'set';
  key: keyof State;
  value: State[keyof State];
}

export function stateUpdateReducer<State extends object>(
  state: State,
  action: StateUpdateAction<State>,
): State {
  return Object.assign({}, state, { [action.key]: action.value });
}

export function createStateSetter<State extends object>() {
  return function <K extends keyof State>(
    dispatch: Dispatch<StateUpdateAction<State>>,
    key: K,
  ): (value: State[K]) => void {
    return value => dispatch({ type: 'set', key, value });
  };
}

export interface BroadcastWorkflowState {
  liveSetupStep: 'setup' | 'credentials';
  liveMode: 'quick' | 'studio';
  activeLiveStreamId: string | null;
  ivsBroadcastCredentials: IvsBroadcastCredentials | null;
  livePublishError: string;
  isPublishingLive: boolean;
  broadcastType: LiveBroadcastType;
  liveTitle: string;
  liveDescription: string;
  liveCategory: string;
  liveSpeaker: string;
  liveScripture: string;
  rtmpServerUrl: string;
  liveStreamKey: string;
  showStreamKey: boolean;
  copiedServer: boolean;
  copiedStreamKey: boolean;
  isGeneratingCredentials: boolean;
  cameraPreviewStream: MediaStream | null;
  cameraPreviewError: string;
  activeEncoderTab: 'obs' | 'streamlabs' | 'vmix' | 'wirecast' | 'hardware';
  isLiveSignalDetected: boolean;
  enableLiveChat: boolean;
  enablePrayerAltar: boolean;
  enableGivingOverlay: boolean;
  scheduleTitle: string;
  scheduleSpeaker: string;
  scheduleDate: string;
  scheduleTime: string;
  scheduleTimezone: string;
  scheduleType: 'Live Broadcast Premiere' | 'Prerecorded Video Premiere' | 'Prayer Summit';
  scheduleScripture: string;
  scheduleDescription: string;
  notifySubscribers: boolean;
}

export function createInitialBroadcastWorkflowState(ownerName: string): BroadcastWorkflowState {
  const scheduleDate = new Date();
  scheduleDate.setDate(scheduleDate.getDate() + 3);
  return {
    liveSetupStep: 'setup',
    liveMode: 'quick',
    activeLiveStreamId: null,
    ivsBroadcastCredentials: null,
    livePublishError: '',
    isPublishingLive: false,
    broadcastType: 'Other',
    liveTitle: '',
    liveDescription: '',
    liveCategory: '',
    liveSpeaker: ownerName,
    liveScripture: '',
    rtmpServerUrl: '',
    liveStreamKey: '',
    showStreamKey: false,
    copiedServer: false,
    copiedStreamKey: false,
    isGeneratingCredentials: false,
    cameraPreviewStream: null,
    cameraPreviewError: '',
    activeEncoderTab: 'obs',
    isLiveSignalDetected: true,
    enableLiveChat: true,
    enablePrayerAltar: true,
    enableGivingOverlay: true,
    scheduleTitle: '',
    scheduleSpeaker: ownerName,
    scheduleDate: scheduleDate.toISOString().split('T')[0],
    scheduleTime: '19:00',
    scheduleTimezone: 'EST (UTC-5)',
    scheduleType: 'Live Broadcast Premiere',
    scheduleScripture: '',
    scheduleDescription: '',
    notifySubscribers: true,
  };
}

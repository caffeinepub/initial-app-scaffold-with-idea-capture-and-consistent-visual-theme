// This file contains type definitions for backend features that are not yet fully implemented
// These types are based on the Motoko backend code but are not exposed in the TypeScript interface

import type { Principal } from '@icp-sdk/core/principal';
import { ExternalBlob } from '../backend';

// Time is represented as bigint (nanoseconds since epoch)
export type Time = bigint;

// Re-export backend types that are now available
export type { Post, PostInput, StoryView, StoryInput, SupportIssue, IssueCategory, IssueStatus } from '../backend';

export interface Comment {
  id: bigint;
  postId: bigint;
  author: Principal;
  text: string;
  timeCreated: Time;
}

export interface FollowRequest {
  id: bigint;
  requester: Principal;
  target: Principal;
  timeCreated: Time;
  approved: boolean;
  denied: boolean;
}

export enum NotificationType {
  followRequest = 'followRequest',
  message = 'message',
  supportResponse = 'supportResponse',
  other = 'other',
}

export interface Notification {
  id: bigint;
  recipient: Principal;
  content: string;
  notificationType: NotificationType;
  timeCreated: Time;
  read: boolean;
}

export interface Conversation {
  id: bigint;
  participants: Principal[];
  lastMessageTime: Time;
}

export interface Message {
  id: bigint;
  conversationId: bigint;
  sender: Principal;
  content: string;
  timeCreated: Time;
}

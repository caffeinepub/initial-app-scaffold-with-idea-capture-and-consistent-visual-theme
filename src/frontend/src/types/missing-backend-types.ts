// This file contains type definitions for backend features that are not yet fully implemented
// These types are based on the Motoko backend code but are not exposed in the TypeScript interface

import type { Principal } from '@icp-sdk/core/principal';
import { ExternalBlob } from '../backend';

// Time is represented as bigint (nanoseconds since epoch)
export type Time = bigint;

export interface Post {
  id: bigint;
  author: Principal;
  caption: string;
  image: ExternalBlob | null;
  timeCreated: Time;
  likesCount: bigint;
  commentsCount: bigint;
}

export interface PostInput {
  author: Principal;
  caption: string;
  image: ExternalBlob | null;
}

export interface Comment {
  id: bigint;
  postId: bigint;
  author: Principal;
  text: string;
  timeCreated: Time;
}

export interface StoryView {
  id: bigint;
  author: Principal;
  image: ExternalBlob;
  timeCreated: Time;
  isActive: boolean;
  likes: Principal[];
  likeCount: bigint;
}

export interface StoryInput {
  author: Principal;
  image: ExternalBlob;
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

export enum IssueCategory {
  technical = 'technical',
  account = 'account',
  featureRequest = 'featureRequest',
  other = 'other',
}

export enum IssueStatus {
  open = 'open',
  inProgress = 'inProgress',
  resolved = 'resolved',
}

export interface SupportIssue {
  id: bigint;
  creator: Principal;
  category: IssueCategory;
  description: string;
  timeCreated: Time;
  status: IssueStatus;
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

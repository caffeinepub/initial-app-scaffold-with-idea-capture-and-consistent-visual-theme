import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Comment {
    id: bigint;
    text: string;
    author: Principal;
    timeCreated: Time;
    postId: bigint;
}
export interface Story {
    id: bigint;
    isActive: boolean;
    author: Principal;
    timeCreated: Time;
    image: ExternalBlob;
}
export interface FeatureFlags {
    filtersEnabled: boolean;
    musicEnabled: boolean;
}
export interface SupportIssue {
    id: bigint;
    status: IssueStatus;
    creator: Principal;
    description: string;
    timeCreated: Time;
    category: IssueCategory;
}
export interface PublicUserProfile {
    id: Principal;
    bio: string;
    verified: boolean;
    username: string;
    displayName: string;
    blocked: boolean;
    followersCount: bigint;
    role: UserRole;
    email?: string;
    followingCount: bigint;
    visibility: ProfileVisibility;
    avatar: string;
}
export interface Post {
    id: bigint;
    author: Principal;
    timeCreated: Time;
    caption: string;
    commentsCount: bigint;
    image?: ExternalBlob;
    likesCount: bigint;
}
export interface Notification {
    id: bigint;
    content: string;
    notificationType: NotificationType;
    read: boolean;
    recipient: Principal;
    timeCreated: Time;
}
export interface Message {
    id: bigint;
    content: string;
    sender: Principal;
    timeCreated: Time;
    conversationId: bigint;
}
export interface FollowRequest {
    id: bigint;
    requester: Principal;
    denied: boolean;
    timeCreated: Time;
    target: Principal;
    approved: boolean;
}
export interface Conversation {
    id: bigint;
    participants: Array<Principal>;
    lastMessageTime: Time;
}
export enum IssueCategory {
    other = "other",
    technical = "technical",
    account = "account",
    featureRequest = "featureRequest"
}
export enum IssueStatus {
    resolved = "resolved",
    open = "open",
    inProgress = "inProgress"
}
export enum NotificationType {
    other = "other",
    message = "message",
    supportResponse = "supportResponse",
    followRequest = "followRequest"
}
export enum ProfileVisibility {
    privateProfile = "privateProfile",
    publicProfile = "publicProfile"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    officer = "officer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: bigint, text: string): Promise<void>;
    approveFollowRequest(requestId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    blockUser(user: Principal): Promise<void>;
    createPost(caption: string, image: ExternalBlob | null): Promise<void>;
    createStory(image: ExternalBlob): Promise<void>;
    createUserProfile(username: string, displayName: string, email: string, bio: string, avatar: string): Promise<void>;
    deletePost(postId: bigint): Promise<void>;
    demoteFromOfficer(user: Principal): Promise<void>;
    denyFollowRequest(requestId: bigint): Promise<void>;
    followUser(target: Principal): Promise<void>;
    getActiveStories(): Promise<Array<Story>>;
    getAllPosts(): Promise<Array<Post>>;
    getAllSupportIssues(): Promise<Array<SupportIssue>>;
    getCallerUserProfile(): Promise<PublicUserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getCommentsByPost(postId: bigint): Promise<Array<Comment>>;
    getConversations(): Promise<Array<Conversation>>;
    getFeatureFlags(): Promise<FeatureFlags>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getFollowing(user: Principal): Promise<Array<Principal>>;
    getHomeFeed(): Promise<Array<Post>>;
    getLikesByPost(postId: bigint): Promise<Array<Principal>>;
    getMessages(conversationId: bigint): Promise<Array<Message>>;
    getNotifications(): Promise<Array<Notification>>;
    getOrCreateConversation(peer: Principal): Promise<bigint>;
    getPendingFollowRequests(): Promise<Array<FollowRequest>>;
    getPostById(id: bigint): Promise<Post | null>;
    getPostsByUser(user: Principal): Promise<Array<Post>>;
    getProfileById(id: Principal): Promise<PublicUserProfile | null>;
    getProfileByUsername(username: string): Promise<PublicUserProfile | null>;
    getStoryById(storyId: bigint): Promise<Story | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    markNotificationAsRead(notificationId: bigint): Promise<void>;
    promoteToOfficer(user: Principal): Promise<void>;
    sendMessage(conversationId: bigint, content: string): Promise<void>;
    submitSupportIssue(category: IssueCategory, description: string): Promise<void>;
    unblockUser(user: Principal): Promise<void>;
    unfollowUser(target: Principal): Promise<void>;
    unlikePost(postId: bigint): Promise<void>;
    unverifyUser(user: Principal): Promise<void>;
    updateFeatureFlags(filtersEnabled: boolean, musicEnabled: boolean): Promise<void>;
    updateSupportIssueStatus(issueId: bigint, status: IssueStatus): Promise<void>;
    updateUserProfile(displayName: string, bio: string, avatar: string, email: string, visibility: ProfileVisibility): Promise<void>;
    verifyUser(user: Principal): Promise<void>;
}

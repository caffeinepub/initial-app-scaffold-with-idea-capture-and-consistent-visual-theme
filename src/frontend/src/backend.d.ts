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
    verified: VerificationState;
    username: string;
    displayName: string;
    blocked: boolean;
    followersCount: bigint;
    role: UserRole;
    email?: string;
    hasOrangeTick: boolean;
    followingCount: bigint;
    visibility: ProfileVisibility;
    avatar: string;
}
export interface StoryView {
    id: bigint;
    likeCount: bigint;
    isActive: boolean;
    author: Principal;
    likes: Array<Principal>;
    timeCreated: Time;
    image: ExternalBlob;
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
export interface StoryInput {
    author: Principal;
    image: ExternalBlob;
}
export interface PostInput {
    author: Principal;
    caption: string;
    image?: ExternalBlob;
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
export enum VerificationState {
    blueCheck = "blueCheck",
    orangeTick = "orangeTick",
    unverified = "unverified",
    adminOnlyRedCheck = "adminOnlyRedCheck"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    blockUser(targetUser: Principal): Promise<void>;
    createPost(input: PostInput): Promise<bigint>;
    createStory(input: StoryInput): Promise<bigint>;
    createSupportIssue(category: IssueCategory, description: string): Promise<bigint>;
    deletePost(postId: bigint): Promise<void>;
    demoteToUser(targetUser: Principal): Promise<void>;
    getActiveStories(): Promise<Array<StoryView>>;
    getCallerUserProfile(): Promise<PublicUserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getFeatureFlags(): Promise<FeatureFlags>;
    getHomeFeed(_page: bigint, _limit: bigint): Promise<Array<Post>>;
    getMySupportIssues(): Promise<Array<SupportIssue>>;
    getPostById(postId: bigint): Promise<Post | null>;
    getPostsByUser(user: Principal): Promise<Array<Post>>;
    getProfileByPrincipal(user: Principal): Promise<PublicUserProfile | null>;
    getProfileByUsername(username: string): Promise<PublicUserProfile | null>;
    getPublicUserProfile(user: Principal): Promise<PublicUserProfile | null>;
    getStoryById(storyId: bigint): Promise<StoryView | null>;
    getSupportIssues(): Promise<Array<SupportIssue>>;
    getUserProfile(user: Principal): Promise<PublicUserProfile | null>;
    getUserRole(): Promise<UserRole>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    likeStory(storyId: bigint): Promise<void>;
    promoteToOfficer(targetUser: Principal): Promise<void>;
    saveCallerUserProfile(profile: {
        bio: string;
        username: string;
        displayName: string;
        email?: string;
        visibility: ProfileVisibility;
        avatar: string;
    }): Promise<void>;
    setFeatureFlags(newFlags: FeatureFlags): Promise<void>;
    unblockUser(targetUser: Principal): Promise<void>;
    unlikePost(postId: bigint): Promise<void>;
    unlikeStory(storyId: bigint): Promise<void>;
    updateSupportIssueStatus(issueId: bigint, newStatus: IssueStatus): Promise<void>;
    updateUserProfileVerification(targetUser: Principal, verification: VerificationState): Promise<void>;
}

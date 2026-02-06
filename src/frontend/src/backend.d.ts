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
export interface Message {
    id: bigint;
    content: string;
    sender: Principal;
    timeCreated: Time;
    conversationId: bigint;
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
export interface Conversation {
    id: bigint;
    participants: Array<Principal>;
    lastMessageTime: Time;
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
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createConversation(otherUser: Principal): Promise<bigint>;
    createPost(postInput: PostInput): Promise<bigint>;
    createStory(storyInput: StoryInput): Promise<bigint>;
    createUserProfile(username: string, displayName: string, email: string, bio: string, avatar: string): Promise<void>;
    deactivateStory(storyId: bigint): Promise<void>;
    deletePost(postId: bigint): Promise<void>;
    getActiveStories(): Promise<Array<StoryView>>;
    getAllPosts(): Promise<Array<Post>>;
    getCallerUserProfile(): Promise<PublicUserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getConversationMessages(conversationId: bigint): Promise<Array<Message>>;
    getConversations(): Promise<Array<Conversation>>;
    getPost(postId: bigint): Promise<Post | null>;
    getPostCount(): Promise<bigint>;
    getPostsForAuthor(author: Principal): Promise<Array<Post>>;
    getProfileById(id: Principal): Promise<PublicUserProfile | null>;
    getProfileByUsername(username: string): Promise<PublicUserProfile | null>;
    getStory(storyId: bigint): Promise<StoryView | null>;
    getStoryLikes(storyId: bigint): Promise<Array<Principal>>;
    getUserProfile(user: Principal): Promise<PublicUserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeStory(storyId: bigint): Promise<void>;
    saveCallerUserProfile(profile: PublicUserProfile): Promise<void>;
    searchPosts(searchTerm: string): Promise<Array<Post>>;
    sendMessage(conversationId: bigint, content: string): Promise<bigint>;
    setOrangeTick(user: Principal, hasOrangeTick: boolean): Promise<void>;
    setVerifiedStatus(user: Principal, verified: boolean): Promise<void>;
    unlikeStory(storyId: bigint): Promise<void>;
    updatePost(postId: bigint, updatedPost: PostInput): Promise<void>;
    updateUserProfile(displayName: string, bio: string, avatar: string, email: string, visibility: ProfileVisibility): Promise<void>;
}

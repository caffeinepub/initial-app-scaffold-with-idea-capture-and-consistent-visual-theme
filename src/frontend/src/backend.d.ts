import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export type Time = bigint;
export interface Message {
    id: bigint;
    content: string;
    sender: Principal;
    timeCreated: Time;
    conversationId: bigint;
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
    createUserProfile(username: string, displayName: string, email: string, bio: string, avatar: string): Promise<void>;
    getCallerUserProfile(): Promise<PublicUserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getConversationMessages(conversationId: bigint): Promise<Array<Message>>;
    getConversations(): Promise<Array<Conversation>>;
    getProfileById(id: Principal): Promise<PublicUserProfile | null>;
    getProfileByUsername(username: string): Promise<PublicUserProfile | null>;
    getStoryLikes(storyId: bigint): Promise<Array<Principal>>;
    getUserProfile(user: Principal): Promise<PublicUserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeStory(storyId: bigint): Promise<void>;
    saveCallerUserProfile(profile: PublicUserProfile): Promise<void>;
    sendMessage(conversationId: bigint, content: string): Promise<bigint>;
    setOrangeTick(user: Principal, hasOrangeTick: boolean): Promise<void>;
    setVerifiedStatus(user: Principal, verified: boolean): Promise<void>;
    unlikeStory(storyId: bigint): Promise<void>;
    updateUserProfile(displayName: string, bio: string, avatar: string, email: string, visibility: ProfileVisibility): Promise<void>;
}

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
export interface FeatureFlags {
    filtersEnabled: boolean;
    musicEnabled: boolean;
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
    demoteToUser(targetUser: Principal): Promise<void>;
    getCallerUserProfile(): Promise<PublicUserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getFeatureFlags(): Promise<FeatureFlags>;
    getProfileByPrincipal(user: Principal): Promise<PublicUserProfile | null>;
    getProfileByUsername(username: string): Promise<PublicUserProfile | null>;
    getPublicUserProfile(user: Principal): Promise<PublicUserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    promoteToOfficer(targetUser: Principal): Promise<void>;
    setFeatureFlags(newFlags: FeatureFlags): Promise<void>;
    unblockUser(targetUser: Principal): Promise<void>;
}

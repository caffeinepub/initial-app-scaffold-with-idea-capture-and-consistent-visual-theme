import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
  type PublicUserProfile = {
    id : Principal;
    username : Text;
    displayName : Text;
    bio : Text;
    avatar : Text;
    verified : Bool;
    hasOrangeTick : Bool;
    role : UserRole;
    blocked : Bool;
    followersCount : Nat;
    followingCount : Nat;
    email : ?Text;
    visibility : ProfileVisibility;
  };

  type InternalUserProfile = {
    id : Principal;
    username : Text;
    displayName : Text;
    bio : Text;
    avatar : Text;
    verified : Bool;
    hasOrangeTick : Bool;
    role : UserRole;
    blocked : Bool;
    followersCount : Nat;
    followingCount : Nat;
    email : ?Text;
    visibility : ProfileVisibility;
  };

  type Comment = {
    id : Nat;
    postId : Nat;
    author : Principal;
    text : Text;
    timeCreated : Int;
  };

  type FeatureFlags = {
    filtersEnabled : Bool;
    musicEnabled : Bool;
  };

  public type UserRole = {
    #admin;
    #officer;
    #user;
  };

  public type ProfileVisibility = {
    #publicProfile;
    #privateProfile;
  };

  type StoredPost = {
    id : Nat;
    author : Principal;
    caption : Text;
    image : ?Storage.ExternalBlob;
    timeCreated : Int;
    likesCount : Nat;
    commentsCount : Nat;
  };

  type Notification = {
    id : Nat;
    recipient : Principal;
    content : Text;
    notificationType : NotificationType;
    timeCreated : Int;
    read : Bool;
  };

  type NotificationType = {
    #followRequest;
    #message;
    #supportResponse;
    #other;
  };

  type SupportIssue = {
    id : Nat;
    creator : Principal;
    category : IssueCategory;
    description : Text;
    timeCreated : Int;
    status : IssueStatus;
  };

  type IssueCategory = {
    #technical;
    #account;
    #featureRequest;
    #other;
  };

  type IssueStatus = {
    #open;
    #inProgress;
    #resolved;
  };

  type FollowRequest = {
    id : Nat;
    requester : Principal;
    target : Principal;
    timeCreated : Int;
    approved : Bool;
    denied : Bool;
  };

  type Conversation = {
    id : Nat;
    participants : [Principal];
    lastMessageTime : Int;
  };

  type Message = {
    id : Nat;
    conversationId : Nat;
    sender : Principal;
    content : Text;
    timeCreated : Int;
  };

  type InternalStory = {
    id : Nat;
    author : Principal;
    image : Storage.ExternalBlob;
    timeCreated : Int;
    isActive : Bool;
    likes : Set.Set<Principal>;
    likeCount : Nat;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, InternalUserProfile>;
    posts : Map.Map<Nat, StoredPost>;
    comments : Map.Map<Nat, Comment>;
    followers : Map.Map<Principal, List.List<Principal>>;
    following : Map.Map<Principal, List.List<Principal>>;
    likes : Map.Map<Nat, List.List<Principal>>;
    notifications : Map.Map<Principal, List.List<Notification>>;
    followRequests : Map.Map<Principal, List.List<FollowRequest>>;
    conversations : Map.Map<Nat, Conversation>;
    messages : Map.Map<Nat, List.List<Message>>;
    nextPostId : Nat;
    nextCommentId : Nat;
    nextNotificationId : Nat;
    nextFollowRequestId : Nat;
    nextConversationId : Nat;
    nextMessageId : Nat;
    featureFlags : FeatureFlags;
    nextSupportIssueId : Nat;
    supportIssues : Map.Map<Nat, SupportIssue>;
    nextStoryId : Nat;
    stories : Map.Map<Nat, InternalStory>;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, InternalUserProfile>;
    posts : Map.Map<Nat, StoredPost>;
    comments : Map.Map<Nat, Comment>;
    followers : Map.Map<Principal, List.List<Principal>>;
    following : Map.Map<Principal, List.List<Principal>>;
    likes : Map.Map<Nat, List.List<Principal>>;
    notifications : Map.Map<Principal, List.List<Notification>>;
    followRequests : Map.Map<Principal, List.List<FollowRequest>>;
    conversations : Map.Map<Nat, Conversation>;
    messages : Map.Map<Nat, List.List<Message>>;
    nextPostId : Nat;
    nextCommentId : Nat;
    nextNotificationId : Nat;
    nextFollowRequestId : Nat;
    nextConversationId : Nat;
    nextMessageId : Nat;
    featureFlags : FeatureFlags;
    nextSupportIssueId : Nat;
    supportIssues : Map.Map<Nat, SupportIssue>;
    nextStoryId : Nat;
    stories : Map.Map<Nat, InternalStory>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};

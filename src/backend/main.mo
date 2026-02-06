import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type PublicUserProfile = {
    id : Principal;
    username : Text;
    displayName : Text;
    bio : Text;
    avatar : Text;
    verified : VerificationState;
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
    verified : VerificationState;
    hasOrangeTick : Bool;
    role : UserRole;
    blocked : Bool;
    followersCount : Nat;
    followingCount : Nat;
    email : ?Text;
    visibility : ProfileVisibility;
  };

  type VerificationState = {
    #unverified;
    #blueCheck;
    #orangeTick;
    #adminOnlyRedCheck;
  };

  type ProfileVisibility = {
    #publicProfile;
    #privateProfile;
  };

  type FeatureFlags = {
    filtersEnabled : Bool;
    musicEnabled : Bool;
  };

  type UserRole = {
    #admin;
    #officer;
    #user;
  };

  type FollowGraph = {
    followers : Map.Map<Principal, Set.Set<Principal>>;
    following : Map.Map<Principal, Set.Set<Principal>>;
  };

  type Post = {
    id : Nat;
    author : Principal;
    caption : Text;
    image : ?Storage.ExternalBlob;
    timeCreated : Time.Time;
    likesCount : Nat;
    commentsCount : Nat;
  };

  type Comment = {
    id : Nat;
    postId : Nat;
    author : Principal;
    text : Text;
    timeCreated : Time.Time;
  };

  type StoredPost = {
    id : Nat;
    author : Principal;
    caption : Text;
    image : ?Storage.ExternalBlob;
    timeCreated : Time.Time;
    likesCount : Nat;
    commentsCount : Nat;
  };

  type Notification = {
    id : Nat;
    recipient : Principal;
    content : Text;
    notificationType : NotificationType;
    timeCreated : Time.Time;
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
    timeCreated : Time.Time;
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
    timeCreated : Time.Time;
    approved : Bool;
    denied : Bool;
  };

  type Conversation = {
    id : Nat;
    participants : [Principal];
    lastMessageTime : Time.Time;
  };

  type Message = {
    id : Nat;
    conversationId : Nat;
    sender : Principal;
    content : Text;
    timeCreated : Time.Time;
  };

  type InternalStory = {
    id : Nat;
    author : Principal;
    image : Storage.ExternalBlob;
    timeCreated : Time.Time;
    isActive : Bool;
    likeCount : Nat;
    likes : Set.Set<Principal>;
  };

  type StoryView = {
    id : Nat;
    author : Principal;
    image : Storage.ExternalBlob;
    timeCreated : Time.Time;
    isActive : Bool;
    likes : [Principal];
    likeCount : Nat;
  };

  type PostInput = {
    author : Principal;
    caption : Text;
    image : ?Storage.ExternalBlob;
  };

  type StoryInput = {
    author : Principal;
    image : Storage.ExternalBlob;
  };

  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, InternalUserProfile>();
  let posts = Map.empty<Nat, StoredPost>();
  let comments = Map.empty<Nat, Comment>();
  var followGraph : FollowGraph = {
    followers = Map.empty<Principal, Set.Set<Principal>>();
    following = Map.empty<Principal, Set.Set<Principal>>();
  };
  let likes = Map.empty<Nat, List.List<Principal>>();
  let notifications = Map.empty<Principal, List.List<Notification>>();
  let followRequests = Map.empty<Principal, List.List<FollowRequest>>();
  let conversations = Map.empty<Nat, Conversation>();
  let messages = Map.empty<Nat, List.List<Message>>();
  var nextPostId = 0;
  var nextCommentId = 0;
  var nextNotificationId = 0;
  var nextFollowRequestId = 0;
  var nextConversationId = 0;
  var nextMessageId = 0;
  var featureFlags : FeatureFlags = {
    filtersEnabled = false;
    musicEnabled = false;
  };
  var nextSupportIssueId = 0;
  let supportIssues = Map.empty<Nat, SupportIssue>();

  let superAdminPrincipal = "xgwt2-7h2p4-m54fq-hruec-r4x4i-nntjq-wdi7h-e2pwa-zmwzr-zhexp-nqe";
  let MAX_IMAGE_SIZE : Nat = 5_000_000;

  var nextStoryId = 0;
  let stories = Map.empty<Nat, InternalStory>();

  func isSuperAdmin(user : Principal) : Bool {
    user.toText() == superAdminPrincipal;
  };

  func isModeratorOrAbove(user : Principal) : Bool {
    if (isSuperAdmin(user)) {
      return true;
    };

    let role = AccessControl.getUserRole(accessControlState, user);
    switch (role) {
      case (#admin) { true };
      case _ {
        switch (userProfiles.get(user)) {
          case (?profile) {
            switch (profile.role) {
              case (#admin) { true };
              case _ { false };
            };
          };
          case (null) { false };
        };
      };
    };
  };

  func ensureNotBlocked(user : Principal) : () {
    // Super-admin can never be blocked
    if (isSuperAdmin(user)) {
      return;
    };

    switch (userProfiles.get(user)) {
      case (?profile) {
        if (profile.blocked) {
          Runtime.trap("User is blocked and cannot perform this action");
        };
      };
      case (null) {};
    };
  };

  func canViewProfile(viewer : Principal, profile : InternalUserProfile) : Bool {
    switch (profile.visibility) {
      case (#publicProfile) { true };
      case (#privateProfile) {
        if (Principal.equal(viewer, profile.id)) {
          return true;
        };
        if (isModeratorOrAbove(viewer)) {
          return true;
        };
        switch (followGraph.followers.get(profile.id)) {
          case (null) { false };
          case (?followersSet) { followersSet.contains(viewer) };
        };
      };
    };
  };

  func canViewSocialGraph(viewer : Principal, targetUser : Principal) : Bool {
    // Owner can always view their own social graph
    if (Principal.equal(viewer, targetUser)) {
      return true;
    };

    // Admins can view any social graph
    if (isModeratorOrAbove(viewer)) {
      return true;
    };

    // Check target user's profile visibility
    switch (userProfiles.get(targetUser)) {
      case (null) { 
        // If no profile exists, default to public
        true 
      };
      case (?profile) {
        switch (profile.visibility) {
          case (#publicProfile) { true };
          case (#privateProfile) {
            // For private profiles, only followers can view social graph
            switch (followGraph.followers.get(targetUser)) {
              case (null) { false };
              case (?followersSet) { followersSet.contains(viewer) };
            };
          };
        };
      };
    };
  };

  func toPublicUserProfile(profile : InternalUserProfile, caller : Principal) : PublicUserProfile {
    let isOwner = Principal.equal(profile.id, caller);
    let isAdmin = isModeratorOrAbove(caller);

    let verified = if (isSuperAdmin(profile.id)) {
      #adminOnlyRedCheck;
    } else {
      profile.verified;
    };

    {
      id = profile.id;
      username = profile.username;
      displayName = profile.displayName;
      bio = profile.bio;
      avatar = profile.avatar;
      verified;
      hasOrangeTick = profile.hasOrangeTick;
      role = profile.role;
      blocked = profile.blocked;
      followersCount = profile.followersCount;
      followingCount = profile.followingCount;
      email = if (isOwner or isAdmin) { profile.email } else { null };
      visibility = profile.visibility;
    };
  };

  func updateUserProfileInternal(user : Principal, updateFunc : InternalUserProfile -> InternalUserProfile) : () {
    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("User not found");
      };
      case (?profile) {
        userProfiles.add(user, updateFunc(profile));
      };
    };
  };

  func updateInternalPost(postId : Nat, updateFunc : StoredPost -> StoredPost) : () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { posts.add(postId, updateFunc(post)) };
    };
  };

  // ********************************
  // Feature Flags Management
  // ********************************
  //
  public query ({ caller }) func getCallerUserProfile() : async ?PublicUserProfile {
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?toPublicUserProfile(profile, caller) };
    };
  };

  public query ({ caller }) func getProfileByPrincipal(user : Principal) : async ?PublicUserProfile {
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) {
        if (canViewProfile(caller, profile)) {
          ?toPublicUserProfile(profile, caller);
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func getProfileByUsername(username : Text) : async ?PublicUserProfile {
    let profiles = userProfiles.values();
    for (profile in profiles) {
      if (profile.username == username) {
        if (canViewProfile(caller, profile)) {
          return ?toPublicUserProfile(profile, caller);
        } else {
          return null;
        };
      };
    };
    null;
  };

  public query ({ caller }) func getPublicUserProfile(user : Principal) : async ?PublicUserProfile {
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) {
        ?toPublicUserProfile(profile, caller);
      };
    };
  };

  public query ({ caller }) func getFeatureFlags() : async FeatureFlags {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super-admin can access feature flags");
    };
    featureFlags;
  };

  public shared ({ caller }) func setFeatureFlags(newFlags : FeatureFlags) : async () {
    if (caller.toText() != superAdminPrincipal) {
      Runtime.trap("Unauthorized: Only super-admin can update feature flags");
    };
    featureFlags := newFlags;
  };

  public shared ({ caller }) func blockUser(targetUser : Principal) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only moderators and super-admin can block users");
    };

    if (isSuperAdmin(targetUser)) {
      Runtime.trap("Cannot moderate super-admin account");
    };

    switch (userProfiles.get(targetUser)) {
      case (null) { Runtime.trap("Target user does not exist") };
      case (?_) {
        updateUserProfileInternal(
          targetUser,
          func(profile) {
            { profile with blocked = true };
          },
        );
      };
    };
  };

  public shared ({ caller }) func unblockUser(targetUser : Principal) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only moderators and super-admin can unblock users");
    };

    if (isSuperAdmin(targetUser)) {
      Runtime.trap("Cannot moderate super-admin account");
    };

    switch (userProfiles.get(targetUser)) {
      case (null) { Runtime.trap("Target user does not exist") };
      case (?_) {
        updateUserProfileInternal(
          targetUser,
          func(profile) {
            { profile with blocked = false };
          },
        );
      };
    };
  };

  public shared ({ caller }) func promoteToOfficer(targetUser : Principal) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only moderators and super-admin can promote users");
    };

    if (isSuperAdmin(targetUser)) {
      Runtime.trap("Cannot promote super-admin account");
    };

    switch (userProfiles.get(targetUser)) {
      case (null) { Runtime.trap("Target user does not exist") };
      case (?_) {
        updateUserProfileInternal(
          targetUser,
          func(profile) {
            { profile with role = #officer };
          },
        );
      };
    };
  };

  public shared ({ caller }) func demoteToUser(targetUser : Principal) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only moderators and super-admin can demote users");
    };

    if (isSuperAdmin(targetUser)) {
      Runtime.trap("Cannot demote super-admin account");
    };

    switch (userProfiles.get(targetUser)) {
      case (null) { Runtime.trap("Target user does not exist") };
      case (?_) {
        updateUserProfileInternal(
          targetUser,
          func(profile) {
            { profile with role = #user };
          },
        );
      };
    };
  };
};

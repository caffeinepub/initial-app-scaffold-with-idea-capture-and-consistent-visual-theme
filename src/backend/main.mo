import List "mo:core/List";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
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
  let posts = Map.empty<Nat, Post>();
  let comments = Map.empty<Nat, Comment>();
  var followGraph : FollowGraph = {
    followers = Map.empty<Principal, Set.Set<Principal>>();
    following = Map.empty<Principal, Set.Set<Principal>>();
  };
  let likes = Map.empty<Nat, Set.Set<Principal>>();
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

  func isOfficerOrAbove(user : Principal) : Bool {
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
              case (#officer) { true };
              case (_) { false };
            };
          };
          case (null) { false };
        };
      };
    };
  };

  func isModeratorOrAbove(user : Principal) : Bool {
    if (isSuperAdmin(user)) {
      return true;
    };

    let role = AccessControl.getUserRole(accessControlState, user);
    switch (role) {
      case (#admin) { true };
      case (_) { false };
    };
  };

  func isAdmin(user : Principal) : Bool {
    if (isSuperAdmin(user)) {
      return true;
    };

    let role = AccessControl.getUserRole(accessControlState, user);
    switch (role) {
      case (#admin) { true };
      case (_) { false };
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

  func updateInternalPost(postId : Nat, updateFunc : Post -> Post) : () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { posts.add(postId, updateFunc(post)) };
    };
  };

  func postCompareByTime(a : Post, b : Post) : Order.Order {
    Int.compare(b.timeCreated, a.timeCreated);
  };

  func toStoryView(story : InternalStory) : StoryView {
    {
      id = story.id;
      author = story.author;
      image = story.image;
      timeCreated = story.timeCreated;
      isActive = story.isActive;
      likes = story.likes.toArray();
      likeCount = story.likeCount;
    };
  };

  // ********************************
  // User Profile Management
  // ********************************

  public query ({ caller }) func getCallerUserProfile() : async ?PublicUserProfile {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };

    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { ?toPublicUserProfile(profile, caller) };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : {
    username : Text;
    displayName : Text;
    bio : Text;
    avatar : Text;
    email : ?Text;
    visibility : ProfileVisibility;
  }) : async () {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    ensureNotBlocked(caller);

    let existingProfile = userProfiles.get(caller);
    
    let newProfile : InternalUserProfile = switch (existingProfile) {
      case (null) {
        // Create new profile
        {
          id = caller;
          username = profile.username;
          displayName = profile.displayName;
          bio = profile.bio;
          avatar = profile.avatar;
          verified = #unverified;
          hasOrangeTick = false;
          role = #user;
          blocked = false;
          followersCount = 0;
          followingCount = 0;
          email = profile.email;
          visibility = profile.visibility;
        };
      };
      case (?existing) {
        // Update existing profile
        {
          existing with
          username = profile.username;
          displayName = profile.displayName;
          bio = profile.bio;
          avatar = profile.avatar;
          email = profile.email;
          visibility = profile.visibility;
        };
      };
    };

    userProfiles.add(caller, newProfile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?PublicUserProfile {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    // Users can view their own profile or admins can view any profile
    if (not Principal.equal(caller, user) and not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless you are an admin");
    };

    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) { ?toPublicUserProfile(profile, caller) };
    };
  };

  public query ({ caller }) func getProfileByPrincipal(user : Principal) : async ?PublicUserProfile {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

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
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

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
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };

    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) {
        ?toPublicUserProfile(profile, caller);
      };
    };
  };

  // ********************************
  // Post Management
  // ********************************

  public shared ({ caller }) func createPost(input : PostInput) : async Nat {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create posts");
    };

    ensureNotBlocked(caller);

    // Verify caller is the author
    if (not Principal.equal(caller, input.author)) {
      Runtime.trap("Unauthorized: Can only create posts as yourself");
    };

    let postId = nextPostId;
    nextPostId += 1;

    let newPost : Post = {
      id = postId;
      author = input.author;
      caption = input.caption;
      image = input.image;
      timeCreated = Time.now();
      likesCount = 0;
      commentsCount = 0;
    };

    posts.add(postId, newPost);
    postId;
  };

  public query ({ caller }) func getPostById(postId : Nat) : async ?Post {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view posts");
    };

    posts.get(postId);
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [Post] {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view posts");
    };

    // Check if caller can view the user's profile
    switch (userProfiles.get(user)) {
      case (null) { return []; };
      case (?profile) {
        if (not canViewProfile(caller, profile)) {
          Runtime.trap("Unauthorized: Cannot view posts from private profile");
        };
      };
    };

    let userPosts = posts.values().filter(func(post : Post) : Bool {
      Principal.equal(post.author, user);
    }).toArray();

    userPosts.sort(postCompareByTime);
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete posts");
    };

    ensureNotBlocked(caller);

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        // Only post author or admin can delete
        if (not Principal.equal(caller, post.author) and not isModeratorOrAbove(caller)) {
          Runtime.trap("Unauthorized: Can only delete your own posts");
        };

        posts.remove(postId);

        // Clean up likes
        likes.remove(postId);

        // Clean up comments
        let postComments = comments.values().filter(func(c : Comment) : Bool {
          c.postId == postId;
        });
        for (comment in postComments) {
          comments.remove(comment.id);
        };
      };
    };
  };

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can like posts");
    };

    ensureNotBlocked(caller);

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let postLikes = switch (likes.get(postId)) {
          case (null) { Set.empty<Principal>() };
          case (?s) { s };
        };

        if (postLikes.contains(caller)) {
          Runtime.trap("Already liked this post");
        };

        postLikes.add(caller);
        likes.add(postId, postLikes);

        updateInternalPost(postId, func(p : Post) : Post {
          { p with likesCount = p.likesCount + 1 };
        });
      };
    };
  };

  public shared ({ caller }) func unlikePost(postId : Nat) : async () {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can unlike posts");
    };

    ensureNotBlocked(caller);

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let postLikes = switch (likes.get(postId)) {
          case (null) { Runtime.trap("Post not liked") };
          case (?s) { s };
        };

        if (not postLikes.contains(caller)) {
          Runtime.trap("Post not liked");
        };

        postLikes.remove(caller);
        likes.add(postId, postLikes);

        updateInternalPost(postId, func(p : Post) : Post {
          { p with likesCount = if (p.likesCount > 0) { p.likesCount - 1 } else { 0 } };
        });
      };
    };
  };

  public query ({ caller }) func getHomeFeed(_page : Nat, _limit : Nat) : async [Post] {
    // Require authenticated user to view home feed
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view the home feed");
    };

    // Ensure caller is not blocked
    ensureNotBlocked(caller);

    if (userProfiles.isEmpty()) {
      Runtime.trap("No user profiles found");
    };

    let postArray = posts.values().toArray();
    let sortedPosts = postArray.sort(postCompareByTime);
    // Pagination logic already in frontend
    sortedPosts;
  };

  // ********************************
  // Story Management
  // ********************************

  public shared ({ caller }) func createStory(input : StoryInput) : async Nat {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create stories");
    };

    ensureNotBlocked(caller);

    // Verify caller is the author
    if (not Principal.equal(caller, input.author)) {
      Runtime.trap("Unauthorized: Can only create stories as yourself");
    };

    let storyId = nextStoryId;
    nextStoryId += 1;

    let newStory : InternalStory = {
      id = storyId;
      author = input.author;
      image = input.image;
      timeCreated = Time.now();
      isActive = true;
      likeCount = 0;
      likes = Set.empty<Principal>();
    };

    stories.add(storyId, newStory);
    storyId;
  };

  public query ({ caller }) func getActiveStories() : async [StoryView] {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view stories");
    };

    let now = Time.now();
    let twentyFourHours : Int = 24 * 60 * 60 * 1_000_000_000;

    let activeStories = stories.values().filter(func(story : InternalStory) : Bool {
      story.isActive and (now - story.timeCreated) < twentyFourHours;
    }).map(toStoryView).toArray();

    activeStories;
  };

  public query ({ caller }) func getStoryById(storyId : Nat) : async ?StoryView {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view stories");
    };

    switch (stories.get(storyId)) {
      case (null) { null };
      case (?story) { ?toStoryView(story) };
    };
  };

  public shared ({ caller }) func likeStory(storyId : Nat) : async () {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can like stories");
    };

    ensureNotBlocked(caller);

    switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story not found") };
      case (?story) {
        if (story.likes.contains(caller)) {
          Runtime.trap("Already liked this story");
        };

        story.likes.add(caller);
        let updatedStory = {
          story with
          likeCount = story.likeCount + 1;
        };
        stories.add(storyId, updatedStory);
      };
    };
  };

  public shared ({ caller }) func unlikeStory(storyId : Nat) : async () {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can unlike stories");
    };

    ensureNotBlocked(caller);

    switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story not found") };
      case (?story) {
        if (not story.likes.contains(caller)) {
          Runtime.trap("Story not liked");
        };

        story.likes.remove(caller);
        let updatedStory = {
          story with
          likeCount = if (story.likeCount > 0) { story.likeCount - 1 } else { 0 };
        };
        stories.add(storyId, updatedStory);
      };
    };
  };

  // ********************************
  // Support Issue Management
  // ********************************

  public shared ({ caller }) func createSupportIssue(category : IssueCategory, description : Text) : async Nat {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create support issues");
    };

    ensureNotBlocked(caller);

    let issueId = nextSupportIssueId;
    nextSupportIssueId += 1;

    let newIssue : SupportIssue = {
      id = issueId;
      creator = caller;
      category = category;
      description = description;
      timeCreated = Time.now();
      status = #open;
    };

    supportIssues.add(issueId, newIssue);
    issueId;
  };

  public query ({ caller }) func getSupportIssues() : async [SupportIssue] {
    // Only admins can view all support issues
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all support issues");
    };

    supportIssues.values().toArray();
  };

  public query ({ caller }) func getMySupportIssues() : async [SupportIssue] {
    // Require authenticated user
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their support issues");
    };

    supportIssues.values().filter(func(issue : SupportIssue) : Bool {
      Principal.equal(issue.creator, caller);
    }).toArray();
  };

  public shared ({ caller }) func updateSupportIssueStatus(issueId : Nat, newStatus : IssueStatus) : async () {
    // Only admins can update support issue status
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only admins can update support issue status");
    };

    switch (supportIssues.get(issueId)) {
      case (null) { Runtime.trap("Support issue not found") };
      case (?issue) {
        let updatedIssue = {
          issue with
          status = newStatus;
        };
        supportIssues.add(issueId, updatedIssue);
      };
    };
  };

  // ********************************
  // Feature Flags Management
  // ********************************

  public query ({ caller }) func getFeatureFlags() : async FeatureFlags {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super-admin can access feature flags");
    };
    featureFlags;
  };

  public shared ({ caller }) func setFeatureFlags(newFlags : FeatureFlags) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super-admin can update feature flags");
    };
    featureFlags := newFlags;
  };

  // ********************************
  // User Moderation
  // ********************************

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

  public shared ({ caller }) func updateUserProfileVerification(targetUser : Principal, verification : VerificationState) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only moderators and super-admin can update user verification");
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
            { profile with verified = verification };
          },
        );
      };
    };
  };

  public query ({ caller }) func getUserRole() : async UserRole {
    // Users can only query their own role
    // Admins can query any role, but this function only returns caller's role
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can query their role");
    };

    let role = AccessControl.getUserRole(accessControlState, caller);
    switch (role) {
      case (#admin) { #admin };
      case (_) {
        switch (userProfiles.get(caller)) {
          case (?profile) { profile.role };
          case (null) { #user };
        };
      };
    };
  };
};


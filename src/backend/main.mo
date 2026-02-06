import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
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
    verified : Bool;
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
    role : UserRole;
    blocked : Bool;
    followersCount : Nat;
    followingCount : Nat;
    email : ?Text;
    visibility : ProfileVisibility;
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

  type Story = {
    id : Nat;
    author : Principal;
    image : Storage.ExternalBlob;
    timeCreated : Time.Time;
    isActive : Bool;
  };

  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, InternalUserProfile>();
  let posts = Map.empty<Nat, StoredPost>();
  let comments = Map.empty<Nat, Comment>();
  let followers = Map.empty<Principal, List.List<Principal>>();
  let following = Map.empty<Principal, List.List<Principal>>();
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
  let stories = Map.empty<Nat, Story>();

  // *************** User Profile API ***************
  public query ({ caller }) func getCallerUserProfile() : async ?PublicUserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller).map(func(profile) { toPublicUserProfile(profile, caller) });
  };

  public shared ({ caller }) func createUserProfile(username : Text, displayName : Text, email : Text, bio : Text, avatar : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create profiles");
    };

    if (Text.equal(username, "")) { Runtime.trap("Username cannot be empty") };

    switch (userProfiles.get(caller)) {
      case (?_) { Runtime.trap("Profile already exists") };
      case (null) {};
    };

    for ((_, entry) in userProfiles.entries()) {
      if (Text.equal(entry.username, username)) {
        Runtime.trap("Username already taken");
      };
    };

    let newProfile = {
      id = caller;
      username;
      displayName;
      bio;
      avatar;
      verified = false;
      role = if (isSuperAdmin(caller)) { #admin } else { #user };
      blocked = false;
      followersCount = 0;
      followingCount = 0;
      email = ?email;
      visibility = #publicProfile;
    };
    userProfiles.add(caller, newProfile);
  };

  public shared ({ caller }) func updateUserProfile(
    displayName : Text,
    bio : Text,
    avatar : Text,
    email : Text,
    visibility : ProfileVisibility,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update profiles");
    };

    updateUserProfileInternal(
      caller,
      func(profile) {
        {
          profile with
          displayName;
          bio;
          avatar;
          email = ?email;
          visibility;
        };
      },
    );
  };

  public query ({ caller }) func getProfileByUsername(username : Text) : async ?PublicUserProfile {
    let iterator = userProfiles.values();
    let filtered = iterator.filter(
      func(profile) {
        Text.equal(profile.username, username);
      }
    );
    let result = filtered.next();
    switch (result) {
      case (?profile) {
        if (canViewProfile(caller, profile)) {
          ?toPublicUserProfile(profile, caller);
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getProfileById(id : Principal) : async ?PublicUserProfile {
    switch (userProfiles.get(id)) {
      case (?profile) {
        if (canViewProfile(caller, profile)) {
          ?toPublicUserProfile(profile, caller);
        } else {
          null;
        };
      };
      case (null) { null };
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
        let followersList = switch (followers.get(profile.id)) {
          case (null) { List.empty<Principal>() };
          case (?list) { list };
        };
        let followersArray = followersList.toArray();
        followersArray.any(func(follower) { Principal.equal(follower, viewer) });
      };
    };
  };

  func toPublicUserProfile(profile : InternalUserProfile, caller : Principal) : PublicUserProfile {
    let isOwner = Principal.equal(caller, profile.id);
    let emailVisible = isModeratorOrAbove(caller) or isOwner;
    {
      id = profile.id;
      username = profile.username;
      displayName = profile.displayName;
      bio = profile.bio;
      avatar = profile.avatar;
      verified = profile.verified;
      role = profile.role;
      blocked = profile.blocked;
      followersCount = profile.followersCount;
      followingCount = profile.followingCount;
      email = if (emailVisible) { profile.email } else { null };
      visibility = profile.visibility;
    };
  };

  public shared ({ caller }) func createPost(caption : Text, image : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create posts");
    };

    ensureNotBlocked(caller);

    switch (image) {
      case (?img) {
        if (img.size() > MAX_IMAGE_SIZE) {
          Runtime.trap("Image size exceeds maximum limit of 5MB");
        };
      };
      case (null) {};
    };

    let newPost : StoredPost = {
      id = nextPostId;
      author = caller;
      caption;
      image;
      timeCreated = Time.now();
      likesCount = 0;
      commentsCount = 0;
    };
    posts.add(nextPostId, newPost);
    nextPostId += 1;
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete posts");
    };

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    let isAuthor = Principal.equal(caller, post.author);
    let isModerator = isModeratorOrAbove(caller);

    if (not isAuthor and not isModerator) {
      Runtime.trap("Unauthorized: Only post author or moderator can delete this post");
    };

    posts.remove(postId);

    likes.remove(postId);
  };

  public query ({ caller }) func getPostById(id : Nat) : async ?Post {
    switch (posts.get(id)) {
      case (?storedPost) {
        if (canViewPost(caller, storedPost)) {
          ?toPost(storedPost);
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [Post] {
    posts.values().toArray().filter(func(post) { Principal.equal(post.author, user) and canViewPost(caller, post) }).map(toPost);
  };

  public query ({ caller }) func getAllPosts() : async [Post] {
    posts.values().toArray().filter(func(post) { canViewPost(caller, post) }).map(toPost);
  };

  public query ({ caller }) func getHomeFeed() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return [];
    };

    let followingList = switch (following.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    let followingArray = followingList.toArray();

    let iterator = posts.values();
    let filtered = iterator.filter(
      func(post) {
        followingArray.any(func(user) { Principal.equal(user, post.author) }) and canViewPost(caller, post);
      }
    );

    let feedPosts = filtered.toArray();
    feedPosts.map(toPost).sort(func(a : Post, b : Post) : Order.Order {
      Int.compare(b.timeCreated, a.timeCreated);
    });
  };

  func canViewPost(viewer : Principal, post : StoredPost) : Bool {
    switch (userProfiles.get(post.author)) {
      case (?authorProfile) {
        canViewProfile(viewer, authorProfile);
      };
      case (null) { true };
    };
  };

  func toPost(storedPost : StoredPost) : Post {
    {
      id = storedPost.id;
      author = storedPost.author;
      caption = storedPost.caption;
      image = storedPost.image;
      timeCreated = storedPost.timeCreated;
      likesCount = storedPost.likesCount;
      commentsCount = storedPost.commentsCount;
    };
  };

  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can follow others");
    };

    ensureNotBlocked(caller);

    if (Principal.equal(caller, target)) { Runtime.trap("You cannot follow yourself") };

    switch (userProfiles.get(target)) {
      case (?targetProfile) {
        if (not canViewProfile(caller, targetProfile)) {
          Runtime.trap("Cannot follow a user whose profile you cannot view");
        };
      };
      case (null) { Runtime.trap("Target user not found") };
    };

    if (isPrivateProfile(target)) {
      createFollowRequest(caller, target);
      createFollowRequestNotification(target, caller);
      Runtime.trap("Follow request sent. Pending approval from the user.");
    };

    let existingFollowers = switch (followers.get(target)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };
    let existingFollowing = switch (following.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    let existingValues = existingFollowers.toArray();
    let followsAlready = existingValues.any(
      func(follower) { Principal.equal(follower, caller) }
    );
    if (followsAlready) { return () };

    let newFollowers = existingFollowers.clone();
    newFollowers.add(caller);
    followers.add(target, newFollowers);

    let newFollowing = existingFollowing.clone();
    newFollowing.add(target);
    following.add(caller, newFollowing);

    updateUserProfileInternal(target, func(profile) { { profile with followersCount = profile.followersCount + 1 } });
    updateUserProfileInternal(caller, func(profile) { { profile with followingCount = profile.followingCount + 1 } });
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can unfollow others");
    };

    ensureNotBlocked(caller);

    let existingFollowers = switch (followers.get(target)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };
    let existingFollowing = switch (following.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    let filteredFollowers = if (existingFollowers.isEmpty()) {
      List.empty<Principal>();
    } else {
      existingFollowers.clone().filter(
        func(follower) { not (Principal.equal(follower, caller)) }
      );
    };
    followers.add(target, filteredFollowers);

    let filteredFollowing = if (existingFollowing.isEmpty()) {
      List.empty<Principal>();
    } else {
      existingFollowing.clone().filter(
        func(user) { not (Principal.equal(user, target)) }
      );
    };
    following.add(caller, filteredFollowing);

    updateUserProfileInternal(target, func(profile) { { profile with followersCount = (if (profile.followersCount > 0) { profile.followersCount - 1 } else { 0 }) } });
    updateUserProfileInternal(caller, func(profile) { { profile with followingCount = (if (profile.followingCount > 0) { profile.followingCount - 1 } else { 0 }) } });
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    switch (userProfiles.get(user)) {
      case (?profile) {
        if (not canViewProfile(caller, profile)) {
          Runtime.trap("Unauthorized: Cannot view followers of private profile");
        };
      };
      case (null) {};
    };

    switch (followers.get(user)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public query ({ caller }) func getFollowing(user : Principal) : async [Principal] {
    switch (userProfiles.get(user)) {
      case (?profile) {
        if (not canViewProfile(caller, profile)) {
          Runtime.trap("Unauthorized: Cannot view following list of private profile");
        };
      };
      case (null) {};
    };

    switch (following.get(user)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can like posts");
    };

    ensureNotBlocked(caller);

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    if (not canViewPost(caller, post)) {
      Runtime.trap("Unauthorized: Cannot like a post you cannot view");
    };

    let existingLikes = switch (likes.get(postId)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    let existingValues = existingLikes.toArray();
    let alreadyLiked = existingValues.any(
      func(user) { Principal.equal(user, caller) }
    );
    if (alreadyLiked) { return () };

    let newLikes = existingLikes.clone();
    newLikes.add(caller);
    likes.add(postId, newLikes);

    updatePost(postId, func(post) { { post with likesCount = post.likesCount + 1 } });
  };

  public shared ({ caller }) func unlikePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can unlike posts");
    };

    ensureNotBlocked(caller);

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    if (not canViewPost(caller, post)) {
      Runtime.trap("Unauthorized: Cannot unlike a post you cannot view");
    };

    let existingLikes = switch (likes.get(postId)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };

    let filteredLikes = if (existingLikes.isEmpty()) {
      List.empty<Principal>();
    } else {
      existingLikes.clone().filter(
        func(user) { not (Principal.equal(user, caller)) }
      );
    };
    likes.add(postId, filteredLikes);

    updatePost(postId, func(post) { { post with likesCount = if (post.likesCount > 0) { post.likesCount - 1 } else { 0 } } });
  };

  public query ({ caller }) func getLikesByPost(postId : Nat) : async [Principal] {
    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    if (not canViewPost(caller, post)) {
      Runtime.trap("Unauthorized: Cannot view likes of a post you cannot view");
    };

    switch (likes.get(postId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func addComment(postId : Nat, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can comment");
    };

    ensureNotBlocked(caller);

    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    if (not canViewPost(caller, post)) {
      Runtime.trap("Unauthorized: Cannot comment on a post you cannot view");
    };

    let newComment : Comment = {
      id = nextCommentId;
      postId;
      author = caller;
      text;
      timeCreated = Time.now();
    };
    comments.add(nextCommentId, newComment);
    nextCommentId += 1;

    updatePost(postId, func(post) { { post with commentsCount = post.commentsCount + 1 } });
  };

  public query ({ caller }) func getCommentsByPost(postId : Nat) : async [Comment] {
    let post = switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?p) { p };
    };

    if (not canViewPost(caller, post)) {
      Runtime.trap("Unauthorized: Cannot view comments of a post you cannot view");
    };

    let iterator = comments.values();
    let filtered = iterator.filter(
      func(comment) {
        comment.postId == postId;
      }
    );
    filtered.toArray();
  };

  public shared ({ caller }) func blockUser(user : Principal) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only moderators can block users");
    };

    if (isSuperAdmin(user)) {
      Runtime.trap("Cannot block the superadmin");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    switch (profile.role) {
      case (#admin) { Runtime.trap("Cannot block admin users") };
      case (#officer) { Runtime.trap("Cannot block officer users") };
      case _ {};
    };

    updateUserProfileInternal(user, func(_profile) { { profile with blocked = true } });
  };

  public shared ({ caller }) func unblockUser(user : Principal) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only moderators can unblock users");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
    updateUserProfileInternal(user, func(_profile) { { profile with blocked = false } });
  };

  public shared ({ caller }) func verifyUser(user : Principal) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only moderators can verify users");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
    updateUserProfileInternal(user, func(_profile) { { profile with verified = true } });
  };

  public shared ({ caller }) func unverifyUser(user : Principal) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only moderators can unverify users");
    };

    if (isSuperAdmin(user)) {
      Runtime.trap("Cannot unverify the superadmin");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
    updateUserProfileInternal(user, func(_profile) { { profile with verified = false } });
  };

  public shared ({ caller }) func promoteToOfficer(user : Principal) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only superadmin can promote users to officer");
    };

    if (isSuperAdmin(user)) {
      Runtime.trap("Superadmin role cannot be changed");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    switch (profile.role) {
      case (#admin) { Runtime.trap("Cannot change admin role") };
      case _ {};
    };

    updateUserProfileInternal(user, func(_profile) { { profile with role = #officer } });
  };

  public shared ({ caller }) func demoteFromOfficer(user : Principal) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only superadmin can demote officers");
    };

    if (isSuperAdmin(user)) {
      Runtime.trap("Superadmin role cannot be changed");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    switch (profile.role) {
      case (#admin) { Runtime.trap("Cannot change admin role") };
      case _ {};
    };

    updateUserProfileInternal(user, func(_profile) { { profile with role = #user } });
  };

  func isSuperAdmin(caller : Principal) : Bool {
    caller.toText() == superAdminPrincipal;
  };

  func isModeratorOrAbove(caller : Principal) : Bool {
    if (isSuperAdmin(caller)) {
      return true;
    };
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (profile.role) {
          case (#admin) { true };
          case (#officer) { true };
          case (#user) { false };
        };
      };
      case (null) { false };
    };
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view notifications");
    };

    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func markNotificationAsRead(notificationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can mark notifications as read");
    };

    let notificationsList = switch (notifications.get(caller)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?list) { list };
    };

    let updatedList = notificationsList.clone().map<Notification, Notification>(
      func(notif : Notification) : Notification {
        if (notif.id == notificationId and Principal.equal(notif.recipient, caller)) {
          { notif with read = true };
        } else {
          notif;
        };
      }
    );

    notifications.add(caller, updatedList);
  };

  public query ({ caller }) func getPendingFollowRequests() : async [FollowRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view follow requests");
    };

    switch (followRequests.get(caller)) {
      case (null) { [] };
      case (?list) {
        list.toArray().filter(
          func(req : FollowRequest) : Bool {
            not req.approved and not req.denied;
          }
        );
      };
    };
  };

  public shared ({ caller }) func approveFollowRequest(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can approve follow requests");
    };

    let requestsList = switch (followRequests.get(caller)) {
      case (null) { Runtime.trap("Follow request not found") };
      case (?list) { list };
    };

    var foundRequest : ?FollowRequest = null;
    for (req in requestsList.values()) {
      if (req.id == requestId and Principal.equal(req.target, caller)) {
        foundRequest := ?req;
      };
    };

    let request = switch (foundRequest) {
      case (null) { Runtime.trap("Follow request not found or unauthorized") };
      case (?req) { req };
    };

    if (request.approved or request.denied) {
      Runtime.trap("Follow request already processed");
    };

    let updatedList = requestsList.clone().map<FollowRequest, FollowRequest>(
      func(req : FollowRequest) : FollowRequest {
        if (req.id == requestId) {
          { req with approved = true };
        } else {
          req;
        };
      }
    );
    followRequests.add(caller, updatedList);

    let existingFollowers = switch (followers.get(caller)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };
    let newFollowers = existingFollowers.clone();
    newFollowers.add(request.requester);
    followers.add(caller, newFollowers);

    let existingFollowing = switch (following.get(request.requester)) {
      case (null) { List.empty<Principal>() };
      case (?list) { list };
    };
    let newFollowing = existingFollowing.clone();
    newFollowing.add(caller);
    following.add(request.requester, newFollowing);

    updateUserProfileInternal(caller, func(profile) { { profile with followersCount = profile.followersCount + 1 } });
    updateUserProfileInternal(request.requester, func(profile) { { profile with followingCount = profile.followingCount + 1 } });
  };

  public shared ({ caller }) func denyFollowRequest(requestId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can deny follow requests");
    };

    let requestsList = switch (followRequests.get(caller)) {
      case (null) { Runtime.trap("Follow request not found") };
      case (?list) { list };
    };

    var foundRequest : ?FollowRequest = null;
    for (req in requestsList.values()) {
      if (req.id == requestId and Principal.equal(req.target, caller)) {
        foundRequest := ?req;
      };
    };

    let request = switch (foundRequest) {
      case (null) { Runtime.trap("Follow request not found or unauthorized") };
      case (?req) { req };
    };

    if (request.approved or request.denied) {
      Runtime.trap("Follow request already processed");
    };

    let updatedList = requestsList.clone().map<FollowRequest, FollowRequest>(
      func(req : FollowRequest) : FollowRequest {
        if (req.id == requestId) {
          { req with denied = true };
        } else {
          req;
        };
      }
    );
    followRequests.add(caller, updatedList);
  };

  public query ({ caller }) func getFeatureFlags() : async FeatureFlags {
    featureFlags;
  };

  public shared ({ caller }) func updateFeatureFlags(filtersEnabled : Bool, musicEnabled : Bool) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only superadmin can update feature flags");
    };

    featureFlags := {
      filtersEnabled;
      musicEnabled;
    };
  };

  public shared ({ caller }) func submitSupportIssue(category : IssueCategory, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit support issues");
    };

    let newIssue : SupportIssue = {
      id = nextSupportIssueId;
      creator = caller;
      category;
      description;
      timeCreated = Time.now();
      status = #open;
    };
    supportIssues.add(nextSupportIssueId, newIssue);
    nextSupportIssueId += 1;
  };

  public query ({ caller }) func getAllSupportIssues() : async [SupportIssue] {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only moderators can view all support issues");
    };

    supportIssues.values().toArray();
  };

  public shared ({ caller }) func updateSupportIssueStatus(issueId : Nat, status : IssueStatus) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only moderators can update support issue status");
    };

    let issue = switch (supportIssues.get(issueId)) {
      case (null) { Runtime.trap("Support issue not found") };
      case (?issue) { issue };
    };

    let updatedIssue = { issue with status };
    supportIssues.add(issueId, updatedIssue);
  };

  public shared ({ caller }) func getOrCreateConversation(peer : Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access conversations");
    };

    ensureNotBlocked(caller);

    if (Principal.equal(caller, peer)) {
      Runtime.trap("Cannot create conversation with yourself");
    };

    for ((id, conv) in conversations.entries()) {
      let participants = conv.participants;
      if (participants.size() == 2) {
        let hasCaller = participants.any(func(p) { Principal.equal(p, caller) });
        let hasPeer = participants.any(func(p) { Principal.equal(p, peer) });
        if (hasCaller and hasPeer) {
          return id;
        };
      };
    };

    let newConversation : Conversation = {
      id = nextConversationId;
      participants = [caller, peer];
      lastMessageTime = Time.now();
    };
    conversations.add(nextConversationId, newConversation);
    messages.add(nextConversationId, List.empty<Message>());

    let conversationId = nextConversationId;
    nextConversationId += 1;
    conversationId;
  };

  public query ({ caller }) func getConversations() : async [Conversation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view conversations");
    };

    conversations.values().toArray().filter(
      func(conv : Conversation) : Bool {
        conv.participants.any(func(p) { Principal.equal(p, caller) });
      }
    ).sort(func(a : Conversation, b : Conversation) : Order.Order {
      Int.compare(b.lastMessageTime, a.lastMessageTime);
    });
  };

  public query ({ caller }) func getMessages(conversationId : Nat) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view messages");
    };

    let conversation = switch (conversations.get(conversationId)) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?conv) { conv };
    };

    let isParticipant = conversation.participants.any(func(p) { Principal.equal(p, caller) });
    if (not isParticipant) {
      Runtime.trap("Unauthorized: You are not a participant in this conversation");
    };

    switch (messages.get(conversationId)) {
      case (null) { [] };
      case (?list) { list.toArray() };
    };
  };

  public shared ({ caller }) func sendMessage(conversationId : Nat, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    ensureNotBlocked(caller);

    let conversation = switch (conversations.get(conversationId)) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?conv) { conv };
    };

    let isParticipant = conversation.participants.any(func(p) { Principal.equal(p, caller) });
    if (not isParticipant) {
      Runtime.trap("Unauthorized: You are not a participant in this conversation");
    };

    let newMessage : Message = {
      id = nextMessageId;
      conversationId;
      sender = caller;
      content;
      timeCreated = Time.now();
    };

    let messagesList = switch (messages.get(conversationId)) {
      case (null) { List.empty<Message>() };
      case (?list) { list };
    };

    let updatedMessages = messagesList.clone();
    updatedMessages.add(newMessage);
    messages.add(conversationId, updatedMessages);

    let updatedConversation = { conversation with lastMessageTime = Time.now() };
    conversations.add(conversationId, updatedConversation);

    nextMessageId += 1;
  };

  public shared ({ caller }) func createStory(image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create stories");
    };

    ensureNotBlocked(caller);

    if (image.size() > MAX_IMAGE_SIZE) {
      Runtime.trap("Image size exceeds maximum limit of 5MB");
    };

    let newStory : Story = {
      id = nextStoryId;
      author = caller;
      image;
      timeCreated = Time.now();
      isActive = true;
    };
    stories.add(nextStoryId, newStory);
    nextStoryId += 1;
  };

  public query ({ caller }) func getActiveStories() : async [Story] {
    let now = Time.now();
    let expiredThreshold = 24 * 60 * 60 * 1_000_000_000;
    stories.values().toArray().filter(
      func(story) {
        story.isActive and (now - story.timeCreated < expiredThreshold);
      }
    );
  };

  public query ({ caller }) func getStoryById(storyId : Nat) : async ?Story {
    stories.get(storyId);
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

  func updatePost(postId : Nat, updateFunc : StoredPost -> StoredPost) : () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { posts.add(postId, updateFunc(post)) };
    };
  };

  func ensureNotBlocked(user : Principal) : () {
    switch (userProfiles.get(user)) {
      case (?profile) {
        if (profile.blocked) {
          Runtime.trap("User is blocked and cannot perform this action");
        };
      };
      case (null) {};
    };
  };

  func isAdminOrOfficer(user : Principal) : Bool {
    let role = AccessControl.getUserRole(accessControlState, user);
    switch (role) {
      case (#admin) { true };
      case _ {
        switch (userProfiles.get(user)) {
          case (?profile) {
            switch (profile.role) {
              case (#admin) { true };
              case (#officer) { true };
              case (#user) { false };
            };
          };
          case (null) { false };
        };
      };
    };
  };

  func createFollowRequest(requester : Principal, target : Principal) : () {
    let newRequest : FollowRequest = {
      id = nextFollowRequestId;
      requester;
      target;
      timeCreated = Time.now();
      approved = false;
      denied = false;
    };

    let requests = switch (followRequests.get(target)) {
      case (null) { List.empty<FollowRequest>() };
      case (?list) { list };
    };

    let newRequests = requests.clone();
    newRequests.add(newRequest);
    followRequests.add(target, newRequests);

    nextFollowRequestId += 1;
  };

  func isPrivateProfile(user : Principal) : Bool {
    switch (userProfiles.get(user)) {
      case (?profile) { profile.visibility == #privateProfile };
      case (null) { false };
    };
  };

  func createFollowRequestNotification(recipient : Principal, requester : Principal) : () {
    let newNotification : Notification = {
      id = nextNotificationId;
      recipient;
      content = "You have a new follow request from " # getUsername(requester);
      notificationType = #followRequest;
      timeCreated = Time.now();
      read = false;
    };

    let notificationsList = switch (notifications.get(recipient)) {
      case (null) { List.empty<Notification>() };
      case (?list) { list };
    };

    let newNotifications = notificationsList.clone();
    newNotifications.add(newNotification);
    notifications.add(recipient, newNotifications);

    nextNotificationId += 1;
  };

  func getUsername(user : Principal) : Text {
    switch (userProfiles.get(user)) {
      case (?profile) { profile.username };
      case (null) { "" };
    };
  };
};

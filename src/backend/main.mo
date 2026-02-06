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
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

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

  type InternalStory = {
    id : Nat;
    author : Principal;
    image : Storage.ExternalBlob;
    timeCreated : Time.Time;
    isActive : Bool;
    likes : Set.Set<Principal>;
    likeCount : Nat;
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

  func isAdminOrOfficer(user : Principal) : Bool {
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
              case (#user) { false };
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
    let isOwner = Principal.equal(profile.id, caller);
    let isAdmin = isModeratorOrAbove(caller);

    let hasOrangeTick = if (isSuperAdmin(profile.id)) {
      true;
    } else {
      profile.hasOrangeTick;
    };

    {
      id = profile.id;
      username = profile.username;
      displayName = profile.displayName;
      bio = profile.bio;
      avatar = profile.avatar;
      verified = profile.verified;
      hasOrangeTick;
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

    let isSuperAdminUser = isSuperAdmin(caller);
    let newProfile : InternalUserProfile = {
      id = caller;
      username;
      displayName;
      bio;
      avatar;
      verified = isSuperAdminUser;
      hasOrangeTick = false;
      role = if (isSuperAdminUser) { #admin } else { #user };
      blocked = false;
      followersCount = 0;
      followingCount = 0;
      email = ?email;
      visibility = #publicProfile;
    };
    userProfiles.add(caller, newProfile);

    // Ensure super-admin role is set in AccessControl
    if (isSuperAdminUser) {
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    };
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
    // No authorization check - public endpoint, visibility handled by canViewProfile
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
    // No authorization check - public endpoint, visibility handled by canViewProfile
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

  public query ({ caller }) func getUserProfile(user : Principal) : async ?PublicUserProfile {
    if (not Principal.equal(caller, user) and not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless you are an admin");
    };
    switch (userProfiles.get(user)) {
      case (?profile) {
        ?toPublicUserProfile(profile, caller);
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : PublicUserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist. Create one first.") };
      case (?existingProfile) {
        let updatedProfile : InternalUserProfile = {
          id = caller;
          username = existingProfile.username;
          displayName = profile.displayName;
          bio = profile.bio;
          avatar = profile.avatar;
          verified = existingProfile.verified;
          hasOrangeTick = existingProfile.hasOrangeTick;
          role = existingProfile.role;
          blocked = existingProfile.blocked;
          followersCount = existingProfile.followersCount;
          followingCount = existingProfile.followingCount;
          email = profile.email;
          visibility = profile.visibility;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func setVerifiedStatus(user : Principal, verified : Bool) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only admins can manage verification status");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    if (isModeratorOrAbove(user)) {
      Runtime.trap("Cannot change verification status of admin users");
    };

    updateUserProfileInternal(
      user,
      func(_profile) {
        { profile with verified };
      },
    );
  };

  public shared ({ caller }) func setOrangeTick(user : Principal, hasOrangeTick : Bool) : async () {
    if (not isModeratorOrAbove(caller)) {
      Runtime.trap("Unauthorized: Only admins can manage orange tick status");
    };

    let profile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    updateUserProfileInternal(
      user,
      func(_profile) {
        { profile with hasOrangeTick };
      },
    );
  };

  // *************** Story API ***************
  func internalStoryToView(story : InternalStory) : StoryView {
    {
      story with likes = story.likes.toArray();
    };
  };

  public shared ({ caller }) func likeStory(storyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can like stories");
    };

    ensureNotBlocked(caller);

    switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story not found") };
      case (?story) {
        if (not story.isActive) { Runtime.trap("Story is no longer active") };

        if (story.likes.contains(caller)) {
          Runtime.trap("You have already liked this story");
        };

        let updatedLikes = story.likes.clone();
        updatedLikes.add(caller);
        let updatedStory = { story with likes = updatedLikes; likeCount = updatedLikes.size() };
        stories.add(storyId, updatedStory);
      };
    };
  };

  public shared ({ caller }) func unlikeStory(storyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can unlike stories");
    };

    ensureNotBlocked(caller);

    switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story not found") };
      case (?story) {
        if (not story.isActive) { Runtime.trap("Story is no longer active") };

        if (not story.likes.contains(caller)) {
          Runtime.trap("You have not liked this story");
        };

        let updatedLikes = story.likes.clone();
        updatedLikes.remove(caller);
        let updatedStory = { story with likes = updatedLikes; likeCount = updatedLikes.size() };
        stories.add(storyId, updatedStory);
      };
    };
  };

  public query ({ caller }) func getStoryLikes(storyId : Nat) : async [Principal] {
    // No authorization check - public endpoint for viewing likes
    switch (stories.get(storyId)) {
      case (null) { [] };
      case (?story) {
        story.likes.toArray();
      };
    };
  };

  // *************** Post API ***************
  public shared ({ caller }) func createPost(postInput : PostInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create posts");
    };

    ensureNotBlocked(caller);

    // SECURITY: Verify caller matches the author in postInput
    if (not Principal.equal(caller, postInput.author)) {
      Runtime.trap("Unauthorized: Cannot create post for another user");
    };

    let postId = nextPostId;
    nextPostId += 1;

    let newPost : StoredPost = {
      id = postId;
      author = caller; // Use caller instead of postInput.author for extra safety
      caption = postInput.caption;
      image = postInput.image;
      timeCreated = Time.now();
      likesCount = 0;
      commentsCount = 0;
    };

    posts.add(postId, newPost);
    postId;
  };

  public shared ({ caller }) func updatePost(postId : Nat, updatedPost : PostInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update posts");
    };

    ensureNotBlocked(caller);

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?existingPost) {
        // SECURITY: Only post author or admin can update
        if (not Principal.equal(existingPost.author, caller) and not isModeratorOrAbove(caller)) {
          Runtime.trap("Unauthorized: Only the post author or admins can update this post");
        };

        // SECURITY: Verify author in updatedPost matches existing author
        if (not Principal.equal(existingPost.author, updatedPost.author)) {
          Runtime.trap("Cannot update post: author mismatch");
        };

        let newPost : StoredPost = {
          id = postId;
          author = existingPost.author; // Keep original author
          caption = updatedPost.caption;
          image = updatedPost.image;
          timeCreated = existingPost.timeCreated;
          likesCount = existingPost.likesCount;
          commentsCount = existingPost.commentsCount;
        };

        posts.add(postId, newPost);
      };
    };
  };

  public shared ({ caller }) func deletePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete posts");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?existingPost) {
        // SECURITY: Only post author or admin can delete
        if (not Principal.equal(existingPost.author, caller) and not isModeratorOrAbove(caller)) {
          Runtime.trap("Unauthorized: Only the post author or admins can delete this post");
        };

        posts.remove(postId);
      };
    };
  };

  public query ({ caller }) func getPost(postId : Nat) : async ?Post {
    // No authorization check - posts are public
    switch (posts.get(postId)) {
      case (null) { null };
      case (?post) { ?post };
    };
  };

  public query ({ caller }) func getPostsForAuthor(author : Principal) : async [Post] {
    // No authorization check - public feed feature
    let iterator = posts.values().filter(
      func(post) {
        Principal.equal(post.author, author);
      }
    );
    iterator.toArray();
  };

  public query ({ caller }) func searchPosts(searchTerm : Text) : async [Post] {
    // No authorization check - public search feature
    let lowerSearchTerm = searchTerm.toLower();

    let results = List.empty<Post>();

    for (post in posts.values()) {
      let containsTerm = post.caption.contains(#text(lowerSearchTerm));
      if (containsTerm) {
        results.add(post);
      };
    };

    results.toArray();
  };

  public query ({ caller }) func getPostCount() : async Nat {
    // No authorization check - public metadata
    posts.size();
  };

  public query ({ caller }) func getAllPosts() : async [Post] {
    // No authorization check - public feed feature
    posts.values().toArray();
  };

  // *************** Story Creation API ***************
  public shared ({ caller }) func createStory(storyInput : StoryInput) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create stories");
    };

    ensureNotBlocked(caller);

    // SECURITY: Verify caller matches the author in storyInput
    if (not Principal.equal(caller, storyInput.author)) {
      Runtime.trap("Unauthorized: Cannot create story for another user");
    };

    let storyId = nextStoryId;
    nextStoryId += 1;

    let newStory : InternalStory = {
      id = storyId;
      author = caller; // Use caller instead of storyInput.author for extra safety
      image = storyInput.image;
      timeCreated = Time.now();
      isActive = true;
      likes = Set.empty<Principal>();
      likeCount = 0;
    };

    stories.add(storyId, newStory);
    storyId;
  };

  public shared ({ caller }) func deactivateStory(storyId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can deactivate stories");
    };

    switch (stories.get(storyId)) {
      case (null) { Runtime.trap("Story not found") };
      case (?story) {
        // SECURITY: Only story author or admin can deactivate
        if (not Principal.equal(story.author, caller) and not isModeratorOrAbove(caller)) {
          Runtime.trap("Unauthorized: Only the story author or admins can deactivate this story");
        };

        let updatedStory = { story with isActive = false };
        stories.add(storyId, updatedStory);
      };
    };
  };

  public query ({ caller }) func getStory(storyId : Nat) : async ?StoryView {
    // No authorization check - stories are public
    switch (stories.get(storyId)) {
      case (null) { null };
      case (?story) {
        ?internalStoryToView(story);
      };
    };
  };

  public query ({ caller }) func getActiveStories() : async [StoryView] {
    // No authorization check - public feature
    let iterator = stories.values().filter(
      func(story) { story.isActive }
    );
    let activeStories = iterator.toArray();
    activeStories.map<InternalStory, StoryView>(internalStoryToView);
  };

  // *************** Messaging API ***************
  public shared ({ caller }) func sendMessage(conversationId : Nat, content : Text) : async Nat {
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

    let messageId = nextMessageId;
    nextMessageId += 1;

    let newMessage : Message = {
      id = messageId;
      conversationId;
      sender = caller;
      content;
      timeCreated = Time.now();
    };

    let existingMessages = switch (messages.get(conversationId)) {
      case (null) { List.empty<Message>() };
      case (?msgs) { msgs };
    };

    existingMessages.add(newMessage);
    messages.add(conversationId, existingMessages);

    let updatedConversation = {
      conversation with
      lastMessageTime = Time.now();
    };
    conversations.add(conversationId, updatedConversation);

    messageId;
  };

  public query ({ caller }) func getConversationMessages(conversationId : Nat) : async [Message] {
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
      case (?msgs) { msgs.toArray() };
    };
  };

  public shared ({ caller }) func createConversation(otherUser : Principal) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create conversations");
    };

    ensureNotBlocked(caller);

    if (Principal.equal(caller, otherUser)) {
      Runtime.trap("Cannot create conversation with yourself");
    };

    for ((convId, conv) in conversations.entries()) {
      let participants = conv.participants;
      if (participants.size() == 2) {
        let hasCallerAndOther = participants.any(func(p) { Principal.equal(p, caller) }) and
        participants.any(func(p) { Principal.equal(p, otherUser) });
        if (hasCallerAndOther) {
          return convId;
        };
      };
    };

    let conversationId = nextConversationId;
    nextConversationId += 1;

    let newConversation : Conversation = {
      id = conversationId;
      participants = [caller, otherUser];
      lastMessageTime = Time.now();
    };

    conversations.add(conversationId, newConversation);
    conversationId;
  };

  public query ({ caller }) func getConversations() : async [Conversation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view conversations");
    };

    let userConversations = conversations.values().filter(
      func(conv) {
        conv.participants.any(func(p) { Principal.equal(p, caller) });
      }
    );

    userConversations.toArray();
  };
};

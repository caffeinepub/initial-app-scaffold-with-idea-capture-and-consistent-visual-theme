# Specification

## Summary
**Goal:** Fix the v11 regression causing missing Profile/Admin navigation and infinite loading, restore end-to-end Posts and Stories functionality by implementing missing backend methods and wiring frontend hooks, and prevent data loss on canister upgrades.

**Planned changes:**
- Fix authenticated app shell so Profile and Moderation/Admin navigation entries remain visible for eligible users and the UI never gets stuck on a global "Loading..." state.
- Add clear English error states with retry actions for failures in core auth/profile/role gating queries and other critical backend calls.
- Implement missing backend canister methods for Posts: create (caption + optional image bytes with strict limits), list (feed and by user), fetch by id, delete (author/mod), like/unlike, list likes, add comment, list comments.
- Implement missing backend canister methods for Stories: create (image bytes with strict limits), list active stories, fetch story by id (in addition to existing like/unlike/likes methods).
- Wire frontend post/story hooks and screens (Create Post, Feed, Profile grid, Post Detail, StoriesRow, Create Story, story viewer) to use the real backend APIs and remove stubbed/disabled behavior and placeholder “backend method missing” errors.
- Ensure backend role/admin-check method(s) exist for frontend role gating, including always recognizing the specified super-admin principal, and returning deterministic results without trapping.
- Preserve data across canister upgrades so existing profiles, posts, stories, likes, comments, follows, messages, notifications, feature flags, and counters are retained; add conditional migration logic if needed to avoid traps and wiping state.

**User-visible outcome:** Authenticated users can reliably navigate (including Profile and Admin/Moderation where applicable) without infinite loading; posts and stories can be created and viewed end-to-end; feeds and story rows load real backend data with proper loading/empty/error states; and content is not wiped after deployments/upgrades.

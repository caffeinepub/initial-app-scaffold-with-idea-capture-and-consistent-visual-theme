# Specification

## Summary
**Goal:** Restore end-to-end post loading/creation by exposing missing Post APIs in the Motoko canister interface and wiring frontend post hooks to the real actor methods, while making admin Profile pages fully red-themed.

**Planned changes:**
- Add/ensure Post read APIs are exported from the backend canister interface (getAllPosts, getHomeFeed for Home UI, getPostsForAuthor, getPost by id) and Post write APIs (createPost, deletePost) with existing authorization.
- Update frontend post hooks to remove stubbed “method not available” behavior, call the real backend actor methods, and surface failures via formatBackendError with English user-visible messages.
- Regenerate/update the frontend backend actor type/interface so TypeScript and runtime calls recognize the newly exposed Post APIs.
- Strengthen Profile page styling so admin/super-admin profiles use an unmistakable red theme across the full page (not only header/border) while leaving non-admin profiles unchanged and keeping badge color rules consistent.

**User-visible outcome:** Posts load correctly across Home feed, Profile post grid, Post detail, and Create/Delete flows without “method not available” errors, and admin profiles display a clearly red-themed Profile page while non-admin profiles look the same as before.

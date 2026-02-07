# Specification

## Summary
**Goal:** Retry the failed build and production deployment for the current Instabook codebase, and apply minimal fixes only if needed to unblock build/deploy success.

**Planned changes:**
- Re-run the full build (frontend TypeScript compile + backend Motoko compile) and production deployment.
- If deployment fails again, diagnose the reported error and implement the smallest possible code changes to make build/deployment succeed without breaking existing flows.
- Ensure any newly introduced/updated user-facing error messages are clear and in English, and backend failures remain visibly surfaced (no silent failures or indefinite loading).

**User-visible outcome:** The app builds and deploys successfully to production; core user flows (login, home feed, profile navigation, create post/story, admin portal access for authorized roles) continue to work, and any surfaced errors are readable in English.

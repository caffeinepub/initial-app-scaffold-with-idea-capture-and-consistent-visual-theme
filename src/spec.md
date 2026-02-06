# Specification

## Summary
**Goal:** Fix “Failed to Load Profile” by adding the missing backend profile APIs and wiring the frontend profile hooks to use them.

**Planned changes:**
- Add backend query method `getCallerUserProfile : async ?PublicUserProfile` that returns the signed-in user’s profile (or null if none), applying existing privacy/email visibility and blocked-user rules.
- Add backend profile read query methods to fetch `?PublicUserProfile` by Principal and by username, enforcing existing private-profile visibility rules via `canViewProfile`.
- Add backend shared methods to create a profile and update the caller’s profile fields (displayName, bio, avatar, email, visibility), enforcing username uniqueness and preventing any mutation from altering super-admin privileges.
- Update `frontend/src/hooks/useProfiles.ts` to remove stubbed/throwing behavior and wire React Query hooks to the real backend actor methods, formatting and surfacing errors via `formatBackendError`.
- Update the generated frontend backend interface/types used by `useActor()` so TypeScript builds cleanly and runtime calls no longer hit “method not found”.

**User-visible outcome:** Signed-in users can load into the app without the profile-loading error; users without profiles are taken to the existing profile setup flow, and profile pages can fetch/create/update profiles correctly with clear English errors when access is blocked or not allowed.

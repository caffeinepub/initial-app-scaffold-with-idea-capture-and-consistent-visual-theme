# Specification

## Summary
**Goal:** Add a minimal, working Stories feature, clarify Officer vs super-admin access/labels, and show an orange verified badge for admin profiles.

**Planned changes:**
- Update role behavior and UI copy so only Alok remains the permanent super-admin, while Officer users clearly get access to the admin tools entry point without implying they are super-admin.
- Update the verified badge UI to be role-aware: profiles with role `#admin` render an orange verified tick; other verified profiles keep the existing styling.
- Replace the StoriesRow “Coming soon” placeholder with an end-to-end Stories flow: upload an image to create a story, persist it in the backend with expiry, list active stories in the Home feed, and view a story full-screen.

**User-visible outcome:** Users can add and view image Stories from the Home feed; Officer users see clearly labeled admin/moderator tools access (without implying they can become super-admin); admin profiles show a distinct orange verified tick.

# Implementation Tasks - Gallery Social Features

## Phase 1: Database Setup

- [x] 1.1 Create `photo_likes` table with RLS policies <!-- id: 1.1 -->
- [x] 1.2 Create `photo_comments` table with RLS policies <!-- id: 1.2 -->

## Phase 2: Backend Logic

- [x] 2.1 Update `src/routes/gallery/+page.server.ts` load function to fetch likes and comments count <!-- id: 2.1 -->
- [x] 2.2 Implement `toggleLike` action in `src/routes/gallery/+page.server.ts` <!-- id: 2.2 -->
- [x] 2.3 Implement `addComment` action in `src/routes/gallery/+page.server.ts` <!-- id: 2.3 -->

## Phase 3: Frontend & UI

- [x] 3.1 Add Like button (Heart icon) to Photo Card with optimistic UI <!-- id: 3.1 -->
- [x] 3.2 Add Comments section and input form to Lightbox component <!-- id: 3.2 -->
- [x] 3.3 Implement "My Favorites" filter in the Gallery header <!-- id: 3.3 -->

## Phase 4: UI/UX Polish (Instagram Style)

- [x] 4.1 Update Photo Card (Grid) with visible social actions (Comment icon, view count, fake input) <!-- id: 4.1 -->
- [x] 4.2 Redesign Lightbox to match Instagram Web layout (Split view Desktop, Stacked Mobile) <!-- id: 4.2 -->

## Phase 5: Final UX Polish & Moderation Changes

- [ ] 5.1 Remove moderation: Auto-approve uploads and remove "Pending" badge <!-- id: 5.1 -->
- [ ] 5.2 Update Like button style: Red heart and bounce animation <!-- id: 5.2 -->
- [ ] 5.3 Implement Comment Deletion (Backend action + UI) <!-- id: 5.3 -->
- [ ] 5.4 Add Emoji Picker to Comment Input <!-- id: 5.4 -->

# Refactoring Plan

## Current Status

The project has completed an initial file organization refactor, but the reassessment found several higher-priority correctness and reliability items.

## Completed

- Moved global stylesheet to `assets/styles/global.css`.
- Organized tests under `tests/`.
- Added documentation directory.
- Removed or archived obsolete documentation during 2026-05-10 reassessment.

## Priority Refactoring Tasks

### 1. Synchronize Supabase Schema and App Code

**Priority**: Critical

Current app code expects fields not fully represented in `supabase_schema.sql`, including `profiles.role`, `profiles.org_id`, `profiles.lead_id`, `profiles.email`, `tasks.org_id`, `tasks.assigned_to_user_id`, and notification read fields.

**Target outcome**: One migration/schema source matching all app queries.

### 2. Normalize Task Assignment

**Priority**: Critical

Current mismatch:

- `createtask.tsx` inserts `assigned_to`.
- `task.tsx` and `DashboardData.tsx` query `assigned_to_user_id`.

**Target outcome**: Use one assignment column consistently, preferably `assigned_to_user_id` referencing `profiles.id` or `auth.users.id`.

### 3. Complete Notifications UI

**Priority**: High

`NotificationContext` implements fetching, realtime insert subscription, and read updates, but the tab UI is placeholder.

**Target outcome**: Notifications tab lists notifications, shows unread state, and supports mark-as-read / mark-all-as-read.

### 4. Fix Test and Lint Gates

**Priority**: High

- Fix unit test failures.
- Fix ESLint configuration resolution.
- Re-run coverage after unit tests pass.

### 5. Clean CI Workflow

**Priority**: High

- Remove or properly configure E2E job.
- Add Playwright only if Expo web E2E is officially supported.
- Avoid `npm run web` commands that do not terminate in CI.

### 6. UI and Text Polish

**Priority**: Medium

Fix spelling mistakes, informal alert text, and role-specific UX clarity.

## Deferred Ideas

- Separate admin, lead, and member dashboards.
- Add reports/analytics only after core task and notification flows are stable.
- Convert archived Mermaid diagrams into rendered assets for formal documentation.

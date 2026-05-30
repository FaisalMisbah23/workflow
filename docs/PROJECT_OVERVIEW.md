# Project Overview

## Summary

Workflow is a React Native Expo mobile application for organization-based task and team management. The app uses Expo Router for file-based navigation, NativeWind/Tailwind CSS for styling, and Supabase for authentication, PostgreSQL data storage, storage, realtime updates, and edge functions.

## Current Maturity

- **Status**: Working prototype / pre-final FYP stage
- **Completion estimate**: 75% to 85%
- **Main blocker for completion**: Unit test failures, security audit vulnerabilities, incomplete notifications tab, and inconsistent task assignment fields

## Implemented Features

- Email/password authentication through Supabase Auth
- Signup flow with profile information capture
- Organization creation; creator is promoted to `admin`
- Role-aware profile loading for `admin`, `lead`, and `member`
- Team screen with invite modal for admin/lead users
- Invite acceptance route at `app/invite/[token].tsx`
- Task creation with title, description, priority, assignee, deadline, and status
- Task list/filter/edit UI in the Tasks tab
- Dashboard summary cards for active, overdue, completed, and team member counts
- Profile editing and avatar upload to Supabase Storage
- Notification context with Supabase Realtime subscription support
- Unit, integration, and performance test suites
- GitHub Actions workflow for unit, integration, e2e, lint, and summary jobs

## Partially Implemented or Missing Features

- Notifications tab UI is incomplete; `app/(tabs)/notifications.tsx` only renders placeholder text.
- Reports screen is not implemented and should not be documented as complete.
- Role-specific dashboards are not separate screens; all roles currently enter the shared home dashboard.
- E2E test command is referenced in CI, but there is no package script for `test:e2e` and Playwright setup is not confirmed in `package.json`.
- Supabase schema files and application code are not fully synchronized.

## Actual Screens

- `app/index.tsx` - landing screen
- `app/signin.tsx` - sign in
- `app/signup.tsx` - sign up
- `app/info.tsx` - profile information collection
- `app/createorganization.jsx` - organization creation
- `app/createtask.tsx` - task creation
- `app/invite/[token].tsx` - invite acceptance
- `app/(tabs)/home.tsx` - dashboard
- `app/(tabs)/task.tsx` - task management
- `app/(tabs)/team.tsx` - team management
- `app/(tabs)/notifications.tsx` - placeholder notifications tab
- `app/(tabs)/profile.tsx` - profile management

## Current Quality Status

- **Lint**: Failing due ESLint configuration resolution issue.
- **Unit tests**: Failing; 3 suites failed, 20 tests failed, 62 passed.
- **Integration tests**: Passing; 14 tests passed.
- **Performance tests**: Passing; 21 tests passed.
- **Security audit**: 16 vulnerabilities: 5 low, 7 moderate, 4 high.

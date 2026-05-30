# Architecture

## Overview

The application is a React Native Expo mobile app using Expo Router and Supabase Backend-as-a-Service. There is no custom Express or Node.js API server in the current implementation. Client screens and context providers communicate directly with Supabase through `@supabase/supabase-js`.

## Technology Stack

| Layer | Technology | Version / Source |
|---|---|---|
| Mobile framework | Expo | ~54.0.33 |
| UI runtime | React Native | 0.81.5 |
| React | React | 19.1.0 |
| Routing | Expo Router | ~6.0.23 |
| Styling | NativeWind + Tailwind CSS | NativeWind ^4.2.3, Tailwind ^3.4.19 |
| Backend | Supabase | @supabase/supabase-js ^2.101.1 |
| Database | PostgreSQL via Supabase | Managed service |
| Testing | Jest + React Native Testing Library | Jest ^29.7.0 |
| Language | TypeScript and JavaScript | TypeScript ~5.9.2 |

## Directory Structure

```text
app/                  Expo Router screens and layouts
app/(tabs)/           Dashboard, task, team, notifications, profile tabs
components/           Reusable UI components
context/              UserContext and NotificationContext
lib/                  Supabase client setup
assets/styles/        NativeWind global CSS
tests/                Unit, integration, performance tests
supabase/functions/   Supabase Edge Functions
docs/                 Authoritative documentation
```

## Navigation Architecture

```text
Root Stack
├── index
├── signin
├── signup
├── info
├── createorganization
├── createtask
├── notifications
├── invite/[token]
└── (tabs)
    ├── home
    ├── task
    ├── team
    ├── notifications
    └── profile
```

## Authentication and Role Flow

1. User enters credentials in `app/signin.tsx`.
2. `UserContext.login()` calls `supabase.auth.signInWithPassword()`.
3. Supabase returns a session.
4. `UserContext` fetches the matching row from `profiles`.
5. Role flags are set from `profile.role`:
   - `admin`
   - `lead`
   - `member`
6. User is routed to `/(tabs)/home`.

## First-Time Admin Flow

```text
signup → info → createorganization → profile role set to admin → home
```

## Invited User Flow

```text
invite link → accept invite → create or sign into account → profile role/org assigned → signin/home
```

## Data Flow

- App state is stored in React Context.
- Authentication state is managed by Supabase Auth.
- Database queries are issued from screens/context through the Supabase client.
- Notification state is maintained in `NotificationContext` with a realtime subscription to the `notifications` table.

## Known Architecture Gaps

- Task creation writes `assigned_to`, but dashboard/task reads refer to `assigned_to_user_id` in some places.
- Code expects profile fields such as `role`, `org_id`, `lead_id`, `email`, and `avatar_url`, but `supabase_schema.sql` only defines a smaller profile schema.
- Notifications context expects `read`, while some docs/schema use `is_read`.
- The app has a notifications context, but the notifications tab UI is still placeholder.

# Improvement Areas

## Priority Matrix

| Priority | Area | Issue | Impact | Effort |
|---|---|---|---|---|
| Critical | Data model | `assigned_to`, `assigned_to_user_id`, `org_id`, `role`, `read/is_read` inconsistencies | Runtime task and notification failures | Medium |
| Critical | Tests | Unit tests failing | Blocks release/push | Medium |
| Critical | Security | 4 high audit vulnerabilities | Release risk | Medium |
| High | Lint | ESLint config not resolving | CI quality gate fails | Low |
| High | Notifications | Notifications tab is placeholder | Documented feature incomplete | Medium |
| High | CI | Playwright/E2E workflow likely invalid | CI may fail/hang | Medium |
| Medium | Documentation | Old docs were contradictory/outdated | Confusion and inaccurate submission | Low |
| Medium | UI polish | Typos and informal messages | Demo professionalism | Low |
| Medium | Role UX | Shared dashboard for all roles | Less clear admin/lead/member distinction | Medium |

## Specific Code Issues

- Fix `Password`, `Organization`, and `Achievements` UI text.
- Change login failure message to `Invalid email or password`.
- Align task assignment fields across `createtask.tsx`, `task.tsx`, `DashboardData.tsx`, and Supabase schema.
- Align notification read field as either `read` or `is_read` across schema, code, and docs.
- Complete `app/(tabs)/notifications.tsx` using `NotificationContext`.
- Decide whether reports are planned or remove them from all current-status documentation.

## Documentation Issues Resolved

- Stub docs were archived.
- Outdated generated docs and old project documentation were archived.
- Current docs now reflect React Native + Expo + Supabase rather than Express/MongoDB architecture.

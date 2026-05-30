# Testing and Reliability

## Test Stack

- Jest 29.7.0
- jest-expo ~54.0.0
- React Native Testing Library 13.2.0
- Jest Native 5.4.3

## Package Scripts

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:performance
npm run test:coverage
npm run test:ci
npm run lint
```

## Current Test Results

Assessment date: 2026-05-10

| Check | Result | Details |
|---|---|---|
| Lint | Failed | `expo lint --quiet` used ESLint 6.4.0 and could not locate a configuration file from `app/(tabs)`. |
| Unit tests | Failed | 3 suites failed, 2 passed. 20 tests failed, 62 passed. Primary failures are in component tests such as `Card.test.jsx`. |
| Integration tests | Passed | 1 suite passed, 14 tests passed. |
| Performance tests | Passed | 3 suites passed, 21 tests passed. |
| Security audit | Failed | 16 vulnerabilities: 5 low, 7 moderate, 4 high. |

## Current Quality Gate

The repository is not ready for push/release until:

- Unit test failures are fixed.
- Lint configuration is fixed.
- High severity audit findings are reviewed and remediated or documented.
- Coverage is regenerated after unit tests pass.

## Test Coverage Policy

The Jest configuration currently defines 70% thresholds for branches, functions, lines, and statements. The project objective asks for 80%+ coverage, so the roadmap includes raising thresholds after test stability improves.

## CI/CD Status

`.github/workflows/test.yml` exists and defines jobs for unit tests, integration tests, E2E tests, lint, and summary. However:

- E2E job uses Playwright but Playwright is not listed in `package.json`.
- `npm run web` starts Expo web and may not terminate naturally in CI.
- No `test:e2e` package script exists.

The workflow should be corrected before it is considered reliable.

## Reliability Risks

- Schema/code mismatch can cause runtime data errors.
- Notifications tab is not complete despite notification context logic.
- Role-based UI is partial; permissions exist mostly in logic, not separate dashboards.

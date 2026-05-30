# Roadmap

## Phase 1: Stabilization

**Target**: 1-2 days

- Fix lint configuration.
- Fix failing unit tests.
- Resolve or document high severity audit vulnerabilities.
- Add `.env` to `.gitignore` and create sanitized `.env.example`.
- Update CI workflow to match available scripts and dependencies.

## Phase 2: Data Consistency

**Target**: 2-4 days

- Align Supabase schema with app code.
- Create migration for missing fields and consistent foreign keys.
- Normalize task assignment to one field.
- Verify RLS policies for admin, lead, member, invited users, assigned tasks, and notifications.

## Phase 3: Feature Completion

**Target**: 3-5 days

- Complete notifications tab.
- Add real app screenshots to formal FYP report.
- Remove reports claims unless a reports feature is implemented.
- Polish UI wording and role-based visibility.

## Phase 4: Final Submission Readiness

**Target**: 2-3 days

- Regenerate DOCX/PDF documentation.
- Verify all diagrams and screenshots.
- Run complete local quality gate.
- Confirm CI passes on pull request.
- Prepare final demo script.

## Release Gate

Do not push/release until:

- Unit, integration, and performance tests pass.
- Lint passes.
- Security audit has no unresolved high/critical vulnerabilities or accepted documented exceptions.
- Documentation matches code.

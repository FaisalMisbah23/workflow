# Security and Privacy

## Authentication

Authentication is handled by Supabase Auth through `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()`.

## Secrets Policy

- Do not commit `.env` files containing real credentials.
- Track only sanitized examples such as `.env.example`.
- Supabase service role keys must never be exposed in the mobile client bundle.
- `EXPO_PUBLIC_*` variables are public at runtime and must only contain publishable values.

## Current Security Findings

Assessment date: 2026-05-10

`npm audit --audit-level=high` reported:

- 5 low vulnerabilities
- 7 moderate vulnerabilities
- 4 high vulnerabilities
- 0 critical vulnerabilities
- 16 total vulnerabilities

High severity findings include dependency advisories affecting packages such as `node-forge` and `picomatch` through transitive dependencies.

## Database Security

The schema enables Row Level Security on core tables in `supabase_schema.sql`. Current policies are minimal and should be expanded for organization/team access patterns.

Known gaps:

- `profiles` schema in `supabase_schema.sql` does not include all fields used by app code.
- `tasks` RLS currently allows viewing own created tasks only, while app logic needs assigned task visibility.
- `invites` access policies need review for token-based invite acceptance.

## Privacy Considerations

The app stores user profile names, emails, roles, organization membership, avatar URLs, task assignment data, and notifications. Use least-privilege RLS policies and avoid storing sensitive personal data beyond project requirements.

## Immediate Security Actions

1. Add `.env` to `.gitignore` and provide `.env.example`.
2. Remove or rotate any exposed service role key if it was committed or shared.
3. Run `npm audit fix` in a controlled branch and verify Expo compatibility.
4. Review Supabase RLS policies against actual role requirements.

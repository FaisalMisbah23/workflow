# Documentation Index

This directory contains the authoritative documentation for the FYP Workflow mobile application.

## Project Version

- **Application version**: 1.0.0
- **Stack**: React Native 0.81.5, Expo 54.0.33, Expo Router 6.0.23, Supabase, PostgreSQL, NativeWind
- **Assessment date**: 2026-05-10

## Authoritative Documents

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Current project status, implemented features, and maturity level.
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture, data flow, navigation, and design decisions.
- [AI_INTERACTION_GUIDE.md](AI_INTERACTION_GUIDE.md) - Agent behavior, automation, and safety rules.
- [REFACTORING_PLAN.md](REFACTORING_PLAN.md) - Refactoring roadmap and known code improvement tasks.
- [TESTING_AND_RELIABILITY.md](TESTING_AND_RELIABILITY.md) - Testing strategy, current test status, quality gates, and CI notes.
- [IMPROVEMENT_AREAS.md](IMPROVEMENT_AREAS.md) - Technical debt, gaps, and improvement opportunities.
- [SECURITY_AND_PRIVACY.md](SECURITY_AND_PRIVACY.md) - Security, privacy, secret handling, and data protection policies.
- [ROADMAP.md](ROADMAP.md) - Priority-based future development plan.
- [PROJECT_REASSESSMENT_REPORT.md](PROJECT_REASSESSMENT_REPORT.md) - Latest repository reassessment findings.

## Archived Documentation

Older, duplicate, generated, or outdated docs were moved to `docs/archive/docs-backup-2026-05-10/` during reassessment. Treat the files listed above as the current source of truth.

## Setup Summary

```bash
npm install
npm start
npm run test:unit
npm run test:integration
npm run test:performance
```

Environment variables are loaded from `.env` for local development. Do not commit secrets; keep `.env.example` tracked if a sanitized template is added.

## Voice AI MVP (Groq)

Voice AI is implemented via Supabase Edge Functions and requires the following secrets:

- `GROQ_API_KEY`
- `GROQ_BASE_URL` (optional, defaults to `https://api.groq.com/openai/v1`)
- `GROQ_TRANSCRIBE_MODEL` (optional, defaults to `whisper-large-v3`)
- `GROQ_INTENT_MODEL` (optional, defaults to `llama-3.1-8b-instant`)

Endpoints:

- `voice-transcribe`: audio -> transcript
- `voice-intent`: transcript -> structured intent JSON
- `voice-execute`: confirmed intent -> task creation

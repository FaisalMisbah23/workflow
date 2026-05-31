---
goal: Voice AI MVP (Groq) - end-to-end implementation
version: 1.0
date_created: 2026-05-31
last_updated: 2026-05-31
owner: Engineering
status: 'Planned'
tags: [feature, ai, voice, backend, frontend]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Implement a production-safe Voice AI MVP using Groq for intent extraction, with server-side validation, and a client push-to-talk flow that creates tasks only after explicit user confirmation.

## 1. Requirements & Constraints

- **REQ-001**: Implement end-to-end flow: audio capture -> transcription -> intent extraction -> user confirmation -> task creation.
- **REQ-002**: Use Groq for intent extraction via OpenAI-compatible API endpoint.
- **REQ-003**: Validate model output with a strict JSON schema before execution.
- **REQ-004**: Require explicit user confirmation before any data mutation.
- **SEC-001**: Do not trust client-provided userId; derive identity from auth token in edge functions.
- **SEC-002**: Enforce org membership when resolving assignees and creating tasks.
- **CON-001**: Use Supabase Edge Functions (Deno) to avoid introducing a separate backend service.
- **CON-002**: Keep audio payload size <= 5MB and duration <= 30s.
- **GUD-001**: Use deterministic prompts (temperature 0) for intent extraction.
- **PAT-001**: Follow existing Edge Function CORS pattern and JSON error responses.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Add backend voice endpoints (transcribe, intent, execute) with Groq integration and schema validation.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create `supabase/functions/voice-transcribe/index.ts` that accepts base64 audio, validates size/type, calls Groq audio transcription, and returns transcript + confidence. | | |
| TASK-002 | Create `supabase/functions/voice-intent/index.ts` that accepts transcript, calls Groq chat completion with strict JSON response, validates schema, and stores transient intent results in memory response. | | |
| TASK-003 | Create `supabase/functions/voice-execute/index.ts` that validates intent payload, derives user from auth token, resolves assignee, and inserts a task in `tasks` table. | | |
| TASK-004 | Add shared helpers in `supabase/functions/_shared/voiceSchemas.ts` for intent validation and normalization. | | |

### Implementation Phase 2

- GOAL-002: Add client UI for push-to-talk and confirmation flow.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-005 | Add `app/voice.tsx` screen: record audio, call `voice-transcribe`, call `voice-intent`, show editable confirmation form. | | |
| TASK-006 | Add entry point from `app/(tabs)/home.tsx` quick actions to open voice screen. | | |
| TASK-007 | Add `lib/voiceApi.ts` client wrapper for invoking Supabase functions and handling errors. | | |
| TASK-008 | Add dependency `expo-av` for audio recording and ensure permissions handled. | | |

### Implementation Phase 3

- GOAL-003: Add tests and docs for voice MVP.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-009 | Add unit tests for intent schema validation (Zod) under `tests/unit/voiceSchemas.test.ts`. | | |
| TASK-010 | Update `docs/PROJECT_DOCUMENTATION.md` or `docs/README.md` with Voice AI MVP usage and configuration. | | |

## 3. Alternatives

- **ALT-001**: On-device STT (offline) for transcription. Rejected for MVP due to higher complexity and inconsistent device support.
- **ALT-002**: Direct client-to-Groq calls. Rejected for security (API key exposure).

## 4. Dependencies

- **DEP-001**: Groq API key configured as Edge Function secret `GROQ_API_KEY`.
- **DEP-002**: Supabase Edge Functions enabled and deployable from `supabase/functions`.
- **DEP-003**: `expo-av` for audio recording in the client app.

## 5. Files

- **FILE-001**: `supabase/functions/voice-transcribe/index.ts`
- **FILE-002**: `supabase/functions/voice-intent/index.ts`
- **FILE-003**: `supabase/functions/voice-execute/index.ts`
- **FILE-004**: `supabase/functions/_shared/voiceSchemas.ts`
- **FILE-005**: `app/voice.tsx`
- **FILE-006**: `app/(tabs)/home.tsx`
- **FILE-007**: `lib/voiceApi.ts`
- **FILE-008**: `package.json`
- **FILE-009**: `tests/unit/voiceSchemas.test.ts`

## 6. Testing

- **TEST-001**: Validate intent schema parsing with valid and invalid payloads.
- **TEST-002**: Voice execute rejects missing confirmation or missing required fields.
- **TEST-003**: Voice execute enforces org membership and assignee validity.

## 7. Risks & Assumptions

- **RISK-001**: Groq transcription endpoint may differ from OpenAI-compatible path; update if needed.
- **RISK-002**: Assignee name matching can be ambiguous; default to unassigned if no match.
- **ASSUMPTION-001**: `tasks` table contains `org_id`, `created_by`, `assigned_to_user_id`, `priority`, `status`, `deadline`.

## 8. Related Specifications / Further Reading

- https://console.groq.com/docs
- https://supabase.com/docs/guides/functions

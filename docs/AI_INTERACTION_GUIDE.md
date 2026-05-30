# AI Interaction Guide

## Purpose

This guide defines how AI assistants and automation should interact with this repository.

## Rules

- Inspect current code before changing documentation or implementation.
- Prefer small, targeted changes over broad rewrites.
- Do not push to GitHub unless all required local checks pass.
- Do not commit secrets, API keys, Supabase service role keys, generated native folders, or local build artifacts.
- Do not use destructive commands unless explicitly requested and justified.
- Archive obsolete documentation before deletion when historical context may be useful.
- Keep `/docs` synchronized with `package.json`, `app/`, `context/`, `components/`, `lib/`, `supabase/`, and `tests/`.

## Automation Safety

Safe read-only commands include:

```bash
find . -maxdepth 3 -type f
npm run test:unit -- --runInBand
npm run test:integration -- --runInBand
npm run test:performance -- --runInBand
npm audit --audit-level=high
```

Commands that mutate files, dependencies, Git history, Supabase state, or deployments require explicit review.

## Documentation Policy

- Use `UPPERCASE_WITH_UNDERSCORES.md` for docs, except `README.md`.
- Each topic should have one authoritative document.
- Deprecated docs should be archived under `docs/archive/docs-backup-YYYY-MM-DD/`.
- Internal references must point to current authoritative documents.

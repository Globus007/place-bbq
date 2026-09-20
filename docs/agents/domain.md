# Domain Docs

How engineering skills consume this repo's domain documentation.

This repo is **single-context**.

## Before exploring, read these

- `CONTEXT.md` at the repo root, or
- `CONTEXT-MAP.md` at the repo root if it exists: it points at one `CONTEXT.md` per context. Read each file that is relevant to the topic.
- `docs/adr/`: read ADRs that touch the area of work. In a multi-context repo, also read `src/<context>/docs/adr/`.

If a file does not exist, **continue**. Do not flag the absence. Do not suggest that you create the file now. `/domain-modeling` (via `/grill-with-docs` and `/improve-codebase-architecture`) creates these files when terms or decisions are resolved.

## File structure

Single-context (this repo):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context (`CONTEXT-MAP.md` at the root):

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## Use the glossary's vocabulary

When output names a domain concept, use the term in `CONTEXT.md`. Do not use a synonym that the glossary avoids.

If the concept is not in the glossary: either the project does not use this language (reconsider) or there is a gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If output contradicts an ADR, state the conflict. Do not silently override:

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_

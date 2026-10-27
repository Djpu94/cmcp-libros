---
name: performance
description: "Implement efficient book search, filtering, pagination, Prisma queries, and React rendering. Use when changing lists, database access, search, or rendering performance."
---

# Performance practices

## NestJS and Prisma
- Require bounded, validated pagination for list endpoints; apply server-side filtering and sorting.
- Select only fields needed by the response, especially for list views.
- Exclude soft-deleted records (`deletedAt: null`) in normal book queries, unless the operation explicitly targets deleted records.
- Add database indexes only for demonstrated or expected query patterns, and keep indexes/migrations aligned with the Prisma schema.
- Avoid N+1 query patterns and unbounded result sets. Use transactions when multiple writes must be atomic, not as a default wrapper.

## React
- Debounce user-entered search before requesting filtered results; cancel or ignore stale requests when the current project supports it.
- Keep filter and pagination state coherent. Persist it in URL search parameters when that matches the existing routing and UX.
- Avoid premature memoization. Measure or identify a concrete expensive render before adding `memo`, `useMemo`, or `useCallback`.
- Use lazy loading for substantial screens or routes when it meaningfully reduces initial load.

## Verify
- Preserve pagination, filtering, and soft-delete behavior with tests.
- Use existing profiling or measurement tools when making performance claims; do not claim an optimization without evidence.
- Run the relevant tests and compare behavior before and after the change where practical.

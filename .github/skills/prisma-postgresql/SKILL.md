---
name: prisma-postgresql
description: "Design Prisma models, PostgreSQL migrations, indexes, relations, and safe database queries for the books application. Use when changing schema.prisma, migrations, or persistence logic."
---

# Prisma and PostgreSQL

## Schema and migrations
- Treat `schema.prisma` as the declarative model and create migrations using the repository's Prisma workflow.
- Review generated SQL for destructive or unexpectedly expensive changes before applying it.
- Never edit an already-applied migration to alter database history; add a new migration.
- Use appropriate PostgreSQL types and precision for money-like values; avoid floating-point representations for persisted currency.
- Model relations and optional audit fields consistently with business requirements.

## Queries
- Use Prisma's typed, parameterized query APIs. Avoid raw SQL unless necessary; parameterize values if raw SQL is justified.
- Bound list queries with validated pagination and select only required fields.
- Apply `deletedAt: null` to normal queries for soft-deleted entities. A soft delete updates the timestamp; it does not physically remove the row.
- Use indexes for observed filtering, sorting, uniqueness, or relationship access patterns. Validate index usefulness rather than adding every suggested index automatically.
- Use transactions for operations whose writes must succeed or fail together.

## Data integrity and verification
- Enforce uniqueness and required invariants in the database where appropriate, in addition to application validation.
- Handle known Prisma constraint errors at the application boundary without leaking database internals.
- Verify schema changes with Prisma validation/generation and migration checks available in the project.
- Never run destructive production database operations without explicit authorization.

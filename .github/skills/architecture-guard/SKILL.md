---
name: architecture-guard
description: "Preserve the modular feature-based architecture and dependency boundaries in the NestJS backend and React frontend. Use when adding features, files, modules, or refactoring."
---

# Architecture boundaries

## Backend: NestJS
- Group code by business feature (`auth`, `books`) and keep genuinely cross-cutting components in `common/`.
- Keep HTTP handling in controllers, business rules in services, and persistence behind a repository only where the added boundary is useful.
- Use the existing Prisma module/service as the database integration surface. Controllers must not query Prisma directly.
- Keep DTOs, guards, strategies, filters, interceptors, and decorators in the appropriate feature or shared area used by this project.
- Register new NestJS modules through the existing module composition; do not create parallel application roots.

## Frontend: React + TypeScript
- Group business UI and behavior by feature (`auth`, `books`); put application composition, routes, and providers in `app/`.
- Keep reusable UI and business-agnostic hooks/utilities in `shared/`; keep low-level HTTP and storage integration in `lib/`.
- Put domain types in their existing canonical location. Do not create competing copies of the same model.
- Features must not reach into another feature's private implementation. Share a small public API or move genuinely shared behavior to an appropriate shared layer.
- Maintain the repository's existing dependency direction. In the proposed structure, higher-level composition may use features, and features may use shared/domain/low-level utilities; lower-level layers must not import application or feature code.

## Change procedure
1. Inspect neighboring modules, exports, routes, and tests before choosing a location.
2. Add files within the existing feature boundary and expose only the public surface needed by callers.
3. Wire modules/routes/providers using existing composition points.
4. Update directly related tests and documentation.
5. Check imports for cycles, cross-feature private imports, and duplicated ownership.

Do not introduce a full Clean Architecture or reorganize the project unless the user explicitly requests it or the current structure cannot satisfy a concrete requirement.

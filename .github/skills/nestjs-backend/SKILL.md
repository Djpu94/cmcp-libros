---
name: nestjs-backend
description: "Implement and maintain NestJS modules, controllers, services, DTOs, guards, filters, and API endpoints for the books application. Use for NestJS backend development."
---

# NestJS backend development

## Module and layer design
- Organize backend code by feature (for example, `auth` and `books`) and register features through the existing module graph.
- Keep controllers focused on HTTP routing, request/response mapping, and API metadata.
- Put business rules in injectable services. Use a repository abstraction only where it improves separation or testing; follow the existing module pattern.
- Put cross-cutting behavior in shared providers such as guards, filters, and interceptors, and register it only at the intended scope.

## API boundaries
- Use dedicated DTOs for create, update, and query input where their contracts differ.
- Apply server-side validation and transformation through the existing global validation configuration.
- Keep status codes, response shapes, Swagger documentation, and runtime behavior consistent.
- Protect book routes with the established authentication guard; keep login/public access explicit.

## Errors and transactions
- Translate expected failures into appropriate NestJS exceptions and let centralized handling format the response.
- Avoid broad `try/catch` blocks that swallow or obscure errors.
- Use a database transaction when a multi-write business operation must be atomic.

## Quality
- Inject dependencies through NestJS providers rather than constructing services manually in production code.
- Test service behavior and controller contracts using project conventions.
- Check module wiring, guards, validation, lint, types, and relevant tests after changes.

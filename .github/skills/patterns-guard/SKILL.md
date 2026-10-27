---
name: patterns-guard
description: "Use NestJS DTOs, guards, filters, interceptors, and persistence patterns consistently without overengineering. Use when implementing cross-cutting behavior or changing these patterns."
---

# Patterns and responsibilities

| Pattern | Responsibility |
|---|---|
| DTO | Validate and describe input/output contracts at application boundaries. |
| Guard | Authenticate or authorize a request before protected handlers execute. |
| Exception filter | Translate known application/framework errors into a consistent HTTP response. |
| Interceptor | Implement cross-cutting request/response behavior such as timing or response transformation where required. |
| Repository | Isolate persistence when it materially improves testability or dependency inversion. |

## Rules
- Follow existing NestJS registration and dependency-injection patterns.
- Map known Prisma errors deliberately (for example, unique constraint conflicts) to suitable HTTP errors; do not expose raw database messages.
- Keep response transformation consistent with the API contract; do not wrap responses if that would break existing consumers.
- Do not use a global catch-all pattern to disguise programming errors as successful responses.
- Use one clear validation boundary and avoid duplicating validation rules inconsistently across layers.
- Avoid adding patterns solely to satisfy a checklist. Explain and test a new abstraction's concrete benefit.

## Review checklist
- Are responsibilities in the correct layer?
- Are errors mapped intentionally and observable?
- Is the pattern registered and applied at the intended scope?
- Are sensitive fields excluded from public responses?
- Are tests covering the pattern's externally visible behavior?

---
name: observability
description: "Implement useful error handling, structured logging, audit events, and traceability in the NestJS and React application. Use when changing errors, mutations, or request diagnostics."
---

# Errors, logging, and traceability

## Backend errors
- Use typed/domain errors and NestJS HTTP exceptions for expected failure cases.
- Centralize HTTP error formatting using the existing filter or error-handling pattern.
- Include useful context such as timestamp, request path, status, and a correlation/request ID when available.
- Return safe, user-appropriate messages; keep stack traces and internal details out of production responses.
- Do not catch an error unless the code can add context, recover intentionally, or translate it. Re-throw or propagate unexpected errors.

## Logging and audit
- Use the project's logger and structured fields; record the request/action, entity identifier, actor identifier when authenticated, outcome, and correlation ID where available.
- Record audit events for mutations only where required by the product/evaluation; make the audit write atomic with the mutation if both must succeed together.
- Never log passwords, access/refresh tokens, secrets, or full request bodies that may contain sensitive data.
- Avoid duplicate logs for the same failure at multiple layers.

## Frontend
- Convert API errors into clear user messages; do not show raw response internals or stack traces.
- Handle authentication failures and authorization failures according to the existing routing/session design.
- Use an error boundary for render failures if the app's component architecture supports it; it does not replace API error handling.

## Traceability
- Propagate request/correlation identifiers across logs when supported.
- Ensure logs allow an operator to locate a failed action without exposing sensitive data.
- Test error status/shape and important audit behavior.

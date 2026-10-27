---
name: react-typescript
description: "Build React and TypeScript interfaces, hooks, forms, and API integrations for the books application using accessible, testable feature-based patterns. Use for frontend development."
---

# React and TypeScript

## Structure and components
- Keep business components, hooks, API adapters, and types within their feature where practical.
- Keep shared UI and utilities business-agnostic; avoid feature-to-feature imports.
- Use function components and typed props. Keep component state local unless it is shared or belongs in URL/application state.
- Separate API transport from presentation and follow the existing data-fetching approach.

## State and asynchronous work
- Model loading, success, empty, and error states explicitly.
- Avoid duplicate or stale requests when filters/search change; follow the project's cancellation or query-library pattern.
- Debounce search where necessary, and keep pagination in sync with filters.
- Use memoization only when supported by a concrete performance need.

## Forms and accessibility
- Reuse the project's form and schema-validation libraries if present; do not introduce new dependencies without approval.
- Provide visible labels, accessible validation messages, keyboard support, and clear pending/disabled states.
- Treat client validation as UX only; the server remains authoritative.
- Validate image uploads in the UI for feedback, while relying on server-side validation for security.

## Type safety and tests
- Avoid `any`; type API inputs and responses and narrow unknown data at boundaries.
- Test visible behavior and important interactions, including loading, empty, error, and validation states.
- Run the frontend's configured type-check, lint, and focused tests.

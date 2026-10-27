---
name: testing-80
description: "Write and maintain unit and integration tests for NestJS services, Prisma-backed logic, React components, and hooks. Use when adding or changing tests or verifying coverage."
---

# Testing standards

## Approach
- Follow the repository's installed test runner and established test patterns; do not assume Jest or Vitest without checking.
- Use Arrange–Act–Assert and descriptive test names that explain observable behavior.
- Cover success paths, validation and error paths, and important boundary cases.
- Test behavior rather than private implementation details.
- Mock external boundaries (database, HTTP, navigation) for unit tests. Use integration tests when real integration behavior is the requirement and the project has suitable setup.

## Priority behaviors
- Book listing: filters, ordering, bounded pagination, and exclusion of soft-deleted rows.
- Book removal: sets `deletedAt` rather than physically deleting a record.
- Authentication and protected routes: expected access and rejection behavior.
- React hooks and views: loading, success, empty, error, and user interaction states.
- Forms: invalid input feedback and valid submission.

## Coverage
- The supplied evaluation context sets a target above 80%. Check the repository's coverage configuration and measure statements, branches, functions, and lines using its existing command.
- Do not game coverage with tests that assert no meaningful behavior. Report actual measured coverage and any uncovered critical branches.
- Keep tests adjacent to source only if that matches the repository's current layout.

## Completion
- Run the narrowest relevant test selection first, then the configured coverage command when required.
- If tests fail, inspect the failure and fix the root cause; do not repeat the same change without new evidence.

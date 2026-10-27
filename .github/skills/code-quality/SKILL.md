---
name: code-quality
description: "Apply code quality, readability, SOLID, and naming conventions in this NestJS, Prisma, React, and TypeScript project. Use when writing, reviewing, or refactoring application code."
---

# Code quality and naming

## Before changing code
- Read the existing implementation and follow its established conventions.
- Keep each change focused on the requested behavior; do not refactor unrelated code.
- Prefer clear, direct code over abstractions that do not solve a current need.

## Naming
- Use `kebab-case` for NestJS filenames with role suffixes, such as `books.service.ts` and `create-book.dto.ts`.
- Use `PascalCase` for classes, types, interfaces, and React component files/names, such as `BooksService` and `BookList.tsx`.
- Use `camelCase` for variables, functions, methods, and properties.
- Use `UPPER_SNAKE_CASE` for module-level constants only when the project convention treats them as fixed configuration/constants; otherwise follow existing naming.
- Name booleans as predicates (`isActive`, `hasBooks`) and functions for the action or result they represent.

## TypeScript
- Prefer `const`; use `let` only when reassignment is needed; do not use `var`.
- Avoid `any`. Use specific types, generics, or `unknown` with narrowing.
- Give public APIs and non-trivial functions explicit types where inference does not make the contract clear.
- Validate external data at boundaries; a TypeScript type alone does not validate runtime input.
- Avoid non-null assertions and unsafe casts unless a verified invariant justifies them.

## Design and readability
- Keep controllers focused on HTTP concerns and move business rules into services/use cases.
- Give a unit one clear responsibility. Avoid duplicated business rules and oversized functions.
- Depend on abstractions where they improve substitution or testing; do not add repository layers mechanically.
- Make error paths and side effects explicit. Do not silently swallow exceptions or return success-shaped fallbacks.
- Keep comments for non-obvious intent; prefer self-explanatory code.

## Completion
- Run the narrowest relevant tests, lint, or type-check available.
- Report changed behavior and validation results; state clearly if a check could not be run.

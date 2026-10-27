---
name: docs-deploy
description: "Document architecture, setup, API behavior, Swagger, and deployment for the books application. Use when changing README, API documentation, Docker configuration, or release/deployment steps."
---

# Documentation and deployment

## README
Keep setup instructions aligned with the actual repository and document:
- Prerequisites and the shortest verified local start procedure.
- Required environment variables and how to provide them, using placeholders rather than real secrets.
- Main user flows: login, list/filter books, create/update, and any implemented export flow.
- Architecture and important design decisions, including feature modules, soft deletion, pagination, and any repository abstraction actually present.
- Test, lint, build, migration, and API documentation commands that exist in package scripts.
- A Mermaid architecture or data model diagram when useful and consistent with implemented code.

Do not document unimplemented behavior or claim a command works without verifying it.

## API documentation
- Keep Swagger/OpenAPI descriptions, DTO validation, and actual endpoint behavior consistent.
- Document authentication requirements and representative request/response shapes.
- Add examples that are safe and contain no real credentials or personal data.

## Docker and deployment
- Reuse existing Dockerfiles and Compose conventions. Keep service names, ports, health checks, and startup dependencies accurate.
- Do not put production credentials in Compose files. Use environment variables/secrets and a documented example file with placeholders.
- Ensure migrations are run using the project's supported deployment workflow and do not assume the database is ready just because its container started.
- Distinguish development configuration from production configuration.

## Verification
- Check links, commands, environment-variable names, and paths against the implementation.
- Build or validate changed deployment configuration with available project tooling.

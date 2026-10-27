---
name: docker-deployment
description: "Create or update Dockerfiles and Docker Compose deployment for the React, NestJS, and PostgreSQL application. Use when changing container builds, service wiring, environment configuration, or startup."
---

# Docker and deployment

## Container configuration
- Follow the repository's existing Docker and Compose layout; inspect paths and package scripts before changing commands.
- Use supported, appropriately pinned base images and multi-stage builds when they reduce runtime image contents.
- Run application processes as a non-root user when practical and avoid copying development dependencies or local secrets into production images.
- Use `.dockerignore` to exclude generated output, dependencies, VCS data, and local environment files where appropriate.

## Service startup
- Configure database connection values through environment variables, not hardcoded credentials.
- Use health checks and readiness-aware startup/migration flows; container start order alone does not prove PostgreSQL is ready.
- Run Prisma migrations through the documented deployment process, not an unsafe development migration command in production.
- Keep frontend/backend URLs and exposed ports consistent with the application configuration.

## Security and operations
- Use placeholders in `.env.example`; do not commit real passwords, JWT secrets, or tokens.
- Separate development and production settings, minimize exposed ports, and persist database data with an explicit volume.
- Make startup failures visible and preserve useful logs; do not mask failed migrations or service readiness.

## Verify
- Validate Compose configuration and build the affected images using available project commands.
- Check that documented startup, health, migration, and shutdown behavior matches the actual configuration.

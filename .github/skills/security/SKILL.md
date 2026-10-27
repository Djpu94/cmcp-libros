---
name: security
description: "Apply secure authentication, authorization, input validation, secret handling, and safe data access in the NestJS and React books application. Use when changing auth, uploads, validation, or sensitive data."
---

# Security practices

## Authentication and authorization
- Use the project's established Passport/JWT integration and verify tokens with an explicitly configured algorithm and expiry.
- Keep protected book operations behind authentication. Apply role checks only when the requirements define roles/permissions.
- Keep public routes explicit and minimal; do not accidentally mark protected endpoints public.
- Never trust client-provided user identifiers for audit or ownership decisions; derive the actor from the verified request identity.

## Input and data access
- Validate requests at the server boundary using DTOs and the configured validation pipe.
- Reject unexpected fields where compatible with the API contract; constrain string lengths, numeric ranges, pagination, sort fields, and upload properties.
- Use Prisma's parameterized query APIs. Do not construct raw SQL from untrusted input.
- Prevent mass assignment by mapping allowed DTO fields deliberately.
- Exclude secrets and private fields from responses and logs.

## Secrets and tokens
- Read secrets from environment/secret-management configuration; never hardcode, commit, or log them.
- Provide only clearly fake placeholders in example environment files.
- Prefer secure, HttpOnly, SameSite cookies or in-memory token handling according to the app's threat model; do not select local storage by default for sensitive tokens.
- Configure cookie, CORS, and CSRF protections consistently with the chosen authentication transport.

## Uploads and rendering
- Validate upload size and permitted content on the server; do not rely only on browser checks or file extensions.
- Avoid rendering untrusted HTML. Do not pass user content to unsafe HTML APIs.
- Keep dependencies within the approved stack unless the user authorizes a change.

## Verification
- Test unauthorized, invalid-input, and sensitive-field exposure cases relevant to the change.
- Do not claim a security guarantee that the implementation or tests do not establish.

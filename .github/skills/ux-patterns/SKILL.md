---
name: ux-patterns
description: "Build accessible, responsive login and book-listing experiences with clear loading, empty, validation, and error states. Use when implementing React forms, filters, tables, or pagination."
---

# UX standards

## Feedback and states
- Show a visible loading state for asynchronous work and prevent duplicate form submissions while a request is pending.
- Present user-friendly errors without exposing stack traces or internal details.
- Provide an explicit empty state for no books/results and a clear way to reset active filters.
- Preserve user input when an operation fails where practical.

## Search, filters, and forms
- Debounce search requests and keep pagination consistent when filters change; reset to the first page when appropriate.
- Use URL query parameters for shareable/persistent filters when aligned with the app's router.
- Validate input on the client for prompt feedback and on the server as the authority.
- For price, accept valid decimal values and reject non-positive values if the product requirement requires a positive price.
- For image upload, show a preview only after validating permitted formats and configured size limits; do not trust filename or client validation as server-side validation.

## Accessibility
- Associate every form control with a visible label or accessible name.
- Ensure buttons and pagination controls have clear accessible labels and usable disabled states.
- Use semantic table markup with a caption or accessible name.
- Keep keyboard focus visible, announce important dynamic feedback where appropriate, and do not rely on color alone.

## Responsive behavior
- Verify forms, tables, filters, and navigation at narrow and wide viewport sizes.
- Prefer usable overflow or responsive layouts over silently hiding essential information.

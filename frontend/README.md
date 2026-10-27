# CMCP Libros frontend

React, TypeScript, and Vite application.

## Development

From the repository root, install dependencies and start the frontend:

```sh
npm install
npm run dev --workspace frontend
```

Set `VITE_API_URL` to the backend base URL when it differs from
`http://localhost:3000`. The login screen is available at `/login`.

## Validation

```sh
npm run build --workspace frontend
npm test --workspace frontend
npm run lint --workspace frontend
```

The access token is kept in memory and mirrored to `sessionStorage` to survive
page reloads within the tab. `sessionStorage` is accessible to JavaScript, so
this improves convenience but does not protect the token from an XSS attack.

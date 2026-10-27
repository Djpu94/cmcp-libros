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

## Book cover images

The book form accepts PNG or JPEG files up to 5 MB. The picked file is shown as
a local preview and, on save, uploaded to `POST /books/cover`. The backend
checks the file's signature (not its extension or MIME type), stores it in
`backend/uploads/books/` under a random name, and serves it from `/uploads`.
The book then stores the returned URL in `imageUrl`. Pasting a URL in
"URL de la portada" also works; the uploaded file takes precedence when both are
set. Uploads are not part of version control (`uploads/` is git-ignored).

## Validation

```sh
npm run build --workspace frontend
npm test --workspace frontend
npm run lint --workspace frontend
```

The access token is kept in memory and mirrored to `sessionStorage` to survive
page reloads within the tab. `sessionStorage` is accessible to JavaScript, so
this improves convenience but does not protect the token from an XSS attack.

# cmcp-libros

CMPC Libros — Sistema de inventario Full Stack (NestJS + React + PostgreSQL). CRUD de libros con JWT, soft delete, filtros avanzados, paginación server-side, búsqueda con debounce, exportación CSV, auditoría y Swagger. Arquitectura modular por features, Prisma ORM, tests ≥80%, Docker Compose y README con diagramas.

## Autenticación inicial

La API requiere `JWT_SECRET` definido en el entorno y no inicia si falta. `JWT_EXPIRATION` es opcional y usa `15m` por defecto. Tras configurar `DATABASE_URL` y sincronizar el esquema de Prisma, define `SEED_ADMIN_PASSWORD` con una contraseña fuerte antes de ejecutar `npm run prisma:seed --workspace backend`; el seed falla explícitamente si falta esta variable.

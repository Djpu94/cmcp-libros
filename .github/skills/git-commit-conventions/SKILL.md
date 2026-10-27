---
name: git-commit-conventions
description: "Create, review, or improve Git and GitHub commit messages for this NestJS, React/Vite, Prisma, and Docker monorepo. Use when asked for a commit message, Conventional Commits, commit history, or a commit."
---

# Convenciones de commits para GitHub

Usa Conventional Commits, con mensajes en español y las convenciones de este monorepo.

## Cuándo usar

- Redactar o corregir un mensaje de commit.
- Preparar un commit cuando el usuario lo solicite.
- Revisar si un mensaje o conjunto de commits cumple las convenciones del proyecto.

## Formato

```text
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
```

El alcance es opcional: usa `docs: ...` o `ci: ...` cuando el cambio sea transversal. Para cambios localizados, elige un alcance de la lista siguiente.

## Tipos

| Tipo | Uso |
|---|---|
| `feat` | Añadir funcionalidad |
| `fix` | Corregir un bug |
| `docs` | Cambiar documentación |
| `style` | Cambios de formato sin alterar lógica |
| `refactor` | Reestructurar código sin cambiar comportamiento |
| `perf` | Mejorar rendimiento |
| `test` | Añadir o corregir pruebas |
| `build` | Cambiar build, Docker o dependencias |
| `ci` | Cambiar configuración de CI/CD |
| `chore` | Mantenimiento que no encaja en otro tipo |
| `revert` | Revertir un commit anterior |

## Alcances

Usa el alcance más específico que describa el cambio:

- `api`: backend NestJS de forma general
- `web`: frontend React/Vite
- `prisma`: esquema, migraciones o consultas del ORM
- `auth`: autenticación y autorización
- `books`: funcionalidad de libros
- `audit`: auditoría
- `docker`: Dockerfile o Docker Compose
- `deps`: dependencias
- `config`: configuración general

Si un cambio cubre varios alcances sin uno claramente principal, omite el alcance en lugar de inventar uno.

## Reglas del asunto

- Escríbelo en español, en imperativo y en minúsculas cuando corresponda: `agregar`, `corregir`, `documentar`.
- Limita la primera línea completa a 72 caracteres.
- No agregues punto final.
- Describe el resultado principal, no una lista de archivos modificados.
- Evita asuntos vagos como `cambios`, `arreglos` o `actualizaciones`.

## Cuerpo y footer

- Añade un cuerpo solo cuando aporte contexto: explica qué cambió y por qué.
- Separa el asunto, el cuerpo y el footer con una línea en blanco.
- Para relacionar trabajo con GitHub Issues, usa footers como `Closes #42` o `Refs #13`.
- Si el cambio rompe compatibilidad, indícalo con `!` en el encabezado y explica el impacto en un footer `BREAKING CHANGE:`.
- No incluyas contraseñas, tokens, claves, datos personales ni otros secretos en mensajes de commit.

## Ejemplos

```text
feat(api): agregar endpoint de creación de libros

fix(auth): corregir expiración del token JWT

feat(prisma): agregar relación de auditoría con usuarios

refactor(web): extraer el hook de búsqueda de libros

build(docker): exigir secretos mediante variables de entorno

ci: validar mensajes conventional en cada pull request

docs: documentar variables de entorno para desarrollo local

test(api): cubrir errores de validación en BooksService

perf(prisma): añadir índice para búsquedas por correo

chore(deps): actualizar NestJS a la versión compatible
```

Ejemplo con cuerpo y referencia:

```text
feat(audit): registrar cambios de libros automáticamente

Registra las operaciones de creación, actualización y eliminación
con el usuario y la entidad afectados para facilitar su trazabilidad.

Closes #58
Refs #61
```

## Flujo al preparar un commit

1. Revisa `git status` y el diff relevante antes de redactar el mensaje.
2. Basa el mensaje en el cambio real; no afirmes que hay pruebas o comportamiento que no se verificó.
3. Si el usuario pide crear el commit, confirma qué cambios están staged y revisa `git diff --cached`; no incluyas cambios ajenos al pedido.
4. No hagas `push`, `--force`, reescritura de historial ni `commit --amend` salvo que el usuario lo solicite explícitamente.
5. Si el usuario solo pide un mensaje, responde con el mensaje propuesto y no ejecutes comandos de Git.

## Automatización opcional

Commitlint, Husky, Commitizen y la generación automática de changelog son opciones de automatización separadas. No instales dependencias ni agregues hooks o workflows al aplicar esta skill, a menos que el usuario solicite esa configuración.

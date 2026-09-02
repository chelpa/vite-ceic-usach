# WikiProfes — backend de votos (prototipo)

Backend mínimo para probar el **sistema de votos real** antes de comprometerse
a un proveedor de hosting. Corre 100% local, sin cuentas ni infraestructura.

## Qué es y qué NO es

- **El modelo de datos (`schema.sql`) es el real** — migrarlo a Supabase es
  básicamente correr ese archivo allá.
- **La auth es un stand-in**: el correo se usa tal cual como identidad, nadie
  lo verifica. En producción esto lo reemplaza el magic-link de Supabase/Firebase
  Auth (si además quieren restringirlo a alumnos, ahí se confirma el dominio
  @usach.cl de verdad).
- **Moderación (decidida): las estrellas cuentan al tiro, el texto se pre-modera.**
  Un voto de 1-5 estrellas cuenta en el promedio apenas se envía — nadie
  espera para ver la nota reflejarse. Pero si el estudiante deja un
  comentario de texto, ese texto queda oculto (`comentario_moderado = false`)
  hasta que alguien del CEIC lo aprueba desde la cola de moderación. Aparte,
  cualquiera puede reportar un voto completo (`POST /api/votos/:id/reportar`),
  lo que lo saca del promedio también.

## Cómo correrlo

```bash
cd wikiprofes-backend
npm install
npm run seed     # importa los 280 profes de ../src/data/wikiprofes.json como "baseline"
npm start        # http://localhost:3001
```

`npm run seed` lee `../src/data/wikiprofes.json` por defecto — la misma data
que ya consume `/wikiprofes` en el sitio en vivo, así que no hay dos copias
de la data que se puedan desincronizar con el tiempo. (La primera versión de
este seed leía el `wikiprofes.html` standalone que se compartió junto al
backend, pero ese HTML es un snapshot más antiguo del mismo webscraping —
slug/ramos en null para los profes "solo Canva" — así que se cambió para leer
directo de la fuente que ya usa el sitio.) Para apuntar a otro archivo:
`npm run seed -- /ruta/a/otro.json` (mismo formato: `{slug, nombre, ramos,
calificacion, actualizado, resenas, origen, estimado}`).

Con el server corriendo, corre el sitio (`npm run dev` en la raíz del
proyecto Vite) y entra a `/wikiprofes`. La página intenta conectarse sola a
`http://localhost:3001` (o a `VITE_WIKIPROFES_API_URL` si se definió) al
cargar:

- **Si el backend NO está corriendo**: todo se ve exactamente como antes
  (datos estáticos horneados en el build). Cero dependencia dura.
- **Si el backend SÍ está corriendo**: las notas se actualizan con los votos
  reales de la base, y en la ficha de cada profesor aparece una sección
  "Vota tú" (estrellas + correo @usach.cl + comentario opcional).

El match entre un profesor del frontend y su fila en el backend es por
`slug` cuando el frontend tiene uno (202 de 280 — los que tienen ficha
oficial); para los 78 "solo Canva" (`slug: null` en `wikiprofes.json`) el
match cae a nombre normalizado, igual que hacía el prototipo `wikiprofes.html`
original. El backend igual les genera un slug propio (`slugify(nombre)`) para
tener una URL estable en sus propios endpoints, pero el frontend no lo conoce
de antemano — por eso el fallback por nombre sigue siendo necesario.

## Estrategia de transición (por qué no parte todo en cero)

Mientras un profesor no tenga ningún voto nuevo, su nota sigue siendo la que
ya teníamos (oficial o estimada) — el día 1 del sistema nuevo no se pierde
toda la data actual. En cuanto cae el primer voto real, ese profesor pasa a
mostrar la nota en vivo y deja de decir "Estimado". Esto vive en la vista
`profesores_con_rating` de `schema.sql` (`db.js` para la versión SQLite).

## Endpoints

- `GET /api/profesores` — listado con nota/conteo "actual" (en vivo o baseline)
- `GET /api/profesores/:idOrSlug` — detalle + comentarios históricos + votos en vivo
- `POST /api/profesores/:idOrSlug/votos` — `{ estudiante_email, estrellas, comentario }`.
  Mismo email + mismo profesor = UPDATE (revotar), no una fila nueva. La
  respuesta trae `comentario_pendiente_moderacion: true` si el comentario
  quedó esperando aprobación.
- `POST /api/votos/:id/reportar` — `{ motivo }` (moderación reactiva, cualquiera)
- `GET /api/moderacion/pendientes` — cola de comentarios sin aprobar (para el CEIC)
- `POST /api/votos/:id/aprobar` — publica el texto de ese voto
- `POST /api/votos/:id/rechazar` — borra el texto (el voto en estrellas se mantiene)

⚠️ Estos 3 últimos endpoints no tienen auth propia en el prototipo — cualquiera
que sepa la URL puede llamarlos. En Supabase esto se resuelve con una policy
de RLS que solo deja pasar a un rol admin (ver la nota en `schema.sql`); antes
de exponer este backend a internet, hay que cerrar eso.

## Variables de entorno

- `PORT` (default `3001`)
- `ALLOWED_EMAIL_DOMAIN` (default `usach.cl`) — dominio exigido para votar
- `WIKIPROFES_DB` — ruta del archivo SQLite (default `./wikiprofes.db`)

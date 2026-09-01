# Prototipo del sitio — CEIC USACH (Vite + React + Tailwind)

Segunda etapa del plan "prototipo portátil, mismo stack" de la Bitácora: ya
no es un componente suelto para copiar a mano, es un proyecto Vite
navegable de punta a punta, con el mismo stack que confirmamos que usa el
sitio real (React + React Router + Vite + Tailwind — ver bitácora, entrada
c5). Corre solo (`npm install && npm run dev`) y se puede clonar directo
adentro del repo real cuando haya acceso.

## Cómo correrlo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción a dist/
```

## Cómo publicarlo en GitHub Pages

El repo (`chelpa/vite-ceic-usach`) queda publicado en
`https://chelpa.github.io/vite-ceic-usach/` — es decir, bajo una carpeta,
no en la raíz del dominio. Eso rompe una app de Vite si no se configura
explícitamente, porque por defecto Vite pide los archivos (JS, CSS,
favicon) desde `/`, y en GitHub Pages ese `/` es el dominio raíz de
`chelpa.github.io`, no este repo — de ahí la página en blanco. Ya está
arreglado en el proyecto:

- **`vite.config.js`** tiene `base: '/vite-ceic-usach/'`, así el build
  arma todas las rutas de assets con ese prefijo.
- **`src/App.jsx`** le pasa `basename={import.meta.env.BASE_URL}` al
  `BrowserRouter`, para que las rutas internas (`/wikiprofes`, `/malla`,
  etc.) también respeten el prefijo.
- **`public/404.html`** + un script chico en `index.html` (técnica de
  [rafgraph/spa-github-pages](https://github.com/rafgraph/spa-github-pages))
  resuelven el otro problema típico de una SPA en GitHub Pages: si alguien
  entra directo a una ruta (`/vite-ceic-usach/wikiprofes`) o la refresca
  ahí, GitHub Pages no sabe que esa ruta existe del lado del cliente y
  sirve un 404 real. El truco redirige ese 404 de vuelta a la app
  codificando la ruta pedida, y la app la decodifica antes de que React
  Router monte — así no se pierde la ruta.
- **`public/.nojekyll`** evita que GitHub Pages procese el sitio con
  Jekyll (puede ignorar archivos/carpetas que empiezan con `_` o `.`).
- **`.github/workflows/deploy.yml`** es un GitHub Action que hace
  `npm ci && npm run build` y publica `dist/` en GitHub Pages
  automáticamente en cada push a `main` — no hay que acordarse de correr
  el build ni subir `dist/` a mano. Para activarlo: en el repo,
  Settings → Pages → Source → "GitHub Actions" (en vez de "Deploy from a
  branch").

Si el repo cambia de nombre en algún momento, solo hay que actualizar el
`base` en `vite.config.js` — todo lo demás usa esa misma variable.

## Qué incluye

Las 14 páginas reales del sitio (las que subiste como HTML guardado), más
WikiProfes (el buscador que ya habíamos armado como Artifact) y una
Bitácora interna del proyecto — 16 rutas en total:

- **Inicio, WikiProfes, Apuntes** — nivel superior del nav.
- **Comunidad ▾**: Preguntas frecuentes, WikiEmpresas, Convenios, Malla
  interactiva, Noticias.
- **El CEIC ▾**: Documentación, Calendario académico, Actas,
  Transparencia, Conoce nuestro programa, Quiénes somos y directiva.
- **Bitácora** — no es parte del sitio real, por eso vive detrás de la
  franja gris de arriba ("Prototipo del sitio — no es ceicusach.cl"), para
  no mezclarla con la navegación pública.

Qué páginas van en Comunidad vs. El CEIC no lo inventamos: lo sacamos
mirando, en cada HTML guardado, qué botón del header queda con la clase de
"activo" (`underline decoration-primary decoration-4 underline-offset-8`)
— ver bitácora, entradas c3 y c4.

### Contenido real vs. reconstruido

- **WikiProfes**: 280 fichas — cruce de las 202 reales del sitio (rating,
  ramos, slug, y las 613 reseñas completas de cada profesor, no solo la
  cita de la ficha de listado) con los 179 profes del Canva histórico por
  nombre (856 reseñas en total, agregando las que Canva tiene y el sitio
  no; ver entradas c9 y c12 de la bitácora para el detalle del cruce).
- **Calendario, Conoce nuestro programa, Quiénes somos y directiva**: el
  contenido (fechas, compromisos con su estado, mesa directiva con sus
  funciones) se extrajo tal cual del HTML real guardado — no es de
  relleno.
- **Documentación, Apuntes, Actas, Transparencia**: las tarjetas "Ver X"
  (enlaces a Drive, PDF del estatuto) son las reales del sitio.
- **Preguntas frecuentes, Noticias**: el sitio real mismo las tiene en "En
  construcción" — el prototipo copia ese mismo estado, no rellenamos con
  contenido inventado.
- **WikiEmpresas, Convenios**: la ESTRUCTURA ya está construida (buscador,
  tarjetas, ficha con reseñas en WikiEmpresas; grilla en Convenios) pero
  sobre datasets vacíos — no hay ninguna fuente de empresas o convenios
  reales todavía, a diferencia de WikiProfes que sí tuvo un Canva
  histórico de dónde partir. Ver "Cómo cargar datos reales" más abajo:
  apenas haya contenido, se agrega al JSON correspondiente y aparece solo,
  sin tocar el componente.
- **Malla interactiva**: ya no es un stub — usa los ramos reales de
  Ingeniería Comercial y Economía sacados de BuscaCursos (código, nombre,
  área, créditos SCT), con checkbox de avance guardado en `localStorage`
  (`ceic-malla-avance-v1`). Ingeco se agrupa por los 10 semestres reales
  (54 ramos); Economía no trae un campo de semestre confiable en la fuente
  (todos sus ramos venían marcados "nivel 3" sin importar si eran de primer
  o último año), así que sus 32 ramos se agrupan por tipo — obligatorios,
  electivos de especialidad, electivos de ciencias sociales — en vez de
  inventar una ubicación semestral. Los prerrequisitos entre ramos
  **todavía no están** — esa info solo existe en el PDF de programa de
  cada asignatura por separado, no en ninguna fuente consolidada; queda
  anotado en la página misma y pendiente en la bitácora (ver entrada c11).
- **Inicio**: la copia (textos, botones, tarjetas) es la real. Las fotos
  del carrusel y la galería no — el HTML guardado no trajo su carpeta
  `_files` con las imágenes, así que hay un textura de relleno marcada
  "(foto pendiente)" en su lugar. Cuando tengan las fotos reales, se
  reemplaza `PlaceholderPhoto` en `src/pages/Inicio.jsx` por `<img>`.
- **Quiénes somos y directiva**: mismo problema con las fotos — se usan
  avatares con iniciales (mismo patrón que WikiProfes) en vez de inventar
  caras.

## Qué se aproximó a ojo (y por qué)

El HTML que guardaron con "Guardar como" no incluyó la carpeta
`_files/index-*.css` con el CSS ya compilado del sitio, así que no
tenemos los valores exactos de color — sí tenemos, eso sí, los *nombres*
exactos de cada variable porque están en las clases del markup
(`bg-card`, `bg-ink`, `text-ink-foreground`, `border-border`,
`text-primary`, `text-accent`, `text-muted-foreground`, `chart-3`,
`chart-5`, `--font-display`). Los valores en `src/index.css` son una
aproximación razonada (teal/dorado del isotipo del CEIC) hecha para que el
prototipo se vea coherente — no son los hex reales. Si en algún momento
tienen ese CSS, se reemplazan las variables en `src/index.css` sin tocar
ningún componente.

`lucide-react` sacó los íconos de marcas (Instagram, LinkedIn, etc.) de
sus versiones recientes por temas de licencia — están re-hechos a mano en
`src/components/BrandIcons.jsx` con el mismo trazo, para no perder el
ícono del footer.

## Estructura

```
src/
  components/   Layout (header+footer+nav), PageShell/PageIntro,
                ResourceLink, UnderConstruction, BrandIcons
  pages/        una por ruta
  data/         wikiprofes.json, wikiempresas.json, convenios.json,
                calendario.json, programa.json, nosotros.json,
                bitacora.json, malla.json — todo extraído del HTML real
                (wikiempresas.json y convenios.json parten vacíos: [])
  lib/nav.js    el mapa de navegación (Comunidad/El CEIC) reconstruido
```

## Cómo cargar datos reales en WikiEmpresas y Convenios

Los dos componentes ya están terminados — cargar contenido real es editar
el JSON, no tocar código.

**`src/data/wikiempresas.json`** — arreglo de objetos con esta forma
(mismo patrón que `wikiprofes.json`):

```json
{
  "nombre": "Nombre de la empresa",
  "rubro": "Retail",
  "calificacion": 4.2,
  "actualizado": "Septiembre 2026",
  "resenas": [
    { "texto": "Reseña real de un estudiante...", "estrellas": 4, "fuente": "sitio" }
  ]
}
```

`calificacion` puede ir en `null` si todavía no hay suficientes reseñas
para promediar — la tarjeta muestra "Sin calificación todavía" en vez de
inventar un número.

**`src/data/convenios.json`** — arreglo de objetos con esta forma:

```json
{
  "nombre": "Nombre del convenio o la empresa",
  "categoria": "Descuento",
  "descripcion": "Qué incluye el convenio, en una o dos líneas.",
  "descuento": "15%",
  "vigencia": "Diciembre 2026",
  "link": "https://..."
}
```

`descuento`, `vigencia` y `link` son opcionales — si no vienen, la
tarjeta simplemente no muestra esa parte.

## Qué falta para que esto sea el sitio real

1. Reemplazar las variables de color en `src/index.css` por los valores
   reales del tema (cuando tengan el CSS compilado o acceso al repo).
2. Fotos reales del carrusel de Inicio y de la mesa directiva.
3. Conectar Preguntas frecuentes y Noticias a contenido real cuando la
   mesa lo tenga listo (hoy están "en construcción" igual que en el sitio
   real). WikiEmpresas y Convenios ya tienen la estructura lista — solo
   falta cargarles datos reales (ver sección de arriba). Para Malla
   interactiva falta agregar los prerrequisitos entre ramos, cuando
   alguien digitalice los PDF de programa.
4. La Bitácora de este prototipo guarda sus entradas en `localStorage` del
   navegador — es la misma limitación que tenía el prototipo anterior, no
   es una base de datos compartida.

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
  ramos, cita, slug) con los 179 profes del Canva histórico por nombre
  (ver entrada c9 de la bitácora para el detalle del cruce).
- **Calendario, Conoce nuestro programa, Quiénes somos y directiva**: el
  contenido (fechas, compromisos con su estado, mesa directiva con sus
  funciones) se extrajo tal cual del HTML real guardado — no es de
  relleno.
- **Documentación, Apuntes, Actas, Transparencia**: las tarjetas "Ver X"
  (enlaces a Drive, PDF del estatuto) son las reales del sitio.
- **Preguntas frecuentes, WikiEmpresas, Convenios, Noticias**: el sitio
  real mismo las tiene en "En construcción" — el prototipo copia ese mismo
  estado, no rellenamos con contenido inventado.
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
  data/         wikiprofes.json, calendario.json, programa.json,
                nosotros.json, bitacora.json — todo extraído del HTML real
  lib/nav.js    el mapa de navegación (Comunidad/El CEIC) reconstruido
```

## Qué falta para que esto sea el sitio real

1. Reemplazar las variables de color en `src/index.css` por los valores
   reales del tema (cuando tengan el CSS compilado o acceso al repo).
2. Fotos reales del carrusel de Inicio y de la mesa directiva.
3. Conectar Preguntas frecuentes, WikiEmpresas, Convenios y Noticias a
   contenido real cuando la mesa lo tenga listo (hoy están "en
   construcción" igual que en el sitio real). Para Malla interactiva falta
   agregar los prerrequisitos entre ramos, cuando alguien digitalice los
   PDF de programa.
4. La Bitácora de este prototipo guarda sus entradas en `localStorage` del
   navegador — es la misma limitación que tenía el prototipo anterior, no
   es una base de datos compartida.

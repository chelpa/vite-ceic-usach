# Prototipo del sitio — CEIC USACH (Vite + React + Tailwind)

Segunda etapa del plan "prototipo portátil, mismo stack" de la Bitácora: ya
no es un componente suelto para copiar a mano, es un proyecto Vite
navegable de punta a punta, con el mismo stack que confirmamos que usa el
sitio real (React + React Router + Vite + Tailwind — ver bitácora, entrada
c5). Corre solo (`npm install && npm run dev`) y se puede clonar directo
adentro del repo real cuando haya acceso.

**Fase actual: Beta** (en test, sin cuentas ni backend — todo vive en el
navegador de cada persona, en `localStorage`). La siguiente fase planeada
se llama **MVP-ALPHA**: agregar Supabase (login sin contraseña con correo
@usach.cl, votos reales en WikiProfes, malla/horario/apuntes guardados por
persona) — ver bitácora, entrada c22, para el paso a paso completo.

## Cómo correrlo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción a dist/
```

## Cómo actualizar el repo cuando hay archivos nuevos

No hace falta git ni terminal — GitHub Actions ya se encarga de "compilar"
el proyecto (ver sección de abajo). Lo único que hay que hacer cada vez que
llegan archivos nuevos o modificados es reemplazarlos en el repo, desde la
web de GitHub:

1. Entrá a `github.com/chelpa/vite-ceic-usach`.
2. Click en **Add file** (arriba a la derecha) → **Upload files**.
3. Arrastrá los archivos que cambiaron directo a esa página (podés
   arrastrar varios a la vez, o incluso una carpeta completa si tu
   navegador lo permite — Chrome sí). GitHub los va a poner en la misma
   ruta de la que vengan: si arrastrás la carpeta `src` completa reemplaza
   todo lo de adentro, no hace falta ir archivo por archivo como con
   `.github/workflows/deploy.yml` la primera vez (ese caso fue especial
   porque era una carpeta que no existía todavía en el repo).
4. Bajá al final y click en **Commit changes...** → **Commit changes**.
5. Listo — el Action se dispara solo (pestaña **Actions**, un par de
   minutos) y cuando termina en verde, `https://chelpa.github.io/vite-ceic-usach/`
   ya tiene lo nuevo. No hace falta tocar nada de Settings de nuevo, eso
   fue solo la primera vez.

Si un archivo tiene el mismo nombre y ruta que uno que ya existe, GitHub
lo reemplaza directo al hacer commit — no genera copias duplicadas.

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

**Importante:** de estos archivos, `.github/workflows/deploy.yml` es el que
hace que todo lo demás sirva de algo — sin él, GitHub Pages publica el
código fuente tal cual (sin "compilar" el proyecto), y eso también da
pantalla en blanco aunque el resto de los arreglos esté bien subido. Si
después de subir todo sigue en blanco, lo primero que hay que revisar es:
(1) que `.github/workflows/deploy.yml` exista en el repo, y (2) que en
Settings → Pages → Source diga "GitHub Actions" y no "Deploy from a
branch". Ver entrada c16 de la bitácora — es justo lo que pasó la primera
vez que se subieron estos cambios.

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
  no; ver entradas c9 y c12 de la bitácora para el detalle del cruce). De
  esos 280, 76 no tienen calificación oficial pero sí comentarios
  históricos de Canva con tono claramente positivo o negativo — a esos se
  les puso un puntaje **estimado** (1-5, por análisis de tono de palabras
  clave en español, no un promedio de votos) y se marcan con la etiqueta
  "Estimado" en la tarjeta y en la ficha, con una nota explicando de dónde
  sale. Nunca se estima sobre una reseña puramente oficial sin nota — solo
  cuando hay comentario de Canva detrás. Los otros 43 sin calificación se
  dejan honestamente en blanco ("Sin calificación") porque no hay señal de
  tono suficiente ni en Canva ni en el sitio. Ver entrada c15 de la
  bitácora.
- **Calendario, Conoce nuestro programa, Quiénes somos y directiva**: el
  contenido (fechas, compromisos con su estado, mesa directiva con sus
  funciones) se extrajo tal cual del HTML real guardado — no es de
  relleno.
- **Documentación, Apuntes, Actas**: las tarjetas "Ver X" (enlaces a Drive,
  PDF del estatuto) son las reales del sitio.
- **Noticias**: el sitio real dice "En construcción" — el prototipo ya
  tiene el componente de lista funcionando (fecha, categoría, título,
  resumen) sobre un dataset vacío (`src/data/noticias.json`), mismo patrón
  que WikiEmpresas/Convenios: en cuanto la mesa redacte 3-5 noticias reales,
  se agregan al JSON y aparecen solas. Ver bitácora, entrada c23.
- **Transparencia**: la parte de rendiciones (link a Drive) ya era real.
  El "Foro de preguntas" que el sitio real marca "En construcción" tiene
  ahora una versión que funciona sin backend: un formulario que arma un
  correo real a `ceic@usach.cl` (se abre en el cliente de correo de quien
  pregunta, nada queda en un servidor), más una lista de preguntas ya
  respondidas — vacía por ahora (`src/data/preguntas-transparencia.json`).
  Un foro público de verdad, con hilos visibles para todos, sigue
  pendiente porque antes hay que decidir cómo se modera. Ver bitácora,
  entrada c23.
- **Preguntas frecuentes**: el sitio real la tiene en "En construcción" —
  el prototipo copia ese mismo estado, no rellenamos con contenido
  inventado. Falta que la mesa junte las preguntas que más se repiten.
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
  (`ceic-malla-avance-v1`) y un botón para achicar las tarjetas
  (`ceic-malla-tamano-v1`) cuando se ven las 10 columnas de semestre juntas.
  Ingeco se agrupa por los 10 semestres reales (54 ramos). Economía
  también — sus 32 ramos venían con el campo de semestre roto en
  BuscaCursos (todos marcados "nivel 3"), así que se cruzó cada uno contra
  la malla curricular oficial publicada en fae.usach.cl/cice (la vigente
  desde 2023 y la anterior, porque BuscaCursos trae secciones de ambas
  corriendo en paralelo este semestre) para asignarle su semestre real —
  ver bitácora, entrada c19. Los prerrequisitos entre ramos **todavía no
  están** — esa info no está en esa malla tampoco, solo en el PDF de
  programa de cada asignatura por separado; queda anotado en la página
  misma y pendiente en la bitácora (ver entrada c11).
- **Modo oscuro y modo amigable**: los dos botones arriba a la derecha del
  header (sol/luna y el lazo 🎀) son un port directo de los mismos botones
  de buscacursos.cl (la otra herramienta de Francisco) — misma lógica,
  mismos íconos, mismo comportamiento: el sol/luna cambia entre claro y
  oscuro y siempre apaga el modo amigable; el lazo prende una paleta
  cálida rosa/crema que es independiente del ciclo claro/oscuro (se puede
  prender desde cualquiera de los dos y, al apagarla, vuelve al que tenías
  antes de prenderla). Colores en `src/index.css`
  (`:root[data-theme="dark"]` reusa el teal/dorado que ya usa la Bitácora
  en su propio modo oscuro, para que todo el ecosistema CEIC combine;
  `:root[data-theme="amigable"]` copia la paleta de buscacursos.cl). Se
  guarda en `localStorage` con claves propias (`ceic-theme`,
  `ceic-amigable`, distintas de las de buscacursos.cl para que no choquen
  si algún día se abren en el mismo navegador) y se aplica antes del
  primer paint (script en `index.html`) para que no haya flash del tema
  equivocado al cargar. Por ahora "amigable" solo cambia colores, igual
  que en buscacursos.cl — no hay ilustraciones ni tipografía distinta
  todavía. Ver bitácora, entrada c20.
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
3. Conectar Noticias, el foro de Transparencia y Preguntas frecuentes a
   contenido real cuando la mesa lo tenga listo — las tres ya tienen la
   estructura lista (ver sección de arriba), solo falta cargarles datos
   reales y, para el foro, decidir si se modera. WikiEmpresas y Convenios
   ya tienen la estructura lista — solo falta cargarles datos reales (ver
   sección de arriba). Para Malla interactiva falta agregar los
   prerrequisitos entre ramos, cuando
   alguien digitalice los PDF de programa.
4. La Bitácora de este prototipo (`/bitacora`) guarda sus entradas en
   `localStorage` del navegador — es la misma limitación que tenía el
   prototipo anterior, no es una base de datos compartida. Es una vista
   simplificada (solo línea de tiempo) que arranca con la misma info que
   `src/data/bitacora.json`; el documento completo de trabajo (con
   tarjetas por sección, ELI5 e inventario) es otro documento aparte, al
   que se puede llegar desde la franja gris de arriba ("Bitácora completa
   (plan + historial)") o desde el link "Ver el prototipo" que tiene ese
   mismo documento arriba de todo — quedaron linkeados entre sí para
   poder saltar de uno al otro mientras no estén integrados en un solo
   lugar. Desde la entrada c21: `/bitacora` ya no se queda pegada en una
   versión vieja. Cada vez que carga, compara por `id` lo que tiene
   guardado en `localStorage` contra `src/data/bitacora.json` y agrega
   automáticamente las entradas que le falten (sin tocar borradores ni
   confirmaciones que la persona ya haya hecho ahí) — ver
   `loadEntries()` en `src/pages/Bitacora.jsx`. La única condición es que
   la persona vuelva a entrar después de que el build nuevo esté
   publicado en GitHub Pages; el catch-up es automático, no hace falta
   borrar nada a mano. Como la convención de esta bitácora es no editar
   entradas viejas (una corrección se registra como entrada nueva), este
   mecanismo alcanza — nunca hace falta "actualizar" una entrada que ya
   está guardada, solo agregar las que falten.

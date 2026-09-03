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
- **Calendario académico — ahora también en formato calendario**: además
  de la vista de Lista de siempre, `/calendario` tiene vistas Mes / Semana
  / Día tipo Google Calendar, con botones "Hoy" y navegación con flechas
  (inspirado en el calendario de pruebas de buscacursos.cl). No se agregó
  ningún evento nuevo — se tomaron las mismas 23 fechas reales que ya
  existían como texto ("Del lunes 2 al sábado 14 de noviembre de 2026") y
  se les agregó `fechaInicio`/`fechaFin` en formato ISO en
  `src/data/calendario.json`, verificando cada una contra el día de la
  semana que el propio texto original menciona. Los días dentro de
  PEP1/PEP2 quedan resaltados con un fondo rojizo — es el período general
  para todo el semestre, no la fecha puntual de cada ramo (eso sería como
  el calendario de pruebas de buscacursos.cl, pero personalizado por
  sección elegida — necesita "mi horario" con cuenta propia, que es parte
  de MVP-ALPHA y además requiere datos de horario que BuscaCursos no trae
  todavía para Ingeco/Economía). Ver bitácora, entrada c24.
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

## Arreglos de una auditoría (bug de scroll + WikiProfes/Malla)

Francisco pidió revisar WikiProfes y Malla por si faltaba algo, y reportó
un bug: al hacer clic en un link del footer estando abajo del todo (por
ejemplo en /nosotros), la página cambiaba pero la vista se quedaba pegada
abajo, así que parecía que no había pasado nada. Se encontraron y
arreglaron 4 cosas reales, verificadas con Playwright:

- **Bug de scroll (el que reportó Francisco) — arreglado**: React Router,
  a diferencia de una navegación de página completa, no mueve el scroll
  al cambiar de ruta. Se agregó `src/components/ScrollToTop.jsx` (sube el
  scroll al tope en cada cambio de ruta) montado en `App.jsx`.
- **Barra de buscador de WikiProfes/WikiEmpresas tapaba la primera fila
  de tarjetas al hacer scroll — arreglado**: esa barra es sticky y se
  pega justo debajo del header, pero su posición estaba hardcodeada a
  2.375rem (38px) cuando el header real mide 69px (81px justo en 768px de
  ancho, donde el nav se acomoda distinto) — la diferencia hacía que la
  barra se metiera debajo del header y tapara contenido. Ahora el header
  mide su propia altura con `ResizeObserver` y la deja en la variable CSS
  `--header-h` (ver `Layout.jsx`), y ambas páginas usan
  `top-[var(--header-h)]` en vez de un número fijo — así nunca se
  desincroniza, en ningún ancho de pantalla.
- **Las fichas de WikiProfes/WikiEmpresas no se cerraban con Escape, y el
  fondo se podía seguir scrolleando detrás — arreglado**: se agregó un
  hook `useModalBehavior` (Escape cierra, bloquea el scroll del body
  mientras está abierta) a los dos modales.
- **Malla: las tarjetas de ramo no anunciaban su estado a lectores de
  pantalla — arreglado**: se agregó `aria-pressed` y `aria-label`
  descriptivo a los botones de ramo (ya lo tenía el botón Grande/Chica,
  faltaba en las tarjetas mismas).

De paso, la auditoría de datos encontró un hueco real que **no** se puede
arreglar sin más información: ningún ramo de Mención Economía en
`malla.json` tiene créditos SCT cargados (los 54 de Administración sí los
tienen todos) — BuscaCursos no trajo ese dato para Economía. Queda
anotado, no es un bug de código.

## Botón moño 🎀 (modo amigable): corregido para copiar ceicusach.cl, no buscacursos.cl

Primera vuelta: Francisco notó que el botón moño no se sentía como una
copia fiel — colores bien, bordes distintos. En ese momento la única
fuente con CSS real que teníamos era el HTML guardado de **buscacursos.cl**,
así que se portó su convención (`.theme-toggle`/`.icon-btn`: círculos de
34px, `border-radius:999px`).

Segunda vuelta, la correcta: Francisco aclaró que se refería a que el
moño quedara parecido a **ceicusach.cl** (\"el centro de alumnos\"), no a
buscacursos.cl. Justo entre los archivos subidos apareció el HTML
guardado real de la portada de ceicusach.cl — con el DOM ya renderizado,
algo que antes no teníamos (antes solo había una versión-cascarón sin
contenido). Ahí se ve que:

- El sitio real **no tiene** botones de tema en su header.
- Pero sí tiene un botón de ícono equivalente en función (el de abrir el
  menú en celular), y ese botón usa exactamente
  `block-border h-9 w-9 bg-card`: cuadrado, sin radius — igual que el
  resto de los botones y tarjetas del sitio.
- De paso, esa misma fuente confirmó que todo el lenguaje `block-border`/
  `block-border-lg` que ya veníamos usando en el resto del sitio (cards,
  botones, hero, footer) coincide clase por clase con el real — no era
  una aproximación, ya estaba bien.

Conclusión: la referencia de la primera vuelta (buscacursos.cl) era la
equivocada. Se revirtió — sol/luna y moño volvieron a `block-border`
cuadrado de 36×36px (`h-9 w-9`), igual que el resto de los botones-ícono
del sitio real, y se sacó la utilidad `theme-toggle-btn` que ya no se
usa. Verificado con Playwright (36×36px, `radius:0px` en las tres
paletas: claro, oscuro, amigable) y con capturas de pantalla antes/después.

**Decisión final (después de esta vuelta y vuelta):** Francisco prefiere
el look redondo para estos dos botones puntuales, más allá de qué sitio
lo usa. Quedaron como círculos otra vez — no con una utilidad nueva, sino
agregando `rounded-full` al mismo `block-border h-9 w-9` de siempre (mismo
borde, mismo tamaño, solo las esquinas al máximo). El resto del sitio
sigue con el `block-border` cuadrado sin cambios.

## "Conoce nuestro programa": 4 vistas sobre el mismo avance real

Francisco pidió poder alternar vistas en Programa, al estilo bitácora/línea
de tiempo/avance general — como el selector Mes/Semana/Día que ya tiene
Calendario. El dato real detrás de esta página son 72 compromisos (título +
estado: Completo / En progreso / No realizado) agrupados en 12 secciones —
es todo lo que el CEIC publicó, **no hay fecha por compromiso**.

Se agregó un selector con 4 vistas, todas sobre ese mismo dato:

- **Por sección** — la vista original, sin cambios: cada sección con su
  checklist.
- **Por estado** — los 72 compromisos en 3 columnas (No realizado → En
  progreso → Completo), cruzando todas las secciones. Esta es la
  resolución de "línea de tiempo": como no hay fecha real de cuándo
  cambió cada compromiso, se le preguntó a Francisco (AskUserQuestion) y
  se optó por un pipeline por etapa en vez de inventar fechas.
- **Bitácora** — una fila por sección con el mismo layout de dos columnas
  (etiqueta + tarjeta) que usa `/bitacora`, cada una con su propia mini
  barra de avance. No implica entradas fechadas, se aclara en el pie.
- **Resumen** — solo contadores y una barra por sección, sin listar los
  72 ítems uno por uno.

Verificado con Playwright: las 4 vistas cargan, alternan bien
(`aria-pressed` correcto) y los conteos cuadran entre sí (72 en total, 7
completos / 14 en progreso / 51 no realizado en las cuatro), más capturas
de pantalla de cada una.

## Bitácora: "área" además de "tipo" (plantilla reusable en otros proyectos)

Francisco pidió que la bitácora se pudiera leer con vocabulario de
ingeniería de software — de qué área es cada parte — y que quedara como
plantilla para usar en sus otros proyectos. Además de `tipo` (qué clase de
entrada es: decisión, incidencia, prototipo, etc. — la misma idea que un
ADR o un log de incidentes), cada entrada ahora tiene `area`: a qué
disciplina pertenece.

Las 7 áreas usadas (`src/pages/Bitacora.jsx`, constante `AREAS`):
**Arquitectura de Software, Frontend / UI, UX / Diseño de Interacción,
Backend / Datos, DevOps / Despliegue, QA / Verificación, Documentación /
Producto.** Se ven como una segunda etiqueta en cada tarjeta, hay un
filtro por área junto al de tipo, y el formulario de "Nueva entrada" pide
elegirla. Las 29 entradas existentes ya quedaron re-etiquetadas.

De paso se reescribió el texto de las 29 entradas para que quede claro que
Francisco es quien implementa (con Claude.ai como asistente de desarrollo,
no al revés) — antes varias usaban voz pasiva ("se agregó", "se corrigió")
que no dejaba claro quién hizo qué. Ningún dato, cifra ni hecho técnico
cambió, solo la redacción; se verificó comparando los números de cada
entrada antes/después (ninguno cambió).

## Malla interactiva 2.0: prerrequisitos, con toggle Clásica / Grilla / Grafo

`/malla` tenía pendiente desde la entrada c11 marcar qué ramo es
prerrequisito de cuál — no había ninguna fuente consolidada. Francisco
aportó dos fuentes propias (su webscraping de fae.usach.cl/cice y la matriz
completa de 10 semestres de su propio visualizador) que, cruzadas por
nombre exacto contra el dato real de BuscaCursos, resolvieron 26 ramos con
al menos un prerrequisito confirmado (31 relaciones, 23 de ellas
confirmadas por las dos fuentes a la vez) — ver bitácora, entradas c30 y
c31 para el detalle completo, incluido un conflicto de semestre entre las
dos fuentes que Francisco aclaró (una era la malla antigua de Economía).

Nueva vista **Interactiva 2.0** (`src/pages/MallaPrerrequisitos.jsx`),
seleccionable con un botón debajo del cuadro de aviso de la malla: una
**Grilla** (igual a la clásica, pero con un botón "req" por ramo que
resalta prerrequisitos y ramos que desbloquea) y un **Grafo**
(`vis-network`, nodos = ramos, flechas = prerrequisito → ramo, con layout
jerárquico por semestre y reactivo a los tres temas del sitio). Las dos
comparten el mismo `localStorage` de avance que la malla clásica
(`ceic-malla-avance-v1`) — marcar un ramo aprobado en cualquiera de las
tres vistas se refleja al instante en las otras. No todos los ramos tienen
prerrequisito registrado todavía; el cuadro de aviso de Interactiva 2.0
dice cuántos sí, por mención.

## WikiProfes: votos reales (backend prototipo local)

Francisco construyó, aparte de este proyecto Vite, un backend ejecutable
(`wikiprofes-backend/`, dentro de este mismo repo) para validar el diseño
del **sistema de votos real** de WikiProfes antes de comprometerse a un
proveedor de hosting — la decisión de usar Supabase ya estaba tomada desde
el plan de la entrada c22, esto valida el modelo de datos y las reglas de
negocio corriéndolo de verdad, 100% local, antes de pagar por infraestructura.

**Qué es y qué NO es** (documentado también en `wikiprofes-backend/README.md`,
que es la fuente autoritativa si esto y ese archivo alguna vez se
desincronizan):

- El modelo de datos (`wikiprofes-backend/schema.sql`) es el real — migrarlo
  a Supabase es básicamente correr ese archivo allá. El prototipo local usa
  SQLite (`db.js`) como equivalente ejecutable del mismo schema.
- **Moderación (decidida, no está en discusión): las estrellas cuentan al
  tiro, el texto se pre-modera.** Un voto de 1-5 estrellas cuenta en el
  promedio en vivo apenas se envía. Si el estudiante deja comentario de
  texto, ese texto queda oculto (`comentario_moderado = false`) hasta que
  alguien del CEIC lo aprueba desde la cola de moderación
  (`GET /api/moderacion/pendientes`) — es texto sobre una persona real con
  nombre y apellido, ahí sí vale la pena la demora. Cualquiera puede además
  reportar un voto completo, lo que lo saca del promedio.
- **Auth es un stand-in a propósito**: el correo `@usach.cl` se usa tal cual
  como identidad, nadie lo verifica todavía. En Supabase esto lo reemplaza
  el magic-link de Supabase Auth (retoma el plan de la entrada c22).
- **Estrategia de transición**: mientras un profesor no tenga ningún voto
  nuevo, su nota sigue siendo la que ya teníamos (oficial o estimada,
  ver entrada c15) — no se pierde toda la data actual el día 1. En cuanto
  cae el primer voto real, ese profesor pasa a mostrar la nota en vivo y
  deja de decir "Estimado". Esto vive en `profesores_con_rating`
  (`schema.sql` / `db.js`).
- Los 3 endpoints de moderación (`aprobar`, `rechazar`, `pendientes`) **no
  tienen auth propia todavía** en el prototipo — es un gap conocido y
  documentado, no un descuido: hay que cerrarlo con una policy de RLS antes
  de exponer esto a internet.

**Cómo se conecta con este proyecto Vite** (la parte que se integró recién):
`src/pages/WikiProfes.jsx` intenta, al cargar, un `fetch` con timeout de
900ms a `VITE_WIKIPROFES_API_URL` contra `GET /api/profesores`. Es
**puramente aditivo**:

- **En el build de producción (GitHub Pages) sin `VITE_WIKIPROFES_API_URL`
  definida en el build**: el fetch ni se intenta — `VOTE_API_BASE` queda
  `null` a propósito. Esto no siempre fue así: la primera versión caía por
  defecto a `http://localhost:3001` en cualquier entorno, y eso hacía que
  **cualquier visita real al sitio publicado disparara el permiso de Chrome
  para Android** "... wants to access other apps and services on this
  device" (Local Network Access / Private Network Access: Chrome pide
  permiso apenas una página HTTPS pública intenta un fetch a `localhost` o a
  una IP de red local, para que un sitio cualquiera no pueda sondear tu red
  doméstica en silencio). Era inofensivo — el fetch solo iba a fallar
  igual — pero visualmente alarmante para cualquiera que abriera
  `/wikiprofes` en el celular, y contrario a la idea de "puramente aditivo".
  Se corrigió: el fallback a `localhost:3001` ahora solo aplica en modo
  desarrollo (`import.meta.env.DEV`, o sea corriendo `npm run dev`); en
  producción, sin la variable de entorno puesta explícitamente en el build,
  no hay fetch, no hay permiso, la página no toca la red local de nadie.
- **Con el backend corriendo y `VITE_WIKIPROFES_API_URL` apuntándole** (en
  local, o el día que haya un backend real en Supabase): el fetch sí se
  intenta, y si no hay nadie escuchando, falla o se cae por timeout, el
  `catch` lo silencia, y la página se ve y se comporta exactamente igual que
  sin este código — cero fichas nuevas, cero botón "Vota tú". Verificado con
  Playwright (ver más abajo).
- **Con el backend corriendo**: las notas de los profesores que matchean se
  actualizan con las cifras en vivo, y dentro de la ficha de cada profesor
  matcheado aparece una sección "Vota tú" (estrellas + correo + comentario
  opcional) que hace `POST /api/profesores/:id/votos` y refresca la ficha
  (y la tarjeta detrás del modal) con la respuesta — sin recargar la página.
- **El match es por `slug`** cuando el profesor del frontend tiene uno (202
  de 280 — los que sí tienen ficha oficial), y cae a **nombre normalizado**
  para los 78 "solo Canva" (`slug: null` en `wikiprofes.json`), igual que
  hacía el prototipo `wikiprofes.html` original que Francisco compartió.

Para correrlo localmente: ver `wikiprofes-backend/README.md` — resumen
rápido, `cd wikiprofes-backend && npm install && npm run seed && npm start`
(el seed importa `src/data/wikiprofes.json`, la misma data que ya usa
`/wikiprofes`, como baseline).

**Nota de auditoría (sandbox de esta sesión, no del código):** en este
entorno no se pudo hacer `npm install` del backend porque `better-sqlite3`
necesita compilar un módulo nativo y descargar los headers de Node desde
`nodejs.org`, dominio que el sandbox tiene bloqueado (solo deja pasar el
registro de npm). No es un problema del código — en la máquina de Francisco,
o en cualquier entorno con salida a internet normal, `npm install` compila
sin problema. Por eso la verificación acá se hizo en dos partes: `node
--check` sobre los tres archivos del backend (sintaxis limpia) y, para el
flujo completo, Playwright interceptando las rutas `/api/profesores` y
`/api/profesores/:id/votos` con las mismas respuestas que devuelve
`formatProfesor()` en `server.js` — confirma que el frontend cumple el
contrato real del backend sin depender de poder correrlo en este sandbox.

**Qué falta para que esto sea real en producción:** migrar `schema.sql` a
un proyecto Supabase, apuntar el frontend (`VITE_WIKIPROFES_API_URL`) a la
Supabase Edge Function o API REST correspondiente en vez de `localhost`,
reemplazar la validación de dominio por Supabase Auth (magic-link), y cerrar
el gap de auth en los 3 endpoints de moderación antes de darle esa URL a
nadie del CEIC.

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

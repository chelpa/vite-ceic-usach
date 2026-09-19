// Smoke test de las 16 rutas del sitio, contra el build real servido como lo
// sirve GitHub Pages (ver tests/lib/servidor.mjs).
//
// Qué pretende atrapar, y por qué cada cosa:
//
//   1. Entrada DIRECTA a la ruta (no navegando desde "/"). Es el caso que
//      rompió dos veces: alguien abre o refresca /wikiprofes y ve blanco.
//      Depende del par 404.html + index.html; si alguien toca uno de los dos,
//      o cambia `base` en vite.config.js, esto falla acá y no en producción.
//   2. Errores de consola y excepciones. Una página que "carga" pero lanza al
//      montar se ve rota igual.
//   3. Requests fallidos (404 de un asset, un JSON que no quedó en dist/).
//   4. Que la página tenga contenido de verdad — un <h1> y texto — y no un
//      #root vacío, que es exactamente como se ve una SPA que murió al montar.
//   5. Navegación interna: que el header lleve a otra ruta sin recargar.
//
// Lo que este test NO hace, a propósito: no valida contenido editorial ni que
// un dataset tenga datos. Noticias, Convenios, WikiEmpresas y Transparencia
// están vacíos a la espera de contenido de la mesa CEIC — su estado vacío es
// el comportamiento correcto hoy, no una falla, y un test que lo prohíba se
// volvería rojo por una razón que no depende de quien programa.

import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFile } from "node:fs/promises";
import { levantarServidor, BASE } from "./lib/servidor.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(raiz, "dist");

// Las 16 rutas reales de App.jsx. Se listan a mano (y no importando App.jsx)
// para que agregar una ruta obligue a decidir explícitamente que entra al
// smoke test, en vez de colarse sin que nadie la mire.
const RUTAS = [
  { ruta: "", nombre: "Inicio" },
  { ruta: "wikiprofes", nombre: "WikiProfes" },
  { ruta: "apuntes", nombre: "Apuntes" },
  { ruta: "preguntas-frecuentes", nombre: "Preguntas frecuentes" },
  { ruta: "wikiempresas", nombre: "WikiEmpresas" },
  { ruta: "convenios", nombre: "Convenios" },
  { ruta: "malla", nombre: "Malla interactiva" },
  { ruta: "malla-preview", nombre: "Malla (preview de grilla)" },
  { ruta: "noticias", nombre: "Noticias" },
  { ruta: "documentacion", nombre: "Documentación" },
  { ruta: "calendario", nombre: "Calendario" },
  { ruta: "actas", nombre: "Actas" },
  { ruta: "transparencia", nombre: "Transparencia" },
  { ruta: "programa", nombre: "Programa" },
  { ruta: "nosotros", nombre: "Nosotros" },
  { ruta: "bitacora", nombre: "Bitácora" },
];

// Ruido de terceros que no es un problema del sitio. Se mantiene corto y
// explícito a propósito: una lista de ignorados que crece sin control es la
// forma más común de que un smoke test deje de servir.
const RUIDO_IGNORABLE = [
  /favicon\.ico/i,
  /Download the React DevTools/i,
  // "Failed to load resource" en consola es el eco de una respuesta que el
  // listener de `response` ya evalúa con su status y su URL. Ahí podemos
  // distinguir el 404 legítimo del truco de Pages; en el texto de consola no.
  // Filtrarlo acá evita contar dos veces y evita falsos rojos.
  /Failed to load resource/i,
];
const esRuido = (txt) => RUIDO_IGNORABLE.some((re) => re.test(txt));

const fallos = [];
const registrar = (ruta, detalle) => fallos.push(`${ruta || "/"} — ${detalle}`);

// --- Chequeo previo: base de vite.config.js == BASE del servidor de prueba ---
// Si divergen, el test seguiría pasando mientras prueba una URL que no es la
// de producción. Mejor fallar fuerte y temprano.
const viteConfig = await readFile(join(raiz, "vite.config.js"), "utf8");
const baseEnConfig = viteConfig.match(/base:\s*['"]([^'"]+)['"]/)?.[1];
if (baseEnConfig !== BASE) {
  console.error(
    `✗ base desincronizada: vite.config.js dice ${JSON.stringify(baseEnConfig)} ` +
      `y el servidor de prueba usa ${JSON.stringify(BASE)}. ` +
      `Actualiza BASE en tests/lib/servidor.mjs.`,
  );
  process.exit(1);
}

const servidor = await levantarServidor(dist);
// En CI el browser lo instala `npx playwright install chromium` y esto queda
// vacío. La variable existe para entornos que ya traen un Chromium propio
// (contenedores de desarrollo, un Chrome del sistema) y donde bajar otro no
// tiene sentido.
const ejecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const navegador = await chromium.launch({
  // Todo lo que este test pide vive en 127.0.0.1. Si el entorno tiene un proxy
  // configurado (contenedores de desarrollo, redes corporativas), Chromium
  // intenta tunelizar hasta el localhost y falla con ERR_TUNNEL_CONNECTION_FAILED,
  // que se lee como "el sitio está roto" cuando en realidad es la red del entorno.
  args: ["--no-proxy-server"],
  ...(ejecutable ? { executablePath: ejecutable } : {}),
});
const contexto = await navegador.newContext();

console.log(`Sirviendo ${dist} en ${servidor.base}\n`);

for (const { ruta, nombre } of RUTAS) {
  const pagina = await contexto.newPage();
  const errores = [];
  const requestsRotos = [];

  pagina.on("console", (msg) => {
    if (msg.type() === "error" && !esRuido(msg.text())) errores.push(`consola: ${msg.text()}`);
  });
  pagina.on("pageerror", (err) => errores.push(`excepción: ${err.message}`));
  // El 404 de la ruta pedida NO es una falla: es el mecanismo. Pages no tiene
  // ese archivo, responde 404.html con status 404, y ese HTML redirige. Sólo
  // ese request exacto se perdona; cualquier otro 4xx/5xx (un asset, un JSON
  // que no quedó en dist/) sí es un problema real.
  const urlDelTruco = servidor.base + ruta;
  pagina.on("response", (res) => {
    if (res.status() < 400) return;
    if (esRuido(res.url())) return;
    if (res.url() === urlDelTruco && res.status() === 404) return;
    requestsRotos.push(`${res.status()} ${res.url()}`);
  });

  try {
    // Entrada directa a la ruta, como quien pega el link en el navegador.
    await pagina.goto(servidor.base + ruta, { waitUntil: "networkidle", timeout: 30000 });

    // 1. La redirección de Pages dejó la URL en la ruta pedida.
    const urlFinal = new URL(pagina.url());
    const esperada = BASE + ruta;
    if (urlFinal.pathname !== esperada) {
      registrar(ruta, `la URL quedó en ${urlFinal.pathname}, se esperaba ${esperada} (¿se rompió el truco de 404.html?)`);
    }

    // 2. La app montó y pintó algo real.
    const texto = (await pagina.locator("#root").innerText().catch(() => "")).trim();
    if (texto.length < 40) {
      registrar(ruta, `#root quedó prácticamente vacío (${texto.length} caracteres) — la SPA no montó`);
    }
    const h1 = await pagina.locator("h1").count();
    if (h1 === 0) registrar(ruta, "no hay ningún <h1> en la página");

    // 3. Sin errores ni requests rotos.
    for (const e of errores) registrar(ruta, e);
    for (const r of requestsRotos) registrar(ruta, `request fallido: ${r}`);

    const estado = errores.length || requestsRotos.length ? "✗" : "✓";
    console.log(`${estado} ${nombre.padEnd(28)} ${esperada}`);
  } catch (err) {
    registrar(ruta, `no cargó: ${err.message}`);
    console.log(`✗ ${nombre.padEnd(28)} ${BASE + ruta}`);
  } finally {
    await pagina.close();
  }
}

// --- Ruta inexistente: tiene que caer en NotFound, no en blanco ---
{
  const pagina = await contexto.newPage();
  try {
    await pagina.goto(servidor.base + "ruta-que-no-existe-123", { waitUntil: "networkidle", timeout: 30000 });
    const texto = (await pagina.locator("#root").innerText().catch(() => "")).trim();
    if (texto.length < 20) registrar("404", "una ruta inexistente deja la página en blanco en vez de mostrar NotFound");
    else console.log(`✓ ${"Ruta inexistente → NotFound".padEnd(28)} ${BASE}ruta-que-no-existe-123`);
  } catch (err) {
    registrar("404", `no cargó: ${err.message}`);
  } finally {
    await pagina.close();
  }
}

// --- Navegación interna: el header navega sin recargar ---
{
  const pagina = await contexto.newPage();
  try {
    await pagina.goto(servidor.base, { waitUntil: "networkidle", timeout: 30000 });
    const enlace = pagina.locator('a[href$="/wikiprofes"]').first();
    if ((await enlace.count()) === 0) {
      registrar("nav", "el header no expone un enlace a /wikiprofes");
    } else {
      await enlace.click();
      await pagina.waitForURL(`**${BASE}wikiprofes`, { timeout: 10000 });
      console.log(`✓ ${"Navegación interna".padEnd(28)} Inicio → WikiProfes`);
    }
  } catch (err) {
    registrar("nav", `la navegación interna falló: ${err.message}`);
  } finally {
    await pagina.close();
  }
}

await navegador.close();
await servidor.cerrar();

console.log("");
if (fallos.length) {
  console.error(`✗ ${fallos.length} problema(s):\n`);
  for (const f of fallos) console.error(`  · ${f}`);
  process.exit(1);
}
console.log(`✓ ${RUTAS.length} rutas + 404 + navegación interna: sin errores de consola ni requests rotos.`);

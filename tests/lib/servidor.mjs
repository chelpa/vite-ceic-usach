// Servidor estático que imita a GitHub Pages — no un dev server de Vite.
//
// El porqué: los dos bugs de producción que nos pillaron (bitácora c1 y c35)
// NO se reproducían con `npm run dev`. Vite sirve index.html para cualquier
// ruta, así que la SPA "siempre funciona" en desarrollo. GitHub Pages no hace
// eso: si la ruta no existe como archivo real, devuelve 404.html. Toda la
// navegación directa del sitio publicado depende del truco de
// rafgraph/spa-github-pages (404.html codifica la ruta en el query string,
// index.html la decodifica antes de que monte React Router).
//
// Un smoke test contra el dev server no prueba nada de eso. Este servidor
// replica el comportamiento real: archivo si existe, 404.html con status 404
// si no. Es la única forma de que el test falle acá en vez de en producción.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

// BASE tiene que coincidir con vite.config.js. Si alguien cambia uno sin el
// otro, el test deja de reflejar producción — por eso se lee y se compara.
export const BASE = "/vite-ceic-usach/";

export async function levantarServidor(dist) {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    let ruta = decodeURIComponent(url.pathname);

    // Fuera del base path, Pages no sirve nada de este proyecto.
    if (!ruta.startsWith(BASE)) {
      res.writeHead(404, { "content-type": "text/plain" });
      res.end("fuera del base path");
      return;
    }

    let rel = ruta.slice(BASE.length);
    if (rel === "" || rel.endsWith("/")) rel += "index.html";

    // normalize() + el chequeo de ".." evita que un archivo pedido con
    // ../../ se escape de dist/ (el test corre en CI, no lo dejamos servir
    // el repo entero por un path malicioso en una URL de prueba).
    const seguro = normalize(rel);
    if (seguro.startsWith("..")) {
      res.writeHead(403, { "content-type": "text/plain" });
      res.end("prohibido");
      return;
    }

    try {
      const buf = await readFile(join(dist, seguro));
      res.writeHead(200, { "content-type": TIPOS[extname(seguro)] || "application/octet-stream" });
      res.end(buf);
    } catch {
      // Acá está lo importante: Pages devuelve 404.html con status 404 real.
      // No servimos index.html como haría un dev server, porque entonces el
      // truco de redirección nunca se ejercitaría y el test mentiría.
      try {
        const buf = await readFile(join(dist, "404.html"));
        res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
        res.end(buf);
      } catch {
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("sin 404.html");
      }
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    origen: `http://127.0.0.1:${port}`,
    base: `http://127.0.0.1:${port}${BASE}`,
    cerrar: () => new Promise((resolve) => server.close(resolve)),
  };
}

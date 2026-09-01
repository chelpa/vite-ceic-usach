import { useMemo, useState } from "react";
import { Briefcase, Search, Star } from "lucide-react";
import empresasRaw from "../data/wikiempresas.json";

// WikiEmpresas todavía no existe en el sitio real (dice "en construcción"), y no
// tenemos ninguna fuente de datos reales de empresas o reseñas para llenarlo — a
// diferencia de WikiProfes, acá no hay ni un Canva histórico ni un BuscaCursos.
// Así que esto es la ESTRUCTURA funcionando (buscador, tarjetas, ficha con reseñas)
// sobre un dataset vacío (src/data/wikiempresas.json = []) — lista para que alguien
// la llene con empresas reales sin tocar el componente.
// Forma esperada de cada entrada (mismo patrón que wikiprofes.json):
// { nombre, rubro, calificacion, actualizado, resenas: [{ texto, estrellas, fuente }] }

function stripAccents(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function norm(s) {
  return stripAccents(s || "").toLowerCase();
}
function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}
function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Logo({ name, size = "h-10 w-10 text-sm" }) {
  const hue = hashHue(name);
  return (
    <div
      className={"flex shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-display)] font-bold " + size}
      style={{ background: `hsl(${hue} 55% 88%)`, color: `hsl(${hue} 45% 28%)` }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}

function Stars({ rating }) {
  const r = Math.round(rating);
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={"h-3.5 w-3.5 " + (i <= r ? "fill-primary text-primary" : "text-muted-foreground/30")} />
      ))}
    </span>
  );
}

const DATA = empresasRaw.map((e, idx) => {
  const resenas = e.resenas || [];
  const haystack = norm([e.nombre, e.rubro, resenas.map((r) => r.texto).join(" ")].filter(Boolean).join(" "));
  return { ...e, _idx: idx, _haystack: haystack };
});

function Card({ e, onOpen }) {
  const quote = e.resenas[0]?.texto || "";
  return (
    <button
      type="button"
      onClick={() => onOpen(e)}
      className="block-border flex h-full flex-col gap-2 bg-card p-4 text-left transition-transform hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <Logo name={e.nombre} />
        <div>
          <h2 className="text-base leading-tight">{e.nombre}</h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{e.rubro || "Rubro no informado"}</p>
        </div>
      </div>
      {e.calificacion != null ? (
        <div className="flex items-center gap-2 text-xs">
          <Stars rating={e.calificacion} />
          <span className="font-semibold">{e.calificacion.toFixed(1)}</span>
          <span className="text-muted-foreground">
            · {e.resenas.length} {e.resenas.length === 1 ? "reseña" : "reseñas"}
          </span>
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">Sin calificación todavía</p>
      )}
      <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
        {quote ? `“${quote}”` : "Sin reseñas todavía."}
      </p>
      <div className="flex items-center justify-between border-t border-dashed border-border pt-2 text-[11px] text-muted-foreground">
        <span>{e.actualizado ? `Actualizado: ${e.actualizado}` : ""}</span>
      </div>
    </button>
  );
}

function Modal({ e, onClose }) {
  if (!e) return null;
  const resenas = e.resenas || [];
  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-foreground/55 p-4 py-[6vh]"
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div className="block-border w-full max-w-xl bg-card">
        <div className="flex items-start gap-3 border-b border-border p-5">
          <Logo name={e.nombre} size="h-13 w-13 text-lg" />
          <div className="flex-1">
            <h2 className="text-lg">{e.nombre}</h2>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{e.rubro || "Rubro no informado"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="block-border flex h-8 w-8 shrink-0 items-center justify-center bg-card"
          >
            ×
          </button>
        </div>
        <div className="p-5">
          {e.calificacion != null ? (
            <div className="mb-4 flex items-center gap-2 text-sm">
              <Stars rating={e.calificacion} />
              <span className="font-semibold">{e.calificacion.toFixed(1)}</span>
              <span className="text-muted-foreground">
                · {resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}
              </span>
            </div>
          ) : (
            <p className="mb-4 text-sm italic text-muted-foreground">Sin calificación todavía</p>
          )}
          {resenas.length ? (
            <div className="flex flex-col gap-2">
              {resenas.map((r, i) => (
                <div key={i} className="bg-secondary p-3 text-sm leading-relaxed">
                  {r.texto}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">Todavía no hay reseñas para esta empresa.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="block-border flex flex-col items-center gap-3 bg-secondary p-10 text-center">
      <Briefcase className="h-8 w-8 text-primary" aria-hidden="true" />
      <h2 className="text-lg">Todavía no hay empresas cargadas</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        El buscador y las fichas ya funcionan — falta el contenido: reseñas reales de estudiantes
        sobre empresas donde hicieron práctica o su primer trabajo. En cuanto haya esa data se
        agrega a <code className="font-mono text-xs">src/data/wikiempresas.json</code> y esta
        pantalla deja de estar vacía sola, sin tocar el componente.
      </p>
    </div>
  );
}

export default function WikiEmpresas() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(null);

  const list = useMemo(() => {
    const qq = norm(q);
    return DATA.filter((e) => !qq || e._haystack.indexOf(qq) !== -1);
  }, [q]);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 pt-10">
        <h1 className="text-4xl">WikiEmpresas</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          La versión de WikiProfes para prácticas y primeros empleos: reseñas de empresas hechas
          por estudiantes que ya trabajaron o hicieron práctica en ellas.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{DATA.length} fichas cargadas</p>
      </div>

      <div className="sticky top-[calc(2.375rem+0px)] z-40 mt-6 border-y border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-5 py-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={q}
              onChange={(ev) => setQ(ev.target.value)}
              placeholder="Buscar empresa o rubro: retail, banca, consultoría…"
              aria-label="Buscar en WikiEmpresas"
              className="block-border w-full bg-muted py-2 pl-9 pr-3 text-sm focus:bg-card"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {DATA.length === 0 ? (
          <EmptyState />
        ) : list.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No encontramos empresas que calcen con esa búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => (
              <Card key={e._idx} e={e} onOpen={setActive} />
            ))}
          </div>
        )}
      </div>

      <Modal e={active} onClose={() => setActive(null)} />
    </div>
  );
}

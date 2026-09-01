import { useMemo, useState } from "react";
import { Search, Star, X } from "lucide-react";
import profesoresRaw from "../data/wikiprofes.json";

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
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ name, size = "h-10 w-10 text-sm" }) {
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
        <Star
          key={i}
          className={"h-3.5 w-3.5 " + (i <= r ? "fill-primary text-primary" : "text-muted-foreground/30")}
        />
      ))}
    </span>
  );
}

const DATA = profesoresRaw.map((p, idx) => {
  const comentarios = p.comentarios || [];
  const haystack = norm([p.nombre, p.ramos, p.cita, comentarios.join(" ")].filter(Boolean).join(" "));
  return { ...p, _idx: idx, _haystack: haystack, _hasComments: comentarios.length > 0 };
});

function Card({ p, onOpen }) {
  const ramos = p.ramos || (p.origen === "canva" ? "Sin ficha oficial aún" : "Ramo no informado");
  const quote = p.cita || (p._hasComments ? p.comentarios[0] : "");
  return (
    <button
      type="button"
      onClick={() => onOpen(p)}
      className="block-border flex h-full flex-col gap-2 bg-card p-4 text-left transition-transform hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <Avatar name={p.nombre} />
        <div>
          <h2 className="text-base leading-tight">{p.nombre}</h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{ramos}</p>
        </div>
      </div>

      {p.calificacion != null ? (
        <div className="flex items-center gap-2 text-xs">
          <Stars rating={p.calificacion} />
          <span className="font-semibold">{p.calificacion.toFixed(1)}</span>
          <span className="text-muted-foreground">
            · {p.num_resenas} {p.num_resenas === 1 ? "reseña" : "reseñas"}
          </span>
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">Sin calificación oficial</p>
      )}

      <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
        {quote ? `“${quote}”` : "Sin comentarios todavía."}
      </p>

      <div className="flex items-center justify-between border-t border-dashed border-border pt-2 text-[11px] text-muted-foreground">
        <span>{p.actualizado ? `Actualizado: ${p.actualizado}` : ""}</span>
        {p.origen === "canva" ? (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-accent">
            Solo históricos
          </span>
        ) : p._hasComments ? (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-primary">
            +{p.comentarios.length} comentarios
          </span>
        ) : null}
      </div>
    </button>
  );
}

function Modal({ p, onClose }) {
  if (!p) return null;
  const comentarios = p.comentarios || [];
  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-foreground/55 p-4 py-[6vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="block-border w-full max-w-xl bg-card">
        <div className="flex items-start gap-3 border-b border-border p-5">
          <Avatar name={p.nombre} size="h-13 w-13 text-lg" />
          <div className="flex-1">
            <h2 className="text-lg">{p.nombre}</h2>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              {p.ramos || (p.origen === "canva" ? "Sin ficha oficial aún" : "Ramo no informado")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="block-border flex h-8 w-8 shrink-0 items-center justify-center bg-card"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          {p.calificacion != null ? (
            <div className="mb-4 flex items-center gap-2 text-sm">
              <Stars rating={p.calificacion} />
              <span className="font-semibold">{p.calificacion.toFixed(1)}</span>
              <span className="text-muted-foreground">
                · {p.num_resenas} {p.num_resenas === 1 ? "reseña" : "reseñas"}
              </span>
            </div>
          ) : (
            <p className="mb-4 text-sm italic text-muted-foreground">
              Sin calificación oficial todavía
            </p>
          )}
          {p.actualizado ? (
            <p className="mb-4 text-xs text-muted-foreground">Actualizado: {p.actualizado}</p>
          ) : null}

          {p.cita ? (
            <>
              <h3 className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground after:h-px after:flex-1 after:bg-border">
                Cita de la ficha oficial
              </h3>
              <div className="mb-4 border border-primary/25 bg-primary/8 p-3 text-sm">
                “{p.cita}”
              </div>
            </>
          ) : null}

          {comentarios.length ? (
            <>
              <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                {comentarios.length} {comentarios.length === 1 ? "comentario" : "comentarios"} de
                WikiProfes
              </h3>
              <div className="flex flex-col gap-2">
                {comentarios.map((c, i) => (
                  <div key={i} className="bg-secondary p-3 text-sm leading-relaxed">
                    {c}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Todavía no hay comentarios extendidos de estudiantes para este profesor.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WikiProfes() {
  const [q, setQ] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("alpha");
  const [commentsOnly, setCommentsOnly] = useState(false);
  const [active, setActive] = useState(null);

  const withRating = DATA.filter((p) => p.calificacion != null);
  const avgRating = withRating.length
    ? (withRating.reduce((s, p) => s + p.calificacion, 0) / withRating.length).toFixed(1)
    : "—";

  const list = useMemo(() => {
    const qq = norm(q);
    let out = DATA.filter((p) => {
      if (qq && p._haystack.indexOf(qq) === -1) return false;
      if (minRating === 2) {
        if (p.calificacion == null || p.calificacion >= 3) return false;
      } else if (minRating > 0) {
        if (p.calificacion == null || p.calificacion < minRating) return false;
      }
      if (commentsOnly && !p._hasComments) return false;
      return true;
    });
    out.sort((a, b) => {
      if (sort === "rating") {
        const ar = a.calificacion == null ? -1 : a.calificacion;
        const br = b.calificacion == null ? -1 : b.calificacion;
        if (br !== ar) return br - ar;
      } else if (sort === "reviews") {
        if (b.num_resenas !== a.num_resenas) return b.num_resenas - a.num_resenas;
      } else if (sort === "comments") {
        const ac = a.comentarios?.length || 0;
        const bc = b.comentarios?.length || 0;
        if (bc !== ac) return bc - ac;
      }
      return stripAccents(a.nombre).localeCompare(stripAccents(b.nombre), "es");
    });
    return out;
  }, [q, minRating, sort, commentsOnly]);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 pt-10">
        <h1 className="text-4xl">WikiProfes</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Fichas de profesores: calificaciones y ramos de la ficha oficial, más comentarios de
          estudiantes recopilados desde 2023.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {DATA.length} fichas · promedio {avgRating} ★
        </p>
      </div>

      <div className="sticky top-[calc(2.375rem+0px)] z-40 mt-6 border-y border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-5 py-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar profe o ramo: econometría, marketing, costos…"
              aria-label="Buscar en WikiProfes"
              className="block-border w-full bg-muted py-2 pl-9 pr-3 text-sm focus:bg-card"
            />
          </div>
          <select
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            aria-label="Calificación mínima"
            className="block-border bg-muted px-3 py-2 text-sm"
          >
            <option value="0">Cualquier calificación</option>
            <option value="4.5">4.5+ ★</option>
            <option value="4">4+ ★</option>
            <option value="3">3+ ★</option>
            <option value="2">Bajo 3 ★</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Ordenar por"
            className="block-border bg-muted px-3 py-2 text-sm"
          >
            <option value="alpha">Orden alfabético</option>
            <option value="rating">Mejor calificados</option>
            <option value="reviews">Más reseñas</option>
            <option value="comments">Más comentarios WikiProfes</option>
          </select>
          <label className="block-border flex items-center gap-2 bg-muted px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={commentsOnly}
              onChange={(e) => setCommentsOnly(e.target.checked)}
              className="accent-primary"
            />
            Con comentarios de estudiantes
          </label>
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-3 text-xs text-muted-foreground">
          <b className="font-mono text-foreground">{list.length}</b> de {DATA.length} fichas
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8">
        {list.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No encontramos profesores que calcen con esa búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Card key={p._idx} p={p} onOpen={setActive} />
            ))}
          </div>
        )}
      </div>

      <Modal p={active} onClose={() => setActive(null)} />
    </div>
  );
}

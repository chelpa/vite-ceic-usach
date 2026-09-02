import { useEffect, useMemo, useState } from "react";
import { Search, Star, X } from "lucide-react";
import profesoresRaw from "../data/wikiprofes.json";

function stripAccents(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function norm(s) {
  return stripAccents(s || "").toLowerCase();
}

// ---- voto en vivo (backend opcional, ver /wikiprofes-backend) ----
// Esta página funciona igual con cero backend corriendo: los 280 profes
// horneados en wikiprofes.json son la base. Si el backend responde a tiempo,
// se superponen sus notas en vivo y se desbloquea "Vota tú" — nunca al revés.
const VOTE_API_BASE = import.meta.env.VITE_WIKIPROFES_API_URL || "http://localhost:3001";
const ALLOWED_EMAIL_DOMAIN = "usach.cl";

function isValidStudentEmail(email) {
  const m = /^[^\s@]+@([^\s@]+)$/.exec((email || "").trim().toLowerCase());
  if (!m) return false;
  return m[1] === ALLOWED_EMAIL_DOMAIN || m[1].endsWith("." + ALLOWED_EMAIL_DOMAIN);
}

function fetchWithTimeout(url, opts, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// slug cuando el profe tiene ficha oficial (202/280); nombre normalizado para
// los "solo Canva" (78/280, slug null en wikiprofes.json) — el backend igual
// les genera un slug propio, pero el frontend no lo conoce de antemano.
function matchBackend(p, backend) {
  if (!backend) return null;
  if (p.slug && backend.bySlug[p.slug]) return backend.bySlug[p.slug];
  return backend.byNombreNorm[norm(p.nombre)] || null;
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

function Stars({ rating, size = "h-3.5 w-3.5" }) {
  const r = Math.round(rating);
  return (
    <span className="inline-flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={size + " " + (i <= r ? "fill-primary text-primary" : "text-muted-foreground/30")} />
      ))}
    </span>
  );
}

// Cada profe trae "resenas": la lista completa (oficial + histórico de Canva cuando
// aporta algo que el sitio no tiene). "fuente" distingue de dónde salió cada una —
// no se inventa ninguna, y las del sitio real vienen con su calificación 1-5 propia
// cuando esa reseña la trae.
const DATA = profesoresRaw.map((p, idx) => {
  const resenas = p.resenas || [];
  const ramosTxt = (p.ramos || []).join(" · ");
  const haystack = norm(
    [p.nombre, ramosTxt, resenas.map((r) => r.texto).join(" ")].filter(Boolean).join(" ")
  );
  return { ...p, _idx: idx, _haystack: haystack, _ramosTxt: ramosTxt };
});

function Card({ p, onOpen }) {
  const ramos = p._ramosTxt || (p.origen === "canva" ? "Sin ficha oficial aún" : "Ramo no informado");
  const quote = p.resenas[0]?.texto || "";
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
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Stars rating={p.calificacion} />
          <span className="font-semibold">{p.calificacion.toFixed(1)}</span>
          <span className="text-muted-foreground">
            · {p.resenas.length} {p.resenas.length === 1 ? "comentario" : "comentarios"}
          </span>
          {p.estimado ? (
            <span
              title="Estimado a partir del tono de comentarios históricos de Canva, no es un promedio de votos oficiales"
              className="rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-accent"
            >
              Estimado
            </span>
          ) : null}
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">Sin calificación</p>
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
        ) : p.resenas.length > 0 ? (
          <span className="rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-primary">
            {p.resenas.length} {p.resenas.length === 1 ? "reseña" : "reseñas"}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function ReviewCard({ r }) {
  const isOficial = r.fuente === "sitio";
  return (
    <div
      className={
        "p-3 text-sm leading-relaxed " +
        (isOficial ? "border border-primary/25 bg-primary/8" : "bg-secondary")
      }
    >
      {r.estrellas != null ? (
        <div className="mb-1.5">
          <Stars rating={r.estrellas} size="h-3 w-3" />
        </div>
      ) : null}
      <p>{r.texto}</p>
      <p className="mt-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {isOficial ? "WikiProfes (sitio oficial)" : "Archivo histórico (Canva)"}
      </p>
    </div>
  );
}

// Sin esto, la tecla Escape no cerraba la ficha y el fondo se podía seguir
// scrolleando detrás del modal — comportamiento estándar que faltaba.
function useModalBehavior(active, onClose) {
  useEffect(() => {
    if (!active) return;
    function onKey(ev) {
      if (ev.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, onClose]);
}

function VoteForm({ p, onVoted }) {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [email, setEmail] = useState("");
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { kind: "ok" | "error", text }

  function handleSubmit(e) {
    e.preventDefault();
    if (!selected) {
      setFeedback({ kind: "error", text: "Elige de 1 a 5 estrellas." });
      return;
    }
    if (!isValidStudentEmail(email)) {
      setFeedback({ kind: "error", text: `El correo debe ser de dominio @${ALLOWED_EMAIL_DOMAIN}.` });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    fetch(`${VOTE_API_BASE}/api/profesores/${p._backend.id}/votos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estudiante_email: email, estrellas: selected, comentario }),
    })
      .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        setSubmitting(false);
        if (!ok) {
          setFeedback({ kind: "error", text: body?.error || "No se pudo registrar el voto." });
          return;
        }
        onVoted(body);
        setFeedback({
          kind: "ok",
          text: body.comentario_pendiente_moderacion
            ? "¡Gracias! Tu estrella ya cuenta en el promedio. Tu comentario se publica apenas el CEIC lo revise."
            : "¡Gracias! Tu voto quedó registrado.",
        });
      })
      .catch(() => {
        setSubmitting(false);
        setFeedback({ kind: "error", text: "No se pudo conectar con el servidor de votos." });
      });
  }

  const shown = hovered || selected;

  return (
    <div className="mt-4 border-t border-dashed border-border pt-4">
      <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Vota tú</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div
          className="flex gap-1"
          role="radiogroup"
          aria-label="Tu calificación"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected === n}
              aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
              onClick={() => setSelected(n)}
              onMouseEnter={() => setHovered(n)}
              className="p-0.5"
            >
              <Star className={"h-6 w-6 " + (n <= shown ? "fill-primary text-primary" : "text-muted-foreground/30")} />
            </button>
          ))}
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={`tu-correo@${ALLOWED_EMAIL_DOMAIN}`}
          autoComplete="email"
          required
          className="block-border bg-muted px-3 py-2 text-sm focus:bg-card"
        />
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value.slice(0, 1000))}
          placeholder="Comentario opcional (máx. 1000 caracteres) — queda pendiente de revisión del CEIC antes de publicarse"
          maxLength={1000}
          className="block-border min-h-14 resize-y bg-muted px-3 py-2 text-sm focus:bg-card"
        />
        <button
          type="submit"
          disabled={submitting}
          className="block-border bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {submitting ? "Enviando…" : "Enviar voto"}
        </button>
        {feedback ? (
          <p role="status" className={"text-xs " + (feedback.kind === "error" ? "text-chart-3" : "text-primary")}>
            {feedback.text}
          </p>
        ) : null}
      </form>
    </div>
  );
}

function Modal({ p, onClose, onVoted }) {
  useModalBehavior(!!p, onClose);
  if (!p) return null;
  const resenas = p.resenas || [];
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
              {p._ramosTxt || (p.origen === "canva" ? "Sin ficha oficial aún" : "Ramo no informado")}
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
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-sm">
              <Stars rating={p.calificacion} />
              <span className="font-semibold">{p.calificacion.toFixed(1)}</span>
              <span className="text-muted-foreground">
                · {resenas.length} {resenas.length === 1 ? "comentario" : "comentarios"}
              </span>
              {p.estimado ? (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-accent">
                  Estimado
                </span>
              ) : null}
            </div>
          ) : (
            <p className="mb-4 text-sm italic text-muted-foreground">Sin calificación</p>
          )}
          {p.estimado ? (
            <p className="mb-4 text-xs text-muted-foreground">
              Este puntaje es una estimación a partir del tono de los comentarios históricos
              recopilados en Canva — no es un promedio de votos oficiales de WikiProfes.
            </p>
          ) : null}
          {p.actualizado ? (
            <p className="mb-4 text-xs text-muted-foreground">Actualizado: {p.actualizado}</p>
          ) : null}

          {resenas.length ? (
            <>
              <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                {resenas.length} {resenas.length === 1 ? "reseña" : "reseñas"}
              </h3>
              <div className="flex flex-col gap-2">
                {resenas.map((r, i) => (
                  <ReviewCard key={i} r={r} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Todavía no hay reseñas para este profesor.
            </p>
          )}

          {p._backend ? <VoteForm p={p} onVoted={(body) => onVoted(p, body)} /> : null}
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
  const [activeIdx, setActiveIdx] = useState(null);
  const [backend, setBackend] = useState(null); // null = aún no llega (o no hay backend); { bySlug, byNombreNorm }

  // Se intenta una sola vez al montar, con timeout corto: si no hay backend
  // corriendo (o tarda), la página queda funcionando exactamente igual que
  // sin este efecto — es aditivo puro, nunca una dependencia dura.
  useEffect(() => {
    let cancelled = false;
    fetchWithTimeout(`${VOTE_API_BASE}/api/profesores`, {}, 900)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad status"))))
      .then((rows) => {
        if (cancelled) return;
        const bySlug = {};
        const byNombreNorm = {};
        rows.forEach((b) => {
          bySlug[b.slug] = b;
          byNombreNorm[norm(b.nombre)] = b;
        });
        setBackend({ bySlug, byNombreNorm });
      })
      .catch(() => {
        /* sin backend (o inalcanzable a tiempo): sigue todo con la data estática */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mergedData = useMemo(() => {
    if (!backend) return DATA;
    return DATA.map((p) => {
      const b = matchBackend(p, backend);
      if (!b) return p;
      return { ...p, calificacion: b.calificacion, estimado: b.estimado, _backend: b };
    });
  }, [backend]);

  function handleVoted(p, body) {
    // sincroniza el mapa del backend con lo que acaba de responder el server —
    // eso hace que mergedData (y por lo tanto la card + el modal) se actualicen solos.
    setBackend((prev) => {
      const base = prev || { bySlug: {}, byNombreNorm: {} };
      return {
        bySlug: { ...base.bySlug, [body.slug]: body },
        byNombreNorm: { ...base.byNombreNorm, [norm(body.nombre)]: body },
      };
    });
  }

  const active = activeIdx != null ? mergedData[activeIdx] : null;

  const withRating = mergedData.filter((p) => p.calificacion != null);
  const avgRating = withRating.length
    ? (withRating.reduce((s, p) => s + p.calificacion, 0) / withRating.length).toFixed(1)
    : "—";

  const list = useMemo(() => {
    const qq = norm(q);
    let out = mergedData.filter((p) => {
      if (qq && p._haystack.indexOf(qq) === -1) return false;
      if (minRating === 2) {
        if (p.calificacion == null || p.calificacion >= 3) return false;
      } else if (minRating > 0) {
        if (p.calificacion == null || p.calificacion < minRating) return false;
      }
      if (commentsOnly && p.resenas.length === 0) return false;
      return true;
    });
    out.sort((a, b) => {
      if (sort === "rating") {
        const ar = a.calificacion == null ? -1 : a.calificacion;
        const br = b.calificacion == null ? -1 : b.calificacion;
        if (br !== ar) return br - ar;
      } else if (sort === "reviews") {
        if (b.resenas.length !== a.resenas.length) return b.resenas.length - a.resenas.length;
      }
      return stripAccents(a.nombre).localeCompare(stripAccents(b.nombre), "es");
    });
    return out;
  }, [mergedData, q, minRating, sort, commentsOnly]);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-5 pt-10">
        <h1 className="text-4xl">WikiProfes</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Fichas de profesores: calificaciones y ramos de la ficha oficial, con todas sus reseñas —
          más comentarios históricos recopilados desde 2023 que el sitio oficial no tiene.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {DATA.length} fichas · promedio {avgRating} ★ · las fichas con la etiqueta{" "}
          <span className="rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-accent">
            Estimado
          </span>{" "}
          no tienen calificación oficial: el puntaje sale del tono de los comentarios históricos
          de Canva, no de un promedio de votos.
        </p>
      </div>

      <div className="sticky top-[var(--header-h)] z-40 mt-6 border-y border-border bg-card/95 backdrop-blur">
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
          </select>
          <label className="block-border flex items-center gap-2 bg-muted px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={commentsOnly}
              onChange={(e) => setCommentsOnly(e.target.checked)}
              className="accent-primary"
            />
            Con reseñas
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
              <Card key={p._idx} p={p} onOpen={(pr) => setActiveIdx(pr._idx)} />
            ))}
          </div>
        )}
      </div>

      <Modal p={active} onClose={() => setActiveIdx(null)} onVoted={handleVoted} />
    </div>
  );
}

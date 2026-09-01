import { useEffect, useMemo, useState } from "react";
import seedEntries from "../data/bitacora.json";

const ENTRY_TYPES = [
  { key: "arquitectura", label: "Arquitectura", fg: "#8a2432", bg: "#f3e2e0" },
  { key: "diseno", label: "Diseño", fg: "#2a5ca8", bg: "#e3ebf8" },
  { key: "implementacion", label: "Implementación", fg: "#3f7554", bg: "#e3ede4" },
  { key: "contenido", label: "Contenido", fg: "#a8761f", bg: "#f4e9d3" },
  { key: "decision", label: "Decisión", fg: "#5b6b7a", bg: "#e2e8ec" },
  { key: "incidencia", label: "Incidencia", fg: "#a3372f", bg: "#f3e0dd" },
  { key: "prototipo", label: "Prototipo", fg: "#0c7c78", bg: "#dcefee" },
];

const EXTRA_FIELDS = {
  arquitectura: [{ name: "alcance", label: "Alcance de la decisión" }, { name: "tipo", label: "Tipo" }],
  diseno: [{ name: "elemento", label: "Elemento" }, { name: "estado", label: "Estado" }],
  implementacion: [{ name: "modulo", label: "Módulo o pieza" }, { name: "estado", label: "Estado" }],
  contenido: [{ name: "seccion", label: "Sección del sitio" }, { name: "origen", label: "Origen" }],
  decision: [{ name: "alcance", label: "Alcance" }, { name: "alternativas", label: "Alternativas consideradas" }],
  incidencia: [{ name: "severidad", label: "Severidad" }, { name: "estado", label: "Estado" }],
  prototipo: [{ name: "seccion", label: "Sección del sitio" }, { name: "entregable", label: "Entregable" }],
};

const STORE_KEY = "ceic-bitacora-prototipo-vite";

// Cada visitante guarda su propia copia de la bitácora en localStorage (para
// no perder sus borradores ni sus "Confirmar entrada"). El problema: si esa
// copia quedó guardada antes de que se agregaran entradas nuevas, se queda
// pegada ahí para siempre y esa persona nunca ve las entradas nuevas, aunque
// se suba una versión más reciente del sitio.
//
// La solución no reemplaza la copia guardada (eso borraría sus borradores) —
// compara los ids: cualquier entrada del seed (src/data/bitacora.json) que
// no esté todavía en su copia guardada, se agrega. Como la convención de esta
// bitácora es no editar entradas viejas (una corrección se registra como
// entrada nueva, nunca se reescribe una existente — ver el aviso en el
// formulario de "Nueva entrada"), comparar por id es suficiente: nunca hace
// falta "actualizar" una entrada que ya tiene guardada, solo agregar las que
// le falten. Así cada nueva sesión de trabajo se propaga sola a todos los
// navegadores la próxima vez que entren, sin que nadie tenga que borrar su
// localStorage a mano.
function loadEntries() {
  let stored = null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) stored = parsed;
    }
  } catch {
    /* localStorage no disponible: seguimos con el seed */
  }

  if (!stored) return seedEntries;

  const knownIds = new Set(stored.map((e) => e.id));
  const faltantes = seedEntries.filter((e) => !knownIds.has(e.id));
  return faltantes.length ? [...stored, ...faltantes] : stored;
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function typeMeta(key) {
  return ENTRY_TYPES.find((t) => t.key === key) || { key, label: key, fg: "#5b6b7a", bg: "#e2e8ec" };
}

function NewEntryForm({ onSave, onCancel }) {
  const [tipo, setTipo] = useState("contenido");
  const [autor, setAutor] = useState("Francisco");
  const [contenido, setContenido] = useState("");
  const [extra, setExtra] = useState({});

  const fields = EXTRA_FIELDS[tipo] || [];

  function submit(confirmar) {
    if (!contenido.trim()) return;
    onSave({
      id: "e" + Date.now(),
      fecha: new Date().toISOString().slice(0, 10),
      tipo,
      autor: autor || "Francisco",
      contenido: contenido.trim(),
      extra,
      confirmada: confirmar,
    });
    setContenido("");
    setExtra({});
  }

  return (
    <div className="block-border mb-6 bg-card p-5">
      <h3 className="text-lg">Nueva entrada</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Tipo
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setExtra({});
            }}
            className="block-border mt-1 w-full bg-muted px-3 py-2 text-sm"
          >
            {ENTRY_TYPES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Autor
          <input
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            className="block-border mt-1 w-full bg-muted px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm">
        Contenido
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={3}
          className="block-border mt-1 w-full bg-muted px-3 py-2 text-sm"
          placeholder="Qué pasó, qué se decidió o qué se armó."
        />
      </label>
      {fields.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <label className="text-sm" key={f.name}>
              {f.label}
              <input
                value={extra[f.name] || ""}
                onChange={(e) => setExtra((x) => ({ ...x, [f.name]: e.target.value }))}
                className="block-border mt-1 w-full bg-muted px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>
      ) : null}
      <p className="mt-4 text-xs text-muted-foreground">
        Al confirmar, la entrada queda marcada como cerrada. Una corrección posterior se
        registra como una entrada nueva, no se edita esta.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => submit(false)}
          className="block-border bg-card px-4 py-2 text-sm font-semibold uppercase"
        >
          Guardar borrador
        </button>
        <button
          type="button"
          onClick={() => submit(true)}
          className="block-border bg-primary px-4 py-2 text-sm font-semibold uppercase text-primary-foreground"
        >
          Confirmar y guardar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold uppercase text-muted-foreground"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function Bitacora() {
  const [entries, setEntries] = useState(loadEntries);
  const [view, setView] = useState("resumen");
  const [typeFilter, setTypeFilter] = useState("todas");
  const [stateFilter, setStateFilter] = useState("todas");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(entries));
    } catch {
      /* localStorage no disponible en este navegador */
    }
  }, [entries]);

  const stats = useMemo(() => {
    const total = entries.length;
    const abiertas = entries.filter((e) => e.tipo === "incidencia" && !e.confirmada).length;
    const confirmadas = entries.filter((e) => e.confirmada).length;
    const ultima = total ? entries.reduce((a, b) => (a.fecha > b.fecha ? a : b)).fecha : null;
    return [
      { v: total, l: "Entradas totales" },
      { v: confirmadas, l: "Confirmadas" },
      { v: abiertas, l: "Incidencias abiertas" },
      { v: ultima ? formatDate(ultima) : "—", l: "Última entrada" },
    ];
  }, [entries]);

  const visible = useMemo(() => {
    let list = entries
      .slice()
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
      .filter((e) => {
        if (typeFilter !== "todas" && e.tipo !== typeFilter) return false;
        if (stateFilter === "confirmada" && !e.confirmada) return false;
        if (stateFilter === "borrador" && e.confirmada) return false;
        return true;
      });
    if (view === "resumen") list = list.slice(0, 5);
    return list;
  }, [entries, view, typeFilter, stateFilter]);

  function confirmEntry(id) {
    setEntries((es) => es.map((e) => (e.id === id ? { ...e, confirmada: true } : e)));
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-6">
        <h1 className="text-3xl">Bitácora CEIC</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Registro cronológico de obra: qué realmente va pasando, sección por sección —
          arquitectura, diseño, implementación, contenido, decisiones e incidencias.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: "resumen", label: "Actividad reciente" },
          { key: "completa", label: "Línea de tiempo completa" },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={
              "block-border px-3 py-1.5 text-sm font-semibold " +
              (view === v.key ? "bg-primary text-primary-foreground" : "bg-card")
            }
          >
            {v.label}
          </button>
        ))}
        <button
          onClick={() => setShowForm((s) => !s)}
          className="block-border ml-auto bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground"
        >
          {showForm ? "Cerrar formulario" : "+ Nueva entrada"}
        </button>
      </div>

      {showForm ? (
        <NewEntryForm
          onCancel={() => setShowForm(false)}
          onSave={(entry) => {
            setEntries((es) => [entry, ...es]);
            setShowForm(false);
          }}
        />
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div className="block-border bg-card p-4" key={s.l}>
            <b className="block text-2xl font-[family-name:var(--font-display)]">{s.v}</b>
            <span className="text-xs text-muted-foreground">{s.l}</span>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTypeFilter("todas")}
          className={
            "block-border px-3 py-1 text-xs font-semibold uppercase " +
            (typeFilter === "todas" ? "bg-foreground text-background" : "bg-card")
          }
        >
          Todos los tipos
        </button>
        {ENTRY_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setTypeFilter(t.key)}
            className="block-border px-3 py-1 text-xs font-semibold uppercase"
            style={
              typeFilter === t.key
                ? { background: t.fg, color: "#fff" }
                : { background: t.bg, color: t.fg }
            }
          >
            {t.label}
          </button>
        ))}
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="block-border ml-auto bg-card px-3 py-1.5 text-xs"
        >
          <option value="todas">Todas</option>
          <option value="confirmada">Confirmadas</option>
          <option value="borrador">Borrador</option>
        </select>
      </div>

      <h2 className="mb-3 text-xl">
        {view === "resumen" ? "Actividad reciente" : "Línea de tiempo completa"}
      </h2>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay entradas que calcen con este filtro.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((e) => {
            const meta = typeMeta(e.tipo);
            const fields = EXTRA_FIELDS[e.tipo] || [];
            return (
              <li key={e.id} className="grid gap-2 sm:grid-cols-[7rem_1fr]">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  {formatDate(e.fecha)}
                </div>
                <div className="block-border relative bg-card p-4">
                  {e.confirmada ? (
                    <span className="absolute right-4 top-4 text-[10px] font-bold uppercase text-primary">
                      Confirmada
                    </span>
                  ) : null}
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[11px] font-bold uppercase"
                    style={{ background: meta.bg, color: meta.fg }}
                  >
                    {meta.label}
                  </span>
                  <div className="mt-2 text-xs font-semibold text-muted-foreground">{e.autor}</div>
                  <p className="mt-1 text-sm leading-relaxed">{e.contenido}</p>
                  {fields.length ? (
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      {fields.map((f) => (
                        <div key={f.name}>
                          <dt className="text-muted-foreground">{f.label}</dt>
                          <dd>{(e.extra && e.extra[f.name]) || "—"}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}
                  {!e.confirmada ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-bold uppercase text-accent">
                        Borrador
                      </span>
                      <button
                        onClick={() => confirmEntry(e.id)}
                        className="text-xs font-semibold uppercase text-primary underline"
                      >
                        Confirmar entrada
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

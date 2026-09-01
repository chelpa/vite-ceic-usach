import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Columns3,
  LayoutGrid,
  List as ListIcon,
  Square,
} from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import calendario from "../data/calendario.json";

// Calendario tipo Google Calendar (Mes / Semana / Día) sobre las mismas
// fechas reales que ya teníamos en la vista de lista — no se agregó ni un
// solo evento nuevo. Lo único que se hizo fue estructurar el campo "fecha"
// (que hasta ahora era solo texto: "Del lunes 2 al sábado 14 de noviembre
// de 2026") en fechaInicio/fechaFin en formato ISO, para poder dibujarlo en
// una grilla. Se verificó cada fecha contra el día de la semana que el
// propio texto original dice (ej. "lunes 2 de noviembre de 2026" tiene que
// caer realmente lunes) — las 23 calzaron. El texto original se conserva
// tal cual en "fecha" y sigue siendo lo que se muestra en la vista de
// Lista, que no cambió.
//
// "La semana de PEP" (pedido de Francisco, inspirado en el calendario de
// pruebas de buscacursos.cl): acá el dato real es un rango general para
// todos — el período de PEP1/PEP2 completo, no la fecha puntual de cada
// ramo — así que se resalta como una franja de días en el mes, no como
// puntos por ramo. Eso sí es personalizado en buscacursos porque ahí cada
// estudiante ya tiene sus secciones elegidas con fecha de PEP propia; acá
// todavía no existe "mi horario" con esa selección (necesita datos de
// bloques/horario que BuscaCursos no trae para Ingeco/Economía — mismo
// límite anotado para la fase MVP-ALPHA en la bitácora).

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DOW_MON = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DOW_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const CATEGORIA_META = {
  matricula: { label: "Matrícula y toma de ramos", color: "#0c7c78" },
  periodo: { label: "Período académico", color: "#2f6fa8" },
  evaluaciones: { label: "Evaluaciones (PEP1/PEP2)", color: "#b3432f" },
  tramites: { label: "Trámites académicos", color: "#6a5a9c" },
  feriados: { label: "Feriados y recesos", color: "#1f9d55" },
  examenes: { label: "Examen de grado y tesis", color: "#c9791f" },
};

const EVENTOS = calendario.flatMap((sec) =>
  sec.eventos.map((ev) => ({ ...ev, seccion: sec.titulo, categoria: sec.categoria }))
);

function pad2(n) {
  return String(n).padStart(2, "0");
}
function toISO(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function fromISO(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(iso, n) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}
function addMonths(iso, n) {
  const d = fromISO(iso);
  d.setMonth(d.getMonth() + n, 1);
  return toISO(d);
}
function startOfWeekMon(iso) {
  const d = fromISO(iso);
  const dow = (d.getDay() + 6) % 7; // Mon=0..Sun=6
  d.setDate(d.getDate() - dow);
  return toISO(d);
}
function todayISO() {
  return toISO(new Date());
}
function eventsForDay(iso) {
  return EVENTOS.filter((e) => e.fechaInicio <= iso && iso <= e.fechaFin).sort((a, b) =>
    a.categoria < b.categoria ? -1 : a.categoria > b.categoria ? 1 : 0
  );
}
function fmtLargo(iso) {
  const d = fromISO(iso);
  return `${DOW_FULL[(d.getDay() + 6) % 7]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

function Legend() {
  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
      {Object.entries(CATEGORIA_META).map(([key, m]) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: m.color }} aria-hidden="true" />
          {m.label}
        </span>
      ))}
    </div>
  );
}

function EventoItem({ e, compact }) {
  const meta = CATEGORIA_META[e.categoria];
  return (
    <div className={"flex items-start gap-2 " + (compact ? "py-1" : "py-2")}>
      <span
        className="mt-1 h-2 w-2 shrink-0 rounded-full"
        style={{ background: meta.color }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className={"leading-snug " + (compact ? "text-xs" : "text-sm")}>{e.titulo}</p>
        {!compact && e.nota ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{e.nota}</p>
        ) : null}
        {!compact ? (
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">{meta.label}</p>
        ) : null}
      </div>
    </div>
  );
}

function VistaMes({ cursor, onPickDay }) {
  const d = fromISO(cursor);
  const year = d.getFullYear();
  const month = d.getMonth();
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayISO();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <h2 className="text-lg font-semibold capitalize">
        {MESES[month]} {year}
      </h2>
      <div className="mt-3 grid grid-cols-7 gap-px overflow-hidden border border-border bg-border text-xs">
        {DOW_MON.map((l) => (
          <div key={l} className="bg-secondary p-2 text-center font-semibold uppercase text-secondary-foreground">
            {l}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day == null) return <div key={i} className="min-h-24 bg-muted/40" />;
          const iso = `${year}-${pad2(month + 1)}-${pad2(day)}`;
          const evs = eventsForDay(iso);
          const isToday = iso === today;
          const isPep = evs.some((e) => e.categoria === "evaluaciones");
          return (
            <button
              type="button"
              key={i}
              onClick={() => onPickDay(iso)}
              style={{ background: isPep ? "rgba(179,67,47,0.14)" : "var(--color-card)" }}
              className="flex min-h-24 flex-col items-stretch gap-1 p-1.5 text-left transition-shadow hover:ring-1 hover:ring-inset hover:ring-primary sm:p-2"
            >
              <span
                className={
                  "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold " +
                  (isToday ? "bg-primary text-primary-foreground" : "")
                }
              >
                {day}
              </span>
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                {evs.slice(0, 3).map((e, idx) => (
                  <span
                    key={idx}
                    className="truncate rounded px-1 py-0.5 text-[10px] leading-tight text-white"
                    style={{ background: CATEGORIA_META[e.categoria].color }}
                    title={e.titulo}
                  >
                    {e.titulo}
                  </span>
                ))}
                {evs.length > 3 ? (
                  <span className="text-[10px] text-muted-foreground">+{evs.length - 3} más</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VistaSemana({ cursor, onPickDay }) {
  const start = startOfWeekMon(cursor);
  const today = todayISO();
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
      {days.map((iso, i) => {
        const d = fromISO(iso);
        const evs = eventsForDay(iso);
        const isToday = iso === today;
        return (
          <button
            type="button"
            key={iso}
            onClick={() => onPickDay(iso)}
            className={
              "block-border flex min-h-32 flex-col items-stretch gap-1 bg-card p-2 text-left transition-colors hover:bg-secondary " +
              (isToday ? "ring-2 ring-primary ring-inset" : "")
            }
          >
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">{DOW_MON[i]}</span>
            <span className={"text-sm font-semibold " + (isToday ? "text-primary" : "")}>{d.getDate()}</span>
            <div className="mt-1 flex flex-col gap-0.5">
              {evs.length === 0 ? (
                <span className="text-[11px] text-muted-foreground">—</span>
              ) : (
                evs.map((e, idx) => (
                  <span
                    key={idx}
                    className="truncate rounded px-1 py-0.5 text-[10px] leading-tight text-white"
                    style={{ background: CATEGORIA_META[e.categoria].color }}
                    title={e.titulo}
                  >
                    {e.titulo}
                  </span>
                ))
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function VistaDia({ cursor }) {
  const evs = eventsForDay(cursor);
  return (
    <div>
      <h2 className="text-lg font-semibold">{fmtLargo(cursor)}</h2>
      <div className="mt-3 block-border divide-y divide-border bg-card">
        {evs.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No hay eventos registrados este día.</p>
        ) : (
          evs.map((e, i) => (
            <div className="px-4" key={i}>
              <EventoItem e={e} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function VistaLista() {
  return (
    <>
      {calendario.map((seccion) => (
        <div className="mt-10" key={seccion.titulo}>
          <h2 className="border-b border-foreground pb-3 text-2xl">{seccion.titulo}</h2>
          <div className="mt-6 space-y-4">
            {seccion.eventos.map((ev, i) => (
              <div className="block-border flex gap-4 bg-card p-5" key={i}>
                <CalendarDays className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-accent">{ev.fecha}</p>
                  <h3 className="mt-1 text-lg">{ev.titulo}</h3>
                  {ev.nota ? <p className="mt-1 text-sm text-muted-foreground">{ev.nota}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

const VISTAS = [
  { key: "lista", label: "Lista", icon: ListIcon },
  { key: "mes", label: "Mes", icon: LayoutGrid },
  { key: "semana", label: "Semana", icon: Columns3 },
  { key: "dia", label: "Día", icon: Square },
];

export default function Calendario() {
  const [vista, setVista] = useState("lista");
  const [cursor, setCursor] = useState(todayISO);

  const nav = useMemo(() => {
    if (vista === "mes") {
      return {
        prev: () => setCursor((c) => addMonths(c, -1)),
        next: () => setCursor((c) => addMonths(c, 1)),
      };
    }
    if (vista === "semana") {
      return {
        prev: () => setCursor((c) => addDays(c, -7)),
        next: () => setCursor((c) => addDays(c, 7)),
      };
    }
    if (vista === "dia") {
      return {
        prev: () => setCursor((c) => addDays(c, -1)),
        next: () => setCursor((c) => addDays(c, 1)),
      };
    }
    return null;
  }, [vista]);

  function pickDay(iso) {
    setCursor(iso);
    setVista("dia");
  }

  return (
    <PageShell wide>
      <PageIntro
        title="Calendario académico"
        subtitle="Fechas clave del segundo semestre 2026 para Ingeniería Comercial Diurno y Prosecución, recopiladas por el centro de estudiantes."
      />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="block-border inline-flex bg-card">
          {VISTAS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setVista(v.key)}
              aria-pressed={vista === v.key}
              className={
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase " +
                (vista === v.key ? "bg-primary text-primary-foreground" : "hover:bg-secondary")
              }
            >
              <v.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {v.label}
            </button>
          ))}
        </div>

        {vista !== "lista" ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={nav.prev}
              aria-label="Anterior"
              className="block-border flex h-8 w-8 items-center justify-center bg-card hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setCursor(todayISO())}
              className="block-border bg-card px-3 py-1.5 text-xs font-semibold uppercase hover:bg-secondary"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={nav.next}
              aria-label="Siguiente"
              className="block-border flex h-8 w-8 items-center justify-center bg-card hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      {vista !== "lista" ? <Legend /> : null}

      <div className="mt-6">
        {vista === "lista" ? <VistaLista /> : null}
        {vista === "mes" ? <VistaMes cursor={cursor} onPickDay={pickDay} /> : null}
        {vista === "semana" ? <VistaSemana cursor={cursor} onPickDay={pickDay} /> : null}
        {vista === "dia" ? <VistaDia cursor={cursor} /> : null}
      </div>

      {vista === "mes" ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Los días con fondo rojizo caen dentro del período de PEP1 o PEP2 (evaluaciones presenciales) — es el
          rango oficial para todo el semestre, no la fecha puntual de cada ramo (eso necesita "mi horario" con
          cuenta propia, todavía no construido — ver bitácora).
        </p>
      ) : null}
    </PageShell>
  );
}

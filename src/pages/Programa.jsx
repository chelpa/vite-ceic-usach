import { useState } from "react";
import { Circle, CircleCheck, CircleDot, Layers, Columns3, NotebookText, Gauge } from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import data from "../data/programa.json";

// Cuatro formas de mirar los mismos 72 compromisos reales (título + estado,
// agrupados en 12 secciones — es todo el dato que el CEIC publicó, no hay
// fecha por ítem). "Por sección" es la vista original; las otras tres se
// agregaron a pedido de Francisco. La idea de "línea de tiempo" se resolvió
// como "Por estado" (un pipeline No realizado → En progreso → Completo) en
// vez de fechas, porque no tenemos fecha real de cuándo cambió cada
// compromiso — inventarlas rompería la regla de no fabricar datos.

const CYCLE = ["chart-5", "primary", "chart-3"];

const STATUS_STYLE = {
  Completo: { icon: CircleCheck, className: "text-accent", strike: true },
  "En progreso": { icon: CircleDot, className: "text-primary", strike: false },
  "No realizado": { icon: Circle, className: "text-muted-foreground", strike: false },
};

const COLOR_CLASSES = {
  "chart-5": "border-chart-5 text-chart-5",
  primary: "border-primary text-primary",
  "chart-3": "border-chart-3 text-chart-3",
};

const ESTADOS = ["No realizado", "En progreso", "Completo"];

const VISTAS = [
  { key: "seccion", label: "Por sección", icon: Layers },
  { key: "estado", label: "Por estado", icon: Columns3 },
  { key: "bitacora", label: "Bitácora", icon: NotebookText },
  { key: "resumen", label: "Resumen", icon: Gauge },
];

function StatusBadge({ estado }) {
  const style = STATUS_STYLE[estado] || STATUS_STYLE["No realizado"];
  const Icon = style.icon;
  return (
    <span
      className={
        "flex shrink-0 items-center gap-1 text-xs font-bold uppercase " + style.className
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {estado}
    </span>
  );
}

function VistaSeccion({ secciones }) {
  return (
    <>
      {secciones.map((seccion, i) => {
        const colorKey = CYCLE[i % CYCLE.length];
        return (
          <div className="mt-12 first:mt-8" key={seccion.titulo}>
            <h2 className={"border-b pb-3 text-2xl " + COLOR_CLASSES[colorKey]}>
              {seccion.titulo}
            </h2>
            <div className="mt-6 block-border divide-y divide-foreground bg-card">
              {seccion.compromisos.map((c, j) => {
                const style = STATUS_STYLE[c.estado] || STATUS_STYLE["No realizado"];
                return (
                  <div className="flex items-center justify-between gap-4 px-5 py-3" key={j}>
                    <span className={style.strike ? "line-through decoration-2" : ""}>
                      {c.titulo}
                    </span>
                    <StatusBadge estado={c.estado} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

function VistaEstado({ flat }) {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-3">
      {ESTADOS.map((estado) => {
        const items = flat.filter((c) => c.estado === estado);
        const style = STATUS_STYLE[estado];
        const Icon = style.icon;
        return (
          <div className="block-border bg-card" key={estado}>
            <div
              className={
                "flex items-center justify-between gap-2 border-b border-foreground px-4 py-3 text-xs font-bold uppercase " +
                style.className
              }
            >
              <span className="flex items-center gap-1.5">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {estado}
              </span>
              <span>{items.length}</span>
            </div>
            <div className="divide-y divide-foreground">
              {items.map((c, j) => (
                <div className="px-4 py-3" key={j}>
                  <p className={"text-sm " + (style.strike ? "line-through decoration-2" : "")}>
                    {c.titulo}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {c.seccion}
                  </p>
                </div>
              ))}
              {items.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  Sin compromisos en este estado.
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VistaBitacora({ secciones }) {
  return (
    <ul className="mt-8 flex flex-col gap-4">
      {secciones.map((seccion, i) => {
        const colorKey = CYCLE[i % CYCLE.length];
        const total = seccion.compromisos.length;
        const completos = seccion.compromisos.filter((c) => c.estado === "Completo").length;
        return (
          <li className="grid gap-2 sm:grid-cols-[10rem_1fr]" key={seccion.titulo}>
            <div className={"pt-4 text-xs font-bold uppercase " + COLOR_CLASSES[colorKey]}>
              {seccion.titulo}
            </div>
            <div className="block-border bg-card p-4">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
                <span>{total} compromisos</span>
                <span>
                  {completos}/{total} completos
                </span>
              </div>
              <div className="mt-2 flex h-1.5 w-full overflow-hidden bg-muted-foreground/20">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${total ? (completos / total) * 100 : 0}%` }}
                />
              </div>
              <ul className="mt-3 flex flex-col gap-1.5">
                {seccion.compromisos.map((c, j) => (
                  <li className="flex items-center justify-between gap-3 text-sm" key={j}>
                    <span
                      className={
                        STATUS_STYLE[c.estado]?.strike
                          ? "text-muted-foreground line-through decoration-2"
                          : ""
                      }
                    >
                      {c.titulo}
                    </span>
                    <StatusBadge estado={c.estado} />
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function VistaResumen({ secciones }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {secciones.map((seccion, i) => {
        const colorKey = CYCLE[i % CYCLE.length];
        const total = seccion.compromisos.length;
        const completos = seccion.compromisos.filter((c) => c.estado === "Completo").length;
        const enProgreso = seccion.compromisos.filter((c) => c.estado === "En progreso").length;
        const noRealizado = total - completos - enProgreso;
        return (
          <div className="block-border bg-card p-5" key={seccion.titulo}>
            <h3 className={"text-sm font-bold uppercase " + COLOR_CLASSES[colorKey]}>
              {seccion.titulo}
            </h3>
            <div className="mt-3 flex h-2 w-full overflow-hidden bg-muted-foreground/20">
              <div
                className="h-full bg-accent"
                style={{ width: `${total ? (completos / total) * 100 : 0}%` }}
              />
              <div
                className="h-full bg-primary"
                style={{ width: `${total ? (enProgreso / total) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {completos} completos · {enProgreso} en progreso · {noRealizado} sin iniciar —{" "}
              {total} en total
            </p>
          </div>
        );
      })}
    </div>
  );
}

export default function Programa() {
  const [vista, setVista] = useState("seccion");

  const totalItems = data.secciones.reduce((n, s) => n + s.compromisos.length, 0);
  const completos = data.secciones.reduce(
    (n, s) => n + s.compromisos.filter((c) => c.estado === "Completo").length,
    0
  );
  const enProgreso = data.secciones.reduce(
    (n, s) => n + s.compromisos.filter((c) => c.estado === "En progreso").length,
    0
  );
  const noRealizado = totalItems - completos - enProgreso;

  const flat = data.secciones.flatMap((s) =>
    s.compromisos.map((c) => ({ ...c, seccion: s.titulo }))
  );

  return (
    <PageShell wide>
      <PageIntro
        wide
        title="Conoce nuestro programa"
        subtitle="Los compromisos del programa Impulsa Comercial, con el que fuimos elegidos, y su estado de avance real, actualizado por la misma mesa directiva."
      />

      <div className="mt-8 block-border bg-card p-6">
        <div className="flex items-center justify-between text-sm font-semibold uppercase">
          <span>Avance general</span>
          <span>{data.avance_general}</span>
        </div>
        <div className="mt-3 flex h-4 w-full overflow-hidden border border-foreground bg-muted-foreground/20">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${(completos / totalItems) * 100}%` }}
          />
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(enProgreso / totalItems) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" /> Completo ({completos})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> En progreso ({enProgreso})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> No realizado (
            {noRealizado})
          </span>
        </div>
      </div>

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
      </div>

      {vista === "seccion" ? <VistaSeccion secciones={data.secciones} /> : null}
      {vista === "estado" ? <VistaEstado flat={flat} /> : null}
      {vista === "bitacora" ? <VistaBitacora secciones={data.secciones} /> : null}
      {vista === "resumen" ? <VistaResumen secciones={data.secciones} /> : null}

      {vista === "estado" ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Esta vista agrupa los compromisos por estado, no por fecha: el CEIC no publicó cuándo
          cambió cada uno, solo en qué etapa está ahora — por eso "línea de tiempo" se resolvió
          como este pipeline en vez de un calendario con fechas inventadas.
        </p>
      ) : null}
      {vista === "bitacora" ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Cada fila es una sección del programa, no una entrada fechada — el dato real no trae
          fecha por compromiso, así que se ordenan igual que en "Por sección".
        </p>
      ) : null}
    </PageShell>
  );
}

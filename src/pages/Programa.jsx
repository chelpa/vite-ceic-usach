import { Circle, CircleCheck, CircleDot } from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import data from "../data/programa.json";

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

export default function Programa() {
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

      {data.secciones.map((seccion, i) => {
        const colorKey = CYCLE[i % CYCLE.length];
        return (
          <div className="mt-12" key={seccion.titulo}>
            <h2 className={"border-b pb-3 text-2xl " + COLOR_CLASSES[colorKey]}>
              {seccion.titulo}
            </h2>
            <div className="mt-6 block-border divide-y divide-foreground bg-card">
              {seccion.compromisos.map((c, j) => {
                const style = STATUS_STYLE[c.estado] || STATUS_STYLE["No realizado"];
                const Icon = style.icon;
                return (
                  <div
                    className="flex items-center justify-between gap-4 px-5 py-3"
                    key={j}
                  >
                    <span className={style.strike ? "line-through decoration-2" : ""}>
                      {c.titulo}
                    </span>
                    <span
                      className={
                        "flex shrink-0 items-center gap-1 text-xs font-bold uppercase " +
                        style.className
                      }
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {c.estado}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </PageShell>
  );
}

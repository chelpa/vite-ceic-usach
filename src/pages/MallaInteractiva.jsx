import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Info } from "lucide-react";
import malla from "../data/malla.json";

const STORE_KEY = "ceic-malla-avance-v1";

function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}

function areaStyle(area) {
  const key = (area || "").trim().toUpperCase();
  const hue = hashHue(key);
  return {
    background: `hsl(${hue} 45% 93%)`,
    color: `hsl(${hue} 45% 30%)`,
  };
}

function loadAvance() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* localStorage no disponible */
  }
  return {};
}

function RamoCard({ ramo, done, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(ramo.codigo)}
      className={
        "block-border flex w-full flex-col gap-1.5 p-3 text-left transition-colors " +
        (done ? "bg-primary/10" : "bg-card")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">{ramo.codigo}</span>
        {done ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" aria-hidden="true" />
        )}
      </div>
      <p className={"text-sm leading-snug " + (done ? "text-muted-foreground line-through" : "")}>
        {ramo.nombre}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
          style={areaStyle(ramo.area)}
        >
          {ramo.area}
        </span>
        {ramo.sct != null ? (
          <span className="font-mono text-[10px] text-muted-foreground">{ramo.sct} SCT</span>
        ) : null}
      </div>
    </button>
  );
}

function ProgressBar({ done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-3 flex-1 overflow-hidden border border-foreground bg-muted-foreground/20">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
        {done}/{total} ({pct}%)
      </span>
    </div>
  );
}

export default function MallaInteractiva() {
  const [mencion, setMencion] = useState("ingeco");
  const [avance, setAvance] = useState(loadAvance);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(avance));
    } catch {
      /* localStorage no disponible en este navegador */
    }
  }, [avance]);

  function toggle(codigo) {
    setAvance((a) => ({ ...a, [codigo]: !a[codigo] }));
  }

  const allIngecoCodes = useMemo(
    () => malla.ingeco.niveles.flatMap((n) => n.ramos.map((r) => r.codigo)),
    []
  );
  const economiaCodes = useMemo(
    () =>
      [
        ...malla.economia.obligatorios,
        ...malla.economia.electivos_especialidad,
        ...malla.economia.electivos_sociales,
      ].map((r) => r.codigo),
    []
  );

  const ingecoDone = allIngecoCodes.filter((c) => avance[c]).length;
  const economiaDone = economiaCodes.filter((c) => avance[c]).length;

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="text-4xl">Malla interactiva</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Los ramos de Ingeniería Comercial por semestre, para las dos menciones. Marca lo que ya
        aprobaste y queda guardado en este navegador — no hay cuenta ni servidor detrás.
      </p>

      <div className="mt-4 flex items-start gap-3 border border-accent/40 bg-accent/10 p-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-muted-foreground">
          Esto lista los ramos reales y sus créditos (sacados de BuscaCursos), pero todavía{" "}
          <strong className="text-foreground">no marca qué ramo es prerrequisito de cuál</strong>{" "}
          — esa información no está en ninguna fuente que tengamos consolidada, solo en el PDF de
          programa de cada asignatura por separado. Queda anotado como pendiente.
        </p>
      </div>

      <div className="mt-8 flex gap-2">
        <button
          onClick={() => setMencion("ingeco")}
          className={
            "block-border px-4 py-2 text-sm font-semibold uppercase " +
            (mencion === "ingeco" ? "bg-primary text-primary-foreground" : "bg-card")
          }
        >
          Mención Administración
        </button>
        <button
          onClick={() => setMencion("economia")}
          className={
            "block-border px-4 py-2 text-sm font-semibold uppercase " +
            (mencion === "economia" ? "bg-primary text-primary-foreground" : "bg-card")
          }
        >
          Mención Economía
        </button>
      </div>

      {mencion === "ingeco" ? (
        <div className="mt-6">
          <div className="block-border mb-6 bg-card p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
              <span>Tu avance — {malla.ingeco.label}</span>
              <span>{malla.ingeco.semestre}</span>
            </div>
            <ProgressBar done={ingecoDone} total={allIngecoCodes.length} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {malla.ingeco.niveles.map((n) => (
              <div key={n.nivel}>
                <h2 className="mb-2 flex items-baseline gap-2 border-b border-foreground pb-2 text-sm font-bold uppercase">
                  Semestre {n.nivel}
                  <span className="font-mono text-[11px] font-normal text-muted-foreground">
                    {n.ramos.length} ramos
                  </span>
                </h2>
                <div className="flex flex-col gap-2">
                  {n.ramos.map((r) => (
                    <RamoCard
                      key={r.codigo}
                      ramo={r}
                      done={!!avance[r.codigo]}
                      onToggle={toggle}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="block-border mb-6 bg-card p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
              <span>Tu avance — {malla.economia.label}</span>
              <span>{malla.economia.semestre}</span>
            </div>
            <ProgressBar done={economiaDone} total={economiaCodes.length} />
          </div>

          <p className="mb-6 border-l-4 border-primary bg-secondary p-3 text-sm text-muted-foreground">
            Los semestres 1 y 2 de Economía son los mismos ramos que Administración (tronco
            común de la FAE) — revísalos en la pestaña{" "}
            <button
              onClick={() => setMencion("ingeco")}
              className="font-semibold text-primary underline"
            >
              Mención Administración
            </button>
            . Desde el semestre 3 la malla se separa; lo que sigue abajo son los ramos propios de
            Economía que trae BuscaCursos — todavía no tenemos confirmado en qué semestre exacto
            va cada uno, así que se muestran agrupados por tipo en vez de por semestre.
          </p>

          <div className="mb-8">
            <h2 className="mb-2 border-b border-foreground pb-2 text-sm font-bold uppercase">
              Obligatorios ({malla.economia.obligatorios.length})
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {malla.economia.obligatorios.map((r) => (
                <RamoCard key={r.codigo} ramo={r} done={!!avance[r.codigo]} onToggle={toggle} />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-2 border-b border-foreground pb-2 text-sm font-bold uppercase">
              Electivos de especialidad ({malla.economia.electivos_especialidad.length})
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {malla.economia.electivos_especialidad.map((r) => (
                <RamoCard key={r.codigo} ramo={r} done={!!avance[r.codigo]} onToggle={toggle} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-2 border-b border-foreground pb-2 text-sm font-bold uppercase">
              Electivos de ciencias sociales ({malla.economia.electivos_sociales.length})
            </h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {malla.economia.electivos_sociales.map((r) => (
                <RamoCard key={r.codigo} ramo={r} done={!!avance[r.codigo]} onToggle={toggle} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

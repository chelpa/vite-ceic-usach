import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Info, LayoutGrid, Maximize2, Minimize2, Waypoints } from "lucide-react";
import malla from "../data/malla.json";
import MallaPrerrequisitos from "./MallaPrerrequisitos";

const STORE_KEY = "ceic-malla-avance-v1";
const SIZE_STORE_KEY = "ceic-malla-tamano-v1";
const VISTA_STORE_KEY = "ceic-malla-vista-v1";

function loadVista() {
  try {
    const raw = localStorage.getItem(VISTA_STORE_KEY);
    if (raw === "clasica" || raw === "interactiva2") return raw;
  } catch {
    /* localStorage no disponible */
  }
  return "clasica";
}

function loadTamano() {
  try {
    const raw = localStorage.getItem(SIZE_STORE_KEY);
    if (raw === "chica" || raw === "grande") return raw;
  } catch {
    /* localStorage no disponible */
  }
  return "grande";
}

// Ramos propios de Economía agrupados por semestre real (no por tipo) — cruce
// hecho contra la malla oficial publicada en fae.usach.cl/cice (vigente desde
// 2023 y la anterior, hasta 2022, porque BuscaCursos trae secciones de ambas
// mallas corriendo en paralelo este semestre). Ver bitácora, entrada c19.
function economiaPorSemestre() {
  const todos = [
    ...malla.economia.obligatorios,
    ...malla.economia.electivos_especialidad,
    ...malla.economia.electivos_sociales,
  ];
  const porNivel = {};
  todos.forEach((r) => {
    const n = r.nivel;
    if (!porNivel[n]) porNivel[n] = [];
    porNivel[n].push(r);
  });
  return Object.keys(porNivel)
    .map(Number)
    .sort((a, b) => a - b)
    .map((nivel) => ({ nivel, ramos: porNivel[nivel] }));
}

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

function RamoCard({ ramo, done, onToggle, compact }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => onToggle(ramo.codigo)}
        title={ramo.nombre}
        aria-pressed={done}
        aria-label={(done ? "Marcar como no aprobado: " : "Marcar como aprobado: ") + ramo.nombre}
        className={
          "block-border flex w-full items-center gap-1.5 px-2 py-1.5 text-left transition-colors " +
          (done ? "bg-primary/10" : "bg-card")
        }
      >
        {done ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
        ) : (
          <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" aria-hidden="true" />
        )}
        <p
          className={
            "truncate text-[11.5px] leading-snug " +
            (done ? "text-muted-foreground line-through" : "")
          }
        >
          {ramo.nombre}
        </p>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onToggle(ramo.codigo)}
      aria-pressed={done}
      aria-label={(done ? "Marcar como no aprobado: " : "Marcar como aprobado: ") + ramo.nombre}
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

function SizeToggle({ tamano, onChange }) {
  return (
    <div className="block-border flex bg-card text-xs font-semibold uppercase" role="group" aria-label="Tamaño de la malla">
      <button
        type="button"
        onClick={() => onChange("grande")}
        aria-pressed={tamano === "grande"}
        className={
          "flex items-center gap-1.5 px-3 py-2 " +
          (tamano === "grande" ? "bg-primary text-primary-foreground" : "")
        }
      >
        <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
        Grande
      </button>
      <button
        type="button"
        onClick={() => onChange("chica")}
        aria-pressed={tamano === "chica"}
        className={
          "flex items-center gap-1.5 border-l border-foreground px-3 py-2 " +
          (tamano === "chica" ? "bg-primary text-primary-foreground" : "")
        }
      >
        <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
        Chica
      </button>
    </div>
  );
}

function VistaToggle({ vista, onChange }) {
  return (
    <div
      className="block-border flex bg-card text-xs font-semibold uppercase"
      role="group"
      aria-label="Vista de la malla"
    >
      <button
        type="button"
        onClick={() => onChange("clasica")}
        aria-pressed={vista === "clasica"}
        className={
          "flex items-center gap-1.5 px-3 py-2 " +
          (vista === "clasica" ? "bg-primary text-primary-foreground" : "")
        }
      >
        <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
        Clásica
      </button>
      <button
        type="button"
        onClick={() => onChange("interactiva2")}
        aria-pressed={vista === "interactiva2"}
        className={
          "flex items-center gap-1.5 border-l border-foreground px-3 py-2 " +
          (vista === "interactiva2" ? "bg-primary text-primary-foreground" : "")
        }
      >
        <Waypoints className="h-3.5 w-3.5" aria-hidden="true" />
        Interactiva 2.0
      </button>
    </div>
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
  const [tamano, setTamano] = useState(loadTamano);
  const [vista, setVista] = useState(loadVista);

  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(avance));
    } catch {
      /* localStorage no disponible en este navegador */
    }
  }, [avance]);

  useEffect(() => {
    try {
      localStorage.setItem(SIZE_STORE_KEY, tamano);
    } catch {
      /* localStorage no disponible en este navegador */
    }
  }, [tamano]);

  useEffect(() => {
    try {
      localStorage.setItem(VISTA_STORE_KEY, vista);
    } catch {
      /* localStorage no disponible en este navegador */
    }
  }, [vista]);

  function toggle(codigo) {
    setAvance((a) => ({ ...a, [codigo]: !a[codigo] }));
  }

  const compact = tamano === "chica";

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
  const economiaNiveles = useMemo(() => economiaPorSemestre(), []);

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
          Esto lista los ramos reales, sus créditos (sacados de BuscaCursos) y ahora también el
          semestre real de cada uno (cruzado contra la malla oficial de{" "}
          <a
            href="https://fae.usach.cl/cice/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline"
          >
            fae.usach.cl
          </a>
          ), pero esta vista clásica todavía{" "}
          <strong className="text-foreground">no marca qué ramo es prerrequisito de cuál</strong>{" "}
          — esa información no está en ninguna fuente oficial consolidada, solo en el PDF de programa
          de cada asignatura por separado. Para eso está{" "}
          <strong className="text-foreground">Interactiva 2.0</strong> (botón de abajo): muestra los
          prerrequisitos que sí se pudieron confirmar cruzando dos fuentes propias, aunque todavía no
          cubre todos los ramos.
        </p>
      </div>

      <div className="mt-4 flex justify-center sm:justify-start">
        <VistaToggle vista={vista} onChange={setVista} />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
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
        <SizeToggle tamano={tamano} onChange={setTamano} />
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

          {vista === "clasica" ? (
            <div
              className={
                "grid grid-cols-1 gap-4 sm:grid-cols-2 " +
                (compact ? "lg:grid-cols-10" : "lg:grid-cols-5")
              }
            >
              {malla.ingeco.niveles.map((n) => (
                <div key={n.nivel}>
                  <h2 className="mb-2 flex items-baseline gap-2 border-b border-foreground pb-2 text-sm font-bold uppercase">
                    Sem. {n.nivel}
                    <span className="font-mono text-[11px] font-normal text-muted-foreground">
                      {n.ramos.length}
                    </span>
                  </h2>
                  <div className="flex flex-col gap-2">
                    {n.ramos.map((r) => (
                      <RamoCard
                        key={r.codigo}
                        ramo={r}
                        done={!!avance[r.codigo]}
                        onToggle={toggle}
                        compact={compact}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <MallaPrerrequisitos mencion="ingeco" avance={avance} onToggle={toggle} compact={compact} />
          )}
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

          {vista === "clasica" ? (
            <>
              <p className="mb-6 border-l-4 border-primary bg-secondary p-3 text-sm text-muted-foreground">
                Los semestres 1 y 2 de Economía son los mismos ramos que Administración (tronco
                común de la FAE) — revísalos en la pestaña{" "}
                <button
                  onClick={() => setMencion("ingeco")}
                  className="font-semibold text-primary underline"
                >
                  Mención Administración
                </button>
                . Desde el semestre 3 la malla se separa. Lo que sigue abajo son los ramos propios de
                Economía que trae BuscaCursos, ya agrupados por su semestre real según la malla
                oficial — este corte no trajo ningún ramo específico de Economía para el semestre 3
                (probablemente porque ese semestre todavía comparte secciones con Administración este
                período).
              </p>

              <div
                className={
                  "grid grid-cols-1 gap-4 sm:grid-cols-2 " +
                  (compact ? "lg:grid-cols-8" : "lg:grid-cols-4")
                }
              >
                {economiaNiveles.map((n) => (
                  <div key={n.nivel}>
                    <h2 className="mb-2 flex items-baseline gap-2 border-b border-foreground pb-2 text-sm font-bold uppercase">
                      Sem. {n.nivel}
                      <span className="font-mono text-[11px] font-normal text-muted-foreground">
                        {n.ramos.length}
                      </span>
                    </h2>
                    <div className="flex flex-col gap-2">
                      {n.ramos.map((r, i) => (
                        <RamoCard
                          key={r.codigo + "-" + i}
                          ramo={r}
                          done={!!avance[r.codigo]}
                          onToggle={toggle}
                          compact={compact}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <MallaPrerrequisitos mencion="economia" avance={avance} onToggle={toggle} compact={compact} />
          )}
        </div>
      )}
    </div>
  );
}

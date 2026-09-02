import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Circle, Grid3x3, Share2, Info } from "lucide-react";
import malla from "../data/malla.json";
import prerrequisitos from "../data/malla_prerrequisitos.json";

// Vista "Interactiva 2.0": los mismos ramos y el mismo avance guardado de la
// malla clásica (misma localStorage, ceic-malla-avance-v1, recibida por props
// desde MallaInteractiva), pero con las relaciones de prerrequisito que
// Francisco reconstruyó cruzando dos fuentes propias: el webscraping de
// fae.usach.cl/cice de la mención Economía y la matriz completa (10
// semestres, las dos menciones) de su propio visualizador. Solo se usaron los
// cruces donde el nombre del ramo calzó exacto contra el dataset real de
// BuscaCursos (malla.json) — nunca por aproximación de texto, para no
// inventar una relación que no está confirmada. Ver bitácora.
const ESTILO_KEY = "ceic-malla-2-estilo-v1";

function loadEstilo() {
  try {
    const raw = localStorage.getItem(ESTILO_KEY);
    if (raw === "grid" || raw === "grafo") return raw;
  } catch {
    /* localStorage no disponible */
  }
  return "grid";
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

// Junta, para una mención, la lista de niveles {nivel, ramos:[...]} que
// corresponde mostrar en esta vista. Economía incluye además los niveles 1-3
// (tronco común con Administración) para que la cadena de prerrequisitos se
// pueda seguir completa de principio a fin, no solo desde el nivel 4.
function nivelesPara(mencion) {
  if (mencion === "ingeco") return malla.ingeco.niveles;
  const compartidos = malla.ingeco.niveles.filter((n) => n.nivel <= 3);
  const propios = [
    ...malla.economia.obligatorios,
    ...malla.economia.electivos_especialidad,
    ...malla.economia.electivos_sociales,
  ];
  const porNivel = {};
  propios.forEach((r) => {
    if (!porNivel[r.nivel]) porNivel[r.nivel] = [];
    porNivel[r.nivel].push(r);
  });
  const propiosNiveles = Object.keys(porNivel)
    .map(Number)
    .sort((a, b) => a - b)
    .map((nivel) => ({ nivel, ramos: porNivel[nivel] }));
  return [...compartidos, ...propiosNiveles];
}

function EstiloToggle({ estilo, onChange }) {
  return (
    <div
      className="block-border flex bg-card text-xs font-semibold uppercase"
      role="group"
      aria-label="Estilo de la malla interactiva 2.0"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-pressed={estilo === "grid"}
        className={
          "flex items-center gap-1.5 px-3 py-2 " +
          (estilo === "grid" ? "bg-primary text-primary-foreground" : "")
        }
      >
        <Grid3x3 className="h-3.5 w-3.5" aria-hidden="true" />
        Grilla
      </button>
      <button
        type="button"
        onClick={() => onChange("grafo")}
        aria-pressed={estilo === "grafo"}
        className={
          "flex items-center gap-1.5 border-l border-foreground px-3 py-2 " +
          (estilo === "grafo" ? "bg-primary text-primary-foreground" : "")
        }
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        Grafo
      </button>
    </div>
  );
}

function PrereqCard({ ramo, done, highlight, onToggle, onSelect, compact }) {
  const highlightClass =
    highlight === "activo"
      ? "border-primary ring-2 ring-primary"
      : highlight === "prerrequisito"
        ? "border-chart-3 bg-chart-3/15"
        : highlight === "desbloquea"
          ? "border-chart-2 bg-chart-2/15"
          : "";

  return (
    <div
      className={
        "block-border flex flex-col gap-1.5 text-left transition-colors " +
        (compact ? "p-1.5 " : "p-3 ") +
        (highlightClass || (done ? "bg-primary/10" : "bg-card"))
      }
    >
      <div className="flex items-start justify-between gap-1.5">
        <button
          type="button"
          onClick={() => onToggle(ramo.codigo)}
          aria-pressed={done}
          aria-label={(done ? "Marcar como no aprobado: " : "Marcar como aprobado: ") + ramo.nombre}
          className="flex min-w-0 flex-1 items-start gap-1.5 text-left"
        >
          {done ? (
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          ) : (
            <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40" aria-hidden="true" />
          )}
          <p
            className={
              (compact ? "text-[11px] " : "text-[13px] ") +
              "min-w-0 flex-1 truncate leading-snug " +
              (done ? "text-muted-foreground line-through" : "")
            }
            title={ramo.nombre}
          >
            {ramo.nombre}
          </p>
        </button>
        {prerrequisitos[ramo.codigo] ? (
          <button
            type="button"
            onClick={() => onSelect(ramo.codigo)}
            title="Ver prerrequisitos de este ramo"
            aria-label={"Ver prerrequisitos de " + ramo.nombre}
            aria-pressed={highlight === "activo"}
            className={
              "shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase " +
              (highlight === "activo"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border-strong text-muted-foreground hover:border-primary hover:text-primary")
            }
          >
            req
          </button>
        ) : null}
      </div>
      {!compact ? (
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={areaStyle(ramo.area)}>
            {ramo.area}
          </span>
          {ramo.sct != null ? (
            <span className="font-mono text-[10px] text-muted-foreground">{ramo.sct} SCT</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function GridVista({ niveles, avance, onToggle, compact }) {
  const [activoId, setActivoId] = useState(null);

  const todos = useMemo(() => niveles.flatMap((n) => n.ramos), [niveles]);
  const byCodigo = useMemo(() => Object.fromEntries(todos.map((r) => [r.codigo, r])), [todos]);

  const activo = activoId ? byCodigo[activoId] : null;
  const prereqIds = activo ? prerrequisitos[activo.codigo] || [] : [];
  const unlockIds = activoId
    ? Object.entries(prerrequisitos)
        .filter(([, reqs]) => reqs.includes(activoId))
        .map(([codigo]) => codigo)
    : [];

  function highlightDe(codigo) {
    if (!activoId) return null;
    if (codigo === activoId) return "activo";
    if (prereqIds.includes(codigo)) return "prerrequisito";
    if (unlockIds.includes(codigo)) return "desbloquea";
    return null;
  }

  function handleSelect(codigo) {
    setActivoId((cur) => (cur === codigo ? null : codigo));
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 border border-primary bg-primary" /> Ramo elegido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 border border-chart-3 bg-chart-3/40" /> Prerrequisito
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 border border-chart-2 bg-chart-2/40" /> Desbloquea
        </span>
        <span className="normal-case text-muted-foreground/80">
          — clic en <span className="font-mono normal-case">req</span> para ver la cadena, clic en el
          ramo para marcarlo aprobado
        </span>
      </div>

      {activo ? (
        <div className="block-border mb-4 bg-card p-3 text-sm">
          <p className="font-semibold text-foreground">{activo.nombre}</p>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase text-chart-3">Prerrequisitos</p>
              {prereqIds.length ? (
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {prereqIds.map((id) => (
                    <li key={id}>{byCodigo[id]?.nombre || id}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-muted-foreground/70">Ninguno registrado</p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-chart-2">Desbloquea</p>
              {unlockIds.length ? (
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {unlockIds.map((id) => (
                    <li key={id}>{byCodigo[id]?.nombre || id}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-muted-foreground/70">Ninguno registrado</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={
          "grid grid-cols-1 gap-4 sm:grid-cols-2 " + (compact ? "lg:grid-cols-8" : "lg:grid-cols-4")
        }
      >
        {niveles.map((n) => (
          <div key={n.nivel}>
            <h2 className="mb-2 flex items-baseline gap-2 border-b border-foreground pb-2 text-sm font-bold uppercase">
              Sem. {n.nivel}
              <span className="font-mono text-[11px] font-normal text-muted-foreground">
                {n.ramos.length}
              </span>
            </h2>
            <div className="flex flex-col gap-2">
              {n.ramos.map((r, i) => (
                <PrereqCard
                  key={r.codigo + "-" + i}
                  ramo={r}
                  done={!!avance[r.codigo]}
                  highlight={highlightDe(r.codigo)}
                  onToggle={onToggle}
                  onSelect={handleSelect}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function readThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  const get = (name, fallback) => styles.getPropertyValue(name)?.trim() || fallback;
  return {
    card: get("--color-card", "#ffffff"),
    border: get("--color-border-strong", "#bfd0cf"),
    foreground: get("--color-foreground", "#10201f"),
    mutedForeground: get("--color-muted-foreground", "#5b6d6b"),
    primary: get("--color-primary", "#0c7c78"),
    primaryForeground: get("--color-primary-foreground", "#ffffff"),
    chart3: get("--color-chart-3", "#b3432f"),
  };
}

function GrafoVista({ niveles, avance, onToggle }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const nodesDataRef = useRef(null);
  const edgesDataRef = useRef(null);

  const todos = useMemo(() => niveles.flatMap((n) => n.ramos), [niveles]);
  const conRelacion = useMemo(
    () => new Set(todos.filter((r) => prerrequisitos[r.codigo]).map((r) => r.codigo)),
    [todos]
  );
  const enAlgunaCadena = useMemo(() => {
    const s = new Set();
    todos.forEach((r) => {
      const reqs = prerrequisitos[r.codigo];
      if (reqs && reqs.length) {
        s.add(r.codigo);
        reqs.forEach((id) => s.add(id));
      }
    });
    return s;
  }, [todos]);

  // Construye el grafo una sola vez por cambio de mención (nodos/aristas)
  useEffect(() => {
    let cancelled = false;
    import("vis-network/standalone/esm/vis-network.js").then(({ DataSet, Network }) => {
      if (cancelled || !containerRef.current) return;

      const relevantes = todos.filter((r) => enAlgunaCadena.has(r.codigo));
      const colors = readThemeColors();

      function nodeColor(codigo) {
        const done = !!avance[codigo];
        return {
          background: done ? colors.primary : colors.card,
          border: done ? colors.primary : colors.border,
          highlight: { background: colors.primary, border: colors.primary },
        };
      }

      const nodes = new DataSet(
        relevantes.map((r) => ({
          id: r.codigo,
          label: r.nombre,
          level: r.nivel,
          shape: "box",
          margin: 8,
          widthConstraint: { minimum: 90, maximum: 150 },
          font: { color: avance[r.codigo] ? colors.primaryForeground : colors.foreground, size: 11, face: "inherit" },
          color: nodeColor(r.codigo),
        }))
      );

      const edges = new DataSet(
        relevantes.flatMap((r) => {
          const reqs = prerrequisitos[r.codigo] || [];
          return reqs
            .filter((id) => enAlgunaCadena.has(id))
            .map((id) => ({ from: id, to: r.codigo, arrows: "to" }));
        })
      );

      nodesDataRef.current = nodes;
      edgesDataRef.current = edges;

      const options = {
        layout: {
          hierarchical: {
            enabled: true,
            direction: "LR",
            levelSeparation: 170,
            nodeSpacing: 26,
            treeSpacing: 26,
          },
        },
        physics: false,
        interaction: { hover: true, dragNodes: false, zoomView: true, dragView: true },
        edges: {
          color: { color: colors.border, highlight: colors.chart3 },
          smooth: { type: "cubicBezier", forceDirection: "horizontal", roundness: 0.5 },
          width: 1.5,
        },
        nodes: { borderWidth: 2, shadow: false },
      };

      if (networkRef.current) {
        networkRef.current.destroy();
      }
      const network = new Network(containerRef.current, { nodes, edges }, options);
      network.on("click", (params) => {
        if (params.nodes && params.nodes.length) {
          onToggle(params.nodes[0]);
        }
      });
      network.fit({ animation: false, maxZoomLevel: 1.4 });
      networkRef.current = network;
    });

    return () => {
      cancelled = true;
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todos, enAlgunaCadena]);

  // Recolorea nodos cuando cambia el avance o el tema (claro/oscuro/amigable),
  // sin reconstruir todo el grafo.
  useEffect(() => {
    function repaint() {
      if (!nodesDataRef.current) return;
      const colors = readThemeColors();
      const updates = nodesDataRef.current.getIds().map((codigo) => {
        const done = !!avance[codigo];
        return {
          id: codigo,
          color: {
            background: done ? colors.primary : colors.card,
            border: done ? colors.primary : colors.border,
            highlight: { background: colors.primary, border: colors.primary },
          },
          font: { color: done ? colors.primaryForeground : colors.foreground, size: 11, face: "inherit" },
        };
      });
      if (updates.length) nodesDataRef.current.update(updates);
    }
    repaint();
    const observer = new MutationObserver(repaint);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, [avance]);

  return (
    <div>
      <p className="mb-2 text-[11px] text-muted-foreground">
        Solo se grafican los {conRelacion.size} ramos con al menos un prerrequisito confirmado y los
        ramos de los que dependen ({enAlgunaCadena.size} en total) — clic en un nodo lo marca
        aprobado/no aprobado, igual que en la grilla.
      </p>
      <div
        ref={containerRef}
        className="block-border h-[340px] w-full bg-card"
        role="img"
        aria-label="Grafo de prerrequisitos entre ramos"
      />
    </div>
  );
}

export default function MallaPrerrequisitos({ mencion, avance, onToggle, compact }) {
  const [estilo, setEstilo] = useState(loadEstilo);

  useEffect(() => {
    try {
      localStorage.setItem(ESTILO_KEY, estilo);
    } catch {
      /* localStorage no disponible */
    }
  }, [estilo]);

  const niveles = useMemo(() => nivelesPara(mencion), [mencion]);
  const totalConDato = useMemo(
    () => niveles.flatMap((n) => n.ramos).filter((r) => prerrequisitos[r.codigo]).length,
    [niveles]
  );

  return (
    <div className="mt-6">
      <div className="mt-4 flex items-start gap-3 border border-accent/40 bg-accent/10 p-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-muted-foreground">
          Interactiva 2.0: {totalConDato} ramos de esta mención ya tienen prerrequisito confirmado —
          cruzando el webscraping de fae.usach.cl/cice con la matriz completa que arm{"ó"} Francisco, y
          quedándose solo con los nombres que calzan exacto contra el dato real de BuscaCursos. El
          resto de los ramos todavía no tiene esa relación registrada en ninguna fuente que tengamos
          consolidada. El avance marcado acá es el mismo de la malla clásica.
        </p>
      </div>

      <div className="mt-4 flex justify-end">
        <EstiloToggle estilo={estilo} onChange={setEstilo} />
      </div>

      <div className="mt-4">
        {estilo === "grid" ? (
          <GridVista niveles={niveles} avance={avance} onToggle={onToggle} compact={compact} />
        ) : (
          <GrafoVista niveles={niveles} avance={avance} onToggle={onToggle} />
        )}
      </div>
    </div>
  );
}

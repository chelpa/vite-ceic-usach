import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Info,
} from "lucide-react";
import malla from "../data/malla.json";
import prerrequisitos from "../data/malla_prerrequisitos.json";
import {
  commonTrunkLevels,
  parallelSameNameGroupForCode,
  progressCodeIsDone,
} from "../lib/malla/canon";

// Vista integrada en /malla a partir del prototipo malla_grid.html.
// La mención y el avance pertenecen a MallaInteractiva y llegan por props.
// No existe aquí un segundo localStorage ni una segunda fuente de verdad.

function nivelesPara(mencion) {
  if (mencion === "ingeco") {
    return malla.ingeco.niveles;
  }

  const troncoComun = new Set(
    commonTrunkLevels(),
  );

  const compartidos =
    malla.ingeco.niveles.filter((n) =>
      troncoComun.has(n.nivel),
    );

  const propios = [
    ...malla.economia.obligatorios,
    ...malla.economia.electivos_especialidad,
    ...malla.economia.electivos_sociales,
  ];

  const porNivel = {};

  propios.forEach((r) => {
    if (!porNivel[r.nivel]) {
      porNivel[r.nivel] = [];
    }

    porNivel[r.nivel].push(r);
  });

  const propiosNiveles =
    Object.keys(porNivel)
      .map(Number)
      .sort((a, b) => a - b)
      .map((nivel) => ({
        nivel,
        ramos: porNivel[nivel],
      }));

  return [
    ...compartidos,
    ...propiosNiveles,
  ];
}

const ROMANOS = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
];

function armarMatriz(niveles) {
  const porNivel = {};

  niveles.forEach((n) => {
    porNivel[n.nivel] = n.ramos;
  });

  const columnas = Array.from(
    { length: 10 },
    (_, i) => porNivel[i + 1] || [],
  );

  const maxFilas = Math.max(
    1,
    ...columnas.map((c) => c.length),
  );

  return Array.from(
    { length: maxFilas },
    (_, fila) =>
      columnas.map(
        (col) => col[fila] || null,
      ),
  );
}

function RamoCard({
  ramo,
  estado,
  done,
  onSelect,
  compact,
}) {
  const parallelGroup =
    parallelSameNameGroupForCode(
      ramo.codigo,
    );

  const parallelCode = parallelGroup
    ? parallelGroup.codigos.find(
        (codigo) =>
          codigo !==
          parallelGroup.codigo_presentacion,
      )
    : null;

  const estadoClase =
    estado === "seleccionado"
      ? "border-primary bg-primary text-primary-foreground shadow-sm"
      : estado === "prerrequisito"
        ? "border-primary bg-secondary text-foreground"
        : estado === "desbloquea"
          ? "border-accent bg-accent/20 text-foreground"
          : done
            ? "border-primary/60 bg-primary/10 text-foreground"
            : "border-foreground/20 bg-card text-foreground hover:bg-secondary";

  return (
    <button
      type="button"
      onClick={() =>
        onSelect(ramo.codigo)
      }
      title={ramo.nombre}
      aria-label={
        `Seleccionar ${ramo.nombre}` +
        (done ? ", aprobado" : "")
      }
      className={
        "relative flex w-full items-center justify-center border p-1.5 " +
        "text-center font-semibold leading-tight transition-colors " +
        (compact
          ? "min-h-[48px] text-[10px] "
          : "min-h-[58px] text-[11px] ") +
        estadoClase
      }
    >
      {done ? (
        <CheckCircle2
          className="absolute right-1 top-1 h-3.5 w-3.5"
          aria-label="Aprobado"
        />
      ) : null}

      <span>
        <span className="block">
          {ramo.nombre}
        </span>

        {parallelGroup ? (
          <span className="mt-0.5 block font-mono text-[9px] font-normal">
            {
              parallelGroup.codigo_presentacion
            }{" "}
            · también {parallelCode}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export default function MallaGridPreview({
  mencion,
  avance,
  onToggle,
  compact = false,
}) {
  const [activoId, setActivoId] =
    useState(null);

  const niveles = useMemo(
    () => nivelesPara(mencion),
    [mencion],
  );

  const filas = useMemo(
    () => armarMatriz(niveles),
    [niveles],
  );

  const todos = useMemo(
    () =>
      niveles.flatMap(
        (n) => n.ramos,
      ),
    [niveles],
  );

  const byCodigo = useMemo(
    () =>
      Object.fromEntries(
        todos.map((r) => [
          r.codigo,
          r,
        ]),
      ),
    [todos],
  );

  const activo = activoId
    ? byCodigo[activoId]
    : null;

  const prereqIds = activo
    ? prerrequisitos[
        activo.codigo
      ] || []
    : [];

  const unlockIds = activoId
    ? Object.entries(
        prerrequisitos,
      )
        .filter(([, reqs]) =>
          reqs.includes(activoId),
        )
        .map(
          ([codigo]) => codigo,
        )
    : [];

  function estadoDe(codigo) {
    if (!activoId) return null;

    if (codigo === activoId) {
      return "seleccionado";
    }

    if (
      prereqIds.includes(codigo)
    ) {
      return "prerrequisito";
    }

    if (
      unlockIds.includes(codigo)
    ) {
      return "desbloquea";
    }

    return null;
  }

  function handleSelect(codigo) {
    setActivoId((current) =>
      current === codigo
        ? null
        : codigo,
    );
  }

  const activoDone = activo
    ? progressCodeIsDone(
        avance || {},
        activo.codigo,
      )
    : false;

  return (
    <section
      className="mt-6"
      aria-labelledby="malla-usach-title"
    >
      <div className="mb-4">
        <h2
          id="malla-usach-title"
          className="text-2xl"
        >
          Interactiva USACH
        </h2>

        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Cuadrícula por semestre con los
          mismos ramos, prerrequisitos y
          avance de las otras vistas de la
          malla.
        </p>
      </div>

      <div className="flex items-start gap-3 border border-accent/40 bg-accent/10 p-3 text-sm">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-accent"
          aria-hidden="true"
        />

        <p className="text-muted-foreground">
          La cobertura de prerrequisitos
          sigue limitada a las relaciones
          verificadas disponibles.
          Selecciona un ramo para ver qué
          exige y qué desbloquea. El avance
          aprobado/no aprobado es el mismo
          de Clásica e Interactiva 2.0.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
        <span className="border border-primary bg-primary px-2.5 py-1 text-primary-foreground">
          Seleccionado
        </span>

        <span className="border border-primary bg-secondary px-2.5 py-1 text-foreground">
          Prerrequisito
        </span>

        <span className="border border-accent bg-accent/20 px-2.5 py-1 text-foreground">
          Abre a
        </span>

        <span className="flex items-center gap-1 border border-primary/60 bg-primary/10 px-2.5 py-1 text-foreground">
          <CheckCircle2
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
          Aprobado
        </span>
      </div>

      <div className="mt-4 overflow-x-auto border border-foreground/20 bg-card p-4">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns:
              `repeat(10, minmax(${
                compact
                  ? 105
                  : 130
              }px, 1fr))`,
          }}
        >
          {ROMANOS.map((r) => (
            <div
              key={r}
              className="border border-primary bg-primary py-2 text-center text-xs font-bold text-primary-foreground"
            >
              Semestre {r}
            </div>
          ))}

          {filas.map(
            (fila, i) =>
              fila.map(
                (ramo, j) =>
                  ramo ? (
                    <RamoCard
                      key={
                        ramo.codigo
                      }
                      ramo={ramo}
                      estado={estadoDe(
                        ramo.codigo,
                      )}
                      done={progressCodeIsDone(
                        avance || {},
                        ramo.codigo,
                      )}
                      onSelect={
                        handleSelect
                      }
                      compact={
                        compact
                      }
                    />
                  ) : (
                    <div
                      key={`vacio-${i}-${j}`}
                      className={
                        compact
                          ? "min-h-[48px]"
                          : "min-h-[58px]"
                      }
                    />
                  ),
              ),
          )}
        </div>
      </div>

      {activo ? (
        <div className="mt-4 border border-foreground/20 bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-bold">
              {activo.nombre}
            </h3>

            <button
              type="button"
              onClick={() =>
                onToggle(
                  activo.codigo,
                )
              }
              aria-pressed={
                activoDone
              }
              className={
                "block-border flex items-center gap-1.5 px-3 py-2 " +
                "text-xs font-semibold uppercase " +
                (activoDone
                  ? "bg-primary text-primary-foreground"
                  : "bg-card")
              }
            >
              {activoDone ? (
                <CheckCircle2
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
              )}

              {activoDone
                ? "Aprobado"
                : "Marcar aprobado"}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            <div>
              <span className="font-bold">
                Prerrequisitos directos:
              </span>

              {prereqIds.length ? (
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {prereqIds.map(
                    (id) => (
                      <li key={id}>
                        {
                          byCodigo[id]
                            ?.nombre ||
                          id
                        }
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p className="mt-1 text-muted-foreground">
                  Ninguno
                </p>
              )}
            </div>

            <div>
              <span className="font-bold">
                Desbloquea:
              </span>

              {unlockIds.length ? (
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {unlockIds.map(
                    (id) => (
                      <li key={id}>
                        {
                          byCodigo[id]
                            ?.nombre ||
                          id
                        }
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p className="mt-1 text-muted-foreground">
                  Ninguna
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import malla from "../data/malla.json";
import prerrequisitos from "../data/malla_prerrequisitos.json";

// Página de PREVIEW, sin integrar todavía a /malla — pedido explícito de
// Francisco: "primero visualizar bien" el estilo visual de su prototipo
// malla_grid.html (cuadrícula gris de 10 columnas, cabecera naranja,
// selección azul/rojo/verde) antes de fusionarlo con los botones que ya
// existen en /malla (VistaToggle Clásica/Interactiva 2.0, EstiloToggle
// Grilla/Grafo — ver MallaInteractiva.jsx y MallaPrerrequisitos.jsx).
//
// La diferencia con malla_grid.html: acá los ramos y el semestre de cada uno
// salen de malla.json (datos reales cruzados contra BuscaCursos, igual que
// el resto del sitio) y las relaciones de prerrequisito de
// malla_prerrequisitos.json (las 26 ya confirmadas — ver bitácora, entradas
// c30/c31), no de la matriz escrita a mano que traía malla_grid.html. Por
// eso el número de columnas ocupadas y algunas filas se ven distintas: esto
// no inventa ningún ramo ni prerrequisito nuevo, solo reusa el look del
// prototipo con la data ya verificada del sitio.

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

const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

// De la lista de niveles {nivel, ramos} arma una matriz de 10 columnas (una
// por semestre) x N filas, igual a como estaba armada a mano la matriz de
// malla_grid.html — pero acá las columnas y sus alturas salen de la data
// real en vez de estar tipeadas.
function armarMatriz(niveles) {
  const porNivel = {};
  niveles.forEach((n) => {
    porNivel[n.nivel] = n.ramos;
  });
  const columnas = Array.from({ length: 10 }, (_, i) => porNivel[i + 1] || []);
  const maxFilas = Math.max(1, ...columnas.map((c) => c.length));
  const filas = Array.from({ length: maxFilas }, (_, fila) =>
    columnas.map((col) => col[fila] || null)
  );
  return filas;
}

function RamoCard({ ramo, estado, onClick }) {
  const estadoClase =
    estado === "seleccionado"
      ? "bg-blue-600 text-white scale-[1.02] shadow-md z-10"
      : estado === "prerrequisito"
        ? "bg-red-500 text-white"
        : estado === "desbloquea"
          ? "bg-green-500 text-white"
          : "bg-gray-300 text-gray-800 hover:brightness-95";

  return (
    <button
      type="button"
      onClick={() => onClick(ramo.codigo)}
      title={ramo.nombre}
      className={
        "flex min-h-[58px] items-center justify-center rounded-sm p-1.5 text-center text-[11px] font-semibold leading-tight transition-all " +
        estadoClase
      }
    >
      {ramo.nombre}
    </button>
  );
}

export default function MallaGridPreview() {
  const [mencion, setMencion] = useState("economia");
  const [activoId, setActivoId] = useState(null);

  const niveles = useMemo(() => nivelesPara(mencion), [mencion]);
  const filas = useMemo(() => armarMatriz(niveles), [niveles]);
  const todos = useMemo(() => niveles.flatMap((n) => n.ramos), [niveles]);
  const byCodigo = useMemo(() => Object.fromEntries(todos.map((r) => [r.codigo, r])), [todos]);

  const activo = activoId ? byCodigo[activoId] : null;
  const prereqIds = activo ? prerrequisitos[activo.codigo] || [] : [];
  const unlockIds = activoId
    ? Object.entries(prerrequisitos)
        .filter(([, reqs]) => reqs.includes(activoId))
        .map(([codigo]) => codigo)
    : [];

  function estadoDe(codigo) {
    if (!activoId) return null;
    if (codigo === activoId) return "seleccionado";
    if (prereqIds.includes(codigo)) return "prerrequisito";
    if (unlockIds.includes(codigo)) return "desbloquea";
    return null;
  }

  function handleClick(codigo) {
    setActivoId((cur) => (cur === codigo ? null : codigo));
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="text-4xl">Interactiva USACH — preview visual</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Página de prueba, todavía no integrada a <code className="font-mono text-xs">/malla</code>:
        el mismo look de cuadrícula del prototipo <code className="font-mono text-xs">malla_grid.html</code>{" "}
        que compartiste, pero con los ramos y prerrequisitos reales del sitio (no la matriz escrita a
        mano). Sirve para revisar el estilo antes de fusionarlo con los botones que ya existen en{" "}
        <code className="font-mono text-xs">/malla</code> (Clásica / Interactiva 2.0 / Grilla / Grafo).
      </p>

      <div className="mt-4 flex items-start gap-3 border border-accent/40 bg-accent/10 p-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-muted-foreground">
          Como en Interactiva 2.0, solo hay relación de prerrequisito registrada para 26 ramos (31
          relaciones) — el resto se ve gris siempre porque esa fuente todavía no cubre el ramo. Esta
          vista no guarda avance (aprobado/no aprobado); eso se retoma cuando se fusione con{" "}
          <code className="font-mono text-xs">/malla</code>.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <label htmlFor="mencion-select" className="text-xs font-bold text-gray-700">
            Mención:
          </label>
          <select
            id="mencion-select"
            value={mencion}
            onChange={(e) => {
              setMencion(e.target.value);
              setActivoId(null);
            }}
            className="rounded-md border border-gray-300 bg-gray-50 p-2 text-xs font-semibold text-gray-900 shadow-sm"
          >
            <option value="economia">Ingeniería Comercial en Economía (CICE)</option>
            <option value="ingeco">Ingeniería Comercial en Administración (CICA)</option>
          </select>
        </div>
        <div className="flex gap-2 text-[11px] font-bold">
          <span className="rounded bg-blue-600 px-2.5 py-1 text-white">Seleccionado</span>
          <span className="rounded bg-red-500 px-2.5 py-1 text-white">Prerrequisito</span>
          <span className="rounded bg-green-500 px-2.5 py-1 text-white">Abre a</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: "repeat(10, minmax(130px, 1fr))" }}
        >
          {ROMANOS.map((r) => (
            <div
              key={r}
              className="rounded-sm bg-[#e67e22] py-2 text-center text-xs font-bold text-white"
            >
              Semestre {r}
            </div>
          ))}
          {filas.map((fila, i) =>
            fila.map((ramo, j) =>
              ramo ? (
                <RamoCard
                  key={ramo.codigo}
                  ramo={ramo}
                  estado={estadoDe(ramo.codigo)}
                  onClick={handleClick}
                />
              ) : (
                <div key={`vacio-${i}-${j}`} className="min-h-[58px]" />
              )
            )
          )}
        </div>
      </div>

      {activo ? (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-bold text-gray-800">{activo.nombre}</h3>
          <div className="mt-2 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            <div>
              <span className="font-bold text-red-600">Prerrequisitos directos:</span>
              {prereqIds.length ? (
                <ul className="list-inside list-disc text-gray-600">
                  {prereqIds.map((id) => (
                    <li key={id}>{byCodigo[id]?.nombre || id}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Ninguno</p>
              )}
            </div>
            <div>
              <span className="font-bold text-green-600">Desbloquea las siguientes asignaturas:</span>
              {unlockIds.length ? (
                <ul className="list-inside list-disc text-gray-600">
                  {unlockIds.map((id) => (
                    <li key={id}>{byCodigo[id]?.nombre || id}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">Ninguna</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

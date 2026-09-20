import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

const malla = JSON.parse(
  await readFile(join(raiz, "src/data/malla.json"), "utf8"),
);

const canon = JSON.parse(
  await readFile(join(raiz, "src/data/malla_canon.json"), "utf8"),
);

const ALLOWED_TOP_LEVEL_KEYS = new Set([
  "areas",
  "parallel_same_name_groups",
  "tronco_comun",
  "planes_verificados",
  "planes_no_modelados",
]);

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

// ------------------------------------------------------------
// Esquema superior cerrado.
// Commit 5 exige areas; las otras claves están reservadas para
// commits 6 y 7, pero cualquier nombre fuera de esta lista falla.
// ------------------------------------------------------------
if (!isPlainObject(canon)) {
  fail("malla_canon.json debe ser un objeto");
}

for (const key of Object.keys(canon)) {
  if (!ALLOWED_TOP_LEVEL_KEYS.has(key)) {
    fail(`clave superior no permitida en malla_canon.json: ${key}`);
  }
}

if (!isPlainObject(canon.areas)) {
  fail("malla_canon.json debe contener un objeto areas");
}

// ------------------------------------------------------------
// Cada entrada de areas tiene exactamente { canon, label }.
// ------------------------------------------------------------
for (const [raw, entry] of Object.entries(canon.areas)) {
  if (!isPlainObject(entry)) {
    fail(`areas[${JSON.stringify(raw)}] debe ser un objeto`);
  }

  const keys = Object.keys(entry).sort();

  if (keys.length !== 2 || keys[0] !== "canon" || keys[1] !== "label") {
    fail(
      `areas[${JSON.stringify(raw)}] debe tener exactamente las claves canon y label`,
    );
  }

  if (typeof entry.canon !== "string" || !entry.canon.trim()) {
    fail(`areas[${JSON.stringify(raw)}].canon debe ser string no vacío`);
  }

  if (typeof entry.label !== "string" || !entry.label.trim()) {
    fail(`areas[${JSON.stringify(raw)}].label debe ser string no vacío`);
  }
}

// ------------------------------------------------------------
// Extraer cada area realmente presente en malla.json.
// ------------------------------------------------------------
const rawAreas = new Set();

function collectAreas(value) {
  if (Array.isArray(value)) {
    for (const item of value) collectAreas(item);
    return;
  }

  if (!isPlainObject(value)) return;

  if (typeof value.area === "string") {
    rawAreas.add(value.area);
  }

  for (const child of Object.values(value)) {
    collectAreas(child);
  }
}

collectAreas(malla);

for (const raw of rawAreas) {
  if (!Object.hasOwn(canon.areas, raw)) {
    fail(`area de malla.json sin mapeo canónico: ${JSON.stringify(raw)}`);
  }
}

// ------------------------------------------------------------
// Invariantes que motivan este commit.
// ------------------------------------------------------------
if (
  canon.areas.ECONOMIA?.canon !==
  canon.areas["ECONOMÍA"]?.canon
) {
  fail("ECONOMIA y ECONOMÍA deben resolver al mismo canon");
}

if (
  canon.areas.FIN?.canon !==
  canon.areas.FINANZAS?.canon
) {
  fail("FIN y FINANZAS deben resolver al mismo canon");
}


// ------------------------------------------------------------
// Commit 6: grupos paralelos de mismo nombre / mismo nivel.
// La existencia de ambos códigos es SOURCE.
// El conteo una vez es PRODUCT_HEURISTIC.
// La equivalencia curricular permanece UNKNOWN.
// ------------------------------------------------------------
const PARALLEL_EXPECTED = [
  {
    codigos: ["351475", "352474"],
    nombre: "Macroeconomía II",
    nivel: 6,
    codigo_presentacion: "352474",
  },
  {
    codigos: ["351477", "352472"],
    nombre: "Econometría II",
    nivel: 6,
    codigo_presentacion: "352472",
  },
  {
    codigos: ["351497", "352490"],
    nombre: "Práctica Profesional",
    nivel: 9,
    codigo_presentacion: "352490",
  },
];

if (!Array.isArray(canon.parallel_same_name_groups)) {
  fail("parallel_same_name_groups debe ser un array");
}

if (canon.parallel_same_name_groups.length !== PARALLEL_EXPECTED.length) {
  fail(
    `parallel_same_name_groups debe contener exactamente ${PARALLEL_EXPECTED.length} grupos`,
  );
}

const ramosByCode = new Map();

function collectRamos(value) {
  if (Array.isArray(value)) {
    for (const item of value) collectRamos(item);
    return;
  }

  if (!isPlainObject(value)) return;

  if (
    typeof value.codigo === "string" &&
    typeof value.nombre === "string" &&
    Number.isInteger(value.nivel)
  ) {
    ramosByCode.set(value.codigo, value);
  }

  for (const child of Object.values(value)) {
    collectRamos(child);
  }
}

collectRamos(malla);

const groupKeys = [
  "codigo_presentacion",
  "codigos",
  "conteo_avance",
  "evidencia",
  "nivel",
  "nombre",
  "official_equivalence",
].sort();

const seenCodes = new Set();

for (let i = 0; i < PARALLEL_EXPECTED.length; i++) {
  const actual = canon.parallel_same_name_groups[i];
  const expected = PARALLEL_EXPECTED[i];

  if (!isPlainObject(actual)) {
    fail(`parallel_same_name_groups[${i}] debe ser un objeto`);
  }

  const actualKeys = Object.keys(actual).sort();

  if (
    actualKeys.length !== groupKeys.length ||
    actualKeys.some((key, index) => key !== groupKeys[index])
  ) {
    fail(
      `parallel_same_name_groups[${i}] tiene claves inesperadas`,
    );
  }

  if (
    JSON.stringify(actual.codigos) !== JSON.stringify(expected.codigos) ||
    actual.nombre !== expected.nombre ||
    actual.nivel !== expected.nivel ||
    actual.codigo_presentacion !== expected.codigo_presentacion
  ) {
    fail(`parallel_same_name_groups[${i}] no coincide con el grupo esperado`);
  }

  if (actual.official_equivalence !== "UNKNOWN") {
    fail(
      `parallel_same_name_groups[${i}].official_equivalence debe ser UNKNOWN`,
    );
  }

  if (
    typeof actual.evidencia !== "string" ||
    !actual.evidencia.startsWith("SOURCE:")
  ) {
    fail(`parallel_same_name_groups[${i}].evidencia debe declarar SOURCE`);
  }

  if (
    typeof actual.conteo_avance !== "string" ||
    !actual.conteo_avance.startsWith("PRODUCT_HEURISTIC:")
  ) {
    fail(
      `parallel_same_name_groups[${i}].conteo_avance debe declarar PRODUCT_HEURISTIC`,
    );
  }

  if (!actual.codigos.includes(actual.codigo_presentacion)) {
    fail(
      `parallel_same_name_groups[${i}].codigo_presentacion debe pertenecer al grupo`,
    );
  }

  for (const codigo of actual.codigos) {
    if (seenCodes.has(codigo)) {
      fail(`código repetido entre grupos paralelos: ${codigo}`);
    }

    seenCodes.add(codigo);

    const ramo = ramosByCode.get(codigo);

    if (!ramo) {
      fail(`código paralelo inexistente en malla.json: ${codigo}`);
    }

    if (ramo.nombre !== actual.nombre || ramo.nivel !== actual.nivel) {
      fail(
        `fuente no coincide para ${codigo}: nombre/nivel distinto de la capa canónica`,
      );
    }

    if (!(Number(ramo.secciones) > 0)) {
      fail(`código ${codigo} no tiene secciones ofertadas en malla.json`);
    }
  }
}


// ------------------------------------------------------------
// Commit 7: tronco común y alcance de planes verificados.
// ------------------------------------------------------------
const TRONCO_EXPECTED = {
  niveles: [1, 2, 3],
  alcance: "Solo para los planes listados en planes_verificados.",
  verificado: "2026-09-19",
};

if (JSON.stringify(canon.tronco_comun) !== JSON.stringify(TRONCO_EXPECTED)) {
  fail("tronco_comun no coincide con el esquema congelado");
}

const PLANES_VERIFICADOS_EXPECTED = [
  {
    mencion: "ingeco",
    plan: "Ingeniería Comercial en Administración de Empresas — malla 2024",
    fuente: [
      "https://fae.usach.cl/cica/malla_2024.html",
      "https://fae.usach.cl/fae/docs/administracion/plan-estudios-ing-com-en-adm-empresas.pdf",
    ],
    tronco_comun_niveles: [1, 2, 3],
    estado: "SOURCE",
  },
  {
    mencion: "economia",
    plan: "Ingeniería Comercial en Economía — malla vigente para ingresos a partir de 2023",
    fuente: ["https://fae.usach.cl/cice/"],
    tronco_comun_niveles: [1, 2, 3],
    estado: "SOURCE",
  },
];

if (
  JSON.stringify(canon.planes_verificados) !==
  JSON.stringify(PLANES_VERIFICADOS_EXPECTED)
) {
  fail("planes_verificados no coincide con el esquema congelado");
}

const PLANES_NO_MODELADOS_EXPECTED = [
  {
    plan: "Economía — malla para ingresos hasta 2022 (fae.usach.cl/cice/index_2022.html)",
    estado: "FUERA_DE_M1",
  },
  {
    plan: "Economía — rediseño 2025 (economia.usach.cl, noticia 2025-06-04)",
    estado: "SOURCE_RESOLUTION_PENDING",
  },
];

if (
  JSON.stringify(canon.planes_no_modelados) !==
  JSON.stringify(PLANES_NO_MODELADOS_EXPECTED)
) {
  fail("planes_no_modelados no coincide con el esquema congelado");
}

if (
  JSON.stringify(malla.economia?.comparte_niveles_con_ingeco) !==
  JSON.stringify([1, 2])
) {
  fail(
    "el campo histórico comparte_niveles_con_ingeco debe permanecer intacto en [1,2]",
  );
}

const READER_FILES = [
  "src/pages/MallaInteractiva.jsx",
  "src/pages/MallaPrerrequisitos.jsx",
  "src/pages/MallaGridPreview.jsx",
];

for (const relative of READER_FILES) {
  const source = await readFile(join(raiz, relative), "utf8");

  if (source.includes("comparte_niveles_con_ingeco")) {
    fail(`${relative} todavía lee o menciona comparte_niveles_con_ingeco`);
  }

  if (/nivel\s*<=\s*3/.test(source)) {
    fail(`${relative} todavía contiene el literal nivel <= 3`);
  }

  if (!source.includes("commonTrunkLevels")) {
    fail(`${relative} no consume commonTrunkLevels desde la capa canónica`);
  }
}

console.log("✓ esquema cerrado de malla_canon.json");
console.log(`✓ ${rawAreas.size} valores raw de area tienen mapeo`);
console.log("✓ ECONOMIA / ECONOMÍA comparten canon");
console.log("✓ FIN / FINANZAS comparten canon");
console.log("✓ 3 grupos paralelos coinciden con malla.json");
console.log("✓ official_equivalence = UNKNOWN en los 3 grupos");
console.log("✓ conteo de avance declarado PRODUCT_HEURISTIC");
console.log("✓ tronco común [1,2,3] y planes verificados coinciden con REV-B");
console.log("✓ campo histórico [1,2] preservado sin lectores");
console.log("✓ vistas consumen commonTrunkLevels sin literal <= 3");
console.log("MALLA_CANON_TEST=PASS");

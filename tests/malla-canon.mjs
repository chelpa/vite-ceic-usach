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

console.log("✓ esquema cerrado de malla_canon.json");
console.log(`✓ ${rawAreas.size} valores raw de area tienen mapeo`);
console.log("✓ ECONOMIA / ECONOMÍA comparten canon");
console.log("✓ FIN / FINANZAS comparten canon");
console.log("MALLA_CANON_TEST=PASS");

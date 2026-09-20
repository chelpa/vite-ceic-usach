import mallaCanon from "../../data/malla_canon.json";

export function canonicalArea(rawArea) {
  const raw = typeof rawArea === "string" ? rawArea.trim() : "";
  const entry = mallaCanon.areas[raw];

  if (!entry) {
    throw new Error(`Área sin mapeo canónico: ${JSON.stringify(rawArea)}`);
  }

  return entry;
}

export function canonicalAreaKey(rawArea) {
  return canonicalArea(rawArea).canon;
}

export function canonicalAreaLabel(rawArea) {
  return canonicalArea(rawArea).label;
}

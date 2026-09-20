import mallaCanon from "../../data/malla_canon.json";

const parallelGroups = mallaCanon.parallel_same_name_groups || [];

const parallelGroupByCode = new Map(
  parallelGroups.flatMap((group) =>
    group.codigos.map((codigo) => [codigo, group]),
  ),
);

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

export function parallelSameNameGroupForCode(codigo) {
  return parallelGroupByCode.get(codigo) || null;
}

export function progressUnitCode(codigo) {
  return parallelSameNameGroupForCode(codigo)?.codigo_presentacion || codigo;
}

export function progressUnitCodes(codigos) {
  return [...new Set(codigos.map(progressUnitCode))];
}

export function progressCodeIsDone(avance, codigo) {
  const group = parallelSameNameGroupForCode(codigo);

  if (!group) {
    return !!avance[codigo];
  }

  return group.codigos.some((member) => !!avance[member]);
}

export function normalizeParallelProgress(avance) {
  const normalized = { ...avance };

  for (const group of parallelGroups) {
    const done = group.codigos.some((codigo) => !!avance[codigo]);

    for (const codigo of group.codigos) {
      normalized[codigo] = done;
    }
  }

  return normalized;
}

export function presentationRamos(ramos) {
  return ramos.filter((ramo) => {
    const group = parallelSameNameGroupForCode(ramo.codigo);

    return !group || ramo.codigo === group.codigo_presentacion;
  });
}

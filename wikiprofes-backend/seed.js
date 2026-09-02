// Importa la data curada actual de WikiProfes a la base del sistema de votos,
// como "baseline" (histórico/estimado). Los votos nuevos son 100%
// independientes de esto — el baseline solo sirve de fallback mientras un
// profesor no acumula votos reales (ver profesores_con_rating en schema.sql).
//
// Fuente: src/data/wikiprofes.json del sitio Vite (no el wikiprofes.html
// standalone que Francisco compartió junto al backend). Ese HTML es un
// snapshot más antiguo del mismo webscraping — con slug/ramos en null para
// los 78 profes "solo Canva" — y usarlo como fuente haría convivir dos
// copias de la misma data que se desincronizan con el tiempo. wikiprofes.json
// es la fuente única real: la que ya consume la página /wikiprofes en vivo.
const fs = require('fs');
const path = require('path');
const db = require('./db');

const SOURCE_JSON = process.argv[2] || path.join(__dirname, '..', 'src', 'data', 'wikiprofes.json');

function slugify(nombre) {
  return nombre
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// wikiprofes.json trae { slug, nombre, ramos: [], calificacion, actualizado,
// resenas: [{texto, estrellas, fuente}], origen, estimado }. No hay num_resenas
// ni cita como campos propios: son resenas.length y resenas[0].texto — el
// mismo criterio que ya usa WikiProfes.jsx para no inventar un campo nuevo.
function normalizeRow(p) {
  const resenas = p.resenas || [];
  return {
    slug: p.slug || null, // null en los profes "solo Canva" (sin ficha oficial) — se les genera uno abajo
    nombre: p.nombre,
    ramos: (p.ramos || []).join(' · ') || null,
    actualizado: p.actualizado || null,
    origen: p.origen || null,
    calificacion: p.calificacion ?? null,
    num_resenas: resenas.length,
    estimado: !!p.estimado,
    cita: resenas[0]?.texto || null,
    comentarios: resenas.map((r) => r.texto).filter(Boolean),
  };
}

function run() {
  const raw = JSON.parse(fs.readFileSync(SOURCE_JSON, 'utf8'));
  const data = raw.map(normalizeRow);

  const insertProf = db.prepare(`
    INSERT INTO profesores (slug, nombre, ramos, actualizado, origen, baseline_calificacion, baseline_num_resenas, baseline_estimado, baseline_cita)
    VALUES (@slug, @nombre, @ramos, @actualizado, @origen, @baseline_calificacion, @baseline_num_resenas, @baseline_estimado, @baseline_cita)
  `);
  const insertComentario = db.prepare(`
    INSERT INTO comentarios_historicos (profesor_id, texto) VALUES (?, ?)
  `);

  const seen = new Set();
  const tx = db.transaction((rows) => {
    db.exec('DELETE FROM comentarios_historicos; DELETE FROM votos; DELETE FROM reportes; DELETE FROM profesores;');
    for (const p of rows) {
      let slug = p.slug || slugify(p.nombre);
      while (seen.has(slug)) slug = slug + '-2'; // duplicate-name guard
      seen.add(slug);

      const info = insertProf.run({
        slug,
        nombre: p.nombre,
        ramos: p.ramos || null,
        actualizado: p.actualizado || null,
        origen: p.origen || null,
        baseline_calificacion: p.calificacion ?? null,
        baseline_num_resenas: p.num_resenas || 0,
        baseline_estimado: p.estimado ? 1 : 0,
        baseline_cita: p.cita || null,
      });
      const profesorId = info.lastInsertRowid;
      for (const texto of (p.comentarios || [])) {
        insertComentario.run(profesorId, texto);
      }
    }
  });

  tx(data);
  console.log(`Importados ${data.length} profesores desde ${SOURCE_JSON}`);
}

run();

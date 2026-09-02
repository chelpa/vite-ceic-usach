// Prototipo local del backend de votos de WikiProfes.
//
// Esto es un PROTOTIPO EJECUTABLE para validar el diseño (modelo de datos +
// API + reglas de negocio) antes de comprometerse a un proveedor de hosting
// (decisión ya tomada: Supabase — ver README).
//
// Política de moderación (decidida): las ESTRELLAS cuentan al tiro en el
// promedio en vivo — nadie espera para ver la nota subir. El TEXTO del
// comentario, en cambio, queda oculto (comentario_moderado = 0) hasta que
// alguien del CEIC lo aprueba vía /api/moderacion — porque es texto sobre
// una persona real con nombre y apellido, y ahí sí vale la pena la demora.
//
// Lo que NO es real todavía, a propósito:
//   - Auth: se usa el email tal cual como identidad (nadie lo verifica). En
//     producción esto lo reemplaza el magic-link/OTP de Supabase Auth, que
//     sí confirma que el dueño del email lo escribió (y de paso permite
//     restringir el dominio a nivel de Auth, no solo de validación manual).
//
// El modelo de datos (schema.sql) sí es el real: migrar esto a Supabase es
// básicamente correr schema.sql allá y apuntar el frontend al cliente de
// Supabase en vez de a este server.

const express = require('express');
const cors = require('cors');
const db = require('./db');

const PORT = process.env.PORT || 3001;
const ALLOWED_EMAIL_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'usach.cl';

const app = express();
app.use(cors());
app.use(express.json());

function isValidStudentEmail(email) {
  if (typeof email !== 'string') return false;
  const m = email.trim().toLowerCase().match(/^[^\s@]+@([^\s@]+)$/);
  if (!m) return false;
  return m[1] === ALLOWED_EMAIL_DOMAIN || m[1].endsWith('.' + ALLOWED_EMAIL_DOMAIN);
}

// query reutilizada: profesor + su rating "actual" (votos en vivo, o baseline si aún no tiene)
const PROF_WITH_RATING_SQL = `
  SELECT
    p.*,
    COALESCE(v.num_votos, 0) AS votos_en_vivo,
    COALESCE(v.promedio, p.baseline_calificacion) AS calificacion_actual,
    COALESCE(v.num_votos, p.baseline_num_resenas) AS num_resenas_actual,
    (v.num_votos IS NOT NULL AND v.num_votos > 0) AS tiene_votos_en_vivo
  FROM profesores p
  LEFT JOIN (
    SELECT profesor_id, COUNT(*) AS num_votos, ROUND(AVG(estrellas), 1) AS promedio
    FROM votos WHERE estado = 'publicado'
    GROUP BY profesor_id
  ) v ON v.profesor_id = p.id
`;

app.get('/api/health', (req, res) => {
  res.json({ ok: true, allowedEmailDomain: ALLOWED_EMAIL_DOMAIN });
});

app.get('/api/profesores', (req, res) => {
  const rows = db.prepare(PROF_WITH_RATING_SQL + ' ORDER BY p.nombre COLLATE NOCASE').all();
  res.json(rows.map(formatProfesor));
});

app.get('/api/profesores/:idOrSlug', (req, res) => {
  const key = req.params.idOrSlug;
  const row = db.prepare(PROF_WITH_RATING_SQL + ' WHERE p.id = ? OR p.slug = ?').get(key, key);
  if (!row) return res.status(404).json({ error: 'profesor no encontrado' });

  const comentariosHistoricos = db
    .prepare('SELECT texto FROM comentarios_historicos WHERE profesor_id = ?')
    .all(row.id)
    .map((r) => r.texto);

  const votos = db
    .prepare(`SELECT id, estrellas, comentario, comentario_moderado, created_at, updated_at
              FROM votos WHERE profesor_id = ? AND estado = 'publicado'
              ORDER BY updated_at DESC`)
    .all(row.id)
    // el voto (estrellas) es público apenas se emite; el texto solo si ya pasó moderación
    .map((v) => ({
      id: v.id,
      estrellas: v.estrellas,
      comentario: v.comentario_moderado ? v.comentario : null,
      comentario_pendiente: !!(v.comentario && !v.comentario_moderado),
      created_at: v.created_at,
      updated_at: v.updated_at,
    }));

  res.json({ ...formatProfesor(row), comentarios_historicos: comentariosHistoricos, votos });
});

// votar (o re-votar: mismo email + profesor = UPDATE, no una fila nueva)
app.post('/api/profesores/:idOrSlug/votos', (req, res) => {
  const key = req.params.idOrSlug;
  const profesor = db.prepare('SELECT id FROM profesores WHERE id = ? OR slug = ?').get(key, key);
  if (!profesor) return res.status(404).json({ error: 'profesor no encontrado' });

  const { estudiante_email, estrellas, comentario } = req.body || {};

  if (!isValidStudentEmail(estudiante_email)) {
    return res.status(400).json({ error: `el correo debe ser de dominio @${ALLOWED_EMAIL_DOMAIN}` });
  }
  const estrellasNum = Number(estrellas);
  if (!Number.isInteger(estrellasNum) || estrellasNum < 1 || estrellasNum > 5) {
    return res.status(400).json({ error: 'estrellas debe ser un entero entre 1 y 5' });
  }
  const comentarioTrim = typeof comentario === 'string' ? comentario.trim().slice(0, 1000) : null;
  // sin texto no hay nada que moderar; con texto (nuevo o editado) vuelve a quedar pendiente
  const comentarioModerado = comentarioTrim ? 0 : 1;

  const upsert = db.prepare(`
    INSERT INTO votos (profesor_id, estudiante_email, estrellas, comentario, comentario_moderado, updated_at)
    VALUES (@profesor_id, @email, @estrellas, @comentario, @comentario_moderado, CURRENT_TIMESTAMP)
    ON CONFLICT(profesor_id, estudiante_email) DO UPDATE SET
      estrellas = excluded.estrellas,
      comentario = excluded.comentario,
      comentario_moderado = excluded.comentario_moderado,
      estado = 'publicado',
      updated_at = CURRENT_TIMESTAMP
  `);
  const info = upsert.run({
    profesor_id: profesor.id,
    email: estudiante_email.trim().toLowerCase(),
    estrellas: estrellasNum,
    comentario: comentarioTrim,
    comentario_moderado: comentarioModerado,
  });

  const updated = db.prepare(PROF_WITH_RATING_SQL + ' WHERE p.id = ?').get(profesor.id);
  res.status(201).json({
    ...formatProfesor(updated),
    comentario_pendiente_moderacion: comentarioModerado === 0,
  });
});

// reportar un voto (moderación reactiva, la ejercen los propios estudiantes/profes)
app.post('/api/votos/:id/reportar', (req, res) => {
  const voto = db.prepare('SELECT id FROM votos WHERE id = ?').get(req.params.id);
  if (!voto) return res.status(404).json({ error: 'voto no encontrado' });
  const motivo = typeof req.body?.motivo === 'string' ? req.body.motivo.slice(0, 300) : null;
  db.prepare('INSERT INTO reportes (voto_id, motivo) VALUES (?, ?)').run(voto.id, motivo);
  db.prepare("UPDATE votos SET estado = 'reportado' WHERE id = ?").run(voto.id);
  res.json({ ok: true });
});

// ---- cola de moderación (la ejerce el CEIC) ----
// Nota: esto no tiene auth propia todavía — en el prototipo local cualquiera
// que sepa la URL puede llamarla. En Supabase esto se resuelve con una
// policy de RLS que solo deja pasar a un rol "admin" (ver README).

app.get('/api/moderacion/pendientes', (req, res) => {
  const rows = db.prepare(`
    SELECT v.id, v.estrellas, v.comentario, v.estudiante_email, v.created_at,
           p.nombre AS profesor_nombre, p.slug AS profesor_slug
    FROM votos v
    JOIN profesores p ON p.id = v.profesor_id
    WHERE v.comentario IS NOT NULL AND v.comentario_moderado = 0 AND v.estado = 'publicado'
    ORDER BY v.created_at ASC
  `).all();
  res.json(rows);
});

app.post('/api/votos/:id/aprobar', (req, res) => {
  const voto = db.prepare('SELECT id FROM votos WHERE id = ?').get(req.params.id);
  if (!voto) return res.status(404).json({ error: 'voto no encontrado' });
  db.prepare('UPDATE votos SET comentario_moderado = 1 WHERE id = ?').run(voto.id);
  res.json({ ok: true });
});

// rechaza solo el TEXTO (el voto en estrellas se mantiene y sigue contando)
app.post('/api/votos/:id/rechazar', (req, res) => {
  const voto = db.prepare('SELECT id FROM votos WHERE id = ?').get(req.params.id);
  if (!voto) return res.status(404).json({ error: 'voto no encontrado' });
  db.prepare("UPDATE votos SET comentario = NULL, comentario_moderado = 1 WHERE id = ?").run(voto.id);
  res.json({ ok: true });
});

function formatProfesor(row) {
  return {
    id: row.id,
    slug: row.slug,
    nombre: row.nombre,
    ramos: row.ramos,
    actualizado: row.actualizado,
    origen: row.origen,
    calificacion: row.calificacion_actual,
    num_resenas: row.num_resenas_actual,
    votos_en_vivo: row.votos_en_vivo,
    tiene_votos_en_vivo: !!row.tiene_votos_en_vivo,
    estimado: !row.tiene_votos_en_vivo && !!row.baseline_estimado,
    cita: row.baseline_cita,
  };
}

app.listen(PORT, () => {
  console.log(`WikiProfes API (prototipo) escuchando en http://localhost:${PORT}`);
  console.log(`Dominio de correo permitido para votar: @${ALLOWED_EMAIL_DOMAIN}`);
});

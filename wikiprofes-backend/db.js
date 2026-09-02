// Equivalente SQLite del schema.sql (Postgres/Supabase). Mismo modelo de
// datos, sintaxis adaptada para correr localmente sin infraestructura.
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.WIKIPROFES_DB || path.join(__dirname, 'wikiprofes.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS profesores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE,
    nombre TEXT NOT NULL,
    ramos TEXT,
    actualizado TEXT,
    origen TEXT,
    baseline_calificacion REAL,
    baseline_num_resenas INTEGER DEFAULT 0,
    baseline_estimado INTEGER DEFAULT 0,
    baseline_cita TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS comentarios_historicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profesor_id INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
    texto TEXT NOT NULL
  );

  -- estado: gobierna si el VOTO (las estrellas) cuenta en el promedio en vivo.
  -- comentario_moderado: gobierna si el TEXTO se muestra públicamente. Van
  -- separados a propósito: las estrellas cuentan al tiro (nadie se demora en
  -- ver el promedio subir), pero el texto sobre una persona real con nombre y
  -- apellido no se muestra hasta que alguien del CEIC lo aprueba.
  CREATE TABLE IF NOT EXISTS votos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profesor_id INTEGER NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
    estudiante_email TEXT NOT NULL,
    estrellas INTEGER NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
    comentario TEXT,
    comentario_moderado INTEGER NOT NULL DEFAULT 0 CHECK (comentario_moderado IN (0,1)),
    estado TEXT NOT NULL DEFAULT 'publicado' CHECK (estado IN ('publicado','oculto','reportado')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (profesor_id, estudiante_email)
  );

  CREATE TABLE IF NOT EXISTS reportes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voto_id INTEGER NOT NULL REFERENCES votos(id) ON DELETE CASCADE,
    motivo TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_votos_profesor ON votos(profesor_id);
  CREATE INDEX IF NOT EXISTS idx_votos_moderacion ON votos(comentario_moderado);
  CREATE INDEX IF NOT EXISTS idx_comentarios_profesor ON comentarios_historicos(profesor_id);
`);

module.exports = db;

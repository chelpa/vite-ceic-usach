-- WikiProfes — esquema del sistema de votos
-- Escrito en sintaxis Postgres (el prototipo local usa el equivalente en SQLite,
-- ver db.js) porque el destino recomendado es Supabase. Migrar de aquí a
-- Supabase es prácticamente copiar/pegar este archivo.

create table profesores (
  id                    bigint generated always as identity primary key,
  slug                  text unique,
  nombre                text not null,
  ramos                 text,                 -- string "Ramo A · Ramo B", igual al formato actual
  actualizado           text,
  origen                text check (origen in ('canva','sitio','ambos')),
  -- snapshot de los datos históricos/estimados que ya teníamos (auditoría + fallback,
  -- ver nota "estrategia de transición" en el server): no se actualiza con los votos nuevos.
  baseline_calificacion numeric(2,1),
  baseline_num_resenas  integer default 0,
  baseline_estimado     boolean default false,
  baseline_cita         text,
  created_at            timestamptz default now()
);

-- Los comentarios de Canva ya recopilados: quedan de solo lectura, separados
-- de los votos en vivo para no mezclar "histórico" con "en vivo".
create table comentarios_historicos (
  id           bigint generated always as identity primary key,
  profesor_id  bigint not null references profesores(id) on delete cascade,
  texto        text not null
);

-- EL SISTEMA DE VOTOS REAL. Un estudiante autenticado vota 1-5 estrellas +
-- comentario opcional. Revotar = UPDATE, no una fila nueva (constraint UNIQUE).
--
-- estado vs. comentario_moderado — a propósito son cosas distintas:
--   estado:              gobierna si el VOTO (las estrellas) cuenta en el promedio en vivo.
--   comentario_moderado: gobierna si el TEXTO se muestra públicamente.
-- Las estrellas cuentan al tiro; el texto sobre una persona real con nombre y
-- apellido espera aprobación del CEIC (política decidida — ver /api/moderacion en el server).
create table votos (
  id                    bigint generated always as identity primary key,
  profesor_id           bigint not null references profesores(id) on delete cascade,
  -- en Supabase esto sería estudiante_id uuid references auth.users(id);
  -- el prototipo local usa el email directo como stand-in de la identidad.
  estudiante_email      text not null,
  estrellas             smallint not null check (estrellas between 1 and 5),
  comentario            text,
  comentario_moderado   boolean not null default false,
  estado                text not null default 'publicado' check (estado in ('publicado','oculto','reportado')),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  unique (profesor_id, estudiante_email)
);

create table reportes (
  id          bigint generated always as identity primary key,
  voto_id     bigint not null references votos(id) on delete cascade,
  motivo      text,
  created_at  timestamptz default now()
);

-- Vista de lectura: esto es lo que reemplaza al JSON horneado en el build.
-- Antes de que un profesor tenga votos en vivo, cae al baseline (histórico/estimado)
-- para no perder toda la data existente el día 1 del sistema nuevo.
create view profesores_con_rating as
select
  p.*,
  coalesce(v.num_votos, 0)                        as votos_en_vivo,
  coalesce(v.promedio, p.baseline_calificacion)    as calificacion_actual,
  coalesce(v.num_votos, p.baseline_num_resenas)    as num_resenas_actual,
  (v.num_votos is not null and v.num_votos > 0)    as tiene_votos_en_vivo
from profesores p
left join (
  select profesor_id, count(*) as num_votos, round(avg(estrellas)::numeric, 1) as promedio
  from votos
  where estado = 'publicado'
  group by profesor_id
) v on v.profesor_id = p.id;

-- RLS (Supabase): solo el dueño del voto puede insertar/editar el suyo, con su email.
-- alter table votos enable row level security;
-- create policy "un voto por estudiante usach" on votos
--   for insert with check (auth.email() = estudiante_email and auth.email() like '%@usach.cl');
-- create policy "editar solo tu propio voto" on votos
--   for update using (auth.email() = estudiante_email);
-- create policy "el texto pendiente no es visible para nadie mas que su autor" on votos
--   for select using (comentario_moderado = true or auth.email() = estudiante_email or auth.role() = 'admin');

-- Cola de moderación (CEIC): comentarios con texto que todavía no se aprueban.
create view comentarios_pendientes as
select v.id, v.estrellas, v.comentario, v.estudiante_email, v.created_at,
       p.nombre as profesor_nombre, p.slug as profesor_slug
from votos v
join profesores p on p.id = v.profesor_id
where v.comentario is not null and v.comentario_moderado = false and v.estado = 'publicado'
order by v.created_at asc;

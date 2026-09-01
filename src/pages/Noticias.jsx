import { Megaphone } from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import noticiasRaw from "../data/noticias.json";

// El sitio real todavía dice "en construcción" en esta sección, y no tenemos
// ninguna noticia real redactada por la mesa todavía (tarea doc-5 de la
// bitácora) — así que esto es el componente de lista funcionando sobre un
// dataset vacío (src/data/noticias.json = []), listo para cargar noticias
// reales sin tocar el componente. Forma esperada de cada entrada:
// { titulo, fecha, autor, resumen, cuerpo, categoria }
// "fecha" en formato ISO (YYYY-MM-DD) para que el orden cronológico salga solo.

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

function NoticiaCard({ n }) {
  return (
    <article className="block-border bg-card p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {n.fecha ? <span className="font-semibold uppercase tracking-wide">{formatDate(n.fecha)}</span> : null}
        {n.categoria ? (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold uppercase text-secondary-foreground">
            {n.categoria}
          </span>
        ) : null}
      </div>
      <h2 className="mt-2 text-xl">{n.titulo}</h2>
      {n.autor ? <p className="mt-1 text-xs text-muted-foreground">Por {n.autor}</p> : null}
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{n.resumen || n.cuerpo}</p>
    </article>
  );
}

export default function Noticias() {
  const noticias = (noticiasRaw || [])
    .slice()
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  return (
    <PageShell wide>
      <PageIntro
        title="Noticias"
        subtitle="Novedades, avisos y comunicados del centro de estudiantes."
      />
      {noticias.length === 0 ? (
        <div className="mt-8 block-border flex flex-col items-center gap-3 bg-secondary p-10 text-center">
          <Megaphone className="h-8 w-8 text-primary" aria-hidden="true" />
          <h2 className="text-lg">Todavía no hay noticias publicadas</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            La lista ya funciona — falta que la mesa redacte los primeros avisos y comunicados.
            En cuanto haya texto real se agrega a{" "}
            <code className="font-mono text-xs">src/data/noticias.json</code> y esta pantalla
            deja de estar vacía sola, sin tocar el componente.
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {noticias.map((n, i) => (
            <NoticiaCard key={n.id || i} n={n} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

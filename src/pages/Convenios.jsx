import { ExternalLink, Percent, Tag } from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import conveniosRaw from "../data/convenios.json";

// El sitio real ya tiene esta página lista y bien escrita, solo que sin convenios
// todavía ("Aún no hay convenios publicados"). No inventamos ningún convenio — esto
// es la grilla de tarjetas funcionando sobre un dataset vacío
// (src/data/convenios.json = []), lista para cargar convenios reales sin tocar el
// componente. Forma esperada de cada entrada:
// { nombre, categoria, descripcion, descuento, vigencia, link }

function ConvenioCard({ c }) {
  return (
    <div className="block-border flex flex-col gap-2 bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg">{c.nombre}</h2>
        {c.descuento ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">
            <Percent className="h-3 w-3" aria-hidden="true" />
            {c.descuento}
          </span>
        ) : null}
      </div>
      {c.categoria ? (
        <span className="inline-flex w-fit items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
          <Tag className="h-3 w-3" aria-hidden="true" />
          {c.categoria}
        </span>
      ) : null}
      <p className="text-sm text-muted-foreground">{c.descripcion}</p>
      <div className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-3 text-xs text-muted-foreground">
        <span>{c.vigencia ? `Vigente hasta: ${c.vigencia}` : ""}</span>
        {c.link ? (
          <a
            href={c.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold text-primary"
          >
            Ver convenio <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function Convenios() {
  const convenios = conveniosRaw || [];
  return (
    <PageShell wide>
      <PageIntro
        title="Convenios"
        subtitle="Descuentos y alianzas gestionadas por el CEIC para la comunidad de Ingeniería Comercial."
      />
      {convenios.length === 0 ? (
        <p className="mt-8 border-l-4 border-primary pl-4 text-muted-foreground">
          Aún no hay convenios publicados. Estamos gestionando descuentos y alianzas para la
          comunidad estudiantil.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {convenios.map((c, i) => (
            <ConvenioCard key={i} c={c} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

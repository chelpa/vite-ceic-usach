import { ExternalLink } from "lucide-react";

/**
 * Tarjeta "Ver X": calcada del patrón real usado en Documentación, Apuntes,
 * Actas y Transparencia (icono + título + descripción + botón "Ver" o
 * "Próximamente"). variant="compact" imita a Documentación (fila delgada,
 * botón chico); variant="feature" imita a Apuntes/Actas/Transparencia
 * (bloque más grande, con CTA propio).
 */
export default function ResourceLink({ icon: Icon, title, description, href, cta, variant = "feature" }) {
  if (variant === "compact") {
    return (
      <div className="block-border flex items-center gap-4 bg-card p-5">
        <Icon className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
        <div className="flex-1">
          <h2 className="text-lg">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="block-border shrink-0 bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground"
          >
            {cta || "Ver"}
          </a>
        ) : (
          <span className="shrink-0 text-xs font-semibold uppercase text-muted-foreground">
            Próximamente
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="block-border bg-card p-6">
      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
      <h2 className="mt-4 text-xl">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block-border mt-4 inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm font-bold uppercase text-primary-foreground"
        >
          {cta || "Ver"}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : null}
    </div>
  );
}

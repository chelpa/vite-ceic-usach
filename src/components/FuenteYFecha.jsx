export default function FuenteYFecha({
  fuente,
  href,
  periodo,
  actualizado,
  nota,
  className = "",
}) {
  if (!fuente && !periodo && !actualizado && !nota) return null;

  return (
    <div
      className={
        "mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground " +
        className
      }
      aria-label="Fuente y vigencia del dato"
    >
      {fuente ? (
        <span>
          Fuente:{" "}
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline"
            >
              {fuente}
            </a>
          ) : (
            <strong className="font-semibold text-foreground">{fuente}</strong>
          )}
        </span>
      ) : null}

      {periodo ? (
        <span>
          Periodo: <strong className="font-semibold text-foreground">{periodo}</strong>
        </span>
      ) : null}

      {actualizado ? (
        <span>
          Actualizado:{" "}
          <strong className="font-semibold text-foreground">{actualizado}</strong>
        </span>
      ) : null}

      {nota ? <span>{nota}</span> : null}
    </div>
  );
}

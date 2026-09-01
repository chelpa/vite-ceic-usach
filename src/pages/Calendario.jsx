import { CalendarDays } from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import calendario from "../data/calendario.json";

export default function Calendario() {
  return (
    <PageShell>
      <PageIntro
        title="Calendario académico"
        subtitle="Fechas clave del segundo semestre 2026 para Ingeniería Comercial Diurno y Prosecución, recopiladas por el centro de estudiantes."
      />
      {calendario.map((seccion) => (
        <div className="mt-10" key={seccion.titulo}>
          <h2 className="border-b border-foreground pb-3 text-2xl">{seccion.titulo}</h2>
          <div className="mt-6 space-y-4">
            {seccion.eventos.map((ev, i) => (
              <div className="block-border flex gap-4 bg-card p-5" key={i}>
                <CalendarDays className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-accent">
                    {ev.fecha}
                  </p>
                  <h3 className="mt-1 text-lg">{ev.titulo}</h3>
                  {ev.nota ? (
                    <p className="mt-1 text-sm text-muted-foreground">{ev.nota}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </PageShell>
  );
}

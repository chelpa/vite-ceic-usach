import { useState } from "react";
import { MessageCircleQuestion, ScrollText, Send } from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import ResourceLink from "../components/ResourceLink";
import preguntasRaw from "../data/preguntas-transparencia.json";

// Foro de preguntas (tarea doc-2 de la bitácora): todavía no hay ni decisión
// de moderación (doc-1) ni backend para un foro público de verdad con hilos
// visibles para todos. En vez de simular un foro que en realidad no le llega
// a nadie, esto es lo que sí funciona hoy sin backend: un formulario que arma
// un correo real a ceic@usach.cl (mailto:, se abre en el cliente de correo
// de quien pregunta, no queda nada guardado en ningún servidor), más la
// lista de preguntas ya respondidas — vacía por ahora
// (src/data/preguntas-transparencia.json = []), lista para cargar cuando la
// Secretaría de Finanzas conteste las primeras. Forma esperada de cada
// entrada: { pregunta, respuesta, fecha }.

function QuestionForm() {
  const [pregunta, setPregunta] = useState("");

  const mailtoHref =
    "mailto:ceic@usach.cl" +
    "?subject=" + encodeURIComponent("Pregunta sobre Transparencia — CEIC") +
    "&body=" + encodeURIComponent(pregunta);

  return (
    <div className="block-border bg-card p-6">
      <label className="block text-sm font-semibold" htmlFor="pregunta-transparencia">
        Escribe tu pregunta
      </label>
      <textarea
        id="pregunta-transparencia"
        value={pregunta}
        onChange={(e) => setPregunta(e.target.value)}
        rows={3}
        placeholder="¿En qué se usó tal fondo? ¿Cuándo se rinde tal actividad?"
        className="block-border mt-2 w-full bg-muted px-3 py-2 text-sm"
      />
      <a
        href={mailtoHref}
        className={
          "block-border mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase " +
          (pregunta.trim()
            ? "bg-primary text-primary-foreground"
            : "pointer-events-none bg-muted text-muted-foreground")
        }
        aria-disabled={!pregunta.trim()}
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        Enviar a Finanzas por correo
      </a>
      <p className="mt-3 text-xs text-muted-foreground">
        Por ahora esto abre un correo ya redactado a <strong>ceic@usach.cl</strong> en tu
        aplicación de correo — todavía no hay un foro público con hilos visibles para todos
        (eso necesita que primero se defina cómo se modera, y un lugar donde guardar las
        preguntas). En cuanto la Secretaría empiece a contestar, las respuestas se van a
        publicar acá abajo.
      </p>
    </div>
  );
}

export default function Transparencia() {
  const preguntas = preguntasRaw || [];
  return (
    <PageShell wide>
      <PageIntro
        title="Transparencia"
        subtitle="Rendición de cuentas y uso de los fondos del centro de estudiantes."
      />
      <div className="mt-8">
        <ResourceLink
          icon={ScrollText}
          title="Rendiciones y presupuesto"
          description="El detalle de ingresos y gastos se publica en una carpeta compartida de Google Drive."
          href="https://drive.google.com/drive/folders/1DKCwYYmt8MrW3QLfFGIXA5DhLa2fkJSu?usp=drive_link"
          cta="Ver rendiciones"
        />
      </div>

      <h2 className="mt-14 border-b border-foreground pb-3 text-2xl">Preguntas y respuestas</h2>
      <p className="mt-3 max-w-xl text-muted-foreground">
        ¿Tienes dudas sobre las finanzas del CEIC? Escríbele directo a la Secretaría de
        Finanzas y Bienestar, y revisa acá las preguntas que ya se respondieron públicamente.
      </p>

      {preguntas.length === 0 ? (
        <div className="mt-6 block-border flex flex-col items-center gap-3 bg-secondary p-8 text-center">
          <MessageCircleQuestion className="h-7 w-7 text-primary" aria-hidden="true" />
          <p className="max-w-md text-sm text-muted-foreground">
            Todavía no hay preguntas respondidas públicamente. En cuanto la Secretaría
            conteste las primeras, se agregan a{" "}
            <code className="font-mono text-xs">src/data/preguntas-transparencia.json</code> y
            aparecen acá solas.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {preguntas.map((p, i) => (
            <div className="block-border bg-card p-5" key={i}>
              <p className="text-sm font-semibold">{p.pregunta}</p>
              <p className="mt-2 text-sm text-muted-foreground">{p.respuesta}</p>
              {p.fecha ? (
                <p className="mt-2 text-xs text-muted-foreground">{p.fecha}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <QuestionForm />
      </div>
    </PageShell>
  );
}

import { ScrollText } from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import ResourceLink from "../components/ResourceLink";
import UnderConstruction from "../components/UnderConstruction";

export default function Transparencia() {
  return (
    <PageShell>
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

      <h2 className="mt-14 border-b border-foreground pb-3 text-2xl">Foro de preguntas</h2>
      <p className="mt-3 max-w-xl text-muted-foreground">
        ¿Tienes dudas sobre las finanzas del CEIC? Pronto vas a poder dejarlas aquí para que
        la Secretaría de Finanzas y Bienestar las responda públicamente.
      </p>
      <div className="mt-6">
        <UnderConstruction title="En construcción">
          Estamos habilitando el foro de preguntas. Pronto vas a poder enviar tus dudas sobre
          las finanzas del CEIC directamente aquí.
        </UnderConstruction>
      </div>
    </PageShell>
  );
}

import { FileText } from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import ResourceLink from "../components/ResourceLink";

export default function Documentacion() {
  return (
    <PageShell>
      <PageIntro
        title="Documentación"
        subtitle="Estatuto, instructivos y documentos oficiales de la carrera."
      />
      <div className="mt-8 space-y-4">
        <ResourceLink
          variant="compact"
          icon={FileText}
          title="Estatuto CEIC Ingeniería Comercial"
          description="Marco regulatorio vigente del estamento estudiantil de la carrera."
          href="https://ceicusach.cl/documentos/estatuto-ceic.pdf"
          cta="Ver"
        />
        <ResourceLink
          variant="compact"
          icon={FileText}
          title="Instructivo de toma de ramos"
          description="Guía paso a paso para la inscripción de asignaturas cada semestre."
        />
      </div>
    </PageShell>
  );
}

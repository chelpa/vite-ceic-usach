import { Briefcase } from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import UnderConstruction from "../components/UnderConstruction";

export default function WikiEmpresas() {
  return (
    <PageShell>
      <PageIntro
        title="WikiEmpresas"
        subtitle="La versión de WikiProfes para prácticas y primeros empleos: reseñas de empresas hechas por estudiantes que ya trabajaron o hicieron práctica en ellas."
      />
      <div className="mt-8">
        <UnderConstruction icon={Briefcase}>
          Estamos preparando WikiEmpresas. Pronto subiremos el listado de empresas y las
          reseñas de estudiantes.
        </UnderConstruction>
      </div>
    </PageShell>
  );
}

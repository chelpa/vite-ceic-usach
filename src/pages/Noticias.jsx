import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import UnderConstruction from "../components/UnderConstruction";

export default function Noticias() {
  return (
    <PageShell>
      <PageIntro
        title="Noticias"
        subtitle="Novedades, avisos y comunicados del centro de estudiantes."
      />
      <div className="mt-8">
        <UnderConstruction>
          Estamos preparando la sección de noticias. Pronto vas a encontrar aquí las
          novedades y comunicados del CEIC.
        </UnderConstruction>
      </div>
    </PageShell>
  );
}

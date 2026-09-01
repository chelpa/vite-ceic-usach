import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import UnderConstruction from "../components/UnderConstruction";

export default function PreguntasFrecuentes() {
  return (
    <PageShell>
      <PageIntro
        title="Preguntas frecuentes"
        subtitle="Dudas comunes sobre WikiProfes y el resto de las secciones del sitio."
      />
      <div className="mt-8">
        <UnderConstruction>
          Estamos preparando las preguntas frecuentes del sitio. Pronto vas a encontrar aquí
          las dudas más comunes sobre WikiProfes y el CEIC.
        </UnderConstruction>
      </div>
    </PageShell>
  );
}

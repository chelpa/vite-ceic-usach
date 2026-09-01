import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";

export default function Convenios() {
  return (
    <PageShell>
      <PageIntro
        title="Convenios"
        subtitle="Descuentos y alianzas gestionadas por el CEIC para la comunidad de Ingeniería Comercial."
      />
      <p className="mt-8 border-l-4 border-primary pl-4 text-muted-foreground">
        Aún no hay convenios publicados. Estamos gestionando descuentos y alianzas para la
        comunidad estudiantil.
      </p>
    </PageShell>
  );
}

import { NotebookText } from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import ResourceLink from "../components/ResourceLink";

export default function Apuntes() {
  return (
    <PageShell>
      <PageIntro
        title="Central de apuntes"
        subtitle="Apuntes y resúmenes aportados por la comunidad estudiantil."
      />
      <div className="mt-8">
        <ResourceLink
          icon={NotebookText}
          title="Central de apuntes"
          description="Los apuntes se ordenan por ramo en una carpeta compartida de Google Drive."
          href="https://drive.google.com/drive/folders/0B3ZyoRXWzVGdfno5LVJBd2NZOEZxRHphOTd0ajA1Q2FGX3piSzNJeGZ4NjRMWC1lLUR6bjQ?resourcekey=0-Bld_0Xkx_Cs4VjToLgOa2w&usp=drive_link"
          cta="Ver apuntes"
        />
      </div>
    </PageShell>
  );
}

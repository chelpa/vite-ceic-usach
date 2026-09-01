import { FileText } from "lucide-react";
import PageShell from "../components/PageShell";
import PageIntro from "../components/PageIntro";
import ResourceLink from "../components/ResourceLink";

export default function Actas() {
  return (
    <PageShell>
      <PageIntro
        title="Actas"
        subtitle="Registro de lo conversado y decidido en cada asamblea abierta."
      />
      <div className="mt-8">
        <ResourceLink
          icon={FileText}
          title="Actas de asambleas"
          description="Todas las actas se guardan en una carpeta compartida de Google Drive."
          href="https://drive.google.com/drive/folders/1EqMxh7uVbhRsFbi1kbid5TC8gzn4T7Aw?usp=drive_link"
          cta="Ver actas"
        />
      </div>
    </PageShell>
  );
}

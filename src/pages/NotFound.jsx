import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <h1 className="text-4xl">Página no encontrada</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Esta ruta no existe en el prototipo (o todavía no la construimos).
      </p>
      <Link
        to="/"
        className="block-border mt-6 inline-flex bg-primary px-5 py-3 text-sm font-bold uppercase text-primary-foreground"
      >
        Volver al inicio
      </Link>
    </PageShell>
  );
}

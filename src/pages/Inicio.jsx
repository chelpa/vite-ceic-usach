import { ArrowRight, BookOpen, Users, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import { Instagram } from "../components/BrandIcons";

// Nota: el HTML guardado del sitio real trae un carrusel de 7 fotos del
// edificio FAE y una galería de 6 fotos de actividades, pero solo se
// guardó el documento (sin su carpeta "_files" con las imágenes). Mientras
// no tengamos esos archivos, el hero y la galería usan una textura de
// relleno con el mismo texto/alt real, para no inventar fotos que no son.
function PlaceholderPhoto({ alt, className = "" }) {
  return (
    <div
      className={
        "flex items-end bg-[repeating-linear-gradient(135deg,var(--color-ink),var(--color-ink)_10px,#123634_10px,#123634_20px)] p-3 " +
        className
      }
    >
      <span className="block-border bg-background/90 px-2 py-1 text-[11px] text-foreground">
        {alt} (foto pendiente)
      </span>
    </div>
  );
}

const CARDS = [
  {
    to: "/wikiprofes",
    icon: BookOpen,
    title: "WikiProfes",
    desc: "Fichas de profesores: ramos y reseñas de la comunidad.",
  },
  {
    to: "/nosotros",
    icon: Users,
    title: "Nosotros",
    desc: "Quiénes componen la mesa y cómo funcionan las comisiones.",
  },
  {
    to: "/programa",
    icon: ListChecks,
    title: "Programa",
    desc: "El avance de nuestros compromisos, con seguimiento público.",
  },
];

export default function Inicio() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pt-6">
        <div className="block-border-lg overflow-hidden">
          <div className="relative aspect-4/3 w-full overflow-hidden sm:aspect-16/7">
            <PlaceholderPhoto alt="Edificio FAE USACH" className="h-full w-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-foreground/5" />
            <div className="absolute inset-0 flex items-end">
              <div className="w-full p-6 sm:p-10">
                <span className="inline-block border border-background/50 bg-background/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-background backdrop-blur-sm">
                  Periodo 2026 – 2027
                </span>
                <h1 className="mt-4 text-4xl text-background sm:text-6xl">CEIC USACH</h1>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/wikiprofes"
                    className="block-border-lg inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-bold uppercase text-primary-foreground"
                  >
                    Abrir WikiProfes <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a
                    href="https://www.instagram.com/ceic.usach/?hl=es"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block-border-lg inline-flex items-center gap-2 bg-background px-5 py-3 text-sm font-bold uppercase text-foreground"
                  >
                    <Instagram className="h-4 w-4" aria-hidden="true" /> Contáctanos
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-5 sm:grid-cols-3">
          {CARDS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="block-border group bg-card p-6 transition-transform hover:-translate-y-1"
            >
              <c.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-xl">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold uppercase text-accent">
                Entrar <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="border-b border-foreground pb-3 text-2xl">Galería</h2>
        <div className="mt-6 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <PlaceholderPhoto
              key={n}
              alt={`Actividad ${n} del CEIC`}
              className="block-border aspect-4/3 w-full"
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="block-border-lg bg-ink p-8 text-ink-foreground">
          <h2 className="text-2xl">¿Con quién tomar el ramo?</h2>
          <p className="mt-2 max-w-xl text-sm opacity-80">
            WikiProfes reúne 202 fichas de profesores de Ingeniería Comercial, con reseñas,
            ramos y recomendaciones, todo con buscador.
          </p>
          <Link
            to="/wikiprofes"
            className="mt-6 inline-flex items-center gap-2 border border-ink-foreground bg-primary px-5 py-3 text-sm font-bold uppercase text-primary-foreground"
          >
            Buscar un profe <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}

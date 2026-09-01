import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, NotebookPen } from "lucide-react";
import { Instagram, Linkedin } from "./BrandIcons";
import { COMUNIDAD_LINKS, EL_CEIC_LINKS, FOOTER_SECCIONES, TOP_LINKS } from "../lib/nav";

function NavDropdown({ label, links }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();
  const isActive = links.some((l) => l.to === location.pathname);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={
          "flex items-center gap-1 px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary " +
          (isActive
            ? "text-foreground underline decoration-primary decoration-4 underline-offset-8"
            : "text-muted-foreground")
        }
      >
        {label}
        <ChevronDown
          className={"h-3.5 w-3.5 transition-transform " + (open ? "rotate-180" : "")}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div className="block-border absolute right-0 top-full mt-2 min-w-56 bg-card py-1 shadow-lg z-50">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block px-4 py-2 text-sm text-foreground hover:bg-secondary"
            >
              {l.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TopLink({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        "px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors hover:text-primary " +
        (isActive
          ? "text-foreground underline decoration-primary decoration-4 underline-offset-8"
          : "text-muted-foreground")
      }
    >
      {label}
    </NavLink>
  );
}

function MobileMenu({ open, onClose }) {
  if (!open) return null;
  const all = [...TOP_LINKS, ...COMUNIDAD_LINKS, ...EL_CEIC_LINKS];
  return (
    <div className="border-b border-border bg-card md:hidden">
      <nav className="mx-auto flex max-w-6xl flex-col px-5 py-3">
        {all.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              "border-b border-border py-3 text-sm font-semibold uppercase tracking-wide last:border-none " +
              (isActive ? "text-primary" : "text-foreground")
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary bg-card font-[family-name:var(--font-display)] font-bold text-primary">
            C
          </span>
          <span className="text-lg leading-none uppercase">
            <span className="block font-[family-name:var(--font-display)] font-bold text-primary">
              CEIC
            </span>
            <span className="block font-[family-name:var(--font-display)] font-bold text-accent">
              USACH
            </span>
          </span>
        </Link>

        <nav className="hidden items-center justify-end gap-x-1 md:flex">
          {TOP_LINKS.map((l) => (
            <TopLink key={l.to} to={l.to} label={l.label} />
          ))}
          <NavDropdown label="Comunidad" links={COMUNIDAD_LINKS} />
          <NavDropdown label="El CEIC" links={EL_CEIC_LINKS} />
        </nav>

        <button
          type="button"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMobileOpen((o) => !o)}
          className="block-border relative flex h-9 w-9 items-center justify-center bg-card md:hidden"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-foreground bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <h3 className="text-lg">CEIC USACH 2026 – 2027</h3>
          <p className="mt-2 text-sm opacity-80">
            Centro de Estudiantes de Ingeniería Comercial.
          </p>
        </div>
        <div>
          <h3 className="text-sm">Secciones</h3>
          <ul className="mt-3 space-y-1 text-sm opacity-80">
            {FOOTER_SECCIONES.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm">Contáctanos</h3>
          <p className="mt-3 text-sm opacity-80">ceic@usach.cl</p>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href="https://www.instagram.com/ceic.usach/?hl=es"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary"
            >
              <span className="block-border flex h-9 w-9 shrink-0 items-center justify-center bg-ink-foreground/10 transition-colors group-hover:bg-ink-foreground/20">
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </span>
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/in/ceic-usach-3b3675297"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary"
            >
              <span className="block-border flex h-9 w-9 shrink-0 items-center justify-center bg-ink-foreground/10 transition-colors group-hover:bg-ink-foreground/20">
                <Linkedin className="h-4 w-4" aria-hidden="true" />
              </span>
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Franja pequeña, visualmente separada del sitio real, solo para este
 *  prototipo: da acceso a la Bitácora del proyecto sin fingir que es una
 *  sección pública real del sitio. */
function PrototypeStrip() {
  return (
    <div className="bg-foreground text-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-1.5 text-xs">
        <span className="opacity-70">Prototipo del sitio — no es ceicusach.cl</span>
        <Link
          to="/bitacora"
          className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide opacity-90 hover:opacity-100"
        >
          <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" />
          Bitácora del proyecto
        </Link>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PrototypeStrip />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

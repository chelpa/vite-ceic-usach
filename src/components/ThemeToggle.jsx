import { useEffect, useState } from "react";

// Los mismos dos botones de buscacursos.cl (la herramienta de Francisco):
// sol/luna para claro↔oscuro, y el lazo 🎀 para "modo amigable" (paleta
// rosa/crema, independiente del ciclo claro/oscuro — se puede prender desde
// cualquiera de los dos y al apagarlo vuelve al que tenías antes). La lógica
// es un port directo de la de buscacursos.cl, con sus propias claves de
// localStorage para no pisar las de ese sitio si alguna vez se abren en el
// mismo navegador.
const THEME_KEY = "ceic-theme";
const AMIGABLE_KEY = "ceic-amigable";

function systemPrefersDark() {
  return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function savedBase() {
  let t = null;
  try {
    t = localStorage.getItem(THEME_KEY);
  } catch {
    /* localStorage no disponible */
  }
  if (t === "dark" || t === "light") return t;
  return systemPrefersDark() ? "dark" : "light";
}

function isAmigable() {
  return document.documentElement.getAttribute("data-theme") === "amigable";
}

function effectiveTheme() {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark" || attr === "light") return attr;
  if (attr === "amigable") return savedBase();
  return systemPrefersDark() ? "dark" : "light";
}

const ICON_SUN = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const ICON_MOON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function ThemeToggle() {
  // Se lee del DOM (ya aplicado antes del primer paint, ver index.html) en
  // vez de recalcular de cero, así el ícono no "salta" al montar.
  const [dark, setDark] = useState(() => (typeof document !== "undefined" ? effectiveTheme() === "dark" : false));
  const [amigable, setAmigable] = useState(() => (typeof document !== "undefined" ? isAmigable() : false));

  useEffect(() => {
    // Por si el sistema operativo cambia de tema mientras la pestaña está
    // abierta y todavía no hay preferencia guardada (mismo criterio que
    // buscacursos.cl).
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      let saved = null;
      try {
        saved = localStorage.getItem(THEME_KEY);
      } catch {
        /* localStorage no disponible */
      }
      if (!saved && !isAmigable()) {
        const next = systemPrefersDark() ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        setDark(next === "dark");
      }
    }
    mq?.addEventListener?.("change", onChange);
    return () => mq?.removeEventListener?.("change", onChange);
  }, []);

  function toggleThemeButton() {
    // Como en buscacursos.cl: tocar el sol/luna siempre sale del modo
    // amigable y deja un claro/oscuro concreto elegido.
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
      localStorage.setItem(AMIGABLE_KEY, "off");
    } catch {
      /* localStorage no disponible */
    }
    setDark(next === "dark");
    setAmigable(false);
  }

  function toggleAmigable() {
    if (isAmigable()) {
      const base = savedBase();
      document.documentElement.setAttribute("data-theme", base);
      try {
        localStorage.setItem(AMIGABLE_KEY, "off");
      } catch {
        /* localStorage no disponible */
      }
      setAmigable(false);
      setDark(base === "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "amigable");
      try {
        localStorage.setItem(AMIGABLE_KEY, "on");
      } catch {
        /* localStorage no disponible */
      }
      setAmigable(true);
    }
  }

  const themeLabel = dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  const amigableLabel = amigable ? "Desactivar modo amigable" : "Activar modo amigable";

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={toggleThemeButton}
        title={themeLabel}
        aria-label={themeLabel}
        className="block-border flex h-9 w-9 items-center justify-center bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        {dark ? ICON_MOON : ICON_SUN}
      </button>
      <button
        type="button"
        onClick={toggleAmigable}
        title={amigableLabel}
        aria-label={amigableLabel}
        aria-pressed={amigable}
        className={
          "block-border flex h-9 w-9 items-center justify-center text-base leading-none transition-colors " +
          (amigable ? "border-accent bg-accent text-accent-foreground" : "bg-card hover:border-accent")
        }
      >
        🎀
      </button>
    </div>
  );
}

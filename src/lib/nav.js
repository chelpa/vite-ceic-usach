// Mapa de navegación reconstruido a partir del HTML real guardado del sitio:
// para cada página descargada, revisamos qué botón del header queda con las
// clases de estado activo ("text-foreground underline decoration-primary
// decoration-4 underline-offset-8") y así reconstruimos qué entra bajo
// "Comunidad" y qué entra bajo "El CEIC". Ver bitácora, entradas c3/c4.

export const TOP_LINKS = [
  { to: "/", label: "Inicio" },
  { to: "/wikiprofes", label: "WikiProfes" },
  { to: "/apuntes", label: "Apuntes" },
];

export const COMUNIDAD_LINKS = [
  { to: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { to: "/wikiempresas", label: "WikiEmpresas" },
  { to: "/convenios", label: "Convenios" },
  { to: "/malla", label: "Malla interactiva" },
  { to: "/noticias", label: "Noticias" },
];

export const EL_CEIC_LINKS = [
  { to: "/documentacion", label: "Documentación" },
  { to: "/calendario", label: "Calendario académico" },
  { to: "/actas", label: "Actas" },
  { to: "/transparencia", label: "Transparencia" },
  { to: "/programa", label: "Conoce nuestro programa" },
  { to: "/nosotros", label: "Quiénes somos y directiva" },
];

export const FOOTER_SECCIONES = [
  { to: "/wikiprofes", label: "WikiProfes" },
  { to: "/apuntes", label: "Apuntes" },
  { to: "/wikiempresas", label: "WikiEmpresas" },
  { to: "/malla", label: "Malla Interactiva" },
  { to: "/noticias", label: "Noticias" },
  { to: "/convenios", label: "Convenios" },
  { to: "/preguntas-frecuentes", label: "FAQ" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/programa", label: "Programa" },
  { to: "/calendario", label: "Calendario" },
  { to: "/actas", label: "Actas" },
  { to: "/transparencia", label: "Transparencia" },
  { to: "/documentacion", label: "Documentación" },
];

import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";

const Inicio = lazy(() => import("./pages/Inicio"));
const WikiProfes = lazy(() => import("./pages/WikiProfes"));
const Apuntes = lazy(() => import("./pages/Apuntes"));
const PreguntasFrecuentes = lazy(() => import("./pages/PreguntasFrecuentes"));
const WikiEmpresas = lazy(() => import("./pages/WikiEmpresas"));
const Convenios = lazy(() => import("./pages/Convenios"));
const MallaInteractiva = lazy(() => import("./pages/MallaInteractiva"));
const MallaGridPreview = lazy(() => import("./pages/MallaGridPreview"));
const Noticias = lazy(() => import("./pages/Noticias"));
const Documentacion = lazy(() => import("./pages/Documentacion"));
const Calendario = lazy(() => import("./pages/Calendario"));
const Actas = lazy(() => import("./pages/Actas"));
const Transparencia = lazy(() => import("./pages/Transparencia"));
const Programa = lazy(() => import("./pages/Programa"));
const Nosotros = lazy(() => import("./pages/Nosotros"));
const Bitacora = lazy(() => import("./pages/Bitacora"));
const NotFound = lazy(() => import("./pages/NotFound"));

const SITE_TITLE = "CEIC USACH";

function PageMeta({ title, children }) {
  useEffect(() => {
    document.title = `${title} · ${SITE_TITLE}`;
  }, [title]);

  return children;
}

function lazyPage(Page, title) {
  return (
    <PageMeta title={title}>
      <Suspense fallback={<div className="min-h-[50vh]" aria-hidden="true" />}>
        <Page />
      </Suspense>
    </PageMeta>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={lazyPage(Inicio, "Inicio")} />
          <Route path="/wikiprofes" element={lazyPage(WikiProfes, "WikiProfes")} />
          <Route path="/apuntes" element={lazyPage(Apuntes, "Apuntes")} />

          <Route path="/preguntas-frecuentes" element={lazyPage(PreguntasFrecuentes, "Preguntas frecuentes")} />
          <Route path="/wikiempresas" element={lazyPage(WikiEmpresas, "WikiEmpresas")} />
          <Route path="/convenios" element={lazyPage(Convenios, "Convenios")} />
          <Route path="/malla" element={lazyPage(MallaInteractiva, "Malla interactiva")} />
          <Route path="/malla-preview" element={lazyPage(MallaGridPreview, "Malla — preview de grilla")} />
          <Route path="/noticias" element={lazyPage(Noticias, "Noticias")} />

          <Route path="/documentacion" element={lazyPage(Documentacion, "Documentación")} />
          <Route path="/calendario" element={lazyPage(Calendario, "Calendario")} />
          <Route path="/actas" element={lazyPage(Actas, "Actas")} />
          <Route path="/transparencia" element={lazyPage(Transparencia, "Transparencia")} />
          <Route path="/programa" element={lazyPage(Programa, "Programa")} />
          <Route path="/nosotros" element={lazyPage(Nosotros, "Nosotros")} />

          <Route path="/bitacora" element={lazyPage(Bitacora, "Bitácora")} />

          <Route path="*" element={lazyPage(NotFound, "Página no encontrada")} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

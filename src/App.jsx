import { lazy, Suspense } from "react";
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

function lazyPage(Page) {
  return (
    <Suspense fallback={<div className="min-h-[50vh]" aria-hidden="true" />}>
      <Page />
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={lazyPage(Inicio)} />
          <Route path="/wikiprofes" element={lazyPage(WikiProfes)} />
          <Route path="/apuntes" element={lazyPage(Apuntes)} />

          <Route path="/preguntas-frecuentes" element={lazyPage(PreguntasFrecuentes)} />
          <Route path="/wikiempresas" element={lazyPage(WikiEmpresas)} />
          <Route path="/convenios" element={lazyPage(Convenios)} />
          <Route path="/malla" element={lazyPage(MallaInteractiva)} />
          <Route path="/malla-preview" element={lazyPage(MallaGridPreview)} />
          <Route path="/noticias" element={lazyPage(Noticias)} />

          <Route path="/documentacion" element={lazyPage(Documentacion)} />
          <Route path="/calendario" element={lazyPage(Calendario)} />
          <Route path="/actas" element={lazyPage(Actas)} />
          <Route path="/transparencia" element={lazyPage(Transparencia)} />
          <Route path="/programa" element={lazyPage(Programa)} />
          <Route path="/nosotros" element={lazyPage(Nosotros)} />

          <Route path="/bitacora" element={lazyPage(Bitacora)} />

          <Route path="*" element={lazyPage(NotFound)} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

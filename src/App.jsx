import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Inicio from "./pages/Inicio";
import WikiProfes from "./pages/WikiProfes";
import Apuntes from "./pages/Apuntes";
import PreguntasFrecuentes from "./pages/PreguntasFrecuentes";
import WikiEmpresas from "./pages/WikiEmpresas";
import Convenios from "./pages/Convenios";
import MallaInteractiva from "./pages/MallaInteractiva";
import Noticias from "./pages/Noticias";
import Documentacion from "./pages/Documentacion";
import Calendario from "./pages/Calendario";
import Actas from "./pages/Actas";
import Transparencia from "./pages/Transparencia";
import Programa from "./pages/Programa";
import Nosotros from "./pages/Nosotros";
import Bitacora from "./pages/Bitacora";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/wikiprofes" element={<WikiProfes />} />
          <Route path="/apuntes" element={<Apuntes />} />

          <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentes />} />
          <Route path="/wikiempresas" element={<WikiEmpresas />} />
          <Route path="/convenios" element={<Convenios />} />
          <Route path="/malla" element={<MallaInteractiva />} />
          <Route path="/noticias" element={<Noticias />} />

          <Route path="/documentacion" element={<Documentacion />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/actas" element={<Actas />} />
          <Route path="/transparencia" element={<Transparencia />} />
          <Route path="/programa" element={<Programa />} />
          <Route path="/nosotros" element={<Nosotros />} />

          <Route path="/bitacora" element={<Bitacora />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

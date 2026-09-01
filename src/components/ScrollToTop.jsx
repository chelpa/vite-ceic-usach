import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router, a diferencia de una navegación de página completa, NO
// mueve el scroll al cambiar de ruta — bug real que reportó Francisco: si
// haces clic en un link del footer estando abajo del todo (por ejemplo en
// /nosotros), la ruta cambia a /wikiprofes pero la vista se queda pegada
// abajo, así que parece que no pasó nada. Este componente no renderiza
// nada, solo escucha el cambio de ruta y sube el scroll al tope.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

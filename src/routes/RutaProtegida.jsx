import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * RutaProtegida
 * ------------------------------------------------------------------
 * 1. Sesión cargando -> estado de carga.
 * 2. Sin usuario -> login.
 * 3. Con `roles` y el usuario no cumple -> /no-autorizado (antes lo
 *    mandaba al login sin explicación).
 */
function RutaProtegida({ children, roles = [] }) {
  const { usuario, cargando, estaAutenticado } = useAuth();

  if (cargando) {
    return <div className="cargando-sesion">Verificando sesión…</div>;
  }

  if (!estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  if (roles.length > 0 && !usuario.tieneRol(...roles)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}

export default RutaProtegida;
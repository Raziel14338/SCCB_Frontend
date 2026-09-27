import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * RutaProtegida
 * ------------------------------------------------------------------
 * Envuelve una pantalla y decide si se puede mostrar según:
 *   1. Si hay una sesión cargando -> muestra estado de carga.
 *   2. Si no hay usuario autenticado -> redirige a "/".
 *   3. Si se pasan `roles` y el usuario no tiene ninguno -> redirige
 *      a una pantalla de "no autorizado" (o a "/" por defecto).
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
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RutaProtegida;
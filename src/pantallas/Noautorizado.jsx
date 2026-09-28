import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { rutaInicioParaRol } from "../config/Navegacion";

function NoAutorizado() {
  const { usuario } = useAuth();
  const destino = usuario ? rutaInicioParaRol(usuario.nombreRol) : "/";

  return (
    <div className="pagina-estado">
      <h1>No tienes acceso a esta pantalla</h1>
      <p>Tu rol no incluye este módulo. Si crees que es un error, pide el acceso a un administrador.</p>
      <Link to={destino}>{usuario ? "Volver a mi panel" : "Ir a iniciar sesión"}</Link>
    </div>
  );
}

export default NoAutorizado;
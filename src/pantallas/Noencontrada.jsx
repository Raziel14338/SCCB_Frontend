import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { rutaInicioParaRol } from "../config/Navegacion";

function NoEncontrada() {
  const { usuario } = useAuth();
  const destino = usuario ? rutaInicioParaRol(usuario.nombreRol) : "/";

  return (
    <div className="pagina-estado">
      <h1>Esta página no existe</h1>
      <p>La dirección que abriste no corresponde a ninguna pantalla.</p>
      <Link to={destino}>{usuario ? "Volver a mi panel" : "Ir a iniciar sesión"}</Link>
    </div>
  );
}

export default NoEncontrada;
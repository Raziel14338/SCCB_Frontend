import { useAuth } from "../../context/AuthContext";

/**
 * Placeholder del dashboard de OPERADOR_YPFB.
 * Se reemplaza por la pantalla real en el Módulo 2.
 */
function OperadorDashboard() {
  const { usuario, logout } = useAuth();

  return (
    <div>
      <h1>Panel Operador (YPFB)</h1>
      <p>Bienvenido, {usuario?.nombreCompleto}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

export default OperadorDashboard;
import { useAuth } from "../../context/AuthContext";

/**
 * Placeholder del dashboard de FISCAL_ANH.
 * Se reemplaza por la pantalla real en el Módulo 2.
 */
function FiscalizacionDashboard() {
  const { usuario, logout } = useAuth();

  return (
    <div>
      <h1>Panel de Fiscalización (ANH)</h1>
      <p>Bienvenido, {usuario?.nombreCompleto}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

export default FiscalizacionDashboard;
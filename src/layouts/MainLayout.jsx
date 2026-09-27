import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * MainLayout
 * ------------------------------------------------------------------
 * Shell común para toda pantalla autenticada: header con el nombre
 * del usuario, su rol/institución y el botón de logout, más un
 * <Outlet /> donde React Router renderiza la pantalla hija.
 *
 * Se usa como elemento "envoltorio" de un grupo de rutas protegidas
 * en App.jsx (ver <Route element={<MainLayout />}>...</Route>), así
 * cada dashboard/pantalla deja de tener que repetir su propio header
 * y botón de logout.
 */
function MainLayout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-header__marca">Gestión de Hidrocarburos</span>

        <nav className="app-header__nav">
          <Link to="/dashboard">Panel de Control</Link>
          <Link to="/alertas">Alertas</Link>
          {/* Los módulos 3-6 agregan su propio link aquí */}
        </nav>

        <div className="app-header__usuario">
          <span className="app-header__nombre">{usuario?.nombreCompleto}</span>
          <span className="app-header__rol">
            {usuario?.nombreRol} · {usuario?.institucion}
          </span>
          <button className="app-header__logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { enlacesParaRol } from "../config/Navegacion";

/**
 * MainLayout
 * ------------------------------------------------------------------
 * Shell común: menú filtrado por rol, datos del usuario y el ÚNICO
 * botón de cerrar sesión de la app (las pantallas hijas ya no deben
 * tener el suyo).
 */
function MainLayout() {
  const { usuario, logout } = useAuth();
  const enlaces = enlacesParaRol(usuario?.nombreRol);

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-header__marca">Gestión de Hidrocarburos</span>

        <nav className="app-header__nav" aria-label="Principal">
          {enlaces.map((e) => (
            <NavLink
              key={e.to}
              to={e.to}
              className={({ isActive }) => (isActive ? "activo" : undefined)}
            >
              {e.label}
            </NavLink>
          ))}
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
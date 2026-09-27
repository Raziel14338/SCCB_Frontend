import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RutaProtegida from "./routes/RutaProtegida";
import MainLayout from "./layouts/MainLayout";
import { ROLES } from "./models/Usuario";

import LoginPantalla from "./pantallas/LoginPantalla";

// Pantallas de los módulos 2+. Por ahora son placeholders: se
// reemplazan por las pantallas reales a medida que avanzamos módulo
// por módulo, sin tocar la estructura de rutas de abajo.
import AdminDashboard from "./pantallas/admin/Admindasboard";
import FiscalizacionDashboard from "./pantallas/fiscalizacion/Fiscalizaciondashboard";
import OperadorDashboard from "./pantallas/operador/Operadordashboard";

/**
 * App
 * ------------------------------------------------------------------
 * Define el árbol de rutas de toda la aplicación. Toda ruta que deba
 * mostrarse dentro del shell (header + logout) cuelga de la ruta
 * padre que renderiza <MainLayout />, que a su vez está protegida
 * por <RutaProtegida> (basta con estar autenticado; el control por
 * rol específico se hace en cada Route hija si hace falta).
 *
 * Cada módulo nuevo (Flota, Infraestructura, Operaciones, Telemetría)
 * agrega sus rutas como hijas de <MainLayout />, envueltas en su
 * propio <RutaProtegida roles={[...]}> cuando el acceso deba
 * restringirse a un rol puntual.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Pública ── */}
          <Route path="/" element={<LoginPantalla />} />

          {/* ── Shell autenticado (header + logout vía MainLayout) ── */}
          <Route
            element={
              <RutaProtegida>
                <MainLayout />
              </RutaProtegida>
            }
          >
            {/* ── ADMIN_RED ── */}
            <Route
              path="/admin/dashboard"
              element={
                <RutaProtegida roles={[ROLES.ADMIN_RED]}>
                  <AdminDashboard />
                </RutaProtegida>
              }
            />

            {/* ── FISCAL_ANH ── */}
            <Route
              path="/fiscalizacion/dashboard"
              element={
                <RutaProtegida roles={[ROLES.FISCAL_ANH]}>
                  <FiscalizacionDashboard />
                </RutaProtegida>
              }
            />

            {/* ── OPERADOR_YPFB ── */}
            <Route
              path="/operador/dashboard"
              element={
                <RutaProtegida roles={[ROLES.OPERADOR_YPFB]}>
                  <OperadorDashboard />
                </RutaProtegida>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
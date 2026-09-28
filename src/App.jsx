import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RutaProtegida from "./routes/RutaProtegida";
import MainLayout from "./layouts/MainLayout";
import { ROLES } from "./models/Usuario";

import LoginPantalla from "./pantallas/LoginPantalla";
import NoAutorizado from "./pantallas/Noautorizado";
import NoEncontrada from "./pantallas/Noencontrada";
import DashboardPantalla from "./pantallas/dashboard/DasboardPantalla";
import AlertasPantalla from "./pantallas/alertas/AlertasPantalla";
import MonitoreoPantalla from "./pantallas/monitoreo/Monitoreopantalla";
import AdminDashboard from "./pantallas/admin/Admindasboard";
import InfraestructuraDashboard from "./pantallas/infraestructura/infraestructuraDashboard";
import FiscalizacionDashboard from "./pantallas/fiscalizacion/Fiscalizaciondashboard";
import GestionCupos from "./pantallas/fiscalizacion/GestionCupos";
import OperadorDashboard from "./pantallas/operador/Operadordashboard";

/**
 * App
 * ------------------------------------------------------------------
 * Árbol de rutas. Todo lo que cuelga de <MainLayout /> comparte el
 * header con el menú por rol (ver config/navegacion.js). El control
 * fino por rol se hace con <RutaProtegida roles={[...]}>.
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPantalla />} />
          <Route path="/no-autorizado" element={<NoAutorizado />} />

          <Route
            element={
              <RutaProtegida>
                <MainLayout />
              </RutaProtegida>
            }
          >
            {/* Cualquier usuario autenticado */}
            <Route path="/dashboard" element={<DashboardPantalla />} />
            <Route path="/monitoreo" element={<MonitoreoPantalla />} />
            <Route path="/alertas" element={<AlertasPantalla />} />

            {/* ADMIN_RED */}
            <Route
              path="/admin/dashboard"
              element={
                <RutaProtegida roles={[ROLES.ADMIN_RED]}>
                  <AdminDashboard />
                </RutaProtegida>
              }
            />
            <Route
              path="/infraestructura"
              element={
                <RutaProtegida roles={[ROLES.ADMIN_RED]}>
                  <InfraestructuraDashboard />
                </RutaProtegida>
              }
            />

            {/* FISCAL_ANH */}
            <Route
              path="/fiscalizacion/dashboard"
              element={
                <RutaProtegida roles={[ROLES.FISCAL_ANH]}>
                  <FiscalizacionDashboard />
                </RutaProtegida>
              }
            />
            <Route
              path="/fiscalizacion/cupos"
              element={
                <RutaProtegida roles={[ROLES.FISCAL_ANH]}>
                  <GestionCupos />
                </RutaProtegida>
              }
            />

            {/* OPERADOR_YPFB */}
            <Route
              path="/operador/dashboard"
              element={
                <RutaProtegida roles={[ROLES.OPERADOR_YPFB]}>
                  <OperadorDashboard />
                </RutaProtegida>
              }
            />
          </Route>

          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
import { useState } from "react";
import DespachoForm from "./DespachoForm";
import DespachosTabla from "./DespachosTabla";
import CisternasTabla from "./CisternasTabla";

const TABS = [
  { id: "despachos", label: "Despachos" },
  { id: "cisternas", label: "Cisternas" },
];

/**
 * OperadorDashboard
 * ------------------------------------------------------------------
 * Reemplaza el placeholder original. Ya no repite el saludo/logout:
 * MainLayout (el shell que envuelve esta ruta) ya se encarga de eso.
 *
 * `refreshKey` se incrementa cada vez que DespachoForm registra un
 * despacho nuevo, y se pasa a DespachosTabla para forzar el refetch
 * sin acoplar ambos componentes entre sí.
 */
function OperadorDashboard() {
  const [tabActiva, setTabActiva] = useState(TABS[0].id);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="operador">
      <h1>Panel Operador (YPFB)</h1>

      <nav className="operador__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={tab.id === tabActiva ? "activo" : ""}
            onClick={() => setTabActiva(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {tabActiva === "despachos" && (
        <div className="operador__despachos">
          <DespachoForm onDespachoRegistrado={() => setRefreshKey((k) => k + 1)} />
          <DespachosTabla refreshKey={refreshKey} />
        </div>
      )}

      {tabActiva === "cisternas" && <CisternasTabla />}
    </div>
  );
}

export default OperadorDashboard;
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DespachoForm from "./DespachoForm";
import DespachosTabla from "./DespachosTabla";
import CisternasTabla from "./CisternasTabla";

const TABS = [
  { id: "despachar", label: "Nuevo despacho" },
  { id: "historial", label: "Historial de despachos" },
  { id: "cisternas", label: "Cisternas" },
];

/**
 * OperadorDashboard — Panel de Despacho (OPERADOR_YPFB)
 * ------------------------------------------------------------------
 * IMPORTANTE: el flujo anterior llamaba a POST /cupos/vehiculo/:placa/
 * validar-despacho, que descuenta el cupo pero NO crea el registro del
 * despacho. POST /despachos (DespachoForm) ya valida, descuenta el
 * cupo y registra el despacho en una sola operación; usar los dos en
 * secuencia descontaría el cupo dos veces. Por eso este panel usa solo
 * DespachoForm, que además trae su propio semáforo de solo lectura
 * (GET /cupos/validar/:rfid_tag) antes de confirmar.
 *
 * El cierre de sesión vive únicamente en MainLayout.
 */
function OperadorDashboard() {
  const { usuario } = useAuth();
  const [tabActiva, setTabActiva] = useState("despachar");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="panel-despacho">
      <h1>Panel de despacho</h1>
      <p>Bienvenido, {usuario?.nombreCompleto}</p>

      <nav className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tabActiva === t.id}
            className={tabActiva === t.id ? "tabs__tab tabs__tab--activa" : "tabs__tab"}
            onClick={() => setTabActiva(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tabActiva === "despachar" && (
        <DespachoForm onDespachoRegistrado={() => setRefreshKey((k) => k + 1)} />
      )}
      {tabActiva === "historial" && <DespachosTabla refreshKey={refreshKey} />}
      {tabActiva === "cisternas" && <CisternasTabla />}
    </div>
  );
}

export default OperadorDashboard;
import { Fragment, useEffect, useState } from "react";
import CisternasService from "../../services/CisternasService";
import { ESTADOS_CISTERNA } from "../../models/Cisterna";

const cisternasService = new CisternasService();

const FILTROS_ESTADO = [
  { label: "Todas", value: null },
  { label: "Operativas", value: ESTADOS_CISTERNA.OPERATIVA },
  { label: "En mantenimiento", value: ESTADOS_CISTERNA.MANTENIMIENTO },
  { label: "Fuera de servicio", value: ESTADOS_CISTERNA.FUERA_DE_SERVICIO },
];

/**
 * CisternasTabla
 * ------------------------------------------------------------------
 * La telemetría de cada cisterna se pide bajo demanda (al expandir la
 * fila), no de entrada al listar — evitar una llamada por cisterna
 * apenas se pinta la tabla. El resultado se cachea en `telemetrias`
 * por placa para no volver a pedirla si se colapsa/expande la misma
 * fila varias veces.
 */
function CisternasTabla() {
  const [cisternas, setCisternas] = useState([]);
  const [filtroIndex, setFiltroIndex] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [expandida, setExpandida] = useState(null); // placa | null
  const [telemetrias, setTelemetrias] = useState({}); // { [placa]: TelemetriaCisterna | 'sin_datos' | 'error' }
  const [cargandoTelemetria, setCargandoTelemetria] = useState(null); // placa | null

  useEffect(() => {
    setCargando(true);
    setError(null);
    cisternasService
      .listar({ estado: FILTROS_ESTADO[filtroIndex].value })
      .then(setCisternas)
      .catch(() => setError("No se pudieron cargar las cisternas."))
      .finally(() => setCargando(false));
  }, [filtroIndex]);

  const alternarFila = async (placa) => {
    if (expandida === placa) {
      setExpandida(null);
      return;
    }
    setExpandida(placa);

    if (telemetrias[placa]) return; // ya cacheada

    setCargandoTelemetria(placa);
    try {
      const telemetria = await cisternasService.obtenerUltimaTelemetria(placa);
      setTelemetrias((prev) => ({ ...prev, [placa]: telemetria ?? "sin_datos" }));
    } catch (err) {
      const clave = err.response?.status === 404 ? "sin_datos" : "error";
      setTelemetrias((prev) => ({ ...prev, [placa]: clave }));
    } finally {
      setCargandoTelemetria(null);
    }
  };

  return (
    <div className="cisternas">
      <div className="cisternas__header">
        <h2>Cisternas</h2>
        <select
          value={filtroIndex}
          onChange={(e) => setFiltroIndex(Number(e.target.value))}
        >
          {FILTROS_ESTADO.map((f, i) => (
            <option key={f.label} value={i}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando cisternas…</p>
      ) : cisternas.length === 0 ? (
        <p>No hay cisternas para este filtro.</p>
      ) : (
        <table className="cisternas__tabla">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Empresa</th>
              <th>Capacidad (L)</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cisternas.map((c) => (
              <Fragment key={c.placa}>
                <tr className={c.estaOperativa() ? "" : "fila-no-operativa"}>
                  <td>{c.placa}</td>
                  <td>{c.empresaTransporte}</td>
                  <td>{c.capacidadTotal.toLocaleString("es-BO")}</td>
                  <td>{c.estado}</td>
                  <td>
                    <button onClick={() => alternarFila(c.placa)}>
                      {expandida === c.placa ? "Ocultar telemetría" : "Ver telemetría"}
                    </button>
                  </td>
                </tr>
                {expandida === c.placa && (
                  <tr className="fila-telemetria">
                    <td colSpan={5}>
                      {cargandoTelemetria === c.placa ? (
                        <p>Cargando última telemetría…</p>
                      ) : telemetrias[c.placa] === "sin_datos" ? (
                        <p>Esta cisterna aún no tiene registros de telemetría.</p>
                      ) : telemetrias[c.placa] === "error" ? (
                        <p className="error">No se pudo consultar la telemetría.</p>
                      ) : telemetrias[c.placa] ? (
                        <ul className="telemetria-detalle">
                          <li>Evento: {telemetrias[c.placa].evento}</li>
                          <li>Nivel de carga: {telemetrias[c.placa].nivelCarga}%</li>
                          {telemetrias[c.placa].velocidadKmh !== null && (
                            <li>Velocidad: {telemetrias[c.placa].velocidadKmh} km/h</li>
                          )}
                          <li>
                            Posición: {telemetrias[c.placa].latitud}, {telemetrias[c.placa].longitud}
                          </li>
                          <li>
                            Fecha:{" "}
                            {telemetrias[c.placa].fechaHora?.toLocaleString("es-BO")}
                          </li>
                        </ul>
                      ) : null}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CisternasTabla;
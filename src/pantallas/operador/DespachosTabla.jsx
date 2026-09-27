import { useEffect, useState } from "react";
import DespachosService from "../../services/DespachoSrevice";
import { ESTADOS_TRANSACCION } from "../../models/Despacho";

const despachosService = new DespachosService();

const FILTROS_ESTADO = [
  { label: "Todos", value: null },
  { label: "Autorizados", value: ESTADOS_TRANSACCION.AUTORIZADO },
  { label: "Denegados", value: ESTADOS_TRANSACCION.DENEGADO },
];

/**
 * DespachosTabla
 * ------------------------------------------------------------------
 * `refreshKey` lo cambia el padre (OperadorDashboard) cada vez que se
 * registra un despacho nuevo, para forzar el refetch sin acoplar
 * esta tabla al formulario.
 */
function DespachosTabla({ refreshKey }) {
  const [despachos, setDespachos] = useState([]);
  const [filtroIndex, setFiltroIndex] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    setError(null);
    despachosService
      .listar({ estadoTransaccion: FILTROS_ESTADO[filtroIndex].value })
      .then(setDespachos)
      .catch(() => setError("No se pudieron cargar los despachos."))
      .finally(() => setCargando(false));
  }, [filtroIndex, refreshKey]);

  return (
    <div className="despachos">
      <div className="despachos__header">
        <h2>Historial de despachos</h2>
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
        <p>Cargando despachos…</p>
      ) : despachos.length === 0 ? (
        <p>No hay despachos para este filtro.</p>
      ) : (
        <table className="despachos__tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Surtidor</th>
              <th>Conductor</th>
              <th>Volumen (L)</th>
              <th>Método</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {despachos.map((d) => (
              <tr key={d.idDespacho} className={d.esDenegado() ? "fila-denegada" : ""}>
                <td>{d.idDespacho}</td>
                <td>{d.idSurtidor}</td>
                <td>{d.idConductor}</td>
                <td>{d.volumenDespachado.toLocaleString("es-BO")}</td>
                <td>{d.metodoIdentificacion}</td>
                <td>{d.estadoTransaccion}</td>
                <td>{d.fechaHora?.toLocaleString("es-BO")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DespachosTabla;
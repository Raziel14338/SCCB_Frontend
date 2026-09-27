import { useEffect, useState } from "react";
import AlertasService from "../../services/AlertasService";
import { ESTADOS_ALERTA } from "../../models/Alerta";
import { useAuth } from "../../context/AuthContext";

const alertasService = new AlertasService();

const FILTROS_ESTADO = [
  { label: "Activas (abiertas + en revisión)", value: [ESTADOS_ALERTA.ABIERTA, ESTADOS_ALERTA.EN_REVISION] },
  { label: "Abiertas", value: [ESTADOS_ALERTA.ABIERTA] },
  { label: "En revisión", value: [ESTADOS_ALERTA.EN_REVISION] },
  { label: "Resueltas", value: [ESTADOS_ALERTA.RESUELTA] },
  { label: "Descartadas", value: [ESTADOS_ALERTA.DESCARTADA] },
  { label: "Todas", value: null },
];

/**
 * AlertasPantalla
 * ------------------------------------------------------------------
 * CRUD de alertas: lista con filtro por estado y permite avanzar el
 * estado de cada una (ABIERTA -> EN_REVISION -> RESUELTA/DESCARTADA).
 * El usuario que resuelve queda registrado como id_usuario_resolucion,
 * tomado de la sesión activa (useAuth), no como input manual.
 */
function AlertasPantalla() {
  const { usuario } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [filtroIndex, setFiltroIndex] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [actualizandoId, setActualizandoId] = useState(null);

  const cargarAlertas = (estados) => {
    setCargando(true);
    setError(null);
    alertasService
      .listar({ estados })
      .then(setAlertas)
      .catch(() => setError("No se pudieron cargar las alertas."))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarAlertas(FILTROS_ESTADO[filtroIndex].value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroIndex]);

  const cambiarEstado = async (alerta, nuevoEstado) => {
    setActualizandoId(alerta.idAlerta);
    try {
      const actualizada = await alertasService.actualizarEstado(alerta.idAlerta, {
        estado: nuevoEstado,
        idUsuarioResolucion: usuario?.idUsuario,
      });
      setAlertas((prev) =>
        prev.map((a) => (a.idAlerta === actualizada.idAlerta ? actualizada : a))
      );
    } catch {
      setError(`No se pudo actualizar la alerta #${alerta.idAlerta}.`);
    } finally {
      setActualizandoId(null);
    }
  };

  return (
    <div className="alertas">
      <div className="alertas__header">
        <h1>Alertas</h1>
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
        <p>Cargando alertas…</p>
      ) : alertas.length === 0 ? (
        <p>No hay alertas para este filtro.</p>
      ) : (
        <table className="alertas__tabla">
          <thead>
            <tr>
              <th>Severidad</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Referencia</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alertas.map((alerta) => (
              <tr key={alerta.idAlerta} className={alerta.esCritica() ? "fila-critica" : ""}>
                <td>{alerta.severidad}</td>
                <td>{alerta.tipoAlerta}</td>
                <td>{alerta.descripcion}</td>
                <td>{alerta.referencia}</td>
                <td>{alerta.estado}</td>
                <td>{alerta.fechaHora?.toLocaleString("es-BO")}</td>
                <td className="alertas__acciones">
                  {!alerta.estaCerrada() && (
                    <>
                      {alerta.estaAbierta() && (
                        <button
                          disabled={actualizandoId === alerta.idAlerta}
                          onClick={() => cambiarEstado(alerta, ESTADOS_ALERTA.EN_REVISION)}
                        >
                          Poner en revisión
                        </button>
                      )}
                      <button
                        disabled={actualizandoId === alerta.idAlerta}
                        onClick={() => cambiarEstado(alerta, ESTADOS_ALERTA.RESUELTA)}
                      >
                        Resolver
                      </button>
                      <button
                        disabled={actualizandoId === alerta.idAlerta}
                        onClick={() => cambiarEstado(alerta, ESTADOS_ALERTA.DESCARTADA)}
                      >
                        Descartar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AlertasPantalla;
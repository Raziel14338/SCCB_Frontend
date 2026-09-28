import { useEffect, useState } from "react";
import AlertasService from "../../services/AlertasService";
import { ESTADOS_ALERTA, SEVERIDADES, TIPOS_ALERTA } from "../../models/Alerta";
import { useAuth } from "../../context/AuthContext";

const alertasService = new AlertasService();

const FILTROS_ESTADO = [
  {
    label: "Activas (abiertas + en revisión)",
    value: [ESTADOS_ALERTA.ABIERTA, ESTADOS_ALERTA.EN_REVISION],
  },
  { label: "Abiertas", value: [ESTADOS_ALERTA.ABIERTA] },
  { label: "En revisión", value: [ESTADOS_ALERTA.EN_REVISION] },
  { label: "Resueltas", value: [ESTADOS_ALERTA.RESUELTA] },
  { label: "Descartadas", value: [ESTADOS_ALERTA.DESCARTADA] },
  { label: "Todas", value: null },
];

const REFERENCIAS = [
  { campo: "idCisterna", label: "Cisterna (ID)" },
  { campo: "idVehiculo", label: "Vehículo (ID)" },
  { campo: "idEstacion", label: "Estación (ID)" },
];

const FORM_INICIAL = {
  tipoAlerta: TIPOS_ALERTA[0],
  severidad: SEVERIDADES.MEDIA,
  descripcion: "",
  campoReferencia: "idCisterna",
  idReferencia: "",
};

/**
 * AlertasPantalla
 * ------------------------------------------------------------------
 * Lista con filtros por estado y severidad, cambio de estado
 * (ABIERTA -> EN_REVISION -> RESUELTA/DESCARTADA) y registro manual
 * de alertas (POST /alertas, exige una referencia: cisterna,
 * vehículo o estación).
 */
function AlertasPantalla() {
  const { usuario } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [filtroIndex, setFiltroIndex] = useState(0);
  const [severidad, setSeveridad] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [recarga, setRecarga] = useState(0);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    alertasService
      .listar({
        estados: FILTROS_ESTADO[filtroIndex].value,
        severidades: severidad || undefined,
      })
      .then((data) => activo && setAlertas(data))
      .catch(() => activo && setError("No se pudieron cargar las alertas."))
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, [filtroIndex, severidad, recarga]);

  const cambiarEstado = async (alerta, nuevoEstado) => {
    setActualizandoId(alerta.idAlerta);
    try {
      const actualizada = await alertasService.actualizarEstado(alerta.idAlerta, {
        estado: nuevoEstado,
        idUsuarioResolucion: usuario?.idUsuario,
      });
      setAlertas((prev) => prev.map((a) => (a.idAlerta === actualizada.idAlerta ? actualizada : a)));
    } catch {
      setError(`No se pudo actualizar la alerta #${alerta.idAlerta}.`);
    } finally {
      setActualizandoId(null);
    }
  };

  const campo = (nombre) => (e) => setForm((prev) => ({ ...prev, [nombre]: e.target.value }));

  const registrar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setErrorForm(null);
    try {
      await alertasService.registrar({
        tipoAlerta: form.tipoAlerta,
        severidad: form.severidad,
        descripcion: form.descripcion.trim(),
        [form.campoReferencia]: Number(form.idReferencia),
      });
      setForm(FORM_INICIAL);
      setMostrarForm(false);
      setRecarga((n) => n + 1);
    } catch (err) {
      setErrorForm(err.mensaje || "No se pudo registrar la alerta.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="alertas">
      <div className="alertas__header">
        <h1>Alertas</h1>
        <select
          aria-label="Filtrar por estado"
          value={filtroIndex}
          onChange={(e) => setFiltroIndex(Number(e.target.value))}
        >
          {FILTROS_ESTADO.map((f, i) => (
            <option key={f.label} value={i}>
              {f.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por severidad"
          value={severidad}
          onChange={(e) => setSeveridad(e.target.value)}
        >
          <option value="">Todas las severidades</option>
          {Object.values(SEVERIDADES).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "Registrar alerta"}
        </button>
      </div>

      {mostrarForm && (
        <form className="alertas__form" onSubmit={registrar}>
          <label>
            Tipo
            <select value={form.tipoAlerta} onChange={campo("tipoAlerta")}>
              {TIPOS_ALERTA.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Severidad
            <select value={form.severidad} onChange={campo("severidad")}>
              {Object.values(SEVERIDADES).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Referencia
            <select value={form.campoReferencia} onChange={campo("campoReferencia")}>
              {REFERENCIAS.map((r) => (
                <option key={r.campo} value={r.campo}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            ID
            <input
              type="number"
              min="1"
              value={form.idReferencia}
              onChange={campo("idReferencia")}
              required
            />
          </label>
          <label className="alertas__form-descripcion">
            Descripción
            <textarea value={form.descripcion} onChange={campo("descripcion")} required />
          </label>
          {errorForm && <p className="error">{errorForm}</p>}
          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar alerta"}
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      {cargando ? (
        <p>Cargando alertas…</p>
      ) : alertas.length === 0 ? (
        <p>No hay alertas con estos filtros.</p>
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
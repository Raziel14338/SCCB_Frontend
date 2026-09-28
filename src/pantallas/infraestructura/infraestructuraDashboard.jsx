import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import InfraestructuraService from "../../services/Infraestructuraservice";
import InventarioService from "../../services/Invetarioservice";
import { ESTADOS_CENTRO_ACOPIO } from "../../models/CentroAcopio";
import { ESTADOS_ESTACION } from "../../models/Estacion";
import { TIPOS_COMBUSTIBLE } from "../../models/Surtidor";
import { TIPOS_MOVIMIENTO } from "../../models/Inventario";

const infraestructuraService = new InfraestructuraService();
const inventarioService = new InventarioService();

const TABS = [
  { id: "centros", label: "Centros de Acopio" },
  { id: "estaciones", label: "Estaciones" },
  { id: "surtidores", label: "Surtidores" },
  { id: "inventario", label: "Inventario" },
];

/**
 * InfraestructuraDashboard — Panel de Infraestructura e Inventario
 * ------------------------------------------------------------------
 * Igual patrón que Admindasboard.jsx: cuatro pestañas independientes,
 * cada una con su propio listado + formulario de alta, cargando datos
 * recién al activarse por primera vez.
 *
 * SUPUESTO: se restringe a ADMIN_RED en App.jsx (mismo criterio que
 * el resto de pantallas de administración de activos), porque
 * operationsroutes.js no aplica `verificarRol` a estos endpoints y no
 * hay otra señal en el backend de qué rol debería gestionarlos.
 * Ajustar la restricción de rol en la ruta si el fiscalizador u otro
 * rol también debe poder crear/editar infraestructura.
 */
function InfraestructuraDashboard() {
  const { logout } = useAuth();
  const [tabActiva, setTabActiva] = useState("centros");

  return (
    <div className="infraestructura">
      <div className="infraestructura__header">
        <h1>Infraestructura e Inventario</h1>
        <button onClick={logout}>Cerrar sesión</button>
      </div>

      <nav className="infraestructura__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={
              tabActiva === tab.id
                ? "infraestructura__tab infraestructura__tab--activa"
                : "infraestructura__tab"
            }
            onClick={() => setTabActiva(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {tabActiva === "centros" && <TabCentrosAcopio />}
      {tabActiva === "estaciones" && <TabEstaciones />}
      {tabActiva === "surtidores" && <TabSurtidores />}
      {tabActiva === "inventario" && <TabInventario />}
    </div>
  );
}

// ------------------------------------------------------------------
// Centros de Acopio
// ------------------------------------------------------------------

const FORM_CENTRO_INICIAL = {
  nombre: "",
  ubicacion: "",
  latitud: "",
  longitud: "",
  capacidadAlmacen: "",
};

function TabCentrosAcopio() {
  const [centros, setCentros] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [actualizandoId, setActualizandoId] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_CENTRO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setCentros(await infraestructuraService.listarCentrosAcopio());
    } catch {
      setError("No se pudieron cargar los centros de acopio.");
    } finally {
      setCargando(false);
    }
  };

  if (centros === null && !cargando && !error) {
    cargar();
  }

  const actualizarCampo = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const crearCentro = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setErrorForm(null);
    try {
      await infraestructuraService.crearCentroAcopio({
        nombre: form.nombre,
        ubicacion: form.ubicacion,
        latitud: form.latitud ? Number(form.latitud) : null,
        longitud: form.longitud ? Number(form.longitud) : null,
        capacidadAlmacen: Number(form.capacidadAlmacen),
      });
      setForm(FORM_CENTRO_INICIAL);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setErrorForm(err.mensaje || "No se pudo registrar el centro de acopio.");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (centro, nuevoEstado) => {
    setActualizandoId(centro.idCentro);
    try {
      const actualizado = await infraestructuraService.actualizarCentroAcopio(
        centro.idCentro,
        { estado: nuevoEstado }
      );
      setCentros((prev) =>
        prev.map((c) => (c.idCentro === actualizado.idCentro ? actualizado : c))
      );
    } catch {
      setError(`No se pudo actualizar el centro #${centro.idCentro}.`);
    } finally {
      setActualizandoId(null);
    }
  };

  const eliminar = async (centro) => {
    if (!window.confirm(`¿Eliminar el centro de acopio "${centro.nombre}"?`)) return;
    setActualizandoId(centro.idCentro);
    try {
      await infraestructuraService.eliminarCentroAcopio(centro.idCentro);
      setCentros((prev) => prev.filter((c) => c.idCentro !== centro.idCentro));
    } catch {
      setError(`No se pudo eliminar el centro #${centro.idCentro}.`);
    } finally {
      setActualizandoId(null);
    }
  };

  return (
    <section className="infraestructura__panel">
      <div className="infraestructura__panel-header">
        <button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "Registrar centro de acopio"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={crearCentro} className="infraestructura__form">
          <label>
            Nombre
            <input value={form.nombre} onChange={actualizarCampo("nombre")} required />
          </label>
          <label>
            Ubicación
            <input value={form.ubicacion} onChange={actualizarCampo("ubicacion")} required />
          </label>
          <label>
            Latitud (opcional)
            <input
              type="number"
              step="any"
              value={form.latitud}
              onChange={actualizarCampo("latitud")}
            />
          </label>
          <label>
            Longitud (opcional)
            <input
              type="number"
              step="any"
              value={form.longitud}
              onChange={actualizarCampo("longitud")}
            />
          </label>
          <label>
            Capacidad de almacén (L)
            <input
              type="number"
              min="0"
              value={form.capacidadAlmacen}
              onChange={actualizarCampo("capacidadAlmacen")}
              required
            />
          </label>
          {errorForm && <p className="error">{errorForm}</p>}
          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Registrar"}
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      {cargando || centros === null ? (
        <p>Cargando centros de acopio…</p>
      ) : (
        <table className="infraestructura__tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ubicación</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {centros.map((c) => (
              <tr key={c.idCentro}>
                <td>{c.nombre}</td>
                <td>{c.ubicacion}</td>
                <td>{c.capacidadAlmacen.toLocaleString("es-BO")} L</td>
                <td>{c.estado}</td>
                <td>
                  <select
                    value={c.estado}
                    disabled={actualizandoId === c.idCentro}
                    onChange={(e) => cambiarEstado(c, e.target.value)}
                  >
                    {Object.values(ESTADOS_CENTRO_ACOPIO).map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={actualizandoId === c.idCentro}
                    onClick={() => eliminar(c)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

// ------------------------------------------------------------------
// Estaciones de Servicio
// ------------------------------------------------------------------

const FORM_ESTACION_INICIAL = {
  nombre: "",
  codigoYpfb: "",
  ubicacion: "",
  latitud: "",
  longitud: "",
};

function TabEstaciones() {
  const [estaciones, setEstaciones] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [actualizandoId, setActualizandoId] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_ESTACION_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setEstaciones(await infraestructuraService.listarEstaciones());
    } catch {
      setError("No se pudieron cargar las estaciones.");
    } finally {
      setCargando(false);
    }
  };

  if (estaciones === null && !cargando && !error) {
    cargar();
  }

  const actualizarCampo = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const crearEstacion = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setErrorForm(null);
    try {
      await infraestructuraService.crearEstacion({
        nombre: form.nombre,
        codigoYpfb: form.codigoYpfb,
        ubicacion: form.ubicacion,
        latitud: form.latitud ? Number(form.latitud) : null,
        longitud: form.longitud ? Number(form.longitud) : null,
      });
      setForm(FORM_ESTACION_INICIAL);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      // 409 si el código YPFB ya está registrado — el mensaje del
      // backend ya es lo bastante claro para mostrarlo tal cual.
      setErrorForm(err.mensaje || "No se pudo registrar la estación.");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (estacion, nuevoEstado) => {
    setActualizandoId(estacion.idEstacion);
    try {
      const actualizada = await infraestructuraService.actualizarEstacion(
        estacion.idEstacion,
        { estado: nuevoEstado }
      );
      setEstaciones((prev) =>
        prev.map((e) => (e.idEstacion === actualizada.idEstacion ? actualizada : e))
      );
    } catch {
      setError(`No se pudo actualizar la estación #${estacion.idEstacion}.`);
    } finally {
      setActualizandoId(null);
    }
  };

  const eliminar = async (estacion) => {
    if (
      !window.confirm(
        `¿Eliminar la estación "${estacion.nombre}"? Esto también elimina todos sus surtidores.`
      )
    )
      return;
    setActualizandoId(estacion.idEstacion);
    try {
      await infraestructuraService.eliminarEstacion(estacion.idEstacion);
      setEstaciones((prev) => prev.filter((e) => e.idEstacion !== estacion.idEstacion));
    } catch {
      setError(`No se pudo eliminar la estación #${estacion.idEstacion}.`);
    } finally {
      setActualizandoId(null);
    }
  };

  return (
    <section className="infraestructura__panel">
      <div className="infraestructura__panel-header">
        <button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "Registrar estación"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={crearEstacion} className="infraestructura__form">
          <label>
            Nombre
            <input value={form.nombre} onChange={actualizarCampo("nombre")} required />
          </label>
          <label>
            Código YPFB
            <input value={form.codigoYpfb} onChange={actualizarCampo("codigoYpfb")} required />
          </label>
          <label>
            Ubicación
            <input value={form.ubicacion} onChange={actualizarCampo("ubicacion")} required />
          </label>
          <label>
            Latitud (opcional)
            <input
              type="number"
              step="any"
              value={form.latitud}
              onChange={actualizarCampo("latitud")}
            />
          </label>
          <label>
            Longitud (opcional)
            <input
              type="number"
              step="any"
              value={form.longitud}
              onChange={actualizarCampo("longitud")}
            />
          </label>
          {errorForm && <p className="error">{errorForm}</p>}
          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Registrar"}
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      {cargando || estaciones === null ? (
        <p>Cargando estaciones…</p>
      ) : (
        <table className="infraestructura__tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Código YPFB</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estaciones.map((e) => (
              <tr key={e.idEstacion}>
                <td>{e.nombre}</td>
                <td>{e.codigoYpfb}</td>
                <td>{e.ubicacion}</td>
                <td>{e.estado}</td>
                <td>
                  <select
                    value={e.estado}
                    disabled={actualizandoId === e.idEstacion}
                    onChange={(ev) => cambiarEstado(e, ev.target.value)}
                  >
                    {Object.values(ESTADOS_ESTACION).map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={actualizandoId === e.idEstacion}
                    onClick={() => eliminar(e)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

// ------------------------------------------------------------------
// Surtidores
// ------------------------------------------------------------------

const FORM_SURTIDOR_INICIAL = {
  idEstacion: "",
  numeroSurtidor: "",
  tipoCombustible: TIPOS_COMBUSTIBLE.DIESEL_OIL,
  tieneOcr: false,
  tieneRfid: false,
};

function TabSurtidores() {
  const [surtidores, setSurtidores] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_SURTIDOR_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      // Listado global (con nombre_estacion resuelto) en vez de pedir
      // por estación: esta pestaña es un vistazo general de todos los
      // surtidores, no un detalle de una estación puntual.
      setSurtidores(await infraestructuraService.listarTodosSurtidores());
    } catch {
      setError("No se pudieron cargar los surtidores.");
    } finally {
      setCargando(false);
    }
  };

  if (surtidores === null && !cargando && !error) {
    cargar();
  }

  const actualizarCampo = (campo) => (e) => {
    const valor = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const crearSurtidor = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setErrorForm(null);
    try {
      await infraestructuraService.crearSurtidor({
        idEstacion: Number(form.idEstacion),
        numeroSurtidor: form.numeroSurtidor,
        tipoCombustible: form.tipoCombustible,
        tieneOcr: form.tieneOcr,
        tieneRfid: form.tieneRfid,
      });
      setForm(FORM_SURTIDOR_INICIAL);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      // 404 si la estación no existe, 409 si el número ya está usado
      // en esa estación — ambos mensajes del backend son claros.
      setErrorForm(err.mensaje || "No se pudo registrar el surtidor.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="infraestructura__panel">
      <div className="infraestructura__panel-header">
        <button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "Registrar surtidor"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={crearSurtidor} className="infraestructura__form">
          <label>
            ID de estación
            <input
              type="number"
              min="1"
              value={form.idEstacion}
              onChange={actualizarCampo("idEstacion")}
              required
            />
          </label>
          <label>
            Número de surtidor
            <input
              value={form.numeroSurtidor}
              onChange={actualizarCampo("numeroSurtidor")}
              required
            />
          </label>
          <label>
            Tipo de combustible
            <select value={form.tipoCombustible} onChange={actualizarCampo("tipoCombustible")}>
              {Object.values(TIPOS_COMBUSTIBLE).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>
          <label className="infraestructura__checkbox">
            <input
              type="checkbox"
              checked={form.tieneOcr}
              onChange={actualizarCampo("tieneOcr")}
            />
            Tiene lector OCR
          </label>
          <label className="infraestructura__checkbox">
            <input
              type="checkbox"
              checked={form.tieneRfid}
              onChange={actualizarCampo("tieneRfid")}
            />
            Tiene lector RFID
          </label>
          {errorForm && <p className="error">{errorForm}</p>}
          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Registrar"}
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      {cargando || surtidores === null ? (
        <p>Cargando surtidores…</p>
      ) : (
        <table className="infraestructura__tabla">
          <thead>
            <tr>
              <th>Número</th>
              <th>Estación</th>
              <th>Combustible</th>
              <th>OCR</th>
              <th>RFID</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {surtidores.map((s) => (
              <tr key={s.idSurtidor}>
                <td>{s.numeroSurtidor}</td>
                <td>{s.nombreEstacion ?? s.idEstacion}</td>
                <td>{s.tipoCombustible}</td>
                <td>{s.tieneOcr ? "Sí" : "No"}</td>
                <td>{s.tieneRfid ? "Sí" : "No"}</td>
                <td>{s.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

// ------------------------------------------------------------------
// Inventario (transferencias centro de acopio -> estación)
// ------------------------------------------------------------------

const FORM_TRANSFERENCIA_INICIAL = {
  idCentroAcopio: "",
  idEstacion: "",
  idCisterna: "",
  tipoCombustible: TIPOS_COMBUSTIBLE.DIESEL_OIL,
  volumen: "",
  documentoReferencia: "",
};

function TabInventario() {
  const { usuario } = useAuth();
  const [movimientos, setMovimientos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_TRANSFERENCIA_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);
  const [ultimoDocumento, setUltimoDocumento] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setMovimientos(await inventarioService.listarInventario());
    } catch {
      setError("No se pudo cargar el historial de inventario.");
    } finally {
      setCargando(false);
    }
  };

  if (movimientos === null && !cargando && !error) {
    cargar();
  }

  const actualizarCampo = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const registrarTransferencia = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setErrorForm(null);
    try {
      const resultado = await inventarioService.registrarTransferencia({
        idCentroAcopio: Number(form.idCentroAcopio),
        idEstacion: Number(form.idEstacion),
        idCisterna: form.idCisterna ? Number(form.idCisterna) : null,
        tipoCombustible: form.tipoCombustible,
        volumen: Number(form.volumen),
        documentoReferencia: form.documentoReferencia || undefined,
        idUsuarioRegistro: usuario?.idUsuario,
      });
      setUltimoDocumento(resultado.documentoReferencia);
      setForm(FORM_TRANSFERENCIA_INICIAL);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setErrorForm(err.mensaje || "No se pudo registrar la transferencia.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="infraestructura__panel">
      <div className="infraestructura__panel-header">
        <button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "Registrar transferencia"}
        </button>
      </div>

      {ultimoDocumento && (
        <p className="infraestructura__aviso">
          Transferencia registrada — documento {ultimoDocumento}.
        </p>
      )}

      {mostrarForm && (
        <form onSubmit={registrarTransferencia} className="infraestructura__form">
          <label>
            ID centro de acopio (origen)
            <input
              type="number"
              min="1"
              value={form.idCentroAcopio}
              onChange={actualizarCampo("idCentroAcopio")}
              required
            />
          </label>
          <label>
            ID estación (destino)
            <input
              type="number"
              min="1"
              value={form.idEstacion}
              onChange={actualizarCampo("idEstacion")}
              required
            />
          </label>
          <label>
            ID cisterna transportista (opcional)
            <input
              type="number"
              min="1"
              value={form.idCisterna}
              onChange={actualizarCampo("idCisterna")}
            />
          </label>
          <label>
            Tipo de combustible
            <select value={form.tipoCombustible} onChange={actualizarCampo("tipoCombustible")}>
              {Object.values(TIPOS_COMBUSTIBLE).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>
          <label>
            Volumen (L)
            <input
              type="number"
              min="0"
              value={form.volumen}
              onChange={actualizarCampo("volumen")}
              required
            />
          </label>
          <label>
            Documento de referencia (opcional)
            <input
              value={form.documentoReferencia}
              onChange={actualizarCampo("documentoReferencia")}
              placeholder="Se genera automáticamente si se deja en blanco"
            />
          </label>
          {errorForm && <p className="error">{errorForm}</p>}
          <button type="submit" disabled={guardando}>
            {guardando ? "Registrando…" : "Registrar transferencia"}
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      {cargando || movimientos === null ? (
        <p>Cargando historial de inventario…</p>
      ) : movimientos.length === 0 ? (
        <p>Aún no hay movimientos de inventario registrados.</p>
      ) : (
        <table className="infraestructura__tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Centro de acopio</th>
              <th>Estación</th>
              <th>Combustible</th>
              <th>Volumen</th>
              <th>Documento</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m) => (
              <tr
                key={m.idMovimiento}
                className={
                  m.tipoMovimiento === TIPOS_MOVIMIENTO.SALIDA
                    ? "fila-salida"
                    : "fila-entrada"
                }
              >
                <td>{m.fechaHora?.toLocaleString("es-BO")}</td>
                <td>{m.tipoMovimiento}</td>
                <td>{m.idCentroAcopio ?? "—"}</td>
                <td>{m.idEstacion ?? "—"}</td>
                <td>{m.tipoCombustible}</td>
                <td>{m.volumen.toLocaleString("es-BO")} L</td>
                <td>{m.documentoReferencia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default InfraestructuraDashboard;
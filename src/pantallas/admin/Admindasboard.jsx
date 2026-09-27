import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthService from "../../services/AuthService";
import UsuariosService from "../../services/Usuarioservice";
import ConductorService from "../../services/Conductorservice";
import VehiculoService from "../../services/Vehiculoservice";
import { ROLES } from "../../models/Usuario";
import { TIPOS_VEHICULO, ESTADOS_VEHICULO } from "../../models/Vehiculo";

const authService = AuthService.getInstance();
const usuariosService = new UsuariosService();
const conductorService = new ConductorService();
const vehiculoService = new VehiculoService();

const TABS = [
  { id: "usuarios", label: "Usuarios" },
  { id: "conductores", label: "Conductores" },
  { id: "vehiculos", label: "Vehículos" },
];

/**
 * AdminDashboard — Panel de Administración (ADMIN_RED)
 * ------------------------------------------------------------------
 * Tres pestañas independientes (usuarios / conductores / vehículos),
 * cada una con su propio estado de listado + formulario de alta.
 * Cada pestaña carga sus datos recién al activarse por primera vez
 * (no se piden los tres listados de una — el admin puede no
 * necesitar los tres en la misma visita).
 */
function AdminDashboard() {
  const { logout } = useAuth();
  const [tabActiva, setTabActiva] = useState("usuarios");

  return (
    <div className="admin">
      <div className="admin__header">
        <h1>Panel Administrador (ADMIN_RED)</h1>
        <button onClick={logout}>Cerrar sesión</button>
      </div>

      <nav className="admin__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={tabActiva === tab.id ? "admin__tab admin__tab--activa" : "admin__tab"}
            onClick={() => setTabActiva(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {tabActiva === "usuarios" && <TabUsuarios />}
      {tabActiva === "conductores" && <TabConductores />}
      {tabActiva === "vehiculos" && <TabVehiculos />}
    </div>
  );
}

// ------------------------------------------------------------------
// Usuarios
// ------------------------------------------------------------------

const FORM_USUARIO_INICIAL = {
  nombreUsuario: "",
  password: "",
  nombreCompleto: "",
  correo: "",
  institucion: "",
  idRol: "",
};

function TabUsuarios() {
  const [usuarios, setUsuarios] = useState(null);
  const [rolFiltro, setRolFiltro] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [actualizandoId, setActualizandoId] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_USUARIO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const cargar = async (rol = rolFiltro) => {
    setCargando(true);
    setError(null);
    try {
      const datos = await usuariosService.listarPorRol({ rol: rol || undefined });
      setUsuarios(datos);
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  };

  if (usuarios === null && !cargando && !error) {
    cargar();
  }

  const cambiarEstado = async (usuario) => {
    setActualizandoId(usuario.idUsuario);
    try {
      const actualizado = usuario.estaActivo()
        ? await usuariosService.desactivar(usuario.idUsuario)
        : await usuariosService.reactivar(usuario.idUsuario);
      setUsuarios((prev) =>
        prev.map((u) => (u.idUsuario === actualizado.idUsuario ? actualizado : u))
      );
    } catch {
      setError(`No se pudo actualizar el usuario #${usuario.idUsuario}.`);
    } finally {
      setActualizandoId(null);
    }
  };

  const actualizarCampo = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const crearUsuario = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setErrorForm(null);
    try {
      await authService.registrar({
        nombreUsuario: form.nombreUsuario,
        password: form.password,
        nombreCompleto: form.nombreCompleto,
        correo: form.correo,
        institucion: form.institucion,
        idRol: Number(form.idRol),
      });
      setForm(FORM_USUARIO_INICIAL);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setErrorForm(err.mensaje || "No se pudo registrar el usuario.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="admin__panel">
      <div className="admin__panel-header">
        <select value={rolFiltro} onChange={(e) => { setRolFiltro(e.target.value); cargar(e.target.value); }}>
          <option value="">Todos los roles</option>
          {Object.values(ROLES).map((rol) => (
            <option key={rol} value={rol}>
              {rol}
            </option>
          ))}
        </select>
        <button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "Registrar usuario"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={crearUsuario} className="admin__form">
          <label>
            Nombre de usuario
            <input value={form.nombreUsuario} onChange={actualizarCampo("nombreUsuario")} required />
          </label>
          <label>
            Contraseña (mín. 8 caracteres)
            <input
              type="password"
              value={form.password}
              onChange={actualizarCampo("password")}
              minLength={8}
              required
            />
          </label>
          <label>
            Nombre completo
            <input value={form.nombreCompleto} onChange={actualizarCampo("nombreCompleto")} required />
          </label>
          <label>
            Correo
            <input type="email" value={form.correo} onChange={actualizarCampo("correo")} required />
          </label>
          <label>
            Institución
            <input value={form.institucion} onChange={actualizarCampo("institucion")} required />
          </label>
          <label>
            ID de rol
            <input
              type="number"
              min="1"
              value={form.idRol}
              onChange={actualizarCampo("idRol")}
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

      {cargando || usuarios === null ? (
        <p>Cargando usuarios…</p>
      ) : (
        <table className="admin__tabla">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre completo</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Institución</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.idUsuario}>
                <td>{u.nombreUsuario}</td>
                <td>{u.nombreCompleto}</td>
                <td>{u.correo}</td>
                <td>{u.nombreRol}</td>
                <td>{u.institucion}</td>
                <td>{u.estado}</td>
                <td>
                  <button disabled={actualizandoId === u.idUsuario} onClick={() => cambiarEstado(u)}>
                    {u.estaActivo() ? "Desactivar" : "Reactivar"}
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
// Conductores
// ------------------------------------------------------------------

const FORM_CONDUCTOR_INICIAL = { nombreCompleto: "", ci: "", licenciaConducir: "", telefono: "" };

function TabConductores() {
  const [conductores, setConductores] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [actualizandoId, setActualizandoId] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_CONDUCTOR_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setConductores(await conductorService.listar());
    } catch {
      setError("No se pudieron cargar los conductores.");
    } finally {
      setCargando(false);
    }
  };

  if (conductores === null && !cargando && !error) {
    cargar();
  }

  const actualizarCampo = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const crearConductor = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setErrorForm(null);
    try {
      await conductorService.registrar(form);
      setForm(FORM_CONDUCTOR_INICIAL);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setErrorForm(err.mensaje || "No se pudo registrar el conductor.");
    } finally {
      setGuardando(false);
    }
  };

  const alternarEstado = async (conductor) => {
    setActualizandoId(conductor.idConductor);
    try {
      const actualizado = await conductorService.actualizarEstado(
        conductor.idConductor,
        conductor.estaActivo() ? "INACTIVO" : "ACTIVO"
      );
      setConductores((prev) =>
        prev.map((c) => (c.idConductor === actualizado.idConductor ? actualizado : c))
      );
    } catch {
      setError(`No se pudo actualizar el conductor #${conductor.idConductor}.`);
    } finally {
      setActualizandoId(null);
    }
  };

  return (
    <section className="admin__panel">
      <div className="admin__panel-header">
        <button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "Registrar conductor"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={crearConductor} className="admin__form">
          <label>
            Nombre completo
            <input value={form.nombreCompleto} onChange={actualizarCampo("nombreCompleto")} required />
          </label>
          <label>
            CI
            <input value={form.ci} onChange={actualizarCampo("ci")} required />
          </label>
          <label>
            Licencia de conducir
            <input value={form.licenciaConducir} onChange={actualizarCampo("licenciaConducir")} />
          </label>
          <label>
            Teléfono
            <input value={form.telefono} onChange={actualizarCampo("telefono")} />
          </label>
          {errorForm && <p className="error">{errorForm}</p>}
          <button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Registrar"}
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      {cargando || conductores === null ? (
        <p>Cargando conductores…</p>
      ) : (
        <table className="admin__tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Licencia</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conductores.map((c) => (
              <tr key={c.idConductor}>
                <td>{c.nombreCompleto}</td>
                <td>{c.licenciaConducir ?? "—"}</td>
                <td>{c.telefono ?? "—"}</td>
                <td>{c.estado}</td>
                <td>
                  <button disabled={actualizandoId === c.idConductor} onClick={() => alternarEstado(c)}>
                    {c.estaActivo() ? "Dar de baja" : "Reactivar"}
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
// Vehículos
// ------------------------------------------------------------------

const FORM_VEHICULO_INICIAL = {
  placa: "",
  rfidTag: "",
  tipoVehiculo: TIPOS_VEHICULO.LIVIANO,
  capacidadTanque: "",
  idConductor: "",
};

function TabVehiculos() {
  const [vehiculos, setVehiculos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [actualizandoPlaca, setActualizandoPlaca] = useState(null);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VEHICULO_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setVehiculos(await vehiculoService.listar());
    } catch {
      setError("No se pudieron cargar los vehículos.");
    } finally {
      setCargando(false);
    }
  };

  if (vehiculos === null && !cargando && !error) {
    cargar();
  }

  const actualizarCampo = (campo) => (e) =>
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const crearVehiculo = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setErrorForm(null);
    try {
      await vehiculoService.registrar({
        ...form,
        capacidadTanque: Number(form.capacidadTanque),
        idConductor: Number(form.idConductor),
      });
      setForm(FORM_VEHICULO_INICIAL);
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setErrorForm(err.mensaje || "No se pudo registrar el vehículo.");
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (vehiculo, nuevoEstado) => {
    setActualizandoPlaca(vehiculo.placa);
    try {
      const actualizado = await vehiculoService.actualizarEstado(vehiculo.placa, nuevoEstado);
      setVehiculos((prev) =>
        prev.map((v) => (v.placa === actualizado.placa ? actualizado : v))
      );
    } catch {
      setError(`No se pudo actualizar el vehículo ${vehiculo.placa}.`);
    } finally {
      setActualizandoPlaca(null);
    }
  };

  return (
    <section className="admin__panel">
      <div className="admin__panel-header">
        <button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "Registrar vehículo"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={crearVehiculo} className="admin__form">
          <label>
            Placa
            <input value={form.placa} onChange={actualizarCampo("placa")} required />
          </label>
          <label>
            Tag RFID
            <input value={form.rfidTag} onChange={actualizarCampo("rfidTag")} required />
          </label>
          <label>
            Tipo de vehículo
            <select value={form.tipoVehiculo} onChange={actualizarCampo("tipoVehiculo")}>
              {Object.values(TIPOS_VEHICULO).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Capacidad del tanque (L)
            <input
              type="number"
              min="0"
              value={form.capacidadTanque}
              onChange={actualizarCampo("capacidadTanque")}
              required
            />
          </label>
          <label>
            ID de conductor
            <input
              type="number"
              min="1"
              value={form.idConductor}
              onChange={actualizarCampo("idConductor")}
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

      {cargando || vehiculos === null ? (
        <p>Cargando vehículos…</p>
      ) : (
        <table className="admin__tabla">
          <thead>
            <tr>
              <th>Placa</th>
              <th>RFID</th>
              <th>Tipo</th>
              <th>Capacidad</th>
              <th>Conductor</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => (
              <tr key={v.placa} className={v.estaBloqueado() ? "fila-critica" : ""}>
                <td>{v.placa}</td>
                <td>{v.rfidTag}</td>
                <td>{v.tipoVehiculo}</td>
                <td>{v.capacidadTanque.toLocaleString("es-BO")} L</td>
                <td>{v.conductorNombre ?? "—"}</td>
                <td>{v.estado}</td>
                <td className="admin__acciones">
                  {Object.values(ESTADOS_VEHICULO)
                    .filter((estado) => estado !== v.estado)
                    .map((estado) => (
                      <button
                        key={estado}
                        disabled={actualizandoPlaca === v.placa}
                        onClick={() => cambiarEstado(v, estado)}
                      >
                        {estado}
                      </button>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default AdminDashboard;
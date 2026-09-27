import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DespachosService from "../../services/DespachoSrevice";
import CuposService from "../../services/CuposService";
import ApoyoOperadorService from "../../services/ApoyoOperadorService";
import { METODOS_IDENTIFICACION_SUGERIDOS } from "../../models/Despacho";

const despachosService = new DespachosService();
const cuposService = new CuposService();
const apoyoService = new ApoyoOperadorService();

const FORM_VACIO = {
  rfidTagOPlaca: "",
  idSurtidor: "",
  idConductor: "",
  volumenDespachado: "",
  metodoIdentificacion: METODOS_IDENTIFICACION_SUGERIDOS[0],
};

/**
 * DespachoForm
 * ------------------------------------------------------------------
 * `onDespachoRegistrado` lo dispara el padre (OperadorDashboard) para
 * refrescar la tabla de despachos sin recargar toda la pantalla.
 *
 * El semáforo de cupo es solo feedback en pantalla: la autorización
 * real ocurre en el POST /despachos del backend, que puede denegar
 * el despacho aunque el semáforo haya salido verde (ej. si otro
 * surtidor consumió el cupo justo antes).
 */
function DespachoForm({ onDespachoRegistrado }) {
  const { usuario } = useAuth();
  const [form, setForm] = useState(FORM_VACIO);
  const [surtidores, setSurtidores] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [cargandoApoyo, setCargandoApoyo] = useState(true);
  const [semaforo, setSemaforo] = useState(null); // { autorizado, mensaje } | null
  const [verificandoCupo, setVerificandoCupo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  useEffect(() => {
    Promise.all([apoyoService.listarSurtidores(), apoyoService.listarConductores()])
      .then(([surtidoresData, conductoresData]) => {
        setSurtidores(surtidoresData);
        setConductores(conductoresData);
      })
      .catch(() => setError("No se pudieron cargar surtidores/conductores."))
      .finally(() => setCargandoApoyo(false));
  }, []);

  const actualizarCampo = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setSemaforo(null);
    setMensajeExito(null);
  };

  const verificarCupo = async () => {
    if (!form.rfidTagOPlaca) return;

    setVerificandoCupo(true);
    setError(null);
    try {
      const resultado = await cuposService.validarPorRfid(
        form.rfidTagOPlaca,
        form.volumenDespachado || undefined
      );
      setSemaforo(resultado);
    } catch {
      setSemaforo({ autorizado: false, mensaje: "No se pudo verificar el cupo." });
    } finally {
      setVerificandoCupo(false);
    }
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const despacho = await despachosService.registrar({
        idSurtidor: Number(form.idSurtidor),
        rfidTagOPlaca: form.rfidTagOPlaca,
        idConductor: Number(form.idConductor),
        idUsuarioOperador: usuario?.idUsuario,
        volumenDespachado: Number(form.volumenDespachado),
        metodoIdentificacion: form.metodoIdentificacion,
      });

      setMensajeExito(`Despacho #${despacho.idDespacho} autorizado correctamente.`);
      setForm(FORM_VACIO);
      setSemaforo(null);
      onDespachoRegistrado?.(despacho);
    } catch (err) {
      setError(err.mensaje || "No se pudo registrar el despacho.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="despacho-form">
      <h2>Nuevo despacho</h2>

      <label>
        RFID o placa del vehículo
        <div className="despacho-form__rfid">
          <input
            type="text"
            value={form.rfidTagOPlaca}
            onChange={(e) => actualizarCampo("rfidTagOPlaca", e.target.value)}
            required
          />
          <button
            type="button"
            onClick={verificarCupo}
            disabled={!form.rfidTagOPlaca || verificandoCupo}
          >
            {verificandoCupo ? "Verificando…" : "Verificar cupo"}
          </button>
        </div>
      </label>

      {semaforo && (
        <p className={semaforo.autorizado ? "semaforo semaforo--ok" : "semaforo semaforo--bloqueado"}>
          {semaforo.autorizado ? "🟢" : "🔴"} {semaforo.mensaje}
          {semaforo.volumen_disponible !== undefined &&
            ` (disponible: ${semaforo.volumen_disponible} L)`}
        </p>
      )}

      <label>
        Surtidor
        <select
          value={form.idSurtidor}
          onChange={(e) => actualizarCampo("idSurtidor", e.target.value)}
          required
          disabled={cargandoApoyo}
        >
          <option value="" disabled>
            {cargandoApoyo ? "Cargando…" : "Seleccione un surtidor"}
          </option>
          {surtidores.map((s) => (
            <option key={s.idSurtidor} value={s.idSurtidor}>
              {s.nombreEstacion ? `${s.nombreEstacion} · ` : ""}Surtidor {s.numeroSurtidor} (
              {s.tipoCombustible})
            </option>
          ))}
        </select>
      </label>

      <label>
        Conductor
        <select
          value={form.idConductor}
          onChange={(e) => actualizarCampo("idConductor", e.target.value)}
          required
          disabled={cargandoApoyo}
        >
          <option value="" disabled>
            {cargandoApoyo ? "Cargando…" : "Seleccione un conductor"}
          </option>
          {conductores.map((c) => (
            <option key={c.idConductor} value={c.idConductor}>
              {c.nombreCompleto} (CI {c.ci})
            </option>
          ))}
        </select>
      </label>

      <label>
        Volumen a despachar (litros)
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={form.volumenDespachado}
          onChange={(e) => actualizarCampo("volumenDespachado", e.target.value)}
          required
        />
      </label>

      <label>
        Método de identificación
        <select
          value={form.metodoIdentificacion}
          onChange={(e) => actualizarCampo("metodoIdentificacion", e.target.value)}
        >
          {METODOS_IDENTIFICACION_SUGERIDOS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="error">{error}</p>}
      {mensajeExito && <p className="exito">{mensajeExito}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? "Registrando…" : "Confirmar despacho"}
      </button>
    </form>
  );
}

export default DespachoForm;
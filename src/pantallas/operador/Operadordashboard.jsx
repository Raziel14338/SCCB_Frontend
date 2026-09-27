import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import CupoService from "../../services/CupoService";

const cupoService = new CupoService();

/**
 * OperadorDashboard — Panel de Despacho (OPERADOR_YPFB)
 * ------------------------------------------------------------------
 * Flujo del surtidor, fiel a cómo lo separa el backend:
 *   1. "Verificar" -> GET /cupos/validar/:rfid_tag?volumen=N
 *      (CupoService.validarRfid). Es de SOLO LECTURA — no descuenta
 *      nada — y sirve de semáforo antes de vender: confirma placa,
 *      estado del vehículo y si el volumen pedido entra en el cupo
 *      disponible.
 *   2. "Confirmar despacho" -> POST /cupos/vehiculo/:placa/validar-
 *      despacho (CupoService.validarDespacho). Esta es la operación
 *      real y atómica que autoriza y descuenta el cupo (vía stored
 *      procedure en el backend). Solo se habilita si el paso 1 dio
 *      semáforo verde.
 *
 * Tras cada despacho confirmado (autorizado o no) se limpia el
 * estado para forzar una nueva verificación por vehículo.
 */
function OperadorDashboard() {
  const { usuario, logout } = useAuth();

  const [rfidTag, setRfidTag] = useState("");
  const [volumenSolicitado, setVolumenSolicitado] = useState("");

  const [validando, setValidando] = useState(false);
  const [validacion, setValidacion] = useState(null);
  const [errorValidacion, setErrorValidacion] = useState(null);

  const [despachando, setDespachando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorDespacho, setErrorDespacho] = useState(null);

  const verificar = async (evento) => {
    evento.preventDefault();
    const tag = rfidTag.trim();
    if (!tag) return;

    setValidando(true);
    setErrorValidacion(null);
    setResultado(null);
    try {
      const datos = await cupoService.validarRfid(
        tag,
        volumenSolicitado ? Number(volumenSolicitado) : null
      );
      setValidacion(datos);
    } catch {
      setErrorValidacion("No se pudo verificar el tag. Reintenta.");
      setValidacion(null);
    } finally {
      setValidando(false);
    }
  };

  const confirmarDespacho = async () => {
    if (!validacion?.placa || !volumenSolicitado) return;

    setDespachando(true);
    setErrorDespacho(null);
    try {
      const res = await cupoService.validarDespacho(
        validacion.placa,
        Number(volumenSolicitado)
      );
      setResultado(res);
      // Fuerza una nueva verificación para el próximo despacho.
      setValidacion(null);
      setRfidTag("");
      setVolumenSolicitado("");
    } catch {
      setErrorDespacho("No se pudo registrar el despacho.");
    } finally {
      setDespachando(false);
    }
  };

  return (
    <div className="panel-despacho">
      <h1>Panel Operador (YPFB)</h1>
      <p>Bienvenido, {usuario?.nombreCompleto}</p>

      <section className="panel-despacho__validacion">
        <h2>1. Verificar cupo</h2>
        <form onSubmit={verificar} className="panel-despacho__form-tag">
          <label>
            Tag RFID
            <input
              type="text"
              value={rfidTag}
              onChange={(e) => setRfidTag(e.target.value)}
              placeholder="Escanear o ingresar tag"
              required
            />
          </label>
          <label>
            Volumen a despachar (L)
            <input
              type="number"
              min="0"
              step="1"
              value={volumenSolicitado}
              onChange={(e) => setVolumenSolicitado(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={validando}>
            {validando ? "Verificando…" : "Verificar"}
          </button>
        </form>

        {errorValidacion && <p className="error">{errorValidacion}</p>}

        {validacion && (
          <div
            className={`panel-despacho__semaforo ${
              validacion.autorizado
                ? "panel-despacho__semaforo--verde"
                : "panel-despacho__semaforo--rojo"
            }`}
          >
            {validacion.tagReconocido() ? (
              <>
                <span>
                  Vehículo <strong>{validacion.placa}</strong> ({validacion.vehiculoEstado})
                </span>
                {validacion.sinCupoVigente() ? (
                  <span>Sin cupo vigente para el periodo actual.</span>
                ) : (
                  <span>
                    Disponible: {validacion.volumenDisponible?.toLocaleString("es-BO")} L de{" "}
                    {validacion.volumenAutorizado?.toLocaleString("es-BO")} L
                  </span>
                )}
              </>
            ) : (
              <span>No existe un vehículo con ese RFID.</span>
            )}
            <span>{validacion.mensaje}</span>

            {validacion.autorizado && (
              <button onClick={confirmarDespacho} disabled={despachando}>
                {despachando ? "Confirmando…" : "Confirmar despacho"}
              </button>
            )}
          </div>
        )}

        {errorDespacho && <p className="error">{errorDespacho}</p>}
      </section>

      {resultado && (
        <div
          className={`panel-despacho__resultado ${
            resultado.autorizado
              ? "panel-despacho__resultado--autorizado"
              : "panel-despacho__resultado--denegado"
          }`}
        >
          <strong>{resultado.autorizado ? "Despacho autorizado" : "Despacho denegado"}</strong>
          <span>{resultado.mensaje}</span>
          {resultado.idCupo && <span>Cupo #{resultado.idCupo}</span>}
        </div>
      )}

      <button className="panel-despacho__logout" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default OperadorDashboard;
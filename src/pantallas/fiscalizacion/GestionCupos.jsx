import { useState } from "react";
import CupoService from "../../services/CupoService";
import { PERIODOS_CUPO } from "../../models/Cupo";

const cupoService = new CupoService();

const FORM_INICIAL = {
  volumenAutorizado: "",
  periodo: PERIODOS_CUPO.MENSUAL,
  fechaInicio: "",
  fechaFin: "",
};

/**
 * GestionCupos
 * ------------------------------------------------------------------
 * Pantalla del fiscalizador para consultar y asignar cupos por
 * vehículo. El buscador consulta el cupo vigente
 * (GET /cupos/vehiculo/:placa/vigente) y el historial completo
 * (GET /cupos/vehiculo/:placa) para la placa ingresada; el formulario
 * integrado asigna un cupo nuevo (POST /cupos) y refresca ambas
 * consultas al terminar.
 */
function GestionCupos() {
  const [placaBuscada, setPlacaBuscada] = useState("");
  const [placaConsultada, setPlacaConsultada] = useState(null);
  const [vigente, setVigente] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(null);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState(null);

  const buscarPorPlaca = async (evento) => {
    evento.preventDefault();
    const placa = placaBuscada.trim().toUpperCase();
    if (!placa) return;

    setBuscando(true);
    setErrorBusqueda(null);
    try {
      const [cupoVigente, cupoHistorial] = await Promise.all([
        cupoService.obtenerVigente(placa),
        cupoService.obtenerHistorial(placa),
      ]);
      setVigente(cupoVigente);
      setHistorial(cupoHistorial);
      setPlacaConsultada(placa);
    } catch {
      setErrorBusqueda(`No se pudo consultar el vehículo ${placa}.`);
      setVigente(null);
      setHistorial([]);
      setPlacaConsultada(null);
    } finally {
      setBuscando(false);
    }
  };

  const actualizarCampoForm = (campo) => (evento) => {
    setForm((prev) => ({ ...prev, [campo]: evento.target.value }));
  };

  const asignarCupo = async (evento) => {
    evento.preventDefault();
    if (!placaConsultada) return;

    setGuardando(true);
    setErrorFormulario(null);
    try {
      await cupoService.registrar({
        placa: placaConsultada,
        volumenAutorizado: Number(form.volumenAutorizado),
        periodo: form.periodo,
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
      });

      // Refresca vigente + historial con el cupo recién creado.
      const [cupoVigente, cupoHistorial] = await Promise.all([
        cupoService.obtenerVigente(placaConsultada),
        cupoService.obtenerHistorial(placaConsultada),
      ]);
      setVigente(cupoVigente);
      setHistorial(cupoHistorial);
      setForm(FORM_INICIAL);
      setMostrarFormulario(false);
    } catch {
      setErrorFormulario("No se pudo asignar el cupo. Revisa los datos ingresados.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="gestion-cupos">
      <h1>Gestión de Cupos</h1>

      <form onSubmit={buscarPorPlaca} className="gestion-cupos__buscador">
        <label>
          Placa del vehículo
          <input
            type="text"
            value={placaBuscada}
            onChange={(e) => setPlacaBuscada(e.target.value)}
            placeholder="Ej: 1234-ABC"
            required
          />
        </label>
        <button type="submit" disabled={buscando}>
          {buscando ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {errorBusqueda && <p className="error">{errorBusqueda}</p>}

      {placaConsultada && (
        <>
          <section className="gestion-cupos__vigente">
            <div className="gestion-cupos__vigente-header">
              <h2>Cupo vigente — {placaConsultada}</h2>
              <button onClick={() => setMostrarFormulario((v) => !v)}>
                {mostrarFormulario ? "Cancelar" : "Asignar nuevo cupo"}
              </button>
            </div>

            {vigente ? (
              <div className="gestion-cupos__tarjeta-vigente">
                <span>
                  <strong>{vigente.volumenAutorizado.toLocaleString("es-BO")} L</strong>{" "}
                  autorizados ({vigente.periodo})
                </span>
                <span>
                  Vigencia: {vigente.fechaInicio?.toLocaleDateString("es-BO")} al{" "}
                  {vigente.fechaFin?.toLocaleDateString("es-BO")}
                </span>
                {vigente.porcentajeConsumido != null && (
                  <span>Consumido: {vigente.porcentajeConsumido}%</span>
                )}
              </div>
            ) : (
              <p>Este vehículo no tiene un cupo vigente.</p>
            )}
          </section>

          {mostrarFormulario && (
            <form onSubmit={asignarCupo} className="gestion-cupos__form">
              <label>
                Volumen autorizado (L)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.volumenAutorizado}
                  onChange={actualizarCampoForm("volumenAutorizado")}
                  required
                />
              </label>
              <label>
                Periodo
                <select value={form.periodo} onChange={actualizarCampoForm("periodo")}>
                  {Object.values(PERIODOS_CUPO).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fecha inicio
                <input
                  type="date"
                  value={form.fechaInicio}
                  onChange={actualizarCampoForm("fechaInicio")}
                  required
                />
              </label>
              <label>
                Fecha fin
                <input
                  type="date"
                  value={form.fechaFin}
                  onChange={actualizarCampoForm("fechaFin")}
                  required
                />
              </label>

              {errorFormulario && <p className="error">{errorFormulario}</p>}

              <button type="submit" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar cupo"}
              </button>
            </form>
          )}

          <section className="gestion-cupos__historial">
            <h2>Historial de cupos</h2>
            {historial.length === 0 ? (
              <p>Este vehículo no tiene cupos registrados.</p>
            ) : (
              <table className="gestion-cupos__tabla">
                <thead>
                  <tr>
                    <th>Periodo</th>
                    <th>Volumen autorizado</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((cupo) => (
                    <tr key={cupo.idCupo ?? `${cupo.fechaInicio}-${cupo.fechaFin}`}>
                      <td>{cupo.periodo}</td>
                      <td>{cupo.volumenAutorizado.toLocaleString("es-BO")} L</td>
                      <td>{cupo.fechaInicio?.toLocaleDateString("es-BO")}</td>
                      <td>{cupo.fechaFin?.toLocaleDateString("es-BO")}</td>
                      <td>{cupo.estado ?? (cupo.estaVigentePorFecha() ? "VIGENTE" : "VENCIDO")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default GestionCupos;
import { useEffect, useState } from "react";
import ReportesService from "../../services/ReportesService";
import StatCard from "../../components/StatCard";
import BarChart from "../../components/BarChart";

const reportesService = new ReportesService();

/**
 * DashboardPantalla
 * ------------------------------------------------------------------
 * Consume GET /reportes/estadisticas (por día) y
 * GET /reportes/cruce-volumetrico (por rango) con filtros de fecha.
 * Sin fechas, el backend usa "hoy" y todo el historial.
 */
function DashboardPantalla() {
  const [fecha, setFecha] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const [estadisticas, setEstadisticas] = useState(null);
  const [cruce, setCruce] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const rangoInvalido = fechaInicio && fechaFin && fechaInicio > fechaFin;

  useEffect(() => {
    if (rangoInvalido) return;
    let activo = true;
    setCargando(true);
    setError(null);

    Promise.all([
      reportesService.obtenerEstadisticasGenerales(fecha || undefined),
      reportesService.obtenerCruceVolumetrico({
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      }),
    ])
      .then(([est, cru]) => {
        if (!activo) return;
        setEstadisticas(est);
        setCruce(cru);
      })
      .catch((err) => activo && setError(err.mensaje || "No se pudieron cargar las estadísticas."))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, [fecha, fechaInicio, fechaFin, rangoInvalido]);

  const limpiar = () => {
    setFecha("");
    setFechaInicio("");
    setFechaFin("");
  };

  const datosGrafico =
    cruce?.filas.slice(0, 8).map((f) => ({
      etiqueta: f.placaCisterna ?? `Cisterna ${f.idCisterna}`,
      valor: f.diferenciaLitros,
    })) ?? [];

  return (
    <div className="dashboard">
      <div className="dashboard__filtros">
        <label>
          Estadísticas del día
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </label>
        <label>
          Cruce desde
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        </label>
        <label>
          Cruce hasta
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </label>
        <button type="button" onClick={limpiar}>
          Limpiar filtros
        </button>
      </div>

      {rangoInvalido && (
        <p className="error">La fecha de inicio no puede ser posterior a la fecha final.</p>
      )}
      {error && <p className="error">{error}</p>}
      {cargando && <p>Cargando panel de control…</p>}

      {!cargando && !error && estadisticas && cruce && (
        <>
          <h1>Panel de control — {estadisticas.fecha}</h1>

          <section className="stat-grid">
            <StatCard
              etiqueta="Volumen despachado"
              valor={`${estadisticas.volumenDespachadoLitros.toLocaleString("es-BO")} L`}
            />
            <StatCard
              etiqueta="Alertas críticas abiertas"
              valor={estadisticas.alertasCriticasAbiertas}
              tono={estadisticas.alertasCriticasAbiertas > 0 ? "alerta" : "neutro"}
            />
            <StatCard etiqueta="Cisternas en ruta" valor={estadisticas.cisternasEnRuta} />
            <StatCard
              etiqueta="Despachos del día"
              valor={estadisticas.despachos.total}
              detalle={`${estadisticas.despachos.autorizados} autorizados, ${estadisticas.despachos.denegados} denegados (${estadisticas.tasaAutorizacion}%)`}
            />
            <StatCard
              etiqueta="Vehículos bloqueados"
              valor={estadisticas.vehiculosBloqueados}
              tono={estadisticas.vehiculosBloqueados > 0 ? "alerta" : "neutro"}
            />
          </section>

          <section className="dashboard__cruce">
            <div className="dashboard__cruce-header">
              <h2>Cruce volumétrico: mayor merma</h2>
              <span>
                {cruce.totalRegistros} registros, {cruce.totalMermaLitros.toLocaleString("es-BO")} L
                de merma total
              </span>
            </div>
            <BarChart
              datos={datosGrafico}
              colorBarra="#f87171"
              formatoValor={(v) => `${v.toLocaleString("es-BO")} L`}
            />
          </section>
        </>
      )}
    </div>
  );
}

export default DashboardPantalla;
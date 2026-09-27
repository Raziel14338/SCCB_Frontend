import { useEffect, useState } from "react";
import ReportesService from "../../services/ReportesService";
import StatCard from "../../components/StatCard";
import BarChart from "../../components/BarChart";

const reportesService = new ReportesService();

/**
 * DashboardPantalla
 * ------------------------------------------------------------------
 * Consume GET /reportes/estadisticas y GET /reportes/cruce-volumetrico
 * en paralelo. Todo el cálculo (tasa de autorización, top de merma)
 * vive en los Models (EstadisticasGenerales, CruceVolumetrico); este
 * componente solo pide los datos y decide qué tarjetas/gráfico pintar.
 */
function DashboardPantalla() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [cruce, setCruce] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    Promise.all([
      reportesService.obtenerEstadisticasGenerales(),
      reportesService.obtenerCruceVolumetrico(),
    ])
      .then(([estadisticasData, cruceData]) => {
        if (!activo) return;
        setEstadisticas(estadisticasData);
        setCruce(cruceData);
      })
      .catch(() => activo && setError("No se pudieron cargar las estadísticas."))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) return <p>Cargando panel de control…</p>;
  if (error) return <p className="error">{error}</p>;

  // Top 8 por merma para no saturar el gráfico (el backend ya ordena
  // DESC por diferencia_litros).
  const datosGrafico = cruce.filas.slice(0, 8).map((fila) => ({
    etiqueta: fila.placaCisterna ?? `Cisterna ${fila.idCisterna}`,
    valor: fila.diferenciaLitros,
  }));

  return (
    <div className="dashboard">
      <h1>Panel de Control — {estadisticas.fecha}</h1>

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
          detalle={`${estadisticas.despachos.autorizados} autorizados · ${estadisticas.despachos.denegados} denegados (${estadisticas.tasaAutorizacion}%)`}
        />
        <StatCard
          etiqueta="Vehículos bloqueados"
          valor={estadisticas.vehiculosBloqueados}
          tono={estadisticas.vehiculosBloqueados > 0 ? "alerta" : "neutro"}
        />
      </section>

      <section className="dashboard__cruce">
        <div className="dashboard__cruce-header">
          <h2>Cruce volumétrico — mayor merma</h2>
          <span>
            {cruce.totalRegistros} registros · {cruce.totalMermaLitros.toLocaleString("es-BO")} L
            de merma total
          </span>
        </div>
        <BarChart
          datos={datosGrafico}
          colorBarra="#f87171"
          formatoValor={(v) => `${v.toLocaleString("es-BO")} L`}
        />
      </section>
    </div>
  );
}

export default DashboardPantalla;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ReportesService from "../../services/ReportesService";
import StatCard from "../../components/StatCard";
import BarChart from "../../components/BarChart";

const reportesService = new ReportesService();

/**
 * FiscalizacionDashboard
 * ------------------------------------------------------------------
 * Panel de auditoría/cruce volumétrico para el rol FISCAL_ANH.
 * Consume el mismo GET /reportes/cruce-volumetrico que ya usa el
 * dashboard general (vía ReportesService.obtenerCruceVolumetrico),
 * pero con foco fiscalizador: resalta las filas con merma irregular
 * (FilaCruceVolumetrico.esMermaAlta()) y da acceso a la gestión de
 * cupos por vehículo.
 */
function FiscalizacionDashboard() {
  const [cruce, setCruce] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    reportesService
      .obtenerCruceVolumetrico()
      .then((data) => activo && setCruce(data))
      .catch(() => activo && setError("No se pudo cargar el cruce volumétrico."))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, []);

  if (cargando) return <p>Cargando panel de fiscalización…</p>;
  if (error) return <p className="error">{error}</p>;

  const filasMermaAlta = cruce.filas.filter((fila) => fila.esMermaAlta());

  // Top 8 por merma para el gráfico, igual criterio que el dashboard general.
  const datosGrafico = cruce.filas.slice(0, 8).map((fila) => ({
    etiqueta: fila.placaCisterna ?? `Cisterna ${fila.idCisterna}`,
    valor: fila.diferenciaLitros,
  }));

  return (
    <div className="fiscalizacion">
      <div className="fiscalizacion__header">
        <h1>Panel de Fiscalización (ANH)</h1>
        <Link to="/fiscalizacion/cupos" className="fiscalizacion__link-cupos">
          Gestión de Cupos
        </Link>
      </div>

      <section className="stat-grid">
        <StatCard
          etiqueta="Registros cruzados"
          valor={cruce.totalRegistros}
        />
        <StatCard
          etiqueta="Merma total"
          valor={`${cruce.totalMermaLitros.toLocaleString("es-BO")} L`}
        />
        <StatCard
          etiqueta="Mermas irregulares (≥5%)"
          valor={filasMermaAlta.length}
          tono={filasMermaAlta.length > 0 ? "alerta" : "neutro"}
        />
      </section>

      <section className="fiscalizacion__cruce">
        <h2>Cruce volumétrico — mayor merma</h2>
        <BarChart
          datos={datosGrafico}
          colorBarra="#f87171"
          formatoValor={(v) => `${v.toLocaleString("es-BO")} L`}
        />
      </section>

      <section className="fiscalizacion__detalle">
        <h2>Detalle de cruce</h2>
        {cruce.filas.length === 0 ? (
          <p>No hay registros de cruce volumétrico para el periodo.</p>
        ) : (
          <table className="fiscalizacion__tabla">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Cisterna</th>
                <th>Combustible</th>
                <th>Salida</th>
                <th>Llegada</th>
                <th>Diferencia</th>
                <th>Merma %</th>
              </tr>
            </thead>
            <tbody>
              {cruce.filas.map((fila) => (
                <tr
                  key={fila.documentoReferencia}
                  className={fila.esMermaAlta() ? "fila-merma-alta" : ""}
                >
                  <td>{fila.documentoReferencia}</td>
                  <td>{fila.placaCisterna ?? `Cisterna ${fila.idCisterna}`}</td>
                  <td>{fila.tipoCombustible}</td>
                  <td>{fila.volumenSalida.toLocaleString("es-BO")} L</td>
                  <td>{fila.volumenLlegada.toLocaleString("es-BO")} L</td>
                  <td>{fila.diferenciaLitros.toLocaleString("es-BO")} L</td>
                  <td>{fila.porcentajeMerma}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default FiscalizacionDashboard;
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReportesService from "../../services/ReportesService";
import StatCard from "../../components/StatCard";
import BarChart from "../../components/BarChart";

const reportesService = new ReportesService();

const COLUMNAS_CSV = [
  ["documento_referencia", (f) => f.documentoReferencia],
  ["cisterna", (f) => f.placaCisterna ?? `Cisterna ${f.idCisterna}`],
  ["combustible", (f) => f.tipoCombustible],
  ["volumen_salida_l", (f) => f.volumenSalida],
  ["volumen_llegada_l", (f) => f.volumenLlegada],
  ["diferencia_l", (f) => f.diferenciaLitros],
  ["merma_pct", (f) => f.porcentajeMerma],
];

// Escapa comillas y separadores para que Excel abra bien el archivo.
const celda = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function descargarCsv(filas, nombre) {
  const encabezado = COLUMNAS_CSV.map(([titulo]) => celda(titulo)).join(",");
  const cuerpo = filas.map((f) => COLUMNAS_CSV.map(([, fn]) => celda(fn(f))).join(","));
  // BOM para que Excel respete los acentos.
  const blob = new Blob(["\ufeff" + [encabezado, ...cuerpo].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

/**
 * FiscalizacionDashboard
 * ------------------------------------------------------------------
 * Auditoría del cruce volumétrico para FISCAL_ANH: filtro por
 * periodo, opción de ver solo mermas irregulares (>= 5 %), exportar
 * a CSV y acceso directo a alertas y cupos.
 */
function FiscalizacionDashboard() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [soloIrregulares, setSoloIrregulares] = useState(false);

  const [cruce, setCruce] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const rangoInvalido = fechaInicio && fechaFin && fechaInicio > fechaFin;

  useEffect(() => {
    if (rangoInvalido) return;
    let activo = true;
    setCargando(true);
    setError(null);

    reportesService
      .obtenerCruceVolumetrico({
        fechaInicio: fechaInicio || undefined,
        fechaFin: fechaFin || undefined,
      })
      .then((data) => activo && setCruce(data))
      .catch((err) => activo && setError(err.mensaje || "No se pudo cargar el cruce volumétrico."))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, [fechaInicio, fechaFin, rangoInvalido]);

  const filasMermaAlta = useMemo(() => cruce?.filas.filter((f) => f.esMermaAlta()) ?? [], [cruce]);
  const filasVisibles = soloIrregulares ? filasMermaAlta : cruce?.filas ?? [];

  const datosGrafico = filasVisibles.slice(0, 8).map((f) => ({
    etiqueta: f.placaCisterna ?? `Cisterna ${f.idCisterna}`,
    valor: f.diferenciaLitros,
  }));

  const exportar = () => {
    const sufijo = [fechaInicio, fechaFin].filter(Boolean).join("_a_") || "completo";
    descargarCsv(filasVisibles, `cruce-volumetrico-${sufijo}.csv`);
  };

  return (
    <div className="fiscalizacion">
      <div className="fiscalizacion__header">
        <h1>Panel de fiscalización (ANH)</h1>
        <Link to="/fiscalizacion/cupos">Gestión de cupos</Link>
        <Link to="/alertas">Ver alertas</Link>
      </div>

      <div className="dashboard__filtros">
        <label>
          Desde
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        </label>
        <label>
          Hasta
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </label>
        <label>
          <input
            type="checkbox"
            checked={soloIrregulares}
            onChange={(e) => setSoloIrregulares(e.target.checked)}
          />{" "}
          Solo mermas irregulares (5 % o más)
        </label>
        <button type="button" onClick={exportar} disabled={filasVisibles.length === 0}>
          Exportar CSV
        </button>
      </div>

      {rangoInvalido && (
        <p className="error">La fecha de inicio no puede ser posterior a la fecha final.</p>
      )}
      {error && <p className="error">{error}</p>}
      {cargando && <p>Cargando panel de fiscalización…</p>}

      {!cargando && !error && cruce && (
        <>
          <section className="stat-grid">
            <StatCard etiqueta="Registros cruzados" valor={cruce.totalRegistros} />
            <StatCard
              etiqueta="Merma total"
              valor={`${cruce.totalMermaLitros.toLocaleString("es-BO")} L`}
            />
            <StatCard
              etiqueta="Mermas irregulares (5 % o más)"
              valor={filasMermaAlta.length}
              tono={filasMermaAlta.length > 0 ? "alerta" : "neutro"}
            />
          </section>

          <section className="fiscalizacion__cruce">
            <h2>Cruce volumétrico: mayor merma</h2>
            <BarChart
              datos={datosGrafico}
              colorBarra="#f87171"
              formatoValor={(v) => `${v.toLocaleString("es-BO")} L`}
            />
          </section>

          <section className="fiscalizacion__detalle">
            <h2>Detalle de cruce</h2>
            {filasVisibles.length === 0 ? (
              <p>
                {soloIrregulares
                  ? "No hay mermas irregulares en este periodo."
                  : "No hay registros de cruce volumétrico para el periodo."}
              </p>
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
                    <th>Merma</th>
                  </tr>
                </thead>
                <tbody>
                  {filasVisibles.map((f, i) => (
                    <tr
                      key={`${f.documentoReferencia}-${f.idCisterna}-${i}`}
                      className={f.esMermaAlta() ? "fila-merma-alta" : ""}
                    >
                      <td>{f.documentoReferencia}</td>
                      <td>{f.placaCisterna ?? `Cisterna ${f.idCisterna}`}</td>
                      <td>{f.tipoCombustible}</td>
                      <td>{f.volumenSalida.toLocaleString("es-BO")} L</td>
                      <td>{f.volumenLlegada.toLocaleString("es-BO")} L</td>
                      <td>{f.diferenciaLitros.toLocaleString("es-BO")} L</td>
                      <td>{f.porcentajeMerma}%</td>
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

export default FiscalizacionDashboard;
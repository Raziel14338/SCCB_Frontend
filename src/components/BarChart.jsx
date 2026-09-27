/**
 * BarChart
 * ------------------------------------------------------------------
 * Gráfico de barras minimalista con divs + CSS, sin librerías
 * externas (evita fijar de entrada una dependencia como recharts que
 * quizás no quieras agregar todavía). `datos` es un array de
 * { etiqueta, valor }; `alturaPx` y `colorBarra` son opcionales.
 *
 * Pensado para volúmenes chicos de puntos (ej. top 8-10 cisternas
 * con más merma), no para series largas — para eso conviene
 * reemplazarlo más adelante por una librería de charts dedicada.
 */
function BarChart({ datos, alturaPx = 200, colorBarra = "#4cc9f0", formatoValor }) {
  if (!datos || datos.length === 0) {
    return <p className="bar-chart__vacio">Sin datos para graficar.</p>;
  }

  const maximo = Math.max(...datos.map((d) => d.valor), 1);
  const anchoBarra = 100 / datos.length;

  return (
    <div className="bar-chart" style={{ height: alturaPx }}>
      {datos.map((d, i) => {
        const alturaPct = (d.valor / maximo) * 100;
        return (
          <div
            key={`${d.etiqueta}-${i}`}
            className="bar-chart__columna"
            style={{ width: `${anchoBarra}%` }}
          >
            <span className="bar-chart__valor">
              {formatoValor ? formatoValor(d.valor) : d.valor}
            </span>
            <div
              className="bar-chart__barra"
              style={{ height: `${alturaPct}%`, background: colorBarra }}
              title={`${d.etiqueta}: ${d.valor}`}
            />
            <span className="bar-chart__etiqueta">{d.etiqueta}</span>
          </div>
        );
      })}
    </div>
  );
}

export default BarChart;
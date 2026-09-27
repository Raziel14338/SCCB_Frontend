/**
 * StatCard
 * ------------------------------------------------------------------
 * Tarjeta simple para las métricas de resumen del dashboard.
 * `tono` solo aporta una clase CSS para distinguir severidad
 * (ej. "alerta" para las tarjetas críticas) — la lógica de qué tono
 * usar la decide quien la instancia, no el componente.
 */
function StatCard({ etiqueta, valor, detalle = null, tono = "neutro" }) {
  return (
    <div className={`stat-card stat-card--${tono}`}>
      <span className="stat-card__etiqueta">{etiqueta}</span>
      <span className="stat-card__valor">{valor}</span>
      {detalle && <span className="stat-card__detalle">{detalle}</span>}
    </div>
  );
}

export default StatCard;
export const TIPOS_COMBUSTIBLE = Object.freeze({
  GASOLINA_ESPECIAL: "GASOLINA_ESPECIAL",
  DIESEL_OIL: "DIESEL_OIL",
  GNV: "GNV",
});
// SUPUESTO: infraestructuracontroller.js solo exige que tipo_combustible
// venga informado, sin listar el ENUM. Los tres valores de arriba son un
// punto de partida razonable para YPFB/Bolivia — ajustar a los valores
// reales de la tabla `surtidores` (y de paso reutilizar la misma lista
// en el formulario de Despacho, que hoy recibe tipo_combustible como
// texto libre).

/**
 * Surtidor
 * ------------------------------------------------------------------
 * Mapea una fila de `surtidores`. `nombreEstacion` solo viene
 * informado cuando el listado es GET /obtener/surtidores (que hace
 * JOIN con estaciones_servicio); en GET /estaciones/:id/surtidores
 * queda null porque ya se conoce la estación por contexto.
 */
class Surtidor {
  constructor({
    idSurtidor,
    idEstacion,
    numeroSurtidor,
    tipoCombustible,
    tieneOcr = false,
    tieneRfid = false,
    estado,
    nombreEstacion = null,
  } = {}) {
    this.idSurtidor = idSurtidor;
    this.idEstacion = idEstacion;
    this.numeroSurtidor = numeroSurtidor;
    this.tipoCombustible = tipoCombustible;
    this.tieneOcr = Boolean(tieneOcr);
    this.tieneRfid = Boolean(tieneRfid);
    this.estado = estado;
    this.nombreEstacion = nombreEstacion;
  }

  static fromApi(data) {
    if (!data) return null;
    return new Surtidor({
      idSurtidor: data.id_surtidor,
      idEstacion: data.id_estacion,
      numeroSurtidor: data.numero_surtidor,
      tipoCombustible: data.tipo_combustible,
      tieneOcr: data.tiene_ocr,
      tieneRfid: data.tiene_rfid,
      estado: data.estado,
      nombreEstacion: data.nombre_estacion ?? null,
    });
  }

  static listaFromApi(data = []) {
    return data.map(Surtidor.fromApi);
  }

  /** Etiqueta corta para selects: "3 — Estación Norte (DIESEL_OIL)". */
  etiqueta() {
    const estacion = this.nombreEstacion ? ` — ${this.nombreEstacion}` : "";
    return `${this.numeroSurtidor}${estacion} (${this.tipoCombustible})`;
  }
}

export default Surtidor;
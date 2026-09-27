// Periodos reales que acepta el backend en CuposController (ajustar si
// el backend agrega/quita valores — igual que TIPOS_ALERTA en Alerta.js).
export const PERIODOS_CUPO = Object.freeze({
  DIARIO: "DIARIO",
  SEMANAL: "SEMANAL",
  MENSUAL: "MENSUAL",
});

/**
 * Cupo
 * ------------------------------------------------------------------
 * Modelo de una fila de cupo volumétrico asignado a un vehículo.
 * Mapea tanto la respuesta de POST /cupos como la de
 * GET /cupos/vehiculo/:placa y GET /cupos/vehiculo/:placa/vigente.
 *
 * Nota: el backend documentado especifica los campos de entrada
 * (placa, volumen_autorizado, periodo, fecha_inicio, fecha_fin) pero
 * no el nombre exacto de los campos adicionales que devuelve en la
 * respuesta (id, volumen consumido, estado). Este modelo mapea los
 * campos confirmados y deja los demás como opcionales — ajustar
 * `fromApi` si el backend real usa otras claves.
 */
class Cupo {
  constructor({
    idCupo = null,
    placa,
    volumenAutorizado,
    volumenConsumido = null,
    periodo,
    fechaInicio,
    fechaFin,
    estado = null,
  } = {}) {
    this.idCupo = idCupo;
    this.placa = placa;
    this.volumenAutorizado = volumenAutorizado;
    this.volumenConsumido = volumenConsumido;
    this.periodo = periodo;
    this.fechaInicio = fechaInicio ? new Date(fechaInicio) : null;
    this.fechaFin = fechaFin ? new Date(fechaFin) : null;
    this.estado = estado;
  }

  static fromApi(data) {
    if (!data) return null;
    return new Cupo({
      idCupo: data.id_cupo,
      placa: data.placa,
      volumenAutorizado: Number(data.volumen_autorizado ?? 0),
      volumenConsumido:
        data.volumen_consumido != null ? Number(data.volumen_consumido) : null,
      periodo: data.periodo,
      fechaInicio: data.fecha_inicio,
      fechaFin: data.fecha_fin,
      estado: data.estado,
    });
  }

  static listaFromApi(data = []) {
    return data.map(Cupo.fromApi);
  }

  /** Litros que quedan disponibles, si el backend informó consumo. */
  get volumenDisponible() {
    if (this.volumenConsumido == null) return null;
    return Math.max(this.volumenAutorizado - this.volumenConsumido, 0);
  }

  /** Porcentaje ya consumido del cupo, si hay dato de consumo. */
  get porcentajeConsumido() {
    if (this.volumenConsumido == null || this.volumenAutorizado === 0) return null;
    return Number(((this.volumenConsumido / this.volumenAutorizado) * 100).toFixed(1));
  }

  /** Vigencia calculada por fecha, como respaldo si el backend no manda `estado`. */
  estaVigentePorFecha(ahora = new Date()) {
    if (!this.fechaInicio || !this.fechaFin) return false;
    return ahora >= this.fechaInicio && ahora <= this.fechaFin;
  }
}

export default Cupo;
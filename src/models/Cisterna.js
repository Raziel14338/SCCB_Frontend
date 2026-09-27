// ENUM real validado en cisternacontroller.js (actualizarEstadoCisterna).
export const ESTADOS_CISTERNA = Object.freeze({
  OPERATIVA: "OPERATIVA",
  MANTENIMIENTO: "MANTENIMIENTO",
  FUERA_DE_SERVICIO: "FUERA_DE_SERVICIO",
});

/**
 * TelemetriaCisterna
 * ------------------------------------------------------------------
 * Un punto de la tabla `registro_telemetria`. `evento` no tiene un
 * ENUM confirmado en el backend (el default del Service es
 * "EN_RUTA"), así que se deja como string libre.
 */
class TelemetriaCisterna {
  constructor({
    idCisterna,
    latitud,
    longitud,
    nivelCarga,
    flujoInstantaneo = null,
    velocidadKmh = null,
    evento = "EN_RUTA",
    fechaHora = null,
  } = {}) {
    this.idCisterna = idCisterna;
    this.latitud = latitud !== undefined ? Number(latitud) : null;
    this.longitud = longitud !== undefined ? Number(longitud) : null;
    this.nivelCarga = nivelCarga !== undefined ? Number(nivelCarga) : null;
    this.flujoInstantaneo =
      flujoInstantaneo !== null ? Number(flujoInstantaneo) : null;
    this.velocidadKmh = velocidadKmh !== null ? Number(velocidadKmh) : null;
    this.evento = evento;
    this.fechaHora = fechaHora ? new Date(fechaHora) : null;
  }

  static fromApi(data) {
    if (!data) return null;
    return new TelemetriaCisterna({
      idCisterna: data.id_cisterna,
      latitud: data.latitud,
      longitud: data.longitud,
      nivelCarga: data.nivel_carga,
      flujoInstantaneo: data.flujo_instantaneo,
      velocidadKmh: data.velocidad_kmh,
      evento: data.evento,
      fechaHora: data.fecha_hora,
    });
  }
}

/**
 * Cisterna
 * ------------------------------------------------------------------
 * Modelo de una fila de la tabla `cisternas`. No incluye telemetría
 * embebida a propósito: se pide aparte (bajo demanda, por fila) para
 * no disparar N llamadas al listar todas las cisternas.
 */
class Cisterna {
  constructor({
    idCisterna,
    placa,
    rfidTag = null,
    empresaTransporte,
    capacidadTotal,
    sensorIotId = null,
    estado,
  } = {}) {
    this.idCisterna = idCisterna;
    this.placa = placa;
    this.rfidTag = rfidTag;
    this.empresaTransporte = empresaTransporte;
    this.capacidadTotal = Number(capacidadTotal ?? 0);
    this.sensorIotId = sensorIotId;
    this.estado = estado;
  }

  static fromApi(data) {
    if (!data) return null;
    return new Cisterna({
      idCisterna: data.id_cisterna,
      placa: data.placa,
      rfidTag: data.rfid_tag,
      empresaTransporte: data.empresa_transporte,
      capacidadTotal: data.capacidad_total,
      sensorIotId: data.sensor_iot_id,
      estado: data.estado,
    });
  }

  static listaFromApi(data = []) {
    return data.map(Cisterna.fromApi);
  }

  estaOperativa() {
    return this.estado === ESTADOS_CISTERNA.OPERATIVA;
  }
}

export { Cisterna, TelemetriaCisterna };
export default Cisterna;
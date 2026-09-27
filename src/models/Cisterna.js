export const ESTADOS_CISTERNA = Object.freeze({
  OPERATIVA: "OPERATIVA",
  MANTENIMIENTO: "MANTENIMIENTO",
  FUERA_DE_SERVICIO: "FUERA_DE_SERVICIO",
});

/**
 * Cisterna
 * ------------------------------------------------------------------
 * El backend hace `SELECT * FROM cisternas`, así que puede haber
 * columnas adicionales que no vimos en el INSERT (ej. fecha de
 * registro); este modelo solo mapea los campos confirmados por
 * CisternaService#crear — el resto de columnas simplemente no se
 * usan en la UI todavía.
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

/**
 * RegistroTelemetria
 * ------------------------------------------------------------------
 * Mapea una fila de `registro_telemetria` (el último punto conocido
 * de una cisterna, o el que se acaba de insertar).
 */
class RegistroTelemetria {
  constructor({
    idCisterna,
    latitud,
    longitud,
    nivelCarga,
    flujoInstantaneo = null,
    velocidadKmh = null,
    evento = null,
    fechaHora = null,
  } = {}) {
    this.idCisterna = idCisterna;
    this.latitud = Number(latitud);
    this.longitud = Number(longitud);
    this.nivelCarga = Number(nivelCarga);
    this.flujoInstantaneo = flujoInstantaneo != null ? Number(flujoInstantaneo) : null;
    this.velocidadKmh = velocidadKmh != null ? Number(velocidadKmh) : null;
    this.evento = evento;
    this.fechaHora = fechaHora ? new Date(fechaHora) : null;
  }

  static fromApi(data) {
    if (!data) return null;
    return new RegistroTelemetria({
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

export { Cisterna, RegistroTelemetria };
export default Cisterna;
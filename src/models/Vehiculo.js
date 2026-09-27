export const TIPOS_VEHICULO = Object.freeze({
  LIVIANO: "LIVIANO",
  CISTERNA: "CISTERNA",
  PESADO: "PESADO",
});

export const ESTADOS_VEHICULO = Object.freeze({
  ACTIVO: "ACTIVO",
  BLOQUEADO: "BLOQUEADO",
  INACTIVO: "INACTIVO",
});

/**
 * Vehiculo
 * ------------------------------------------------------------------
 * El backend siempre devuelve el vehículo con un JOIN a `conductores`
 * (nombre y, en el detalle individual, también el estado del
 * conductor), así que este modelo ya viene con esos datos resueltos
 * en lugar de requerir una segunda consulta.
 */
class Vehiculo {
  constructor({
    idVehiculo,
    placa,
    rfidTag,
    tipoVehiculo,
    capacidadTanque,
    estado,
    fechaRegistro = null,
    idConductor = null,
    conductorNombre = null,
    conductorEstado = null,
  } = {}) {
    this.idVehiculo = idVehiculo;
    this.placa = placa;
    this.rfidTag = rfidTag;
    this.tipoVehiculo = tipoVehiculo;
    this.capacidadTanque = Number(capacidadTanque ?? 0);
    this.estado = estado;
    this.fechaRegistro = fechaRegistro ? new Date(fechaRegistro) : null;
    this.idConductor = idConductor;
    this.conductorNombre = conductorNombre;
    this.conductorEstado = conductorEstado;
  }

  static fromApi(data) {
    if (!data) return null;
    return new Vehiculo({
      idVehiculo: data.id_vehiculo,
      placa: data.placa,
      rfidTag: data.rfid_tag,
      tipoVehiculo: data.tipo_vehiculo,
      capacidadTanque: data.capacidad_tanque,
      estado: data.estado,
      fechaRegistro: data.fecha_registro,
      idConductor: data.id_conductor,
      conductorNombre: data.conductor_nombre,
      conductorEstado: data.conductor_estado,
    });
  }

  static listaFromApi(data = []) {
    return data.map(Vehiculo.fromApi);
  }

  estaActivo() {
    return this.estado === ESTADOS_VEHICULO.ACTIVO;
  }

  estaBloqueado() {
    return this.estado === ESTADOS_VEHICULO.BLOQUEADO;
  }
}

export default Vehiculo;
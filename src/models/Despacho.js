// ENUM real de la columna `estado_transaccion` en la tabla `despachos`
// (ver inventarioservice.js: _insertarDespacho solo usa estos dos
// valores, "AUTORIZADO" y "DENEGADO").
export const ESTADOS_TRANSACCION = Object.freeze({
  AUTORIZADO: "AUTORIZADO",
  DENEGADO: "DENEGADO",
});

// El backend no valida esto contra un ENUM explícito en el
// controlador; el default del Service es "RFID". Se deja como
// sugerencia editable — confirmar con el equipo si la tabla admite
// más valores (ej. "OCR", "MANUAL").
export const METODOS_IDENTIFICACION_SUGERIDOS = Object.freeze([
  "RFID",
  "MANUAL",
]);

/**
 * Despacho
 * ------------------------------------------------------------------
 * Modelo de una fila de la tabla `despachos` (venta de combustible a
 * un vehículo en un surtidor). El backend no hace joins aquí (a
 * diferencia de Alerta), así que solo tenemos los IDs crudos — si
 * más adelante el backend agrega joins (placa, nombre de surtidor,
 * etc.), este modelo es el único lugar que hay que tocar.
 */
class Despacho {
  constructor({
    idDespacho,
    idSurtidor,
    idVehiculo,
    idCupo,
    idConductor,
    idUsuarioOperador,
    volumenDespachado,
    metodoIdentificacion,
    estadoTransaccion,
    fechaHora = null,
  } = {}) {
    this.idDespacho = idDespacho;
    this.idSurtidor = idSurtidor;
    this.idVehiculo = idVehiculo;
    this.idCupo = idCupo;
    this.idConductor = idConductor;
    this.idUsuarioOperador = idUsuarioOperador;
    this.volumenDespachado = Number(volumenDespachado ?? 0);
    this.metodoIdentificacion = metodoIdentificacion;
    this.estadoTransaccion = estadoTransaccion;
    this.fechaHora = fechaHora ? new Date(fechaHora) : null;
  }

  static fromApi(data) {
    if (!data) return null;
    return new Despacho({
      idDespacho: data.id_despacho,
      idSurtidor: data.id_surtidor,
      idVehiculo: data.id_vehiculo,
      idCupo: data.id_cupo,
      idConductor: data.id_conductor,
      idUsuarioOperador: data.id_usuario_operador,
      volumenDespachado: data.volumen_despachado,
      metodoIdentificacion: data.metodo_identificacion,
      estadoTransaccion: data.estado_transaccion,
      fechaHora: data.fecha_hora,
    });
  }

  static listaFromApi(data = []) {
    return data.map(Despacho.fromApi);
  }

  esAutorizado() {
    return this.estadoTransaccion === ESTADOS_TRANSACCION.AUTORIZADO;
  }

  esDenegado() {
    return this.estadoTransaccion === ESTADOS_TRANSACCION.DENEGADO;
  }
}

export default Despacho;
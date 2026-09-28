export const TIPOS_MOVIMIENTO = Object.freeze({
  ENTRADA: "ENTRADA",
  SALIDA: "SALIDA",
});

/**
 * MovimientoInventario
 * ------------------------------------------------------------------
 * Mapea una fila de la tabla `inventario`. Cada transferencia genera
 * DOS movimientos atómicos (una SALIDA en el centro de acopio y una
 * ENTRADA en la estación) — este modelo representa uno solo de esos
 * dos registros; para el par completo ver `ResultadoTransferencia`.
 */
class MovimientoInventario {
  constructor({
    idMovimiento,
    tipoMovimiento,
    idCentroAcopio = null,
    idEstacion = null,
    idCisterna = null,
    tipoCombustible,
    volumen,
    documentoReferencia,
    idUsuarioRegistro,
    fechaHora = null,
  } = {}) {
    this.idMovimiento = idMovimiento;
    this.tipoMovimiento = tipoMovimiento;
    this.idCentroAcopio = idCentroAcopio;
    this.idEstacion = idEstacion;
    this.idCisterna = idCisterna;
    this.tipoCombustible = tipoCombustible;
    this.volumen = Number(volumen ?? 0);
    this.documentoReferencia = documentoReferencia;
    this.idUsuarioRegistro = idUsuarioRegistro;
    this.fechaHora = fechaHora ? new Date(fechaHora) : null;
  }

  static fromApi(data) {
    if (!data) return null;
    return new MovimientoInventario({
      idMovimiento: data.id_movimiento,
      tipoMovimiento: data.tipo_movimiento,
      idCentroAcopio: data.id_centro_acopio,
      idEstacion: data.id_estacion,
      idCisterna: data.id_cisterna,
      tipoCombustible: data.tipo_combustible,
      volumen: data.volumen,
      documentoReferencia: data.documento_referencia,
      idUsuarioRegistro: data.id_usuario_registro,
      fechaHora: data.fecha_hora,
    });
  }

  static listaFromApi(data = []) {
    return data.map(MovimientoInventario.fromApi);
  }

  esEntrada() {
    return this.tipoMovimiento === TIPOS_MOVIMIENTO.ENTRADA;
  }

  esSalida() {
    return this.tipoMovimiento === TIPOS_MOVIMIENTO.SALIDA;
  }
}

/**
 * ResultadoTransferencia
 * ------------------------------------------------------------------
 * Envuelve la respuesta de POST /inventario/transferencia:
 * { documento_referencia, movimiento_salida, movimiento_entrada }.
 */
class ResultadoTransferencia {
  constructor({ documentoReferencia, movimientoSalida, movimientoEntrada } = {}) {
    this.documentoReferencia = documentoReferencia;
    this.movimientoSalida = movimientoSalida;
    this.movimientoEntrada = movimientoEntrada;
  }

  static fromApi(data) {
    if (!data) return null;
    return new ResultadoTransferencia({
      documentoReferencia: data.documento_referencia,
      movimientoSalida: MovimientoInventario.fromApi(data.movimiento_salida),
      movimientoEntrada: MovimientoInventario.fromApi(data.movimiento_entrada),
    });
  }
}

export { MovimientoInventario, ResultadoTransferencia };
export default MovimientoInventario;
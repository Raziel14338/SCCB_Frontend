/**
 * ValidacionRfid
 * ------------------------------------------------------------------
 * Mapea la respuesta de GET /cupos/validar/:rfid_tag — chequeo de
 * SOLO LECTURA (no descuenta nada) que arma CupoService#validarPorRfid
 * a partir de un LEFT JOIN vehiculo+cupo, así que la respuesta viene
 * PLANA (sin envoltorio ni objeto anidado):
 *   { autorizado, mensaje, id_vehiculo?, placa?, vehiculo_estado?,
 *     id_cupo?, volumen_autorizado?, volumen_consumido?,
 *     volumen_disponible?, cupo_estado? }
 * Los campos más allá de autorizado/mensaje faltan si el RFID no
 * corresponde a ningún vehículo.
 */
class ValidacionRfid {
  constructor({
    autorizado = false,
    mensaje = null,
    idVehiculo = null,
    placa = null,
    vehiculoEstado = null,
    idCupo = null,
    volumenAutorizado = null,
    volumenConsumido = null,
    volumenDisponible = null,
    cupoEstado = null,
  } = {}) {
    this.autorizado = autorizado;
    this.mensaje = mensaje;
    this.idVehiculo = idVehiculo;
    this.placa = placa;
    this.vehiculoEstado = vehiculoEstado;
    this.idCupo = idCupo;
    this.volumenAutorizado = volumenAutorizado != null ? Number(volumenAutorizado) : null;
    this.volumenConsumido = volumenConsumido != null ? Number(volumenConsumido) : null;
    this.volumenDisponible = volumenDisponible != null ? Number(volumenDisponible) : null;
    this.cupoEstado = cupoEstado;
  }

  static fromApi(data) {
    if (!data) return null;
    return new ValidacionRfid({
      autorizado: Boolean(data.autorizado),
      mensaje: data.mensaje ?? null,
      idVehiculo: data.id_vehiculo ?? null,
      placa: data.placa ?? null,
      vehiculoEstado: data.vehiculo_estado ?? null,
      idCupo: data.id_cupo ?? null,
      volumenAutorizado: data.volumen_autorizado,
      volumenConsumido: data.volumen_consumido,
      volumenDisponible: data.volumen_disponible,
      cupoEstado: data.cupo_estado ?? null,
    });
  }

  /** Sin vehículo encontrado con ese tag (el backend no manda más campos en ese caso). */
  tagReconocido() {
    return this.placa != null;
  }

  /** El vehículo existe pero no tiene ningún cupo vigente para el periodo actual. */
  sinCupoVigente() {
    return this.tagReconocido() && this.idCupo == null;
  }
}

/**
 * ResultadoDespacho
 * ------------------------------------------------------------------
 * Mapea la respuesta de POST /cupos/vehiculo/:placa/validar-despacho.
 * El backend usa dos formas distintas según el resultado:
 *   - 200 OK:  { autorizado: true, mensaje, id_cupo }
 *   - 403:     { autorizado: false, error }   (nota: la clave es
 *     `error`, no `mensaje`, en el caso de rechazo)
 * `fromApi` normaliza ambos casos a un único campo `mensaje`.
 */
class ResultadoDespacho {
  constructor({ autorizado = false, mensaje = null, idCupo = null } = {}) {
    this.autorizado = autorizado;
    this.mensaje = mensaje;
    this.idCupo = idCupo;
  }

  static fromApi(data) {
    if (!data) return null;
    return new ResultadoDespacho({
      autorizado: Boolean(data.autorizado),
      mensaje: data.mensaje ?? data.error ?? null,
      idCupo: data.id_cupo ?? null,
    });
  }
}

export { ValidacionRfid, ResultadoDespacho };
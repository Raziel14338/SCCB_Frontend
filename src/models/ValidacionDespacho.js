/**
 * ValidacionRfid
 * ------------------------------------------------------------------
 * Mapea la respuesta de GET /cupos/validar/:rfid_tag: identifica el
 * vehículo asociado al tag y el estado de su cupo vigente en ese
 * momento, para que el operador decida si procede el despacho.
 *
 * SUPUESTO: el prompt original solo documenta el endpoint, no su
 * forma de respuesta. Se asume que devuelve la placa, si el tag está
 * habilitado y el cupo vigente (mismo shape que Cupo.fromApi).
 * Ajustar `fromApi` si el backend real usa otras claves.
 */
class ValidacionRfid {
  constructor({ placa, rfidTag, habilitado = false, cupoVigente = null, motivo = null } = {}) {
    this.placa = placa;
    this.rfidTag = rfidTag;
    this.habilitado = habilitado;
    this.cupoVigente = cupoVigente; // instancia de Cupo, o null
    this.motivo = motivo;
  }

  static fromApi(data, CupoModel) {
    if (!data) return null;
    return new ValidacionRfid({
      placa: data.placa,
      rfidTag: data.rfid_tag,
      habilitado: Boolean(data.habilitado ?? data.autorizado),
      cupoVigente: data.cupo_vigente ? CupoModel.fromApi(data.cupo_vigente) : null,
      motivo: data.motivo ?? null,
    });
  }
}

/**
 * ResultadoDespacho
 * ------------------------------------------------------------------
 * Mapea la respuesta de POST /cupos/vehiculo/:placa/validar-despacho:
 * si el volumen solicitado fue autorizado contra el cupo vigente, y
 * el detalle relevante para mostrarle al operador en el surtidor.
 *
 * SUPUESTO: mismo caso que ValidacionRfid — se asume una forma de
 * respuesta razonable (autorizado/motivo/volumen restante). Ajustar
 * si el backend real difiere.
 */
class ResultadoDespacho {
  constructor({
    autorizado = false,
    motivo = null,
    volumenSolicitado = 0,
    volumenDisponibleRestante = null,
  } = {}) {
    this.autorizado = autorizado;
    this.motivo = motivo;
    this.volumenSolicitado = volumenSolicitado;
    this.volumenDisponibleRestante = volumenDisponibleRestante;
  }

  static fromApi(data) {
    if (!data) return null;
    return new ResultadoDespacho({
      autorizado: Boolean(data.autorizado),
      motivo: data.motivo ?? null,
      volumenSolicitado: Number(data.volumen_solicitado ?? 0),
      volumenDisponibleRestante:
        data.volumen_disponible_restante != null
          ? Number(data.volumen_disponible_restante)
          : null,
    });
  }
}

export { ValidacionRfid, ResultadoDespacho };
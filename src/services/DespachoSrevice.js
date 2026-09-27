import BaseService from "./BaseService";
import Despacho from "../models/Despacho";

/**
 * DespachosService
 * ------------------------------------------------------------------
 * El backend no usa un prefijo REST uniforme para este recurso:
 * registrar es POST /despachos pero listar es GET /obtener/despachos.
 * Por eso `listar` no pasa por `buildUrl` — llama la ruta literal —
 * mientras que `registrar` sí, ya que POST /despachos coincide con
 * `resourcePath`.
 */
class DespachosService extends BaseService {
  constructor() {
    super("/despachos");
  }

  /**
   * POST /despachos
   * El backend valida cupo/estado del vehículo y del surtidor de
   * forma atómica; si el cupo se deniega responde 403 con
   * { autorizado: false, error }, pero igual deja constancia del
   * intento (estado_transaccion = "DENEGADO") en el listado.
   */
  async registrar({
    idSurtidor,
    rfidTagOPlaca,
    idConductor,
    idUsuarioOperador,
    volumenDespachado,
    metodoIdentificacion,
  }) {
    const data = await this.http.post(this.buildUrl(""), {
      id_surtidor: idSurtidor,
      rfid_tag_o_placa: rfidTagOPlaca,
      id_conductor: idConductor,
      id_usuario_operador: idUsuarioOperador,
      volumen_despachado: volumenDespachado,
      metodo_identificacion: metodoIdentificacion,
    });
    return Despacho.fromApi(data.despacho);
  }

  /**
   * GET /obtener/despachos?id_surtidor=&id_vehiculo=&estado_transaccion=
   */
  async listar({ idSurtidor, idVehiculo, estadoTransaccion } = {}) {
    const params = {};
    if (idSurtidor) params.id_surtidor = idSurtidor;
    if (idVehiculo) params.id_vehiculo = idVehiculo;
    if (estadoTransaccion) params.estado_transaccion = estadoTransaccion;

    const data = await this.http.get("/obtener/despachos", { params });
    return Despacho.listaFromApi(data.despachos);
  }
}

export default DespachosService;
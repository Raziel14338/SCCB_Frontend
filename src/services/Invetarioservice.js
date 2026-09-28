import BaseService from "./BaseService";
import { MovimientoInventario, ResultadoTransferencia } from "../models/Inventario";

/**
 * InventarioService
 * ------------------------------------------------------------------
 * Habla con InventarioController, pero SOLO la parte de inventario
 * (transferencias centro de acopio → estación). El registro de
 * despachos (POST /despachos, GET /obtener/despachos) ya vive en
 * DespachoSrevice.js del módulo de Operaciones — no se duplica acá
 * aunque comparta controlador en el backend.
 *
 * Sin `resourcePath` fijo: registrar es POST /inventario/transferencia
 * pero listar es GET /obtener/inventario, mismo patrón irregular que
 * DespachosService.
 */
class InventarioService extends BaseService {
  constructor() {
    super("");
  }

  /**
   * POST /inventario/transferencia
   * Requiere idCentroAcopio, idEstacion, tipoCombustible, volumen e
   * idUsuarioRegistro (400 si falta alguno, 404 si el centro o la
   * estación no existen). Es una operación atómica en el backend: si
   * falla, no queda ni la salida ni la entrada registradas.
   */
  async registrarTransferencia({
    idCentroAcopio,
    idEstacion,
    idCisterna,
    tipoCombustible,
    volumen,
    documentoReferencia,
    idUsuarioRegistro,
  }) {
    const data = await this.http.post(this.buildUrl("/inventario/transferencia"), {
      id_centro_acopio: idCentroAcopio,
      id_estacion: idEstacion,
      id_cisterna: idCisterna,
      tipo_combustible: tipoCombustible,
      volumen,
      documento_referencia: documentoReferencia,
      id_usuario_registro: idUsuarioRegistro,
    });
    return ResultadoTransferencia.fromApi(data);
  }

  /**
   * GET /obtener/inventario?id_centro_acopio=&id_estacion=&tipo_movimiento=
   * Todos los filtros son opcionales; sin ninguno trae el historial
   * completo ordenado por fecha_hora DESC.
   */
  async listarInventario({ idCentroAcopio, idEstacion, tipoMovimiento } = {}) {
    const params = {};
    if (idCentroAcopio) params.id_centro_acopio = idCentroAcopio;
    if (idEstacion) params.id_estacion = idEstacion;
    if (tipoMovimiento) params.tipo_movimiento = tipoMovimiento;

    const data = await this.http.get(this.buildUrl("/obtener/inventario"), { params });
    return MovimientoInventario.listaFromApi(data.movimientos);
  }
}

export default InventarioService;
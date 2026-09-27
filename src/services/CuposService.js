import BaseService from "./BaseService";

/**
 * CuposService
 * ------------------------------------------------------------------
 * Del módulo de Cupos solo se consume el chequeo de solo lectura
 * (`validarPorRfid`): pinta el semáforo en el formulario de despacho
 * ANTES de confirmar la venta. La autorización real y el descuento
 * atómico del cupo los hace el propio backend dentro de
 * POST /despachos — este service nunca descuenta nada.
 */
class CuposService extends BaseService {
  constructor() {
    super("/cupos");
  }

  /**
   * GET /cupos/validar/:rfid_tag?volumen=
   * Devuelve el objeto tal cual lo arma el backend (autorizado,
   * mensaje, placa, vehiculo_estado, volumen_disponible, cupo_estado,
   * id_cupo) — no hay un Modelo de dominio detrás porque es un
   * chequeo efímero, no una entidad persistida.
   */
  async validarPorRfid(rfidTag, volumenSolicitado) {
    const params = {};
    if (volumenSolicitado !== undefined && volumenSolicitado !== null && volumenSolicitado !== "") {
      params.volumen = volumenSolicitado;
    }

    return this.http.get(this.buildUrl(`/validar/${rfidTag}`), { params });
  }
}

export default CuposService;
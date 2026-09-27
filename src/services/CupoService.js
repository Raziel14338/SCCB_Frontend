import BaseService from "./BaseService";
import Cupo from "../models/Cupo";
import { ValidacionRfid, ResultadoDespacho } from "../models/ValidacionDespacho";

/**
 * CupoService
 * ------------------------------------------------------------------
 * Habla con /cupos. Cubre los endpoints de gestión que consume el
 * panel de fiscalización (registro, historial y cupo vigente por
 * vehículo). Los endpoints de validación en el surtidor
 * (GET /cupos/validar/:rfid_tag y
 * POST /cupos/vehiculo/:placa/validar-despacho) son de consumo para
 * la operación del surtidor, no para esta pantalla, así que no se
 * exponen aquí todavía.
 *
 * Nota sobre el sobre de respuesta: se asume la misma convención que
 * AlertasService (`{ alerta }` / `{ alertas }`), es decir
 * `{ cupo }` para un objeto y `{ cupos }` para una lista. Ajustar los
 * accesos de abajo si el backend real envuelve la respuesta distinto.
 */
class CupoService extends BaseService {
  constructor() {
    super("/cupos");
  }

  /**
   * POST /cupos
   * Requiere placa, volumenAutorizado, periodo, fechaInicio y
   * fechaFin (el backend responde 400 si falta alguno).
   */
  async registrar({ placa, volumenAutorizado, periodo, fechaInicio, fechaFin }) {
    const data = await this.http.post(this.buildUrl(""), {
      placa,
      volumen_autorizado: volumenAutorizado,
      periodo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    });
    return Cupo.fromApi(data.cupo ?? data);
  }

  /** GET /cupos/vehiculo/:placa — historial completo de cupos del vehículo. */
  async obtenerHistorial(placa) {
    const data = await this.http.get(this.buildUrl(`/vehiculo/${placa}`));
    return Cupo.listaFromApi(data.cupos ?? data);
  }

  /**
   * GET /cupos/vehiculo/:placa/vigente — cupo actual del vehículo.
   * Si el vehículo no tiene cupo vigente el backend puede responder
   * 404; en ese caso se devuelve null en lugar de propagar el error,
   * para que la pantalla lo trate como "sin cupo vigente".
   */
  async obtenerVigente(placa) {
    try {
      const data = await this.http.get(this.buildUrl(`/vehiculo/${placa}/vigente`));
      return Cupo.fromApi(data.cupo ?? data);
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }

  /**
   * GET /cupos/validar/:rfid_tag?volumen=N — chequeo de SOLO LECTURA
   * (no descuenta nada) para pintar el semáforo en el surtidor antes
   * de confirmar la venta. `volumenSolicitado` es opcional: si se
   * manda, el backend además valida que no exceda el disponible.
   * La respuesta viene plana (sin envoltorio) siempre con 200 —
   * "no autorizado" es parte del body, no un status de error.
   */
  async validarRfid(rfidTag, volumenSolicitado = null) {
    const data = await this.http.get(this.buildUrl(`/validar/${rfidTag}`), {
      params: volumenSolicitado != null ? { volumen: volumenSolicitado } : undefined,
    });
    return ValidacionRfid.fromApi(data);
  }

  /**
   * POST /cupos/vehiculo/:placa/validar-despacho — valida Y descuenta
   * el volumen de forma atómica (vía stored procedure) contra el cupo
   * vigente. A diferencia de validarRfid, esta sí es la operación que
   * autoriza de verdad la venta. El backend responde 200 si autoriza
   * y 403 si deniega (cupo insuficiente/vencido) — ambos casos se
   * normalizan acá a un mismo ResultadoDespacho en vez de propagar el
   * 403 como excepción, porque "denegado" es un resultado válido de
   * este flujo, no un error de red.
   */
  async validarDespacho(placa, volumenSolicitado) {
    try {
      const data = await this.http.post(this.buildUrl(`/vehiculo/${placa}/validar-despacho`), {
        volumen_solicitado: volumenSolicitado,
      });
      return ResultadoDespacho.fromApi(data);
    } catch (error) {
      if (error.response?.status === 403) {
        return ResultadoDespacho.fromApi(error.response.data);
      }
      throw error;
    }
  }
}

export default CupoService;
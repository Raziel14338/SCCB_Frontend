import BaseService from "./BaseService";
import Cisterna, { RegistroTelemetria } from "../models/Cisterna";

/**
 * CisternaService
 * ------------------------------------------------------------------
 * Habla con cisternaroutes.js. Sin resourcePath fijo por la misma
 * razón que ConductorService/VehiculoService: el listado vive en
 * /obtener/cisternas en vez de /cisternas.
 */
class CisternaService extends BaseService {
  constructor() {
    super("");
  }

  /**
   * POST /cisternas
   * Requiere placa, empresaTransporte y capacidadTotal (el backend
   * responde 400 si falta alguno, 409 si la placa ya existe).
   */
  async registrar({ placa, rfidTag, empresaTransporte, capacidadTotal, sensorIotId }) {
    const data = await this.http.post(this.buildUrl("/cisternas"), {
      placa,
      rfid_tag: rfidTag,
      empresa_transporte: empresaTransporte,
      capacidad_total: capacidadTotal,
      sensor_iot_id: sensorIotId,
    });
    return Cisterna.fromApi(data.cisterna);
  }

  /** GET /obtener/cisternas?estado=OPERATIVA */
  async listar({ estado } = {}) {
    const data = await this.http.get(this.buildUrl("/obtener/cisternas"), {
      params: { estado },
    });
    return Cisterna.listaFromApi(data.cisternas);
  }

  /** GET /cisternas/:placa */
  async obtenerPorPlaca(placa) {
    const data = await this.http.get(this.buildUrl(`/cisternas/${placa}`));
    return Cisterna.fromApi(data.cisterna);
  }

  /** PATCH /cisternas/:placa/estado — OPERATIVA | MANTENIMIENTO | FUERA_DE_SERVICIO. */
  async actualizarEstado(placa, estado) {
    const data = await this.http.patch(this.buildUrl(`/cisternas/${placa}/estado`), {
      estado,
    });
    return Cisterna.fromApi(data.cisterna);
  }

  /**
   * GET /cisternas/:placa/telemetria — último punto conocido.
   * Devuelve null si la cisterna aún no tiene registros (404), en
   * vez de propagar el error.
   */
  async obtenerUltimaTelemetria(placa) {
    try {
      const data = await this.http.get(this.buildUrl(`/cisternas/${placa}/telemetria`));
      return RegistroTelemetria.fromApi(data.telemetria);
    } catch (error) {
      if (error.response?.status === 404) return null;
      throw error;
    }
  }
}

export default CisternaService;
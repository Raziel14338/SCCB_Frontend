import BaseService from "./BaseService";
import Cisterna, { TelemetriaCisterna } from "../models/Cisterna";

/**
 * CisternasService
 * ------------------------------------------------------------------
 * Igual que con Despachos: el listado va por /obtener/cisternas, no
 * por el resourcePath, así que `listar` usa la ruta literal.
 */
class CisternasService extends BaseService {
  constructor() {
    super("/cisternas");
  }

  /** GET /obtener/cisternas?estado=OPERATIVA */
  async listar({ estado } = {}) {
    const params = {};
    if (estado) params.estado = estado;

    const data = await this.http.get("/obtener/cisternas", { params });
    return Cisterna.listaFromApi(data.cisternas);
  }

  /** GET /cisternas/:placa */
  async obtenerPorPlaca(placa) {
    const data = await this.http.get(this.buildUrl(`/${placa}`));
    return Cisterna.fromApi(data.cisterna);
  }

  /** PATCH /cisternas/:placa/estado */
  async actualizarEstado(placa, estado) {
    const data = await this.http.patch(this.buildUrl(`/${placa}/estado`), { estado });
    return Cisterna.fromApi(data.cisterna);
  }

  /**
   * GET /cisternas/:placa/telemetria (último punto conocido).
   * El backend responde 404 si la cisterna nunca registró
   * telemetría — se propaga el error para que la pantalla decida
   * cómo mostrarlo ("Sin telemetría aún" en vez de un error genérico).
   */
  async obtenerUltimaTelemetria(placa) {
    const data = await this.http.get(this.buildUrl(`/${placa}/telemetria`));
    return TelemetriaCisterna.fromApi(data.telemetria);
  }

  /**
   * POST /cisternas/:placa/telemetria — ingesta de un punto IoT.
   * No se usa desde el panel del operador (la telemetría la manda el
   * sensor/gateway), pero se incluye aquí para no duplicar el
   * service si otro módulo (Flota/Telemetría) lo necesita.
   */
  async registrarTelemetria(placa, { latitud, longitud, nivelCarga, flujoInstantaneo, velocidadKmh, evento }) {
    const data = await this.http.post(this.buildUrl(`/${placa}/telemetria`), {
      latitud,
      longitud,
      nivel_carga: nivelCarga,
      flujo_instantaneo: flujoInstantaneo,
      velocidad_kmh: velocidadKmh,
      evento,
    });
    return TelemetriaCisterna.fromApi(data.telemetria);
  }
}

export default CisternasService;
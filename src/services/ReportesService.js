import BaseService from "./BaseService";
import { EstadisticasGenerales, CruceVolumetrico } from "../models/Reportes";

/**
 * ReportesService
 * ------------------------------------------------------------------
 * Endpoints de solo lectura que alimentan el dashboard. Ambos
 * aceptan filtros de fecha en formato YYYY-MM-DD (el backend valida
 * ese formato y responde 400 si no calza).
 */
class ReportesService extends BaseService {
  constructor() {
    super("/reportes");
  }

  /** GET /reportes/estadisticas?fecha=YYYY-MM-DD (fecha opcional: hoy por defecto) */
  async obtenerEstadisticasGenerales(fecha) {
    const data = await this.http.get(this.buildUrl("/estadisticas"), {
      params: fecha ? { fecha } : undefined,
    });
    return EstadisticasGenerales.fromApi(data.estadisticas);
  }

  /** GET /reportes/cruce-volumetrico?fecha_inicio=...&fecha_fin=... */
  async obtenerCruceVolumetrico({ fechaInicio, fechaFin } = {}) {
    const data = await this.http.get(this.buildUrl("/cruce-volumetrico"), {
      params: {
        ...(fechaInicio ? { fecha_inicio: fechaInicio } : {}),
        ...(fechaFin ? { fecha_fin: fechaFin } : {}),
      },
    });
    return CruceVolumetrico.fromApi(data);
  }
}

export default ReportesService;
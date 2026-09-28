import BaseService from "./BaseService";
import { RegistroTelemetria } from "../models/Cisterna";

/**
 * TelemetriaService
 * ------------------------------------------------------------------
 * Habla con /telemetria. Usa el ID numérico de la cisterna (no la
 * placa), a diferencia de /cisternas/:placa/telemetria.
 */
class TelemetriaService extends BaseService {
  constructor() {
    super("/telemetria");
  }

  /** GET /telemetria/cisterna/:id/historial?limite=N (más reciente primero) */
  async obtenerHistorial(idCisterna, limite = 50) {
    const data = await this.http.get(this.buildUrl(`/cisterna/${idCisterna}/historial`), {
      params: { limite },
    });
    return (data.historial ?? []).map((fila) => RegistroTelemetria.fromApi(fila));
  }
}

export default TelemetriaService;
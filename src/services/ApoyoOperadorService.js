import HttpClient from "../config/HttpClient";

/**
 * ApoyoOperadorService
 * ------------------------------------------------------------------
 * No extiende BaseService a propósito: no representa un recurso
 * propio, solo agrupa dos GET de solo lectura que el formulario de
 * despacho necesita para llenar sus selects (surtidor, conductor).
 * El CRUD completo de Infraestructura y Conductores queda fuera de
 * este módulo.
 */
class ApoyoOperadorService {
  constructor() {
    this.http = HttpClient.getInstance();
  }

  /** GET /obtener/surtidores (incluye nombre_estacion) */
  async listarSurtidores() {
    const data = await this.http.get("/obtener/surtidores");
    return data.surtidores.map((s) => ({
      idSurtidor: s.id_surtidor,
      idEstacion: s.id_estacion,
      numeroSurtidor: s.numero_surtidor,
      tipoCombustible: s.tipo_combustible,
      nombreEstacion: s.nombre_estacion ?? null,
      estado: s.estado,
    }));
  }

  /** GET /obtener/conductores?estado=ACTIVO */
  async listarConductores({ estado = "ACTIVO" } = {}) {
    const params = {};
    if (estado) params.estado = estado;

    const data = await this.http.get("/obtener/conductores", { params });
    return data.conductores.map((c) => ({
      idConductor: c.id_conductor,
      nombreCompleto: c.nombre_completo,
      ci: c.ci,
      licenciaConducir: c.licencia_conducir,
      telefono: c.telefono,
      estado: c.estado,
    }));
  }
}

export default ApoyoOperadorService;
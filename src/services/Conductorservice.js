import BaseService from "./BaseService";
import Conductor from "../models/Conductor";

/**
 * ConductorService
 * ------------------------------------------------------------------
 * Habla con conductoresroutes.js. Igual que UsuariosService, sin
 * resourcePath fijo porque el listado vive en /obtener/conductores en
 * vez de /conductores.
 */
class ConductorService extends BaseService {
  constructor() {
    super("");
  }

  /**
   * POST /conductores
   * Requiere nombreCompleto y ci (el backend responde 400 si falta
   * alguno, y 409 si la CI ya está registrada).
   */
  async registrar({ nombreCompleto, ci, licenciaConducir, telefono }) {
    const data = await this.http.post(this.buildUrl("/conductores"), {
      nombre_completo: nombreCompleto,
      ci,
      licencia_conducir: licenciaConducir,
      telefono,
    });
    return Conductor.fromApi(data.conductor);
  }

  /** GET /obtener/conductores?estado=ACTIVO — listado SIN la CI desencriptada. */
  async listar({ estado } = {}) {
    const data = await this.http.get(this.buildUrl("/obtener/conductores"), {
      params: { estado },
    });
    return Conductor.listaFromApi(data.conductores);
  }

  /** GET /conductores/:id — endpoint sensible, incluye la CI desencriptada. */
  async obtenerPorId(idConductor) {
    const data = await this.http.get(this.buildUrl(`/conductores/${idConductor}`));
    return Conductor.fromApi(data.conductor);
  }

  /** PATCH /conductores/:id/estado — estado: "ACTIVO" | "INACTIVO". */
  async actualizarEstado(idConductor, estado) {
    const data = await this.http.patch(this.buildUrl(`/conductores/${idConductor}/estado`), {
      estado,
    });
    return Conductor.fromApi(data.conductor);
  }
}

export default ConductorService;
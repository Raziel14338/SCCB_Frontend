import BaseService from "./BaseService";
import Alerta from "../models/Alerta";

/**
 * AlertasService
 * ------------------------------------------------------------------
 * Habla con /alertas. El backend valida tipo_alerta/severidad/estado
 * contra sus propios ENUM y responde 400 si algo no calza, así que
 * este Service se limita a mapear parámetros y respuestas — no
 * duplica esa validación aquí para no tener dos fuentes de verdad
 * sobre qué valores son válidos.
 */
class AlertasService extends BaseService {
  constructor() {
    super("/alertas");
  }

  /**
   * GET /alertas?estado=...&severidad=...
   * `estados` y `severidades` aceptan un string único o un array
   * (se unen con coma, igual que espera el backend).
   */
  async listar({ estados, severidades } = {}) {
    const params = {};
    if (estados) params.estado = [].concat(estados).join(",");
    if (severidades) params.severidad = [].concat(severidades).join(",");

    const data = await this.http.get(this.buildUrl(""), { params });
    return Alerta.listaFromApi(data.alertas);
  }

  /** GET /alertas/:id */
  async obtenerPorId(idAlerta) {
    const data = await this.http.get(this.buildUrl(`/${idAlerta}`));
    return Alerta.fromApi(data.alerta);
  }

  /**
   * POST /alertas
   * Requiere al menos una referencia: idCisterna, idVehiculo o idEstacion
   * (el backend responde 400 si ninguna viene informada).
   */
  async registrar({
    tipoAlerta,
    descripcion,
    severidad,
    idCisterna,
    idVehiculo,
    idEstacion,
  }) {
    const data = await this.http.post(this.buildUrl(""), {
      tipo_alerta: tipoAlerta,
      descripcion,
      severidad,
      id_cisterna: idCisterna,
      id_vehiculo: idVehiculo,
      id_estacion: idEstacion,
    });
    return Alerta.fromApi(data.alerta);
  }

  /**
   * PATCH /alertas/:id/estado
   * `idUsuarioResolucion` normalmente es el usuario logueado; lo
   * inyecta la pantalla desde useAuth(), este Service no asume sesión.
   */
  async actualizarEstado(idAlerta, { estado, idUsuarioResolucion }) {
    const data = await this.http.patch(this.buildUrl(`/${idAlerta}/estado`), {
      estado,
      id_usuario_resolucion: idUsuarioResolucion,
    });
    return Alerta.fromApi(data.alerta);
  }
}

export default AlertasService;
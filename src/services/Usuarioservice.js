import BaseService from "./BaseService";
import Usuario from "../models/Usuario";

/**
 * UsuariosService
 * ------------------------------------------------------------------
 * Habla con /users y /lista/users (rutas de usersroutes.js). No usa
 * un `resourcePath` fijo porque las rutas del backend no comparten un
 * prefijo consistente (/lista/users vs /users/:id), así que cada
 * método pasa su path completo a `buildUrl`.
 *
 * El alta de usuarios NO vive acá: el backend no expone un
 * POST /users, así que se sigue haciendo con
 * AuthService.getInstance().registrar(), como ya estaba armado.
 */
class UsuariosService extends BaseService {
  constructor() {
    super("");
  }

  /** GET /lista/users?rol=...&institucion=... */
  async listarPorRol({ rol, institucion } = {}) {
    const data = await this.http.get(this.buildUrl("/lista/users"), {
      params: { rol, institucion },
    });
    return (data.usuarios ?? []).map(Usuario.fromApi);
  }

  /** GET /users/:id */
  async obtenerPorId(idUsuario) {
    const data = await this.http.get(this.buildUrl(`/users/${idUsuario}`));
    return Usuario.fromApi(data.usuario);
  }

  /** PATCH /users/:id/desactivar — restringido a ADMIN_RED en el backend. */
  async desactivar(idUsuario) {
    const data = await this.http.patch(this.buildUrl(`/users/${idUsuario}/desactivar`));
    return Usuario.fromApi(data.usuario);
  }

  /** PATCH /users/:id/reactivar — restringido a ADMIN_RED en el backend. */
  async reactivar(idUsuario) {
    const data = await this.http.patch(this.buildUrl(`/users/${idUsuario}/reactivar`));
    return Usuario.fromApi(data.usuario);
  }
}

export default UsuariosService;
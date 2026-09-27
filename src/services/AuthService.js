import BaseService from "./BaseService";
import Usuario from "../models/Usuario";

const TOKEN_KEY = "token";

/**
 * AuthService
 * ------------------------------------------------------------------
 * Encapsula toda la lógica de autenticación: login, logout,
 * persistencia del token y obtención del perfil del usuario actual.
 *
 * Implementado como Singleton para que exista una única fuente de
 * verdad sobre la sesión activa, sin importar cuántos componentes
 * lo usen.
 */
class AuthService extends BaseService {
  static #instance = null;

  constructor() {
    super("/auth");
  }

  static getInstance() {
    if (!AuthService.#instance) {
      AuthService.#instance = new AuthService();
    }
    return AuthService.#instance;
  }

  /**
   * Autentica al usuario contra el backend (POST /auth/login), guarda
   * el token y devuelve una instancia de Usuario.
   * El backend espera { nombre_usuario, password } — no email.
   */
  async login(nombreUsuario, password) {
    const data = await this.http.post(this.buildUrl("/login"), {
      nombre_usuario: nombreUsuario,
      password,
    });

    if (!data?.token) {
      throw new Error("La respuesta del servidor no incluyó un token");
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    return Usuario.fromApi(data.usuario);
  }

  /**
   * Registra un nuevo usuario (POST /auth/registro). El backend
   * también devuelve token + usuario, así que puede dejar logueado
   * de inmediato si la pantalla de registro lo requiere.
   */
  async registrar({
    nombreUsuario,
    password,
    nombreCompleto,
    correo,
    institucion,
    idRol,
  }) {
    const data = await this.http.post(this.buildUrl("/registro"), {
      nombre_usuario: nombreUsuario,
      password,
      nombre_completo: nombreCompleto,
      correo,
      institucion,
      id_rol: idRol,
    });
    return Usuario.fromApi(data.usuario);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  }

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Recupera el perfil del usuario autenticado (para rehidratar sesión). */
  async obtenerPerfil() {
    const data = await this.http.get(this.buildUrl("/perfil"));
    return Usuario.fromApi(data);
  }
}

export default AuthService;
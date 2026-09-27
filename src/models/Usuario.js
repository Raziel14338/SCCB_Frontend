/**
 * Usuario
 * ------------------------------------------------------------------
 * Modelo de datos (Entity) del usuario autenticado. No sabe nada de
 * HTTP ni de React: solo representa la forma de los datos y expone
 * comportamiento propio del dominio (roles, permisos, presentación).
 *
 * Los Services devuelven instancias de esta clase en lugar de JSON
 * "crudo", para que el resto de la app trabaje con un objeto rico
 * en comportamiento en vez de repetir lógica de roles por todos
 * lados.
 */
// Roles reales del backend (columna nombre_rol, ver verificarRol en
// authmiddleware.js). Ajustar/ampliar aquí si el backend agrega roles.
export const ROLES = Object.freeze({
  ADMIN_RED: "ADMIN_RED",
  FISCAL_ANH: "FISCAL_ANH",
  OPERADOR_YPFB: "OPERADOR_YPFB",
});

class Usuario {
  constructor({
    idUsuario,
    nombreUsuario,
    nombreCompleto,
    correo,
    institucion,
    estado,
    idRol,
    nombreRol,
    nivelAcceso,
    fechaCreacion = null,
    ultimoAcceso = null,
  } = {}) {
    this.idUsuario = idUsuario;
    this.nombreUsuario = nombreUsuario;
    this.nombreCompleto = nombreCompleto;
    this.correo = correo;
    this.institucion = institucion;
    this.estado = estado;
    this.idRol = idRol;
    this.nombreRol = nombreRol; // ej: "ADMIN_RED" | "FISCAL_ANH" | "OPERADOR_YPFB"
    this.nivelAcceso = nivelAcceso;
    this.fechaCreacion = fechaCreacion ? new Date(fechaCreacion) : null;
    this.ultimoAcceso = ultimoAcceso ? new Date(ultimoAcceso) : null;
  }

  /**
   * Construye un Usuario a partir del objeto `usuario` que devuelven
   * /auth/login, /auth/registro y /auth/perfil.
   */
  static fromApi(data) {
    if (!data) return null;
    return new Usuario({
      idUsuario: data.id_usuario,
      nombreUsuario: data.nombre_usuario,
      nombreCompleto: data.nombre_completo,
      correo: data.correo,
      institucion: data.institucion,
      estado: data.estado,
      idRol: data.id_rol,
      nombreRol: data.nombre_rol,
      nivelAcceso: data.nivel_acceso,
      fechaCreacion: data.fecha_creacion,
      ultimoAcceso: data.ultimo_acceso,
    });
  }

  tieneRol(...roles) {
    return roles.includes(this.nombreRol);
  }

  esAdminRed() {
    return this.tieneRol(ROLES.ADMIN_RED);
  }

  esFiscalAnh() {
    return this.tieneRol(ROLES.FISCAL_ANH);
  }

  esOperadorYpfb() {
    return this.tieneRol(ROLES.OPERADOR_YPFB);
  }

  estaActivo() {
    return this.estado === "ACTIVO";
  }
}

export default Usuario;
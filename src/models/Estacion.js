export const ESTADOS_ESTACION = Object.freeze({
  OPERATIVA: "OPERATIVA",
  INACTIVA: "INACTIVA",
  MANTENIMIENTO: "MANTENIMIENTO",
});
// SUPUESTO: mismo caso que ESTADOS_CENTRO_ACOPIO — el backend no valida
// contra un ENUM explícito en actualizarEstacion. Ajustar si difiere.

/**
 * Estacion
 * ------------------------------------------------------------------
 * Mapea una fila de `estaciones_servicio`. `codigoYpfb` es UNIQUE en
 * el backend (crearEstacion responde 409 si se repite), así que la
 * UI debe tratarlo como el identificador "de negocio" de la estación.
 */
class Estacion {
  constructor({
    idEstacion,
    nombre,
    codigoYpfb,
    ubicacion,
    latitud = null,
    longitud = null,
    estado,
  } = {}) {
    this.idEstacion = idEstacion;
    this.nombre = nombre;
    this.codigoYpfb = codigoYpfb;
    this.ubicacion = ubicacion;
    this.latitud = latitud != null ? Number(latitud) : null;
    this.longitud = longitud != null ? Number(longitud) : null;
    this.estado = estado;
  }

  static fromApi(data) {
    if (!data) return null;
    return new Estacion({
      idEstacion: data.id_estacion,
      nombre: data.nombre,
      codigoYpfb: data.codigo_ypfb,
      ubicacion: data.ubicacion,
      latitud: data.latitud,
      longitud: data.longitud,
      estado: data.estado,
    });
  }

  static listaFromApi(data = []) {
    return data.map(Estacion.fromApi);
  }

  estaOperativa() {
    return this.estado === ESTADOS_ESTACION.OPERATIVA;
  }
}

export default Estacion;
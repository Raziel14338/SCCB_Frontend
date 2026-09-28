export const ESTADOS_CENTRO_ACOPIO = Object.freeze({
  OPERATIVO: "OPERATIVO",
  INACTIVO: "INACTIVO",
  MANTENIMIENTO: "MANTENIMIENTO",
});
// SUPUESTO: infraestructuraservice.js solo hace `estado = existente.estado`
// sin validar contra un ENUM explícito, así que estos tres valores son una
// suposición razonable (mismo patrón que ESTADOS_CISTERNA). Ajustar si el
// ENUM real de la tabla `centros_acopio` trae otros nombres.

/**
 * CentroAcopio
 * ------------------------------------------------------------------
 * Mapea una fila de `centros_acopio`. El backend hace `SELECT *`, así
 * que puede haber columnas extra que no vimos en el INSERT; este
 * modelo solo mapea los campos confirmados por
 * InfraestructuraService#crearCentroAcopio.
 */
class CentroAcopio {
  constructor({
    idCentro,
    nombre,
    ubicacion,
    latitud = null,
    longitud = null,
    capacidadAlmacen,
    estado,
  } = {}) {
    this.idCentro = idCentro;
    this.nombre = nombre;
    this.ubicacion = ubicacion;
    this.latitud = latitud != null ? Number(latitud) : null;
    this.longitud = longitud != null ? Number(longitud) : null;
    this.capacidadAlmacen = Number(capacidadAlmacen ?? 0);
    this.estado = estado;
  }

  static fromApi(data) {
    if (!data) return null;
    return new CentroAcopio({
      idCentro: data.id_centro,
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      latitud: data.latitud,
      longitud: data.longitud,
      capacidadAlmacen: data.capacidad_almacen,
      estado: data.estado,
    });
  }

  static listaFromApi(data = []) {
    return data.map(CentroAcopio.fromApi);
  }

  estaOperativo() {
    return this.estado === ESTADOS_CENTRO_ACOPIO.OPERATIVO;
  }

  tieneCoordenadas() {
    return this.latitud != null && this.longitud != null;
  }
}

export default CentroAcopio;
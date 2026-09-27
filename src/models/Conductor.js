/**
 * Conductor
 * ------------------------------------------------------------------
 * El backend nunca expone la CI en texto plano salvo en
 * GET /conductores/:id (endpoint sensible, solo lectura puntual); el
 * listado (GET /obtener/conductores) la omite a propósito para
 * minimizar exposición del dato confidencial. Por eso `ci` acá es
 * opcional: viene poblado solo cuando el backend decidió incluirlo.
 */
class Conductor {
  constructor({
    idConductor,
    nombreCompleto,
    ci = null,
    licenciaConducir = null,
    telefono = null,
    fechaRegistro = null,
    estado,
  } = {}) {
    this.idConductor = idConductor;
    this.nombreCompleto = nombreCompleto;
    this.ci = ci;
    this.licenciaConducir = licenciaConducir;
    this.telefono = telefono;
    this.fechaRegistro = fechaRegistro ? new Date(fechaRegistro) : null;
    this.estado = estado;
  }

  static fromApi(data) {
    if (!data) return null;
    return new Conductor({
      idConductor: data.id_conductor,
      nombreCompleto: data.nombre_completo,
      ci: data.ci ?? null,
      licenciaConducir: data.licencia_conducir,
      telefono: data.telefono,
      fechaRegistro: data.fecha_registro,
      estado: data.estado,
    });
  }

  static listaFromApi(data = []) {
    return data.map(Conductor.fromApi);
  }

  estaActivo() {
    return this.estado === "ACTIVO";
  }
}

export default Conductor;
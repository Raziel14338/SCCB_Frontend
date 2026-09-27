// ENUMs reales de la tabla `alertas` (ver alertascontroller.js).
// Cualquier valor fuera de estas listas hace fallar el INSERT/UPDATE
// en el backend, así que la UI valida contra las mismas constantes.
export const TIPOS_ALERTA = Object.freeze([
  "MERMA_IRREGULAR",
  "DESVIO_RUTA",
  "TIEMPO_MUERTO",
  "DISCREPANCIA_VOLUMEN",
  "CUPO_EXCEDIDO",
  "CREDENCIAL_DUPLICADA",
  "ACCESO_NO_AUTORIZADO",
]);

export const SEVERIDADES = Object.freeze({
  BAJA: "BAJA",
  MEDIA: "MEDIA",
  ALTA: "ALTA",
  CRITICA: "CRITICA",
});

export const ESTADOS_ALERTA = Object.freeze({
  ABIERTA: "ABIERTA",
  EN_REVISION: "EN_REVISION",
  RESUELTA: "RESUELTA",
  DESCARTADA: "DESCARTADA",
});

// Orden de severidad usado por el propio backend en el ORDER BY de
// listarAlertas (FIELD(severidad, 'CRITICA','ALTA','MEDIA','BAJA')).
const ORDEN_SEVERIDAD = [
  SEVERIDADES.CRITICA,
  SEVERIDADES.ALTA,
  SEVERIDADES.MEDIA,
  SEVERIDADES.BAJA,
];

/**
 * Alerta
 * ------------------------------------------------------------------
 * Modelo de una fila de la tabla `alertas`, ya con los joins que
 * agrega el backend (placa_cisterna, placa_vehiculo, estacion,
 * resuelto_por) para no tener que resolverlos aparte en la UI.
 */
class Alerta {
  constructor({
    idAlerta,
    tipoAlerta,
    descripcion,
    severidad,
    estado,
    fechaHora,
    fechaResolucion = null,
    placaCisterna = null,
    placaVehiculo = null,
    estacion = null,
    resueltoPor = null,
  } = {}) {
    this.idAlerta = idAlerta;
    this.tipoAlerta = tipoAlerta;
    this.descripcion = descripcion;
    this.severidad = severidad;
    this.estado = estado;
    this.fechaHora = fechaHora ? new Date(fechaHora) : null;
    this.fechaResolucion = fechaResolucion ? new Date(fechaResolucion) : null;
    this.placaCisterna = placaCisterna;
    this.placaVehiculo = placaVehiculo;
    this.estacion = estacion;
    this.resueltoPor = resueltoPor;
  }

  static fromApi(data) {
    if (!data) return null;
    return new Alerta({
      idAlerta: data.id_alerta,
      tipoAlerta: data.tipo_alerta,
      descripcion: data.descripcion,
      severidad: data.severidad,
      estado: data.estado,
      fechaHora: data.fecha_hora,
      fechaResolucion: data.fecha_resolucion,
      placaCisterna: data.placa_cisterna,
      placaVehiculo: data.placa_vehiculo,
      estacion: data.estacion,
      resueltoPor: data.resuelto_por,
    });
  }

  static listaFromApi(data = []) {
    return data.map(Alerta.fromApi);
  }

  /** Referencia legible: la cisterna, el vehículo o la estación involucrada. */
  get referencia() {
    return this.placaCisterna || this.placaVehiculo || this.estacion || "—";
  }

  esCritica() {
    return this.severidad === SEVERIDADES.CRITICA;
  }

  estaAbierta() {
    return this.estado === ESTADOS_ALERTA.ABIERTA;
  }

  estaCerrada() {
    return (
      this.estado === ESTADOS_ALERTA.RESUELTA ||
      this.estado === ESTADOS_ALERTA.DESCARTADA
    );
  }

  /** Índice de severidad para ordenar en la UI igual que lo hace el backend. */
  get ordenSeveridad() {
    const indice = ORDEN_SEVERIDAD.indexOf(this.severidad);
    return indice === -1 ? ORDEN_SEVERIDAD.length : indice;
  }
}

export default Alerta;
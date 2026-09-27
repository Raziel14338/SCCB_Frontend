/**
 * EstadisticasGenerales
 * ------------------------------------------------------------------
 * Mapea la respuesta de GET /reportes/estadisticas — las tarjetas de
 * resumen en la parte superior del dashboard.
 */
class EstadisticasGenerales {
  constructor({
    fecha,
    volumenDespachadoLitros,
    alertasCriticasAbiertas,
    cisternasEnRuta,
    despachos = { total: 0, autorizados: 0, denegados: 0 },
    vehiculosBloqueados,
  } = {}) {
    this.fecha = fecha;
    this.volumenDespachadoLitros = volumenDespachadoLitros;
    this.alertasCriticasAbiertas = alertasCriticasAbiertas;
    this.cisternasEnRuta = cisternasEnRuta;
    this.despachos = despachos;
    this.vehiculosBloqueados = vehiculosBloqueados;
  }

  static fromApi(data) {
    if (!data) return null;
    return new EstadisticasGenerales({
      fecha: data.fecha,
      volumenDespachadoLitros: Number(data.volumen_despachado_litros ?? 0),
      alertasCriticasAbiertas: Number(data.alertas_criticas_abiertas ?? 0),
      cisternasEnRuta: Number(data.cisternas_en_ruta ?? 0),
      despachos: {
        total: Number(data.despachos?.total ?? 0),
        autorizados: Number(data.despachos?.autorizados ?? 0),
        denegados: Number(data.despachos?.denegados ?? 0),
      },
      vehiculosBloqueados: Number(data.vehiculos_bloqueados ?? 0),
    });
  }

  get tasaAutorizacion() {
    if (this.despachos.total === 0) return 0;
    return Number(
      ((this.despachos.autorizados / this.despachos.total) * 100).toFixed(1)
    );
  }
}

/** Una fila del cruce volumétrico (salida en centro de acopio vs. llegada a estación). */
class FilaCruceVolumetrico {
  constructor({
    documentoReferencia,
    idCisterna,
    placaCisterna,
    tipoCombustible,
    volumenSalida,
    volumenLlegada,
    diferenciaLitros,
    porcentajeMerma,
  } = {}) {
    this.documentoReferencia = documentoReferencia;
    this.idCisterna = idCisterna;
    this.placaCisterna = placaCisterna;
    this.tipoCombustible = tipoCombustible;
    this.volumenSalida = volumenSalida;
    this.volumenLlegada = volumenLlegada;
    this.diferenciaLitros = diferenciaLitros;
    this.porcentajeMerma = porcentajeMerma;
  }

  static fromApi(data) {
    return new FilaCruceVolumetrico({
      documentoReferencia: data.documento_referencia,
      idCisterna: data.id_cisterna,
      placaCisterna: data.placa_cisterna,
      tipoCombustible: data.tipo_combustible,
      volumenSalida: Number(data.volumen_salida ?? 0),
      volumenLlegada: Number(data.volumen_llegada ?? 0),
      diferenciaLitros: Number(data.diferencia_litros ?? 0),
      porcentajeMerma: Number(data.porcentaje_merma ?? 0),
    });
  }

  /** Merma relevante para resaltar en la UI (backend ya filtra salidas > 0). */
  esMermaAlta() {
    return this.porcentajeMerma >= 5;
  }
}

/**
 * CruceVolumetrico
 * ------------------------------------------------------------------
 * Envoltorio de la respuesta completa de GET /reportes/cruce-volumetrico.
 */
class CruceVolumetrico {
  constructor({ totalRegistros = 0, totalMermaLitros = 0, filas = [] } = {}) {
    this.totalRegistros = totalRegistros;
    this.totalMermaLitros = totalMermaLitros;
    this.filas = filas;
  }

  static fromApi(data) {
    if (!data) return new CruceVolumetrico();
    return new CruceVolumetrico({
      totalRegistros: Number(data.total_registros ?? 0),
      totalMermaLitros: Number(data.total_merma_litros ?? 0),
      filas: (data.cruce ?? []).map(FilaCruceVolumetrico.fromApi),
    });
  }
}

export { EstadisticasGenerales, CruceVolumetrico, FilaCruceVolumetrico };
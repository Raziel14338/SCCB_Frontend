import BaseService from "./BaseService";
import CentroAcopio from "../models/CentroAcopio";
import Estacion from "../models/Estacion";
import Surtidor from "../models/Surtidor";

/**
 * InfraestructuraService
 * ------------------------------------------------------------------
 * Habla con operationsroutes.js (los endpoints de
 * InfraestructuraController): centros de acopio, estaciones de
 * servicio y surtidores. Sin `resourcePath` fijo — igual que
 * ConductorService/VehiculoService/UsuariosService — porque el
 * backend no usa un prefijo REST uniforme (POST /centros-acopio pero
 * GET /obtener/centros-acopio, etc.), así que cada método arma su
 * ruta completa vía `buildUrl`.
 *
 * Se mantiene un solo Service para las tres entidades en vez de tres
 * Services separados porque comparten controlador y ciclo de vida en
 * el backend (InfraestructuraController/InfraestructuraService), y
 * porque la pantalla que los consume (gestión de infraestructura)
 * los trata como pestañas de un mismo panel, igual que Admindasboard
 * hace con usuarios/conductores/vehículos/cisternas.
 */
class InfraestructuraService extends BaseService {
  constructor() {
    super("");
  }

  // ================== CENTROS DE ACOPIO ==================

  /**
   * POST /centros-acopio
   * Requiere nombre, ubicacion y capacidadAlmacen (el backend
   * responde 400 si falta alguno).
   */
  async crearCentroAcopio({ nombre, ubicacion, latitud, longitud, capacidadAlmacen }) {
    const data = await this.http.post(this.buildUrl("/centros-acopio"), {
      nombre,
      ubicacion,
      latitud,
      longitud,
      capacidad_almacen: capacidadAlmacen,
    });
    return CentroAcopio.fromApi(data.centro);
  }

  /** GET /obtener/centros-acopio?estado=OPERATIVO */
  async listarCentrosAcopio({ estado } = {}) {
    const data = await this.http.get(this.buildUrl("/obtener/centros-acopio"), {
      params: estado ? { estado } : undefined,
    });
    return CentroAcopio.listaFromApi(data.centros);
  }

  /** GET /centros-acopio/:id */
  async obtenerCentroAcopioPorId(idCentro) {
    const data = await this.http.get(this.buildUrl(`/centros-acopio/${idCentro}`));
    return CentroAcopio.fromApi(data.centro);
  }

  /**
   * PUT /centros-acopio/:id
   * Update parcial: el backend solo pisa los campos que vienen en el
   * body, así que `cambios` puede traer un subconjunto de campos.
   */
  async actualizarCentroAcopio(idCentro, cambios) {
    const data = await this.http.put(this.buildUrl(`/centros-acopio/${idCentro}`), {
      nombre: cambios.nombre,
      ubicacion: cambios.ubicacion,
      latitud: cambios.latitud,
      longitud: cambios.longitud,
      capacidad_almacen: cambios.capacidadAlmacen,
      estado: cambios.estado,
    });
    return CentroAcopio.fromApi(data.centro);
  }

  /** DELETE /centros-acopio/:id */
  async eliminarCentroAcopio(idCentro) {
    return this.http.delete(this.buildUrl(`/centros-acopio/${idCentro}`));
  }

  // ================== ESTACIONES DE SERVICIO ==================

  /**
   * POST /estaciones
   * Requiere nombre, codigoYpfb y ubicacion (400 si falta alguno,
   * 409 si el código YPFB ya está registrado).
   */
  async crearEstacion({ nombre, codigoYpfb, ubicacion, latitud, longitud }) {
    const data = await this.http.post(this.buildUrl("/estaciones"), {
      nombre,
      codigo_ypfb: codigoYpfb,
      ubicacion,
      latitud,
      longitud,
    });
    return Estacion.fromApi(data.estacion);
  }

  /** GET /obtener/estaciones?estado=OPERATIVA */
  async listarEstaciones({ estado } = {}) {
    const data = await this.http.get(this.buildUrl("/obtener/estaciones"), {
      params: estado ? { estado } : undefined,
    });
    return Estacion.listaFromApi(data.estaciones);
  }

  /** GET /estaciones/:id */
  async obtenerEstacionPorId(idEstacion) {
    const data = await this.http.get(this.buildUrl(`/estaciones/${idEstacion}`));
    return Estacion.fromApi(data.estacion);
  }

  /** PUT /estaciones/:id — update parcial, mismo criterio que centros de acopio. */
  async actualizarEstacion(idEstacion, cambios) {
    const data = await this.http.put(this.buildUrl(`/estaciones/${idEstacion}`), {
      nombre: cambios.nombre,
      codigo_ypfb: cambios.codigoYpfb,
      ubicacion: cambios.ubicacion,
      latitud: cambios.latitud,
      longitud: cambios.longitud,
      estado: cambios.estado,
    });
    return Estacion.fromApi(data.estacion);
  }

  /**
   * DELETE /estaciones/:id
   * OJO: el backend tiene ON DELETE CASCADE de estaciones hacia
   * surtidores — eliminar una estación borra en cascada todos sus
   * surtidores. La pantalla debe advertir esto antes de confirmar.
   */
  async eliminarEstacion(idEstacion) {
    return this.http.delete(this.buildUrl(`/estaciones/${idEstacion}`));
  }

  // ================== SURTIDORES ==================

  /**
   * POST /surtidores
   * Requiere idEstacion, numeroSurtidor y tipoCombustible (400 si
   * falta alguno, 404 si la estación no existe, 409 si el número de
   * surtidor ya existe en esa estación).
   */
  async crearSurtidor({ idEstacion, numeroSurtidor, tipoCombustible, tieneOcr, tieneRfid }) {
    const data = await this.http.post(this.buildUrl("/surtidores"), {
      id_estacion: idEstacion,
      numero_surtidor: numeroSurtidor,
      tipo_combustible: tipoCombustible,
      tiene_ocr: tieneOcr,
      tiene_rfid: tieneRfid,
    });
    return Surtidor.fromApi(data.surtidor);
  }

  /** GET /estaciones/:id_estacion/surtidores */
  async listarSurtidoresPorEstacion(idEstacion) {
    const data = await this.http.get(this.buildUrl(`/estaciones/${idEstacion}/surtidores`));
    return Surtidor.listaFromApi(data.surtidores);
  }

  /** GET /obtener/surtidores — todas las estaciones, con nombre_estacion. */
  async listarTodosSurtidores() {
    const data = await this.http.get(this.buildUrl("/obtener/surtidores"));
    return Surtidor.listaFromApi(data.surtidores);
  }
}

export default InfraestructuraService;
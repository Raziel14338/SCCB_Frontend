import BaseService from "./BaseService";
import Vehiculo from "../models/Vehiculo";

/**
 * VehiculoService
 * ------------------------------------------------------------------
 * Habla con vehiculosroutes.js. Sin resourcePath fijo por la misma
 * razón que ConductorService: el listado vive en /obtener/vehiculos.
 */
class VehiculoService extends BaseService {
  constructor() {
    super("");
  }

  /**
   * POST /vehiculos
   * Requiere placa, rfidTag, capacidadTanque e idConductor (el
   * backend responde 400 si falta alguno, 409 si la placa o el RFID
   * ya están registrados, y 400 si el conductor no existe).
   */
  async registrar({ placa, rfidTag, tipoVehiculo, capacidadTanque, idConductor }) {
    const data = await this.http.post(this.buildUrl("/vehiculos"), {
      placa,
      rfid_tag: rfidTag,
      tipo_vehiculo: tipoVehiculo,
      capacidad_tanque: capacidadTanque,
      id_conductor: idConductor,
    });
    return Vehiculo.fromApi(data.vehiculo);
  }

  /** GET /obtener/vehiculos?estado=ACTIVO&id_conductor=3 */
  async listar({ estado, idConductor } = {}) {
    const data = await this.http.get(this.buildUrl("/obtener/vehiculos"), {
      params: { estado, id_conductor: idConductor },
    });
    return Vehiculo.listaFromApi(data.vehiculos);
  }

  /** GET /vehiculos/placa/:placa */
  async obtenerPorPlaca(placa) {
    const data = await this.http.get(this.buildUrl(`/vehiculos/placa/${placa}`));
    return Vehiculo.fromApi(data.vehiculo);
  }

  /** GET /vehiculos/rfid/:rfid_tag */
  async obtenerPorRfid(rfidTag) {
    const data = await this.http.get(this.buildUrl(`/vehiculos/rfid/${rfidTag}`));
    return Vehiculo.fromApi(data.vehiculo);
  }

  /** PATCH /vehiculos/:placa/estado — estado: "ACTIVO" | "BLOQUEADO" | "INACTIVO". */
  async actualizarEstado(placa, estado) {
    const data = await this.http.patch(this.buildUrl(`/vehiculos/${placa}/estado`), {
      estado,
    });
    return Vehiculo.fromApi(data.vehiculo);
  }
}

export default VehiculoService;
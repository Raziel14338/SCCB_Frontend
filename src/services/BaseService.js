import HttpClient from "../config/HttpClient";

/**
 * BaseService
 * ------------------------------------------------------------------
 * Clase padre de todos los Services del sistema (AuthService,
 * AlertasService, ReportesService, etc.).
 *
 * Cada Service concreto:
 * 1. Extiende BaseService y define su `resourcePath` (ej: "/alertas").
 * 2. Usa `this.http` para hablar con el backend.
 * 3. Es responsable de convertir JSON <-> instancias de su Modelo.
 *
 * Esto mantiene el patrón consistente en todos los módulos sin
 * repetir la configuración de HttpClient en cada uno.
 */
class BaseService {
  constructor(resourcePath = "") {
    this.resourcePath = resourcePath;
    this.http = HttpClient.getInstance();
  }

  buildUrl(path = "") {
    return `${this.resourcePath}${path}`;
  }
}

export default BaseService;
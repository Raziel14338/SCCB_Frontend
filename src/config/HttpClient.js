import axios from "axios";

/**
 * HttpClient
 * ------------------------------------------------------------------
 * Envoltorio (wrapper) sobre Axios, implementado como Singleton.
 * Es el único punto de la aplicación que sabe cómo hablar con el
 * backend: base URL, headers, interceptores de request/response y
 * manejo centralizado de errores/expiración de sesión.
 *
 * Todas las clases de Servicio (AuthService, DespachoService, etc.)
 * deben construirse sobre esta clase en lugar de importar `axios`
 * directamente. Esto evita repetir configuración y permite cambiar
 * de librería HTTP en un solo lugar el día de mañana.
 */
class HttpClient {
  static #instance = null;

  #axiosInstance;
  #onUnauthorized = null; // callback opcional, lo fija AuthContext

  constructor() {
    if (HttpClient.#instance) {
      // Evita que alguien haga `new HttpClient()` por accidente
      // y termine con dos instancias con interceptores duplicados.
      return HttpClient.#instance;
    }

    this.#axiosInstance = axios.create({
      baseURL: import.meta.env?.VITE_API_URL || "http://localhost:3700",
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.#registrarInterceptores();

    HttpClient.#instance = this;
  }

  /** Punto de acceso único al Singleton. */
  static getInstance() {
    if (!HttpClient.#instance) {
      HttpClient.#instance = new HttpClient();
    }
    return HttpClient.#instance;
  }

  /**
   * Permite que capas superiores (ej. AuthContext) reaccionen
   * cuando el backend responde 401 (token vencido/ inválido),
   * sin que HttpClient necesite conocer React ni el router.
   */
  setOnUnauthorized(callback) {
    this.#onUnauthorized = callback;
  }

  #registrarInterceptores() {
    // Request: inyecta el JWT en cada petición saliente
    this.#axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response: maneja 401 de forma centralizada
    this.#axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          if (typeof this.#onUnauthorized === "function") {
            this.#onUnauthorized();
          }
        }
        return Promise.reject(this.#normalizarError(error));
      }
    );
  }

  #normalizarError(error) {
    const mensaje =
      error.response?.data?.mensaje ||
      error.response?.data?.error ||
      error.message ||
      "Error de comunicación con el servidor";
    return { ...error, mensaje };
  }

  get(url, config) {
    return this.#axiosInstance.get(url, config).then((r) => r.data);
  }

  post(url, body, config) {
    return this.#axiosInstance.post(url, body, config).then((r) => r.data);
  }

  put(url, body, config) {
    return this.#axiosInstance.put(url, body, config).then((r) => r.data);
  }

  patch(url, body, config) {
    return this.#axiosInstance.patch(url, body, config).then((r) => r.data);
  }

  delete(url, config) {
    return this.#axiosInstance.delete(url, config).then((r) => r.data);
  }
}

export default HttpClient;
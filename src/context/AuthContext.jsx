import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AuthService from "../services/AuthService";
import HttpClient from "../config/HttpClient";

/**
 * AuthContext / AuthProvider
 * ------------------------------------------------------------------
 * Puente entre la capa de clases (AuthService, Usuario) y el árbol
 * de componentes de React. El Provider NO contiene lógica de
 * negocio: solo mantiene el estado de UI (usuario, loading) y
 * delega toda operación real a AuthService.
 */
const AuthContext = createContext(null);

const authService = AuthService.getInstance();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Al montar: si hay token, intenta rehidratar la sesión con /perfil.
  useEffect(() => {
    const httpClient = HttpClient.getInstance();
    httpClient.setOnUnauthorized(() => {
      authService.logout();
      setUsuario(null);
    });

    if (!authService.isAuthenticated()) {
      setCargando(false);
      return;
    }

    authService
      .obtenerPerfil()
      .then(setUsuario)
      .catch(() => {
        authService.logout();
        setUsuario(null);
      })
      .finally(() => setCargando(false));
  }, []);

  const login = async (nombreUsuario, password) => {
    setError(null);
    try {
      const usuarioLogueado = await authService.login(nombreUsuario, password);
      setUsuario(usuarioLogueado);
      return usuarioLogueado;
    } catch (err) {
      setError(err.mensaje || "No se pudo iniciar sesión");
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
  };

  const value = useMemo(
    () => ({
      usuario,
      cargando,
      error,
      estaAutenticado: Boolean(usuario),
      login,
      logout,
    }),
    [usuario, cargando, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
  }
  return context;
}
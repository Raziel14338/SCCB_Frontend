import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { rutaInicioParaRol } from "../config/Navegacion";

/**
 * LoginPantalla
 * ------------------------------------------------------------------
 * Tras el login lleva a cada usuario a su panel según el rol. Si ya
 * hay sesión activa, redirige sin mostrar el formulario.
 */
function LoginPantalla() {
  const { login, error, usuario, cargando } = useAuth();
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!cargando && usuario) {
    return <Navigate to={rutaInicioParaRol(usuario.nombreRol)} replace />;
  }

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    try {
      const logueado = await login(nombreUsuario, password);
      navigate(rutaInicioParaRol(logueado.nombreRol), { replace: true });
    } catch {
      // El mensaje ya quedó en `error` desde el contexto
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h1>Iniciar sesión</h1>

      <label>
        Usuario
        <input
          type="text"
          value={nombreUsuario}
          onChange={(e) => setNombreUsuario(e.target.value)}
          autoComplete="username"
          required
        />
      </label>

      <label>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      {error && <p className="login-error">{error}</p>}

      <button type="submit" disabled={enviando}>
        {enviando ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}

export default LoginPantalla;
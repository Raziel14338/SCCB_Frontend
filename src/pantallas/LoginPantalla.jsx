import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * LoginPantalla
 * ------------------------------------------------------------------
 * Ejemplo de cómo un componente de UI consume el AuthContext.
 * El componente solo maneja estado de formulario; toda la lógica
 * de negocio (validar credenciales, guardar token) vive en
 * AuthService, a través de useAuth().login().
 */
function LoginPantalla() {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    try {
      const usuario = await login(nombreUsuario, password);
      // Cada rol aterriza en su propio panel. Ajustar las rutas cuando
      // se definan las pantallas reales en los módulos 2+.
      if (usuario.esAdminRed()) {
        navigate("/admin/dashboard");
      } else if (usuario.esFiscalAnh()) {
        navigate("/fiscalizacion/dashboard");
      } else if (usuario.esOperadorYpfb()) {
        navigate("/operador/dashboard");
      } else {
        navigate("/");
      }
    } catch {
      // El mensaje de error ya quedó disponible en `error` desde el contexto
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
          required
        />
      </label>

      <label>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
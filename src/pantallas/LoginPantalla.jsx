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
      await login(nombreUsuario, password);
      navigate("/dashboard");
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
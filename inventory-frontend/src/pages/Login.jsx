import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaLock, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

function Login() {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 Si ya está logueado, redirigir
  useEffect(() => {
    if (user && token) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Usuario o contraseña incorrectos");
        return;
      }

      const data = await res.json(); // { token: "..." }

      // 🔥 SOLO guardamos el token
      login(data.token);

      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error(err);
      setError("Error conectando con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Lado izquierdo */}
    <div className="login-left">
      <div className="login-left-top">
       <div className="brand">
        <div className="brand-icon">📦</div>
      
    </div>
      <span>Inventory System</span>
    

    <h1>
      Gestiona tu inventario
      <br />
      con precisión y
      <br />
      eficiencia
    </h1>

    <div className="features">
      <div className="feature">
        <div className="feature-icon">📊</div>
        <div>
          <h4>Control total de inventario</h4>
          <p>Monitorea stock en tiempo real con precisión milimétrica.</p>
        </div>
      </div>

      <div className="feature">
        <div className="feature-icon">📈</div>
        <div>
          <h4>Reportes detallados</h4>
          <p>Analiza tendencias y métricas clave para tomar mejores decisiones.</p>
        </div>
      </div>

      <div className="feature">
        <div className="feature-icon">🏬</div>
        <div>
          <h4>Múltiples almacenes</h4>
          <p>Gestiona todas tus ubicaciones desde una sola plataforma centralizada.</p>
        </div>
      </div>
    </div>
  </div>

  <div className="login-left-footer">
    © 2026 Inventory System Inc. Todos los derechos reservados.
    <div className="footer-links">
      <span>Privacidad</span>
      <span>Términos</span>
    </div>
  </div>
</div>

      {/* Lado derecho */}
      <div className="login-right">
        <h5>BIENVENIDO DE VUELTA</h5>
        <h2>Inicio de Sesión</h2>
        <p>Ingresa tus credenciales para acceder al sistema.</p>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={handleSubmit}>

          <div className="input-group">
            <FaUser className="icon-input" />
            <input
              name="username"
              placeholder="Usuario"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="icon-input" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
            <FaEyeSlash
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Cargando..." : "ENTRAR →"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;
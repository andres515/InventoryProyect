import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaLock, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

function Login() {

  const { token, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 NUEVO — estado del carrusel
  const [slide, setSlide] = useState(0);

  // 🔥 NUEVO — auto cambio de slide
  useEffect(() => {
    const interval = setInterval(() => {
      setSlide(prev => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // ===============================
  // DECODIFICAR JWT
  // ===============================
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  // ===============================
  // REDIRECCIÓN AUTOMÁTICA
  // ===============================
  useEffect(() => {
    if (token) {

      const decoded = parseJwt(token);
      const role = decoded?.role;

      if (role === "SUPER_ADMIN") {
        navigate("/business", { replace: true });
      } else if (role === "ADMIN") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/products", { replace: true });
      }
    }
  }, [token, navigate]);

  // ===============================
  // INPUTS
  // ===============================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ===============================
  // LOGIN
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Usuario o contraseña incorrectos");
        return;
      }

      const data = await res.json();

      login(data.token);

      const decoded = parseJwt(data.token);
      const role = decoded?.role;

      if (role === "SUPER_ADMIN") {
        navigate("/business", { replace: true });
      } else if (role === "ADMIN") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/products", { replace: true });
      }

    } catch (err) {
      console.error(err);
      setError("Error conectando con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ===== LEFT (CARRUSEL) ===== */}
      <div className="login-left">

        {/* Brand fijo */}
        <div className="brand">
          
          <span>Sistema de inventarios</span>
        </div>

        {/* Carrusel */}
        <div className="carousel-left">

          <div className={`slide ${slide === 0 ? "active" : ""}`}>
            <h1>
              Gestiona tu inventario
              <br />
              con precisión y eficiencia
            </h1>
            <p>Control total de stock en tiempo real.</p>
          </div>

          <div className={`slide ${slide === 1 ? "active" : ""}`}>
            <h1>
              Reportes inteligentes
              <br />
              para decisiones estratégicas
            </h1>
            <p>Analiza métricas clave fácilmente.</p>
          </div>

          <div className={`slide ${slide === 2 ? "active" : ""}`}>
            <h1>
              Administra múltiples
              <br />
              almacenes sin esfuerzo
            </h1>
            <p>Gestiona todo desde una sola plataforma.</p>
          </div>

        </div>

        {/* Indicadores */}
        <div className="carousel-dots">
          {[0,1,2].map((i) => (
            <span
              key={i}
              className={slide === i ? "dot active" : "dot"}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>

        <div className="login-left-footer">
          © 2026 Inventory System Inc.
        </div>

      </div>

      {/* ===== RIGHT ===== */}
      <div className="login-right">

  <div className="login-card">

    <div className="login-header">
      <h5>BIENVENIDO DE VUELTA</h5>
      <h2>Inicio de Sesión</h2>
      <p>Ingresa tus credenciales para acceder.</p>
    </div>

    {error && <p className="error-text">{error}</p>}

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
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Cargando..." : "ENTRAR →"}
      </button>

    </form>

  </div>

</div>

    </div>
  );
}

export default Login;
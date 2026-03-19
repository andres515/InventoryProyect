import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import styles from "./BusinessPage.module.css";

export default function BusinessPage() {

  const navigate = useNavigate();
  const { logout } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("El nombre de la empresa es obligatorio");
      return;
    }

    try {

      setLoading(true);

      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      };

      console.log("Enviando empresa:", payload);

      const response = await api.post("/business", payload);

      console.log("Empresa creada:", response.data);

      alert(`Empresa creada: ${response.data.name}`);

      // cerrar sesión para que el nuevo admin entre con sus credenciales
      logout();

      navigate("/login", { replace: true });

    } catch (err) {

      console.error("Error creando empresa:", err);

      if (err.response) {
        console.log("Respuesta backend:", err.response.data);
        setError(err.response.data || "Error creando empresa");
      } else {
        setError("No se pudo conectar con el servidor");
      }

    } finally {
      setLoading(false);
    }

  };

  return (
    <div className={styles.container}>

      <div className={styles.left}>
        <div className={styles.leftContent}>

          <span className={styles.badge}>Plataforma inteligente</span>

          <h1 className={styles.title}>
            Administra tu negocio <br /> sin complicaciones
          </h1>

          <p className={styles.description}>
            Controla inventario, ventas y usuarios desde un solo lugar.
          </p>

          <ul className={styles.benefits}>
            <li className={styles.benefitItem}>Control total del inventario</li>
            <li className={styles.benefitItem}>Reportes automáticos</li>
            <li className={styles.benefitItem}>Acceso seguro</li>
          </ul>

        </div>
      </div>

      <div className={styles.right}>

        <div className={styles.card}>

          <div className={styles.header}>
            <div className={styles.logo}>IB</div>

            <h2>Crear Empresa</h2>

            <p className={styles.subtitle}>
              Configura tu negocio en menos de 1 minuto
            </p>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>

            <input
              className={styles.input}
              placeholder="Nombre empresa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              className={styles.input}
              placeholder="Correo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className={styles.input}
              placeholder="Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >
              {loading ? "Creando empresa..." : "Crear Empresa"}
            </button>

          </form>

          <span className={styles.secure}>
            🔒 Tus datos están protegidos
          </span>

        </div>

      </div>

    </div>
  );
}
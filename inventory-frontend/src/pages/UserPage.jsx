import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function UserPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
    businessId: "",
  });
  const [error, setError] = useState("");

  // Cargar usuarios y negocios
  useEffect(() => {
    fetch("http://localhost:8080/api/user")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error(err));

    fetch("http://localhost:8080/api/business")
      .then(res => res.json())
      .then(data => setBusinesses(data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.businessId) {
      setError("Debes seleccionar un negocio");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg);
        return;
      }

      const newUser = await res.json();
      setUsers([...users, newUser]); // 🔄 actualizar lista
      setForm({ username: "", email: "", password: "", role: "USER", businessId: "" });
    } catch (err) {
      setError("Error creando usuario");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Registrar Usuario</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          placeholder="Usuario"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="password"
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select
          name="businessId"
          value={form.businessId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecciona un negocio</option>
          {businesses.map(b => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
        >
          Crear Usuario
        </button>
      </form>

      <hr className="my-6" />
      <h3 className="text-xl font-bold mb-2">Usuarios existentes</h3>
      {users.map(u => (
        <div key={u.id} className="border p-2 mb-2 rounded">
          <strong>{u.username}</strong> - {u.email} - Rol: {u.role} - Negocio: {u.business?.name || "-"}
        </div>
      ))}
    </div>
  );
}
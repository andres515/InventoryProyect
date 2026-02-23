import React, { useState, useEffect } from "react";

export default function UserForm({ onUserCreated, editingUser }) {
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "USER",
    businessId: "",
    id: null,
  });
  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState("");

  // Traer todos los negocios para el dropdown
  useEffect(() => {
    fetch("http://localhost:8080/api/business")
      .then((res) => res.json())
      .then((data) => setBusinesses(data))
      .catch((err) => console.error(err));
  }, []);

  // Llenar formulario si se está editando
  useEffect(() => {
    if (editingUser) {
      setUser({
        username: editingUser.username || "",
        email: editingUser.email || "",
        password: "", // no mostramos la contraseña por seguridad
        role: editingUser.role || "USER",
        businessId: editingUser.business?.id || "",
        id: editingUser.id,
      });
    }
  }, [editingUser]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user.businessId) {
      setError("Debes seleccionar un negocio");
      return;
    }

    try {
      const url = editingUser
        ? `http://localhost:8080/api/user/${user.id}`
        : "http://localhost:8080/api/user";

      const method = editingUser ? "PUT" : "POST";

      // Si estamos editando y password está vacío, no lo enviamos
      const payload = { ...user };
      if (editingUser && !user.password) delete payload.password;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const message = await res.text();
        setError(message);
        return;
      }

      const savedUser = await res.json();
      setUser({ username: "", email: "", password: "", role: "USER", businessId: "", id: null });
      onUserCreated(savedUser);
    } catch (err) {
      console.error(err);
      setError("Error al guardar usuario");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {editingUser ? "Editar Usuario" : "Registrar Usuario"}
      </h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="username"
          placeholder="Nombre de usuario"
          value={user.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={user.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="password"
          placeholder={editingUser ? "Nueva contraseña (opcional)" : "Contraseña"}
          type="password"
          value={user.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          {...(!editingUser && { required: true })}
        />
        <select
          name="role"
          value={user.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select
          name="businessId"
          value={user.businessId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecciona un negocio</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition"
        >
          {editingUser ? "Guardar Cambios" : "Registrar"}
        </button>
      </form>
    </div>
  );
}
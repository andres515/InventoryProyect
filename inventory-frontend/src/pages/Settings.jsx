import { useEffect, useState } from "react";
import { createUser, getUsers, deleteUser } from "../services/userService";
import "./Settings.css";

function Settings() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "USER",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUser(form);
      setForm({ username: "", password: "", role: "USER" });
      loadUsers();
    } catch (error) {
      alert("Error creando usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      await deleteUser(id);
      loadUsers();
    } catch (error) {
      alert("Error eliminando usuario");
    }
  };

  return (
    <div className="settings-wrapper">

      {/* ===== FORM ===== */}
      <div className="settings-card">
        <h2>Crear Usuario</h2>

        <form onSubmit={handleSubmit} className="settings-form">

          <div className="input-group">
            <label>Usuario</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Rol</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="USER">Usuario</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? "Creando..." : "Crear Usuario"}
          </button>

        </form>
      </div>

      {/* ===== TABLA ===== */}
      <div className="users-table-card">
        <h2>Usuarios del Sistema</h2>

        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4">No hay usuarios registrados</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Settings;
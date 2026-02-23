import React, { useEffect, useState } from "react";

export default function UserList({ refreshTrigger, onEdit }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const fetchUsers = () => {
    fetch("http://localhost:8080/api/user")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => {
        console.error(err);
        setError("Error al cargar los usuarios");
      });
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;

    try {
      const res = await fetch(`http://localhost:8080/api/user/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchUsers(); // recargar lista
      } else {
        setError("No se pudo eliminar el usuario");
      }
    } catch (err) {
      console.error(err);
      setError("Error al eliminar usuario");
    }
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Lista de Usuarios</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2 text-left">Usuario</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Rol</th>
            <th className="border p-2 text-left">Negocio</th>
            <th className="border p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-100">
              <td className="border p-2">{u.username}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role}</td>
              <td className="border p-2">{u.business?.name || "-"}</td>
              <td className="border p-2 space-x-2">
                <button
                  className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                  onClick={() => onEdit(u)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  onClick={() => handleDelete(u.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
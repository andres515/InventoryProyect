import React, { useState } from "react";

export default function BusinessForm({ onBusinessCreated }) {
  const [business, setBusiness] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setBusiness({ ...business, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8080/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(business),
      });

      if (!res.ok) {
        const message = await res.text();
        setError(message);
        return;
      }

      const newBusiness = await res.json();
      setBusiness({ name: "", email: "", phone: "" });
      onBusinessCreated(newBusiness);
    } catch (err) {
      setError("Error al registrar negocio");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Registrar Negocio</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Nombre del negocio"
          value={business.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={business.email}
          onChange={handleChange}
          type="email"
          className="w-full p-2 border rounded"
        />
        <input
          name="phone"
          placeholder="Teléfono"
          value={business.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition"
        >
          Registrar
        </button>
      </form>
    </div>
  );
}
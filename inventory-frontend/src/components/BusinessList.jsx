import React, { useEffect, useState } from "react";

export default function BusinessList({ refreshTrigger }) {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/business")
      .then((res) => res.json())
      .then((data) => setBusinesses(data))
      .catch((err) => console.error(err));
  }, [refreshTrigger]);

  return (
    <div className="max-w-md mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Lista de Negocios</h2>
      <ul className="bg-white shadow rounded divide-y">
        {businesses.map((b) => (
          <li key={b.id} className="p-4 flex justify-between">
            <div>
              <p className="font-semibold">{b.name}</p>
              <p className="text-sm text-gray-500">{b.email}</p>
              <p className="text-sm text-gray-500">{b.phone}</p>
            </div>
            <div className="text-sm text-gray-400">{new Date(b.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
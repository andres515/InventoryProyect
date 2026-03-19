import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useState } from "react";

function UploadLogo() {

  const { business, refreshBusiness } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {

    if (!business) {
      alert("Negocio aún no cargado.");
      return;
    }

    if (!file) {
      alert("Selecciona una imagen primero.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {

      setUploading(true);

      await api.post(
        `/business/${business.id}/logo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      // 🔥 refresca el negocio en toda la app
      await refreshBusiness();

      setFile(null);

      alert("Logo actualizado ✅");

    } catch (err) {

      console.error(err);
      alert("Error subiendo logo ❌");

    } finally {

      setUploading(false);

    }

  };

  return (

    <div style={{ marginTop: "20px" }}>

      <h3>Actualizar logo</h3>

      {business ? (

        <>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={uploading}
          />

          <div style={{ marginTop: "10px" }}>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              style={{
                padding: "8px 15px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >

              {uploading ? "Subiendo..." : "Subir logo"}

            </button>

          </div>

        </>

      ) : (

        <p>Cargando negocio...</p>

      )}

    </div>

  );
}

export default UploadLogo;
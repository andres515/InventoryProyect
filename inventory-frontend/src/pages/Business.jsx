import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import UploadLogo from "../components/UploadLogo";
import "./Business.css";

function Business() {

  const { business } = useAuth();
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {

    if (business?.logoUrl) {

      const url = business.logoUrl.startsWith("http")
        ? business.logoUrl
        : `http://localhost:8080${business.logoUrl}`;

      setLogoUrl(`${url}?t=${Date.now()}`);

    }

  }, [business]);

  return (

    <div className="business-container">

      <div className="business-card">

        <h1 className="business-title">
          Configuración del Negocio
        </h1>

        {!business ? (

          <p className="loading-text">
            Cargando información...
          </p>

        ) : (

          <>

            <div className="business-info">

              <h2>{business.name}</h2>

              <p className="business-email">
                {business.email}
              </p>

              <p className="business-phone">
                {business.phone}
              </p>

            </div>

            {logoUrl && (

              <div className="logo-section">

                <p className="section-title">
                  Logo actual
                </p>

                <img
                  src={logoUrl}
                  alt="Logo negocio"
                  className="business-logo"
                />

              </div>

            )}

            <div className="upload-section">

              <UploadLogo />

            </div>

          </>

        )}

      </div>

    </div>

  );

}

export default Business;
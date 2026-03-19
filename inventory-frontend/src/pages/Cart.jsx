import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { createSale } from "../services/saleService";
import { API_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart() {

const { cartItems, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  /* ===============================
     CLIENTES
  ================================= */

  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
const [selectedClient, setSelectedClient] = useState(null);
  const [searchClient, setSearchClient] = useState("");
  const [showClientList, setShowClientList] = useState(false);
  const clientDropdownRef = useRef(null);

  /* ===============================
     MODALES
  ================================= */

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [clientWarningModal, setClientWarningModal] = useState(false);

  const [modalMessage, setModalMessage] = useState("");

  /* ===============================
     PAGO
  ================================= */

  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [change, setChange] = useState(0);

  /* ===============================
     FORMATEAR COP
  ================================= */

  const formatCOP = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString("es-CO");
  };

  /* ===============================
     CARGAR CLIENTES
  ================================= */

  useEffect(() => {

    const fetchClients = async () => {

      try {

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/api/clients`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        setClients(data);
        setFilteredClients(data);

      } catch (error) {

        console.error("Error cargando clientes:", error);

      }
    };

    fetchClients();

  }, []);

  /* ===============================  
     BUSCADOR CLIENTES
  ================================= */

useEffect(() => {

  if (!searchClient.trim()) {
    setFilteredClients([]);
    return;
  }

  const search = searchClient.toLowerCase();

  const filtered = clients.filter((client) => {

    const name = client.name ? client.name.toLowerCase() : "";
    const document = client.document ? client.document.toString() : "";

    return name.includes(search) || document.includes(search);

  });

  setFilteredClients(filtered);

}, [searchClient, clients]);

  useEffect(() => {

  const handleClickOutside = (event) => {

    if (
      clientDropdownRef.current &&
      !clientDropdownRef.current.contains(event.target)
    ) {
      setShowClientList(false);
    }

  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };

}, []);


  /* ===============================
     CALCULOS
  ================================= */

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const envio = 0;
  const total = subtotal + envio;

  /* ===============================
     ABRIR MODAL DE PAGO
  ================================= */

 const handleCheckout = () => {

  if (cartItems.length === 0) return;

  if (!selectedClient) {
    setClientWarningModal(true);
    return;
  }

  setPaymentModal(true);

};
  /* ===============================
     CALCULAR DEVUELTA
  ================================= */

  useEffect(() => {

    if (paymentMethod === "EFECTIVO") {

      const calc = Number(amountReceived) - total;
      setChange(calc > 0 ? calc : 0);

    } else {

      setChange(0);

    }

  }, [amountReceived, paymentMethod, total]);

  /* ===============================
     CONFIRMAR PAGO
  ================================= */

const confirmPayment = async () => {

  if (!paymentMethod) {
    alert("Seleccione un método de pago");
    return;
  }

  if (!selectedClient) {
    setClientWarningModal(true);
    return;
  }

  if (paymentMethod === "EFECTIVO") {

    if (!amountReceived) {
      alert("Ingrese el monto recibido");
      return;
    }

    if (Number(amountReceived) < total) {
      alert("El monto recibido es menor al total");
      return;
    }

  }

  processSale();

};

  /* ===============================
     PROCESAR VENTA
  ================================= */

  const processSale = async () => {

    try {
      console.log("CLIENTE ENVIADO:", selectedClient);

      await createSale({

        items: cartItems,
        clientId: selectedClient ? selectedClient.id : null,
        paymentMethod,

        amountReceived:
          paymentMethod === "EFECTIVO"
            ? Number(amountReceived)
            : null

      });

      clearCart();

      setPaymentModal(false);
      setAmountReceived("");
      setPaymentMethod("");
    setSelectedClient(null);

      setModalMessage("¡Venta realizada correctamente!");
      setShowSuccessModal(true);

    } catch (error) {

      console.error(error);
      alert(error.response?.data || "Error procesando la venta");

    }

  };

  const closeSuccessModal = () => {

    setShowSuccessModal(false);
    navigate("/sales");

  };

  return (

    <div className="cart-container">

      <h1 className="cart-title">Carrito de Compras</h1>
      <p className="cart-count">{cartItems.length} producto(s)</p>

      {cartItems.length === 0 ? (

        <div className="empty-cart">
          No hay productos en el carrito
        </div>

      ) : (

        <div className="cart-layout">

          {/* ================= LISTA PRODUCTOS ================= */}

          <div className="cart-items">

            {cartItems.map((item) => (

              <div key={item.id} className="cart-item">

                <img
                  src={
                    item.imageUrl
                      ? `${API_URL}/uploads/${item.imageUrl}`
                      : "https://via.placeholder.com/100"
                  }
                  alt={item.name}
                  className="cart-image"
                />

                <div className="cart-info">

                  <h3>{item.name}</h3>

                  <p>Cantidad: {item.quantity}</p>

                  <p className="price">
                    ${Number(item.price).toLocaleString("es-CO")}
                  </p>

                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  🗑
                </button>

              </div>

            ))}

          </div>

          {/* ================= RESUMEN ================= */}

          <div className="cart-summary">

            {/* BUSCADOR CLIENTE */}

           <div className="client-selector">
          <label>Cliente</label>

            <div className="client-dropdown" ref={clientDropdownRef}>

             <input
                type="text"
                placeholder="Buscar por nombre o cédula..."
                value={searchClient}
                onChange={(e) => {

                const value = e.target.value;

                setSearchClient(value);

                if (value.trim().length > 0) {
                  setShowClientList(true);
                } else {
                  setShowClientList(false);
                }

              }}
                onFocus={() => {
                  if (searchClient.length > 0) {
                    setShowClientList(true);
                  }
                }}
                className="client-search"
              />

             {showClientList && filteredClients.length > 0 && (

              <div className="client-list">

                {filteredClients.map((client) => (

                  <div
                    key={client.id}
                    className="client-option"
                    onClick={() => {

                     setSelectedClient(client);
                      setSearchClient(`${client.document} - ${client.name}`);
                      setShowClientList(false);

                    }}
                  >

                    {client.document} - {client.name}

                  </div>

                ))}

              </div>

            )}

            </div>

          </div>

            <h3 className="summary-title">
              Resumen del pedido
            </h3>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString("es-CO")}</span>
            </div>

            <div className="summary-row">
              <span>Envío</span>
              <span className="free">Gratis</span>
            </div>

            <div className="divider" />

            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toLocaleString("es-CO")}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
            >
              💳 Procesar Pago
            </button>

            <button
              className="clear-btn"
              onClick={clearCart}
            >
              🗑 Vaciar carrito
            </button>

          </div>

        </div>

      )}

      {/* MODAL CLIENTE NO SELECCIONADO */}

{clientWarningModal && (

  <div className="modal-overlay">

    <div className="modal-box">

      <h2>⚠ Cliente obligatorio</h2>

      <p>
        Debes seleccionar un cliente para continuar con la venta.
      </p>

      <div className="modal-actions">

        <button
          className="btn-primary"
          onClick={() => setClientWarningModal(false)}
        >
          Seleccionar cliente
        </button>

      </div>

    </div>

  </div>

)}
      {/* MODAL PAGO */}

      {paymentModal && (

        <div className="modal-overlay">

          <div className="modal-box">

            <h2 className="modal-title">
              Seleccionar medio de pago
            </h2>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >

              <option value="">Seleccionar</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="NEQUI">Nequi</option>
              <option value="DAVIPLATA">Daviplata</option>

            </select>

            {paymentMethod === "EFECTIVO" && (

              <div>

                <label>Monto recibido</label>

                <input
                  type="text"
                  value={formatCOP(amountReceived)}
                  onChange={(e) => {

                    const rawValue = e.target.value
                      .replace(/\./g, "")
                      .replace(/\D/g, "");

                    setAmountReceived(rawValue);

                  }}
                />

                <p>

                  Devuelta:
                  <strong>
                    ${change.toLocaleString("es-CO")}
                  </strong>

                </p>

              </div>

            )}

            <div className="modal-actions">

              <button
                className="btn-primary"
                onClick={confirmPayment}
              >
                Confirmar Pago
              </button>

              <button
                className="btn-secondary"
                onClick={() => setPaymentModal(false)}
              >
                Cancelar
              </button>

            </div>

          </div>

        </div>

      )}

      {/* MODAL ÉXITO */}

      {showSuccessModal && (

        <div className="modal-overlay">

          <div className="modal-box success">

            <h2>✅ Operación Exitosa</h2>

            <p>{modalMessage}</p>

            <button
              className="btn-primary"
              onClick={closeSuccessModal}
            >
              Aceptar
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Cart;
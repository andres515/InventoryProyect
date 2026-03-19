import { useEffect, useState } from "react";
import {
  getLayaways,
  createLayaway,
  addPayment
} from "../services/layawayService";
import { getProducts } from "../services/productService";
import "./Layaways.css";

const API_URL = "http://localhost:8080";

function Layaways() {

const [layaways, setLayaways] = useState([]);
const [products, setProducts] = useState([]);

const [clients, setClients] = useState([]);
const [filteredClients, setFilteredClients] = useState([]);
const [selectedClient, setSelectedClient] = useState(null);
const [clientSearch, setClientSearch] = useState("");

const [selectedLayaway, setSelectedLayaway] = useState(null);
const [detailLayaway, setDetailLayaway] = useState(null);
const [paymentAmount, setPaymentAmount] = useState("");
const [showDropdown, setShowDropdown] = useState(false);
const [paymentMethod, setPaymentMethod] = useState("");
const [productSearch, setProductSearch] = useState("");
const [showClientDropdown, setShowClientDropdown] = useState(false);

  const [cart, setCart] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerDocument: "",
    initialPayment: "",
    paymentMethod: ""
  });

 useEffect(() => {
  loadData();
}, []);

const loadData = async () => {

  const l = await getLayaways();
  const p = await getProducts();

  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/api/clients`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const c = await response.json();

  // 🔹 normalizar datos
  const layawaysData = Array.isArray(l) ? l : l.content || [];
  const productsData = Array.isArray(p) ? p : p.content || [];
  const clientsData = Array.isArray(c) ? c : c.content || [];

  console.log("CLIENTES NORMALIZADOS:", clientsData);

  setLayaways(layawaysData);
  setProducts(productsData);
  setClients(clientsData);
  setFilteredClients(clientsData);

};


  const formatCOP = (value) => {
    if (!value) return "$0";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const cleanNumber = (value) => value.replace(/\D/g, "");

  const getImageUrl = (imageName) => {
    if (!imageName) return "https://via.placeholder.com/100";
    return `${API_URL}/uploads/${imageName}`;
  };

 const addToCart = (product) => {

  const existing = cart.find(p => p.id === product.id);

  // cantidad actual en el separado
  const currentQuantity = existing ? existing.quantity : 0;

  // validar stock
  if (currentQuantity >= product.stock) {
    alert("No hay más stock disponible de este producto");
    return;
  }

  if (existing) {
    setCart(cart.map(p =>
      p.id === product.id
        ? { ...p, quantity: p.quantity + 1 }
        : p
    ));
  } else {
    setCart([...cart, { ...product, quantity: 1 }]);
  }

  setShowDropdown(false);
};

  const removeFromCart = (id) => {
    setCart(cart.filter(p => p.id !== id));
  };

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

 const handleCreate = async () => {

  if (cart.length === 0) {
    alert("Agrega al menos un producto");
    return;
  }

  if (!form.initialPayment || Number(cleanNumber(form.initialPayment)) <= 0) {
    alert("El abono inicial es obligatorio");
    return;
  }

  if (!form.paymentMethod) {
    alert("Selecciona un medio de pago");
    return;
  }

  if (!selectedClient) {
    alert("Selecciona un cliente");
    return;
  }

  try {

    await createLayaway({
      clientId: selectedClient.id,
      initialPayment: Number(cleanNumber(form.initialPayment)),
      paymentMethod: form.paymentMethod,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    });

    // 🔥 volver a cargar separados desde backend
    const updatedLayaways = await getLayaways();
    setLayaways(updatedLayaways);

    // limpiar formulario
    setCart([]);
    setSelectedClient(null);

    setForm({
      customerName: "",
      customerPhone: "",
      customerDocument: "",
      initialPayment: "",
      paymentMethod: ""
    });

  } catch (error) {
    console.error(error);
    alert("Error creando el separado");
  }
};

const handlePayment = async () => {

  const amount = Number(cleanNumber(paymentAmount));

  if (amount <= 0) {
    alert("Monto inválido");
    return;
  }

  if (!paymentMethod) {
    alert("Selecciona un medio de pago");
    return;
  }

  try {

    await addPayment(selectedLayaway.id, {
      amount: amount,
      paymentMethod: paymentMethod
    });

    const updated = await getLayaways();
    setLayaways(updated);

    setSelectedLayaway(null);
    setPaymentAmount("");
    setPaymentMethod("");

  } catch (error) {
    console.error(error);
    alert("Error registrando el pago");
  }
};



 const filteredLayaways = layaways.filter((l) => {

  const searchLower = search.toLowerCase();

  const matchName =
    l.customerName?.toLowerCase().includes(searchLower);

  const matchDocument =
    l.customerDocument?.toLowerCase().includes(searchLower);

  const matchStatus =
    statusFilter === "TODOS" || l.status === statusFilter;

  return (matchName || matchDocument) && matchStatus;
});

  return (
    <div className="layaway-container">
      <h1>ABONOS</h1>

      {/* FORM + RESUMEN */}
      <div className="form-wrapper">

        <div className="layaway-form">

          <div className="custom-select">
            <div
              className="selected-product"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              Agregar producto
            </div>

           {showDropdown && (
  <div className="dropdown">

    {/* BUSCADOR */}
    <input
      type="text"
      placeholder="🔍 Buscar producto..."
      className="product-search"
      value={productSearch}
      onChange={(e) => setProductSearch(e.target.value)}
    />

    {/* LISTA FILTRADA */}
    {products
      .filter(p => p.stock > 0)
      .filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      )
      .map(p => (
        <div
          key={p.id}
          className="dropdown-item"
          onClick={() => {
            addToCart(p);
            setProductSearch(""); // limpia buscador
          }}
        >
          <img
            src={getImageUrl(p.imageUrl)}
            alt={p.name}
          />

          <div className="product-info">
            <strong>{p.name}</strong>
            <p>{formatCOP(p.price)}</p>
            <small>Stock: {p.stock}</small>
          </div>
        </div>
      ))}

    {/* SI NO HAY RESULTADOS */}
    {products
      .filter(p => p.stock > 0)
      .filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
      ).length === 0 && (
        <p className="no-results">
          No se encontraron productos
        </p>
      )}

  </div>
)}
          </div>

<div className="custom-select">

  <div
    className="selected-product"
    onClick={() => setShowClientDropdown(!showClientDropdown)}
  >
    {selectedClient
      ? `${selectedClient.document} - ${selectedClient.name}`
      : "Seleccionar cliente"}
  </div>

  {showClientDropdown && (
    <div className="dropdown">

      {/* BUSCADOR */}
      <input
        type="text"
        placeholder="🔍 Buscar cliente..."
        className="product-search"
        value={clientSearch}
        onChange={(e) => setClientSearch(e.target.value)}
      />

      {/* LISTA FILTRADA */}
      {clients
        .filter(c =>
          c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
          c.document.toString().includes(clientSearch)
        )
        .map(c => (
          <div
            key={c.id}
            className="dropdown-item"
            onClick={() => {
              setSelectedClient(c);
              setClientSearch("");
              setShowClientDropdown(false);
            }}
          >
            <div className="product-info">
              <strong>{c.name}</strong>
              <p>Cédula: {c.document}</p>
            </div>
          </div>
        ))}

      {/* SIN RESULTADOS */}
      {clients.filter(c =>
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.document.toString().includes(clientSearch)
      ).length === 0 && (
        <p className="no-results">
          No se encontraron clientes
        </p>
      )}

    </div>
  )}

</div>

      <input
        required
        type="text"
        placeholder="Abono inicial"
        value={form.initialPayment ? formatCOP(form.initialPayment) : ""}
        onChange={(e) =>
          setForm({
            ...form,
            initialPayment: cleanNumber(e.target.value)
          })
        }
      />
      <select
          required
          value={form.paymentMethod}
          onChange={(e) =>
            setForm({
              ...form,
              paymentMethod: e.target.value
            })
          }
        >
          <option value="">Seleccionar medio de pago</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="NEQUI">Nequi</option>
          <option value="DAVIPLATA">Daviplata</option>
        </select>

          <button onClick={handleCreate}>
            Crear Separado
          </button>
        </div>

            <div className="cart-summary">
        <h3>Productos agregados</h3>

        <div className="cart-items-container">
          {cart.length === 0 && <p>No hay productos</p>}

          {cart.map(item => (
            <div key={item.id} className="cart-item">
              <span>{item.name} x{item.quantity}</span>
              <button onClick={() => removeFromCart(item.id)}>✕</button>
            </div>
          ))}
        </div>

        <h4>Total: {formatCOP(totalAmount)}</h4>
      </div>
      </div>

      {/* FILTROS */}
      <div className="filters">
        <input
          placeholder="Buscar por cliente o cedula"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="TODOS">Todos</option>
          <option value="ACTIVO">Activos</option>
          <option value="COMPLETADO">Completados</option>
        </select>
      </div>

      {/* TABLA PRINCIPAL */}
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Cédula</th>
            <th>Total</th>
            <th>Pagado</th>
            <th>Restante</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {filteredLayaways.map(l => (
            <tr key={l.id}>
              <td>{l.customerName}</td>
              <td>{l.customerDocument}</td>
              <td>{formatCOP(l.totalAmount)}</td>
              <td>{formatCOP(l.paidAmount)}</td>
              <td>{formatCOP(l.remainingAmount)}</td>
              <td>{l.status}</td>
              <td>
              <div className="action-buttons">
                <button
                  className="btn-detail"
                  onClick={() => setDetailLayaway(l)}
                >
                  Detalle
                </button>

                {l.status === "ACTIVO" && (
                  <button
                    className="btn-pay"
                    onClick={() => setSelectedLayaway(l)}
                  >
                    Abonar
                  </button>
                )}
              </div>
            </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL DETALLE */}
      {detailLayaway && (
        <div className="payment-modal">
          <div className="modal-content">
            <h3>Detalle del Separado</h3>

            <p><strong>Cliente:</strong> {detailLayaway.customerName}</p>
            <p><strong>Cédula:</strong> {detailLayaway.customerDocument}</p>

            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {detailLayaway.items?.map(item => (
                  <tr key={item.id}>
                    <td>{item.product.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCOP(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className="cancel"
              onClick={() => setDetailLayaway(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL ABONO */}
    {selectedLayaway && (
  <div className="payment-modal">
    <div className="modal-content">
      <h3>Nuevo Abono</h3>

      <p>
        Restante:{" "}
        <strong>
          {formatCOP(selectedLayaway.remainingAmount)}
        </strong>
      </p>

      <input
        type="text"
        placeholder="Monto"
        value={paymentAmount ? formatCOP(paymentAmount) : ""}
        onChange={(e) =>
          setPaymentAmount(cleanNumber(e.target.value))
        }
      />

      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="">Seleccionar medio de pago</option>
        <option value="EFECTIVO">Efectivo</option>
        {/* <option value="TRANSFERENCIA">Transferencia</option>
        <option value="TARJETA">Tarjeta</option> */}
        <option value="NEQUI">Nequi</option>
        <option value="DAVIPLATA">Daviplata</option>
      </select>

      <button onClick={handlePayment}>
        Confirmar
      </button>

      <button
        className="cancel"
        onClick={() => {
          setSelectedLayaway(null);
          setPaymentMethod("");
        }}
      >
        Cancelar
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default Layaways;
import { useEffect, useState } from "react";
import { getSales } from "../services/saleService";
import { getProducts } from "../services/productService";
import { processReturn } from "../services/returnService";
import { getReturns } from "../services/returnService";

import "./Returns.css";

function Returns() {

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedSale, setSelectedSale] = useState(null);
  const [oldProduct, setOldProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(null);

  const [difference, setDifference] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("EFECTIVO");

  const [saleSearch, setSaleSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [showSales, setShowSales] = useState(false);
  const [showProducts, setShowProducts] = useState(false);

  const [returns, setReturns] = useState([]);
  const [returnSearch, setReturnSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");

  const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date.split(".")[0]).toLocaleDateString("es-CO");
};

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
  try {

    const salesData = await getSales();
    const productsData = await getProducts();
    const returnsData = await getReturns();

    setSales(salesData);
    setProducts(productsData);
    setReturns(returnsData);

  } catch (error) {
    console.error("ERROR CARGANDO DATOS:", error);
  }
};

  useEffect(() => {
    calculateDifference();
  }, [oldProduct, newProduct]);

  const calculateDifference = () => {

    if (!oldProduct || !newProduct) {
      setDifference(0);
      return;
    }

    const diff = newProduct.price - oldProduct.price;

    setDifference(diff);

  };

  const formatCOP = (value) => {

    if (!value) return "$0";

    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0
    }).format(value);

  };

  const filteredSales = sales.filter(s => {

    const name = s.client?.name || "";
    const doc = s.client?.document || "";

    return (
      name.toLowerCase().includes(saleSearch.toLowerCase()) ||
      doc.toString().includes(saleSearch) ||
      s.id.toString().includes(saleSearch)
    );

  });

  const filteredProducts = products
    .filter(p => p.stock > 0)
    .filter(p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

const filteredReturns = returns.filter(r => {

  const name = (r.clientName || "").toLowerCase();
  const doc = (r.clientDocument || "").toString();
  const date = r.date ? r.date.split("T")[0] : "";

  const matchSearch =
    name.includes(returnSearch.toLowerCase()) ||
    doc.includes(returnSearch);

  const matchDate =
    !dateSearch || date === dateSearch;

  return matchSearch && matchDate;

});

 const handleReturn = async () => {

  if (!selectedSale || !oldProduct || !newProduct) {
    alert("Debe completar todos los campos");
    return;
  }

  if (difference < 0) {
    alert("No se permite cambio por menor valor");
    return;
  }

  try {

    const response = await processReturn({
      saleId: selectedSale.id,
      oldProductId: oldProduct.id,
      newProductId: newProduct.id,
      paymentMethod
    });

    console.log("DEVOLUCION CREADA:", response);

    alert("Devolución procesada");

    setSelectedSale(null);
    setOldProduct(null);
    setNewProduct(null);
    setDifference(0);

    loadData();

  } catch (error) {

    console.error("ERROR DEVOLUCION:", error);

    alert(
      error.response?.data?.message ||
      error.response?.data ||
      "Error procesando devolución"
    );

  }

};

  return (
    <div className="returns-container">

      <h1>DEVOLUCIONES</h1>

      {/* ================= SELECT VENTA ================= */}

      <div className="returns-card">

        <h2>Seleccionar venta</h2>

        <div className="custom-select">

          <div
            className="select-box"
            onClick={() => setShowSales(!showSales)}
          >

           {selectedSale
  ? `Venta #${selectedSale.id} - cc:${selectedSale.client?.document || "CF"} ${selectedSale.client?.name || "Consumidor Final"}`
  : "Seleccionar venta"}

          </div>

          {showSales && (

            <div className="dropdown">

              <input
                type="text"
                placeholder="Buscar venta..."
                value={saleSearch}
                onChange={(e) => setSaleSearch(e.target.value)}
              />

              {filteredSales.map(sale => (

                <div
                  key={sale.id}
                  className="dropdown-item"
                  onClick={() => {

                    setSelectedSale(sale);
                    setShowSales(false);
                    setSaleSearch("");

                  }}
                >

                <strong>Venta #{sale.id}</strong>
                <p>cc:{sale.client?.document || "CF"} {sale.client?.name || "Consumidor Final"}</p>
                <small>{formatCOP(sale.total)}</small>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

      {/* ================= INFO VENTA ================= */}

     {selectedSale && (

  <div className="returns-card sale-info">

    <h2>Información de la venta</h2>

    <div className="sale-grid">

      <div>
        <span>Venta #</span>
        <p>{selectedSale.id}</p>
      </div>

      <div>
        <span>Cliente</span>
        <p>{selectedSale.client?.name || "Consumidor Final"}</p>
      </div>

      <div>
        <span>Cédula</span>
        <p>{selectedSale.client?.document || "-"}</p>
      </div>

      <div>
        <span>Total</span>
        <p className="sale-total">{formatCOP(selectedSale.total)}</p>
      </div>

    </div>

  </div>

)}
      {/* ================= PRODUCTO DEVOLVER ================= */}

      {selectedSale && (

       <div className="returns-card">

  <h2>Producto a devolver</h2>

  <div className="styled-select">

    <select
      onChange={(e) => {

        const product = selectedSale.details.find(
          d => d.product.id === Number(e.target.value)
        );

        setOldProduct(product.product);

      }}
    >

      <option>Seleccionar producto</option>

      {selectedSale.details?.map(detail => (

        <option
          key={detail.product.id}
          value={detail.product.id}
        >

          {detail.product.name} - {formatCOP(detail.price)}

        </option>

      ))}

    </select>

  </div>

</div>

      )}

      {/* ================= PRODUCTO NUEVO ================= */}

      <div className="returns-card">

        <h2>Producto nuevo</h2>

        <div className="custom-select">

          <div
            className="select-box"
            onClick={() => setShowProducts(!showProducts)}
          >

            {newProduct
              ? `${newProduct.name} - ${formatCOP(newProduct.price)}`
              : "Seleccionar producto"}

          </div>

          {showProducts && (

            <div className="dropdown">

              <input
                type="text"
                placeholder="Buscar producto..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />

              {filteredProducts.map(product => (

                <div
                  key={product.id}
                  className="dropdown-item"
                  onClick={() => {

                    setNewProduct(product);
                    setShowProducts(false);
                    setProductSearch("");

                  }}
                >

                  <strong>{product.name}</strong>
                  <p>{formatCOP(product.price)}</p>
                  <small>Stock: {product.stock}</small>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

      {/* ================= DIFERENCIA ================= */}

      <div className="returns-card difference-card">

        <h2>Diferencia</h2>

        <p>{formatCOP(difference)}</p>

      </div>

    {/* ================= MÉTODO ================= */}

{difference > 0 && (

  <div className="returns-card">

    <h2>Método de pago</h2>

    <div className="styled-select">

      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >

        <option value="EFECTIVO">💵 Efectivo</option>
        <option value="NEQUI">📱 Nequi</option>
        <option value="DAVIPLATA">📲 Daviplata</option>

      </select>

    </div>

  </div>

)}

      <button
        className="return-btn"
        onClick={handleReturn}
      >

        Procesar devolución

      </button>


      <div className="returns-history">

  <h2>Historial de devoluciones</h2>

  <div className="returns-filters">

    <input
      type="text"
      placeholder="Buscar por cliente o cédula..."
      value={returnSearch}
      onChange={(e) => setReturnSearch(e.target.value)}
    />

    <input
      type="date"
      value={dateSearch}
      onChange={(e) => setDateSearch(e.target.value)}
    />

  </div>

  <table className="returns-table">

    <thead>
      <tr>
        <th>ID</th>
        <th>Fecha</th>
        <th>Cliente</th>
        <th>Cédula</th>
        <th>Producto devuelto</th>
        <th>Producto nuevo</th>
        <th>Diferencia</th>
        <th>Método</th>
      </tr>
    </thead>
<tbody>

{filteredReturns.map(r => (

<tr key={r.id}>

<td>{r.id}</td>

<td>{formatDate(r.date)}</td>

<td>{r.clientName || "Consumidor Final"}</td>

<td>{r.clientDocument || "-"}</td>

<td>{r.oldProduct || "-"}</td>

<td>{r.newProduct || "-"}</td>

<td>{formatCOP(r.difference)}</td>

<td>{r.paymentMethod || "-"}</td>

</tr>

))}

</tbody>

  </table>

</div>
    </div>

    
  );
}

export default Returns;
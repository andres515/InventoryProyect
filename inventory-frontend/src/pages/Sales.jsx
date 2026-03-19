import { useEffect, useState, useMemo } from "react";
import { getSales } from "../services/saleService";
import { getLayawayPayments } from "../services/layawayService";
import {
  FaDollarSign,
  FaShoppingCart,
  FaEye
} from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import "./Sales.css";

function Sales() {

  const [sales, setSales] = useState([]);
 const getTodayLocal = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const [selectedDate, setSelectedDate] = useState(getTodayLocal());

  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [payments, setPayments] = useState([]);

  // 🔥 FUNCIÓN SEGURA PARA OBTENER DETALLES
const getSaleDetails = (sale) => {
  return sale.saleDetails || sale.details || sale.items || [];
};

  useEffect(() => {
    loadSales();
    loadPayments();
  }, []);

  const loadSales = async () => {
    try {
      const data = await getSales();
      console.log("VENTAS DEL BACKEND:", data); // 🔥 DEBUG
      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando ventas", error);
      setSales([]);
    }
  };
  const loadPayments = async () => {
  try {
    const data = await getLayawayPayments();
    setPayments(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error cargando abonos", error);
    setPayments([]);
  }
};

  // =============================
  // FILTRAR POR FECHA
  // =============================
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (!sale.saleDate) return false;
      const saleDateObj = new Date(sale.saleDate);

      const year = saleDateObj.getFullYear();
      const month = String(saleDateObj.getMonth() + 1).padStart(2, "0");
      const day = String(saleDateObj.getDate()).padStart(2, "0");

      const saleDate = `${year}-${month}-${day}`;
      return saleDate === selectedDate;
    });
  }, [sales, selectedDate]);


  const filteredPayments = useMemo(() => {
  return payments.filter((payment) => {
    if (!payment.paymentDate) return false;

    const date = new Date(payment.paymentDate);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const paymentDate = `${year}-${month}-${day}`;

    return paymentDate === selectedDate;
  });
}, [payments, selectedDate]);

const totalPayments = filteredPayments.reduce(
  (acc, p) => acc + Number(p.amount || 0),
  0
);

  // =============================
  // TOTAL INGRESOS
  // =============================
const salesTotal = filteredSales.reduce((acc, sale) => {

  // ❌ ignorar ventas que vienen de separados
  if (sale.layaway || sale.saleType === "LAYAWAY_COMPLETED") {
    return acc;
  }

  return acc + Number(sale.total || 0);

}, 0);



const totalRevenue = salesTotal + totalPayments;
  // =============================
// TOTAL GANANCIA DEL DÍA
// =============================
 const totalProfit = useMemo(() => {
  return filteredSales.reduce((totalAcc, sale) => {

    // 🚫 Ignorar abonos de separados
    if (sale.saleType === "LAYAWAY_PAYMENT") {
      return totalAcc;
    }

    const details = getSaleDetails(sale);

    const saleProfit = details.reduce((detailAcc, detail) => {
      const salePrice = Number(detail.price || detail.unitPrice || 0);
      const basePrice = Number(detail.product?.basePrice || 0);
      const quantity = Number(detail.quantity || 0);

      return detailAcc + (salePrice - basePrice) * quantity;
    }, 0);

    return totalAcc + saleProfit;

  }, 0);
}, [filteredSales]);


  // =============================
// RESUMEN POR MÉTODO DE PAGO
// =============================
const paymentSummary = useMemo(() => {
  const summary = {
    EFECTIVO: { count: 0, total: 0 },
    NEQUI: { count: 0, total: 0 },
    DAVIPLATA: { count: 0, total: 0 },
    SEPARADO: { count: 0, total: 0 }
  };

  // 🔵 VENTAS
 filteredSales.forEach((sale) => {

  // ❌ ignorar ventas que vienen de separados
  if (sale.layaway || sale.saleType === "LAYAWAY_COMPLETED") {
    return;
  }

  const method = (sale.paymentMethod || "").toUpperCase();
  const amount = Number(sale.total) || 0;

  if (summary[method]) {
    summary[method].count += 1;
    summary[method].total += amount;
  }

});

  // 🟢 ABONOS DE SEPARADOS
  filteredPayments.forEach((payment) => {

    const method = (payment.paymentMethod || "").toUpperCase();
    const amount = Number(payment.amount) || 0;

    if (summary[method]) {
      summary[method].count += 1;
      summary[method].total += amount;
    }

    // también sumamos al total de separados
    summary.SEPARADO.count += 1;
    summary.SEPARADO.total += amount;

  });

  return summary;

}, [filteredSales, filteredPayments]);
  // =============================
  // DATA GRÁFICO
  // =============================
  const chartData = filteredSales.map((sale) => ({
    name: `#${sale.id}`,
    total: Number(sale.total || 0)
  }));

  const openModal = (sale) => {
    setSelectedSale(sale);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSale(null);
  };

  // 🔥 FUNCIÓN SEGURA PARA OBTENER DETALLES
  // const getSaleDetails = (sale) => {
  //   return sale.saleDetails || sale.details || sale.items || [];
  // };

  return (
    <div className="sales-container">
      <h1 className="sales-title">VENTAS</h1>

      {/* ================= FILTRO FECHA ================= */}
<div className="date-filter-card">
  <div className="date-filter-left">
    <label className="date-label">Filtrar por fecha</label>
    <input
      type="date"
      className="date-input"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
    />
  </div>
</div>
      {/* ================= CARDS ================= */}
      <div className="sales-cards">

        <div className="card">
          <div className="card-icon revenue-icon">
            <FaDollarSign />
          </div>
          <div>
            <h3>Ingresos del Día</h3>
            <p>
              {totalRevenue.toLocaleString("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0
              })}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon sales-icon">
            <FaShoppingCart />
          </div>
          <div>
            <h3>Total Ventas del Día</h3>
            <p>{filteredSales.length}</p>
          </div>
        </div>

        <div className="card profit-card">
  <div className="card-icon profit-icon">
    <FaDollarSign />
  </div>
  <div>
    <h3>Ganancia del Día</h3>
    <p
      style={{
        color: totalProfit >= 0 ? "#16a34a" : "#dc2626",
        fontWeight: "bold"
      }}
    >
      {totalProfit.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
      })}
    </p>
  </div>
</div>

<div className="summary-card separado">
  <h3>Abonado</h3>
  <p>Cantidad: {filteredPayments.length}</p>

<p>
  {totalPayments.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  })}
</p>
</div>

      </div>

      {/* ================= GRÁFICO ================= */}
      <div className="chart-container">
        <h2>Ventas del Día</h2>
        <ResponsiveContainer width="100%" height={300}>
  <BarChart data={chartData}>
    <defs>
      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.9}/>
        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.7}/>
      </linearGradient>
    </defs>

    <XAxis dataKey="name" />
    <YAxis />

    <Tooltip
      contentStyle={{
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 5px 15px rgba(0,0,0,0.08)"
      }}
      formatter={(value) =>
        value.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0
        })
      }
    />

    <Bar
      dataKey="total"
      fill="url(#colorRevenue)"
      radius={[8, 8, 0, 0]}   // 👈 bordes redondeados
    />
  </BarChart>
</ResponsiveContainer>
      </div>

      {/* ================= RESUMEN MÉTODOS DE PAGO ================= */}
<div className="payment-summary-cards">

  <div className="card payment-card efectivo">
    <h3>Efectivo</h3>
    <p>Ventas: {paymentSummary.EFECTIVO.count}</p>
    <p>
      {paymentSummary.EFECTIVO.total.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
      })}
    </p>
  </div>

  <div className="card payment-card nequi">
    <h3>Nequi</h3>
    <p>Ventas: {paymentSummary.NEQUI.count}</p>
    <p>
      {paymentSummary.NEQUI.total.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
      })}
    </p>
  </div>

  <div className="card payment-card daviplata">
    <h3>Daviplata</h3>
    <p>Ventas: {paymentSummary.DAVIPLATA.count}</p>
    <p>
      {paymentSummary.DAVIPLATA.total.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
      })}
    </p>
  </div>

</div>

      {/* ================= TABLA ================= */}
      <div className="sales-table-container">
        <table className="sales-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Fecha</th>
          <th>Cédula</th>
          <th>Cliente</th>
          <th>Tipo</th>
          <th>Total</th>
          <th>Acciones</th>
        </tr>
      </thead>

         <tbody>
      {filteredSales.length > 0 ? (
        filteredSales.map((sale) => {

          const clientName =
            sale.client?.name || "Cliente general";

          const clientDocument =
            sale.client?.document || "-";

          const saleType =
            sale.layaway || sale.saleType === "LAYAWAY_PAYMENT"
              ? "Abono"
              : "Venta";

          return (
            <tr key={sale.id}>

              <td>{sale.id}</td>

              <td>
                {new Date(sale.saleDate).toLocaleString()}
              </td>

              <td>{clientDocument}</td>

              <td>{clientName}</td>

              <td>
                <span
                  className={
                    saleType === "Abono"
                      ? "sale-type layaway"
                      : "sale-type normal"
                  }
                >
                  {saleType}
                </span>
              </td>

              <td>
                {Number(sale.total || 0).toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0
                })}
              </td>

              <td>
                <button
                  className="detail-btn"
                  onClick={() => openModal(sale)}
                >
                  <FaEye /> Ver detalle
                </button>
              </td>

            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="7">
            No hay ventas en esta fecha
          </td>
        </tr>
      )}
      </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && selectedSale && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Detalle de Venta #{selectedSale.id}</h2>

            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(selectedSale.saleDate).toLocaleString()}
            </p>
            <p>
              <strong>Método de Pago:</strong>{" "}
              {selectedSale.paymentMethod === "EFECTIVO"
                ? "Efectivo"
                : selectedSale.paymentMethod === "TRANSFERENCIA"
                ? "Transferencia"
                : selectedSale.paymentMethod === "TARJETA"
                ? "Tarjeta"
                : selectedSale.paymentMethod || "No especificado"}
            </p>

            {/* ================= PRODUCTOS ================= */}
            <div className="modal-products">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {getSaleDetails(selectedSale).length > 0 ? (
                    getSaleDetails(selectedSale).map((detail, index) => (
                      <tr key={index}>
                        <td>
                          {detail.productName ||
                           detail.product?.name ||
                           "Producto"}
                        </td>
                        <td>{detail.quantity || 0}</td>
                        <td>
                          {Number(detail.price || detail.unitPrice || 0)
                            .toLocaleString("es-CO", {
                              style: "currency",
                              currency: "COP",
                              minimumFractionDigits: 0
                            })}
                        </td>
                        <td>
                          {Number(
                            (detail.price || detail.unitPrice || 0) *
                            (detail.quantity || 0)
                          ).toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">
                        Esta venta no tiene productos cargados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ================= TOTAL ================= */}
            <div className="modal-total">
              <h3>
                Total:{" "}
                {Number(selectedSale.total || 0).toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0
                })}
              </h3>
            </div>

            <button className="close-btn" onClick={closeModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales;

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getSales } from "../services/saleService";
import { getLayawayPayments } from "../services/layawayService";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import "./Dashboard.css";

function Dashboard() {

  const { user } = useAuth();

  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FECHA LOCAL COLOMBIA
  // =========================
  const getTodayLocal = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getTodayLocal();

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // =========================
  // CARGAR DATOS
  // =========================
  useEffect(() => {
    loadSales();
    loadPayments();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getSales();
      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando ventas:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const data = await getLayawayPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando abonos:", error);
      setPayments([]);
    }
  };

  // =========================
  // FUNCIÓN FECHA LOCAL
  // =========================
  const getLocalDateString = (dateValue) => {
    const date = new Date(dateValue);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // =========================
  // DETALLES DE VENTA
  // =========================
  const getSaleDetails = (sale) => {
    return sale.saleDetails || sale.details || sale.items || [];
  };

  // =========================
  // FILTRAR VENTAS
  // =========================
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {

      if (!sale.saleDate) return false;

      const saleDate = getLocalDateString(sale.saleDate);

      return saleDate >= startDate && saleDate <= endDate;

    });
  }, [sales, startDate, endDate]);

  // =========================
  // FILTRAR ABONOS
  // =========================
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {

      if (!payment.paymentDate) return false;

      const paymentDate = getLocalDateString(payment.paymentDate);

      return paymentDate >= startDate && paymentDate <= endDate;

    });
  }, [payments, startDate, endDate]);

  // =========================
  // TOTAL ABONOS
  // =========================
  const totalPayments = filteredPayments.reduce(
    (acc, p) => acc + Number(p.amount || 0),
    0
  );

  // =========================
  // TOTAL VENTAS REALES
  // =========================
  const salesTotal = filteredSales.reduce((acc, sale) => {

    if (sale.layaway || sale.saleType === "LAYAWAY_COMPLETED") {
      return acc;
    }

    return acc + Number(sale.total || 0);

  }, 0);

  // =========================
  // INGRESOS REALES
  // =========================
  const totalRevenue = salesTotal + totalPayments;

  const totalSales = filteredSales.length;

  const averageTicket =
    totalSales > 0 ? totalRevenue / totalSales : 0;

  // =========================
  // GANANCIA
  // =========================
  const totalProfit = useMemo(() => {

    return filteredSales.reduce((totalAcc, sale) => {

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

  // =========================
  // MÉTODOS DE PAGO
  // =========================
  const paymentSummary = useMemo(() => {

    const summary = {
      EFECTIVO: { count: 0, total: 0 },
      NEQUI: { count: 0, total: 0 },
      DAVIPLATA: { count: 0, total: 0 }
    };

    // ventas normales
    filteredSales.forEach((sale) => {

      if (sale.layaway || sale.saleType === "LAYAWAY_COMPLETED") {
        return;
      }

      const method = (sale.paymentMethod || "").toUpperCase();
      const amount = Number(sale.total || 0);

      if (summary[method]) {
        summary[method].count += 1;
        summary[method].total += amount;
      }

    });

    // abonos
    filteredPayments.forEach((payment) => {

      const method = (payment.paymentMethod || "").toUpperCase();
      const amount = Number(payment.amount || 0);

      if (summary[method]) {
        summary[method].count += 1;
        summary[method].total += amount;
      }

    });

    return summary;

  }, [filteredSales, filteredPayments]);

  // =========================
  // DATA GRÁFICA
  // =========================
  const chartData = useMemo(() => {

    const grouped = {};

    filteredSales.forEach((sale) => {

      const date = getLocalDateString(sale.saleDate);

      if (!grouped[date]) {
        grouped[date] = 0;
      }

      grouped[date] += Number(sale.total || 0);

    });

    return Object.keys(grouped).map((date) => ({
      date,
      total: grouped[date]
    }));

  }, [filteredSales]);

  return (
    <div className="dashboard-container">

      <h1>DASHBOARD DE VENTAS</h1>

      {/* FILTRO */}
      <div className="filter-card">
        <h3>Filtrar por Fecha</h3>

        <div className="date-range">

          <div>
            <label>Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label>Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="metrics">

        <div className="metric-card">
          <h3>Ingresos</h3>
          <p>
            {totalRevenue.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0
            })}
          </p>
        </div>

        <div className="metric-card">
          <h3>Total Ventas</h3>
          <p>{totalSales}</p>
        </div>

        <div className="metric-card">
          <h3>Venta Promedio</h3>
          <p>
            {averageTicket.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0
            })}
          </p>
        </div>

        <div className="metric-card">
          <h3>Ganancia</h3>
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

      {/* MÉTODOS DE PAGO */}
      <div className="payment-summary-cards">

        <div className="payment-card efectivo">
          <h3>Efectivo</h3>
          <p>Movimientos: {paymentSummary.EFECTIVO.count}</p>
          <p>
            {paymentSummary.EFECTIVO.total.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0
            })}
          </p>
        </div>

        <div className="payment-card nequi">
          <h3>Nequi</h3>
          <p>Movimientos: {paymentSummary.NEQUI.count}</p>
          <p>
            {paymentSummary.NEQUI.total.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0
            })}
          </p>
        </div>

        <div className="payment-card daviplata">
          <h3>Daviplata</h3>
          <p>Movimientos: {paymentSummary.DAVIPLATA.count}</p>
          <p>
            {paymentSummary.DAVIPLATA.total.toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
              minimumFractionDigits: 0
            })}
          </p>
        </div>

      </div>

      {/* GRÁFICA */}
      <div className="chart-container">

        <h2>Ventas por Día</h2>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>

            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

            <XAxis dataKey="date" />

            <YAxis
              tickFormatter={(value) =>
                value.toLocaleString("es-CO")
              }
            />

            <Tooltip
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
              radius={[10, 10, 0, 0]}
              fill="#4a90e2"
            />

          </BarChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default Dashboard;


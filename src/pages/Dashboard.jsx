import { useEffect, useState } from "react";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import StatCard from "../components/StatCard";
import QuickAction from "../components/QuickAction";

export default function Dashboard() {
  const navigate = useNavigate();

  const [salesToday, setSalesToday] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [salesChart, setSalesChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        api.get("/sales"),
        api.get("/products"),
      ]);

      // 🔹 Ventas de hoy
      const todayStr = new Date().toDateString();

      const todaySales = salesRes.data.filter(
        (s) =>
          new Date(s.created_at).toDateString() === todayStr
      );

      const totalToday = todaySales.reduce(
        (sum, s) => sum + Number(s.total || 0),
        0
      );

      setSalesToday(totalToday);

      // 🔹 Total productos
      setProductsCount(productsRes.data.length);

      // 🔹 Stock bajo
      const low = productsRes.data.filter(
        (p) => Number(p.stock) <= 5
      );
      setLowStock(low.length);

      // 🔹 Gráfica últimos 7 días
      const grouped = {};

      salesRes.data.forEach((s) => {
        const day = new Date(s.created_at).toLocaleDateString();
        grouped[day] = (grouped[day] || 0) + Number(s.total || 0);
      });

      const chartData = Object.entries(grouped)
        .map(([day, total]) => ({ day, total }))
        .slice(-7);

      setSalesChart(chartData);

      // 🔹 Top productos (simulado)
      const top = productsRes.data
        .map((p) => ({
          name: p.name,
          qty: Math.max(0, 100 - Number(p.stock)),
        }))
        .slice(0, 5);

      setTopProducts(top);
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  };

  return (
    <div className="pb-16 bg-gray-50 min-h-screen">
      <Header />

      <main className="p-4 space-y-6">
        {/* STATS */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Ventas hoy"
            value={`$${salesToday.toFixed(2)}`}
            icon={<DollarSign />}
          />

          <StatCard
            title="Productos"
            value={productsCount}
            icon={<Package />}
          />
        </div>

        {/* ALERTA */}
        {lowStock > 0 && (
          <StatCard
            title="Stock bajo"
            value={lowStock}
            icon={<AlertTriangle className="text-red-500" />}
          />
        )}

        {/* ACCIONES */}
        <div className="grid grid-cols-2 gap-4">
          <QuickAction
            icon={<ShoppingCart />}
            label="Nueva venta"
            onClick={() => navigate("/sales")}
          />

          <QuickAction
            icon={<Plus />}
            label="Nuevo producto"
            onClick={() => navigate("/products/new")}
          />
        </div>

        {/* GRÁFICA VENTAS */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="font-semibold mb-2">
            Ventas últimos días
          </h3>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesChart}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="total"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TOP PRODUCTOS */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="font-semibold mb-2">
            Productos más vendidos
          </h3>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="qty" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

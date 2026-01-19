import { useEffect, useState } from "react";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Plus,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Wallet,
  CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from "recharts";

import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import StatCard from "../components/StatCard";
import QuickAction from "../components/QuickAction";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    salesToday: 0,
    productsCount: 0,
    lowStock: 0,
    avgTicket: 0,
    inventoryValue: 0
  });
  const [salesChart, setSalesChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        api.get("/sales"),
        api.get("/products"),
      ]);

      const salesData = salesRes?.data || [];
      const productsData = productsRes?.data || [];

      // Cálculos avanzados
      const todayStr = new Date().toDateString();
      const todaySales = salesData.filter(s => new Date(s.created_at).toDateString() === todayStr);
      const totalToday = todaySales.reduce((sum, s) => sum + Number(s.total || 0), 0);
      
      // Ticket promedio
      const avg = salesData.length > 0 
        ? salesData.reduce((sum, s) => sum + Number(s.total), 0) / salesData.length 
        : 0;

      // Valor de inventario (Stock * Precio)
      const invValue = productsData.reduce((sum, p) => sum + (Number(p.stock) * Number(p.price)), 0);

      setStats({
        salesToday: totalToday,
        productsCount: productsData.length,
        lowStock: productsData.filter(p => Number(p.stock || 0) <= 5).length,
        avgTicket: avg,
        inventoryValue: invValue
      });

      // Procesar gráfica de ventas
      const grouped = {};
      salesData.forEach((s) => {
        const day = new Date(s.created_at).toLocaleDateString(undefined, { weekday: 'short' });
        grouped[day] = (grouped[day] || 0) + Number(s.total || 0);
      });
      setSalesChart(Object.entries(grouped).map(([name, total]) => ({ name, total })).slice(-7));

      // Top Productos (Simulando ranking)
      setTopProducts(productsData.slice(0, 5).map(p => ({
        name: p.name.substring(0, 10),
        qty: Math.floor(Math.random() * 80) + 20
      })));

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">...</div>;

  return (
    <div className="pb-24 bg-[#F8FAFC] min-h-screen">
      <Header />

      <main className="max-w-[1400px] mx-auto p-4 md:p-10 space-y-10">
        
        {/* FILA 1: MÉTRICAS CLAVE (Grid 4 columnas en desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Ingresos Hoy"
            value={`$${stats.salesToday.toLocaleString()}`}
            icon={<DollarSign className="text-blue-600" />}
            trend="+12%" // Opcional: podrías calcular esto
          />
          <StatCard
            title="Ticket Promedio"
            value={`$${stats.avgTicket.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
            icon={<Wallet className="text-emerald-600" />}
          />
          <StatCard
            title="Valor Inventario"
            value={`$${stats.inventoryValue.toLocaleString()}`}
            icon={<Package className="text-amber-600" />}
          />
          <StatCard
            title="Alertas Stock"
            value={stats.lowStock}
            icon={<AlertTriangle className={stats.lowStock > 0 ? "text-red-500" : "text-slate-400"} />}
          />
        </div>

        {/* FILA 2: ACCIONES Y GRÁFICA PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Gráfica de Tendencia (Ocupa 2/3 en desktop) */}
          <div className="xl:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Flujo de Caja</h3>
                <p className="text-sm text-slate-400">Rendimiento de los últimos 7 días</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChart}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={4} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Acciones Rápidas con un look más "Apple" */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-medium opacity-80">Acciones rápidas</h3>
                <p className="text-2xl font-bold mb-6">Gestión de Tienda</p>
                <div className="grid grid-cols-1 gap-3">
                  <button onClick={() => navigate("/sales")} className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all">
                    <span className="font-semibold">Nueva Venta</span>
                    <ArrowUpRight size={20} />
                  </button>
                  <button onClick={() => navigate("/products/new")} className="flex items-center justify-between bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all">
                    <span className="font-semibold">Añadir Producto</span>
                    <Plus size={20} />
                  </button>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>
            
            {/* Pequeña métrica extra: Cantidad de Productos */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Estado del Catálogo</p>
                    <p className="text-2xl font-black text-slate-800">{stats.productsCount} SKUs</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* FILA 3: RANKING DE PRODUCTOS */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2">
            <BarChart3 className="text-indigo-500" />
            Productos con mayor rotación
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fill: '#64748b', fontSize: 13, fontWeight: 600}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '15px', border: 'none'}} />
                <Bar dataKey="qty" radius={[0, 10, 10, 0]} barSize={25}>
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </main>
        <BottomNav />
    </div>
  );
}
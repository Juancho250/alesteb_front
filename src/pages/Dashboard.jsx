import { useEffect, useState } from "react";
import {
  DollarSign, Package, ShoppingCart, Plus, AlertTriangle,
  TrendingUp, BarChart3, ArrowUpRight, Wallet, CalendarDays,
  ChevronRight, AlertCircle, ShoppingBag, Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart,
  Bar, CartesianGrid, Area, AreaChart, Cell, PieChart, Pie
} from "recharts";

import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("top"); // 'top' | 'stock' | 'revenue'
  const [stats, setStats] = useState({
    salesToday: 0, productsCount: 0, lowStock: 0, avgTicket: 0, inventoryValue: 0
  });
  const [salesChart, setSalesChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        api.get("/sales"),
        api.get("/products"),
      ]);

      const salesData = salesRes?.data || [];
      const productsData = productsRes?.data || [];

      // Procesamiento de Alertas
      const lowItems = productsData.filter(p => Number(p.stock || 0) <= 5);
      setLowStockProducts(lowItems);

      // Procesamiento de Métricas
      const todaySales = salesData.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString());
      const totalToday = todaySales.reduce((sum, s) => sum + Number(s.total || 0), 0);
      const avg = salesData.length > 0 ? salesData.reduce((sum, s) => sum + Number(s.total), 0) / salesData.length : 0;
      const invValue = productsData.reduce((sum, p) => sum + (Number(p.stock) * Number(p.price)), 0);

      setStats({
        salesToday: totalToday,
        productsCount: productsData.length,
        lowStock: lowItems.length,
        avgTicket: avg,
        inventoryValue: invValue
      });

      // Gráfica de Ventas
      const grouped = {};
      salesData.slice(-15).forEach((s) => {
        const day = new Date(s.created_at).toLocaleDateString(undefined, { weekday: 'short' });
        grouped[day] = (grouped[day] || 0) + Number(s.total || 0);
      });
      setSalesChart(Object.entries(grouped).map(([name, total]) => ({ name, total })));

      // Ranking de Productos
      setTopProducts(productsData.slice(0, 6).map(p => ({
        name: p.name.length > 12 ? p.name.substring(0, 10) + '..' : p.name,
        qty: Math.floor(Math.random() * 50) + 10,
        stock: p.stock
      })));

    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#0ea5e9', '#10b981'];

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400 animate-pulse text-sm uppercase tracking-widest">Sincronizando...</div>;

  return (
    <div className="pb-28 bg-[#F8FAFC] min-h-screen font-sans">
      <Header />

      <main className="max-w-[1400px] mx-auto p-4 lg:p-8 space-y-6">
        
        {/* FILA 1: MINI STATS (Métrica Compacta) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard title="Ventas Hoy" value={`$${stats.salesToday.toLocaleString()}`} icon={<DollarSign size={16} className="text-blue-600" />} />
          <StatCard title="Ticket Prom" value={`$${stats.avgTicket.toLocaleString(undefined, {maximumFractionDigits: 0})}`} icon={<Wallet size={16} className="text-emerald-600" />} />
          <StatCard title="Inventario" value={`$${stats.inventoryValue.toLocaleString()}`} icon={<Package size={16} className="text-amber-600" />} />
          <StatCard title="Bajo Stock" value={stats.lowStock} icon={<AlertTriangle size={16} className={stats.lowStock > 0 ? "text-red-500" : "text-slate-300"} />} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* GRÁFICA PRINCIPAL (8 columnas) */}
          <div className="xl:col-span-8 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desempeño</p>
                <h3 className="text-lg font-black text-slate-800">Tendencia de Ingresos</h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 justify-end"><TrendingUp size={12}/> +4.5%</p>
                <p className="text-[10px] text-slate-400 font-medium italic">Vs semana anterior</p>
              </div>
            </div>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChart}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ACCIONES RÁPIDAS (4 columnas) */}
          <div className="xl:col-span-4 grid grid-cols-1 gap-4">
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-center">
               <h4 className="text-sm font-bold opacity-70 mb-4">Atajos Directos</h4>
               <div className="flex flex-col gap-2">
                  <button onClick={() => navigate("/sales")} className="w-full bg-white/10 hover:bg-white/20 py-3 px-4 rounded-xl flex items-center justify-between text-sm font-bold transition-all">
                    Nueva Venta <Plus size={16}/>
                  </button>
                  <button onClick={() => navigate("/products/new")} className="w-full bg-white/10 hover:bg-white/20 py-3 px-4 rounded-xl flex items-center justify-between text-sm font-bold transition-all">
                    Nuevo Producto <ShoppingBag size={16}/>
                  </button>
               </div>
               <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl"></div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total SKUs</p>
                  <p className="text-2xl font-black text-slate-800">{stats.productsCount}</p>
               </div>
               <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Layers size={20} />
               </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE TABS (TIPO AMAZON) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-50 overflow-x-auto bg-slate-50/50">
            {[
              { id: 'top', label: 'Más Vendidos', icon: <TrendingUp size={14}/> },
              { id: 'stock', label: 'Bajo Stock', icon: <AlertCircle size={14}/> },
              { id: 'revenue', label: 'Distribución', icon: <PieChartIcon size={14}/> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-tighter transition-all border-b-2 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'top' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl font-black text-indigo-600 shadow-sm border border-slate-100 italic">#{i+1}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-tight">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{p.qty} ventas este mes</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'stock' && (
              <div className="space-y-2">
                {lowStockProducts.length > 0 ? lowStockProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-red-50/50 border border-red-100/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={14}/></div>
                      <p className="text-sm font-bold text-slate-700">{p.name}</p>
                    </div>
                    <span className="text-xs font-black text-red-600 bg-white px-3 py-1 rounded-full shadow-sm">{p.stock} unidades</span>
                  </div>
                )) : (
                  <p className="text-center py-10 text-slate-300 font-bold italic text-sm">Inventario saludable ✨</p>
                )}
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                    <Bar dataKey="qty" radius={[8, 8, 8, 8]} barSize={40}>
                      {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

      </main>
      <BottomNav />
    </div>
  );
}

// Icono auxiliar para el tab
function PieChartIcon({size}) {
  return <BarChart3 size={size} />;
}
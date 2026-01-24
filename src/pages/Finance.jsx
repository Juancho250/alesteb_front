import { useEffect, useState } from "react";
import {
  PlusCircle, TrendingDown, TrendingUp, Wallet, X,
  PieChart as PieChartIcon, Activity, Package, ChevronRight
} from "lucide-react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart,
  Bar, CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";

import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../context/AuthContext"; 

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'];

export default function Finance() {
  const { user } = useAuth(); 
  const permissions = user?.permissions || []; // Obtener permisos del usuario

  const [products, setProducts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({
    totalVentas: 0, totalGastos: 0, totalCompras: 0, rentabilidad: 0
  });

  const initialForm = {
    type: "gasto", category: "", description: "", amount: "",
    product_id: "", quantity: 1
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadFinance();
    api.get("/products").then(res => setProducts(res.data)).catch(err => console.error(err));
  }, []);

  const loadFinance = async () => {
    try {
      const [expRes, sumRes, salesRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/expenses/summary"),
        api.get("/sales")
      ]);
      
      const salesArr = salesRes.data || [];
      const expensesArr = expRes.data || [];
      const ventas = salesArr.reduce((sum, s) => sum + Number(s.total || 0), 0);
      const totalGastos = Number(sumRes.data?.totalGastos || 0);
      const totalCompras = Number(sumRes.data?.totalCompras || 0);

      setExpenses(expensesArr);
      setSummary({ totalVentas: ventas, totalGastos, totalCompras, rentabilidad: ventas - totalGastos });

      const catMap = {};
      expensesArr.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
      });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));


      setComparisonData([
        { name: 'Ingresos', monto: ventas, fill: '#10b981' },
        { name: 'Egresos', monto: totalGastos + totalCompras, fill: '#ef4444' }
      ]);
    } catch (error) {
      console.error("Error cargando finanzas:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const expenseData = {
        type: form.type,
        category: form.type === 'compra' ? `Reposición de Inventario` : (form.category || "Gasto"),
        description: form.description,
        amount: Number(form.amount),
        product_id: form.product_id || null,
        quantity: Number(form.quantity) || 1
      };

      await api.post("/expenses", expenseData);
      setOpen(false);
      loadFinance();
      setForm(initialForm);
    } catch (error) {
      alert("Error al registrar movimiento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <Header />

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Ventas" value={summary.totalVentas} color="emerald" icon={<TrendingUp />} />
          <StatCard title="Gastos" value={summary.totalGastos} color="red" icon={<TrendingDown />} />
          <StatCard title="Compras" value={summary.totalCompras} color="amber" icon={<Wallet />} />
          <StatCard title="Neto" value={summary.rentabilidad} color="blue" icon={<Activity />} />
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Balance de Flujo" icon={<Activity className="text-emerald-500" />}>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                  <Bar dataKey="monto" radius={[12, 12, 12, 12]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          <ChartContainer title="Distribución de Gastos" icon={<PieChartIcon className="text-indigo-500" />}>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                  <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            {/* Verificar permisos para crear movimientos */}
            {permissions.includes('finance.create') && (
              <button
                onClick={() => setOpen(true)}
                className="w-full h-full min-h-[120px] bg-slate-900 text-white rounded-[2.5rem] font-black text-lg flex flex-col items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
              >
                <PlusCircle size={32} />
                Registrar Movimiento
              </button>
            )}
          </div>

          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 text-xl mb-6">Movimientos Recientes</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {expenses.map((e) => (
                <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100/50 rounded-2xl transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${e.type === 'gasto' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                      {e.type === 'gasto' ? <TrendingDown size={20}/> : <Package size={20}/>}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{e.category}</p>
                      <p className="text-xs font-medium text-slate-400">{e.description || 'Sin descripción'}</p>
                    </div>
                  </div>
                  <span className={`font-black text-lg ${e.type === "gasto" ? "text-red-500" : "text-amber-600"}`}>
                    -${Number(e.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE REGISTRO ANCHO (DOS COLUMNAS) */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] p-8 lg:p-12 relative shadow-2xl overflow-hidden">
            
            {/* Botón Cerrar */}
            <button 
              onClick={() => setOpen(false)} 
              className="absolute top-8 right-8 p-2 bg-slate-100 rounded-full text-slate-500 hover:rotate-90 hover:bg-red-50 hover:text-red-500 transition-all z-10"
            >
              <X size={24} />
            </button>
            
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-800">Nuevo Registro</h2>
              <p className="text-slate-400 font-medium">Gestiona tus salidas de dinero y reabastecimiento</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Formulario con detalles... */}
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// COMPONENTES AUXILIARES
function StatCard({ title, value, color, icon }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
      <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-slate-800">${Number(value).toLocaleString()}</p>
      </div>
    </div>
  );
}

function ChartContainer({ title, icon, children }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col min-w-0">
      <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 text-lg">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

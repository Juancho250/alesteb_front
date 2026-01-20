import { useEffect, useState } from "react";
import {
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import api from "../services/api";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";

export default function Finance() {
  const [products, setProducts] = useState([]); // Nuevo estado para productos
  const [form, setForm] = useState({
    type: "gasto",
    category: "",
    description: "",
    amount: "",
    product_id: "", // Nuevo campo
    quantity: 1      // Nuevo campo
  });

  // Cargar productos al iniciar para el selector
  useEffect(() => {
    loadFinance();
    api.get("/products").then(res => setProducts(res.data));
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
      setSummary({
        totalVentas: ventas,
        totalGastos,
        totalCompras,
        rentabilidad: ventas - totalGastos
      });

      // 1. Procesar datos para Gráfica de Pastel (Gastos por Categoría)
      const catMap = {};
      expensesArr.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
      });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      // 2. Procesar datos para Gráfica de Barras (Ingresos vs Egresos)
      setComparisonData([
        { name: 'Ingresos', monto: ventas, fill: '#10b981' },
        { name: 'Egresos', monto: totalGastos + totalCompras, fill: '#ef4444' }
      ]);

    } catch (error) {
      console.error("Error cargando finanzas:", error);
    }
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/expenses", {
      ...form,
      amount: Number(form.amount)
    });
    setForm({ type: "gasto", category: "", description: "", amount: "" });
    setOpen(false);
    loadFinance();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      <Header />

      <main className="max-w-5xl mx-auto p-6 space-y-8">
        
        {/* RESUMEN DE TARJETAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            title="Ventas"
            value={`$${summary.totalVentas.toLocaleString()}`}
            icon={<TrendingUp className="text-emerald-600" />}
          />
          <Card
            title="Gastos"
            value={`$${summary.totalGastos.toLocaleString()}`}
            icon={<TrendingDown className="text-red-500" />}
          />
          <Card
            title="Compras"
            value={`$${summary.totalCompras.toLocaleString()}`}
            icon={<Wallet className="text-amber-500" />}
          />
          <Card
            title="Rentabilidad"
            value={`$${summary.rentabilidad.toLocaleString()}`}
            icon={summary.rentabilidad >= 0 ? <Activity className="text-blue-600" /> : <TrendingDown className="text-red-600" />}
          />
        </div>

        {/* SECCIÓN DE GRÁFICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Gráfica 1: Comparativa Barras */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" /> Balance General
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="monto" radius={[10, 10, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfica 2: Distribución Pastel */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PieChartIcon size={20} className="text-indigo-500" /> Distribución de Gastos
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '15px', border: 'none'}} />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTÓN REGISTRAR Y LISTADO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <button
              onClick={() => setOpen(true)}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95"
            >
              <PlusCircle /> Registrar Movimiento
            </button>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Últimos Movimientos</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {expenses.length > 0 ? expenses.map((e) => (
                <div key={e.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${e.type === 'gasto' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{e.category}</p>
                      <p className="text-xs text-slate-400">{e.description}</p>
                    </div>
                  </div>
                  <span className={`font-black ${e.type === "gasto" ? "text-red-500" : "text-amber-600"}`}>
                    -${Number(e.amount).toLocaleString()}
                  </span>
                </div>
              )) : (
                <p className="text-center text-slate-400 py-10">No hay movimientos registrados</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL (Se mantiene igual pero con estilo Apple) */}
      {open && (
        <div className="fixed inset-0 z-[9999] ...">
            <div className="bg-white ... p-8 ...">
            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <select 
                value={form.type} 
                onChange={(e) => setForm({ ...form, type: e.target.value, product_id: "" })} 
                className="..."
                >
                <option value="gasto">Gasto Administrativo</option>
                <option value="compra">Compra de Inventario (Suma Stock)</option>
                </select>

                {/* SI ES COMPRA, MOSTRAR SELECTOR DE PRODUCTOS */}
                {form.type === "compra" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <select
                    value={form.product_id}
                    onChange={(e) => {
                        const prod = products.find(p => p.id === e.target.value);
                        setForm({ ...form, product_id: e.target.value, category: `Compra: ${prod?.name}` });
                    }}
                    className="w-full bg-blue-50 border-2 border-blue-200 rounded-2xl p-4"
                    required
                    >
                    <option value="">Seleccionar Producto...</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock actual: {p.stock})</option>
                    ))}
                    </select>

                    <input 
                    type="number" 
                    placeholder="Cantidad a sumar" 
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4"
                    min="1"
                    />
                </div>
                )}

                {/* CATEGORÍA Y MONTO (Igual que antes) */}
                <input 
                placeholder="Categoría" 
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })} 
                className="..." 
                disabled={form.type === 'compra'} // Se auto-llena con el nombre del producto
                />
                
                <input 
                type="number" 
                placeholder="Monto Pagado" 
                value={form.amount} 
                onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                className="..." 
                />

                <button className="...">Guardar y Actualizar Stock</button>
            </form>
            </div>
        </div>
        )}
      <BottomNav />
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm flex flex-col gap-3">
      <div className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl">{icon}</div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}
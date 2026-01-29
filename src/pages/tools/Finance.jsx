import { useEffect, useState, useMemo } from "react";
import {
  PlusCircle, TrendingDown, TrendingUp, Wallet, X, Search,
  PieChart as PieChartIcon, Activity, Package, CheckCircle2, Loader2
} from "lucide-react";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart,
  Bar, CartesianGrid, PieChart, Pie, Cell
} from "recharts";

import api from "../../services/api";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { useLoading } from "../../context/LoadingContext"; 
import { useNotice } from "../../context/NoticeContext";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6'];

export default function Finance() {
  const { startLoading, stopLoading } = useLoading();
  const { showNotice } = useNotice();
  
  // ESTADOS
  const [products, setProducts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [comparisonProvidersData, setComparisonProvidersData] = useState([]);
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [summary, setSummary] = useState({
    totalVentas: 0, totalGastos: 0, totalCompras: 0, rentabilidad: 0, deudaTotal: 0
  });

  const initialForm = {
    type: "gasto", 
    category: "", 
    description: "", 
    amount: "",
    product_id: "", 
    provider_id: "", 
    quantity: 1, 
    utility_type: "percentage",
    utility_value: 30
  };
  const [form, setForm] = useState(initialForm);

  // 1. CARGA DE DATOS
  const loadFinance = async () => {
    startLoading();
    try {
      const [expRes, sumRes, salesRes, prodRes, provRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/expenses/summary"),
        api.get("/sales"),
        api.get("/products"),
        api.get("/providers")
      ]);
      
      const salesArr = salesRes.data || [];
      const expensesArr = expRes.data || [];
      
      // ✅ CORRECCIÓN: Maneja tanto array directo como objeto con products
      const productsData = prodRes.data.products || prodRes.data;
      const productsArr = Array.isArray(productsData) ? productsData : [];
      
      setProducts(productsArr);
      setProviders(provRes.data || []);
      setExpenses(expensesArr);

      // Lógica de Resumen (KPIs)
      const ventas = salesArr.reduce((sum, s) => sum + Number(s.total || 0), 0);
      const totalGastos = Number(sumRes.data?.totalGastos || 0);
      const totalCompras = Number(sumRes.data?.totalCompras || 0);
      const deudaTotal = Number(sumRes.data?.deudaTotal || 0);

      setSummary({ 
        totalVentas: ventas, 
        totalGastos, 
        totalCompras, 
        deudaTotal,
        rentabilidad: ventas - (totalGastos + totalCompras) 
      });

      // Procesar Gráfica de Categorías
      const catMap = {};
      expensesArr.forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
      });
      setCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })));

      // Procesar Gráfica Flujo de Caja
      setComparisonData([
        { name: 'Ingresos', monto: ventas, fill: '#10b981' },
        { name: 'Egresos', monto: totalGastos + totalCompras, fill: '#ef4444' }
      ]);

      // Procesar Comparativa de Proveedores (últimas compras)
      const lastPurchases = productsArr
        .filter(p => p.purchase_price > 0)
        .slice(0, 5)
        .map(p => ({
            provider_name: p.provider_name || 'N/A',
            purchase_price: Number(p.purchase_price)
        }));

      setComparisonProvidersData(lastPurchases);

    } catch (error) {
      console.error("Error cargando finanzas:", error);
      showNotice("Error cargando finanzas", "error");
    } finally {
      setTimeout(stopLoading, 600);
    }
  };

  useEffect(() => { loadFinance(); }, []);

  // FILTRADO DE REGISTROS
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.provider_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) return showNotice("Monto inválido", "warning");
    
    setIsSaving(true);
    try {
      const expenseData = {
        ...form,
        amount: Number(form.amount),
        quantity: Number(form.quantity),
        utility_type: form.type === 'compra' ? form.utility_type : null,
        utility_value: form.type === 'compra' ? Number(form.utility_value) : null,
        category: form.type === 'compra' 
          ? `Compra: ${products.find(p => p.id == form.product_id)?.name || 'Producto'}` 
          : form.category
      };

      await api.post("/expenses", expenseData);
      showNotice("Registro exitoso", "success");
      setOpen(false);
      setForm(initialForm);
      loadFinance();
    } catch (error) {
      console.error("Error al registrar:", error);
      showNotice(error.response?.data?.error || "Error al registrar", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 lg:pb-8 font-sans">
      <Header />
      
      <main className="max-w-7xl mx-auto p-4 lg:p-10 space-y-12">
        
        {/* --- 1. SECCIÓN: RESÚMENES (KPIs) --- */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-2 bg-blue-600 rounded-full"></div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.3em]">Panel de Control Financiero</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            <StatCard title="Ingresos" value={summary.totalVentas} color="emerald" icon={<TrendingUp size={20}/>} />
            <StatCard title="Gastos Op." value={summary.totalGastos} color="red" icon={<TrendingDown size={20}/>} />
            <StatCard title="Inversión Stock" value={summary.totalCompras} color="amber" icon={<Package size={20}/>} />
            <StatCard title="Deudas" value={summary.deudaTotal} color="red" icon={<Wallet size={20}/>} />
            <StatCard title="Balance Neto" value={summary.rentabilidad} color="blue" icon={<Activity size={20}/>} isMain />
          </div>
        </section>

        {/* --- 2. SECCIÓN: REGISTROS (MOVIMIENTOS) --- */}
        <section className="bg-white rounded-[3rem] p-6 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
            <div>
              <h3 className="font-black text-3xl text-slate-900 tracking-tight italic">Registros de Caja<span className="text-blue-600">.</span></h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Historial detallado de egresos</p>
            </div>

            <div className="flex flex-col md:flex-row w-full xl:w-auto gap-4">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar movimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all text-sm font-bold"
                />
              </div>

              <button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 group"
              >
                <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-black text-xs uppercase tracking-widest">Añadir Registro</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredExpenses.length > 0 ? filteredExpenses.map((e) => (
              <div key={e.id} className="flex justify-between items-center p-5 bg-slate-50/50 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all border border-transparent hover:border-slate-100 cursor-pointer group">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl shadow-sm bg-white ${e.type === 'gasto' ? 'text-red-500' : 'text-amber-500'}`}>
                    {e.type === 'gasto' ? <TrendingDown size={22} /> : <Package size={22} />}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-base">{e.category}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                      {new Date(e.created_at).toLocaleDateString()} • {e.provider_name || 'Operación Interna'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg italic tracking-tighter ${e.type === 'gasto' ? 'text-red-500' : 'text-slate-900'}`}>
                    -${Number(e.amount).toLocaleString()}
                  </p>
                  <span className="text-[8px] px-2 py-0.5 bg-slate-100 rounded text-slate-500 font-black uppercase">{e.type}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-400">
                <p className="font-bold">No hay registros</p>
              </div>
            )}
          </div>
        </section>

        {/* --- 3. SECCIÓN: GRÁFICAS --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartContainer title="Flujo de Efectivo" icon={<Activity className="text-emerald-500" />}>
            <div className="h-[300px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="monto" radius={[10, 10, 10, 10]} barSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          <ChartContainer title="Gastos por Categoría" icon={<PieChartIcon className="text-indigo-500" />}>
            <div className="h-[300px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} innerRadius={80} outerRadius={100} dataKey="value" paddingAngle={5}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '20px', border: 'none'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          <ChartContainer title="Costos de Compra Recientes" icon={<TrendingUp className="text-blue-500" />}>
            <div className="h-[300px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonProvidersData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="provider_name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800}} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="purchase_price" fill="#6366f1" radius={[8, 8, 8, 8]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[9px] text-center text-slate-300 font-black uppercase mt-4">Analítica de los últimos 5 productos abastecidos</p>
            </div>
          </ChartContainer>
        </section>
      </main>

      {/* MODAL REGISTRO */}
      {open && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] md:rounded-[3rem] p-8 lg:p-12 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter">Nuevo Registro<span className="text-blue-600">.</span></h2>
              <button onClick={() => setOpen(false)} className="p-3 bg-slate-50 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors">
                <X size={20}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[1.8rem]">
                {['gasto', 'compra'].map(t => (
                  <button 
                    key={t} type="button"
                    onClick={() => setForm({...form, type: t})}
                    className={`flex-1 py-4 rounded-[1.4rem] text-xs font-black uppercase tracking-widest transition-all ${form.type === t ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {form.type === 'compra' ? (
                <div className="space-y-4">
                  <select className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-sm appearance-none" value={form.provider_id} onChange={e => setForm({...form, provider_id: e.target.value})} required>
                    <option value="">Seleccionar Proveedor</option>
                    {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-sm appearance-none" value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} required>
                    <option value="">¿Qué producto compraste?</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  
                  {/* Configuración de Utilidad */}
                  <div className="bg-blue-50 p-4 rounded-2xl space-y-3">
                    <p className="text-xs font-black text-blue-600 uppercase">Configurar Precio de Venta</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setForm({...form, utility_type: 'percentage'})} className={`flex-1 py-2 rounded-xl text-xs font-bold ${form.utility_type === 'percentage' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                        % Porcentaje
                      </button>
                      <button type="button" onClick={() => setForm({...form, utility_type: 'fixed'})} className={`flex-1 py-2 rounded-xl text-xs font-bold ${form.utility_type === 'fixed' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                        $ Fijo
                      </button>
                    </div>
                    <input 
                      type="number" 
                      placeholder={form.utility_type === 'percentage' ? "Ej: 30 (%)" : "Ej: 5000 ($)"} 
                      className="w-full p-3 bg-white rounded-xl outline-none font-bold text-sm"
                      value={form.utility_value}
                      onChange={e => setForm({...form, utility_value: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <input type="text" placeholder="Categoría (Ej: Servicios, Arriendo)" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
              )}

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Monto Total" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-black text-lg text-blue-600" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                <input type={form.type === 'compra' ? 'number' : 'text'} placeholder={form.type === 'compra' ? "Cant." : "Nota"} className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-sm" value={form.type === 'compra' ? form.quantity : form.description} onChange={e => setForm({...form, [form.type === 'compra' ? 'quantity' : 'description']: e.target.value})} />
              </div>

              <button type="submit" disabled={isSaving} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin"/> : <CheckCircle2 size={20}/>}
                Confirmar Operación
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// COMPONENTES AUXILIARES
function StatCard({ title, value, color, icon, isMain }) {
  const themes = { 
    emerald: "bg-emerald-50 text-emerald-600", 
    red: "bg-red-50 text-red-600", 
    amber: "bg-amber-50 text-amber-600", 
    blue: "bg-blue-600 text-white" 
  };
  return (
    <div className={`p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[160px] transition-all hover:shadow-lg ${isMain ? themes.blue : 'bg-white'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isMain ? 'bg-white/20' : themes[color]}`}>
        {icon}
      </div>
      <div>
        <p className={`text-[9px] uppercase font-black tracking-widest mb-1 ${isMain ? 'text-white/60' : 'text-slate-400'}`}>{title}</p>
        <p className="text-2xl font-black tracking-tighter italic">${Number(value).toLocaleString()}</p>
      </div>
    </div>
  );
}

function ChartContainer({ title, icon, children }) {
  return (
    <div className="bg-white p-8 lg:p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
      <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-slate-800">
        <span className="p-2.5 bg-slate-50 rounded-2xl text-blue-600">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}